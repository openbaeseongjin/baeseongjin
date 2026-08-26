# Runtime 성능 아키텍처

이 문서는 fixed step·snapshot·공간 질의·Canvas render의 성능 책임과 검증 게이트를 소유한다. 관련 Runtime을 수정하는 에이전트는 구현 전에 이 문서와 [`architecture.md`](./architecture.md)를 읽는다.

## AS-IS → TO-BE

1. AS-IS: Quadtree는 충돌에만 적용되고 Rope·Boss·snapshot·renderer가 전체 월드를 다시 순회한다.
2. TO-BE: 모든 공간 후보는 도메인별 공간 인덱스가 고르고 구체 판정만 호출자가 수행한다.
3. AS-IS: 비활성 객체의 `active` 확인이 전체 snapshot 생성까지 일으킨다.
4. TO-BE: 활성 여부는 allocation 없는 O(1) 상태이며 비활성 객체는 tick 작업에서 제외한다.
5. AS-IS: 같은 fixed tick에서 전체 render snapshot을 여러 번 생성한다.
6. TO-BE: 논리 sample당 snapshot을 한 번 만들고 모든 소비자가 같은 DTO를 재사용한다.
7. AS-IS: Stage·Enemy 추가가 전역 순회와 객체 수를 조용히 늘린다.
8. TO-BE: content cardinality 변경은 최악 개수·복잡도·fixed-step p95를 함께 검증한다.

## 핵심 컴포넌트

| 책임 | 권위 컴포넌트 | 계약 |
| --- | --- | --- |
| Runtime 객체 수명 | `GameObjectManager` + `BaseGameObjectManager` 하위 종류별 manager | 공통 부모의 collection·ID index·등록·조회·교체·제거·snapshot을 그대로 상속하고 종류별 차이만 override한다. 등록되지 않은 별도 배열을 만들지 않는다. |
| 120Hz 실행 예산 | `FixedStepRunner` | catch-up은 지연 복구일 뿐 최적화가 아니다. 한 step의 hot path가 먼저 예산 안에 들어와야 한다. |
| Surface·Actor 후보 | `CollisionBroadPhase` + `Quadtree` | swept AABB 후보만 반환하고 최종 충돌은 `Collider` narrow phase가 소유한다. |
| 활성 Enemy 집합 | `CollisionBroadPhase.beginFrame()` 결과 | 행동·Patrol·공격·물리·전투 조회는 전체 roster가 아니라 동일한 active 집합을 소비한다. |
| 전투 대상 membership | `GameObjectManager.impactTargets` / `ImpactTargetManager` | 등록·활성 membership만 소유한다. `active` 조회는 snapshot·collider 생성·배열 복사를 호출하지 않는다. |
| Rope 부착 후보 | `RopePointerInput`이 사용하는 surface spatial query | 입력과 reach bounds로 후보를 먼저 제한한 뒤에만 `findRopeAttachment()`의 edge 판정을 수행한다. 전체 surface 전수 검사는 금지한다. |
| Render DTO | 객체별 `render-snapshot` capability + `GameSimulation.snapshot()` | detached DTO는 출력 경계에서 논리 sample당 한 번 만들고 tick·render·audio가 같은 sample을 재사용한다. |
| 정적 World 자료 | immutable world와 소유자별 index/cache | ID lookup·bounds·edge·배치·고정 대응표는 world 변경 때만 만들고 frame/tick마다 재생성하지 않는다. |
| 화면 후보 | `RenderViewport` + 하위 renderer cache/culling | renderer는 viewport 후보만 그리며 정적 geometry와 backdrop layer 정렬을 매 frame 다시 만들지 않는다. |
| 관측 | `CollisionBroadPhase.snapshot()` + `RenderPerformanceMetrics` | candidate/total, fixed-step drop, frame interval, draw duration을 읽기 전용으로 제공한다. |

## Hot-path 불변식

`FixedStepRunner.step`, `requestAnimationFrame`의 draw, network snapshot build처럼 주기적으로 반복되는 경로를 hot path로 취급한다.

1. **전체 컬렉션 금지:** 크기가 Stage 수와 함께 증가하는 `world.surfaces`, `world.objects`, 전체 Enemy roster를 hot path에서 `filter`·`map`·`find`·`sort`하지 않는다. 공간 index, ID index, active collection 또는 무효화 가능한 cache를 사용한다.
2. **활성 predicate는 O(1):** `active`, `enabled`, `visible` 확인은 primitive 상태만 읽고 새 객체를 만들지 않는다. snapshot을 만들어 활성 여부를 판정하지 않는다.
3. **비활성은 무비용:** 비활성 Boss·Enemy·Projectile·effect는 registry에 남아 있어도 behavior, physics, target snapshot, collider 생성과 render DTO 생성 대상에서 제외한다.
4. **snapshot은 경계당 한 번:** 같은 tick·server sample·render frame에서 동일 상태의 snapshot을 반복 생성하지 않는다. alias 필드가 필요하면 한 객체 참조를 공유하며 같은 resolver를 두 번 호출하지 않는다.
5. **정적·동적 상태 분리:** world definition, authored geometry와 static collider 정보는 snapshot마다 복제하지 않는다. 동적 위치·속도·수명·진행만 sample에 넣는다.
6. **공간 index를 우회하지 않음:** Quadtree가 있어도 호출자가 원본 배열을 직접 전수 검사하면 최적화 계약 위반이다. 새 공간 판정은 기존 query를 확장하거나 도메인 index를 조합한다.
7. **군집은 전체 roster에 곱하지 않음:** member별 이웃 계산은 동일 group 또는 spatial candidate만 사용한다. member마다 전체 Enemy 배열을 훑는 O(N²) 구현을 금지한다.
8. **렌더 정적 계산 캐시:** gradient·layer order·surface bounds처럼 상태가 바뀌지 않는 자료는 owner가 cache하고 world·asset·viewport 정책 변경 때만 무효화한다.
9. **월드 규모 곡선은 실선으로 제한:** 매 frame 그리는 Rope 사거리처럼 화면보다 큰 Canvas 곡선에 `setLineDash()`의 비어 있지 않은 패턴을 적용하지 않는다. 브라우저·GPU 조합에 따라 dash tessellation이 draw budget을 고갈시키므로 실선 또는 개수가 고정된 작은 primitive로 표현한다.

## 변경 전 감사

다음 중 하나라도 해당하면 구현 전에 이 문서를 읽고 호출 그래프를 확인한다.

- Stage, surface, world object, Enemy, swarm member, projectile, particle 또는 Boss target 수를 늘린다.
- fixed step, render frame, snapshot build 안에 collection 순회나 객체 생성을 추가한다.
- `snapshot()`, `renderSnapshot()`, `activeSnapshots()` 또는 collider snapshot 호출을 추가한다.
- collision·Rope·targeting·LOS·viewport처럼 위치 기반 후보 검색을 추가한다.
- cache, index, active set 또는 culling을 새로 만들거나 우회한다.

검토자는 `호출 빈도 × 전체 개수 × 객체당 비용`을 적고, 현재 권위 컴포넌트를 재사용하지 못하는 이유가 있을 때만 새 index/cache를 허용한다.

## 완료 게이트

1. 고정 seed의 idle·일반 전투·최대 authored 군집·Boss 활성 시나리오를 렌더 없이 각각 측정한다.
2. base와 candidate에서 fixed-step median/p95/max, snapshot 호출 수·생성 수, active/total candidate 수를 같은 입력으로 비교한다.
3. 120Hz fixed step은 p95가 8.33ms를 넘지 않아야 하며, 새 기능이 base 대비 설명되지 않은 회귀를 만들면 완료 처리하지 않는다.
4. 60Hz 화면은 두 fixed step과 render를 포함한 frame p95·dropped steps를 확인한다. 브라우저 검증은 정적·headless 병목을 제거한 뒤 표현 변경이 있을 때 수행한다.
5. content 수를 늘린 변경은 현재 sample뿐 아니라 허용 최대 수에서 복잡도가 `전체 월드`나 `N²`로 바뀌지 않음을 기록한다.

자동 테스트를 새로 추가하지 않는다. 이 게이트는 기존 headless simulation·진단·profile과 저장소 공통 검사로 증명하며, 사용자가 해당 작업에서 테스트를 명시했을 때만 테스트 코드를 추가한다.

## 현재 상태

- `ImpactTargetManager`는 allocation 없는 Boss 활성 predicate를 먼저 확인하므로 비활성 Boss snapshot을 만들지 않는다.
- Rope attachment는 `GameObjectManager`가 소유한 surface Quadtree 후보만 narrow phase에 전달한다.
- 싱글 앱은 fixed step에서 만든 최신 snapshot을 render까지 재사용하고 실제 예측 impact가 상태를 바꾼 경우에만 같은 step에서 다시 읽는다.
- 남은 renderer 전체 순회와 정적 backdrop 재합성은 viewport candidate·cache 경계의 후속 최적화 대상이다.
- `SpriteSceneResourceBundle`은 manifest definition에서 lazy Image asset set을 한 번 조립한다. startup은 Player와 기본 시작 Area package만 우선 load·decode하고, 다른 Sector package는 current Area gate와 분리된 background promise로 준비한다. 싱글·멀티·디버그 재시작은 같은 bundle을 재사용하므로 gameplay frame과 모드 전환이 atlas 요청을 다시 만들지 않는다. Environment component는 definition별 frozen atlas ID 배열을 Object lookup으로 선택해 frame마다 전체 package 목록을 재조립하지 않는다.
- Boss06 지지면 판정은 Runtime 생성 때 Main·Ledge 4개만 immutable support catalog로 정규화하고, 활성 Boss의 neutral locomotion tick에서 이 고정 후보만 좌표 질의한다. 전체 world surface를 순회하거나 플랫폼 진입 이벤트·snapshot 상태를 만들지 않는다.
- Boss03은 고정 Arena support 4개(주 바닥 1개·Ledge 3개)와 active participant 최대 4명만 지지면·대상 질의에 사용한다. Anchor surface 9개는 Rope spatial query가 처리하며 Boss locomotion이 매 tick 순회하지 않는다. `CombatInteractionController`의 동적 Map도 참가자당 최대 하나의 capture만 보관하며 비활성 interaction은 완료 tick에 제거한다. 월드 surface·전체 Player 이력·Boss catalog를 fixed step마다 순회하지 않는다.

새 기능은 남은 위반을 핑계로 같은 패턴을 추가하지 않는다. 해당 권위 컴포넌트 경계를 복구하는 별도 수정 단위로 제거한다.
