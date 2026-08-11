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
4. `FixedStepRunner`가 렌더 프레임과 무관하게 1/120초 단위로 게임 상태를 갱신한다.
5. `CanvasRenderer`는 시뮬레이션 스냅샷과 입력 표시 상태만 받아 화면을 그린다.

## 게임 객체 모델

```text
GameObject
├─ InputDrivenObject ── 소유 사용자 입력에 즉시 반응
│  ├─ PlayerObject + LocomotionInput
│  └─ RopeObject   + RopePointerInput
└─ SimulationDrivenObject ── 직접 입력 없이 서버 고정 스텝에서 진행
   ├─ EnemyObject
   ├─ AutomaticWeaponObject
   └─ ProjectileObject

InputSampler → 불변 입력 프레임 → InputDispatcher
                                  └─ capability가 있는 소유 InputDrivenObject만 호출
```

- `InputDrivenObject`와 `SimulationDrivenObject`는 실행 위치가 아니라 상태 변화 원인의 Is-A 정체성이다. 서버는 입력 주도 객체 claim을 검증할 복제 상태를 가지며 클라이언트는 시뮬레이션 주도 객체를 표시·보간할 복제 상태를 가질 수 있다.
- 플레이어와 로프는 별도 `InputDrivenObject`다. 플레이어는 물리·체력·아티팩트를 Has-A로 소유하고, 로프는 부착·장력·드래그 상태를 독립 소유한다. 소유 관계는 ID와 공개 계약으로 연결한다.
- 적과 직접 조작하지 않는 자동 행동 객체는 `SimulationDrivenObject`다. 서버가 진행하되 플레이어 피격처럼 사용자 체감과 만나는 사건은 피해 클라이언트가 먼저 반응하고 서버가 권위 객체 상태로 검증한다.
- 멀티는 권한 감각만 보면 P2P형이다. 플레이어별 `InputDrivenObject` 결과는 해당 소유자·피해자 클라이언트가 먼저 결정하고, 특정 클라이언트에 귀속할 수 없는 몹과 적 투사체 같은 `SimulationDrivenObject`의 생성·궤적은 서버가 중립적으로 진행한다. 서버는 지연된 플레이어 복제 위치로 충돌을 먼저 확정하지 않고 피해 클라이언트 claim을 중립 객체 상태로 검증한다.
- 사건 전파와 지속 상태 수렴을 같은 것으로 취급하지 않는다. `InputDrivenObject`의 지속 상태는 서버가 검증한 최신 소유자 상태를 서버와 동료가 따라가고, `SimulationDrivenObject`는 서버 상태를 모든 클라이언트가 따라간다. 소유자는 정상 승인 중 서버 지연 위치로 되감기지 않으며 상태 전송 거부 때만 마지막 공유 상태에서 미확정 입력을 재실행한다.
- 체크포인트처럼 `InputDrivenObject`의 위치가 공용 월드 전이를 만나는 사건은 소유 클라이언트가 즉시 피드백과 claim을 만들고 서버가 공용 상태를 멱등 확정한다. 서버 복제 시뮬레이션은 같은 위치 조건으로 별도 사건을 시작하지 않으며 싱글 자동 감지와 서버 claim은 하나의 도메인 활성화 메서드를 공유한다.
- 정상 도달도 같은 경계를 따른다. 도달한 소유 클라이언트가 완료 화면과 summit claim을 먼저 만들고, 서버는 최신 검증 소유자 위치로 확인한 첫 claim만 공용 런 완료로 전이한다. 완료 상태는 스냅샷으로 모든 참가자에게 수렴하며 서버 복제 위치의 별도 자동 판정은 두지 않는다.
- 입력 capability는 `Base => class extends Base` 믹스인으로 구현한다. 이동·점프는 `LocomotionInput`, 로프는 `RopePointerInput` 계약을 가지며 `InputDispatcher`는 구체 클래스나 `instanceof` 분기 없이 capability 존재 여부로 전달한다.
- 싱글은 입력 주도 역할과 시뮬레이션 주도 역할이 한 프로세스에 함께 있을 뿐 같은 객체 분류와 디스패치 경계를 사용한다. 멀티는 그 경계 사이에 입력·claim·snapshot 전송만 추가한다.
- `GameSimulation`은 객체별 게임 규칙을 직접 모으는 거대 분기점이 아니라 월드 등록, 고정 tick, 객체 단계 실행과 사건 연결을 조정하는 월드 스케줄러로 축소한다.
- `OwnerPredictionRuntime`은 소유 `InputDrivenObject` 집합의 입력 이력·예측 tick·권위 전이·표시 보정만 조정한다. 이동·로프·전투 규칙은 런타임에 넣지 않고 객체 capability와 시뮬레이션 단계에 둔다.

### 적용된 마이그레이션 순서

1. 기존 플레이어·로프·2인 동기화·부활 동작을 회귀 테스트로 고정한다.
2. `GameObject`, `InputDrivenObject`, `SimulationDrivenObject`와 capability 기반 `InputDispatcher` 계약을 추가한다.
3. 플레이어 이동·점프와 로프 입력을 별도 `InputDrivenObject`와 입력 믹스인으로 옮긴다.
4. 적·자동 무기·투사체를 `SimulationDrivenObject` 실행 단계로 옮긴다.
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

- 순수 함수 `generateWorld(config)`가 같은 시드에서 동일한 48단계 수직 암석 월드, 적 생성 위치와 8레벨 간격의 체크포인트를 만든다. 월드 생성은 객체 정체성이나 수명주기를 만들지 않는다.
- `GameSimulation`이 생성된 월드와 가장 높은 도달 지점을 권위 상태로 보존한다.
- 사망 재개는 월드와 체크포인트 진행도를 유지한 채 활성 지점으로 복귀하고, `ArtifactInventory`의 결정적 정책으로 최근 아티팩트 약 1/3만 제거한다.
- 첫 체크포인트의 아티팩트 선택도 `PlayerCommand`의 좌우·점프 명령을 사용하며, 선택 중에는 `GameSimulation`이 물리와 전투를 일시 정지한다.
- 아티팩트 획득·손실 정보는 `eventFlash`의 일시 이벤트로 렌더러에 전달하며, 영구 보유 상태와 분리한다.
- `rewardedCheckpointIds`가 체크포인트별 보상 수령 여부를 권위 상태로 보존해 재방문과 사망 복귀의 중복 지급을 막는다.
- `WorldTraversalValidator`는 생성과 분리된 순수 검사기로 연속 경로의 상승량과 로프 사거리 위반을 시드·레벨 단위로 진단한다.
- 재현해야 할 시드는 `worldRegressionSeeds.mjs`에 이유와 함께 보존하며, 일반 1,000개 시드 탐색보다 우선 검증한다.
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
- 이동·점프와 로프 입력은 각각 `LocomotionInput`, `RopePointerInput` capability로 전달한다. 적·자동 무기·양측 투사체는 `SimulationDrivenObject`이며 `GameSimulation`은 소유자 입력 그룹과 시뮬레이션 단계를 일정 순서로 실행한다.
- `stepCommandBatch`는 싱글과 소유 클라이언트 예측에서 정확히 다음 틱의 플레이어별 명령을 같은 `players` 배열에 적용한다. 로컬 예측은 `InputStateSimulator`로 마지막 입력을 제한된 틱 동안 유지하고, 만료 뒤에는 이동 축을 중립화하되 마지막 포인터·viewport·조준 상태를 보존한다. 멀티 서버는 같은 스케줄러를 `advanceInputDrivenObjects: false`로 실행해 플레이어·로프 입력 물리를 다시 적분하지 않고 최신 승인 `owner-motion`을 연속 상태 원점으로 유지한다.
- `PlayerCommand.interact`는 향후 문맥 상호작용을 위한 예약 필드다. 현재 생명 주기에서는 소비하지 않으며 모바일 점프 입력의 동작을 가로채지 않는다.
- `respawnPlayerAtCheckpoint`는 부활한 playerId·원인·위치·체력·손실 아티팩트를 `player-respawned` 사건으로 남긴다. 손실이 있으면 같은 playerId의 `artifact-loss` 사건도 발행한다.
- 여러 플레이어가 같은 틱에 사망해도 각자 독립 부활한다. 공용 적·투사체와 다른 플레이어의 위치·체력·아티팩트는 초기화하지 않는다.
- 적은 사거리 안의 살아 있는 플레이어 중 최근접 대상을 선택하고 거리 동률은 ID로 결정한다. 적 투사체의 생성·직선 궤적·8초 수명은 서버가 진행한다. 각 피해 클라이언트가 자기 예측 위치에서 로프를 몸체보다 먼저 판정해 playerId가 있는 claim을 보내며, 서버 고정 스텝은 지연된 플레이어 위치로 충돌을 먼저 만들지 않는다.
- 마지막 암석 위의 정상 목표도 시드 결과에 포함되며, 도달하면 하나의 큰 월드를 끝내는 `completed` 터미널 상태에서 판정을 멈춘다.
- `GameSimulation`이 플레이어·로프·적·투사체·체력·사망·플레이어별 체크포인트 부활을 소유한다.
- 기본 무기는 사거리 안의 가장 가까운 적을 자동 조준하며, 적은 플레이어를 향해 투사체를 발사한다.
- 적 투사체는 로프와 먼저 충돌해 로프를 끊고 재부착을 잠시 막으며, 본체에 맞으면 피해와 넉백을 준다.
- `CombatFeedback`은 판정 이벤트를 수명 기반 충격파·파편·피해 숫자·월드 흔들림으로 변환한다. 판정 시스템은 Canvas를 직접 참조하지 않는다.
- 첫 화면에서 싱글은 `PlayerCommand → LocalAuthority → GameSimulation`, 멀티는 `4자리 채널 → 고정 WebSocket 서버 → 채널별 AuthorityServerSession → GameSimulation` 경계를 선택한다. 두 경로는 입력 출처와 상태 전달만 다르고 게임 규칙을 공유한다.
- 협동은 서버 권위형과 로컬 플레이어 예측을 사용한다. 시간 모델, 상태 소유권, 스냅샷과 보정 계약은 `multiplayer-synchronization.md`를 기준으로 한다.
- `MultiplayerGameApp`은 `RemoteGameAuthority.snapshot()`과 공개 명령만 사용한다. `OwnerPredictionRuntime`도 로컬 `GameSimulation`의 공개 소유자 예측 계약만 사용하며, 앱·예측 런타임·서버 세션 어느 쪽도 중첩된 플레이어 컴포넌트 내부로 들어가 직접 읽거나 수정하지 않는다.
- 투사체와 같은 예측 가능한 객체는 위치를 계속 전송하지 않고 권위 `spawn` 이벤트의 시작 틱·초기 상태로 각 실행 환경에서 진행한다. 충돌·claim 확정·수명 만료만 `resolve` 이벤트로 확정한다. 원래 spawn 이벤트는 활성 객체에 보존해 중간 입장 welcome에서만 같은 ID로 재전송한다.
- 자기 탄환은 로컬 충돌 VFX를 먼저 재생하고 검증 가능한 hit claim을 보낸다. 서버는 연결 소유권·탄환·대상·tick·위치·중복을 검사하고 서버 대미지로 최종 결과를 확정한다.
- `GameSimulation`은 권위 틱을 증가시키며 중립 자동 발사·투사체 궤적과 검증된 피해자 피격·로프 절단 claim에서 복제 이벤트를 기록한다. 서버 고정 스텝은 플레이어 피격을 직접 만들지 않으며 전송 계층이 사건을 drain한 뒤에도 검증용 투사체 배열은 유지된다.

## 의존 방향

`game → core/render/game-kit` 방향만 허용한다. `game-kit`은 캐릭터, 로프, 월드, UI 같은 프로젝트 게임 규칙을 가져오지 않는다. 데스크톱과 모바일, 싱글과 멀티는 별도 게임 로직을 만들지 않고 입력 명령의 출처와 상태 전송 방식만 교체한다.
