# Post-Sector Boss 콘텐츠 인계

상태: `AUTHORED HANDOFF / RUNTIME IMPLEMENTATION SEPARATE`

이 디렉터리는 사용자 제공 Boss 콘텐츠 인계와 정적 MAP preview를 보존한다. 인계는 구현 지시가 아니며, 현재 Runtime·전환·Timer 권위는 [`../scenario-development-integration.md`](../scenario-development-integration.md), [`../sector-timer-and-boss-flow.md`](../sector-timer-and-boss-flow.md), [`../design-decision-resolution-package.md`](../design-decision-resolution-package.md)가 소유한다. `src/`, Stage transition, collision, combat, multiplayer를 이 문서만으로 바꾸지 않는다.

| Boss                 | 콘텐츠 상태                        | 현재 경계                                                                            |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| [01](./01/README.md) | FINAL handoff, Boss core 부분 구현 | Post-1-8 별도 slot의 Arena·월드 연결·`2-1` 전환 미구현                               |
| [02](./02/README.md) | REV5-C **DRAFT**                   | 현재 `2-8 → 3-1` transit과 별도; Boss entry 미승인                                   |
| [03](./03/README.md) | FINAL handoff                      | `3-8`은 content boundary이며 `4-1` 직접 연결 금지                                    |
| [04](./04/README.md) | FINAL handoff, Runtime 구현        | `4-8 → Boss04 → 5-1`                                                                 |
| [05](./05/README.md) | FINAL handoff, Runtime 구현        | `5-8 → Boss05 → 6-1`                                                                 |
| [06](./06/README.md) | FINAL handoff                      | `6-8` 밖 Final Security; 기존 `PAD SECURITY WARDEN P-03`와 ID·Runtime mapping 미확정 |

모든 인계의 Boss Timer와 시간 만료 Arena collapse는 초기 Post-Sector Boss 범위에서 제외한다. 정적 MAP preview는 presentation reference일 뿐 Runtime terrain·collision·asset이 아니다.
