# 시나리오 기획·개발 통합 현황

이 문서는 [`bsh/scenario/`](./bsh/scenario/)의 기획과 현재 Runtime 연결 상태만 소유한다. 대체된 구현 chronology는 Git 이력과 [`decision-history.md`](./decision-history.md)가 소유하며 현재 계약과 함께 나열하지 않는다.

<!-- scenario-integration-checkpoint:v1
scenario-source-sha256: 46affc2a3a47301789b47b4f23c6f6dd4d2480380c6cbcfb101f25bd17d1a3b8
authored-area-sha256: 006b82b383ea3d7bdebd21f322c1dbb54de85af8b3fc02cfa60a9dbd42477904
authored-sector-sha256: 592379e8682443826596c349dfded4f7969f5b4d41489449d51cf4dc12edf521
stage-count: 48
stage-coverage: 1-1,1-2,1-3,1-4,1-5,1-6,1-7,1-8,2-1,2-2,2-3,2-4,2-5,2-6,2-7,2-8,3-1,3-2,3-3,3-4,3-5,3-6,3-7,3-8,4-1,4-2,4-3,4-4,4-5,4-6,4-7,4-8,5-1,5-2,5-3,5-4,5-5,5-6,5-7,5-8,6-1,6-2,6-3,6-4,6-5,6-6,6-7,6-8
reviewed-upstream: 89ffa4a9aab6f956b8d55e5ebcbf47f7cb3026dc
-->

## 현재 확인 체크포인트

- Sector 01~06의 48개 canonical `AREA-SPEC.v2.json`은 generated Stage/catalog를 거쳐 authored Stage 48개와 개별 Player portal 47개로 compile된다. 모든 target Entry는 source Exit와 같은 X·2160px 위의 desktop/mobile 기준 시야 밖에 있고, 각 Stage는 Entry·Exit·Exit Panel을 하나씩 소유해 W 상호작용으로만 전진한다. Runtime derived geometry와 scenario-only Stage는 0개다.
- Enemy slot은 1-1·1-2만 도입부 예외로 두고 1-3 이후 최소 3개를 보장한다. Sector 01~02는 최소 3개, 03~04는 최소 4개, 05~06은 최소 5개이며 exact Stage 예산은 `enemy-density-composition.md`가 소유한다.
- 0.67.0은 기존 연속 Stage portal을 유지하고 1-4·2-3·3-5의 authored Augment Node와 선택 prerequisite만 제거했다. 증강은 마지막으로 확정한 양수 Player 피해 귀속 XP 레벨업이 소유한다.
- Player별 Stage Save·Gate 이동과 공용 objective를 유지한다. Sector Key/Access만 portal 사용 가능 여부를 바꾸며 barrier collision이나 영구 Stage cursor를 만들지 않는다. 부족한 상태의 Exit Panel W 입력은 당사자 화면 상단에 현재 수집 수와 필요 수를 표시한다.
- Sector 05 Hardpoint Jammer는 Enemy 슬롯에서 field group을 자동 파생하고 일반 Hook-reachable surface를 선택한다. active target 부착은 owner-first Rope 절단과 단일 Electrified 상태를 시작한다.
- 아직 확인하지 못한 범위는 전체 desktop/mobile 등반, 실제 두 기기 장시간 멀티플레이와 Boss06 full combat 체감이다.

| 범위                | 현재 Runtime                                               | 남은 경계                                |
| ------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| Sector 01 / 1-1~1-8 | canonical v2/generated 8개, Access 3-of-3, `1-8→2-1`       | 실제 전체 traversal·Direction migration  |
| Sector 02 / 2-1~2-8 | canonical v2/generated 8개, Access 3-of-3, `2-8→3-1`       | 실제 전체 traversal·Story/Audio/Lighting |
| Sector 03 / 3-1~3-8 | canonical v2/generated 8개, Access 3-of-3, `3-8→Boss03→4-1` | Boss03 desktop/mobile·1~4인 검증          |
| Sector 04 / 4-1~4-8 | canonical v2/generated 8개, 2-of-3, `4-8→5-1`              | 실제 traversal·quorum 멀티 수렴          |
| Sector 05 / 5-1~5-8 | canonical v2/generated 8개, dynamic Jammer/감전, `5-8→6-1` | 재머 가독성·장시간 멀티 수렴             |
| Sector 06 / 6-1~6-8 | canonical v2/generated 8개, `6-8→Boss06→Boarding→Escape`   | Boss06 full combat·1~4인 boarding        |

## 최근 반영된 시나리오 변화

- 0.74.0은 gap-0 Stage seam을 Gate 분리 배치로 대체했다. 47개 target Entry는 source Exit와 동일 X·2160px 위에 있으며 production parity가 portal endpoint·desktop/mobile 화면 밖·Bounds 비중첩·현재 Stage 하단+780px 낙사 복구 여유를 함께 검사한다. Stage-local canonical geometry와 Boss03·06 전투 계약은 유지하고 Boss Arena는 source Gate 기준 오른쪽 격리를 사용한다.

- Boss03 Arena는 기존 천장 Crossbeam 3개를 주 바닥 안쪽의 단방향 Ledge 3개로 바꾸고, 400px Base Reach 안에서 이어지는 `swing-attack` Anchor 9개를 추가했다. Commander는 공용 authored support query와 Physics 점프 컴포넌트로 Player의 지지면을 추적한다. 그랩은 보스 중심 800px를 시전·실제 포획·예고 이탈 취소에 함께 사용하고, 성공 뒤 해머 연계는 0.5초이며 지면 충격 파티클을 표시한다. 일반 Stage와 `3-8→Boss03→4-1` 경계는 변경하지 않았다.

- Boss06 후속 combat geometry는 스프라이트 불투명 body 폭에 맞춘 120×150 Polygon 하나를 본체 물리·기본탄·Spell·멀티 client prediction에 공유한다. 기본탄의 plain position 예외와 Polygon 반경 0 해석을 제거하고, 유도미사일은 지연 catch-up을 포함한 공용 swept projectile contact로 피해·소비한다. Neutral에서 거리·ID 순 최근접 Player를 선택하고 공격 시작 뒤 target/facing을 고정한다. Arena·Anchor·플랫폼·공격 roster와 Boarding은 변경하지 않았다.

- 48개 Stage 출구를 Entry·Exit·Exit Panel 각 1개와 W interact objective 각 1개로 정규화했다. 출구를 이중으로 막던 도달 objective와 4-8의 별도 자동 quorum 장벽을 제거하고, Sector Key/Access가 부족한 경우에만 `수집 n / 필요 m` 상단 경고를 표시한다. 2-5의 서사용 Upper Transit 잠금 구조물은 일반 Gate 정체성에서 분리했다.

- Stage의 authored geometry·objective·Enemy slot은 바꾸지 않고 증강 획득 설명을 현재 전투 계약에 맞췄다. Enemy XP는 마지막으로 확정한 양수 Player 피해 source를 완전 회복·Encounter reset까지 보존하며, 이후 환경 원인 사망에도 해당 Player에게 한 번 귀속한다.
- 48개 canonical Stage의 Enemy slot을 86개에서 189개로 늘렸다. Entry·Exit·Story·Safe 지점은 피하고 기존 route와 Stage-local activation band에 분산했으며 Swarm은 추가 pool에서 제외했다. production map parity가 1-3 이후 Sector별 최소 밀도를 검사한다.
- Boss06 V4 candidate는 3200px 단일 Main·단방향 Ledge 3개·U1~~U10·좌우 낭떠러지·220px Victory Bridge를 사용하고 Recovery와 좌우 벽을 제거했다. Warden은 발 좌표와 authored surface bounds로 지지면을 판정해 걷기·점프·내려가기·낙하·착지를 수행하고, 공격은 조건을 통과한 상태 풀에서 사용 이력 가중치를 회복하는 결정적 랜덤으로 고른다. 5발 fan 유도미사일과 `2마리 / 최소 15초 / live 6 skip` 소환은 유지하며 실제 desktop/mobile·1~~4인 Gameplay View는 아직 열린 검증이다.
- Sector 01~06의 Gate/Exit Panel 73개를 전수 감사해 이미 정확한 62개는 유지하고, 2-5 보조 Gate·Sector 04 Exit Panel 7개·5-7 Gate/Panel·6-8 Panel의 11개 `bottom-center`를 실제 collision surface top에 맞췄다. Resident Override A/B/C와 Service Relay B-03은 Gate Panel이 아닌 벽 장착 `terminal` 정체성으로 분리해 pedestal sprite가 공중에 표시되지 않게 했다. surface geometry·objective·interaction·portal·network 계약은 변경하지 않았으며 production map parity가 이 접지와 정체성 불변식을 검사한다.
- 0.67.0은 `sector-01-04:maintenance-node`, `sector-02-03:specialization-node`, `sector-03-05:service-calibration-frame`과 관련 선택 objective·Augment 선택 cue를 canonical AREA-SPEC에서 제거했다. 해당 공간·Guard·Exit topology는 유지하며 Exit Panel은 증강 선택을 요구하지 않는다.
- Sector 02·03·05의 `story-display` 36개를 발판 pedestal 19개와 벽 rail 17개로 구분했다. 기존에 발판 근처에서 `center` 또는 어긋난 Y를 쓰던 17개를 `bottom-center`와 해당 surface top Y로 맞췄고, 이미 정확했던 2개는 유지했다. Story cue·상호작용·collision·surface geometry는 변경하지 않았다.
- 전수 공간 감사에서 발견한 2-8의 Final Control 이중 발판을 Editor 소유 `exit-deck` 하나로 정리하고, 5-1 인접 Entry Deck의 1px 내부 겹침을 맞닿는 경계로 보정했다. Anchor의 collision 부착 target이 발판에 물리는 구조는 Rope capability 계약을 유지하므로 변경하지 않았다.
- Map Editor에서 저장한 Sector 06의 6-1~6-8 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. 일반 Stage는 catalog의 선택 경로가 없어도 stable Stage ID로 `MAP-PREVIEW.html`을 찾아 시나리오 비교 화면을 제공하며, Boss Stage만 이 비교 대상에서 제외한다. 실제 전체 traversal과 Boss06·멀티플레이 체감은 별도 검증 범위다.
- Map Editor에서 저장한 Sector 04·05의 4-1~~4-8, 5-1~~5-8 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. 4-8 Quorum 진행 게이트는 목표 완료 전후에만 전환되며, 적 슬롯을 움직이면 legacy activation bounds도 같은 delta로 이동해 드론 위치와 공격·활성 범위 표시가 분리되지 않는다.
- Boss03 `LOWER SECTOR COMMANDER`를 제거 가능한 catalog 모듈로 재도입했다. 3-8 source objective와 Access 3-of-3 뒤 각 Player가 독립 Arena로 들어가며, 처치 후 각자 4-1 Entry로 이동한다. catalog 항목이 없으면 기존 direct portal이 자동 복구된다.
- Map Editor에서 저장한 Sector 03 3-1~3-8의 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. 삭제된 Scanner 대상 Surface의 참조와 대상이 전부 삭제된 Scanner 그룹도 함께 제거해 production Gameplay View가 연속 월드를 조립할 수 있게 했다.
- Map Editor에서 저장한 Sector 02 2-1~2-8의 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. Runtime은 이 8개 `AREA-SPEC.v2.json`을 단일 권위로 compile하며, 실제 traversal 체감은 아직 별도 검증 범위다.
- Map Editor에서 저장한 Sector 01 1-1~1-8의 canonical 지형·Anchor·월드 오브젝트·Wind·Camera 배치를 generated Stage 모듈에 함께 반영했다. Runtime은 이 8개 `AREA-SPEC.v2.json`을 단일 권위로 compile하며, 실제 traversal 체감은 아직 별도 검증 범위다.
- 0.66.0은 Boss06-only Runtime 위에서 Hardpoint Jammer를 범용 Enemy로 통합한다. 일반 Hook-reachable surface를 자동 선택하고, active target 부착은 `jammer-shock` 한 번으로 Rope 절단·재부착 제한·0.5초/25 피해 Electrified 상태를 시작한다. pulse별 network 사건은 만들지 않는다.
- Issue #946은 Sector 02~05 authored geometry를 유지한 채 environment package의 role·stable surface ID로 terrain/decoration preset을 결정한다.
- Issue #940은 Sector 06 environment package를 연결하고 `5-8→6-1`에서 Sector 05 backdrop을 smoothstep blur/fade로 전환한다.
- Issue #936은 Boss06의 hazard 판정/표현 geometry, participant 복귀, local camera와 authority Boss DTO 계약을 공통 Runtime 경계로 정렬한다.
- Boss catalog는 Boss03과 Boss06을 유지한다. Boss01·02·04·05의 제거 이유는 `decision-history.md`가 보존한다.
- Issue #934는 canonical Area와 남은 Boss arena의 모든 정적 collision platform·wall을 Ropeable로 정렬했다. Boss 본체·적·투사체·hazard actor는 별도 capability를 유지한다.
- `1-2:p0` 진입 Platform의 오른쪽 32px(x 608~~640)가 seam 건너 `1-1:shaft-shell-right` solid wall과 world 좌표에서 겹쳐 있어(Runtime 조립 후 x:608~~640, y:-672~-640 정사각형) one-way platform과 solid wall이 같은 칸에 공존하던 collision 결함을 수정했다. `1-2:p0` 오른쪽 경계를 640→608로 정리해 겹침을 제거했으며, 그 칸은 `1-1`의 solid wall이 그대로 경계를 담당한다. 이 수정 전 48개 Stage 전수 검사에서 이 한 쌍 외의 cross-stage collision surface 겹침은 없었다.
- Sector 02 environment package에서 이전 far/mid/near 3-layer 배경 세대(`backdrop-far.png`/`backdrop-mid.png`/`backdrop-near.png`)가 `backdrop-fixed` + island 2장 세대로 교체된 뒤에도 정리되지 않고 남아 있던 것을 확인해 삭제했다. `sprite-manifest.json` 어떤 atlas도 참조하지 않던 미사용 자산이었다.
- `1-1` Stage에서 발판/앵커 2개 이상을 한 번에 건너뛸 수 있는 구간(p1→p3, p2→랜드마크 C, structural-grip→exit-deck)을 발견해 기획 의도(허용 스킵 1개)에 맞게 재구성했다. `cable-overhang`(structural-grip)과 `p3` 발판은 중복 웨이포인트로 판단해 제거하고, `p1`을 (224,-320)→(50,-300)으로 옮겨 남은 경로(entry→A→p1→p2→C→exit-deck)에서 2단계 이상 스킵이 불가능하도록 정리했다. Map Editor로 사용자가 직접 저장 적용해 반영했다. 나머지 Sector 1~6 Stage의 동일 점검은 아직 진행 전이다.
- Sector 03-2의 `media-wall-body`(`kind: design-reference`, `collision: false`, `renderable: false` — 순수 미술 참조용 surface)가 Issue #934(`52901df`, 정적 충돌 표면 로프 부착 일괄 보장)의 일괄 처리 과정에서 `grappleable: false → true`로 잘못 뒤집혔던 것을 원상복구했다. `collision: false`인 surface는 `isRopeableCollisionSurface`가 이미 걸러내 현재 Runtime 동작에는 영향이 없지만, 48개 canonical Stage 전수 검사 결과 `collision:false`이면서 `grappleable:true`인 유일한 사례였다.

## 열린 기획·구현 게이트

1. 일반 Timer `60초 / +10초 / cap 60초 / Purge 240px/s`는 physical mapping 확정 전까지 HOLD다.
2. Boss03·Boss06의 실제 desktop/mobile·1~4인 multiplayer full combat을 확인한다.
3. Sector 01~06의 실제 전체 traversal과 두 기기 장시간 플레이를 확인한다.
4. NPC는 예선 핵심 범위에서 제외한다.

## 지속 통합 절차

1. 관련 Sector·Stage README와 `PRODUCTION-ALIGNMENT.md`를 Runtime source와 함께 읽는다.
2. `npm run check:scenario-integration`의 fingerprint가 바뀌면 실제 변경을 이 문서의 체크포인트·최근 변화·열린 게이트에 반영한다.
3. `AREA-SPEC.v2.json`과 generated Stage를 한 transaction으로 갱신하고 generated 파일을 단독 수기 편집하지 않는다.
4. `MOCK INTEGRATED`와 `PLAYTEST VERIFIED`를 구분하며 문서 존재만으로 구현·플레이 검증을 완료 처리하지 않는다.
5. 대체된 chronology를 이 문서에 누적하지 않고 Git 이력과 `decision-history.md`로 보낸다.
