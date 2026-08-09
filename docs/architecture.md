# 프로토타입 아키텍처

## 현재 범위

마일스톤 0은 브라우저에서 실행되는 Canvas 런타임과 결정적인 업데이트 기반만 제공한다. DOM UI는 Alpine.js를 사용하며, 로프, 절차 생성, 적, 아티팩트는 다음 마일스톤에서 추가한다.

## 모듈 구조

```text
index.html
└─ src/main.js
   └─ game/GameApp.js
      ├─ core/input/InputSampler.js
      ├─ core/sim/FixedStepRunner.js
      ├─ render/CanvasRenderer.js
      └─ game-kit/index.js
         └─ math/Vector2.js
```

## 런타임 흐름

1. `InputSampler`가 브라우저 입력을 수집하고 동결된 snapshot을 만든다.
2. `FixedStepRunner`가 렌더 프레임과 무관하게 1/120초 단위로 게임 상태를 갱신한다.
3. `GameApp`이 입력을 게임 상태 변화로 해석한다.
4. `CanvasRenderer`가 현재 상태만 받아 화면에 그린다.

향후 `SurfaceQuery`, `AnchorSelector`, `RopeConstraint`, `TraversalValidator`를 이 경계 안에 추가한다.

## 의존 방향

`game → core/render/game-kit` 방향만 허용한다. `game-kit`은 캐릭터, 로프, 월드, UI 같은 게임 규칙을 가져오지 않는다.
