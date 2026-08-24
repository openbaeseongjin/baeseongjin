# 시나리오 기획·개발 통합 현황

이 문서는 [`bsh/scenario/`](./bsh/scenario/)의 기획과 현재 Runtime 연결 상태만 소유한다. 대체된 구현 chronology는 Git 이력과 [`decision-history.md`](./decision-history.md)가 소유하며 현재 계약과 함께 나열하지 않는다.

<!-- scenario-integration-checkpoint:v1
scenario-source-sha256: f5c186683df4de2c3120ce669d5926fbf45d116fa00595979d97c4ace328a2f6
authored-area-sha256: 2a8f2a7bbacc2ff4716de4b08ab86294cb3db8b9123ecb383a08ea6dc25a2cd2
authored-sector-sha256: 271b92fbe6401162663a85cf3f04df0309affedba4d402bccf7b9f327c56472d
stage-count: 48
stage-coverage: 1-1,1-2,1-3,1-4,1-5,1-6,1-7,1-8,2-1,2-2,2-3,2-4,2-5,2-6,2-7,2-8,3-1,3-2,3-3,3-4,3-5,3-6,3-7,3-8,4-1,4-2,4-3,4-4,4-5,4-6,4-7,4-8,5-1,5-2,5-3,5-4,5-5,5-6,5-7,5-8,6-1,6-2,6-3,6-4,6-5,6-6,6-7,6-8
reviewed-upstream: efc3cfa2a1e23dcc8cce6e1eb7e9a90e067c2efa
-->

## 현재 확인 체크포인트

- Sector 01~06의 48개 canonical `AREA-SPEC.v2.json`은 generated Stage/catalog를 거쳐 authored Stage 48개와 개별 Player portal 47개로 compile된다. Runtime derived geometry와 scenario-only Stage는 0개다.
- 0.66.0 `authored-continuous-stage-runtime-v17-two-boss-dynamic-jammer-stage`를 사용한다. `1-8→2-1`, `2-8→3-1`, `4-8→5-1`, `5-8→6-1`은 직접 portal이고 `3-8→Boss03→4-1`, `6-8→Boss06→Boarding→Escape`만 독립 Boss를 사용한다.
- Player별 Stage Save·Gate 이동과 공용 objective를 유지한다. Access 조건은 portal 사용 가능 여부만 바꾸며 barrier collision이나 영구 Stage cursor를 만들지 않는다.
- Sector 05 Hardpoint Jammer는 Enemy 슬롯에서 field group을 자동 파생하고 일반 Hook-reachable surface를 선택한다. active target 부착은 owner-first Rope 절단과 단일 Electrified 상태를 시작한다.
- 아직 확인하지 못한 범위는 전체 desktop/mobile 등반, 실제 두 기기 장시간 멀티플레이, 신규 이동형 Boss03과 Boss03/06 full combat 체감이다.

| 범위 | 현재 Runtime | 남은 경계 |
| --- | --- | --- |
| Sector 01 / 1-1~1-8 | canonical v2/generated 8개, Access 3-of-3, `1-8→2-1` | 실제 전체 traversal·Direction migration |
| Sector 02 / 2-1~2-8 | canonical v2/generated 8개, Access 3-of-3, `2-8→3-1` | 실제 전체 traversal·Story/Audio/Lighting |
| Sector 03 / 3-1~3-8 | canonical v2/generated 8개, 임시 Boss03 Scanner/Arm, `3-8→Boss03→4-1` | 이동형 Boss03 재기획·Direction migration |
| Sector 04 / 4-1~4-8 | canonical v2/generated 8개, 2-of-3, `4-8→5-1` | 실제 traversal·quorum 멀티 수렴 |
| Sector 05 / 5-1~5-8 | canonical v2/generated 8개, dynamic Jammer/감전, `5-8→6-1` | 재머 가독성·장시간 멀티 수렴 |
| Sector 06 / 6-1~6-8 | canonical v2/generated 8개, `6-8→Boss06→Boarding→Escape` | Boss06 full combat·1~4인 boarding |

## 최근 반영된 시나리오 변화

- 0.66.0은 최신 two-Boss Runtime 위에서 Hardpoint Jammer를 범용 Enemy로 통합한다. 일반 Hook-reachable surface를 자동 선택하고, active target 부착은 `jammer-shock` 한 번으로 Rope 절단·재부착 제한·0.5초/25 피해 Electrified 상태를 시작한다. pulse별 network 사건은 만들지 않는다.
- Issue #946은 Sector 02~05 authored geometry를 유지한 채 environment package의 role·stable surface ID로 terrain/decoration preset을 결정한다.
- Issue #940은 Sector 06 environment package를 연결하고 `5-8→6-1`에서 Sector 05 backdrop을 smoothstep blur/fade로 전환한다.
- Issue #936은 Boss03·06의 hazard 판정/표현 geometry, participant 복귀, local camera와 authority Boss DTO 계약을 공통 Runtime 경계로 정렬한다.
- Issue #933은 Boss catalog를 Boss03·06으로 축소했다. 제거된 Boss01·02·04·05의 상세 구현과 전환은 현재 입력이 아니며 대체 이유만 `decision-history.md`가 보존한다.
- Issue #934는 canonical Area와 남은 Boss arena의 모든 정적 collision platform·wall을 Ropeable로 정렬했다. Boss 본체·적·투사체·hazard actor는 별도 capability를 유지한다.
- `1-2:p0` 진입 Platform의 오른쪽 32px(x 608~640)가 seam 건너 `1-1:shaft-shell-right` solid wall과 world 좌표에서 겹쳐 있어(Runtime 조립 후 x:608~640, y:-672~-640 정사각형) one-way platform과 solid wall이 같은 칸에 공존하던 collision 결함을 수정했다. `1-2:p0` 오른쪽 경계를 640→608로 정리해 겹침을 제거했으며, 그 칸은 `1-1`의 solid wall이 그대로 경계를 담당한다. 이 수정 전 48개 Stage 전수 검사에서 이 한 쌍 외의 cross-stage collision surface 겹침은 없었다.
- Sector 02 environment package에서 이전 far/mid/near 3-layer 배경 세대(`backdrop-far.png`/`backdrop-mid.png`/`backdrop-near.png`)가 `backdrop-fixed` + island 2장 세대로 교체된 뒤에도 정리되지 않고 남아 있던 것을 확인해 삭제했다. `sprite-manifest.json` 어떤 atlas도 참조하지 않던 미사용 자산이었다.

## 열린 기획·구현 게이트

1. 신규 이동형 Boss03을 기획·구현하기 전까지 현재 Atrium·Scanner·Arm Runtime은 임시 진행용이다.
2. 일반 Timer `60초 / +10초 / cap 60초 / Purge 240px/s`는 physical mapping 확정 전까지 HOLD다.
3. Boss03·06의 실제 desktop/mobile·1~4인 multiplayer full combat을 확인한다.
4. Sector 01~06의 실제 전체 traversal과 두 기기 장시간 플레이를 확인한다.
5. NPC는 예선 핵심 범위에서 제외한다.

## 지속 통합 절차

1. 관련 Sector·Stage README와 `PRODUCTION-ALIGNMENT.md`를 Runtime source와 함께 읽는다.
2. `npm run check:scenario-integration`의 fingerprint가 바뀌면 실제 변경을 이 문서의 체크포인트·최근 변화·열린 게이트에 반영한다.
3. `AREA-SPEC.v2.json`과 generated Stage를 한 transaction으로 갱신하고 generated 파일을 단독 수기 편집하지 않는다.
4. `MOCK INTEGRATED`와 `PLAYTEST VERIFIED`를 구분하며 문서 존재만으로 구현·플레이 검증을 완료 처리하지 않는다.
5. 대체된 chronology를 이 문서에 누적하지 않고 Git 이력과 `decision-history.md`로 보낸다.
