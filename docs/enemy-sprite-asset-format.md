# 몹 스프라이트 리소스 교환 형식

이 문서는 일반 몹 sprite를 게임에 넣는 현재 기준이다. Player 전용 `sprite-manifest.json`을 재사용하지 않고, 투명 PNG atlas와 `enemy-sprite-manifest.json`을 `EnemySpriteManifest`가 불변 `EnemySpriteDefinition`으로 정규화한다. 생성 도구의 원본 배열과 metadata는 런타임 계약이 아니다.

## 공개 계약

- Schema: [`assets/runtime/characters/enemy-sprite-manifest.schema.json`](../assets/runtime/characters/enemy-sprite-manifest.schema.json)
- 현재 package: [`assets/runtime/characters/sector-01-enemies/`](../assets/runtime/characters/sector-01-enemies/)
- Loader: [`src/render/sprites/EnemySpriteManifest.js`](../src/render/sprites/EnemySpriteManifest.js)
- Definition: [`src/render/sprites/EnemySpriteDefinition.js`](../src/render/sprites/EnemySpriteDefinition.js)
- Validator: `npm run validate:enemy-sprite-assets -- <directory>`

Manifest v3는 atlas별 상대 PNG 경로, 실제 크기, 셀 크기와 몹 타입별 출력 크기·anchor·offset·기본 방향을 선언한다. 각 몹은 `EnemyPresentationState`가 공개하는 모든 상태를 빠짐없이 가져야 하며, 상태는 `loop + frames` clip 또는 같은 몹 안의 다른 상태로 가는 명시적 `fallback` 중 하나만 가진다. 각 frame은 atlas ID, 0부터 시작하는 cell과 양의 정수 `durationMs`를 가지며 배열 순서가 재생 순서다. `loop: false`인 clip은 마지막 frame에서 고정된다. Alias는 legacy runtime ID를 package 안의 정식 타입으로 연결한다.

v3의 선택적 `render.aimLayer`는 고정 본체 clip 위에 별도 frame을 한 번 더 그리는 표현 계약이다. 현재 허용 orientation은 `upright-aim` 하나다. Sentry는 사거리·authored activation·LOS를 함께 만족하는 활성 Player 중 가장 가까운 대상을 서버가 `presentationAimDirection`으로 계산해 `idle/acquire/cooldown`의 시선에 사용한다. 실제 조준선이 보이거나 탄환 방향이 잠긴 `track/lock/fire`에서는 gameplay `aimDirection`이 우선한다. 이 분리값은 `lockedTargetId`, 사격 FSM, 투사체 방향을 바꾸지 않으며 싱글 render snapshot과 멀티 enemy snapshot이 같은 서버 결과를 소비한다. 오른쪽 반원은 기본 우향 frame을, 왼쪽 반원은 같은 frame을 수평 반전해 사용하고 로컬 회전을 항상 `-90°~90°`로 접는다. 따라서 포신은 전 방향을 조준하면서 머리 상단은 뒤집히지 않는다. 두 방향이 모두 없거나 0이면 기본 우향 0도로 표시한다. `aimLayer`는 조준·발사 판정이나 투사체 방향을 만들지 않고 이미 확정된 표현 입력만 사용한다.

몹 manifest는 Player의 상태 목록·render 구조를 재사용하지 않지만, 정규화된 frame은 Player와 같은 공용 `SpriteAnimation`의 `frames + duration + loop + frameAt(elapsed)` 불변 clip으로 변환된다. 상태 우선순위는 `EnemyPresentationState`, 표현 상태 전이와 경과시간은 적 ID별 `EnemyAnimationController`, 실제 cell 선택은 `SpriteAnimation`이 각각 소유한다. animation state·frame index를 gameplay 또는 network snapshot에 추가하지 않고 renderer가 받은 외부 presentation time으로 phase를 진행한다.

## 제작과 정규화

원본과 생성 기록은 `assets/artwork/characters/<asset-id>/`에 보존하고 검증된 PNG와 manifest만 `assets/runtime/characters/<asset-id>/`로 승격한다. 픽셀 크기와 화면 위계는 [`pixel-graphics-design-guide.md`](./pixel-graphics-design-guide.md), 공통 인계는 [`graphics-asset-guide.md`](./graphics-asset-guide.md)를 따른다. PNG는 투명 배경을 지원하는 RGBA여야 하며 atlas의 실제 크기와 셀 격자가 manifest와 일치해야 한다.

현재 Sector 01 package는 정적 역할 자세 네 개의 `128x32` atlas, 추격 드론 5상태 × 4 frame의 `128x160` atlas와 Sentry의 고정 베이스·회전 머리를 담은 `64x32` atlas를 함께 사용한다. Sentry는 상태 clip에서 베이스를 선택하고 `aimLayer`로 머리·센서·단일 포신을 합성한다. Shield·Artillery는 한 frame loop 또는 역할별 기본 clip fallback을 유지한다. Pursuit는 `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, `knockback`에 각각 네 frame을 사용하며 나머지 projectile attack 상태는 `pursuit-seek`로 fallback한다. 이후 pose를 추가할 때 gameplay state 이름을 새로 만들지 말고 해당 presentation state의 clip만 교체한다.

## Runtime과 fallback

게임 bootstrap은 기본 enemy manifest를 player와 독립적으로 읽어 `SpriteSceneRenderer`에 주입한다. manifest 또는 atlas가 실패하면 앱이나 player를 polygon profile로 내리지 않고 적 단위 built-in pixel mock을 사용한다. package가 지원하지 않는 다른 Sector 몹도 같은 mock을 유지한다.

Built-in mock의 센서 사각형과 드론 실루엣 선은 fallback sprite 자체의 일부다. 정식 package가 준비된 적에는 이를 다시 덧그리지 않고 manifest frame만 본체로 그린다. 공격 조준선, 행동 telegraph와 상태 bar처럼 gameplay 의미가 있는 공용 표현은 package 교체와 무관하게 유지한다.

Manifest에는 collider, hitbox, hurtbox, damage, health, physics, AI behavior, 네트워크 권위를 넣지 않는다. Renderer는 presentation state, 외부 presentation time, 불변 clip과 snapshot의 `presentationAimDirection`·`aimDirection`만 소비하며 생성 도구 형식이나 gameplay 규칙을 추측하지 않는다. Manifest의 frame duration 합은 시각 재생 길이일 뿐 gameplay state 전이 시간이 아니다. PNG나 frame timing·aimLayer 변경으로 collider·AI·피해·물리·네트워크 상태를 바꾸지 않는다.

## 완료 확인

1. authoring README에 원본, 도구, 변환, 라이선스와 export 경로를 기록한다.
2. 모든 지원 타입과 `EnemyPresentationState` 상태 coverage, 양수 duration, atlas cell 범위와 fallback 순환 부재를 확인한다.
3. `npm run validate:enemy-sprite-assets -- <directory>`를 통과한다.
4. 데스크톱과 모바일 viewport에서 nearest-neighbor 실루엣, 역할 구분, telegraph·Rope·Anchor 가독성과 적 단위 fallback을 직접 확인한다.
