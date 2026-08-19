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

멀티 snapshot은 현재 56개 slot의 정적 authored 정의를 `world revision + objectId` 인덱스로 재사용한다. 축약 state hydration은 runtime을 만들거나 slot을 다시 선택하지 않고 동적 state만 합성하며, prediction 복원에서 snapshot당 slot 하나에 Enemy runtime 하나만 만든다. 이 최적화는 20Hz snapshot·중립 Enemy 권위·slot 수와 pool 결과를 바꾸지 않는다.

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
- 고정·고정경로·제자리 지원형의 위치 넉백 면역, Pursuit/Swarm의 직접 추격형 displacement.
- Boss·Timer/Purge·Sector 04~06과 새 enemy behavior는 이 범위 밖이다.
