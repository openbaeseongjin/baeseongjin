# Sector 01~03 적 밀도·조합

0.32.0 기본 Runtime은 Stage-local 안전 slot을 공간 권위로 사용하고, slot의 적 종류만 `slotId + runSeed + worldRevision`으로 결정한다. Runtime density director, 생성 좌표, 화면 점유 기반 spawn은 사용하지 않는다.

## 밀도 기준

- `1-1`, `1-2`: 로프 학습을 위해 적 0.
- `1-3` 이후: 대표 Gameplay 화면당 약 1기가 읽히도록 세로 구간에 분산.
- Sector 후반: 단순 수량보다 서로 다른 역할의 동시 압박을 증가.
- Sector 01의 `1-3·1-6·1-7`, Sector 02의 `2-2·2-5·2-7`, Sector 03의 `3-2·3-5·3-7`: 기존 경비 slot 한 기가 Access Carrier이며 Sector당 정확히 3개다.
- Node `1-4`, `2-3`, `3-5`: 적 처치 조건 없이 chooser 즉시 개방. 선택 중 Player 입력만 멈추고 월드·적·동료는 계속 진행.

## 현재 slot 예산

| Sector | Stage별 slot 수 | 합계 | 역할 곡선 |
| --- | --- | ---: | --- |
| 01 | `0, 0, 3, 1, 2, 3, 3, 4` | 16 | Sentry/Pursuit 도입 → Shield/Artillery 제한 조합 |
| 02 | `1, 2, 1, 2, 3, 2, 3, 4` | 18 | Patrol 중심 → Shield/Support/Artillery 조합 |
| 03 | `1, 2, 2, 3, 2, 3, 4, 5` | 22 | Scanner/Patrol → Artillery/Support/Swarm 누적 |

정확한 pool 결과는 seed에 따라 바뀌지만 slot 수·위치·activation·Stable ID는 바뀌지 않는다. 전체 exact roster를 테스트 snapshot으로 고정하지 않고 안전 구간, Access 3기, Sector coarse tier, family 도달과 결정성을 검증한다.

## 일반 몹 행동 AS-IS → TO-BE

- AS-IS: 순찰·포격·지원·군집은 Runtime에 존재하지만 플레이 정체성과 맞지 않아 현재 행동을 최종 제품 계약으로 보호하지 않는다.
- TO-BE 순찰: authored 경로 양 끝을 계속 왕복하고 전 방향 거리로 Player를 탐지하며, 발견 시 현재 위치에 정지해 사격한 뒤 경로로 복귀한다.
- TO-BE 포격: 사거리 안에서 매번 현재 Player 위치를 고정해 예고·1회 영역 판정·cooldown을 반복하며 투사체나 잔류 타격 객체를 만들지 않는다.
- TO-BE 메딕: 넓은 치료 인식 범위에서 자신을 제외한 모든 일반 몹을 찾고, 좁은 치료 연결 범위까지 가장 위급한 한 기를 따라가 자기 체력 1당 대상 체력 3을 회복한다. 메딕 자신은 초당 체력 2를 자연 회복한다.
- TO-BE 메딕 전환: 새 대상이 definition 기준만큼 더 위급할 때만 연결을 바꾸고, Player 접근 시 치료 대상 주변에서 연결을 유지한 채 후퇴한다.
- TO-BE 군집: 각 기체가 독립 체력·collider·피격·처치를 소유하고, 조밀한 무리로 함께 추격하며 공용 사격 없이 접촉 1회 피해 후 반동·회복·재합류한다.
- TO-BE 공략: 특정 제거 수단은 몹 계약으로 정하지 않으며 Player가 로프·일반 공격·지형을 자유롭게 사용한다.
- TO-BE 인식: 화면 안의 몹이 반응하지 않는 구간을 없애도록 공용 사격과 각 행동의 인식 범위를 reference viewport 기준으로 확장하되 authored activation 경계는 넘지 않는다.

멀티 snapshot은 현재 56개 slot의 정적 authored 정의를 `world revision + objectId` 인덱스로 재사용한다. 축약 state hydration은 runtime을 만들거나 slot을 다시 선택하지 않고 동적 state만 합성한다. prediction 복원은 stable ID가 같은 기존 Enemy runtime에 동적 상태를 in-place restore하며 실제 spawn/despawn 또는 identity 변경에만 runtime을 만든다. 이 최적화는 20Hz snapshot·중립 Enemy 권위·slot 수와 pool 결과를 바꾸지 않는다.

## Authoring 계약

- legacy Stage source의 `sentry`/`patrol-drone` object가 slot 위치·activation·patrol·rules를 소유한다.
- object의 `enemySelection.allowedEnemyTypes`가 있으면 preview adapter가 이를 canonical encounter로 보존한다. 없으면 기존 `enemyType`/kind fixed fallback을 사용한다.
- `LegacyAreaSeamlessSectorRuntime`은 canonical slot을 world 좌표로 translate할 뿐 위치나 pool을 다시 저작하지 않는다.
- `GameSimulation.createEnemies()`는 모든 world slot을 생성하며 type만 selector 결과로 조립한다.
- encounter Runtime 권위에 `areaId`를 넣지 않는다.

## 보존 계약

- `accessModuleId`, Sector당 Carrier 3기 처치와 3-of-3 Transit Lock. Carrier 지정은 기존 slot 수·위치·activation을 바꾸지 않는다.
- Carrier 위치는 authored 글자 hint를 소유하지 않는다. Runtime은 stable module world position만 전달하고 거리순 최대 3개를 화면 밖 edge arrow 또는 화면 안 무문자 diamond marker로 같은 scale 규칙에 따라 안내한다.
- 개인·전원 사망 모두 shared progress/처치/module/route를 보존하고 각 Player의 마지막 Stage savepoint에서 부활한다.
- 모든 적 이동은 행동·돌진·Patrol 종류와 무관하게 Player와 같은 공개 physics/collider 경계로 현재 활성 collision surface, Player body와 다른 Enemy body를 해결한다. 일반 몹은 circle, 대형·Boss형은 convex polygon 또는 box collider를 조립할 수 있으며 Player↔Enemy·Enemy↔Enemy도 Player↔Player와 같은 shape contact·질량·상대 속도 actor collision을 사용한다. `sentry`/`sentry-t1` 고정형 Turret만 inverse mass 0의 정적 body라 위치가 바뀌지 않으며, 다른 Enemy는 authored 경로나 위치 넉백 정책과 별개로 충돌 impulse를 받는 동적 body다. 정적 Turret도 collision body 자체를 제거하거나 Player 통과를 허용하지 않는다.
- 고정·고정경로·제자리 지원형의 위치 넉백 면역, Pursuit/Swarm의 직접 추격형 displacement.
- Boss·Timer/Purge·Sector 04~06은 이 범위 밖이다.
