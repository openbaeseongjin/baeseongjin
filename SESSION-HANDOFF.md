# 세션 핸드오프

이 문서는 기준 문서에 아직 흡수되지 않은 항목만 임시로 기록한다. 운영 기준은 [`docs/documentation-rules.md`](docs/documentation-rules.md)를 따른다.

## 현재 미흡수 항목

### [L2] Boss03 상태 이미지 순차 승인 진행

- 승인 순서와 완료 상태는 `docs/boss/03/COMMANDER-IMAGE-GENERATION-PLAN.md`가 소유한다.
- 중립·보행·그랩 예고 관계 이미지·당김·구속까지 시각 승인됐다. 보행·그랩 예고·당김은 투명 authoring export까지 규격을 통과했다.
- 넓은 장면형 이미지는 계속 REFERENCE-ONLY로 두고, 상태별 본체·장비·동적 표현을 분리한 투명 셀로 다시 제작한다.
- 그랩 예고 본체 투명 `128×192` 자세까지 승인됐다.
- 당김 분리 export 세 개를 승인했다: `commander-grab-pull-body-approved-128x192.png`, `commander-grab-hook-head-approved-48x48.png`, `commander-grab-chain-link-approved-16x16.png`.
- 넓은 구속 승인본을 분리한 `commander-grab-held-body-approved-128x192.png`, `commander-grab-held-hook-head-approved-48x48.png`, `commander-grab-held-chain-link-approved-16x16.png`을 authoring export로 승인했다.
- 구속 훅 머리와 체인 링크는 당김 승인 부품을 그대로 재사용하며, 다음 제작 단위는 그랩 확정 해머 상태다.

### [L1] 개발 규칙 미반영 코드를 대상 묶음별 검토 후 순차 리팩터링한다

- 현재 `docs/development-rules.md`를 기준으로 저장소 전체의 미반영 코드를 단계별로 바로잡는다.
- 각 실행 단위는 사용자 검토가 가능한 `문제 파일 + 실제 사용처` 묶음으로 제시하고, 계획 검토가 끝난 묶음만 순차 수정한다.
- 저장소 전체 개발 규칙 정렬을 하나의 리팩터링으로 보고 전용 장기 branch 하나에서 수행한다. 승인된 리팩터링 step별 Lore commit으로 이력을 분리해 사용자가 순서대로 검토·복원할 수 있게 하며, 대상 묶음마다 새 branch를 만들거나 중간 병합하지 않는다.
- Enemy Weapon 묶음까지 main 반영을 확인했다. 다음 단계는 후보 하나씩 찾는 범위를 넘어 저장소 전체 코드를 다시 감사하고, 객체 단위·상위 공통 계약·구체 override·Has-A·mixin·definition·고정 object lookup 규칙의 남은 미수렴 항목을 우선순위로 정리하는 것이다.
