# 저장소 에이전트 지침

이 규칙은 이 저장소에서 작업하는 모든 자동화 에이전트에 적용한다.

1. 구현 전에 `SESSION-HANDOFF.md`와 `docs/development-rules.md`를 읽고 아직 기준 문서에 흡수되지 않은 상태와 반복 규칙을 확인한다. 현재 구현 순서와 시나리오 상태는 각각 `docs/implementation-roadmap.md`, `docs/scenario-development-integration.md`에서 확인하고 관련 주제의 기준 문서도 함께 읽는다.
2. 사용자가 대화에서 향후 작업에 영향을 주는 제품·조작·아키텍처·워크플로 결정을 명시하면, 별도 요청을 기다리지 말고 같은 작업에서 먼저 `SESSION-HANDOFF.md`에 임시 기록한다. 최신 명시적 결정이 이전 결정보다 우선하며 서로 모순되는 활성 항목을 남기지 않는다.
3. 한 번의 작업을 넘어서 반복 적용할 내용은 `docs/development-rules.md`의 결정 흡수 절차에 따라 같은 작업에서 해당 기준 문서로 승격한다. 기준 문서가 결정과 실행 방법을 충분히 소유하면 `SESSION-HANDOFF.md`의 임시 항목은 링크 요약도 남기지 않고 제거한다. 핸드오프에는 아직 승격되지 않은 결정·진행 중 전환·기준 문서에 없는 blocker만 남긴다.
4. 에이전트의 추정은 사용자 결정처럼 기록하지 않는다. 일회성 실행 요청, 임시 디버깅 값, 비밀 정보도 영구 규칙으로 승격하지 않는다.
5. 완전히 반영되었거나 다른 결정으로 대체된 항목만 대체 관계를 보존한 채 `docs/decision-history.md`로 이동한다.
6. 코드·설정 변경을 끝내기 전에 이번 대화의 명시적 결정이 기준 문서에 반영됐는지 검색하고, 누락된 문서를 같은 Issue와 커밋에 포함한다. 기준 문서로 승격을 마친 항목이 `SESSION-HANDOFF.md`에 중복으로 남지 않았는지도 함께 확인한다.
7. 자동 CI를 전제로 하지 않는다. 최종 candidate의 단일 검증 소유자는 병합 전에 `npm run check`, `npm run format:check`, `git diff --check`를 각각 한 번 통과시키고 ledger에 base SHA·diff fingerprint와 함께 기록한다. 자동 테스트 suite는 유지하지 않으며 사용자가 해당 작업에서 명시적으로 요청한 테스트만 추가·실행한다. 같은 candidate의 fresh PASS를 executor·부모·verifier가 반복하지 않는다. 화면 변경은 브라우저에서 직접 검증한 뒤 Pull Request에 결과를 기록한다. 버전 또는 멀티플레이 서버 코드가 바뀐 작업은 PR 병합만으로 완료 처리하지 않고 `docs/version-management.md`의 기존 필수 변경·완료 절차까지 수행한다.
8. 독립 작업은 기존 Git object database를 공유하는 별도 worktree와 branch를 기본으로 사용한다. 같은 저장소라는 이유로 직렬 대기하지 않으며, worktree를 만들 수 없거나 실제 같은 hunk·public contract에 순서 의존성이 있을 때만 shared checkout을 직렬화한다. 독립 검증 lane은 준비되는 대로 한 wave에서 병렬 실행한다.
9. 같은 증상군의 버그가 이전 수정 뒤 다시 요청되면 새 예외 처리를 추가하기 전에 반복 유사 버그 모순 감사를 수행한다. 이전 수정 이력과 대체된 결정, 같은 의미를 소유하는 상태 필드·controller·protocol 중복, client/server와 collision/renderer predicate 차이를 먼저 확인하고 재현 가능한 시뮬레이션·validator·수동 검증으로 근본 불변식을 확인한다. 상세 절차는 `docs/development-rules.md`의 **반복 유사 버그 모순 감사**를 따른다.
10. 에이전트는 보조 패치 작성자가 아니라 현재 작업의 메인 개발자로서 결과 전체를 책임진다. 최소 diff 자체를 목표로 증상을 덮지 않고, 사용자 의도를 만족하는 단일 권위·공개 계약·모든 호출자·멀티 동기화·표현·문서·migration까지 필요한 범위를 완결한다. 자동 테스트는 사용자가 명시적으로 요청한 경우에만 범위에 포함한다. 단, 책임 있는 완결성과 무관한 기능 추가나 전면 재작성은 만들지 않는다.

## 사용자 원문 규칙

아래 문구는 사용자가 직접 작성한 원문 규칙이다. 축약하거나 의역하지 않는다.

```text
너는 리뷰내용도 불필요한 ai slop을 줄이고 핵심 가치만 우선순위 순으로 알려야해
```

```text
계획 문서가 잘안읽힌다, 그냥 as is tobe 형태로 10줄이내로 적어
내가 적으라해도 진짜 핵심은 10줄을 넘을수가 없어 왠만해서

현재는 한 파일이 분기처리등 객체지향적으로 반영이 안되어있는데

내 개념은 사람이 게임을 플레이할시 객체를 인식하는 단위랑 코드에서 구현한 단위랑 일치해야하고 공통 상위개념은 묶는 형태가 필요하다

ClientCombatFeedback 기준으로 공통 처리는 상위 클래스에 묶고
각 예외처리에 해당하는 조건 문들이, 다 각 구체 클래스 구현에 오버라이드 함수 형태로 구현되어야한다
그리고 공통 요소가 아니지만 일부 항목이 공유하는 라이프사이클등은 믹스인 클래스로 개발후 조합한다
아예 포함되어 분리되는경우엔 has a 규칙이니까 컴포넌트 클래스로 빼내고 그걸 포함하는 형태를 사용한다
```

```text
좋아 참고로 항상 내가 요구하는건, 아까 초안처럼 단순히 글을 생산해서 모든 계획을 나열하라는게 아니라 같은 내용을 설명해도, 1차 개념, 2차 개념, 개념에 벗어나는 디테일 이런식으로 작성을 원하는거야 즉 글자 단어 하나하나가 최대한 의도를 정확하게 표현하는 방향으로 좁혀져야하는거지 뭉뚱그리는 단어 말고
```

```text
아까 말한 규칙들은 내 raw 문구로 메인 규칙에 적어놔 축약하지말고
```

```text
projectEnemy(enemy, byId, context) {

이거도 내부 분기 되잖아 이거까지 각 상태 정의 클래스로 쪼개서 각 상태 클래스 내의 함수가 각각 처리해야지
```

````text
클래스로 빼라 한 이유는 저렇게 조건문 반복되는걸 predicate형태의 상위 클래스 메서드를 오버라이드하는 형태로 하기 위해서야
```kotlin
    if (!enemy.enemyType?.startsWith("swarm") || this.state(enemy) !== "orbit") return false;
```

이런 코드성 내용을 내 말대로 변경해줘
````

```text
지금 startwith 패턴도 다 enum 으로 구현해 그러면 굳이 startwith 이런걸 할필요가 없잖아
```

```text
이제 내가 지적한 부분에 대해서 수정 범위내에 다른곳도 고쳐

            if (
                event.eventType === "augment-action-started" ||
                event.eventType === "predicted-augment-action-started"
            ) {

이런거
```

```text
그리고 내가 원하는 최종형상은


`artillery:${enemy.id}`, "artillery-warning"


이런거도 없고 enum 클래스에서 저런용 조합함수 지원하던가 생성자로 받던가해서 사실상 정의부 외에는 raw 문자열이 안보이는 수준이어야해'
```

```text
개인적으론 지금 투사체등에서 자꾸 따로 구현해둔 이동 처리로직등 이거도 다 피직스 믹스인으로 처리하고싶은데 그게 아니더라도, 저런 형태가 아니라 내가 말한 규칙 기반이어야해
```

```text
아까 수정한거 보는데 내 기준은 수치도 바깥에서 raw 숫자로 넣으면 안되 재사용하는거면 상수로 하고, 기본값이면 기본값 파라미터로 하고 빼버리던가 해야해 사용하는 쪽에서는
```

```text
export const CLIENT_FEEDBACK_OBJECT = Object.freeze({
    WIND: new ClientFeedbackObjectDefinition({
        predicate: ({ state }) => Boolean(state && state.phase !== "lull"),
        request: ({ zone, state }) => ({
            id: KEY.wind(zone.id),
            presetId: "wind-flow",
            position: { x: zone.bounds.x + zone.bounds.width / 2, y: zone.bounds.y + zone.bounds.height / 2 },
            direction: zone.direction,
            options: {
                bounds: {
                    minX: zone.bounds.x,
                    minY: zone.bounds.y,
                    maxX: zone.bounds.x + zone.bounds.width,
                    maxY: zone.bounds.y + zone.bounds.height
                },
                density:
                    state.phase === "warning"
                        ? 0.25
                        : state.phase === "decay"
                          ? state.multiplier
                          : Math.max(0.35, state.multiplier)
            }
        })
    }),
    PROJECTILE: Object.freeze([
        projectileDefinition("projectiles", CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT),
        projectileDefinition("enemyProjectiles", CLIENT_FEEDBACK_PRESET_ID.ENEMY_MUZZLE),
        projectileDefinition("augmentProjectiles", CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT)
    ])
});

여기서 wind가 좀 맘에 안드는 부분이 density 정의부가, state에 따라 바뀌는게 그냥 저렇게 옵션으로 정의되어있는데, 만약 저런 포맷이 필요하면 난 map 형태로 구현을 권장해
```

```text
근데 내가 맵을 쓰라하긴 햇는데 저걸 말한건 아니고 object에서 Key value 형태로 하는거 말한거야, 지금은 map으로 감싸면서 오버헤드가 생겻어
```

```text
map set도 내가 아까 말한 규칙대로 불필요한 경우에 그냥 객체로해줘
```

## 고정 상태 대응표 규칙

- enum·state에서 값이나 resolver를 선택하는 고정 대응표는 `Object.freeze({ [key]: value })` 형태로 정의하고 property lookup으로 사용한다.
- 고정 대응표를 `Map`이나 `Set`으로 감싸거나 중첩 조건문·삼항식으로 선택하지 않는다. `Map`·`Set`은 런타임에 key가 추가·삭제되는 동적 상태와 membership 추적에만 사용한다.
- 대응표의 raw ID와 재사용 수치는 definition·상수가 소유하고, 기본값은 default parameter가 소유해 사용하는 쪽에서 반복하지 않는다.

```text
음 내말은 공통 physics 믹스인으로 하란거지, 지금은 유저 피직스가 분리되어있잖아 몹이랑 투사체랑
```

```text
근데 물리 회전성분도 믹스인으로 빠진게 안보이는데?
```

```text
그리고 지금 구조부터 잘못되었어, position velocity accelation 3벡터 기반으로 applyimpulse가 현재 가속도 변수인 accelation 에 더하고
그값이 매 틱마다 합쳐져야지 이런 구조가 게임물리 엔진 기반 구조야 기본적으로
```

```text
그 로컬레포 ballfightsimulator 구조 참고해
```

## 공통 Physics 조합 규칙

- Player·Enemy·Projectile은 position·velocity·acceleration 세 벡터와 tick 적분을 하나의 공통 `PhysicsMixin`에서 사용한다.
- `applyImpulse()`는 velocity를 직접 변경하지 않고 현재 tick의 acceleration에 누적한다. tick은 acceleration을 velocity에 합친 뒤 velocity를 position에 적분하고 acceleration을 초기화한다.
- 회전 객체는 `AngularPhysicsMixin`을 조합하고 angular acceleration → angular velocity → angle 순서로 적분한다. 회전하지 않는 객체는 이 mixin을 조합하지 않는다.
- Surface collision·Gravity·Homing steering·Projectile lifetime처럼 일부 객체만 필요한 행동은 공통 Physics 위에 선택 mixin으로 조합한다.
- 객체 종류마다 별도 Physics 기반이나 적분 공식을 만들지 않고 구체 차이는 선택 mixin의 override로 구현한다.

## Scenario planning and integration

- 시나리오 기획·authored area·관련 gameplay를 수정하기 전에 `docs/scenario-development-integration.md`, 해당 Sector·Stage README와 구현 중인 Stage의 `PRODUCTION-ALIGNMENT.md`를 읽는다.
- 작업 시작과 종료에 `npm run check:scenario-integration`을 실행한다. 시나리오 문서, `src/game/world/areas/` 또는 `src/game/world/sectors/`와 Sector validator 변경으로 fingerprint가 달라지면 최근 변경·Runtime 상태·차단 요소·확인 근거를 통합 현황에서 실제로 재검토한 뒤 marker를 갱신한다. hash만 새 값으로 바꿔 검사를 우회하지 않는다.
- Stage 문서의 고정 Git SHA는 `AUTHORING SNAPSHOT`으로 표시한다. 현재 main과 Runtime 통합 상태는 Stage 문서가 아니라 `docs/scenario-development-integration.md`가 소유한다.

## Sprite asset work

- 스프라이트 생성·교체·import·atlas·animation metadata 작업은 파일을 만들기 전에 `docs/graphics-asset-guide.md`와 대상에 맞는 `docs/sprite-asset-format.md`(player) 또는 `docs/enemy-sprite-asset-format.md`(일반 몹)를 전부 읽고 `assets/runtime/characters/README.md`에서 현재 구현 상태와 mock 범위를 확인한다.
- PixelLab·SpriteCook의 원본 export 형식을 런타임 계약으로 사용하지 않는다. 도구별 입력은 여러 PNG atlas와 `sprite-manifest.json`으로 정규화하고 renderer·gameplay에 도구별 분기를 추가하지 않는다.
- 새 player runtime 리소스는 `assets/runtime/characters/fixtures/player-multi-atlas/sprite-manifest.json`을 공개 계약으로 사용하고 `assets/runtime/characters/player-production-template/`에서 시작해 `npm run validate:sprite-assets -- <directory>`를 통과시킨다. 문서 예제를 기억으로 다시 쓰거나 별도 manifest 변형을 만들지 않는다.
- 새 일반 몹 runtime 리소스는 `assets/runtime/characters/sector-01-enemies/enemy-sprite-manifest.json`을 공개 계약 예제로 사용하고 `npm run validate:enemy-sprite-assets -- <directory>`를 통과시킨다. player animation manifest를 몹에 재사용하지 않는다.
- 스프라이트 작업 결과에는 생성·변환한 파일 경로, 사용 도구와 원본 형식, 실제 validator 결과를 기록한다. collider·hitbox·피해량·물리 설정은 스프라이트 manifest에 넣지 않는다.
- `assets/runtime/characters/sprite-manifest.schema.json`, fixture manifest, `PlayerSpriteManifest.js`와 validator는 하나의 공개 계약이다. 어느 하나를 변경하면 나머지와 `docs/sprite-asset-format.md`를 같은 변경에서 갱신하고 multi-atlas validator를 실행한다.

## Environment asset work

- 배경·지형 표면·비충돌 장식의 생성·교체·import·atlas 작업은 파일을 만들기 전에 `docs/graphics-asset-guide.md`와 `docs/environment-asset-format.md`를 전부 읽고 `assets/runtime/environments/README.md`에서 현재 mock 범위를 확인한다.
- PixelLab·SpriteCook의 원본 배열과 metadata를 런타임 계약으로 사용하지 않는다. 도구별 입력은 여러 PNG atlas와 환경 전용 `sprite-manifest.json`으로 정규화하며 캐릭터 animation schema나 renderer에 도구별 분기를 추가하지 않는다.
- 새 environment runtime 리소스는 `assets/runtime/environments/default-mock/sprite-manifest.json`을 복사해 시작하고 `npm run validate:environment-assets -- <directory>`를 통과시킨다. atlas 개수와 frame 배열은 바꿀 수 있지만 loader·schema·example·validator를 하나의 공개 계약으로 유지한다.
- terrain 표현은 기존 collision surface polygon과 one-way edge chain을 그대로 사용한다. decoration은 충돌을 추가하지 않고 이동 경로 밖 또는 배경에만 배치하며, asset 실패는 backdrop·terrain·decoration별 독립 fallback과 설정 버튼을 1초 길게 눌러 여는 디버그 수치 진단으로 검증한다.

## Scenario art reference work

- 시나리오 이미지를 생성·편집하기 전에 `docs/bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`, 해당 Sector README, Stage README와 `PRODUCTION-ALIGNMENT.md`를 전부 읽고 현재 Area Catalog의 Area ID·Camera Zone·Stable ID·오브젝트 수와 구현 상태를 확인한다.
- 문서와 Runtime이 다르면 이미지 생성을 멈추고 먼저 둘을 정렬한다. `RETIRED`, `RETIRED PARTIAL`, `PENDING REGENERATION` 이미지는 생성 입력이나 구현·외주·검수 근거로 사용하지 않는다.
- `Scenario Art Reference`는 대표 Gameplay Camera Shot 한 장으로 만들고, 정확한 좌표·전체 경로·LOS·Wind Zone의 권위는 `Approved Blockout`이 소유한다. 다만 선택한 Shot에 보이는 발판·벽·Cover·Overhang·Crossbeam은 Blockout과 Runtime의 좌우·상하 관계, 상대 폭과 개수를 그대로 유지하며 구도를 위해 이동·확대·병합하지 않는다. 살아 있는 Rope는 Player와 현재 Anchor 사이 한 줄만 표시하며 다른 Anchor를 Polyline·삼각형·네트워크로 연결하지 않는다.
- 생성 전후에는 기준 문서의 확인표를 수행한다. 사용한 Stage·Camera Zone·정확한 오브젝트 수·금지 요소·출력 경로·이미지 상태를 Stage 문서에 기록하고, 생성된 PNG를 통이미지 Runtime 배경이나 Collision으로 사용하지 않는다.
- 사용자가 프로젝트용으로 승인한 생성 이미지는 `$CODEX_HOME`의 생성 폴더나 대화 미리보기에만 남기지 않는다. 해당 Stage `images/`에 복사하고 생성 기록·상태 문서를 같은 커밋과 Pull Request에 포함해 `main`에 병합한다.
- 직전 Stage 생성물을 연쇄 Style Anchor로 추가하지 않는다. 공용 Sector 환경 기준과 고정 Player 규격을 재사용하고, Player Character Master가 승인되면 기준 문서를 같은 변경에서 갱신한다.

## Audio asset work

- 오디오 생성·교체·import·codec·loop 작업은 파일을 만들기 전에 `docs/audio-asset-guide.md`와 `docs/audio-asset-format.md`를 전부 읽고 `assets/audio-authoring/README.md`와 `assets/runtime/audio/README.md`에서 인계·mock 범위를 확인한다.
- Skill·MCP·DAW 원본을 런타임 계약으로 사용하지 않는다. 원본·48 kHz/24-bit PCM WAV master·preview는 `assets/audio-authoring/<category>/<asset-id>/`에 인계하고, 통합 개발자가 browser source 배열과 `audio-manifest.json`으로 정규화한다.
- 새 runtime package는 같은 category의 `assets/runtime/audio/<category>/default-mock/audio-manifest.json`에서 시작한다. pack은 `assets/runtime/audio/packs/default-mock/audio-pack.json` 구조를 따르고 `npm run validate:audio-assets -- <pack-or-package-directory>`를 통과시킨다.
- `audio-manifest.schema.json`, `audio-pack.schema.json`, parser, mock manifest와 validator는 하나의 공개 계약이다. 하나를 바꾸면 나머지와 `docs/audio-asset-format.md`를 같은 변경에서 갱신한다.
- manifest에는 clip·source·loop와 cue 표현 정책만 둔다. 게임 trigger·collider·damage·physics·network authority는 넣지 않으며 `AudioEventBindings` 밖에서 게임 사건 이름을 오디오 engine에 추가하지 않는다.
- package 교체는 stable ID·catalog·immutable definition 주입 경계를 사용한다. 향후 디버그 selector를 위해 특정 mock 경로를 gameplay나 mixer에 하드코딩하지 않는다.

## Split-authority gameplay events

- 플레이어·로프처럼 특정 소유자가 있는 입력 주도 사건은 해당 소유 클라이언트가, 충돌·피격은 피해 클라이언트가 최초 트리거한다. 서버 응답을 기다린 뒤 모바일 움직임, 피격 반응, UI 또는 VFX를 시작하지 않는다.
- 몹·적 투사체 생성과 궤적처럼 어느 한 클라이언트에 맡길 수 없는 중립 시뮬레이션 사건은 서버가 진행한다. 이를 안정적인 플레이어 ID의 대표 클라이언트에게 위임하지 않는다.
- 입력 주도 객체와 중립 시뮬레이션 객체가 만나는 피격·절단은 피해 클라이언트가 claim한다. 정상 impact claim은 사건 자료와 사건 결과에 한정된 양자화 상태 지문만 보내며, 서버가 같은 전이를 적용한 지문이 일치하면 사건을 공유한다. 지문은 동기화 불일치 감지용이지 보안 증명이나 서버 판정 대체물이 아니다.
- impact 지문이 다를 때만 서버가 `state-diverged`로 복구 자료를 요청하고, 피해 클라이언트가 그 시점의 소유자 상태를 한 번 보내 서버와 동료를 자기 결과로 수렴시킨다. 정상 impact마다 전체 상태를 보내거나 서버 상태로 피해 클라이언트를 되감지 않는다.
- 서버의 주역할은 소유 클라이언트가 만든 상태·사건을 검증해 다른 복제본에 공유하는 것이다. 정상 승인 중인 소유자의 HP·피격 무적·생명·로프·쿨다운·시간 제한 강화는 서버 snapshot으로 다시 쓰지 않는다. 서버가 직접 진행하는 상태는 몹·중립 투사체·공용 월드·세션 수명주기다.
- 새 이벤트 구현에는 로컬 트리거가 서버 receipt보다 먼저 발생하는지, 정상 경로가 최소 사건 자료만 보내는지, 상태 불일치 때만 복구 상태를 보내는지, 중복 claim이 한 번만 확정되는지, 서버 확정이 소유 클라이언트 반응을 되감지 않는지와 중립 객체가 특정 클라이언트 연결에 의존하지 않는지를 검증한다.
