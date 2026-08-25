# Boss 콘텐츠 기준

상태: `BOSS03 + BOSS06 PRODUCT CATALOG`

제품 Boss는 Sector 03 경계의 Boss03과 Sector 06 마지막의 Boss06이다. Boss01·02·04·05의 제거 이력은 [`../decision-history.md`](../decision-history.md)가 보존한다.

| Boss | 현재 상태 | 진행 경계 |
| --- | --- | --- |
| [03](./03/LOWER-SECTOR-COMMANDER-REFERENCE-CONTRACT.md) | `LOWER SECTOR COMMANDER` Runtime | `3-8 → Boss03 → 4-1` |
| [06](./06/README.md) | `CONTINUITY WARDEN` Runtime 유지 | `6-8 → Boss06 → Gate/Bridge/Shuttle → 전원 Boarding → Escape` |

Boss06의 현행 기획과 terminal Boarding은 유지한다. Boss Timer와 시간 만료 Arena collapse는 별도 HOLD다.

모든 제품 Boss는 직접 Boss hazard로 Player를 처치한 사건 한 번마다 현재 HP를 최대 HP 이내에서 100 회복한다. 이 회복은 `CompositeBossEncounterRuntime` 한 곳이 소유하며 Boss별 별도 회복 규칙은 두지 않는다.

## Boss03 시각 자료

- [Boss03 Commander 이미지 생성 기획](./03/COMMANDER-IMAGE-GENERATION-PLAN.md)은 사슬 훅·휴대형 해머 외형 검수 기준이다. 생성 원본 자체가 아니라 정규화된 local sprite package가 기본 `sprite` profile에 연결되며 로드 실패와 미지원 상태는 Polygon으로 복구한다.
