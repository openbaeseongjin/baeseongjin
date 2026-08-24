# Continuity Warden Animation Set v1

상태: `USER-APPROVED PIXEL BASELINE / SINGLE-COMBAT MOTION SET LOCAL RUNTIME INTEGRATED / FULL PLAYTEST PENDING`

## 목적과 범위

Boss06 `CONTINUITY WARDEN`의 단일 전투 구간에 필요한 공통 대기, 직접 공격, 방어, 이동, 보안 명령, 피격, 방향 전환과 패배를 같은 외형과 화면 도트 밀도로 고정한다. early/mid/late는 새 Phase가 아니라 패턴 강도 구간이며 각 행동은 독립 clip으로 연결한다. 이번 결과는 모션·실루엣 검수용 저작 후보이며 gameplay timing, hitbox, damage, physics와 network state를 변경하지 않는다. 분리 VFX는 [`../../effects/continuity-warden-phase-1-vfx/`](../../effects/continuity-warden-phase-1-vfx/)가 소유한다.

- Category: `characters`
- Asset ID: `continuity-warden-animation-set-v1`
- 승인된 제작 원본: `source/logical-64x96/<animation-id>/frame-*.png`
- 과거 생성 도구: OpenAI built-in ImageGen; 기존 RGB keyframe sheet는 이력 보존 전용
- Logical frame: `64×96`
- Export frame: `128×192`, 정확한 `2×` nearest-neighbor 확대
- Format: transparent RGBA PNG, binary alpha
- Direction: right-facing; left는 향후 renderer `flipX`
- Anchor: bottom-center, 불투명 픽셀 최하단 `y=187`
- Palette: transparent + Graphite / Cold Steel / limited Cyan 14색
- Identity anchor: `../continuity-warden-phase-concepts/`
- 외부 reference provenance와 production license: 아직 미검증
- 신규 1페이즈 모션 제작 도구: `source/build_phase1_direct_pixel_motion.py`; 승인 logical PNG만 정수 픽셀로 조합·이동·반전

## 사용자 승인 제작 기준

첨부 검수본 `preview/animation-set-review.png`의 저해상도 픽셀 표현을 `CONTINUITY WARDEN` 후속 캐릭터·모션 제작의 단일 시각 기준으로 사용한다.

- 새 프레임은 승인된 `64×96` logical PNG를 직접 복제·편집해 제작한다.
- 새 고해상도 ImageGen 원본, 고해상도 keyframe sheet 또는 고해상도 그림을 만든 뒤 축소하는 방식을 사용하지 않는다.
- `128×192` export는 logical pixel의 정확한 2× 출력일 뿐 별도 고해상도 저작물이 아니다.
- GIF와 checker review의 정수 확대는 검수 표시 전용이며 새 그림의 source로 역사용하지 않는다.
- 기존 `source/imagegen/`은 생성 이력 보존용 `SUPERSEDED / DO NOT USE FOR NEW FRAME AUTHORING`이다.
- 새 모션에서도 현재 Helmet/Head 비율, 몸 크기, 장비 위치, 14색 팔레트, 발 기준점을 유지한다.

## 애니메이션 맵

| Animation              | Frames | Preview                            | 프레임 의미                                                         |
| ---------------------- | -----: | ---------------------------------- | ------------------------------------------------------------------- |
| `combat-idle`          |      6 | `preview/combat-idle.gif`          | 호흡·어깨·무게중심만 움직이며 Shield와 Baton은 낮게 유지            |
| `baton-combo`          |      9 | `preview/baton-combo.gif`          | 1타 예고/접촉/회수 → 2타 역방향 → 3타 Overhead Slam                 |
| `guard`                |      6 | `preview/guard.gif`                | 중립 → Shield 상승 → Guard 유지 → 정면 충돌 반응 → 안정 → 해제      |
| `ground-dash`          |      6 | `preview/ground-dash.gif`          | 중립 → 낮은 예고 → 발진 → 수평 이동 → 제동 → 복귀                   |
| `charge`               |      8 | `preview/charge.gif`               | 방향 고정 → 긴 발진/이동 유지 → skid → 큰 취약 회복 → 복귀          |
| `security-command`     |      6 | `preview/security-command.gif`     | 중립 → 열린 손 명령 → command hold → 종료                           |
| `hit-front`            |      4 | `preview/hit-front.gif`            | 정면 Rope Impact에 상체가 뒤로 밀림                                 |
| `hit-back`             |      4 | `preview/hit-back.gif`             | 후면 Rope Impact에 상체가 진행 방향으로 밀림                        |
| `turn`                 |      4 | `preview/turn.gif`                 | 우향 → 짧은 facing bridge → 좌향; Runtime은 최종적으로 `flipX` 사용 |
| `neutral-recovery`     |      4 | `preview/neutral-recovery.gif`     | 낮은 공격 종료 자세 → 제동 → 기본 자세 복귀                         |
| `counter-ready`        |      4 | `preview/counter-ready.gif`        | Shield 중심 준비 → 낮은 Counter 대기 자세 고정                      |
| `counter-bash`         |      4 | `preview/counter-bash.gif`         | Counter 감지 → Shield 전진 충돌 → 회수                              |
| `back-swing`           |      4 | `preview/back-swing.gif`           | 전면 자세에서 후방으로 Baton을 쓸어내고 낮게 회수                   |
| `diagonal-dash`        |      6 | `preview/diagonal-dash.gif`        | 낮은 예고 → 사선 발진 → 공중 이동 → 착지                            |
| `defeated-baton-drop`  |      4 | `preview/defeated-baton-drop.gif`  | 피격 고정 → Baton 이탈 → 바닥 정지                                  |
| `defeated-shield-fall` |      4 | `preview/defeated-shield-fall.gif` | Shield 이탈 → 회전 낙하 → 바닥 정지                                 |
| `defeated-unconscious` |      5 | `preview/defeated-unconscious.gif` | 무장 해제 → 무릎 붕괴 → 고개를 숙인 의식 상실 고정                  |

`Guard` 시트의 충돌 반응은 조건부 상태를 한 장에서 검수하기 위한 keyframe map이다. Runtime 승격 시 `guard-enter`, `guard-loop`, `guard-block`, `guard-exit` clip으로 분리해야 한다. 충격봉 3연타도 `baton-1`, `baton-2`, `overhead-slam`의 gameplay state를 하나의 긴 clip으로 합치지 않는다.

위 상태별 export와 GIF를 이번 authoring 결과에서 각각 분리했다. `turn`의 좌향 frame은 전환 검수용이며 별도 좌향 atlas 계약을 만들지 않는다.

## 단일 전투 구간 완료 범위

현재 Runtime의 early/mid/late 내부 강도 순서 전체에 필요한 캐릭터 모션을 포함한다. 각 모션은 gameplay state와 1:1로 연결하며 하나의 합본 애니메이션으로 이어 붙이지 않는다.

- 공통: `combat-idle`, `turn`, `neutral-recovery`, `hit-front`, `hit-back`
- 충격봉: `baton-1`, `baton-2`, `overhead-slam`
- 방어: `guard-enter`, `guard-loop`, `guard-block`, `guard-exit`
- 이동: `ground-dash`, `charge`
- 중·후반 이동: `diagonal-dash`
- 중·후반 대응: `back-swing`, `counter-ready`, `counter-bash`
- 보안: `security-command`; LOW/HIGH beam 자체는 분리 VFX asset 사용
- 반응: `hit-front`, `hit-back`, `guard-block`, `turn`
- 패배: `defeated-baton-drop` → `defeated-shield-fall` → `defeated-unconscious`

## 결과 경로

- 승인된 제작 원본: `source/logical-64x96/`
- 과거 ImageGen 원본: `source/imagegen/`; 이력 보존 전용, 신규 제작 입력 금지
- 정규화 논리 프레임: `source/logical-64x96/<animation-id>/frame-*.png`
- 투명 개별 export: `export/frames/<animation-id>/frame-*.png`
- 가로 atlas 후보: `export/<animation-id>.png`
- GIF 검수본: `preview/<animation-id>.gif`
- 전체 정지 검수본: `preview/animation-set-review.png`
- 전체 상태 정지 검수본: `preview/phase-1-motion-review.png`
- 과거 정규화 재현 스크립트: `source/normalize_animation_sheets.py`; 기존 산출 검증 전용, 신규 프레임 제작 금지
- 1페이즈 직접 픽셀 제작 스크립트: `source/build_phase1_direct_pixel_motion.py`
- 로컬 Runtime 정규화 package: [`../../../runtime/characters/continuity-warden-phase-1/`](../../../runtime/characters/continuity-warden-phase-1/)

## 정규화와 검수 기준

1. 승인된 64×96 logical frame을 직접 편집하고 비정수 변환과 보간을 사용하지 않는다.
2. Alpha는 `0` 또는 `255`, 색은 기존 Warden의 14색 Graphite / Cold Steel / Cyan 팔레트로 제한한다.
3. 모든 frame의 feet/bottom 기준을 logical `y=93`에 맞춘다.
4. 각 logical pixel을 정확한 2×2 RGBA block으로 복제해 128×192 export를 만든다.
5. GIF는 checker background가 포함된 검수 전용이며 Runtime 입력이나 신규 제작 source로 사용하지 않는다.

## Runtime 통합 상태와 남은 결정

- 단일 전투 구간의 `neutral`·Baton 3타·Back Swing·Guard/Counter·Ground/Diagonal Dash·Charge·Security Command·Defeated를 Sprite renderer에 연결했다.
- V3 `jump`·`landing`은 새 저작 frame 승인 전까지 `combat-idle` pixel body의 renderer-local pose fallback, `enemy-summon`은 의미가 같은 `security-command` clip으로 연결한다. 이 fallback을 신규 승인 모션으로 기록하지 않는다.
- `boss-damaged`와 `boss-guard-blocked` 사건은 presentation FSM에서 `hit-front`/`hit-back`과 `guard-block`을 선택하고, 방향 변화는 `turn`을 선택한다. gameplay snapshot에는 animation/frame 상태를 추가하지 않는다.
- 패배는 Runtime `defeatStage`를 표시 전용으로 전달해 `baton-drop` → `shield-fall` → `unconscious` 독립 clip으로 재생하며 이후 Gate/Shuttle 단계에서는 unconscious 마지막 frame을 유지한다.
- 긴 `charge`는 Runtime에서 예고 0~~1, 반복 이동 2~~5, 종료 6~7 프레임으로 분리해 실제 active 이동이 끝날 때까지 돌진 자세를 유지한다. 짧은 `ground-dash`는 기존 단일 재생을 유지한다.
- Boss 전용 character manifest·loader·validator 공개 계약은 아직 없다.
- Shield arm과 Baton arm을 body에서 분리할지 여부
- gameplay active-frame marker는 기존 Boss Runtime이 소유하며 sprite clip에 판정을 넣지 않는다.
- Dash sprite의 local root와 Runtime 이동 좌표의 결합 방식
- 실제 Stage 1x·모바일에서 Player, Rope, Anchor와 Telegraph를 함께 둔 full combat 검수
