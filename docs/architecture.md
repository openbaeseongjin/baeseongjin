# 프로토타입 아키텍처

## 현재 범위

브라우저 Canvas에서 실행되는 2D 로프 액션 프로토타입이다. 고정 길이 로프 물리, 절차 생성 암석 지형, 자동 전투, 적 투사체, 체크포인트 복귀와 아티팩트 런 상태를 공용 시뮬레이션에서 처리한다. PC와 모바일은 입력 방식만 다르고 게임 규칙은 공유한다.

## 주요 모듈

```text
index.html
└─ src/main.js
   └─ game/GameApp.js
      ├─ core/input/InputSampler.js
      ├─ core/input/MobileControlLayout.js
      ├─ core/sim/FixedStepRunner.js
      ├─ render/CanvasRenderer.js
      ├─ game/commands/PlayerCommand.js
      ├─ game/runtime/LocalAuthority.js
      ├─ game/simulation/GameSimulation.js
      ├─ game/combat/CombatSystems.js
      ├─ game/combat/CombatFeedback.js
      ├─ game/artifacts/ArtifactCatalog.js
      ├─ game/artifacts/ArtifactInventory.js
      ├─ game/life/PlayerLifeCycle.js
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
3. `LocalAuthority`가 명령을 `GameSimulation`에 전달한다. 향후 네트워크 권한 구현도 같은 명령과 시뮬레이션 경계를 사용한다.
4. `FixedStepRunner`가 렌더 프레임과 무관하게 1/120초 단위로 게임 상태를 갱신한다.
5. `CanvasRenderer`는 시뮬레이션 스냅샷과 입력 표시 상태만 받아 화면을 그린다.

## 입력 규칙

- PC: A/D 또는 방향키 이동, W 또는 위 방향키 점프, 마우스 누르기·드래그·해제로 로프 조작
- 모바일 가로 화면: 화면 하단 중앙에 `좌 이동 · 점프 · 우 이동` 조작 바를 배치한다. 점프는 화면 폭의 40%이며 좌우 버튼과 4~8px 간격을 둔다. 세 버튼을 제외한 화면은 로프 부착·드래그·해제에 사용한다.
- 모바일 이동·점프는 PC 키보드와 동일한 `horizontal`, `vertical` 명령을 만들며 별도 게임 규칙을 두지 않는다.
- 버튼 판정과 Canvas 표시는 `MobileControlLayout`의 같은 사각형 정보를 사용한다.
- 로프 손가락은 `pointerId`로 추적하며 다른 터치가 기존 로프 조작을 빼앗지 않는다.
- 모바일 로프 조준점은 별도 위치 보정 없이 손가락이 닿은 실제 지점을 가리킨다.
- 스윙 드래그 임계값은 고정 픽셀이 아니라 현재 Canvas의 짧은 변에 대한 비율로 계산한다. 화면 크기는 `PlayerCommand.viewport`에 포함되어 권한 주체에서도 같은 판정을 재현한다.
- `pointercancel`, 창 포커스 상실, 입력 계층 해제 시 눌린 상태를 정리한다.

모바일 coarse pointer 환경에서는 카메라 배율을 0.72로 낮춰 데스크톱보다 약 39% 넓은 월드 범위를 표시한다. 이때 화면 좌표와 월드 좌표 변환도 같은 배율을 사용하며, 플레이 공간을 확보하기 위해 데스크톱용 상단 상태 HUD는 그리지 않는다.

## 현재 게임 시스템

- `WorldGenerator`가 같은 시드에서 동일한 48단계 수직 암석 월드와 적 생성 위치를 만든다.
- `WorldGenerator`가 경로 8레벨 간격으로 결정적 체크포인트를 만들고, `GameSimulation`이 가장 높은 도달 지점을 권위 상태로 보존한다.
- 사망 재개는 월드와 체크포인트 진행도를 유지한 채 활성 지점으로 복귀하고, `ArtifactInventory`의 결정적 정책으로 최근 아티팩트 약 1/3만 제거한다.
- 첫 체크포인트의 아티팩트 선택도 `PlayerCommand`의 좌우·점프 명령을 사용하며, 선택 중에는 `GameSimulation`이 물리와 전투를 일시 정지한다.
- 아티팩트 획득·손실 정보는 `eventFlash`의 일시 이벤트로 렌더러에 전달하며, 영구 보유 상태와 분리한다.
- `rewardedCheckpointIds`가 체크포인트별 보상 수령 여부를 권위 상태로 보존해 재방문과 사망 복귀의 중복 지급을 막는다.
- `WorldTraversalValidator`는 생성과 분리된 순수 검사기로 연속 경로의 상승량과 로프 사거리 위반을 시드·레벨 단위로 진단한다.
- 재현해야 할 시드는 `worldRegressionSeeds.mjs`에 이유와 함께 보존하며, 일반 1,000개 시드 탐색보다 우선 검증한다.
- `RunMetrics`는 렌더러나 입력 장치가 아니라 `GameSimulation`의 실제 이벤트에서만 증가하며, 보상 선택과 패배 대기 시간은 활성 시간에서 제외한다.
- `?metrics=1`은 `GameApp`과 렌더러에만 전달되는 옵트인 개발 표시이며 `PlayerCommand`나 게임 규칙에 포함하지 않는다.
- 협동 부활은 `PlayerLifeCycle.updateReviveInteraction`의 상태·거리·시간 규칙을 사용하며 싱글 패배 판정과 같은 플레이어 배열을 공유한다.
- `CommandReplay`는 게임 규칙 밖에서 불변 명령 타임라인을 기록·재생하고 권위 스냅샷의 결정성 다이제스트를 비교한다.
- `PlayerCommandBatch`는 목표 틱과 플레이어별 단조 증가 `sequence`를 보존하고 플레이어 ID 순으로 정규화하는 전송 계약이다. 권위 서버는 이 순서 번호로 중복·역순 입력을 거부한다.
- `AuthorityCommandInbox`는 승인 순서와 허용 틱 범위를 검사하고, 승인된 명령을 목표 틱별로 한 번만 제공한다. 이 상태는 게임 규칙이 아니라 권위 전송 경계에 머문다.
- `WorldSnapshotEnvelope`는 승인 번호, 비예측 상태와 권위 이벤트를 묶고 예측 가능한 객체의 반복 위치 배열을 거부한다.
- `PlayerRuntimeFactory`가 물리·로프·무기·생명 엔티티를 함께 조립하고 싱글 GameSimulation도 이 결과를 사용한다.
- 마지막 암석 위의 정상 목표도 시드 결과에 포함되며, 도달하면 하나의 큰 월드를 끝내는 `completed` 터미널 상태에서 판정을 멈춘다.
- `GameSimulation`이 플레이어·로프·적·투사체·체력·다운·패배·체크포인트 복귀를 소유한다.
- 기본 무기는 사거리 안의 가장 가까운 적을 자동 조준하며, 적은 플레이어를 향해 투사체를 발사한다.
- 적 투사체는 로프와 먼저 충돌해 로프를 끊고 재부착을 잠시 막으며, 본체에 맞으면 피해와 넉백을 준다.
- `CombatFeedback`은 판정 이벤트를 수명 기반 충격파·파편·피해 숫자·월드 흔들림으로 변환한다. 판정 시스템은 Canvas를 직접 참조하지 않는다.
- 싱글 플레이도 `PlayerCommand → LocalAuthority → GameSimulation` 경계를 사용한다. 실제 네트워크 전송과 다인 월드 동기화는 아직 구현하지 않았다.
- 협동은 서버 권위형과 로컬 플레이어 예측을 사용한다. 시간 모델, 상태 소유권, 스냅샷과 보정 계약은 `multiplayer-synchronization.md`를 기준으로 한다.
- 투사체와 같은 예측 가능한 객체는 위치를 계속 전송하지 않고 권위 `spawn` 이벤트의 시작 틱·초기 상태로 각 실행 환경에서 진행한다. 충돌과 제거만 `resolve` 이벤트로 확정한다.
- `GameSimulation`은 권위 틱을 증가시키며 실제 자동 발사·피격·로프 절단·체크포인트 제거에서 복제 이벤트를 기록한다. 전송 계층이 사건을 drain한 뒤에도 로컬 렌더링용 투사체 배열은 유지된다.

## 의존 방향

`game → core/render/game-kit` 방향만 허용한다. `game-kit`은 캐릭터, 로프, 월드, UI 같은 프로젝트 게임 규칙을 가져오지 않는다. 데스크톱과 모바일, 향후 싱글과 멀티는 별도 게임 로직을 만들지 않고 입력 명령의 출처와 상태 전송 방식만 교체한다.
