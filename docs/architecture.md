# 프로토타입 아키텍처

## 현재 범위

브라우저 Canvas에서 실행되는 2D 로프 액션 프로토타입이다. 고정 길이 로프 물리, 세로 등반 spine과 실제 lateral city wing으로 조립된 4,800px 연속 Sector, 적 전투·투사체, 최근 도달 Stage 체크포인트 복귀와 generic Augment 런 성장 상태를 공용 시뮬레이션에서 처리한다. PC와 모바일은 입력 방식만 다르고 게임 규칙은 공유한다.

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
      ├─ game/augments/FoundationAugmentCatalog.js
      ├─ game/augments/FoundationAugmentState.js
      ├─ game/rewards/RewardSelection.js
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

- `AuthoredWorldObjectRenderer`는 visibility·공통 progress·좌표 context만 조정하고 object kind별 geometry와 상태 해석은 `WorldObjectRendererDefinition` 구체 클래스가 소유한다. 고정 kind registry와 frame-local wind lookup은 frozen object를 사용하며 새 object 표현은 facade 조건문이 아니라 구체 renderer 등록으로 추가한다.
- `CanvasRenderer`는 Canvas context, DPR·resize, 화면/월드 좌표 변환과 HUD·오버레이를 소유하는 공통 호스트다. 월드 장면의 표현은 주입된 scene renderer에 한 번 위임한다.
- `GameRendererFactory`가 시작 시 렌더 프로필을 선택한다. 기본 프로필은 혼합 도트 표현인 `sprite`이며, 기존 표현은 `?renderer=polygon`으로 명시해 선택한다.
- scene renderer는 동일한 읽기 전용 scene snapshot과 viewport 계약을 받는다. 앱·시뮬레이션·네트워크 계층은 선택된 프로필이나 스프라이트 자산 형식을 해석하지 않는다.
- 도트 프로필은 별도 scene renderer로 제공한다. 프로필별 분기를 `GameApp`, `MultiplayerGameApp`, 시뮬레이션 객체에 흩뜨리지 않고 factory 등록 경계에서만 선택한다.
- `SpriteAnimation`은 프레임 사각형과 지속 시간을 불변 데이터로 보관하고 외부에서 받은 경과 시간으로 현재 프레임을 결정한다. `SpriteCanvasPainter`는 Canvas의 이미지 보간을 끄고 원본 프레임, anchor, 반전과 목적 크기만 그리며 자산 로딩이나 게임 시간을 소유하지 않는다.
- 싱글 렌더 보간은 display frame 시작 상태가 아니라 마지막 fixed step의 직전·직후 snapshot(`N-1 → N`)만 사용한다. `GameApp.update()`가 각 step 직전에 previous snapshot을 교체하고, step이 없는 display frame은 같은 두 snapshot에서 증가한 alpha를 사용한다. catch-up으로 여러 step이 실행돼도 display frame 전체 이동을 한 번에 보간하지 않으며 포탈·부활처럼 96px을 넘는 전이는 최신 상태로 snap한다.
- `PlayerSpriteManifest`는 도구 중립 manifest를 `PlayerSpriteDefinition`으로 정규화하고, definition은 atlas ID로 찾는 여러 source·atlas/frame·출력 크기, anchor·offset, 상태별 clip과 명시적 fallback을 하나의 불변 계약으로 검증한다. `SpriteImageAssetSet`은 모든 atlas의 준비·실패 상태와 ID별 이미지를 소유한다. player renderer는 frame에 기록된 atlas ID와 사각형만 소비하며 자산 배치나 생성 도구를 추측하지 않는다. 상세 교환 형식은 `sprite-asset-format.md`를 따른다.
- `EnemySpriteManifest`와 `EnemySpriteDefinition`은 일반 몹의 타입별 전체 presentation state coverage, multi-atlas cell, frame duration·loop, 출력 cue, alias와 명시적 fallback을 검증한다. Player와 enemy manifest는 상태 계약을 분리하지만 정규화된 frame은 공용 `SpriteAnimation` clip을 사용한다. bootstrap은 player와 독립적으로 기본 enemy package를 주입하며 manifest·atlas 실패 또는 package 미지원 타입은 해당 적만 built-in pixel mock으로 복구한다. 상세 교환 형식은 `enemy-sprite-asset-format.md`를 따른다.
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
- audio readiness는 `loading|ready|degraded|suspended|failed`의 읽기 전용 진단 상태를 제공한다. 일반 시작 UI는 진행률과 필수 실패의 원인·재시도·메뉴 복귀만, 오디오 설정 탭은 선택 실패가 있을 때 `일부 음원 사용 불가` 요약만 표시한다. 설정 버튼 길게 누르기로 여는 디버그 수치 및 진단 복사는 pack/package ID, AudioContext 상태, 준비 실패와 runtime `play()` 실패의 clip·cue·코드, required/optional 준비 수, 그룹별 활성 voice 수와 cooldown drop·voice stealing 누계를 소비한다. 진단 값은 mixer·gameplay 정책을 자동 변경하지 않는다.
- required stream이 모든 source fallback과 timeout 뒤에도 준비되지 않으면 다른 group이 ready여도 package 상태는 `failed`이며 앱 시작을 차단한다. 자동 `degraded` 시작이나 사용 시점까지의 지연 준비는 허용하지 않고, manifest가 `required: false`로 명시한 항목만 제외 후 `degraded`로 시작할 수 있다.
- `StateMachine`은 현재 상태·상태 경과 시간·허용 전이만 소유하는 순수 Has-A 컴포넌트다. 남은 시간 예산과 snapshot 복원이 필요한 도메인은 이를 상속하거나 타이머를 복제하지 않고 `TimedStateController`로 조합한다. actor별 presentation resolver는 읽기 전용 snapshot과 표현 사건을 확정된 표현 상태로 바꾸며 clip catalog와 painter는 gameplay 조건을 다시 해석하지 않는다.
- `hit`·`death`·`respawn`처럼 순간적인 actor 표현은 기존 권위 사건의 대상 `playerId`를 보존한 renderer 전용 presentation event에서 시작한다. 로컬과 원격 actor가 각자 FSM으로 재생하며 animation state·phase를 네트워크 snapshot의 권위 상태로 만들지 않는다.
- 피해 클라이언트의 즉시 impact와 뒤이은 서버 확정은 투사체·부활 원인의 같은 causal ID로 presentation event를 정규화해 한 번만 재생한다. 서버 확정이 로컬 `hit`·`death`·`respawn` 시간을 다시 시작하지 않는다.
- 사망 표현은 시뮬레이션의 즉시 부활을 지연시키지 않는다. `player-respawned` 사건이 사망 직전 위치·부활 위치·`statusType`·원인을 함께 전달하고, renderer는 manifest의 `death` frame duration 합계 동안 사망 위치를 그린 뒤 부활 위치의 `respawn`으로 전환한다. 로컬 카메라는 같은 시간 동안 사망 순간 transform을 유지하고 종료 시 부활 위치로 즉시 컷한다. 낙사 위치가 viewport 밖이면 캐릭터 출력 크기만큼 안쪽의 마지막 화면 가장자리로 clamp하며, 원격 플레이어 사망은 로컬 카메라를 고정하지 않는다. 사망 animation은 모든 참가자가 보되 부활 상태 문구는 personal status capability가 `playerId === viewerId`인 화면에만 생성한다.
- 순간 표현 상태는 지속 locomotion 상태보다 높은 우선순위로 제한된 시간 동안 재생하고 종료 시 최신 snapshot으로 지속 상태를 다시 계산한다. 이 전이는 physics·input clock을 정지하거나 되감지 않는다.
- actor facing과 animation phase는 renderer가 actor ID별로 보관하는 표현 상태다. snapshot의 움직임으로 방향을 갱신하되 정지·순간 상태에서는 마지막 방향을 유지하고 네트워크에 frame·phase·facing을 전송하지 않는다. player 달리기 phase는 관성 속도가 남은 시간을 그대로 재생하지 않고 actor의 실제 수평 이동 거리에 비례해 진행하며, 현재 8프레임 한 주기는 180px이다.
- 플레이어의 지속 locomotion resolver는 접지 상태를 로프 부착보다 먼저 제한한다. `rope`는 부착 상태이면서 공중일 때만 선택하고, 지상에서는 부착 여부와 무관하게 `run` 또는 `idle`을 선택한다. 로프 없이 공중에서 `velocity.y < 0`인 상승 구간은 `jump` clip에 renderer 전용 `rotationOffset`을 초당 2회전으로 더하고, `velocity.y >= 0`인 하강 구간은 추가 회전 없이 기존 `fall` clip을 사용한다. 이 offset은 아래의 물리 `angle`과 그리기 시점에만 합성하며 gameplay·network snapshot에 저장하지 않는다.
- 싱글의 로컬 플레이어는 `PlayerPhysics`의 prototype getter로 각도를 제공하고 멀티 플레이어는 직렬화 가능한 상태 필드로 각도를 제공할 수 있다. 하위 player renderer는 actor ID 선택과 상태 객체를 분리해 다루며 상태를 object spread로 복제하지 않는다. sprite와 polygon 구현은 모두 전달받은 `angle`을 몸체 중심 변환에 적용하고 `GameApp`·`MultiplayerGameApp`에 모드별 렌더 분기를 만들지 않는다.
- sprite definition의 source·출력 크기·anchor는 표현 계약이고 collider의 크기·형태는 플레이어 런타임 조립이 선택하는 게임플레이 계약이다. 에셋이나 렌더 프로필 교체가 collider를 암묵적으로 바꾸지 않으며 scene snapshot은 필요할 때 두 계약의 결과를 읽기 전용으로 전달한다.
- `PlayerRuntimeFactory`와 Enemy/Boss actor factory는 공개 `Collider` 계약의 구현을 물리에 조립한다. Player와 일반 몹 기본값은 `CircleCollider`, 사각형·대형 Boss·비원형 몹은 중심 기준 local vertex를 가진 convex `PolygonCollider`를 사용하며 box는 polygon 편의 생성자다. 이동·로프·지형·actor·projectile 충돌 계산은 구체 반지름 대신 조립된 collider snapshot 계약을 사용한다.
- scene profile은 배경·지형·로프·actor·world VFX 레이어의 조합이다. 혼합 도트 프로필은 공용 폴리곤 레이어와 sprite actor 레이어를 조립하며 `PolygonSceneRenderer` 전체를 복사하거나 상속 override하지 않는다.
- scene composer는 조립된 하위 renderer 목록을 안정된 순서로 순회해 호출할 뿐 profile 또는 actor kind 분기를 하지 않는다. player, enemy, player projectile, enemy projectile과 환경·로프·VFX renderer가 자기 collection의 실제 그리기를 소유하고 profile factory가 polygon/sprite 구현을 교체 조립한다.
- 도트 환경도 `backdrop`, collision-aligned `terrain`, non-collision `decoration` 하위 renderer로 조립한다. 상위 composer는 profile·구역·atlas 종류를 분기하지 않으며 각 component가 고도 구역 해석과 실제 Canvas 그리기, 자기 asset 준비 상태와 fallback을 완결한다. 정식 리소스 교환 계약은 `environment-asset-format.md`를 따른다.
- authored 환경 package 선택은 `AuthoredAreaEnvironmentCatalog`의 stable Area ID가 소유한다. 서로 다른 package의 경계 전환은 `PixelBackdropRenderer`가 Player world Y에서 파생한 비율로만 두 backdrop과 sky를 교차 합성하며 simulation, camera, collision 또는 network state를 추가하지 않는다.
- 현재 authored Runtime의 배경·지형 테마와 Stage UI는 scene의 로컬 Player 위치가 포함되거나 수직으로 가장 가까운 `landmark.bounds`에서 파생한다. 공용 진행 state에는 current Sector/Stage 필드가 없다.
- 도트 terrain은 `WorldGenerator`가 만든 surface vertices를 새 도형으로 근사하지 않고 같은 polygon clip과 외곽선에 사용한다. one-way 표현도 같은 vertices의 `0..oneWayEdgeEnd` chain만 그린다. decoration은 충돌 상태를 추가하지 않고 이동 경로 밖 또는 배경 깊이에 결정적으로 배치한다.
- `PixelTerrainRenderer`는 surface 순회·가시성·진행 상태만 해석하고, Sector와 `kind`별 구체 surface renderer를 frozen object catalog에서 선택한다. 공통 polygon·tile·edge 그리기는 `PixelTerrainSurfacePainter`, one-way·pass-through처럼 선택적인 표현은 Has-A capability renderer가 소유하며 Sector·표면 종류 조건을 상위 renderer에 다시 추가하지 않는다.
- 환경 asset 실패는 scene 전체가 아니라 component별로 격리한다. backdrop 실패는 polygon backdrop, terrain 실패는 polygon world geometry로 각각 대체하고 decoration 실패는 장식만 생략한다. pending load를 실패로 고정하지 않으며 실제 실패 전이에 한 번만 경고하고 디버그 수치에 component와 atlas ID를 노출한다.
- 싱글과 멀티 앱은 같은 scene snapshot과 renderer composition을 사용한다. 환경 상태나 진단을 전달하려고 `GameApp`과 `MultiplayerGameApp`에 같은 plumbing을 복제하지 않고 Canvas host 또는 환경 하위 renderer의 공용 계약에서 읽는다.
- `CanvasRenderer`는 CSS viewport와 camera에서 한 프레임당 한 번 `visibleWorldBounds`를 만들고, 화면 가장자리 pop-in을 막는 96 world-unit margin을 더한 `worldBounds`를 불변 viewport로 전달한다. 상위 composer는 객체 종류를 판단하지 않으며 terrain·decoration·enemy·projectile 하위 renderer가 자기 객체의 bounds와 교차 여부를 계산해 draw를 생략한다. polygon과 sprite profile, 싱글과 멀티는 같은 viewport 계약을 사용한다.
- collision surface의 bounds·edge geometry와 seed 기반 decoration placement처럼 월드가 유지되는 동안 변하지 않는 표현 계산은 해당 하위 renderer가 world와 zone을 캐시 키로 보관한다. camera 이동은 배치를 다시 만들지 않고 가시 객체만 다시 선택하며, world 또는 고도 zone이 바뀔 때만 관련 캐시를 갱신한다.
- Canvas backing store는 기기 DPR을 그대로 곱하지 않는다. 기본 정책은 DPR 최대 `2`, backing pixel 최대 `3 * 1024 * 1024`이며 두 제한과 CSS 크기 중 가장 낮은 유효 배율을 사용한다. CSS 면적 자체가 예산보다 큰 경우 선명도를 더 낮추기 위해 DPR 1 아래로 내리지 않는다. 정책은 `GameRendererFactory`의 `canvasOptions.performancePolicy`로 주입할 수 있고 painter의 image smoothing 비활성 계약은 유지한다.
- `RenderPerformanceMetrics`는 rAF 시작 간격 p50/p95와 최대값, Canvas draw 구간 p50/p95와 최대값, 최근·누적 dropped fixed steps, CSS/backing 크기, 실제·유효 DPR과 하위 renderer별 `drawn/total`을 읽기 전용 진단으로 집계한다. 설정 버튼 길게 누르기로 여는 디버그 수치와 진단 복사만 이 값을 소비하며 시뮬레이션 속도, 네트워크 권한 또는 렌더 품질을 자동 조정하지 않는다. 물리는 화면 주사율과 무관하게 기존 120Hz fixed step을 유지한다.
- bootstrap 기본 프로필은 `sprite`이며 query의 `renderer=polygon`이 기존 표현을 명시적으로 선택한다. 알 수 없는 값은 경고 후 기본 프로필을 사용한다. sprite asset 준비 실패는 앱을 중단하지 않고 하위 fallback renderer가 전체 polygon scene을 그리며 진단 가능한 경고를 남긴다.
- 렌더 프로필 교체는 물리·전투·입력·권위 snapshot·네트워크 메시지 계약을 바꾸지 않는다.

## 공용 지형 물리와 플레이어 강체 회전

Player·Enemy·Projectile의 선형 운동은 `PhysicsMixin`을 공유한다. Player는 회전 capability인 `AngularPhysicsMixin`을 추가하고 Rope 관절은 외부 Has-A 컴포넌트로 조립한다.

- `PhysicsMixin`은 `position`·`velocity`·`acceleration` 세 벡터를 소유한다. gameplay impulse와 force는 acceleration에 누적되고 공용 tick이 acceleration을 velocity에 합친 뒤 position을 적분하고 accumulator를 초기화한다. `withSurfacePhysics`는 그 위에 질량·motion type·공개 `Collider`를 조립하고 현재 활성 collision surface와 다른 actor body를 해결하는 단일 좌표 변경 경계다. `PlayerPhysics`와 `EnemyObject`가 같은 mixin을 사용하며 actor controller가 Runtime 좌표를 직접 더하거나 설정하지 않는다. 공용 collider geometry가 circle↔circle, circle↔polygon, polygon↔polygon contact를 계산하고 각 shape collider가 actor·solid terrain·one-way surface 응답을 완결한다. Collider는 복제한 working velocity만 해결하고 `SurfacePhysicsMixin`이 그 차이를 acceleration에 누적·반영하므로 body velocity를 우회 변경하지 않는다. Player↔Player·Player↔Enemy·Enemy↔Enemy 몸체 충돌은 `Collider.resolveActor`에서 겹침을 inverse-mass 비율로 나누고 상대 법선 속도에 질량·반발 계수를 적용한 impulse로 자기 권위 body의 속도를 바꾼다. 접선 속도는 보존하며 `sentry` 고정형 Turret만 inverse mass 0의 정적 body다. Enemy가 받은 충돌 속도는 짧게 감쇠하며 다음 controller intent와 합성한다.
- `CollisionBroadPhase`는 정적 surface Quadtree와 fixed-step 동적 actor Quadtree를 소유한다. surface index는 `activeCollisionSurfaces` 참조가 바뀔 때만 재구축하고, actor index는 step 시작에 만들고 각 body 해결 뒤 해당 entry만 갱신한다. 공용 physics는 collider의 현재 bounds와 예상 위치 bounds를 합친 swept AABB로 후보를 조회하므로 고속 이동 경로 중간의 벽·one-way·actor를 endpoint 거리만으로 누락하지 않는다. Quadtree는 후보만 줄이며 narrow phase는 기존 `Collider` 계약이 그대로 소유한다.
- 화면 기반 시뮬레이션 관심 영역은 실제 Canvas 크기나 카메라 packet을 서버에 보내지 않고 `CAMERA_CONFIG.referenceViewport`보다 큰 결정적 world-space bounds로 만든다. 싱글과 owner prediction은 로컬 Player bounds, 멀티 서버는 모든 active Player bounds의 합집합을 사용한다. 영역 밖 Enemy는 충돌만 생략하지 않고 행동·Patrol·넉백·공격·물리 전체를 동결해 화면 밖에서 추락하거나 벽을 통과하지 않으며, 정적 surface는 화면 밖이어도 전역 Quadtree에 계속 남는다.
- Enemy Pursuit·Swarm·Patrol과 넉백은 이동 displacement만 공용 physics step에 적재한다. 서버 중립 Enemy step은 행동과 Patrol intent를 모두 모은 뒤 한 번 적분하고 조립된 `Collider.resolveSurfaces`로 벽·지형을 해결한다. owner Player는 로컬 Enemy snapshot과 즉시 몸체 충돌하고 서버 Enemy도 최신 복제 Player body와 충돌해 어느 한쪽만 통과 허용 predicate를 만들지 않는다. 위치 snapshot 복원과 명시적 spawn/reset은 이동 적분이 아니므로 별도 상태 복원 경계에 남는다.
- `PlayerPhysics`는 공용 선형 물리에 `AngularPhysicsMixin`을 조합한다. mixin 내부의 `AngularMotion` 상태 컴포넌트는 각도, 각속도, 각가속도, 관성, 각 감쇠와 점 충격 계산을 담당하고 외부 호출자는 mixin의 공개 명령만 사용한다. collider 형상은 계속 `PlayerRuntimeFactory`에서 독립적으로 교체할 수 있으며 몸체 회전이 원형 collider를 암묵적으로 바꾸지 않는다.
- `Collider`는 겹침·해결뿐 아니라 대상 방향의 형상 바깥 점을 구하는 `outsidePointToward(center, target, clearance)`도 제공한다. 자동 무기는 구체 원형 반경을 읽지 않고 이 계약으로 발사체 반경과 여유를 포함한 총구 위치를 구하므로, collider 형상을 교체해도 몸 중심 발사나 renderer별 보정이 생기지 않아야 한다.
- `AngularPhysicsMixin`은 회전하는 body에만 angular acceleration·angular velocity·angle 적분 capability를 제공한다. `PlayerPhysics`가 이를 선택 조합하고 내부 회전 상태는 공개 mixin 명령으로만 사용한다. `FixedLengthRope`는 플레이어 강체의 일부나 상속 mixin이 아니라 외부 joint다. world anchor, 몸체 local-space의 `attachmentOffset`, 고정 길이와 장력을 소유하고 손 관절점의 위치·속도 제약을 푼다. 제약 충격은 선형·회전 acceleration accumulator에 함께 반영한다.
- 손 관절점은 부착 순간 anchor 쪽 손을 선택해 local offset으로 고정한다. 이후 몸체 각도에 따라 world-space 손 위치가 회전하며 공용 rope renderer, 스윙 입력, 투사체-로프 충돌도 같은 `ropeAttachmentPoint()` 계산을 사용한다. 비행 중 Grapple Hook의 선도 몸 중심이 아니라 현재 몸체 각도로 회전한 `ropeLaunchHandPoint()`에서 시작한다.
- 로프 해제는 각속도를 제거하지 않는다. 게임 조작 체감을 위해 손끝 접선 속도의 `releaseAngularTransfer` 비율을 중심 선속도에 추가하는 명시적 게임플레이 보정만 적용한다. 이 비율은 joint solver나 collider에 숨기지 않는다.
- 지면 접촉 중에는 `angle = 0`을 향한 복원 토크와 각 감쇠를 적용하고, 공중에서는 약한 각 감쇠만 적용한다. 따라서 지면에서는 오뚜기처럼 서고 매달린 동안에는 joint torque를 유지한다.

이 구조는 다음 공식 물리 엔진 계약을 기준으로 삼는다.

- [Box2D Body API](https://box2d.org/documentation/group__body.html): body가 선속도·각속도와 점 force/impulse를 소유하며 중심 밖 힘이 torque를 만든다.
- [Rapier rigid-bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/): rigid body는 동역학·운동학을 소유하고 collider는 형상과 질량 특성을 제공하도록 별도 부착한다.
- [Rapier joints](https://rapier.rs/docs/user_guides/javascript/joints/): joint는 각 body의 local anchor를 연결하는 독립 제약이다.
- [Unity Rigidbody2D](https://docs.unity3d.com/ScriptReference/Rigidbody2D.html): 위치·회전·선속도·각속도·관성을 한 강체 운동 상태로 제공하고 collider를 별도 부착한다.

따라서 선형 운동과 각운동은 각각 `PhysicsMixin`과 `AngularPhysicsMixin` capability로 선택 조합한다. `AngularMotion`·`Collider`·joint처럼 독립 수명주기와 상태를 가진 부분은 해당 mixin 또는 객체 내부의 Has-A 컴포넌트로 소유하고 외부에서 내부 상태를 직접 변경하지 않는다.

## 게임 객체 모델

```text
GameObject
├─ InputDrivenObject ── 소유 사용자 입력에 즉시 반응
│  ├─ PlayerObject + LocomotionInput
│  └─ RopeObject   + RopePointerInput
└─ SimulationDrivenObject ── 직접 입력 없이 고정 스텝에서 진행
   ├─ EnemyBodyObject         + EnemyPhysicsSimulation + optional EnemyBehavior
   │  ├─ EnemyObject          + EnemyWeaponSimulation
   │  └─ UnarmedEnemyObject   weapon capability 없음
   ├─ AutomaticWeaponObject   + AutomaticWeaponSimulation
   ├─ HomingProjectileObject  + ProjectileMotion + EnemyHitPrediction
   └─ BallisticProjectileObject + ProjectileMotion + PlayerImpactPrediction

InputSampler → 불변 입력 프레임 → InputDispatcher
                                  └─ capability가 있는 소유 InputDrivenObject만 호출
고정 스텝 단계 → capability ID → SimulationDispatcher
                                  └─ 해당 capability가 있는 SimulationDrivenObject만 호출
```

- `InputDrivenObject`와 `SimulationDrivenObject`는 실행 위치가 아니라 상태 변화 원인의 Is-A 정체성이다. 서버는 입력 주도 객체 claim을 검증할 복제 상태를 가지며 클라이언트는 시뮬레이션 주도 객체를 표시·보간할 복제 상태를 가질 수 있다.
- 플레이어와 로프는 별도 `InputDrivenObject`다. 플레이어는 물리·체력·generic Augment loadout을 Has-A로 소유하고, 로프는 부착·장력·드래그·발사 shot 상태를 독립 소유한다. `FoundationAugmentState` 같은 기존 이름은 migration 호환 경계에만 남고 소유 관계는 ID와 공개 계약으로 연결한다.
- 적과 직접 조작하지 않는 자동 행동 객체는 `SimulationDrivenObject`다. 서버가 진행하되 플레이어 피격처럼 사용자 체감과 만나는 사건은 피해 클라이언트가 먼저 반응하고 서버가 권위 객체 상태로 검증한다.
- 멀티는 권한 감각만 보면 P2P형이다. 플레이어별 `InputDrivenObject` 결과는 해당 소유자·피해자 클라이언트가 먼저 결정하고, 특정 클라이언트에 귀속할 수 없는 몹과 적 투사체 같은 `SimulationDrivenObject`의 생성·궤적은 서버가 중립적으로 진행한다. 서버는 지연된 플레이어 복제 위치로 충돌을 먼저 확정하지 않고 피해 클라이언트 claim을 중립 객체 상태로 검증한다.
- 사건 전파와 지속 상태 수렴을 같은 것으로 취급하지 않는다. `InputDrivenObject`의 지속 상태는 인증·형식·세션 tick 검사를 통과한 최신 `owner-motion`을 값의 크기와 무관하게 서버와 동료가 따라가고, `SimulationDrivenObject`는 서버 상태를 모든 클라이언트가 따라간다. 원격 플레이어 위치는 상태가 실제 생성된 `ownerMotionTick` 표본 사이를 보간하고 공용 입력 선행 tick으로 서버 표시 시계와 정렬하며, 적은 `serverTick` 표본을 사용한다. 중복·역순·세션 범위 밖 owner tick은 성공한 no-op으로 무시하고 소유자는 어떤 `owner-motion` receipt에도 서버 지연 위치로 되감기거나 미확정 입력을 재실행하지 않는다.
- 로프 스윙처럼 입력 capability가 플레이어의 지속 상태도 바꾸면 소유 클라이언트와 서버 검증 복제본이 같은 `GameSimulation` 도메인 메서드를 사용한다. 정상 스냅샷은 소유자의 강화 타이머를 다시 쓰지 않는다.
- 예측 객체의 생성과 그 입력이 바꾸는 소유자 상태는 하나의 prediction ID 수명주기로 관리한다. 자동 발사는 탄환과 무기 쿨다운을 함께 적용한다. 여러 동종 claim이 pending이면 앞 거절은 후속 효과를 지우지 않고 후속 prediction의 이전 값만 거절된 원인이 없었던 시간축으로 재기준화한다. 마지막 거절에서 최초 준비 상태로 복구한다. 승인 receipt는 공유 확인일 뿐 소유자 상태를 서버 스냅샷으로 교체하는 전이가 아니다.
- 피해 결과는 일반화한 impact ID를 수명주기 키로 사용하며, 기존 투사체 소비자는 같은 값을 `projectileId` 호환 별칭으로 받을 수 있다. `OwnerPredictionRuntime`은 `GameSimulation`의 공용 피해 전이로 넉백·HP·무적·치명 Stage 세이브 포인트 부활·착지 피해 또는 로프 절단을 즉시 적용하고, pending 기록은 중복 억제와 승인 resolve 대응에 사용한다. 승인 receipt는 resolve 사건까지 기록을 유지하고, 거부 receipt는 pending 기록만 정리하며 이미 인식한 피해 상태를 복원하지 않는다. 전송 계층은 HP나 물리 역연산을 구현하지 않는다.
- 기본 Runtime에는 물리 Stage 진입 권위가 없다. Player collider와 `respawnAnchor.triggerBounds`의 겹침만 개인 checkpoint를 갱신하며 objective는 자기 bounds/source와 `requiredObjectiveIds`만으로 판정한다. 현재 Stage·Sector는 `AuthoredLandmarkResolver`가 Player 좌표에서 계산하는 UI·계측용 파생값이다. 모든 seamless surface는 Run 시작부터 collision과 renderer가 공유하는 정적 집합이며 `requiredRouteId`로 추가·제거하지 않는다.
- 저작 landmark는 local camera zone과 desktop/mobile zoom, 선택적 player screen ratio를 legacy area metadata에서 이어받는다. 싱글·멀티의 `AuthoredCameraDirector`는 공용 진행이 아니라 각 로컬 플레이어의 물리 좌표로 현재 landmark와 Shot을 고른다. renderer는 계산된 카메라만 받고 Camera Zone 규칙을 다시 해석하지 않는다.
- 표시 시간이 있는 objective는 `SectorProgressState.activeObjectiveSequences`의 공용 진행으로 시작·진행·완료한다. 1-1 Terminal은 2.7초 Sequence가 끝난 뒤 objective와 outbound route를 확정하고, 각 클라이언트의 `AuthoredStoryPresentation`은 같은 사건을 짧은 문구로 표현할 뿐 route 상태를 쓰지 않는다. Story 문구 중에도 이동 입력은 허용한다.
- `PlayerMessagePresentation`은 시설 System Story와 별도의 local presentation owner다. data catalog가 message ID·Stage·after-Story trigger·text·duration·글자 표시 속도·priority를 소유하고 core는 `channel/audience/speakerId/causalId` envelope, queue, causal dedupe, lifetime과 시간 기반 타이핑 진행을 처리한다. 첫 지원은 `player-bark/local-player`이며 `GameApp`과 `MultiplayerGameApp`이 각자 local viewer context로 진행해 동료 snapshot에 복제하지 않는다. renderer는 상단 Cyan System panel과 분리된, 해당 speaker 머리 위 고정 화면 크기 말풍선을 사용하고 화면 가장자리에서 clamp한다. future `party-chat/party`는 인증된 transport adapter가 같은 queue에 message를 주입해 remote speaker 위에 표시하는 확장점만 두며 현재 wire protocol·채팅 입력·moderation은 추가하지 않는다. 네트워크는 애니메이션 프레임을 전송하지 않고 각 클라이언트가 message text와 속도에서 표시 문자열을 계산한다.
- **Stage direction authoring:** Stage 연출은 공용 `DirectionDefinition` schema에 맞춘 기획 친화 `DIRECTION-SPEC.json`을 normalize/compile해 immutable Runtime definition으로 만든다. `DirectionRuntime`은 Beat trigger·순서·dedupe·replay·cancellation 수명주기만 소유하고 `domain/action/scope/payload/causalId` typed command를 Camera·Text·Bark·Audio·Lighting·Character·Player·Enemy·Collision·Objective·Gate 도메인 adapter에 전달한다. local presentation, owner-client Player state, server/shared world state 권위가 command scope와 맞지 않으면 compile을 거부하며 Runtime이 도메인 상태를 직접 우회 변경하지 않는다. 최상위 목표는 좋은 게임과 기획 의도 보존이다. 의미 보존이 불가능하거나 비용·성능·멀티 동기화·asset 위험이 큰 항목은 자동 근사하지 않고 `review-required`로 원본 의도·차단 근거·대안·추천안을 개발자에게 전달한다. 개발자는 의도를 보존하는 시스템 확장은 결정할 수 있지만 효과를 축소하는 fallback은 기획자 승인을 받아야 한다. 필수 track 미해결은 release를 차단하고 명시적 `optional: true`만 손실을 노출한 채 허용한다. `DESIGN LOCKED`는 사람의 기획 상태이며 구현 상태는 compiler·adapter coverage·acceptance test가 `unsupported/compile-failed/review-required/unbound/implemented/verified`로 산출한다. 0.45.0 첫 migration은 1-1/1-2의 Camera·Story·Bark·Audio·Lighting·비언어 track을 완결했으며, Player·Enemy·Collision·Objective·Gate는 typed command와 authority validation 계약을 제공하되 현재 Stage에 없는 gameplay 연출을 만들지 않는다.
- 저작 사각 surface와 world object의 `position`은 `coordinateAnchor`가 가리키는 부착점이다. `AuthoredCoordinateAnchor`는 `top|center|bottom × left|center|right`의 아홉 이름을 정규화하고 사각형 bounds를 계산한다. 수평 보행 발판과 위에서 아래로 뻗는 천장 구조는 `top-center`, 바닥에서 위로 서는 패널과 수직 고정 구조는 `bottom-center`, 그래플 표식처럼 자유 배치되는 정사각형은 `center`를 사용한다. `rectangle()`은 기준점·크기로 collision vertices를 만들고 startup compiler는 vertices와 기준점을 같은 X/Y offset으로 이동한다. world-object presentation은 같은 기준점·표현 크기로 컬링 bounds와 실제 draw bounds를 계산한다. legacy Gate aperture 검증은 이전 Area revision compatibility에만 남는다.
- 현재 저작 시나리오는 위치 기반 objective와 명시적 prerequisite로 진행하고 마지막 landmark objective 완료에서 content boundary에 머문다. 물리 landmark entry와 route surface unlock은 사용하지 않는다. 과거 Area/Gate와 절차 월드 summit claim은 호환 코드로만 남는다.
- 입력과 시뮬레이션 capability는 `Base => class extends Base` 믹스인으로 구현한다. Player·Enemy·Projectile은 하나의 `PhysicsMixin`에서 position·velocity·acceleration과 tick 적분을 공유한다. Player/Enemy는 `SurfacePhysicsMixin`, Player는 `GravityPhysics`와 `AngularPhysicsMixin`, Projectile은 lifetime과 선택적 Homing steering을 그 위에 조합한다. 투사체 시뮬레이션 진입은 단일 `projectile-motion`, 충돌은 같은 `client-projectile-collision` ID의 구체 믹스인을 사용하며 두 디스패처는 구체 클래스나 `instanceof` 분기 없이 capability 존재 여부로 전달한다.
- `SimulationDispatcher`는 월드 단계가 지정한 capability ID만 실행한다. 한 객체에 운동과 충돌처럼 여러 능력이 조합돼도 현재 단계와 무관한 능력을 실행하지 않으며, `GameSimulation`과 `CombatSystems`는 단계 순서와 context만 조정한다. `PredictableProjectileStore`는 객체 등록·prediction ID와 authority ID 대응·사건 전달만 담당하고 투사체 종류별 충돌이나 거부 정책을 분기하지 않는다.
- 모든 Enemy는 공통 `enemy-physics` capability로 surface 적분을 끝낸다. Projectile 공격을 사용하는 Enemy만 `EnemyWeaponState` Has-A 컴포넌트와 `enemy-weapon` capability를 추가 조합하며, 무기 없는 Artillery·Support는 `no-projectile-attack` Runtime rule 분기 없이 weapon capability 자체가 없다. `EnemyWeaponState`는 locked target·aim·fire cooldown·기존 attack snapshot을 소유하고 Idle·Acquire·Track·Lock·Fire·Cooldown 구체 상태 클래스가 각 `advance()`와 다음 전이를 override한다. `EnemyArchetypeCatalog`는 영어 Runtime ID와 한글 표시 이름, weapon capability 여부와 Has-A behavior 조립 및 각 archetype의 공개 behavior kind/state 목록을 소유한다. `EnemyStateCatalog`는 공통 사격과 Pursuit·Shield·Artillery·Support·Swarm의 허용 전이를 한 번 정의하고 시간 기반 축은 `TimedStateController`를 재사용한다. `GameSimulation`은 capability 단계와 outcome 연결만 조정하며 기존 `attackState/attackStateRemaining/behaviorState` snapshot 계약을 유지한다. 포격 strike는 기존 `BallisticProjectileObject` 중립 spawn 경계를 사용하고, 방패는 `EnemyObject.blocksImpactFrom()` 계약을 통해 #611 Rope 충돌 prediction·claim 양쪽에서 같은 방향 판정을 사용한다.
- Pursuit·Artillery·Support·Swarm Behavior는 공통 controller·snapshot 계약 위에 각 세부 상태의 구체 클래스를 조합하고, Behavior 본체는 현재 상태 definition의 `advance()`만 호출한다. `EnemyPresentationState`는 그래픽 담당자가 소비하는 단일 적 상태 인계 경계다. 타입별 지원 상태를 공개하고 `knockback → active behavior → attack → persistent stance/patrol → idle` 순서로 `primaryState`를 결정하며 원래의 `attackState`·`behaviorState` 축과 telegraph·aim line·sensor color·facing·aim/guard layer 방향을 하나의 DTO로 제공한다. Telegraph와 Sprite renderer는 이 DTO를 그릴 뿐 behavior kind/state를 다시 해석하지 않는다. `EnemyAnimationController`는 적 ID별 clip 상태와 외부 presentation 경과시간·방향만 소유하고, Sprite renderer는 `SpriteAnimation.frameAt(elapsed)` 결과를 그린다. 준비 실패나 미지원 타입에서만 정적 mock을 사용하며 표현 상태나 frame index를 게임·네트워크 권위 snapshot에 추가하지 않는다. Sentry의 `presentationAimDirection`은 서버가 공용 activation·LOS·사거리 predicate에서 가장 가까운 활성 Player를 골라 만드는 표시 전용 파생값이며 compact enemy snapshot으로 복제한다. 이는 발사 `aimDirection`·`lockedTargetId`와 분리하고 `track/lock/fire`에서는 실제 탄환 방향이 표현보다 우선한다.
- 싱글 디버그의 몬스터 모션 더미는 현재 검증된 `EnemySpriteDefinition` package의 타입만 한 번에 하나 생성한다. `DebugEnemyTrainingDummy`가 실제 `EnemyObject`의 임시 ID와 표현 제어 여부를 소유하고, `GameSimulation`은 현재 viewport 안에서 Player가 바라보는 방향의 가장 가까운 안전 발판에 배치한다. 실전 모드에서는 실제 AI·공격·피격을 진행하고, 고정·자동 모션 모드에서는 해당 더미의 AI·무기·자체 이동 단계를 정지한 채 render snapshot에만 `debugPresentationState`를 합성한다. 더미의 투사체·접촉은 Player HP·Rope·메트릭에 영향을 주지 않고, 더미는 authored 진행·보상·저장·멀티 snapshot에 포함하지 않는다. HP가 0이면 사망 모션 없이 즉시 제거하며 수동 생성만 지원한다.
- 모든 renderable gameplay object는 Is-A 실행 정체성과 별도로 `render-snapshot` Can-Do capability를 갖는다. `PlayerRenderSnapshot`, `RopeRenderSnapshot`, `EnemyRenderSnapshot`, `ProjectileRenderSnapshot` mixin은 해당 종류가 소유한 중첩 상태까지 detached DTO로 변환한다. `GameSimulation`은 capability 결과를 scene·player state·network state로 합성만 하고 live object를 반환하거나 object kind를 판별해 필드를 다시 복사하지 않는다. 싱글 보간·Rope 전이 오디오와 멀티 prediction/hydration은 이 공용 DTO를 사용하며, renderable 종류가 capability 없이 등록되면 테스트와 snapshot 생성에서 즉시 실패한다.
- `EnemyEncounterSelection`은 topology 독립 stable slot의 고정 선택 또는 허용 pool을 검증한다. pool 결과는 `slotId + run seed + world revision`으로 결정하고 position·activation·slot ID를 다시 저작하지 않는다. `resolveSectorEnemyEncounters()`와 #623 preview adapter는 canonical `encounterId/slotId/position/activation/enemySelection/legacyStageAlias`만 소비하고 `areaId`를 거부한다. `GameSimulation.createEnemies()`는 nested `enemySelection`이 주입된 canonical slot을 소비할 수 있지만 preview catalog 자체를 shipped world로 전환하지 않는다.
- 적 snapshot은 표시 이름·군집 ID·behavior state를 포함하며 prediction simulation이 같은 archetype factory로 복원한다. roster 목록·가중치·수치 같은 변경 가능한 content는 네트워크 protocol 분기나 테스트 snapshot의 권위가 아니다.
- 멀티 snapshot의 축약 Enemy state는 `world revision + objectId`가 가리키는 authored 정적 정의를 예측 월드에서 한 번 인덱싱하고 동적 state와 plain DTO로 합성한다. hydration은 Enemy runtime을 만들지 않는다. `preparePrediction()`은 `id/objectId/enemyType`가 같은 기존 runtime의 position·Patrol·attack/behavior FSM·HP·넉백을 in-place restore하고, 실제 spawn/despawn 또는 identity 변경에만 runtime을 생성·제거한다. `RemoteWorldStateBuffer`는 history push 때 Player/Enemy ID Map을 만들고 interpolation sample 중 collection 배열을 반복 탐색하지 않는다. `MultiplayerGameApp`은 fixed update당 remote sample 하나를 재사용하고 owner/presentation state는 별도 공개 read boundary에서 읽는다. immutable authored world만 필요한 경로는 `worldSnapshot()`을 사용하며 claim/event/progress를 숨길 수 있는 장기 snapshot cache는 두지 않는다.
- 싱글은 입력 주도 역할과 시뮬레이션 주도 역할이 한 프로세스에 함께 있을 뿐 같은 객체 분류와 디스패치 경계를 사용한다. 멀티는 그 경계 사이에 입력·claim·snapshot 전송만 추가한다.
- `GameSimulation`은 객체별 게임 규칙을 직접 모으는 거대 분기점이 아니라 월드 등록, 고정 tick, 객체 단계 실행과 사건 연결을 조정하는 월드 스케줄러로 축소한다. 투사체 spawn 사건도 종류를 검사하지 않고 객체의 `replicationState(tick)` 계약을 사용한다.
- `OwnerPredictionRuntime`은 소유 `InputDrivenObject` 집합의 입력 이력·예측 tick·claim 수명과 explicit compatibility 전이만 조정한다. `owner-motion` receipt와 정상 snapshot은 소유 상태 복원·입력 재실행·표시 보정을 시작하지 않는다. `applySharedOwnerProgress()`는 검증된 무기 파라미터 같은 협동 진행 정보만 흡수하고 HP·피격 무적·생명·로프·쿨다운·시간 제한 강화는 쓰지 않는다. 짧은 표시 offset과 hard-snap 계측은 legacy Area checkpoint rollback에만 남으며 기본 Sector Runtime은 해당 claim을 호출하지 않는다.

### 적용된 마이그레이션 순서

1. 기존 플레이어·로프·2인 동기화·부활 동작을 회귀 테스트로 고정한다.
2. `GameObject`, `InputDrivenObject`, `SimulationDrivenObject`와 capability 기반 `InputDispatcher` 계약을 추가한다.
3. 플레이어 이동·점프와 로프 입력을 별도 `InputDrivenObject`와 입력 믹스인으로 옮긴다.
4. 적·자동 무기·투사체를 `SimulationDrivenObject`로 분류하고 구체 행동을 capability 믹스인과 선택적 `SimulationDispatcher` 실행 단계로 옮긴다.
5. `OwnerPredictionRuntime`으로 입력 주도 객체 예측 경계를 통합하고 구체 플레이어 종류별 분기를 제거한다.
6. 단일 `updatePlayer()` 경로를 제거하고 소유자 입력 디스패치, 소유자 상태 진행, 시뮬레이션 주도 자동 무기 단계를 분리한다.

## 입력 규칙

- PC: A/D 또는 방향키 이동, W 또는 위 방향키 점프, 마우스 누르기·드래그·해제로 로프 조작
- 기본 Hook은 `1200px/s × 1/3초 = 400px`를 비행하며, 빗나감·비행 중 해제·취소 뒤 재발사 대기는 `0.50초`다. Rope Cut의 별도 차단시간과 부착 성공 상태는 이 reload를 대신하지 않는다.
- 모바일 가로 화면: 화면 하단 중앙에 `좌 이동 · 점프 · 우 이동` 조작 바를 배치한다. 점프는 화면 폭의 40%이며 좌우 버튼과 4~8px 간격을 둔다. 우측 위 토글은 현재 `로프 조준` 또는 `액션 조준` 모드를 표시한다. 로프 조준에서 세 버튼을 제외한 화면은 로프 부착·드래그·해제에 사용하고, 액션 조준에서는 같은 화면 터치가 Rope pointer를 내리지 않은 채 실제 접촉 지점을 `aimWorld`로 만든다.
- 모바일 이동·점프는 PC 키보드와 동일한 `horizontal`, `vertical` 명령을 만들며 별도 게임 규칙을 두지 않는다.
- 버튼 판정과 Canvas 표시는 `MobileControlLayout`의 같은 사각형 정보를 사용한다.
- 로프 손가락은 `pointerId`로 추적하며 다른 터치가 기존 로프 조작을 빼앗지 않는다.
- 모바일 Rope·Action 조준점은 별도 위치 보정 없이 손가락이 닿은 실제 지점을 가리킨다. 활성 조준 gesture 중에는 토글을 바꾸지 않아 진행 중인 Rope release 또는 hold Action의 소유 pointer를 교체하지 않는다.
- 스윙 드래그 임계값은 고정 픽셀이 아니라 현재 Canvas의 짧은 변에 대한 비율로 계산한다. 화면 크기는 `PlayerCommand.viewport`에 포함되어 권한 주체에서도 같은 판정을 재현한다.
- 활성 로프 드래그가 브라우저 상단 UI로 빠지는 `pointerleave`, `pointercancel`, 창 포커스 상실 또는 문서 숨김으로 끝나면 로프 유지가 아니라 사용자의 해제 의도로 처리한다. 입력 상태를 먼저 정리하고, 렌더 프레임이 멈추기 전에 싱글의 공용 시뮬레이션과 멀티의 로컬 예측·즉시 전송을 한 번 실행한다. 화면 안의 정상 `pointerup`은 기존 고정 스텝에서 처리한다.

모바일 coarse pointer 환경은 Full HD `1920×1080` 데스크톱 기준 viewport를 화면 안에 맞추기 위해 현재 CSS 가로·세로 비율 중 작은 값을 기본 카메라 배율로 사용하고 `1.0`을 상한으로 둔다. 기존 Area/landmark의 authored `mobileZoom`은 절대 배율이 아니라 `0.72 = 기준 Shot 1.0`인 상대 비율로 합성해 구간별 확대·축소 의도를 보존한다. 싱글·멀티와 화면→월드 좌표 변환은 같은 최종 배율을 사용한다. coarse pointer 또는 900×500 이하의 짧은 가로 viewport에서 고정 상태 HUD는 240×92px 포맷으로 그리며, 모바일에서는 Canvas 조작 버튼과 중복되는 하단 조작 안내를 표시하지 않는다.

## 연속 Sector Runtime 계약

- 목표 authoring의 canonical root는 `SectorDefinition`이다. Sector는 3,840~4,800px 폭, 하나의 `sectorEntry`, 순서가 있는 landmark와 그 landmark가 소유하는 objective·encounter를 가진다. Stage 번호와 `areaId`는 새 Runtime 권위가 아니며 `legacyStageAlias`로만 migration·문서 대조에 남길 수 있다.
- encounter topology 권위는 `encounterId`, `slotId`, `position`, `activation`이다. fixed/pool 적 선택은 topology와 분리된 `enemySelection` payload가 소유하며 `fixedEnemyType` 또는 `allowedEnemyTypes` 중 정확히 하나만 선언할 수 있다. Phase 6 selector는 `slotId + runSeed + worldRevision`을 사용해 preview corpus를 결정적으로 resolve한다. validator와 Runtime resolver는 encounter와 selection payload에 `areaId`가 권위 필드로 들어오는 것을 거부하고, 빈/중복 pool이나 fixed+pool 동시 선언을 거부한다.
- `LegacyAreaSectorPreviewCatalog`는 build/startup source이고, `LegacyAreaSeamlessSectorRuntime`은 Sector 01~~03 legacy Stage 정의를 수정하지 않은 채 각 Sector local 좌표에서 `1 → 8` 세로 stack으로 compile한다. 각 landmark는 4,800px width와 실제 lateral city wing을 가지며, compiler는 local origin/bounds와 Sector world origin을 분리한다. future Boss room은 transition slot의 rise를 바꾸어 끼우므로 downstream landmark local origin·ID·콘텐츠는 유지한다. Sector 04~~06은 alias input이며 Runtime output에 넣지 않는다.
- Sector 01의 authored core 이동 순서는 각 `1-N/MAP-PREVIEW.html` 첫 primary SVG route의 endpoint가 소유한다. `Sector01AreaCatalog.routePoints`는 중간 발판·구조 Grip·낙하·재가속·최종 checkpoint까지 전부 기록하고, seamless compiler는 route pseudo-surface의 `x/y/topY`를 같은 world offset으로 옮긴다. 테스트가 HTML → Area Catalog → compiled `world.route` 좌표를 직접 비교한다. MAP HTML 자체를 Runtime 자산·collision으로 로드하지 않으며 city wing은 이 core flow 밖의 Sector 공간이다.
- `SectorProgressState`는 objective·논리 prerequisite·encounter·`collectedAccessModuleIds`만 소유한다. `currentSectorId/currentLandmarkId/visitedLandmarkIds`는 snapshot과 gameplay authority에 없다. Player별 `respawnAnchorId`는 Player runtime이 소유하며 Timer·Purge가 미정인 현재 사망 인원 수에서 공용 reset을 추론하지 않는다.
- Boss는 일반 Stage와 분리된 `BossStageSpec → generated BossStageDefinition → BossEncounterRuntime` 저작·실행 계약을 사용한다. Definition은 Arena·Phase·mechanic·HUD·transition과 Phase별 base HP·인원 multiplier·약점 고정 비율을 소유하고, Runtime은 Stage 시작 authenticated roster로 scaled HP/floor를 한 번 파생해 attempt·Phase·Carriage mechanism·participant·impact/hazard dedupe·snapshot을 소유한다. retry·join·leave는 scaling을 바꾸지 않고 late join은 즉시 참가한다. 일반 `ImpactTarget` 피해는 항상 받고 열린 약점은 현재 scaled Phase HP의 25%를 같은 causal impact에 추가하며 floor overflow를 버린다. `GameSimulation`은 현재 Boss Stage 공개 명령/event만 조정하고 Sector compiler는 source→Boss→target connector와 완료 barrier를 소유한다. `BossHudPresentation`과 world renderer는 public snapshot DTO만 소비하며 Timer·collapse는 범위 밖이다.
- 0.46.0 default `GameSimulationFactory`는 `seamless-sector-runtime-v9`을 사용한다. Access topology의 공통 계약은 Sector마다 공용 Module source 정확히 3개를 저작하고 다음 Sector transition에 세 모듈 전부를 요구하는 `3-of-3`이다. Sector 01 source는 1-3·1-6·1-7, Sector 02는 2-2·2-5·2-7, Sector 03은 3-2·3-5·3-7의 기존 경비 slot이며 이후 Sector도 같은 수량 계약을 따른다. 현재 content-end Sector에 target Runtime Sector가 없으면 module source는 저작하되 존재하지 않는 transition을 생성하지 않는다. Sector 경계에는 `routeLockId`를 가진 명시적 transit device가 있고, source exit↔target entry overlap을 막는 T자형 force-field collider와 visual을 같은 `barrierSegments`에서 파생한다. 요구량 미달 중에는 현재 수집량과 부족량을 표시하며 실제 crossing을 막고 `3/3` 뒤에는 same-ID device를 open 상태로 바꾸면서 `blockedByRouteId` blocker만 비활성화한다. Sector seam과 Stage surface는 바뀌지 않는다. Sector 01~03 enemy slot은 Stage-local 위치·activation·수량을 보존하고 `enemySelection.allowedEnemyTypes`가 있을 때 type만 `slotId + runSeed + worldRevision`으로 결정한다. `WorldSnapshot` protocol v12는 공용 Sector 진행, Player별 `respawnAnchorId`, non-null Action state와 Enemy 선속도·collider snapshot을 함께 보내되 authored enemy 정적 정의는 `worldRevision + objectId`로 복원하고 동적 상태만 20Hz로 전송한다. legacy Area revision은 explicit compatibility factory로만 생성한다.
- 같은 Sector 안의 Stage·층간 route는 objective, savepoint 또는 Access module로 잠그지 않는다. connector collision surface는 Run 시작부터 같은 ID·geometry로 존재하며 진행 중 새 바닥처럼 생성되지 않는다. 수평 connector는 양쪽 authored deck 사이 실제 빈 구간만 같은 deck 높이로 채우며, deck이 이미 닿거나 겹치면 surface를 만들지 않는다. anchor 중심 전체를 잇는 큰 platform은 금지한다. 각 Stage 경계의 city wing은 authored core 양쪽에서 64px 떨어져 최소 Player 지름+16px의 하강 개구부를 남기며, source/target deck·seam·wing을 합친 충돌 구간이 Sector 전체 폭을 봉인해서는 안 된다. 따라서 위로 진행한 뒤에도 놓친 Access Carrier나 세이브 지점으로 직접 내려갈 수 있다. Stage별 Gate·exit panel·포탈·문 visual은 만들지 않으며 위치를 순간이동하거나 Gate portal event를 만들지 않는다. Sector transit device만 이 층간 자유 이동 규칙의 명시적 예외다.
- 공용 `route-unlocked` 사건이 Sector transit device를 열면 싱글과 모든 멀티 클라이언트는 재사용 가능한 camera unlock presentation을 즉시 시작한다. presentation 입력은 event ID, focus world position, 선택적 zoom과 travel/hold/return duration뿐이며 특정 Sector ID나 device renderer를 알지 않는다. v1 기본은 총 1.2초 안의 짧은 이동·개방 확인·기존 camera 복귀다. 이 표현은 authoritative world tick, 적·투사체, Player 입력·피격을 멈추거나 무적을 부여하지 않는다. skip, 화면 밖 피해 보호, 늦은 합류 replay와 동시 unlock queue 정책은 후속 범위다.
- `src/game/world/sectors/`, `SectorDefinitionValidator.js`, `SectorProgressState.js`와 `SectorProgressController.js`는 시나리오 통합 fingerprint의 별도 `authored-sector-sha256`로 감시한다. Area migration source와 Sector Runtime source의 현재 상태를 각각 기록한다.

## 현재 게임 시스템

- `createLegacyAreaSeamlessSectorRuntimeWorld()`가 Sector 01·02·03의 24개 legacy Stage를 3개 4,800px Sector의 24 landmark로 조립한다. `CURRENT_AUTHORED_AREA_CATALOG`와 `assembleAuthoredWorld()`는 이전 revision compatibility에 남는다. Sector 04의 8개 Area는 standalone catalog 상태다.
- `GameSimulation`이 Sector objective·route·content boundary와 플레이어별 진행 상태를 권위 상태로 보존한다.
- 사망 재개는 월드와 공용 진행을 유지한 채 사망 Player 자신의 `respawnAnchorId`로 복귀한다. 각 anchor는 `StageSavePointGeometry`가 계산한 `triggerBounds`와 `level/radius/label` 표현 metadata를 포함하고 polygon·pixel renderer가 같은 최외곽 bounds 안에 `STAGE SAVE` 구조물을 그린다. player circle과 trigger가 겹치면 공용 `landmark-entered`와 별도로 해당 Player 체크포인트만 갱신하고, 저장 지표·cue·`stage-saved` 안내도 당사자에게 한 번 만든다. 전원 사망도 공용 진행을 초기화하지 않는다.
- 1-4·2-3·3-5 explicit Augment Node 선택은 `PlayerCommand`의 좌우·점프 명령을 사용한다. `InputSampler`는 실제 W/위쪽/모바일 점프 pointer-down마다 `interactSequence`를 한 번 증가시키며 Player command v5가 이를 보존한다. 선택창은 열린 프레임의 sequence보다 큰 새 누름만 Confirm으로 인정하므로 held W, key repeat, 일시적인 neutral network sample이 선택으로 바뀌지 않는다. 선택 중인 플레이어의 gameplay 명령만 중립화하며 공용 월드·전투·동료는 계속 진행한다.
- Augment 선택 피드백은 `eventFlash`의 일시 이벤트로 렌더러에 전달하며, 영구 선택 상태와 분리한다.
- 정적 Sector surface, 독립 objective, Player별 savepoint respawn, 전원 사망 진행 보존과 마지막 content boundary는 관련 validator와 실제 브라우저·멀티플레이 smoke에서 확인한다.
- `RunMetrics`는 렌더러나 입력 장치가 아니라 `GameSimulation`의 실제 이벤트에서만 증가한다. 기본 Runtime은 `landmarkTiming`으로 현재 landmark 체류와 route 진행 시간을 기록하며 legacy revision만 `areaTiming`을 유지한다.
- 디버그 수치 표시는 설정 버튼을 1초 길게 눌러 여는 패널에서만 켜는 옵트인 개발 표시이며 `GameApp`·`MultiplayerGameApp`과 렌더러에만 전달되고 `PlayerCommand`나 게임 규칙에는 포함하지 않는다. 저장된 legacy Stage 선택은 새 싱글 생성에서 canonical landmark alias로 해석한다. 실행 중 적용 버튼은 싱글의 `SectorProgressState`와 `respawnAnchorId`를 선택 landmark 기준으로 다시 만들고, 멀티에서는 서버 `debug-teleport`가 같은 shared progress reset과 요청 플레이어 전이를 확정한다. 새 멀티 채널의 최초 world revision 선택은 계속 서버 세션이 소유한다.
- Area definition의 `storyTriggers`는 시나리오 기획 인벤토리이며 assembled world와 presentation runtime에 복제하지 않는다. 실제 Story 출력은 `AuthoredStoryPresentation`의 area entry·position, `trigger/story-display` cue, objective/gate event binding만 소유한다. gate-panel과 gate visual에 소비되지 않는 cue 배열을 두지 않으며, Story 완료 판정은 실제 출력 순서를 회귀 테스트해 증명한다.
- Access Scan Field는 공용 `elapsedSeconds`에서 AVAILABLE/WARNING/LOCKED/RESET을 계산해 새 Rope attachment eligibility와 scene `accessScanStates`를 함께 만든다. 공용 surface overlay는 네 phase를 색뿐 아니라 solid/dash, chevron, X, outline box 형태로 구분하며 sprite·polygon profile이 같은 overlay를 사용한다. phase는 별도 network event가 아니라 동기화된 world clock에서 결정적으로 재생한다.
- 사망·낙사는 공용 player reset 경로를 사용하되 default Sector Runtime에서는 사망 Player의 체크포인트 상태가 가리키는 anchor로 복귀한다. 사망한 플레이어의 물리·입력·체력·로프 발사 shot만 초기화하며 동료와 공용 진행은 유지한다. 현재는 same-tick 전원 respawn도 `sector-reset`을 발생시키지 않는다.
- Augment offer는 플레이어별 선택·pending entitlement·consumed source 상태만 소유하며 `GameSimulation`의 시간·전투를 멈추지 않는다. 선택 중인 플레이어의 메뉴 입력만 중립 게임 명령으로 치환한다.
- 보상 Canvas 오버레이는 반투명 배경과 실시간 전투 경고를 사용해 선택 카드와 진행 중인 위험을 동시에 보여준다.
- `RewardSelection`은 세 explicit Node에서 동일한 결정적 3장 offer의 카드 이동·Confirm·진입 Input Gate를 공유한다. 고정 Foundation/Specialization tier를 별도 선택 시스템으로 복구하지 않는다.
- `FoundationAugmentState`라는 호환 class 이름은 Player별 최대 6장 generic loadout, consumed source와 순간 runtime window를 소유한다. 카드 효과는 기존 Rope/Action 사건에서 한 번만 판정하고 이름과 무관한 전역 분기를 추가하지 않는다.
- `interact-choice`는 개인 chooser 요청을 만들고 현재 채널 Player 전원의 해당 source 소비가 끝나면 공유 objective를 한 번 완료한다. 완료 뒤 합류 Player도 같은 Node에서 자기 chooser를 열 수 있으며 선택 카드·consumed source는 개인 부활·재접속·전원 사망 뒤 유지된다.
- 고정 HUD는 local Player의 좌표 기반 Stage, HP, 다음 Action charge cooldown과 generic Augment를 표시한다. 데스크톱·모바일 공통 `HUD 숨김/표시` 버튼은 이 고정 상태 HUD, Access 패널과 하단 조작 안내를 함께 토글하며 기본값은 표시다. 이 값은 각 클라이언트의 표현 상태로만 소유하고 gameplay command나 network snapshot에 넣지 않는다. local/remote Player 머리 위에는 HP+cooldown 두 bar를, viewport 내 모든 Enemy 머리 위에는 HP bar를 토글과 무관하게 항상 표시한다. fixed/overhead cooldown은 같은 resolver의 `rechargeRemaining/rechargeDuration`과 `chargesRemaining/maxCharges`를 사용한다.
- Access 위치 안내는 authored 문자열을 사용하지 않는다. 공용 resolver가 local Player의 현재 Sector에서 미수집 module을 거리·Stable ID 순으로 정렬해 최대 3개를 고르고, 가까운 대상일수록 큰 clamp scale을 edge arrow와 world-space diamond에 동일하게 적용한다. viewport 밖 대상은 safe-area edge arrow, 화면 안 대상은 `AccessModuleSignalRenderer`의 무문자 diamond 하나만 사용하므로 두 표현의 합은 남은 선택 대상 수와 같다. 좌측 화살표는 고정 HUD 아래로, 상단 화살표는 설정/HUD 버튼 오른쪽으로 밀고 모바일은 하단 조작 영역을 제외하며 같은 edge의 최대 3개는 방향을 유지한 채 분산한다. guide는 고정 HUD와 같은 로컬 표시 토글을 따른다.
- `SectorProgressController`는 모든 objective를 전역 Stage cursor 없이 자기 trigger/source와 prerequisite로 평가한다. savepoint는 모든 anchor를 같은 collision resolver로 검사하고 낮은 checkpoint 재접촉은 Player anchor를 후퇴시키지 않는다.
- `CommandReplay`는 게임 규칙 밖에서 불변 명령 타임라인을 기록·재생하고 권위 스냅샷의 결정성 다이제스트를 비교한다.
- `PlayerCommandBatch`는 목표 틱과 플레이어별 단조 증가 `sequence`를 보존하고 플레이어 ID 순으로 정규화하는 전송 계약이다. 권위 서버는 이 순서 번호로 중복·역순 입력을 거부한다.
- `AuthorityCommandInbox`는 승인 순서와 허용 틱 범위를 검사하고, 승인된 명령을 목표 틱별로 한 번만 제공한다. 이 상태는 게임 규칙이 아니라 권위 전송 경계에 머문다.
- `WorldSnapshotEnvelope`는 승인 번호, 중립 월드의 `serverTick`, 각 플레이어 상태를 만든 `ownerMotionTick`, 비예측 상태와 권위 이벤트를 묶고 예측 가능한 객체의 반복 위치 배열을 거부한다.
- `AuthoritySnapshotBuilder`는 로컬 렌더 스냅샷과 별도로 플레이어·적·진행 상태만 추출한다. 지형은 월드 시드와 생성 revision으로 재구성하고 투사체는 drain한 이벤트로만 전달한다.
- 멀티 연결 종료는 게임을 멈추고 모드 메뉴로 돌아가며 마지막 4자리 채널을 입력란에 보존한다. 자동 오프라인 진행이나 플레이어 런타임 복원은 하지 않는다.
- `PlayerRuntimeFactory`는 `PlayerObject`, 별도 `RopeObject`, `AutomaticWeaponObject`와 Has-A 컴포넌트를 조립하고 소유자별 `InputDrivenObject` 등록 목록을 반환한다. 객체 종류별 규칙을 팩토리에 넣지 않는다.
- `GameSimulation.addPlayer()`는 같은 팩토리 결과를 공용 `players` 배열에 등록한다. 생성자의 첫 플레이어도 이 경로를 사용하고 그 ID만 비공개 기본 플레이어 식별자로 보존한다.
- 조준점, 부착 후보, 포인터 전이, 부착 버퍼, 로프 발사 shot/cooldown과 스윙 드래그는 `RopeObject`가 소유한다. 첫 플레이어의 컴포넌트를 중복 가리키는 싱글 호환 필드는 두지 않는다.
- 외부 실행 계층은 `getPrimaryPlayerId()`, `playerState()`·`playerStates()`, `applyOwnerMotion()`, 예측 복원·진행·피격·충돌 명령을 사용한다. 서버 세션과 로컬 예측기는 `players` 배열이나 플레이어 컴포넌트를 직접 수정하지 않는다.
- 이동·점프와 로프 입력은 각각 `LocomotionInput`, `RopePointerInput` capability로 전달한다. 적 공격·자동 무기·양측 투사체 운동과 클라이언트 충돌도 각 `SimulationDrivenObject`의 capability로 한 번만 구현하며, `GameSimulation`은 소유자 입력 그룹과 이름 있는 시뮬레이션 단계를 일정 순서로 실행한다. 실행 위치는 Is-A 정체성과 별개이므로 서버가 궤적을 진행하는 투사체도 피해·공격 클라이언트에서 `client-projectile-collision` capability를 실행할 수 있다.
- `stepCommandBatch`는 싱글과 소유 클라이언트 예측에서 정확히 다음 틱의 플레이어별 명령을 같은 `players` 배열에 적용한다. 로컬 예측은 `InputStateSimulator`로 마지막 입력을 제한된 틱 동안 유지하고, 만료 뒤에는 이동 축을 중립화하되 마지막 포인터·viewport·조준 상태를 보존한다. 멀티 서버는 같은 스케줄러를 `advanceInputDrivenObjects: false`로 실행해 플레이어·로프 입력 물리를 다시 적분하지 않고 최신 적용 `owner-motion`을 연속 상태 원점으로 유지한다.
- `PlayerCommand.interact`는 augment Node·명시적 terminal 같은 근접 문맥 상호작용 의도다. `InputSampler`는 PC `W/↑`와 모바일 점프 버튼을 점프 축과 `interact`에 함께 매핑하며, 진행 시스템은 명시적 source의 반경 안에서만 이를 소비한다. Stage route는 exit panel 상호작용이 아니라 objective reach가 자동으로 연다. 따라서 별도 PC 상호작용 키를 추가하지 않고 source 밖에서는 기존 점프 동작을 그대로 유지한다.
- `respawnPlayerAtCheckpoint`는 부활한 playerId·원인·위치·체력을 `player-respawned` 사건으로 남긴다.
- 각 사망자는 자기 Player state의 `respawnAnchorId`가 가리키는 최근 접촉 landmark(Stage)의 안전한 entry에서 독립 부활한다. 아직 직접 접촉하지 않은 landmark anchor는 그 Player에게 복원할 수 없다. 다른 Player의 전진·부활과 같은 tick 전원 사망은 이 값을 바꾸지 않으며 공용 reset은 향후 Timer/Purge의 명시적 사건으로만 추가한다.
- 적은 사거리 안의 살아 있는 플레이어 중 최근접 대상을 선택하고 거리 동률은 ID로 결정한다. 적 투사체의 생성·직선 궤적·8초 수명은 서버가 진행한다. 각 피해 클라이언트가 자기 예측 위치에서 로프를 몸체보다 먼저 판정해 playerId가 있는 claim을 보내며, 서버 고정 스텝은 지연된 플레이어 위치로 충돌을 먼저 만들지 않는다.
- 현재 구현된 마지막 영역 `sector-03-08`은 다음 시나리오가 아직 연결되지 않은 content boundary이며 `completed` 전체 게임 종료로 판정하지 않는다.
- `GameSimulation`이 플레이어·로프·적·투사체·체력·낙하 피해·사망·플레이어별 active Stage checkpoint 부활을 소유한다. legacy 메서드명 `respawnPlayerAtCheckpoint()`는 대상 Player state의 `respawnAnchorId`를 소비한다. `PlayerPhysics`는 공중→접지 전이와 충돌 보정 전 속도만 보고하고, `FallDamage`가 `800~1400px/s` 구간을 최대 체력 `0~50%`로 선형 계산하며 `GameSimulation`이 HP·지표·피드백·부활을 한 번 전이한다.
- `AutomaticWeaponObject`와 플레이어 투사체 spawn/hit claim은 보존하지만 기본 플레이어에서는 `isEnabled = false`다. 현재 기본 공격은 플레이어 Has-A `RopeImpactAttack`이 로프 부착·최소 속도·적 원형 겹침의 새 진입을 감지하고, 충돌 속력 `1000px/s → 100 피해` 비례식을 적용한다. 싱글은 즉시 적 HP를 적용하며 멀티는 공격자 예측 피드백 뒤 `rope-impact` claim으로 서버 소유 적 HP와 resolve 사건을 확정한다.
- `RopeImpactAttack`은 소유 클라이언트에서 현재 겹친 적 ID 집합을 소유해 같은 접촉의 반복 피해를 막고, 분리 뒤 재진입 때만 새 prediction ID를 만든다. 서버는 claim 소유권·tick·prediction ID 중복·claim 속력으로 재계산한 공식 피해와 대상 생존/tombstone을 검증하며 로프 부착·적 위치·접촉 집합을 지연된 복제 상태로 다시 만들지 않는다.
- 적은 플레이어를 향해 투사체를 발사한다. 적 탄환의 플레이어 피해와 아래의 플레이어 impact 수렴 계약은 유지한다.
- 적 투사체는 로프와 먼저 충돌해 로프를 끊고 재부착을 잠시 막으며, 본체에 맞으면 피해와 넉백을 준다.
- `CombatFeedback`은 판정 이벤트를 수명 기반 충격파·파편·피해 숫자·월드 흔들림으로 변환한다. `ClientCombatFeedback`은 local presentation facade이며 factory가 조합한 `EnemyCombatFeedback`·`WindCombatFeedback`·`ProjectileCombatFeedback`이 같은 최소 feedback 계약을 override한다. Enemy 상태 상위 class의 `project()`가 predicate 판정과 표현 호출 순서를 공통 소유하고 구체 상태 class는 `EnemyFeedbackDefinition`을 생성자로 받는다. Enemy type·state·preset·stable key raw 문자열은 `ENEMY_TYPE`과 feedback definition에만 있고 실행 class는 definition을 사용한다. Player/Rope 표현 ID와 재사용 수치는 `PlayerRopeFeedbackDefinition`이 소유하며 기본 동작은 default parameter로 받아 호출부에 raw 수치를 두지 않는다. Player/Rope detached snapshot의 이전·현재 sample lifecycle은 후속 component 경계로 분리하기 전까지 facade가 유지한다. 판정 시스템은 Canvas를 직접 참조하지 않는다. 재사용 파티클 preset·DTO와 renderer 경계는 [`particle-system.md`](./particle-system.md)가 소유하며, renderer는 particle shape/material만 해석한다.
- 클라이언트 피드백 사건은 `ClientFeedbackEventInterpreter`가 enum/definition predicate로 해석하고, facade는 event type을 분기하지 않는다. 공용 사건은 모든 참가자 화면의 링·파티클과 원격 Player animation으로 투영하고 개인 사건은 definition의 `personalViewerId`와 현재 viewer가 일치할 때만 화면 흔들림·피해 강조·로프 절단 경고를 만든다. ephemeral event를 `SimulationDrivenObject`나 one-use capability로 감싸지 않는다. `ClientStatusFeedback`은 별도 status definition으로 `player-respawned`를 `sector-respawn | checkpoint-respawn` DTO로 투영하고 causal ID 중복 제거·2.2초 수명을 로컬 소유한다. 렌더러와 앱은 사건 종류별 참가자 분기를 소유하지 않는다.
- 멀티 WebSocket message ID는 `MultiplayerMessageDefinition`이 한 번 소유한다. 서버의 `ClientMessageRouter`와 클라이언트의 `RemoteServerMessageRouter`는 방향별 frozen handler registry로 message를 전달하며 `MultiplayerGameServer`와 `RemoteGameAuthority`는 message type 조건문을 소유하지 않는다. 새 protocol message는 공통 ID와 양방향 중 필요한 구체 handler를 함께 추가한다.
- 첫 화면에서 싱글은 `PlayerCommand → LocalAuthority → GameSimulation`, 멀티는 `4자리 채널 → 고정 WebSocket 서버 → 채널별 AuthorityServerSession → GameSimulation` 경계를 선택한다. 두 경로는 입력 출처와 상태 전달만 다르고 게임 규칙을 공유한다.
- 협동은 소유 클라이언트 권한과 서버 중립 월드 권한을 분할한다. 서버의 주역할은 소유 상태·사건 검증과 복제 공유이며, 시간 모델·상태 소유권·스냅샷과 거부 복구 계약은 `multiplayer-synchronization.md`를 기준으로 한다.
- `MultiplayerGameApp`은 `RemoteGameAuthority.snapshot()`과 공개 명령만 사용한다. `OwnerPredictionRuntime`도 로컬 `GameSimulation`의 공개 소유자 예측 계약만 사용하며, 앱·예측 런타임·서버 세션 어느 쪽도 중첩된 플레이어 컴포넌트 내부로 들어가 직접 읽거나 수정하지 않는다.
- 투사체와 같은 예측 가능한 객체는 위치를 계속 전송하지 않고 권위 `spawn` 이벤트의 시작 틱·초기 상태로 각 실행 환경에서 진행한다. 서버 `CombatSystems`와 클라이언트 `PredictableProjectileStore`는 단일 `projectile-motion` capability를 실행하고, 공통 `PhysicsMixin`이 Player·Enemy와 같은 적분을 소유하며 Projectile은 lifetime mixin과 선택적 Homing steering만 추가한다. 저장소·서버·구체 class에 별도 궤적 공식을 두지 않는다. 충돌·claim 확정·수명 만료만 `resolve` 이벤트로 확정하고 원래 spawn 이벤트는 활성 객체에 보존해 중간 입장 welcome에서만 같은 ID로 재전송한다.
- 플레이어 자동 무기는 조합된 collider의 `outsidePointToward()`로 대상 방향 몸체 바깥 발사점을 계산한다. 소유자 예측이 만든 위치를 서버가 승인된 spawn 사건에 그대로 사용하며, 서버 현재 위치에서 총구를 재계산해 claim을 거부하지 않는다. renderer도 총구 위치나 collider 형상을 다시 해석하지 않는다.
- 자기 탄환은 `EnemyHitPrediction` 믹스인이 로컬 충돌 VFX와 검증 가능한 hit claim을 한 번 만든다. 첫 로컬 충돌에서 탄환 수명은 소비되며 claim 거부가 같은 탄환을 겹친 위치에 복구해 추가 피격을 만들지 않는다. 서버는 연결 소유권·탄환·대상·tick·중복을 검사하고 서버 소유 탄환 대미지로 검증된 결과를 다른 복제본에 공유한다. 서버 현재 위치·궤적과 공격 클라이언트가 본 지연 표본의 차이는 거부 조건이 아니다. 중립 적 탄환도 피해 클라이언트가 충돌을 인식한 순간 소비하며, 거부 receipt가 객체를 다시 표시하거나 같은 겹침에서 재발화하게 하지 않는다.
- `GameSimulation`은 권위 틱을 증가시키며 중립 자동 발사·투사체 궤적과 검증된 피해자 피격·로프 절단 claim에서 복제 이벤트를 기록한다. 서버 고정 스텝은 플레이어 피격을 직접 만들지 않으며 전송 계층이 사건을 drain한 뒤에도 검증용 투사체 배열은 유지된다.

## 증강 v1 구성과 전투 사건

- `FoundationAugmentState`라는 호환 클래스명은 generic selected card IDs와 소비한 source IDs만 소유한다. 과거 Foundation gameplay state를 병렬 유지하지 않는다.
- `ActionAugmentState`는 Action 공통 입력 edge·activation sequence·charge·recharge와 기존 snapshot 형식만 소유한다. Punch·DirectionDash·DashStrike·InstantGuard·PushAway·StraightShot·SlowFall 구체 `ActionDefinition`이 activation·월드 실행·종료 predicate를 override하고 `AugmentCombatRuntime`은 실행 context와 결과 연결만 조정한다. Signature는 구체 capability definition으로 Action에 선택 조합하며 Trail·Shield·Action projectile·접촉 membership은 각각 Has-A 상태 컴포넌트가 소유한다. Action projectile은 공통 `PhysicsMixin`의 position·velocity·acceleration 적분을 사용한다. Action·Signature·modifier ID와 event key는 단일 definition enum이 소유하고 고정 Catalog·formula·class registry는 frozen object lookup을 사용하며 `Map`·`Set`은 실행 중 변하는 contact·piercing membership에만 남긴다. 모든 Player는 생성 시 built-in `default-punch`를 기본 loadout으로 가지며, 증강 Action을 얻으면 같은 공통 상태의 loadout만 교체한다. 별도 punch cooldown 필드는 두지 않고 과거 `punchCooldownRemaining`만 전용 restore migration 입력으로 소비한다. `PlayerRuntimeFactory`가 이 runtime을 loadout과 함께 Has-A로 조립한다.
- Rope 기본값은 `ROPE_CONFIG` 한 곳에서 시작하고 selected card의 percentage modifier로 effective config를 만든다. launcher와 fixed rope는 같은 effective config 참조를 사용한다.
- `resolveEffectiveRopeConfig`는 DebugSettings의 부분 override를 유한 범위 안에서 완전한 immutable base config로 만든다. `GameSimulation`은 생성 시 이 base와 `ropeDisabledSeconds`를 주입받고 Player·launcher·rope·attachment candidate·render snapshot이 같은 참조를 소비한다. 싱글 적용은 기존 앱을 정지하고 새 `GameApp`·`GameSimulation`을 생성하는 restart 경계이며 살아 있는 Run hot swap과 멀티 session override는 지원하지 않는다.
- owner client가 만든 모든 증강 적 피해는 `AugmentImpactClaim`으로 수렴한다. `PlayerEnemyImpactResolver`는 shield → damage → lethal/no-knockback → survivor knockback 순서만 소유하며 카드별 trigger를 알지 않는다.
- 제거한 적은 `EnemyImpactTombstones`에 남겨 지연 claim을 arbitrary missing ID와 구분한다. tombstone no-op은 복제 사건이나 presentation을 만들지 않는다.
- enemy knockback은 behavior 내부를 직접 수정하지 않는 public transient state다. `EnemyMobility`가 플레이어를 직접 추격·돌진하는 Pursuit/Swarm만 displacement 대상으로 분류한다. 고정 Sentry/Turret, authored Patrol 경로 적과 제자리 Shield/Artillery/Support는 damage·defeat·hit feedback을 유지하되 `impactDisplacementEnabled = false`로 위치 넉백과 wall-impact 파생을 만들지 않는다. 명시적 false는 Pursuit/Swarm도 추가로 고정할 수 있지만 고정 계열을 true로 opt-in할 수 없다.
- chooser와 전투의 전체 수치·호환 계약은 [`augment-v1.md`](./augment-v1.md)를 따른다.

## 의존 방향

`game → core/render/game-kit` 방향만 허용한다. `game-kit`은 캐릭터, 로프, 월드, UI 같은 프로젝트 게임 규칙을 가져오지 않는다. 데스크톱과 모바일, 싱글과 멀티는 별도 게임 로직을 만들지 않고 입력 명령의 출처와 상태 전송 방식만 교체한다.
