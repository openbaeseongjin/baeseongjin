# 프로토타입 아키텍처

## 현재 범위

브라우저 Canvas에서 실행되는 2D 로프 액션 프로토타입이다. 고정 길이 로프 물리, 하나의 연속 월드에 조립된 저작 진행 영역, 자동 전투, 적 투사체, 체크포인트 복귀와 아티팩트 런 상태를 공용 시뮬레이션에서 처리한다. PC와 모바일은 입력 방식만 다르고 게임 규칙은 공유한다.

## 주요 모듈

```text
index.html
└─ src/main.js
   └─ game/GameApp.js
      ├─ core/input/InputSampler.js
      ├─ core/input/MobileControlLayout.js
      ├─ core/sim/FixedStepRunner.js
      ├─ render/GameRendererFactory.js
      ├─ render/CanvasRenderer.js
      ├─ render/RenderViewport.js
      ├─ render/RenderPerformanceMetrics.js
      ├─ render/SceneRenderer.js
      ├─ render/PolygonSceneRenderer.js
      ├─ render/sprites/SpriteAnimation.js
      ├─ render/sprites/SpriteCanvasPainter.js
      ├─ render/sprites/PlayerSpriteDefinition.js
      ├─ render/sprites/PlayerSpriteCatalog.js
      ├─ game/commands/PlayerCommand.js
      ├─ game/runtime/LocalAuthority.js
      ├─ game/runtime/AuthoritySnapshotBuilder.js
      ├─ game/simulation/GameSimulation.js
      ├─ game/combat/CombatSystems.js
      ├─ game/combat/CombatFeedback.js
      ├─ game/artifacts/ArtifactCatalog.js
      ├─ game/artifacts/ArtifactInventory.js
      ├─ game/metrics/RunMetrics.js
      ├─ game/network/PlayerCommandBatch.js
      ├─ game/network/AuthorityCommandInbox.js
      ├─ game/network/WorldSnapshotEnvelope.js
      ├─ game/network/PredictableObjectEvent.js
      ├─ game/players/PlayerRuntimeFactory.js
      ├─ game/replay/CommandReplay.js
      ├─ game/physics/PlayerPhysics.js
      ├─ game/rope/FixedLengthRope.js
      ├─ game/world/WorldGenerator.js
      ├─ game/world/WorldTraversalValidator.js
      └─ game-kit/math/Vector2.js
```

## 실행 흐름

1. `InputSampler`가 키보드·마우스 또는 멀티터치 입력을 하나의 불변 스냅샷으로 만든다.
2. `GameApp`이 화면 좌표를 월드 좌표로 바꾸고 공용 `PlayerCommand`를 생성한다.
3. `InputDispatcher`가 명령을 소유 사용자의 `InputDrivenObject`에 배포하고, 각 입력 capability 믹스인이 자신이 담당하는 intent만 반영한다.
4. `FixedStepRunner`가 렌더 프레임과 무관하게 1/120초 단위로 게임 상태를 갱신하고, 각 월드 단계는 `SimulationDispatcher`로 해당 단계의 capability만 실행한다.
5. `GameRendererFactory`가 선택한 장면 렌더 프로필을 `CanvasRenderer`에 조립하고, `CanvasRenderer`는 시뮬레이션 스냅샷과 입력 표시 상태만 받아 화면을 그린다.

## 렌더링 프로필 경계

- `CanvasRenderer`는 Canvas context, DPR·resize, 화면/월드 좌표 변환과 HUD·오버레이를 소유하는 공통 호스트다. 월드 장면의 표현은 주입된 scene renderer에 한 번 위임한다.
- `GameRendererFactory`가 시작 시 렌더 프로필을 선택한다. 기본 프로필은 혼합 도트 표현인 `sprite`이며, 기존 표현은 `?renderer=polygon`으로 명시해 선택한다.
- scene renderer는 동일한 읽기 전용 scene snapshot과 viewport 계약을 받는다. 앱·시뮬레이션·네트워크 계층은 선택된 프로필이나 스프라이트 자산 형식을 해석하지 않는다.
- 도트 프로필은 별도 scene renderer로 제공한다. 프로필별 분기를 `GameApp`, `MultiplayerGameApp`, 시뮬레이션 객체에 흩뜨리지 않고 factory 등록 경계에서만 선택한다.
- `SpriteAnimation`은 프레임 사각형과 지속 시간을 불변 데이터로 보관하고 외부에서 받은 경과 시간으로 현재 프레임을 결정한다. `SpriteCanvasPainter`는 Canvas의 이미지 보간을 끄고 원본 프레임, anchor, 반전과 목적 크기만 그리며 자산 로딩이나 게임 시간을 소유하지 않는다.
- `PlayerSpriteManifest`는 도구 중립 manifest를 `PlayerSpriteDefinition`으로 정규화하고, definition은 atlas ID로 찾는 여러 source·atlas/frame·출력 크기, anchor·offset, 상태별 clip과 명시적 fallback을 하나의 불변 계약으로 검증한다. `SpriteImageAssetSet`은 모든 atlas의 준비·실패 상태와 ID별 이미지를 소유한다. player renderer는 frame에 기록된 atlas ID와 사각형만 소비하며 자산 배치나 생성 도구를 추측하지 않는다. 상세 교환 형식은 `sprite-asset-format.md`를 따른다.
- 그래픽 제작 원본과 납품은 `assets/artwork/<category>/<asset-id>/`, 게임이 직접 읽는 검증 package는 `assets/runtime/<category>/<asset-id>/`에 둔다. `RuntimeAssetCatalog`가 `characters`, `environments`, `objects`, `effects`, `ui` category와 안정적인 kebab-case asset ID를 URL로 바꾸며 renderer가 제작 경로나 임의 상대 경로를 조합하지 않는다. category별 manifest 의미와 validator는 분리한다.
- 오디오와 스프라이트 runtime package는 안정적인 asset ID와 주입 가능한 definition 선택 경계를 통해 조립한다. 향후 디버그 모드가 package를 교체해 비교할 수 있어야 하며 기본 catalog나 scene/audio host가 특정 mock ID에 영구 결합하지 않는다. 오디오는 공개 `loadAudioPackDefinition`의 pack·category override와 bootstrap의 `createAudioDefinitionLoader`를 회귀 테스트해 이 경계를 증명한다. package 선택은 표현 계층에만 영향을 주고 물리·충돌·전투·네트워크 상태를 바꾸지 않는다.
- 오디오 runtime manifest는 브라우저 파일과 load·loop 계약을 가진 `clips`, 볼륨 그룹·변형·동시발음 같은 표현 정책을 가진 `cues`까지만 소유한다. 게임 사건·읽기 전용 상태를 cue ID에 연결하는 `AudioEventBindings`는 package 밖의 조합 가능한 handler 경계이며 싱글·멀티 앱은 같은 `presentFrame`만 호출한다. gameplay·simulation 객체와 asset manifest는 서로의 구체 이름이나 파일 경로를 import하지 않는다.
- 오디오 cue는 비공간 `none` 또는 2D world-space `world` 정책을 가진다. BGM·UI는 비공간 경로, gameplay·ambience의 world cue는 로컬 플레이어를 listener로 한 좌우 pan과 거리 gain 경로를 사용한다. 화면 밖 필수 경고는 cue가 최소 gain을 선언할 수 있으며 첫 기반은 3D/HRTF를 사용하지 않는다.
- 브라우저 오디오는 모드 확정 사용자 동작에서 context 활성화를 시작하고 선택된 package의 필수 buffer decode와 media stream 재생 준비가 끝날 때까지 앱 시작을 보류한다. 게임 고정 스텝이나 멀티 서버 연결 완료를 오디오 활성화 수단으로 사용하지 않는다.
- manifest 자산은 기본적으로 필수이며 명시적인 선택 항목만 부분 실패를 허용한다. 필수 clip·cue 준비 실패는 선택 package를 사용할 수 없는 시작 오류이고, 선택 항목 실패는 해당 항목만 제외한 진단 상태다. build-time validator와 runtime loader가 같은 필수성·참조 무결성 계약을 사용한다.
- 오디오 mixer 설정은 dB를 공개 단위로 사용하고 Web Audio `GainNode`에 연결할 때 선형 gain으로 변환한다. 첫 mock의 게임플레이 우선 초기 프리셋은 master `-6 dB`, gameplay `0 dB`, UI `-4 dB`, ambience `-10 dB`, BGM `-8 dB`이며 master와 각 그룹은 음소거부터 `0 dB`까지만 사용자 조정한다. 이 값은 mixer topology나 manifest schema가 아니라 교체 가능한 초기 설정이므로 이후 청취 검증에서 조정할 수 있다.
- 사용자 설정 화면은 기능별 전용 팝업을 늘리지 않고 공용 탭 shell과 탭 등록 경계로 구성한다. 모드 선택 화면과 플레이 중 진입점은 같은 shell을 열며 첫 `오디오` 탭이 전체 음소거와 master·gameplay·UI·ambience·BGM 값을 편집한다. 그래픽을 비롯한 후속 탭은 `attach()` 뒤 독립 등록하고 탭 키보드의 좌우·Home·End 이동을 공유한다. UI 생성자는 DOM 탐색·listener·설정 구독을 시작하지 않고 명시적 `attach()`/`detach()`가 이를 소유한다. 오디오 설정 모델은 game state·asset package와 분리하고 버전형 `localStorage` 항목을 소유하며, 누락·손상·미지원 버전은 gameplay에 오류를 전파하지 않고 초기 프리셋으로 복구한다.
- 설정 UI는 필수 온보딩이 아니라 선택적인 보정 경로다. 기본 프리셋으로 대표 gameplay cue의 가청성, 그룹 우선순위와 master 헤드룸을 만족해야 하며 자동·수동 검증도 사용자 조정이 없는 기본 상태를 먼저 통과시킨다.
- audio voice manager는 cue별 `maxVoices`, emitter별 `retriggerCooldownMs`, `priority`와 전체 활성 voice 상한을 일반 정책으로 해석한다. 기본값은 cue당 4 voice, 같은 emitter당 40ms cooldown, 전체 32 voice이며 cue definition이 이를 덮어쓸 수 있다. 한도에 도달하면 가장 낮은 priority의 가장 오래된 voice를 먼저 교체하고, BGM과 loop는 명시적 lifecycle key별 singleton으로 관리한다. 이 정책은 gameplay event 종류를 해석하지 않는다.
- 고정 스텝의 scene 전달은 같은 lifecycle key·cue·gain·pan을 반복할 수 있다. audio voice manager는 이 입력을 멱등 처리해 새 Web Audio automation을 예약하지 않고, 실제 gain·pan이 달라질 때만 해당 `AudioParam`의 기존 예약을 취소한 뒤 현재 값으로 교체한다. frame 빈도를 낮추는 싱글·멀티 앱별 예외를 만들지 않고 공용 audio 경계에서 보장한다.
- audio host가 장시간 보관하는 동적 기록은 기본 논리 voice 32개, causal ID 256개, emitter cooldown key 512개, runtime failure 64개로 제한한다. clip·cue·variation 기록은 선택된 immutable definition 크기에 한정한다. buffer source의 `start()`가 graph 연결 뒤 실패해도 adapter가 active handle과 node를 즉시 해제하고 최초 오류를 caller에 보존한다. `stopAll`은 one-shot·loop를, `suspend`는 one-shot을 정리하고, `release`는 남은 voice·loop와 cooldown·variation·causal 추적 상태까지 결정적으로 비운다.
- cue variation은 제작된 clip 목록과 가중치를 우선하며 둘 이상의 후보가 있을 때 가능한 한 직전 clip의 연속 선택을 피한다. pitch·gain randomization은 기본값이 0이고 cue가 명시한 buffer one-shot에만 적용한다. 권장 범위는 pitch `±2%`, gain `±1 dB`, validator 상한은 `±5%`, `±3 dB`이며 BGM·loop에는 적용하지 않는다. 선택기는 주입 가능한 난수원을 받아 반복 회피와 범위를 결정론적으로 검증할 수 있어야 한다.
- audio transition controller는 기본적으로 BGM 1.5초, ambience 1초 crossfade와 일반 loop 250ms start/stop fade를 적용한다. lifecycle key는 논리적으로 singleton을 유지하며 crossfade 구간에만 outgoing·incoming source의 물리적 중첩을 허용한다.
- ducking은 cue가 대상 mixer group, 감쇠량과 attack/release envelope를 선언한 경우에만 동작한다. 기본은 off이고 첫 권장값은 BGM `-6 dB`, ambience `-3 dB`, attack 50ms, release 400ms다. transition·ducking 계층은 gameplay event 이름을 해석하지 않는다.
- audio lifecycle host는 `document.hidden`과 `pagehide`에서 AudioContext·media stream을 일시정지하고 one-shot voice를 폐기한다. window `blur`만으로는 오디오를 정지하지 않는다. 문서 복귀는 누락된 과거 사건을 replay하지 않고 최신 읽기 전용 scene state에서 필요한 BGM·ambience·loop lifecycle을 재조정한다. 준비 뒤 media `play()`가 사용자 활성화 제약으로 거부된 경우도 실패 voice를 정리하고 `suspended`로 전이해 다음 사용자 동작에서 재시도하며 UI에는 작은 재개 안내만 노출한다.
- world spatializer는 source의 수평 offset을 visible world bounds의 listener 중심→화면 가장자리에서 `0→±1`로 정규화해 stereo pan을 clamp한다. 2D 월드 거리는 160까지 `0 dB`, 160~1200에서 dB 선형으로 `-36 dB`까지 감쇠하고 그 밖에서는 무음이다. 필수 경고 cue의 기본 `minGainDb` `-18 dB`는 거리 감쇠 결과의 floor이며 사용자·그룹 gain을 우회하지 않는다.
- 첫 mock binding은 `ui-confirm`, `gameplay-rope-attach`, `gameplay-weapon-fire`, `gameplay-player-hit`, `gameplay-checkpoint-reached`, `ambience-altitude-wind`, `bgm-climb`, `bgm-run-complete`의 8개 cue로 계약을 검증한다. UI 확인, 로컬 rope attach 전이, 예측·공유 projectile spawn, 피해 클라이언트의 즉시 impact와 공유 확정, checkpoint 진행, running ambience, climb/completed BGM state를 정규화된 audio request로 바꾼다. causal ID dedupe는 binding/host 경계에서 수행하고 이 mock ID 집합을 최종 시나리오나 core event enum으로 승격하지 않는다.
- audio clip은 manifest의 명시적 `playback: buffer|stream`을 사용하며 loader가 category·파일 크기·duration으로 재생 방식을 추론하지 않는다. source 배열은 MIME 우선순위 fallback이고 source별 timeout은 15초다. buffer 준비는 fetch와 0초보다 긴 `AudioBuffer` decode 완료, stream 준비는 지원 source 선택·metadata·`canplay`와 media-element graph 연결 완료다. 모든 source가 실패하면 기존 required 정책에 따라 package 시작 오류 또는 선택 clip 진단으로 분기한다.
- audio resource category는 `gameplay`, `ui`, `ambience`, `bgm`으로 제한하고 각각 `assets/runtime/audio/<category>/<asset-id>/audio-manifest.json` package로 관리한다. `assets/runtime/audio/packs/<pack-id>/audio-pack.json`은 category·stable asset ID package 참조만 조합하며 cue·clip 정의나 `AudioEventBindings`를 복제하지 않는다. aggregate validator는 category, 참조, 중복 tuple과 pack 전체 cue ID 유일성을 검사한다. 주입 경계는 전체 pack 또는 특정 category package 선택으로 새 immutable audio definition을 만들 수 있어야 한다.
- audio readiness는 `loading|ready|degraded|suspended|failed`의 읽기 전용 진단 상태를 제공한다. 일반 시작 UI는 진행률과 필수 실패의 원인·재시도·메뉴 복귀만, 오디오 설정 탭은 선택 실패가 있을 때 `일부 음원 사용 불가` 요약만 표시한다. `?metrics=1` 및 진단 복사는 pack/package ID, AudioContext 상태, 준비 실패와 runtime `play()` 실패의 clip·cue·코드, required/optional 준비 수, 그룹별 활성 voice 수와 cooldown drop·voice stealing 누계를 소비한다. 진단 값은 mixer·gameplay 정책을 자동 변경하지 않는다.
- required stream이 모든 source fallback과 timeout 뒤에도 준비되지 않으면 다른 group이 ready여도 package 상태는 `failed`이며 앱 시작을 차단한다. 자동 `degraded` 시작이나 사용 시점까지의 지연 준비는 허용하지 않고, manifest가 `required: false`로 명시한 항목만 제외 후 `degraded`로 시작할 수 있다.
- 애니메이션 전이는 재사용 가능한 순수 `StateMachine` 조합 컴포넌트가 현재 상태·상태 경과 시간·허용 전이를 소유하고, actor별 resolver가 읽기 전용 snapshot과 표현 사건을 상태 머신 입력으로 바꾼다. clip catalog와 painter는 확정된 상태를 소비할 뿐 gameplay 조건을 다시 해석하지 않는다.
- `hit`·`respawn`처럼 순간적인 actor 표현은 기존 권위 사건의 대상 `playerId`를 보존한 renderer 전용 presentation event에서 시작한다. 로컬과 원격 actor가 각자 FSM으로 재생하며 animation state·phase를 네트워크 snapshot의 권위 상태로 만들지 않는다.
- 피해 클라이언트의 즉시 impact와 뒤이은 서버 확정은 투사체·부활 원인의 같은 causal ID로 presentation event를 정규화해 한 번만 재생한다. 서버 확정이 로컬 `hit`·`respawn` 시간을 다시 시작하지 않는다.
- 순간 표현 상태는 지속 locomotion 상태보다 높은 우선순위로 제한된 시간 동안 재생하고 종료 시 최신 snapshot으로 지속 상태를 다시 계산한다. 이 전이는 physics·input clock을 정지하거나 되감지 않는다.
- actor facing과 animation phase는 renderer가 actor ID별로 보관하는 표현 상태다. snapshot의 움직임으로 방향을 갱신하되 정지·순간 상태에서는 마지막 방향을 유지하고 네트워크에 frame·phase·facing을 전송하지 않는다.
- 싱글의 로컬 플레이어는 `PlayerPhysics`의 prototype getter로 각도를 제공하고 멀티 플레이어는 직렬화 가능한 상태 필드로 각도를 제공할 수 있다. 하위 player renderer는 actor ID 선택과 상태 객체를 분리해 다루며 상태를 object spread로 복제하지 않는다. sprite와 polygon 구현은 모두 전달받은 `angle`을 몸체 중심 변환에 적용하고 `GameApp`·`MultiplayerGameApp`에 모드별 렌더 분기를 만들지 않는다.
- sprite definition의 source·출력 크기·anchor는 표현 계약이고 collider의 크기·형태는 플레이어 런타임 조립이 선택하는 게임플레이 계약이다. 에셋이나 렌더 프로필 교체가 collider를 암묵적으로 바꾸지 않으며 scene snapshot은 필요할 때 두 계약의 결과를 읽기 전용으로 전달한다.
- `PlayerRuntimeFactory`는 공개 `Collider` 계약의 구현을 플레이어 물리에 조립한다. 첫 구현은 `CircleCollider` 하나이며 이동·로프 capability와 지형·플레이어 충돌 계산은 구체 반지름 대신 조립된 collider 계약을 사용한다.
- scene profile은 배경·지형·로프·actor·world VFX 레이어의 조합이다. 혼합 도트 프로필은 공용 폴리곤 레이어와 sprite actor 레이어를 조립하며 `PolygonSceneRenderer` 전체를 복사하거나 상속 override하지 않는다.
- scene composer는 조립된 하위 renderer 목록을 안정된 순서로 순회해 호출할 뿐 profile 또는 actor kind 분기를 하지 않는다. player, enemy, player projectile, enemy projectile과 환경·로프·VFX renderer가 자기 collection의 실제 그리기를 소유하고 profile factory가 polygon/sprite 구현을 교체 조립한다.
- 도트 환경도 `backdrop`, collision-aligned `terrain`, non-collision `decoration` 하위 renderer로 조립한다. 상위 composer는 profile·구역·atlas 종류를 분기하지 않으며 각 component가 고도 구역 해석과 실제 Canvas 그리기, 자기 asset 준비 상태와 fallback을 완결한다. 정식 리소스 교환 계약은 `environment-asset-format.md`를 따른다.
- 도트 terrain은 `WorldGenerator`가 만든 surface vertices를 새 도형으로 근사하지 않고 같은 polygon clip과 외곽선에 사용한다. one-way 표현도 같은 vertices의 `0..oneWayEdgeEnd` chain만 그린다. decoration은 충돌 상태를 추가하지 않고 이동 경로 밖 또는 배경 깊이에 결정적으로 배치한다.
- 환경 asset 실패는 scene 전체가 아니라 component별로 격리한다. backdrop 실패는 polygon backdrop, terrain 실패는 polygon world geometry로 각각 대체하고 decoration 실패는 장식만 생략한다. pending load를 실패로 고정하지 않으며 실제 실패 전이에 한 번만 경고하고 `?metrics=1`에 component와 atlas ID를 노출한다.
- 싱글과 멀티 앱은 같은 scene snapshot과 renderer composition을 사용한다. 환경 상태나 진단을 전달하려고 `GameApp`과 `MultiplayerGameApp`에 같은 plumbing을 복제하지 않고 Canvas host 또는 환경 하위 renderer의 공용 계약에서 읽는다.
- `CanvasRenderer`는 CSS viewport와 camera에서 한 프레임당 한 번 `visibleWorldBounds`를 만들고, 화면 가장자리 pop-in을 막는 96 world-unit margin을 더한 `worldBounds`를 불변 viewport로 전달한다. 상위 composer는 객체 종류를 판단하지 않으며 terrain·decoration·enemy·projectile 하위 renderer가 자기 객체의 bounds와 교차 여부를 계산해 draw를 생략한다. polygon과 sprite profile, 싱글과 멀티는 같은 viewport 계약을 사용한다.
- collision surface의 bounds·edge geometry와 seed 기반 decoration placement처럼 월드가 유지되는 동안 변하지 않는 표현 계산은 해당 하위 renderer가 world와 zone을 캐시 키로 보관한다. camera 이동은 배치를 다시 만들지 않고 가시 객체만 다시 선택하며, world 또는 고도 zone이 바뀔 때만 관련 캐시를 갱신한다.
- Canvas backing store는 기기 DPR을 그대로 곱하지 않는다. 기본 정책은 DPR 최대 `2`, backing pixel 최대 `3 * 1024 * 1024`이며 두 제한과 CSS 크기 중 가장 낮은 유효 배율을 사용한다. CSS 면적 자체가 예산보다 큰 경우 선명도를 더 낮추기 위해 DPR 1 아래로 내리지 않는다. 정책은 `GameRendererFactory`의 `canvasOptions.performancePolicy`로 주입할 수 있고 painter의 image smoothing 비활성 계약은 유지한다.
- `RenderPerformanceMetrics`는 rAF 시작 간격 p50/p95와 최대값, Canvas draw 구간 p50/p95와 최대값, 최근·누적 dropped fixed steps, CSS/backing 크기, 실제·유효 DPR과 하위 renderer별 `drawn/total`을 읽기 전용 진단으로 집계한다. `?metrics=1` 패널과 진단 복사만 이 값을 소비하며 시뮬레이션 속도, 네트워크 권한 또는 렌더 품질을 자동 조정하지 않는다. 물리는 화면 주사율과 무관하게 기존 120Hz fixed step을 유지한다.
- bootstrap 기본 프로필은 `sprite`이며 query의 `renderer=polygon`이 기존 표현을 명시적으로 선택한다. 알 수 없는 값은 경고 후 기본 프로필을 사용한다. sprite asset 준비 실패는 앱을 중단하지 않고 하위 fallback renderer가 전체 polygon scene을 그리며 진단 가능한 경고를 남긴다.
- 렌더 프로필 교체는 물리·전투·입력·권위 snapshot·네트워크 메시지 계약을 바꾸지 않는다.

## 플레이어 강체 회전과 손 로프 관절

플레이어 물리는 상속 mixin이 아니라 강체에 필요한 요소를 조립하는 Has-A 구조를 사용한다.

- `PlayerPhysics`는 선형 위치·속도를 소유하고 `AngularMotion`과 공개 `Collider`를 각각 조합한다. `AngularMotion`은 각도, 각속도, 관성, 각 감쇠, 점 속도와 점 충격 계산을 담당한다. collider 형상은 계속 `PlayerRuntimeFactory`에서 독립적으로 교체할 수 있으며 몸체 회전이 원형 collider를 암묵적으로 바꾸지 않는다.
- `Collider`는 겹침·해결뿐 아니라 대상 방향의 형상 바깥 점을 구하는 `outsidePointToward(center, target, clearance)`도 제공한다. 자동 무기는 구체 원형 반경을 읽지 않고 이 계약으로 발사체 반경과 여유를 포함한 총구 위치를 구하므로, collider 형상을 교체해도 몸 중심 발사나 renderer별 보정이 생기지 않아야 한다.
- `FixedLengthRope`는 플레이어 강체의 일부나 상속 mixin이 아니라 외부 joint다. world anchor, 몸체 local-space의 `attachmentOffset`, 고정 길이와 장력을 소유하고 손 관절점의 위치·속도 제약을 푼다. 제약 충격은 중심 선속도와 `r × impulse / inertia` 각속도에 함께 반영한다.
- 손 관절점은 부착 순간 anchor 쪽 손을 선택해 local offset으로 고정한다. 이후 몸체 각도에 따라 world-space 손 위치가 회전하며 공용 rope renderer, 스윙 입력, 투사체-로프 충돌도 같은 `ropeAttachmentPoint()` 계산을 사용한다.
- 로프 해제는 각속도를 제거하지 않는다. 게임 조작 체감을 위해 손끝 접선 속도의 `releaseAngularTransfer` 비율을 중심 선속도에 추가하는 명시적 게임플레이 보정만 적용한다. 이 비율은 joint solver나 collider에 숨기지 않는다.
- 지면 접촉 중에는 `angle = 0`을 향한 복원 토크와 각 감쇠를 적용하고, 공중에서는 약한 각 감쇠만 적용한다. 따라서 지면에서는 오뚜기처럼 서고 매달린 동안에는 joint torque를 유지한다.

이 구조는 다음 공식 물리 엔진 계약을 기준으로 삼는다.

- [Box2D Body API](https://box2d.org/documentation/group__body.html): body가 선속도·각속도와 점 force/impulse를 소유하며 중심 밖 힘이 torque를 만든다.
- [Rapier rigid-bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/): rigid body는 동역학·운동학을 소유하고 collider는 형상과 질량 특성을 제공하도록 별도 부착한다.
- [Rapier joints](https://rapier.rs/docs/user_guides/javascript/joints/): joint는 각 body의 local anchor를 연결하는 독립 제약이다.
- [Unity Rigidbody2D](https://docs.unity3d.com/ScriptReference/Rigidbody2D.html): 위치·회전·선속도·각속도·관성을 한 강체 운동 상태로 제공하고 collider를 별도 부착한다.

따라서 각운동을 클래스 상속 mixin으로 주입하지 않는다. 새 강체 유형도 `AngularMotion`·`Collider`·joint를 필요한 조합으로 소유하고, input/simulation capability mixin은 기존처럼 실행 라우팅 책임에만 사용한다.

## 게임 객체 모델

```text
GameObject
├─ InputDrivenObject ── 소유 사용자 입력에 즉시 반응
│  ├─ PlayerObject + LocomotionInput
│  └─ RopeObject   + RopePointerInput
└─ SimulationDrivenObject ── 직접 입력 없이 고정 스텝에서 진행
   ├─ EnemyObject             + EnemyWeaponSimulation
   ├─ AutomaticWeaponObject   + AutomaticWeaponSimulation
   ├─ HomingProjectileObject  + ProjectileMotion + EnemyHitPrediction
   └─ BallisticProjectileObject + ProjectileMotion + PlayerImpactPrediction

InputSampler → 불변 입력 프레임 → InputDispatcher
                                  └─ capability가 있는 소유 InputDrivenObject만 호출
고정 스텝 단계 → capability ID → SimulationDispatcher
                                  └─ 해당 capability가 있는 SimulationDrivenObject만 호출
```

- `InputDrivenObject`와 `SimulationDrivenObject`는 실행 위치가 아니라 상태 변화 원인의 Is-A 정체성이다. 서버는 입력 주도 객체 claim을 검증할 복제 상태를 가지며 클라이언트는 시뮬레이션 주도 객체를 표시·보간할 복제 상태를 가질 수 있다.
- 플레이어와 로프는 별도 `InputDrivenObject`다. 플레이어는 물리·체력·아티팩트를 Has-A로 소유하고, 로프는 부착·장력·드래그 상태를 독립 소유한다. 소유 관계는 ID와 공개 계약으로 연결한다.
- 적과 직접 조작하지 않는 자동 행동 객체는 `SimulationDrivenObject`다. 서버가 진행하되 플레이어 피격처럼 사용자 체감과 만나는 사건은 피해 클라이언트가 먼저 반응하고 서버가 권위 객체 상태로 검증한다.
- 멀티는 권한 감각만 보면 P2P형이다. 플레이어별 `InputDrivenObject` 결과는 해당 소유자·피해자 클라이언트가 먼저 결정하고, 특정 클라이언트에 귀속할 수 없는 몹과 적 투사체 같은 `SimulationDrivenObject`의 생성·궤적은 서버가 중립적으로 진행한다. 서버는 지연된 플레이어 복제 위치로 충돌을 먼저 확정하지 않고 피해 클라이언트 claim을 중립 객체 상태로 검증한다.
- 사건 전파와 지속 상태 수렴을 같은 것으로 취급하지 않는다. `InputDrivenObject`의 지속 상태는 인증·형식·세션 tick 검사를 통과한 최신 `owner-motion`을 값의 크기와 무관하게 서버와 동료가 따라가고, `SimulationDrivenObject`는 서버 상태를 모든 클라이언트가 따라간다. 원격 플레이어 위치는 상태가 실제 생성된 `ownerMotionTick` 표본 사이를 보간하고 공용 입력 선행 tick으로 서버 표시 시계와 정렬하며, 적은 `serverTick` 표본을 사용한다. 중복·역순·세션 범위 밖 owner tick은 성공한 no-op으로 무시하고 소유자는 어떤 `owner-motion` receipt에도 서버 지연 위치로 되감기거나 미확정 입력을 재실행하지 않는다.
- 로프 스윙처럼 입력 capability가 플레이어의 지속 전투 상태도 바꾸면 소유 클라이언트와 서버 검증 복제본이 같은 `GameSimulation` 도메인 메서드를 사용한다. 소유 클라이언트는 강화 시간과 무기 파라미터를 즉시 작성하고, 서버는 별도 swing claim을 검증해 다른 복제본에 공유한다. 같은 틱 자동 발사는 swing claim 뒤에 공유해 양쪽 피해량 계산의 원인이 일치한다. 정상 스냅샷은 소유자의 강화 타이머를 다시 쓰지 않는다.
- 예측 객체의 생성과 그 입력이 바꾸는 소유자 상태는 하나의 prediction ID 수명주기로 관리한다. 자동 발사는 탄환과 무기 쿨다운을 함께 적용하고 로프 스윙은 강화 직전·직후 타이머를 함께 보존한다. 여러 동종 claim이 pending이면 앞 거절은 후속 효과를 지우지 않고 후속 prediction의 이전 값만 거절된 원인이 없었던 시간축으로 재기준화한다. 마지막 거절에서 최초 준비 상태로 복구한다. 승인 receipt는 공유 확인일 뿐 소유자 상태를 서버 스냅샷으로 교체하는 전이가 아니다.
- 피해 결과는 projectile ID를 수명주기 키로 사용한다. `OwnerPredictionRuntime`은 `GameSimulation`의 공용 피해 전이로 넉백·HP·무적·치명 체크포인트 부활·아티팩트 손실 또는 로프 절단을 즉시 적용하고, pending 기록은 중복 억제와 승인 resolve 대응에 사용한다. 승인 receipt는 resolve 사건까지 기록을 유지하고, 거부 receipt는 pending 기록만 정리하며 이미 인식한 피해 상태를 복원하지 않는다. 피격 전 상태와 tick·발생 순서는 체크포인트처럼 별도의 복구 가능한 전이를 되돌릴 때 이후 pending impact를 재실행하는 기준으로만 사용한다. 전송 계층은 HP나 물리 역연산을 구현하지 않는다.
- 체크포인트처럼 `InputDrivenObject`의 위치가 공용 월드 전이를 만나는 사건은 소유 클라이언트가 로컬 시뮬레이션의 진행도·보상·로프 상태를 먼저 전이하고 claim을 만들며 서버가 공용 상태를 멱등 확정한다. 체크포인트와 뒤따르는 피격은 같은 예측 시간축에 있어 치명 피격이 새 활성 지점을 즉시 사용한다. 거절 시 이전 진행도·소유자 상태에서 이후 입력과 pending impact를 재실행한다. 서버 복제 시뮬레이션은 같은 위치 조건으로 별도 사건을 시작하지 않으며 싱글 자동 감지와 클라이언트 예측·서버 claim은 하나의 도메인 활성화 메서드를 공유한다.
- 저작 영역의 `areaId`는 UI·게임 진행을 위한 논리 상태이며 물리 월드나 멀티플레이 권한 구역을 분할하지 않는다. 열린 Gate는 이 공용 월드 좌표계 안의 지속 단방향 포탈이다. 첫 진입자의 문 내부 진입으로 `gate-crossed`가 공용 진행을 한 번 확정하지만 그 플레이어만 이동하고, 뒤의 플레이어는 같은 열린 문에 직접 들어올 때 각각 `gate-portal-entered` 사건으로 이동한다. 각 플레이어는 자기 사건의 결정적 도착 좌표와 tick을 `GameSimulation.applyPortalTransition()`에 한 번 적용해 위치·속도·회전·접지·로프·포인터 버퍼·일시 전투 타이머와 무기 재사용 대기를 초기화하되 체력·생명·아티팩트·무기 수치·체크포인트·월드 객체 상태는 유지한다. 이미 같은 Gate를 로컬 예측한 클라이언트는 서버 확정에서 초기화를 반복하지 않는다. 서버는 전이를 일으킨 owner-motion tick 이하의 중복·역순 상태만 성공한 no-op으로 무시하고, 원격 상태 버퍼는 해당 플레이어의 포탈 tick 전후 표본을 서로 보간하지 않는다.
- 저작 영역의 출구는 `선행 objective 집계 → gate-panel interaction objective → Gate unlock`의 공통 계약을 사용한다. 시나리오별 선행 objective는 이동·상호작용·증강 선택 등으로 달라도 문을 여는 마지막 입력은 Gate 옆 `gate-panel` 조작으로 통일한다. `WorldProgressState`는 패널 objective의 `requiredObjectiveIds`를 직접 검증하고 snapshot 복원에서도 선행 목표 없는 완료 상태를 거부한다. `AuthoredWorldAssembler`는 각 `area.bounds`의 좌우에 비부착 `area-boundary-wall`, 상단 Gate 개구부 좌우에 `inter-floor-divider` 충돌면을 항상 만들며, `WorldGateGeometry`는 잠긴 Gate의 중앙 barrier만 추가한다. 따라서 방 바깥이나 층 경계로 돌아갈 수 없고 문 안 포탈만 다음 영역 진입로가 된다.
- 저작 사각 surface와 world object의 `position`은 `coordinateAnchor`가 가리키는 부착점이다. `AuthoredCoordinateAnchor`는 `top|center|bottom × left|center|right`의 아홉 이름을 정규화하고 사각형 bounds를 계산한다. 수평 보행 발판과 위에서 아래로 뻗는 천장 구조는 `top-center`, 바닥에서 위로 서는 Gate·패널과 수직 고정 구조는 `bottom-center`, 그래플 표식처럼 자유 배치되는 정사각형은 `center`를 사용한다. `rectangle()`은 기준점·크기로 collision vertices를 만들고 `AuthoredWorldAssembler`는 vertices와 기준점을 같은 Y offset으로 이동한다. world-object presentation은 같은 기준점·표현 크기로 컬링 bounds와 실제 draw bounds를 계산한다. 개별 영역이나 renderer에 층별 Y 오프셋을 추가하지 않으며, 바닥 고정 오브젝트는 그 기준점이 실제 renderable surface의 `topY`와 일치하는지 회귀 검증한다.
- 현재 저작 시나리오의 영역 도달은 objective·Gate 패널·포탈 사건으로 진행하고 `sector-02-08`에서는 content boundary에 머문다. 과거 절차 월드용 summit claim은 호환 코드로만 남아 있으며 최종 시나리오의 엔딩 진입 조건이 확정되기 전까지 기본 제품 테스트 계약으로 사용하지 않는다.
- 입력과 시뮬레이션 capability는 `Base => class extends Base` 믹스인으로 구현한다. 이동·점프는 `LocomotionInput`, 로프는 `RopePointerInput`, 자동 무기·적 공격은 각자의 capability 계약을 가진다. 투사체 종류는 같은 `projectile-motion`과 `client-projectile-collision` ID 아래에 서로 다른 운동·충돌 믹스인을 조합한다. 두 디스패처는 구체 클래스나 `instanceof` 분기 없이 capability 존재 여부로 전달한다.
- `SimulationDispatcher`는 월드 단계가 지정한 capability ID만 실행한다. 한 객체에 운동과 충돌처럼 여러 능력이 조합돼도 현재 단계와 무관한 능력을 실행하지 않으며, `GameSimulation`과 `CombatSystems`는 단계 순서와 context만 조정한다. `PredictableProjectileStore`는 객체 등록·prediction ID와 authority ID 대응·사건 전달만 담당하고 투사체 종류별 충돌이나 거부 정책을 분기하지 않는다.
- 싱글은 입력 주도 역할과 시뮬레이션 주도 역할이 한 프로세스에 함께 있을 뿐 같은 객체 분류와 디스패치 경계를 사용한다. 멀티는 그 경계 사이에 입력·claim·snapshot 전송만 추가한다.
- `GameSimulation`은 객체별 게임 규칙을 직접 모으는 거대 분기점이 아니라 월드 등록, 고정 tick, 객체 단계 실행과 사건 연결을 조정하는 월드 스케줄러로 축소한다. 투사체 spawn 사건도 종류를 검사하지 않고 객체의 `replicationState(tick)` 계약을 사용한다.
- `OwnerPredictionRuntime`은 소유 `InputDrivenObject` 집합의 입력 이력·예측 tick·claim 수명·별도 rollback 계약이 있는 사건 전이·표시 보정만 조정한다. `owner-motion` receipt는 소유 상태 복원·입력 재실행을 시작하지 않는다. 정상 공유 스냅샷은 `applySharedOwnerProgress()`로 검증된 아티팩트·무기 파라미터 같은 협동 진행 정보만 흡수하고 HP·피격 무적·생명·로프·쿨다운·시간 제한 강화는 쓰지 않는다. 이동·로프·전투 규칙은 런타임에 넣지 않고 객체 capability와 시뮬레이션 단계에 둔다.

### 적용된 마이그레이션 순서

1. 기존 플레이어·로프·2인 동기화·부활 동작을 회귀 테스트로 고정한다.
2. `GameObject`, `InputDrivenObject`, `SimulationDrivenObject`와 capability 기반 `InputDispatcher` 계약을 추가한다.
3. 플레이어 이동·점프와 로프 입력을 별도 `InputDrivenObject`와 입력 믹스인으로 옮긴다.
4. 적·자동 무기·투사체를 `SimulationDrivenObject`로 분류하고 구체 행동을 capability 믹스인과 선택적 `SimulationDispatcher` 실행 단계로 옮긴다.
5. `OwnerPredictionRuntime`으로 입력 주도 객체 예측 경계를 통합하고 구체 플레이어 종류별 분기를 제거한다.
6. 단일 `updatePlayer()` 경로를 제거하고 소유자 입력 디스패치, 소유자 상태 진행, 시뮬레이션 주도 자동 무기 단계를 분리한다.

## 입력 규칙

- PC: A/D 또는 방향키 이동, W 또는 위 방향키 점프, 마우스 누르기·드래그·해제로 로프 조작
- 모바일 가로 화면: 화면 하단 중앙에 `좌 이동 · 점프 · 우 이동` 조작 바를 배치한다. 점프는 화면 폭의 40%이며 좌우 버튼과 4~8px 간격을 둔다. 세 버튼을 제외한 화면은 로프 부착·드래그·해제에 사용한다.
- 모바일 이동·점프는 PC 키보드와 동일한 `horizontal`, `vertical` 명령을 만들며 별도 게임 규칙을 두지 않는다.
- 버튼 판정과 Canvas 표시는 `MobileControlLayout`의 같은 사각형 정보를 사용한다.
- 로프 손가락은 `pointerId`로 추적하며 다른 터치가 기존 로프 조작을 빼앗지 않는다.
- 모바일 로프 조준점은 별도 위치 보정 없이 손가락이 닿은 실제 지점을 가리킨다.
- 스윙 드래그 임계값은 고정 픽셀이 아니라 현재 Canvas의 짧은 변에 대한 비율로 계산한다. 화면 크기는 `PlayerCommand.viewport`에 포함되어 권한 주체에서도 같은 판정을 재현한다.
- 활성 로프 드래그가 브라우저 상단 UI로 빠지는 `pointerleave`, `pointercancel`, 창 포커스 상실 또는 문서 숨김으로 끝나면 로프 유지가 아니라 사용자의 해제 의도로 처리한다. 입력 상태를 먼저 정리하고, 렌더 프레임이 멈추기 전에 싱글의 공용 시뮬레이션과 멀티의 로컬 예측·즉시 전송을 한 번 실행한다. 화면 안의 정상 `pointerup`은 기존 고정 스텝에서 처리한다.

모바일 coarse pointer 환경에서는 카메라 배율을 0.72로 낮춰 데스크톱보다 약 39% 넓은 월드 범위를 표시한다. 이때 화면 좌표와 월드 좌표 변환도 같은 배율을 사용하며, 플레이 공간을 확보하기 위해 데스크톱용 상단 상태 HUD는 그리지 않는다.

## 현재 게임 시스템

- `CURRENT_AUTHORED_AREA_CATALOG`와 `assembleAuthoredWorld()`가 Sector 01·02의 저작 영역을 하나의 연속 좌표계로 조립한다. `GameSimulationFactory`는 seed와 world revision으로 같은 catalog를 선택해 싱글·멀티가 동일한 정의를 재현하게 한다.
- `GameSimulation`이 저작 영역의 목표·Gate·content boundary와 플레이어별 진행 상태를 권위 상태로 보존한다.
- 사망 재개는 월드와 체크포인트 진행도를 유지한 채 활성 지점으로 복귀하고, `ArtifactInventory`의 결정적 정책으로 최근 아티팩트 약 1/3만 제거한다.
- 첫 체크포인트의 아티팩트 선택도 `PlayerCommand`의 좌우·점프 명령을 사용하며, 선택 중에는 `GameSimulation`이 물리와 전투를 일시 정지한다.
- 아티팩트 획득·손실 정보는 `eventFlash`의 일시 이벤트로 렌더러에 전달하며, 영구 보유 상태와 분리한다.
- `rewardedCheckpointIds`가 체크포인트별 보상 수령 여부를 권위 상태로 보존해 재방문과 사망 복귀의 중복 지급을 막는다.
- `npm test`의 current authored world 검증은 area catalog의 연결·출구 참조·Gate 진행과 마지막 content boundary를 확인한다. 절차형 48단계 경로의 시드 sweep은 현재 제품 검증에 포함하지 않는다.
- `RunMetrics`는 렌더러나 입력 장치가 아니라 `GameSimulation`의 실제 이벤트에서만 증가한다. 사망 횟수는 호환 필드 `defeats`에 기록하며 사망·부활로 공용 월드 시간을 멈추지 않는다.
- `?metrics=1`은 `GameApp`과 렌더러에만 전달되는 옵트인 개발 표시이며 `PlayerCommand`나 게임 규칙에 포함하지 않는다.
- 사망·낙사는 `GameSimulation.respawnPlayerAtCheckpoint` 하나로 처리한다. 사망한 플레이어의 물리·입력·체력·아티팩트만 초기화하며 동료와 공용 월드는 계속 진행한다.
- 체크포인트 보상은 플레이어별 선택 상태만 소유하며 `GameSimulation`의 시간·전투를 멈추지 않는다. 선택 중인 플레이어의 메뉴 입력만 중립 게임 명령으로 치환한다.
- 보상 Canvas 오버레이는 반투명 배경과 실시간 전투 경고를 사용해 선택 카드와 진행 중인 위험을 동시에 보여준다.
- `CommandReplay`는 게임 규칙 밖에서 불변 명령 타임라인을 기록·재생하고 권위 스냅샷의 결정성 다이제스트를 비교한다.
- `PlayerCommandBatch`는 목표 틱과 플레이어별 단조 증가 `sequence`를 보존하고 플레이어 ID 순으로 정규화하는 전송 계약이다. 권위 서버는 이 순서 번호로 중복·역순 입력을 거부한다.
- `AuthorityCommandInbox`는 승인 순서와 허용 틱 범위를 검사하고, 승인된 명령을 목표 틱별로 한 번만 제공한다. 이 상태는 게임 규칙이 아니라 권위 전송 경계에 머문다.
- `WorldSnapshotEnvelope`는 승인 번호, 중립 월드의 `serverTick`, 각 플레이어 상태를 만든 `ownerMotionTick`, 비예측 상태와 권위 이벤트를 묶고 예측 가능한 객체의 반복 위치 배열을 거부한다.
- `AuthoritySnapshotBuilder`는 로컬 렌더 스냅샷과 별도로 플레이어·적·진행 상태만 추출한다. 지형은 월드 시드와 생성 revision으로 재구성하고 투사체는 drain한 이벤트로만 전달한다.
- 멀티 연결 종료는 게임을 멈추고 모드 메뉴로 돌아가며 마지막 4자리 채널을 입력란에 보존한다. 자동 오프라인 진행이나 플레이어 런타임 복원은 하지 않는다.
- `PlayerRuntimeFactory`는 `PlayerObject`, 별도 `RopeObject`, `AutomaticWeaponObject`와 Has-A 컴포넌트를 조립하고 소유자별 `InputDrivenObject` 등록 목록을 반환한다. 객체 종류별 규칙을 팩토리에 넣지 않는다.
- `GameSimulation.addPlayer()`는 같은 팩토리 결과를 공용 `players` 배열에 등록한다. 생성자의 첫 플레이어도 이 경로를 사용하고 그 ID만 비공개 기본 플레이어 식별자로 보존한다.
- 조준점, 부착 후보, 포인터 전이, 부착 버퍼와 스윙 드래그는 `RopeObject`가 소유한다. 로프 연계 강화 시간은 전투 효과를 받는 `PlayerObject`가 소유하며 첫 플레이어의 컴포넌트를 중복 가리키는 싱글 호환 필드는 두지 않는다.
- 외부 실행 계층은 `getPrimaryPlayerId()`, `playerState()`·`playerStates()`, `applyOwnerMotion()`, 예측 복원·진행·피격·충돌 명령을 사용한다. 서버 세션과 로컬 예측기는 `players` 배열이나 플레이어 컴포넌트를 직접 수정하지 않는다.
- 이동·점프와 로프 입력은 각각 `LocomotionInput`, `RopePointerInput` capability로 전달한다. 적 공격·자동 무기·양측 투사체 운동과 클라이언트 충돌도 각 `SimulationDrivenObject`의 capability로 한 번만 구현하며, `GameSimulation`은 소유자 입력 그룹과 이름 있는 시뮬레이션 단계를 일정 순서로 실행한다. 실행 위치는 Is-A 정체성과 별개이므로 서버가 궤적을 진행하는 투사체도 피해·공격 클라이언트에서 `client-projectile-collision` capability를 실행할 수 있다.
- `stepCommandBatch`는 싱글과 소유 클라이언트 예측에서 정확히 다음 틱의 플레이어별 명령을 같은 `players` 배열에 적용한다. 로컬 예측은 `InputStateSimulator`로 마지막 입력을 제한된 틱 동안 유지하고, 만료 뒤에는 이동 축을 중립화하되 마지막 포인터·viewport·조준 상태를 보존한다. 멀티 서버는 같은 스케줄러를 `advanceInputDrivenObjects: false`로 실행해 플레이어·로프 입력 물리를 다시 적분하지 않고 최신 적용 `owner-motion`을 연속 상태 원점으로 유지한다.
- `PlayerCommand.interact`는 Gate 패널 같은 근접 문맥 상호작용 의도다. `InputSampler`는 PC `W/↑`와 모바일 점프 버튼을 점프 축과 `interact`에 함께 매핑하며, 진행 시스템은 준비된 패널의 반경 안에서만 이를 소비한다. 따라서 별도 PC 상호작용 키를 추가하지 않고 패널 밖에서는 기존 점프 동작을 그대로 유지한다.
- `respawnPlayerAtCheckpoint`는 부활한 playerId·원인·위치·체력·손실 아티팩트를 `player-respawned` 사건으로 남긴다. 손실이 있으면 같은 playerId의 `artifact-loss` 사건도 발행한다.
- 여러 플레이어가 같은 틱에 사망해도 각자 독립 부활한다. 공용 적·투사체와 다른 플레이어의 위치·체력·아티팩트는 초기화하지 않는다.
- 적은 사거리 안의 살아 있는 플레이어 중 최근접 대상을 선택하고 거리 동률은 ID로 결정한다. 적 투사체의 생성·직선 궤적·8초 수명은 서버가 진행한다. 각 피해 클라이언트가 자기 예측 위치에서 로프를 몸체보다 먼저 판정해 playerId가 있는 claim을 보내며, 서버 고정 스텝은 지연된 플레이어 위치로 충돌을 먼저 만들지 않는다.
- 현재 구현된 마지막 영역 `sector-02-08`은 다음 시나리오가 아직 연결되지 않은 content boundary이며 `completed` 전체 게임 종료로 판정하지 않는다.
- `GameSimulation`이 플레이어·로프·적·투사체·체력·사망·플레이어별 체크포인트 부활을 소유한다.
- 기본 무기는 사거리 안의 가장 가까운 적을 자동 조준하며, 적은 플레이어를 향해 투사체를 발사한다.
- 적 투사체는 로프와 먼저 충돌해 로프를 끊고 재부착을 잠시 막으며, 본체에 맞으면 피해와 넉백을 준다.
- `CombatFeedback`은 판정 이벤트를 수명 기반 충격파·파편·피해 숫자·월드 흔들림으로 변환한다. 판정 시스템은 Canvas를 직접 참조하지 않는다.
- 클라이언트 피드백 사건은 공용 월드 효과 capability와 개인 상태 효과 capability를 함께 가진다. 공용 capability는 타격·로프 절단 위치의 링·파티클을 모든 참가자 화면에서 생성하고, 개인 capability는 `sourcePlayerId` 또는 `targetId`가 현재 로컬 플레이어와 일치할 때만 화면 흔들림·피해 강조·로프 절단 경고를 생성한다. 렌더러와 앱은 사건 종류별 참가자 분기를 소유하지 않는다.
- 첫 화면에서 싱글은 `PlayerCommand → LocalAuthority → GameSimulation`, 멀티는 `4자리 채널 → 고정 WebSocket 서버 → 채널별 AuthorityServerSession → GameSimulation` 경계를 선택한다. 두 경로는 입력 출처와 상태 전달만 다르고 게임 규칙을 공유한다.
- 협동은 소유 클라이언트 권한과 서버 중립 월드 권한을 분할한다. 서버의 주역할은 소유 상태·사건 검증과 복제 공유이며, 시간 모델·상태 소유권·스냅샷과 거부 복구 계약은 `multiplayer-synchronization.md`를 기준으로 한다.
- `MultiplayerGameApp`은 `RemoteGameAuthority.snapshot()`과 공개 명령만 사용한다. `OwnerPredictionRuntime`도 로컬 `GameSimulation`의 공개 소유자 예측 계약만 사용하며, 앱·예측 런타임·서버 세션 어느 쪽도 중첩된 플레이어 컴포넌트 내부로 들어가 직접 읽거나 수정하지 않는다.
- 투사체와 같은 예측 가능한 객체는 위치를 계속 전송하지 않고 권위 `spawn` 이벤트의 시작 틱·초기 상태로 각 실행 환경에서 진행한다. 서버 `CombatSystems`와 클라이언트 `PredictableProjectileStore`는 투사체의 공통 `projectile-motion` capability를 실행해 `ProjectileMotion`의 동일한 유도·직선 적분식을 호출하며 별도 궤적 공식을 두지 않는다. 충돌·claim 확정·수명 만료만 `resolve` 이벤트로 확정한다. 원래 spawn 이벤트는 활성 객체에 보존해 중간 입장 welcome에서만 같은 ID로 재전송한다.
- 플레이어 자동 무기는 조합된 collider의 `outsidePointToward()`로 대상 방향 몸체 바깥 발사점을 계산한다. 이 위치는 소유자 예측, 서버 검증과 공유 spawn 사건이 함께 사용하며 renderer는 총구 위치나 collider 형상을 다시 해석하지 않는다.
- 자기 탄환은 `EnemyHitPrediction` 믹스인이 로컬 충돌 VFX와 검증 가능한 hit claim을 한 번 만든다. 첫 로컬 충돌에서 탄환 수명은 소비되며 claim 거부가 같은 탄환을 겹친 위치에 복구해 추가 피격을 만들지 않는다. 서버는 연결 소유권·탄환·대상·tick·위치·중복을 검사하고 서버 소유 탄환 대미지로 검증된 결과를 다른 복제본에 공유한다. 중립 적 탄환도 피해 클라이언트가 충돌을 인식한 순간 소비하며, 거부 receipt가 객체를 다시 표시하거나 같은 겹침에서 재발화하게 하지 않는다.
- `GameSimulation`은 권위 틱을 증가시키며 중립 자동 발사·투사체 궤적과 검증된 피해자 피격·로프 절단 claim에서 복제 이벤트를 기록한다. 서버 고정 스텝은 플레이어 피격을 직접 만들지 않으며 전송 계층이 사건을 drain한 뒤에도 검증용 투사체 배열은 유지된다.

## 의존 방향

`game → core/render/game-kit` 방향만 허용한다. `game-kit`은 캐릭터, 로프, 월드, UI 같은 프로젝트 게임 규칙을 가져오지 않는다. 데스크톱과 모바일, 싱글과 멀티는 별도 게임 로직을 만들지 않고 입력 명령의 출처와 상태 전송 방식만 교체한다.
