# BOSS03 LOWER SECTOR COMMANDER 이미지 생성 기획

> 상태: **REFERENCE-ONLY / 장면형 시각 레퍼런스 생성 대기**
> 범위: 사용자 첨부 이미지는 시각 원리만 참고한다. 결과는 Boss03 재도입, Runtime 스프라이트, Arena geometry, Collision, Rope Anchor 또는 공격 판정을 만들지 않는다. 전투 규칙은 [Commander 참고 계약](./LOWER-SECTOR-COMMANDER-REFERENCE-CONTRACT.md)이 단일 소유한다.

| # | 점검 요소 | AS-IS | TO-BE / 문서 판정 |
| ---: | --- | --- | --- |
| 1 | 레퍼런스 사용 | 첨부 장면의 캐릭터·갈고리·발판을 그대로 가져올 위험이 있다. | 어두운 수직 산업 공간, 큰 보스와 작은 Player의 비율, 청색 환경광·적색 경고등의 대비만 사용한다. 원형 얼굴·갈고리 사슬·거대 주먹·Player 복장·발판 배치는 복제 금지. **통과** |
| 2 | 이번 납품 | 단독 본체 스프라이트와 장면 레퍼런스의 목적이 섞여 있었다. | `16:9` 한 장의 장면형 시각 레퍼런스다. 우측 중앙의 Boss03과 좌측의 작은 일반 Player 실루엣으로 크기만 비교하며, 장면의 좌향 구도는 연출용이고 이후 Runtime 우향 기준을 바꾸지 않는다. 투명 PNG·atlas·Runtime manifest는 만들지 않는다. **통과** |
| 3 | 공간·구도 | 흰 배경 단독 캐릭터는 산업 보스의 규모와 위협 방향을 보여주지 못했다. | 깊은 청흑색 수직 산업 Shaft, 멀리 겹치는 설비 기둥, 매달린 짧은 체인·정비 훅, 얇은 난간이 있는 두 개 이하의 고정 발판으로 깊이를 만든다. 화면 하단은 어둡게 비워 보스·Player·그랩 예고를 가리지 않는다. **통과** |
| 4 | 본체 실루엣 | 수평 하우징이 다리 위에 얹힌 드론·차량처럼 읽힐 수 있었다. | 완전 기계형의 캐주얼 중량 2족 보행기: 낮고 넓은 센서 헤드 → 넓은 직립 몸통 → 짧은 골반 → 분리된 두 다리·넓은 발의 수직 순서가 보여야 한다. 일반 Player보다 최소 네 배 크게 보이게 한다. **통과** |
| 5 | 그랩 | 첨부 이미지의 갈고리·사슬을 실제 Boss03 공격으로 오인할 수 있다. | 가까운 어깨 팔은 대칭 2지 유압 그리퍼다. 장면에서는 고정 대상 쪽으로 조준된 팔, 보스 팔의 조준선, 대상 발밑 경고 원만 보인다. 물리 갈고리·사슬·번개·로켓 주먹은 넣지 않는다. **통과** |
| 6 | 해머·후면 | 팔 역할과 뒷면 장치가 보조 실루엣을 흐릴 수 있었다. | 반대쪽 어깨 팔은 짧고 두꺼운 사각 파일드라이버 해머를 중립 자세로 둔다. 등은 낮은 정비 패널과 소수의 짧은 호스만 허용하며 태엽 키·크랭크·회전 장치·안테나는 금지한다. **통과** |
| 7 | 색·재질 | 첨부 이미지의 청색·적색을 보스의 고유 식별색으로 오인할 수 있다. | 보스는 먹색 강철·녹슨 철색·황색 센서/경고등을 유지한다. 청색은 환경의 낮은 대비 림광, 적색은 공간의 국소 경고등에만 쓴다. 청색 코어·청록 센서·네온 갑주·신품 메카 질감은 금지한다. **통과** |
| 8 | 표현 밀도 | 고해상도 콘셉트의 기계 세부가 실제 게임 가독성을 침해할 수 있다. | 거대한 덩어리·팔 역할·발 접지·그랩 방향을 먼저 읽히게 하고, 파이프·볼트·광원은 배경으로 후퇴시킨다. 이후 Runtime 전환은 별도 승인 뒤 `128×192px`·우향·발 중앙·투명 RGBA·픽셀 규격으로 다시 제작·검수한다. **통과** |
| 9 | 금지된 범위 | 장면 이미지를 Arena 저작이나 게임 규칙의 근거로 쓰기 쉽다. | 이 시안은 좌표·충돌·발판 수·Rope Anchor·그랩 사거리·피해·기절·체력을 정하지 않는다. 실제 Stage 장면화는 Arena 원본과 `Scenario Art Reference` 검수가 생긴 뒤에만 허용한다. **통과** |
| 10 | 생성 수락 기준 | 이미지가 있어도 Boss03 정체성·규칙과의 충돌을 판정할 기준이 없었다. | 머리·몸통·골반·두 다리와 그리퍼·해머가 즉시 구분되고, Player 대비·조준선·경고 원이 읽히며, 금지 요소와 원본 고유 디자인이 없는 경우에만 채택한다. 문서 점검은 **통과**, 실제 생성물 점검은 **생성 후 대기**. |

## 생성 입력

`A single 16:9 reference-only 2D pixel-art action-game scene: in a deep blue-black vertical industrial shaft, a casual upright heavy bipedal industrial commander stands on the right, at least four times larger than a small generic Player silhouette on the left. The commander has a low wide amber-visor sensor head, a broad vertical torso, short pelvis, two separate heavy legs, a near hydraulic two-prong parallel gripper aiming at the Player, and a far short square pile-driver hammer at rest. Show an amber targeting line and a ground warning ring, charcoal steel and rusty iron with worn repair patches, sparse red environmental warning lights, suspended short chains and distant machinery. Avoid drones, horizontal vehicle hulls, circular faces or cores, hooks, chains as weapons, fists, rocket arms, lightning, cyan boss lights, wind-up keys, cranks, antennas, text, UI, copied character designs, and runtime geometry.`

생성 후에는 이 문서의 10번 행만으로 채택·반려를 판단한다. 채택한 원본만 `./images/`에 보관하며, 사용자 승인 전에는 저장소에 추가하지 않는다.
