# Sector 6 보스(Continuity Warden) 구현 점검 리포트

작성일: 2026-08-23
대상 코드: `src/game/boss/ContinuityWardenRuntime.js`, `src/game/simulation/GameSimulation.js`,
`src/render/boss/BossPolygonObjectRenderers.js`, `src/game/boss-authoring/generated/Boss06Stage.generated.js`
대상 기획: `docs/boss/06/blockout-draft/*` (현재 유효한 설계. `docs/boss/06/final-content/*`는 폐기된 구설계이므로 참조 금지)

---

## 0. 문서 세대 주의사항

`docs/boss/06/` 아래에 설계가 두 세대 존재한다.

- `final-content/` — "PAD 03 Containment Clamp Security System" 구설계. 문서 상단에 `RUNTIME NOT IMPLEMENTED`라고 명시되어 있고 실제로 구현되지 않았다.
- `blockout-draft/` — "CONTINUITY WARDEN"(인간형 보스) 재설계. `README.md`에 `RUNTIME IMPLEMENTED` 상태로 기록되어 있고, 실제 코드가 구현한 것은 이쪽이다.

앞으로 기획 대비 구현을 비교할 때는 `blockout-draft/` 문서만 기준으로 삼아야 한다. `final-content/`를 참조 중인 팀원이 있다면 혼선이 생길 수 있으니 별도 공지가 필요하다.

---

## 1. 기획 대비 미반영/불일치 항목

### 1-1. 카운터(방패 반격) 시 플레이어 넉백 — 기획에는 있으나 코드에 없음 (가장 중요)

- 기획(`BOSS-06-BRIEF.md` "방패 반격", `BOSS-06-COMPONENTS.md` counter 절): 방패로 막아내면 **플레이어를 밀어내고 거리를 리셋**한다고 명시.
- 코드(`ContinuityWardenRuntime.js` `#beginCounterBash()`, 678~684줄): 상태를 `COUNTER_BASH`로 전환하고 `boss-counter-triggered` 이벤트만 emit한다. 플레이어 위치/속도를 실제로 밀어내는 코드가 없다.
- 게다가 `GameSimulation.js:4003-4017` `#applyVictimImpactTransition()`을 보면, 보스 공격(`sourceKind === BOSS_HAZARD`)으로 인한 피격에는 **넉백 임펄스 자체가 조건문으로 차단**되어 있다.
  ```js
  const bossHazard = claim.sourceKind === PLAYER_IMPACT_SOURCE_KIND.BOSS_HAZARD;
  ...
  if (!bossHazard && speed > 0) {
      player.physics.applyImpulse(...);   // 보스 공격이면 이 블록 자체가 실행되지 않음
  }
  ```
- 즉 현재 상태는 "카운터에 맞아도 데미지만 들어가고 밀려나지 않는다" — 기획 의도와 반대다. 이 공통 함수는 Boss06 전투에도 직접 영향을 준다.

### 1-2. `security-walk` 상태 단순화

- 기획서에는 `security-walk`가 별도 네임드 상태로 있으나, 코드에서는 `SECURITY_COMMAND`/`SECURITY_ACTIVE` 내부 로직으로 흡수되어 있다. 기능적으로는 크게 문제 없어 보이지만, 기획 문서와 상태 이름이 1:1로 매핑되지 않으므로 향후 기획/QA 커뮤니케이션에서 혼선 소지가 있다.

### 1-3. 그 외

- 나머지 패턴(BATON 3연타, BACK_SWING, GROUND/DIAGONAL DASH, CHARGE, GUARD, COUNTER_READY, SECURITY 빔 LOW/HIGH)은 기획과 코드가 거의 1:1로 일치하고, 타이밍/데미지 수치도 `Boss06Stage.generated.js`에 구체적으로 채워져 있다. 이 부분은 추가 조치 불필요.

---

## 2. 문제 1 — 보스에게 밀려났을 때 맵 밖으로 튕겨나감

### 근본 원인 (Root Cause)

두 가지가 겹쳐서 발생하는 구조적 문제다.

1. **플레이어 물리 좌표에 대한 맵 경계(bounds) clamp가 어디에도 없다.**
   - `src/game/physics/` 전체(`PlayerPhysics.js`, `PhysicsMixin.js` 등)를 확인한 결과, 위치를 스테이지 경계 안으로 clamp하는 로직이 존재하지 않는다.
   - 공통 유틸 `compositeInsideBounds()`(`CompositeBossEncounterRuntime.js:34`)가 있지만 이건 "점이 영역 안에 있는지 판정"용일 뿐, 실제로 좌표를 경계 안으로 되돌리는 clamp 함수가 아니고, Boss06 런타임에서 플레이어 좌표에 대해 호출되지도 않는다.
   - `ContinuityWardenRuntime.js`의 `combatMinX`/`combatMaxX`(1048~4072, 427-428·441·457-459줄)는 **보스 자신의** 대시 이동 범위만 clamp한다. 플레이어에는 적용되지 않는다.
2. **넉백이 큰 힘으로 발생할 수 있는 지점(차지/대시 몸통 충돌)에 방어적 clamp가 없는 상태에서, 힘이 큰 물리 임펄스나 몸체 충돌 분리(separation)가 그대로 반영된다.**
   - `COMBAT_CONFIG.playerHitKnockback`(`src/game/config.js:160`, 기본값 260)은 일반 피격 넉백 세기다. 위 1-1에서 확인했듯 보스 공격 자체의 스크립트 넉백은 현재 비활성화돼 있지만, 보스(특히 GROUND_DASH/DIAGONAL_DASH/CHARGE 상태의 고속 이동 몸통)와 플레이어 콜라이더가 겹칠 때 발생하는 **물리 충돌 분리(solid body separation)**는 별도 경로로 여전히 플레이어를 밀어낼 수 있다. 이 분리 힘에도 경계 clamp가 없으므로, 아레나 가장자리 근처에서 고속 돌진에 맞으면 맵 밖으로 튕겨나가는 결과가 나온다.
   - 이탈 이후 처리 방식도 "밀림 → 경계 clamp"가 아니라 `recoverPlayer()`(`ContinuityWardenRuntime.js:909-915`)가 고정 좌표(`{x:770,y:-722}` / `{x:4240,y:-722}`)로 순간이동시키는 방식이라, 실시간으로 화면 밖까지 날아가 버린 뒤에야 복구되는 구조다. 즉 "밖으로 안 나가게" 막는 게 아니라 "나간 뒤에 텔레포트로 되돌리는" 사후 처리만 있다.

### 개선 방향 (권장 우선순위 순)

1. **[필수/근본 수정] 플레이어 물리 스텝에 아레나 경계 clamp 추가.**
   - `GameSimulation.js`의 매 틱 플레이어 물리 업데이트 직후(혹은 `PlayerPhysics`/`PhysicsMixin`의 위치 갱신 직후) `Boss06Stage.generated.js`의 arena bounds(5400×3000)를 이용해 `position.x/y`를 clamp한다.
   - 이건 Boss06뿐 아니라 넉백이 있는 모든 보스전에 공통으로 유효한 방어 로직이므로, `CompositeBossEncounterRuntime` 레벨(또는 `GameSimulation`의 보스 스테이지 공통 처리부)에 한 번만 넣는 게 맞다. 개별 보스 런타임마다 중복 구현하지 않는다.
   - 이렇게 하면 원인이 스크립트 넉백이든 물리 충돌 분리든 상관없이 "맵 밖으로 나가는" 증상 자체가 봉쇄된다.
2. **[선택/기획 정합화] 카운터 반격 넉백을 기획대로 되살릴지 결정.**
   - 1-1에서 확인한 `!bossHazard` 분기 때문에 보스 공격에는 넉백이 전혀 없다. 기획대로 "카운터에 맞으면 거리 리셋"을 원한다면, `#applyVictimImpactTransition()`에 `bossHazard`이면서 `claim.sourceType`이 counter류일 때만 넉백을 적용하는 예외를 추가해야 한다(전체 보스 공격에 일괄 넉백을 켜면 다른 패턴 밸런스가 깨질 수 있으므로 카운터 한정 권장).
   - 이 작업은 반드시 1번(경계 clamp)이 먼저 들어간 뒤에 진행한다. 순서를 바꾸면 넉백을 살리자마자 동일한 이탈 버그가 재발한다.
3. **[검증] 고속 돌진 패턴(GROUND_DASH/DIAGONAL_DASH/CHARGE)이 아레나 가장자리에서 플레이어와 충돌할 때의 실제 분리 속도를 로그로 한 번 찍어서, 경계 clamp만으로 충분한지 아니면 분리 힘 자체도 상한을 둬야 하는지 확인한다(디버깅 스킬의 "증거 수집" 단계 — 추정으로 끝내지 말고 한 번은 실측할 것).

---

## 3. 문제 2 — 보스 공격 패턴이 잘 보이지 않음

### 확인된 구현 상태

`BossPolygonObjectRenderers.js`에 텔레그래프(예고)와 액티브(실제 피해) 2단계 시각 구분 자체는 이미 구현되어 있다.

- `ContinuityWardenRenderer`(246~282줄): `actionState === "telegraph"`면 외곽선을 경고색(`COLOR.WARNING`, #fbbf24)·두께 5로, `guard`/`counter-ready`면 방패를 노란색(#fef08a)·두께 6으로 표시. `active`면 바톤 궤적을 위험색(`COLOR.HAZARD`, #fb7185)으로 표시.
- `SecurityBeamRenderer`(301줄~): `telegraph`는 점선 테두리 + 옅은 노란 채움, `active`는 실선 + 진한 붉은 채움.
- 연속 보안빔은 시퀀스 전체를 공격 시작 전에 telegraph 오브젝트로 한꺼번에 노출(`ContinuityWardenRuntime.js:1056-1077`), 기획 요구사항과 일치.

즉 "구현이 아예 안 됐다"는 아니고, 있는 신호가 실전에서 잘 인지되지 않는 상황으로 보인다. 원인 후보:

1. **색상 구분이 패턴별로 부족하다.** BATON/BACK_SWING/GROUND_DASH/DIAGONAL_DASH/CHARGE가 전부 `COLOR.WARNING`(#fbbf24) 계열 하나로 텔레그래프를 표시한다. 플레이어 입장에서 "어떤 공격이 오는지"가 아니라 "뭔가 온다"만 구분되므로, 회피 방향을 못 정하고 반응이 늦어질 수 있다.
2. **텔레그래프 지속시간이 짧다.** `meleeTelegraphSeconds: 0.6`, `chargeTelegraphSeconds: 0.9`(`Boss06Stage.generated.js:400, 443`) — 절대적으로 아주 짧은 건 아니지만, 보스 몸체·이펙트·배경이 겹치는 실제 화면에서는 0.6초 안에 색 변화를 인지하고 반응하기 빠듯할 수 있다. 특히 BATON 3연타처럼 연속 공격에서는 매 타마다 재인지해야 해서 부담이 커진다.
3. **텔레그래프가 보스 자기 몸체 외곽선/방패 두께 변화 위주라 화면이 복잡할 때 묻힐 수 있다.** 별도의 화면 전역 신호(예: 캐릭터 주변 경고 링, 공격 방향을 가리키는 화살표/파티클, 사운드 큐)가 코드에서 확인되지 않았다. 순수하게 보스 오브젝트 자체의 색상/두께 변화에만 의존하고 있어서, 카메라 거리·줌이나 다른 이펙트(파티클, 화면 흔들림)에 가려지기 쉽다.
4. **패턴 간 텔레그래프 형태 차이가 없다.** BATON/BACK_SWING/DASH가 전부 "외곽선 경고색"이라는 동일한 시각 언어를 쓰기 때문에, 숙련된 플레이어도 실루엣이나 자세 변화가 아니면 패턴을 구분하기 어렵다.

### 개선 방향

1. **[핵심] 패턴군별로 텔레그래프 색상/모양을 다르게 분리한다.**
   - 예: 근접 계열(BATON/BACK_SWING) = 주황, 돌진 계열(GROUND_DASH/DIAGONAL_DASH/CHARGE) = 파랑(이동 방향 예측이 중요하므로 진행 방향 화살표/트레일 프리뷰 추가), 보안빔(SECURITY) = 이미 구분된 노랑 점선 유지.
   - 색상뿐 아니라 아이콘/실루엣으로도 구분되면 색약 사용자 접근성도 함께 개선된다.
2. **[핵심] 화면 전역 신호를 추가한다.** 보스 오브젝트 자체 렌더링 외에, 공격 예고 시 플레이어 시야에 방향성 경고(예: 화면 가장자리 화살표, 지면 착지 예정 범위 표시)를 추가해서 카메라 프레이밍이나 이펙트 과부하와 무관하게 인지되도록 한다.
3. **[검토] 텔레그래프 최소 지속시간 하한 재검토.** 특히 BATON 연타처럼 짧게 반복되는 공격은 각 타격 전 예고가 실질적으로 회피 가능한 시간인지 실측 플레이테스트로 확인한다(현재 `meleeTelegraphSeconds: 0.6`).
4. **[검토] 사운드 큐 유무 확인.** 시각 신호와 별개로 공격 예고에 대응하는 오디오 신호(`src/audio/AudioEventBindings.js`)가 패턴별로 구분되어 있는지 점검하지 않았다 — 이번 조사 범위 밖이므로 별도 확인 필요. 시각 인지가 늦는 상황에서는 오디오 큐가 보완재로 유효하다.

---

## 4. 다음 액션 제안

| 우선순위 | 작업 | 근거 | 상태 |
|---|---|---|---|
| P0 | 플레이어 물리 좌표 아레나 경계 clamp 추가 (보스 공통) | 맵 밖 이탈 버그의 근본 원인 | ✅ 완료 |
| P1 | 카운터 넉백을 기획대로 되살림 (clamp 이후) | 기획-구현 불일치 | ✅ 완료 (부분, 아래 참고) |
| P1 | 텔레그래프 패턴별 색상/형태 차별화 | 가독성 문제 핵심 원인 | ✅ 완료 |
| P2 | 화면 전역 경고 신호(방향 화살표 등) 추가 | 가독성 보완 | ⏳ 보류 (아래 참고) |
| P2 | `security-walk` 상태명 기획 문서와 정합화 여부 결정 | 문서-코드 매핑 정리 | 미착수 |
| P3 | 텔레그래프 지속시간/사운드 큐 실측 검토 | 세부 튜닝 | 미착수 |

---

## 5. 구현 내역 (2026-08-23)

### P0 — 맵 밖 이탈 버그 수정 (`src/game/simulation/GameSimulation.js`)

근본 원인을 다시 확인해보니, 위 2절에서 추정했던 "경계 clamp가 아예 없다"보다 더 정확한 원인이 있었다:
`#advanceBossRuntime()`의 낙사 복구 체크(`stage.bounds.y + stage.bounds.height + PLAYER_CONFIG.radius`)가 **Y축(바닥으로 떨어지는 경우)만 검사**하고 있었다. 좌우(X축)나 위(Y축 상단)로 튕겨나가는 경우는 이 체크에 전혀 걸리지 않아서, 보스에게 옆으로 크게 밀리면 복구(`recoverPlayer` 텔레포트)가 발동하지 않고 그대로 화면 밖으로 날아가 버렸다.

이미 같은 파일에서 다른 용도로 쓰이던 `pointInsideBounds()`(2D 사각형 판정 유틸)를 재사용해서, X/Y 전체를 아우르는 판정으로 교체했다. `stage.bounds`(아레나 전체 범위)를 플레이어 반경만큼 패딩한 사각형 밖으로 나가면 즉시 `recoverPlayer()`가 동작한다.

### P1 — 카운터(방패 반격) 넉백 복원

`#resolveCompositeBossHazards()`(비-클레임/권위 경로, 기본 싱글/멀티플레이 경로)에서 `hazard.kind === "counter-bash"`일 때만 예외적으로 넉백을 적용하도록 추가했다. 넉백 방향은 카운터 히트박스 중심(보스 몸통 위치와 사실상 동일)에서 플레이어 방향으로의 단위벡터, 세기는 기존 `COMBAT_CONFIG.playerHitKnockback`(다른 피격 넉백과 동일 기준)을 재사용했다.

**범위 제한 사항**: 이 저장소는 보스 피격 판정에 두 개의 서로 다른 권위 경로가 있다 — 서버 직접 판정 경로(`#resolveCompositeBossHazards`, 이번에 수정)와 클라이언트 클레임 기반 경로(`#applyVictimImpactTransition`, `victimImpactAuthority === CLAIM`일 때 사용). 후자는 `claim.velocity`가 클라이언트가 자체 보고하는 값이라 "공격 방향"으로 신뢰할 수 없어서(그래서 애초에 `!bossHazard`로 넉백 자체를 꺼뒀던 것으로 보임) 이번 수정에서 건드리지 않았다. 클레임 기반 권위 모드를 쓰는 배포 환경이라면 카운터 넉백이 아직 적용되지 않으니, 필요 시 보스 런타임에 "현재 히트박스 원점"을 공개하는 공통 접근자를 추가해 클레임 경로에서도 서버 authoritative 좌표로 방향을 계산하도록 후속 작업이 필요하다.

### P1 — 공격 패턴 가독성 개선 (`src/render/boss/BossPolygonObjectRenderers.js`)

1. **패턴군별 텔레그래프 색상 분리**: 근접 계열(baton-1/2, overhead-slam, back-swing, counter-bash)은 기존 호박색(`#fbbf24`) 유지, 돌진/차지 계열(ground/diagonal thruster dash, charge)은 하늘색(`#38bdf8`) + 대시(dashed) 외곽선으로 분리했다. 보안빔은 기존에도 이미 별도 스타일(노란 점선/붉은 실선)이라 손대지 않았다.
2. **돌진 계열 방향 화살표**: 돌진/차지 텔레그래프 히트박스에 진행 방향(`chevron`)을 표시해서, 어느 쪽으로 돌진해오는지 미리 보이도록 했다.
3. **버그 수정 — 보스 시각 요소가 항상 오른쪽만 보고 있던 문제**: `direction(object)` 헬퍼가 `object.direction === "left"` 문자열만 인식하도록 되어 있었는데, `ContinuityWardenRuntime`은 실제로 `facing`을 숫자(`1`/`-1`)로 내려주고 있었다. 그 결과 보스가 왼쪽을 보고 공격해도 방패·바톤 궤적·추진 이펙트가 항상 오른쪽 기준으로 그려지고 있었다 — 실제 피격 판정(서버의 `#meleeHazardBounds()`는 `facing`을 정확히 반영)과 화면에 보이는 텔레그래프 위치가 어긋나는 원인이었다. 숫자 `facing`도 올바르게 처리하도록 수정했다. 이번에 새로 추가한 돌진 방향 화살표도 이 수정 덕분에 정확한 방향을 가리킨다.

검증: `node scripts/checkSyntax.mjs`(458개 파일 통과), `npm test`(기존 sector03 회귀 테스트 통과), 그리고 렌더러 변경분은 캔버스 컨텍스트를 mock한 별도 스크립트로 근접/돌진 텔레그래프의 색상·점선·화살표 출력을 직접 확인했다(임시 스크립트는 커밋하지 않고 삭제).

### P2 — 화면 전역 방향 경고(화살표) — 보류

기존에 오프스크린 타겟용 화살표 시스템(`src/render/ScreenEdgeGuide.js`, `resolveScreenEdgeGuide`/`layoutAccessEdgeGuides`)이 존재하긴 하지만, 현재는 "액세스 모듈" 수집 대상 전용으로 연결되어 있다. 이걸 보스 텔레그래프에도 연결하려면 `ContinuityWardenRuntime` → 스냅샷 → 렌더 파이프라인 → HUD 오버레이까지 새 데이터 흐름을 만들어야 해서, 이번 패스에서 급하게 끼워 넣기보다 별도 작업으로 분리하는 게 안전하다고 판단했다. 대신 위 P1에서 넣은 "돌진 방향 화살표"(월드 내 텔레그래프에 붙는 표시)가 카메라 프레이밍 문제를 어느 정도 완화한다.
