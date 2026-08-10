# 프로토타입 아키텍처

## 현재 범위

마일스톤 1은 브라우저에서 실행되는 Canvas 런타임에 탄성 로프 이동, 48단계 수직 시드 지형, 플레이어 충돌과 카메라 추적을 제공한다. DOM UI는 Alpine.js를 사용하며 적과 아티팩트는 다음 마일스톤에서 추가한다.

## 모듈 구조

```text
index.html
└─ src/main.js
   └─ game/GameApp.js
      ├─ core/input/InputSampler.js
      ├─ core/sim/FixedStepRunner.js
      ├─ render/CanvasRenderer.js
      ├─ game/commands/PlayerCommand.js
      ├─ game/runtime/LocalAuthority.js
      ├─ game/simulation/GameSimulation.js
      ├─ game/config.js
      ├─ game/physics/PlayerPhysics.js
      ├─ game/rope/FixedLengthRope.js
      ├─ game/world/WorldGenerator.js
      └─ game-kit/index.js
         └─ math/Vector2.js
```

## 런타임 흐름

1. `InputSampler`가 브라우저 입력을 수집하고 동결된 snapshot을 만든다.
2. `FixedStepRunner`가 렌더 프레임과 무관하게 1/120초 단위로 게임 상태를 갱신한다.
3. `GameApp`이 입력을 게임 상태 변화로 해석한다.
4. `CanvasRenderer`가 현재 상태만 받아 화면에 그린다.

`GameApp`은 화면 좌표를 월드 좌표로 바꿔 부착 표면을 고른다. `FixedLengthRope`는 고정 반경 구속, `PlayerPhysics`는 중력·이동·충돌, `WorldGenerator`는 동일 시드의 수직 지형 생성을 각각 소유한다. 생성기는 연속 경로가 매 단계 위로 진행하고 로프 사거리 안에 있도록 보장한다. 실제 조작을 포함한 장거리 통과 검증은 다음 단계에 추가한다.

`PlayerPhysics`는 가로가 긴 지형을 단방향 발판으로 해석한다. 아래와 옆에서는 통과하고 위에서 떨어질 때만 착지한다. 이 충돌 분류는 로프 부착 가능 표면을 제한하지 않는다.

## 의존 방향

`game → core/render/game-kit` 방향만 허용한다. `game-kit`은 캐릭터, 로프, 월드, UI 같은 게임 규칙을 가져오지 않는다.
