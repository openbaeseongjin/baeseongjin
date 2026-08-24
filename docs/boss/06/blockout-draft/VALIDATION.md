# BOSS 06 VALIDATION — DAMAGE PREFLIGHT CURRENT

> **V2 SUPERSEDED:** 아래 결과는 V2 좌표의 과거 증거다. V3 fresh 결과는 구현 작업의 verification ledger에 기록한다.

> GitHub main: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`

| 항목                                     | 결과                     |
| ---------------------------------------- | ------------------------ |
| HTML duplicate IDs                       | PASS — 0                 |
| JavaScript syntax                        | PASS                     |
| Preview modes                            | PASS — 8                 |
| Main collision surface target            | PASS — 1 flat deck       |
| Upper adjacent max                       | PASS — `363.46px`        |
| Non-adjacent <=400 shortcut              | PASS — 0                 |
| LOW jump-apex Main coverage              | PASS — `996.51..4123.49` |
| Legal Warden center→nearest Anchor worst | PASS — `380.43px`        |
| Rope Reach margin                        | `19.57px`                |
| Simplified Rope Impact samples           | PASS — 121/121           |
| Simplified minimum impact speed          | PASS — `656.98 >= 620`   |
| Guard/Counter left-side samples          | PASS — 0 failures        |
| Guard/Counter right-side samples         | PASS — 0 failures        |
| R1→RR1 sampled max                       | PASS — `368.57px`        |
| R3→RR3 sampled max                       | PASS — `312.00px`        |
| Browser Gameplay View                    | NOT VERIFIED             |
| Boss06 Runtime                           | NOT IMPLEMENTED          |
| Merge Ready                              | NO                       |

## 주의

`Rope Impact samples`는 현재 게임 상수와 FixedLengthRope/Swing Drag 구조를 사용한 단순화 pendulum 사전검증이다.

이 검증은 실제 GameSimulation을 대체하지 않는다.

최종 Runtime PASS 조건:

```text
actual RopeImpactAttack
→ Boss06 body ImpactTarget
→ accepted damage
→ visible HP decrease
```

를 직접 통합 테스트해야 한다.

## 최종 Anchor

| Anchor |    x |    y |
| ------ | ---: | ---: |
| U1     | 1300 | 1540 |
| U2     | 1660 | 1510 |
| U3     | 2020 | 1490 |
| U4     | 2380 | 1510 |
| U5     | 2740 | 1540 |
| U6     | 3100 | 1510 |
| U7     | 3460 | 1490 |
| U8     | 3820 | 1540 |
