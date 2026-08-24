# 시나리오 기획·개발 통합 현황

이 문서는 [`bsh/scenario/`](./bsh/scenario/)의 기획과 현재 Runtime 연결 상태만 소유한다. 대체된 구현 chronology는 Git 이력과 [`decision-history.md`](./decision-history.md)가 소유하며 현재 계약과 함께 나열하지 않는다.

<!-- scenario-integration-checkpoint:v1
scenario-source-sha256: 8c191b9e4ebac5dff96f064b5e3a1cb3089c86f5306d502cad6de2712d77e4e9
authored-area-sha256: a9d01ab73be06e31e6dcb305847e1459a8ec7d9d0d0a518244f4e3944dc9afca
authored-sector-sha256: ad0424499e2d11575db20f4ec5d995488348e94fe68fdb0bf078965aeea11974
stage-count: 48
stage-coverage: 1-1,1-2,1-3,1-4,1-5,1-6,1-7,1-8,2-1,2-2,2-3,2-4,2-5,2-6,2-7,2-8,3-1,3-2,3-3,3-4,3-5,3-6,3-7,3-8,4-1,4-2,4-3,4-4,4-5,4-6,4-7,4-8,5-1,5-2,5-3,5-4,5-5,5-6,5-7,5-8,6-1,6-2,6-3,6-4,6-5,6-6,6-7,6-8
reviewed-upstream: 829d3fe3b7d6dc4fd3cd5fb95690ad4f210afaee
-->

## 현재 확인 체크포인트

- Sector 01~06의 48개 canonical `AREA-SPEC.v2.json`은 generated Stage/catalog를 거쳐 authored Stage 48개와 개별 Player portal 47개로 compile된다. Runtime derived geometry와 scenario-only Stage는 0개다.
- 0.66.0 `authored-continuous-stage-runtime-v18-boss06-direct-sector-portals`를 사용한다. `1-8→2-1`, `2-8→3-1`, `3-8→4-1`, `4-8→5-1`, `5-8→6-1`은 직접 portal이고 `6-8→Boss06→Boarding→Escape`만 독립 Boss를 사용한다.
- Player별 Stage Save·Gate 이동과 공용 objective를 유지한다. Access 조건은 portal 사용 가능 여부만 바꾸며 barrier collision이나 영구 Stage cursor를 만들지 않는다.
- Sector 05 Hardpoint Jammer는 Enemy 슬롯에서 field group을 자동 파생하고 일반 Hook-reachable surface를 선택한다. active target 부착은 owner-first Rope 절단과 단일 Electrified 상태를 시작한다.
- 아직 확인하지 못한 범위는 전체 desktop/mobile 등반, 실제 두 기기 장시간 멀티플레이와 Boss06 full combat 체감이다.

| 범위 | 현재 Runtime | 남은 경계 |
| --- | --- | --- |
| Sector 01 / 1-1~1-8 | canonical v2/generated 8개, Access 3-of-3, `1-8→2-1` | 실제 전체 traversal·Direction migration |
| Sector 02 / 2-1~2-8 | canonical v2/generated 8개, Access 3-of-3, `2-8→3-1` | 실제 전체 traversal·Story/Audio/Lighting |
| Sector 03 / 3-1~3-8 | canonical v2/generated 8개, Access 3-of-3, `3-8→4-1` | Direction migration·실제 traversal |
| Sector 04 / 4-1~4-8 | canonical v2/generated 8개, 2-of-3, `4-8→5-1` | 실제 traversal·quorum 멀티 수렴 |
| Sector 05 / 5-1~5-8 | canonical v2/generated 8개, dynamic Jammer/감전, `5-8→6-1` | 재머 가독성·장시간 멀티 수렴 |
| Sector 06 / 6-1~6-8 | canonical v2/generated 8개, `6-8→Boss06→Boarding→Escape` | Boss06 full combat·1~4인 boarding |

## 최근 반영된 시나리오 변화

- Map Editor에서 저장한 Sector 06의 6-1~6-8 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. 일반 Stage는 catalog의 선택 경로가 없어도 stable Stage ID로 `MAP-PREVIEW.html`을 찾아 시나리오 비교 화면을 제공하며, Boss Stage만 이 비교 대상에서 제외한다. 실제 전체 traversal과 Boss06·멀티플레이 체감은 별도 검증 범위다.
- Map Editor에서 저장한 Sector 04·05의 4-1~4-8, 5-1~5-8 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. 4-8 Quorum 진행 게이트는 목표 완료 전후에만 전환되며, 적 슬롯을 움직이면 legacy activation bounds도 같은 delta로 이동해 드론 위치와 공격·활성 범위 표시가 분리되지 않는다.
- Boss03 authoring·Runtime·Map Editor entry를 제거했다. 3-8의 existing content-boundary Gate는 source objective와 Sector03 Access 3-of-3 뒤 4-1 authored Entry로 직접 이동하며, 일반 Stage geometry·objective와 4-1 Entry는 변경하지 않았다.
- Map Editor에서 저장한 Sector 03 3-1~3-8의 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. 삭제된 Scanner 대상 Surface의 참조와 대상이 전부 삭제된 Scanner 그룹도 함께 제거해 production Gameplay View가 연속 월드를 조립할 수 있게 했다.
- Map Editor에서 저장한 Sector 02 2-1~2-8의 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. Runtime은 이 8개 `AREA-SPEC.v2.json`을 단일 권위로 compile하며, 실제 traversal 체감은 아직 별도 검증 범위다.
- Map Editor에서 저장한 Sector 01 1-1~1-8의 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. Runtime은 이 8개 `AREA-SPEC.v2.json`을 단일 권위로 compile하며, 실제 traversal 체감은 아직 별도 검증 범위다.
- 0.66.0은 Boss06-only Runtime 위에서 Hardpoint Jammer를 범용 Enemy로 통합한다. 일반 Hook-reachable surface를 자동 선택하고, active target 부착은 `jammer-shock` 한 번으로 Rope 절단·재부착 제한·0.5초/25 피해 Electrified 상태를 시작한다. pulse별 network 사건은 만들지 않는다.
- Issue #946은 Sector 02~05 authored geometry를 유지한 채 environment package의 role·stable surface ID로 terrain/decoration preset을 결정한다.
- Issue #940은 Sector 06 environment package를 연결하고 `5-8→6-1`에서 Sector 05 backdrop을 smoothstep blur/fade로 전환한다.
- Issue #936은 Boss06의 hazard 판정/표현 geometry, participant 복귀, local camera와 authority Boss DTO 계약을 공통 Runtime 경계로 정렬한다.
- Boss catalog는 Boss06 하나만 유지한다. 제거된 Boss01~05의 상세 구현과 전환은 현재 입력이 아니며 대체 이유만 `decision-history.md`가 보존한다.
- Issue #934는 canonical Area와 남은 Boss arena의 모든 정적 collision platform·wall을 Ropeable로 정렬했다. Boss 본체·적·투사체·hazard actor는 별도 capability를 유지한다.
- `1-2:p0` 진입 Platform의 오른쪽 32px(x 608~640)가 seam 건너 `1-1:shaft-shell-right` solid wall과 world 좌표에서 겹쳐 있어(Runtime 조립 후 x:608~640, y:-672~-640 정사각형) one-way platform과 solid wall이 같은 칸에 공존하던 collision 결함을 수정했다. `1-2:p0` 오른쪽 경계를 640→608로 정리해 겹침을 제거했으며, 그 칸은 `1-1`의 solid wall이 그대로 경계를 담당한다. 이 수정 전 48개 Stage 전수 검사에서 이 한 쌍 외의 cross-stage collision surface 겹침은 없었다.
- Sector 02 environment package에서 이전 far/mid/near 3-layer 배경 세대(`backdrop-far.png`/`backdrop-mid.png`/`backdrop-near.png`)가 `backdrop-fixed` + island 2장 세대로 교체된 뒤에도 정리되지 않고 남아 있던 것을 확인해 삭제했다. `sprite-manifest.json` 어떤 atlas도 참조하지 않던 미사용 자산이었다.
- `1-1` Stage에서 발판/앵커 2개 이상을 한 번에 건너뛸 수 있는 구간(p1→p3, p2→랜드마크 C, structural-grip→exit-deck)을 발견해 기획 의도(허용 스킵 1개)에 맞게 재구성했다. `cable-overhang`(structural-grip)과 `p3` 발판은 중복 웨이포인트로 판단해 제거하고, `p1`을 (224,-320)→(50,-300)으로 옮겨 남은 경로(entry→A→p1→p2→C→exit-deck)에서 2단계 이상 스킵이 불가능하도록 정리했다. Map Editor로 사용자가 직접 저장 적용해 반영했다. 나머지 Sector 1~6 Stage의 동일 점검은 아직 진행 전이다.
- Sector 03-2의 `media-wall-body`(`kind: design-reference`, `collision: false`, `renderable: false` — 순수 미술 참조용 surface)가 Issue #934(`52901df`, 정적 충돌 표면 로프 부착 일괄 보장)의 일괄 처리 과정에서 `grappleable: false → true`로 잘못 뒤집혔던 것을 원상복구했다. `collision: false`인 surface는 `isRopeableCollisionSurface`가 이미 걸러내 현재 Runtime 동작에는 영향이 없지만, 48개 canonical Stage 전수 검사 결과 `collision:false`이면서 `grappleable:true`인 유일한 사례였다.

## 열린 기획·구현 게이트

1. 일반 Timer `60초 / +10초 / cap 60초 / Purge 240px/s`는 physical mapping 확정 전까지 HOLD다.
2. Boss06의 실제 desktop/mobile·1~4인 multiplayer full combat을 확인한다.
3. Sector 01~06의 실제 전체 traversal과 두 기기 장시간 플레이를 확인한다.
5. NPC는 예선 핵심 범위에서 제외한다.

## 지속 통합 절차

1. 관련 Sector·Stage README와 `PRODUCTION-ALIGNMENT.md`를 Runtime source와 함께 읽는다.
2. `npm run check:scenario-integration`의 fingerprint가 바뀌면 실제 변경을 이 문서의 체크포인트·최근 변화·열린 게이트에 반영한다.
3. `AREA-SPEC.v2.json`과 generated Stage를 한 transaction으로 갱신하고 generated 파일을 단독 수기 편집하지 않는다.
4. `MOCK INTEGRATED`와 `PLAYTEST VERIFIED`를 구분하며 문서 존재만으로 구현·플레이 검증을 완료 처리하지 않는다.
5. 대체된 chronology를 이 문서에 누적하지 않고 Git 이력과 `decision-history.md`로 보낸다.
