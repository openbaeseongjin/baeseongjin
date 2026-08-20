# 게임 해커톤 기획 정리

## 1. 프로젝트 한 줄 정의

> **아크샨식 고정 길이 로프 액션 × 아이작의 로그라이크·증강 성장 구조**

붕괴 중인 하나의 도시 월드를 고정 길이 로프로 탈출하며, 영역별 방해요소를 처리하고 generic Augment 선택으로 매 플레이 성장 방향을 만드는 2D 횡스크롤 액션 게임이다.

## 2. 현재 방향

| 구분        | 방향                                                             | 참고 작품             |
| ----------- | ---------------------------------------------------------------- | --------------------- |
| 핵심 조작   | 고정 길이 로프의 진자 운동과 접선 방향 충격                      | 아크샨, 산나비        |
| 플레이 구조 | 반복 플레이, 랜덤 빌드, 수집                                     | 아이작                |
| 공간 경험   | 하나의 붕괴 도시 안에서 48개 진행 영역을 아래에서 위로 연속 돌파 | 점프킹, 할로우 나이트 |
| 성장 구조   | 플레이 외 시간에도 누적되는 자동 성장                            | 팰월드, OpenFront     |

장르 중심은 **로프 액션 로그라이크**로 확정한다. 한 런은 하나의 붕괴 도시 월드 안에서 계속되며, 시나리오의 `맵`은 별도 월드가 아니라 Sector 안의 landmark·objective·encounter를 뜻한다. 실패하면 현재 Sector entry에서 다시 합류하고 개인 사망은 공용 진행을 되돌리지 않는다.

## 3. 핵심 플레이 경험

초반 목표는 플레이 시작 후 **1~2분 안에 “로프 타는 게 재미있다”를 느끼게 하는 것**이다.

- 로프 조작은 별도 설명 없이도 빠르게 이해할 수 있어야 한다.
- 초반 전투와 이동 난이도는 낮게 시작한다.
- 실패 페널티를 최소화해 재도전을 부담스럽지 않게 만든다.
- 첫 증강 선택이나 강화를 빠르게 제공한다.
- 첫 프로토타입은 콘텐츠 양보다 로프의 손맛을 우선 검증한다.
- 기본 공격도 자동 사격이 아니라 로프 이동의 속도·충돌 진입을 사용해, 이동 숙련이 전투 성과로 직접 이어지게 한다.
- 정상 짧은 낙하는 허용하되 큰 추락 착지에는 체력 위험을 두어 고도 관리와 안전한 Recovery 선택에 의미를 준다.

## 4. 확정된 장르 구조

한 번의 도전은 다음 순서로 진행한다.

1. 붕괴 도시의 시작 영역에서 한 런을 시작한다.
2. 로프로 이동하며 현재 영역이 요구하는 방해요소 처리 조건을 달성한다. 조건은 시나리오에 따라 처치·무력화·우회·상호작용·이동 달성 중 하나 이상이며, 적 처치로 일괄 고정하지 않는다.
3. 완료 조건을 달성하면 명시적 출구를 열고, 플레이어가 출구를 통과해 다음 영역으로 진행한다.
4. Stage 진입 판정은 두지 않는다. Player collider가 보이는 세이브 구조물 bounds와 겹칠 때만 개인 부활 위치를 저장하고 현재 Stage 표시는 좌표에서 파생한다.
5. 1-4·2-3·3-5의 명시적 장비 Node에서 현재 loadout과 호환되는 generic Augment를 하나씩 선택해 로프 조작·전투 방식을 강화한다.
6. 더 높은 구역 또는 최종 목표를 향해 전진한다.
7. 개인 실패는 최근 도달 Stage 세이브 포인트로 복귀하며 objective·열린 route·처치 적을 유지한다.
8. 저장 지점은 Player별 Stage 세이브 포인트다. 싱글·멀티와 현재 접속 인원 수에 관계없이 각 Player는 자기가 마지막으로 접촉한 지점에서 부활하며 다른 Player의 저장 위치를 공유하지 않는다. Timer·Purge가 미정인 동안 전원 실패도 current Sector baseline을 초기화하지 않는다.
9. 각 Node는 `runSeed + stablePlayerId + selectionIndex`로 서로 다른 호환 카드 3장을 제시하며 reroll·rarity·동일 Player 카드 중복은 없다.
10. Augment 선택은 공통 피드백으로 알리고, 데스크톱은 선택한 generic loadout을 상시 HUD에 표시한다.
11. 배포 전 `npm run check`와 실제 브라우저·멀티플레이 smoke로 정적 Sector geometry·독립 objective·Player별 save·content boundary와 싱글·멀티 공용 진행을 검증한다.
12. 활성 플레이 시간·처치·피해·로프 절단·영역 완료·첫 Augment 선택 시간은 `RunMetrics`에서 수집해 난이도 조정 근거로 사용한다.
13. 발견된 문제 영역은 현재 시나리오의 관련 회귀 테스트에 이유와 함께 추가해 같은 영역·진행 계약에서 우선 재현한다.
14. 원격 플레이테스트는 설정 버튼을 1초 길게 눌러 디버그 수치 표시를 켜고 현재 런 지표를 확인한다.
15. 기본 Runtime은 체력이 0이 되거나 낙사하면 해당 플레이어만 자기 최근 활성 Stage 세이브 포인트에서 최대 체력으로 즉시 부활시키고 공용 objective·열린 route·처치 적을 유지한다. 각 Stage entry의 `STAGE SAVE` 구조물은 최외곽 시각 bounds와 gameplay trigger bounds를 하나의 계약으로 사용하고 player 원형 collider 겹침으로만 그 Player의 anchor를 활성화한다. 활성화 때 당사자 화면의 열린 core·안내·cue로 저장 완료를 알린다. 전원 사망도 각자 부활만 수행하며 공용 Sector reset은 Timer/Purge 결정 전까지 만들지 않는다.
16. 네트워크 연결 전 불변 PlayerCommand 기록을 재생해 위치·전투·진행·지표 결정성을 비교한다.
17. 다중 플레이어 명령은 프로토콜 버전과 틱을 가진 배치로 묶고 플레이어 ID 순으로 정규화한다.
18. 모든 플레이어는 같은 PlayerRuntimeFactory에서 물리·로프·전투·생명 상태를 조립한다.

메트로배니아식 자유 역주행·능력 기반 진입 제한은 초기 범위에서 제외한다. 저자가 정한 영역 순서와 출구를 사용하는 것은 메트로배니아식 능력 잠금과 구분한다.

## 5. 로프 액션 명세

- 사거리 안에 있는 모든 벽과 유효한 지형 표면에 부착할 수 있다.
- 전용 앵커 오브젝트는 사용하지 않는다.
- 부착 시 현재 거리를 로프 길이로 유지하며 자동으로 줄어들지 않는다. 능동적인 운동량은 접선 드래그로만 만든다.
- 부착 중 A/D 입력은 추가 가속을 만들지 않는다. 중력은 로프 접선 방향 성분만 운동에 반영된다.
- 부착 후 0.08초 동안 유지하고 줄에 수직인 접선 방향으로 화면 짧은 변의 11% 이상 드래그하면 해당 방향으로 부착당 한 번 780의 강한 스윙 임펄스를 얻는다. 로프 방향 드래그 성분과 클릭 직후의 작은 조준 보정은 무시하고 해제 시 현재 운동량을 유지한다.
- 로프는 부착 순간의 길이를 고정 반경으로 유지하며 늘어나거나 자동으로 감기지 않는다.
- 접선 드래그 충격과 중력으로 진자 속도를 만들며, 해제 순간의 속도와 방향을 유지한다.
- 핵심 숙련 요소는 부착 위치 선택, 충격 방향 설정, 중력을 이용한 회전, 해제 타이밍이다.
- 선택한 Augment가 전투 보조를 제공해도, 생존과 위치 선정에는 로프 이동이 계속 필요해야 한다.
- 기본 자동 사격은 사용하지 않는다. 시스템 구현은 후속 기능을 위해 보존하되 기본 플레이어는 비활성 상태로 시작한다.
- 로프 부착 중 `620px/s` 이상으로 적과 새로 몸체 충돌하면 충돌 순간 전체 속력에 비례한 피해를 준다. 기준은 `1000px/s → 100 피해`이며 `피해 = 속력 × 0.1`이다. 겹친 채 머무르는 동안에는 반복 피해를 주지 않고 분리 후 재진입해야 한다.

현재 기준값은 최대 사거리 400px, 재발사 대기 0.50초, 화면 짧은 변의 11% 접선 드래그, 최소 홀드 0.08초, 스윙 임펄스 780이다. 고정 길이 로프는
방사 속도를 제거하고 중력과 접선 충격으로만 운동량을 만든다. 이 값은 L2 시작점이며 플레이테스트로 조정한다.

수평 발판은 아래에서 위로 통과하고 위에서 떨어질 때만 착지한다. 충돌 방향과 무관하게 로프는 발판의 모든 표면에 부착할 수 있다. 초기 월드는 상승 경로를 막는 수직 벽과 천장을 생성하지 않는다.

착지 피해는 충돌 보정 전 하강 속도로 계산한다. `800px/s` 이하는 안전하고 `800~1400px/s`는 최대 체력의 `0~50%`를 선형 적용하며 `1400px/s` 이상은 최대 체력의 `50%` 피해다. 이 수치는 초반 정상 Landing을 벌주지 않으면서 여러 층 추락에 리스크를 주기 위한 L2 시작점이다.

## 6. 성장 요소 아이디어

플레이어가 직접 조작하지 않는 동안에도 성장하는 구조에 관심이 있으나, 구체적인 방식은 아직 확정하지 않았다.

- 자동 자원 생산
- 로프 또는 매듭의 영구 강화
- 시간에 따라 충전되는 성장 게이지

자동 성장은 코어 액션이 검증된 뒤 도입 여부를 결정한다. 첫 프로토타입의 필수 범위에는 포함하지 않는다.

## 7. 비주얼 방향

현재 기본 표현은 작은 캐릭터와 거대한 다층 배경의 대비를 사용하는 혼합 도트 `sprite` 프로필이다. 초기 프로토타입의 HTML Canvas 플랫 도형은 `?renderer=polygon` fallback으로 유지해 정식 자산이 없어도 게임 흐름과 판정을 검증한다.

- 정식 픽셀 자산의 크기, `32×32` 기본 격자와 화면 위계는 [`pixel-graphics-design-guide.md`](./pixel-graphics-design-guide.md)를 따른다.
- 플레이어, 적, 지형, 위험물과 상호작용 오브젝트는 실루엣과 동작으로 먼저 구분한다.
- 로프의 장력, 속도와 피해 원인은 선 굵기·잔상·파티클로 전달하되 플레이 영역의 경계를 가리지 않는다.
- 플레이 영역은 밝고 선명하게, 배경은 깊어질수록 명도 대비·채도·도트 밀도를 낮춘다.
- 전문 자산 제작은 mock 기반 개발을 막지 않으며 validator와 실제 화면 검증을 통과한 결과만 교체한다.

## 8. 역할 분담

| 담당   | 역할                                    |
| ------ | --------------------------------------- |
| 배용호 | 로프, 전투, 게임 시스템 개발            |
| 이재진 | 모션, VFX                               |
| 성현   | 기획, 자료 조사, GitHub 관리, 일정 관리 |

메인 개발자는 그래픽·오디오·맵 제작 결과를 기다리지 않고 교체 가능한 mock으로 시스템과 전체 플레이 흐름을 먼저 완성한다. 각 전문 담당자는 이미 제공된 가이드·template·mock 배치를 기준으로 독립 제작을 병행하며, 작업물이 검증된 시점에 기존 runtime package나 definition을 교체한다.

전문 작업물의 완료는 메인 개발, 플레이테스트, 최종 스퍼트와 예선 제출의 선행 조건이 아니다. 정해진 통합 마감까지 validator와 실제 화면·청취 검증을 통과한 결과만 제출 빌드에 반영하고, 준비되지 않았거나 통합 위험이 큰 영역은 검증된 mock을 유지한다. 다만 공개 manifest·loader·이벤트 binding처럼 전문 작업과 메인 개발이 함께 사용하는 계약 변경은 양쪽 작업 전에 먼저 합의한다.

제출 전 시나리오 자료는 총 6개 섹터 × 8개 Stage, 전체 48개 문서로 유지한다. 다만 `1-1`, `1-2` 같은 Stage는 player-facing Runtime 진행 단위가 아니라 **연속 Sector의 landmark·objective·encounter로 이관한 migration alias**다. 0.29.0 기본 Runtime에서 Sector 01~~03은 강제 Gate 포탈과 Stage별 문 없이 가로 4,800px의 하나의 물리 공간이며, 기존 아래→위 콘텐츠 순서를 local vertical stack으로 보존한다. 넓어진 양옆은 실제 exploration·combat·recovery wing이고 진행을 좌우 지그재그로 바꾸지 않는다. future Boss room은 Sector transition slot에 삽입해 downstream Stage local 좌표를 다시 쓰지 않는다. 구현과 인계 일정은 `SECTOR 01 → 06`을 단위로 관리하고 전문 담당자는 stable landmark·encounter·object·cue ID를 이어받는다. Sector 04~~06은 아직 migration input이며 Runtime 구현 완료가 아니다.

### 월드와 진행 영역 기준

- #622의 Phase 1~2는 `SectorDefinition`, Sector validator와 build/startup-only legacy preview adapter를 canonical authoring 경계로 둔다. `encounterSlot`의 topology 권위는 `encounterId`, `slotId`, `position`, `activation`이고 `legacyStageAlias`는 문서·migration metadata일 뿐이다. 적 종류의 fixed/pool 선택은 topology와 분리된 `enemySelection`이 소유하며 `fixedEnemyType` 또는 `allowedEnemyTypes` 중 정확히 하나만 허용한다.
- #625/#637은 Sector 01~~03 preview를 seamless 기본 Runtime으로 전환했고, #642의 0.30.0은 이를 `seamless-sector-runtime-v3`로 확장했다. Stage 정의는 local vertical stack으로 보존하고, compiler가 actual lateral city wing과 future Boss room용 transition slot을 조립한다. Sector 04~~06은 alias input으로만 남고 legacy Area/Gate catalog는 이전 revision compatibility 검증에 사용한다.
- Sector 01 access vertical slice는 1-3·1-6·1-7 Carrier 후보 중 아무 2곳을 골라 Access Module을 얻는 objective를 유지한다. 현재는 Sector Transit Lock이나 party-wipe reset을 만들지 않는다.
- 0.32.0은 Sector 01~03을 authored safe slot과 결정적 enemy pool로 채운다. 1-1·1-2는 비전투, 이후는 화면당 약 1기와 후반 역할 중첩을 기준으로 하며 exact slot 예산과 보존 계약은 [`enemy-density-composition.md`](./enemy-density-composition.md)를 따른다.
- 아래의 Area·Gate·보스 전환 규칙은 migration source와 이전 revision 설명이다. 새 Sector의 first-landmark/route Timer mapping으로 자동 변환하지 않는다.
- 한 런의 실제 월드는 하나이며 영역 전환 때 월드나 런 상태를 초기화하지 않는다.
- 각 진행 영역은 입구, 이동 경로, 필수 완료 조건, 명시적 출구와 다음 영역 연결을 가진다.
- 출구가 필요한 이유는 붕괴 도시 탈출의 압박 속에서 현재 영역의 문제를 해결하고 다음 영역으로 넘어갔음을 플레이어에게 명확히 알리기 위해서다.
- 방해요소 처리는 적 처치만 뜻하지 않는다. `1-3`·`1-5`처럼 Turret 파괴가 선택인 영역은 도달·우회·패널 조작을 완료 조건으로 사용한다.
- 각 Sector의 일반 구간은 `60초`를 공유하고 진행 보상은 한 번에 `+10초`, cap은 `60초`다. 같은 Sector 안에서 landmark가 바뀌어도 시간을 초기화하지 않는다.
- Timer 0초부터 `CONTAINMENT PURGE FIELD`가 `240px/s`로 상승한다. 시간 보상 중에는 현재 높이에서 멈추고 다음 0초부터 같은 위치에서 재상승하며 후퇴·Player 추적·순간이동은 없다.
- Purge 접촉은 lethal이고 전멸은 current Sector objective·route·enemy·Timer·Field만 reset한다. Player별 증강과 이전 Sector 진행은 보존한다.
- 각 Sector에는 보스가 1개씩 있으며, 기획자가 정할 transition slot에서 일반 Timer·Purge와 잔여 시간을 끝낸 뒤 별도의 **보스 전투 타이머**와 Arena 위험을 시작한다.
- `1-8 CONTAINMENT GATE`에는 보스를 넣지 않으며 기존 `Lower Grid Shutdown → Worker District Reveal → 일반 구간 종료 Checkpoint`를 유지한다. Sector 01 보스의 위치·전환 순서·시나리오는 기획자가 별도로 확정한다.
- 수치와 core 의미는 확정됐지만 seamless topology의 정확한 `+10초` trigger, 최초 Field origin과 개인 Purge 사망 복귀는 후속 결정 전 구현 금지 HOLD다. 상세 계약은 [`sector-timer-and-boss-flow.md`](./sector-timer-and-boss-flow.md)를 따른다.
- 현재 시드 기반 48단계 절차 생성 월드는 코어 조작을 검증한 프로토타입이다. 목표 시나리오 월드는 저자가 정한 48개 진행 영역을 기본으로 하며, 영역 내부의 시드 변형 허용 범위는 경로·완료 조건·출구를 훼손하지 않는 별도 기획으로 확정한다.
- 섹터 1의 legacy 내부 콘텐츠와 완료 조건은 [`sector-01-world-structure-plan.md`](./sector-01-world-structure-plan.md)를 migration input으로 사용하고, topology·진행·부활은 0.25.0 seamless Sector 계약을 따른다.

## 9. 일정과 목표

- 정기 회의: 매일 22:00~23:00, Discord
- 장르·핵심 조작·전체 진행 같은 게임 기획은 완료 상태이며 `SECTOR 01`의 `1-1`~`1-8` 시나리오가 모두 작성됐다. 전체 48개 중 나머지 40개 맵의 시나리오와 레벨 디자인은 아직 없으며 새로 만들어야 한다.
- 나머지 40개 맵 시나리오와 레벨 디자인은 섹터 순서대로 작성해 8월 19일까지 확정한다. 메인 개발은 전체 완료를 기다리지 않고 `SECTOR 01`부터 mock으로 구현하며, 다음 섹터 전체 연결 완료를 선언하려면 해당 섹터의 8개 영역 흐름과 오브젝트 요구가 모두 필요하다.
- 증강 v1 기획과 topology-independent Runtime은 0.26.0에 완료됐고 0.28.0에서 현재 Runtime Sector 01~~03의 명시적 장비 Node를 `1-4 → 2-3 → 3-5` 순서의 Player별 획득원으로 연결한다. Rope 6·Action 6·Signature 6·범용 modifier 4의 22장, 결정적 3장 offer와 Player별 최대 6장을 사용한다. Sector 04~~06 획득 Node, Quest·순수 이동 카드·Specialization은 별도 확장이다. 기준은 [`augment-v1.md`](./augment-v1.md)다.
- 0.31.0 모바일 조작은 우측 토글로 Rope Aim과 Action Aim을 분리한다. Action Aim의 월드 터치는 실제 접촉 위치로 방향을 정하고 Rope를 발사하지 않으며, 유효 Action 시작은 적 명중 여부와 별개로 잔상·mock SFX를 먼저 제공한다.
- NPC 역할·배치·대사와 대화 진행 규칙, 관련 상호작용 UI·게임 요소는 8월 15일까지 확정한다. 이 기획은 NPC가 처음 등장하는 섹터와 공용 대화 시스템 구현의 선행 조건이다.
- 엔딩 내용, 진입 조건, 최종 Encounter 이후 흐름과 관련 UI·게임 요소는 8월 19일까지 확정한다. 이 기획은 `SECTOR 06`과 최종 완료 상태 구현의 선행 조건이다.
- 그래픽·오디오 담당자는 메인 개발자가 맵별로 정리한 오브젝트·cue 목록을 받아 8월 19일에 정식 리소스 1차 생산분을 인계한다. 1차 생산분은 전체 자산 완료가 아니라 앞서 정리된 우선 오브젝트의 교체 가능한 첫 묶음이다.
- 메인 개발자는 8월 21일까지 6개 섹터의 48개 맵과 오브젝트 동작을 섹터 순서대로 mock으로 연결하고, 준비된 1차 정식 리소스만 검증해 선택 통합한다. 8월 22~23일은 전체 섹터 플레이 흐름의 마지막 스퍼트로 사용한다.
- 8월 14~17일 가족여행 전까지 완료할 항목:
    - 장르 중심 확정
    - 코어 프로토타입 제작
    - GitHub 프로젝트 구조 확정
    - 아트 방향 확정

### Discord 회의 기록 방식

1. `#회의` 채널에서 `/meeting start`를 실행한다.
2. 음성 회의를 진행하면서 회의·기획·코딩 채널에 의견, 외부 링크, 이미지/PDF/ZIP 등의 참고파일을 올린다.
3. 봇은 시작과 종료 사이의 세 채널 메시지만 수집하고 종료 시 최종 채널 기록과 대조한다.
4. `#회의` 채널에서 `/meeting end`를 실행한다.
5. 회의록은 `DISCUSSED / DECIDED / REJECTED / HYPOTHESES / REFERENCES / ACTION ITEMS / BLOCKERS / NEXT MEETING`으로 분류된다.
6. 로컬 Ollama의 분류는 후보일 뿐이며, 실제 발언 인용과 명시적 합의를 통과한 결정·액션만 원장에 반영한다. 질문과 모호한 제안은 `HYPOTHESES`에 둔다.
7. `REFERENCES`에는 채널·작성자·시각·외부 URL·첨부파일명/형식/크기만 기록하며 파일을 자동으로 열거나 내려받지 않는다.

자동 예약 시작은 사용하지 않는다. 회의록 채널과 공개 GitHub에 원문 일부가 재게시될 수 있으므로 모든 참여자의 녹음·게시 동의를 먼저 확인한다.

## 10. 첫 프로토타입 범위

### 포함

1. 기본 이동과 조준
2. 사거리 내 모든 벽에 로프 부착
3. 고정 반경, 접선 드래그 충격, 중력 진자 운동, 해제 관성
4. 시드 기반 간단한 대형 맵으로 로프 코어를 검증하고, 이후 하나의 연속 월드 안에 저작된 진행 영역을 조립
5. 단순한 적 1종
6. Foundation Augment 3종
7. 최근 도달 Stage checkpoint 복귀와 빠른 재개

### 제외

- 보스 전투 구현. 단, 제출 목표 구조에는 섹터별 보스 1개가 포함된다.
- 영구 성장과 자동 자원 생산
- 수집 도감
- 완성형 아트와 픽셀 애니메이션
- 다수의 무기·적·바이옴
- 메트로배니아식 능력 잠금과 자유 역주행 구조

완료 기준은 콘텐츠 분량이 아니라, 처음 플레이한 사람이 짧은 시간 안에 로프 조작을 이해하고 다시 사용하고 싶어 하는지 여부다.

일정이 부족하면 VFX와 콘텐츠 수를 먼저 줄인다. 로프 물리와 현재 저작 영역의 진행 흐름은 프로토타입의 필수 검증 대상이므로 유지한다.

## 11. Ball Fight Simulator 재사용 계획

같은 상위 경로의 `ball-fight-simulator` 문서와 시스템을 기반으로 시작한다. 기존 게임 전체를 복제하지 않고 검증된 공용 기반과 패턴만 선별한다.

### 직접 재사용 후보

- `src/game-kit/`: 폴더 단위 이식을 전제로 분리된 공용 라이브러리
- `Vector2`, `PhysicsBody`: 위치·속도·가속도 계산
- `CollisionShape`, `collisionResponse`, `PhysicsMaterial`: 지형과 엔티티 충돌
- `PhysicsDebugRingBuffer`: 로프 물리의 NaN·Infinity 및 폭주 추적
- Canvas 가시성·경로·이펙트 유틸
- `shuffled`: 생성 요소 무작위화
- `ScreenWakeLock`: 브라우저 플레이 중 화면 잠금 방지

### 참고 후 게임에 맞게 이식

- `src/terrain/`: 시드 기반 생성, 지형 정규화, 충돌, Canvas 렌더링 패턴
- `src/camera.js`: 월드 좌표 변환과 카메라 구조
- `requestAnimationFrame` 기반 게임 루프와 Canvas 렌더러 구조

### 재사용하지 않는 영역

- 기존 캐릭터와 능력
- 사냥터·토너먼트 규칙
- 기존 전투 UI와 진행 데이터
- Ball Fight Simulator에 결합된 엔티티와 VFX

현재 저장소에는 라이선스가 없으므로 실제 코드 이식 전 소스 사용·귀속 방침을 별도로 확인한다. 이 문서 단계에서는 코드를 복사하지 않는다.

## 12. 다음 회의 결정 사항

- [x] 장르 중심: 로그라이크
- [x] 로프 역할: 전투 중 필수 이동·생존 수단
- [x] 핵심 성장 축: 로프 숙련 + Foundation Augment
- [x] 그래픽 방향: 혼합 도트 `sprite` 기본, Canvas 플랫 도형 fallback
- [x] 첫 프로토타입 포함·제외 범위
- [x] 로프 물리의 초기 수치
- [x] 로프 물리 조정 절차: 다음 싱글 Run에 적용하는 디버그 Rope tuning panel과 파생값 표시
- [x] 목표 월드 구조: 하나의 연속 월드와 저작된 48개 진행 영역
- [ ] 저작 영역 내부에서 허용할 절차 변형 범위
- [x] 일반 Timer `60/+10/cap60`, 0초 Purge 240px/s, lethal·전멸 Sector reset·Boss 분리
- [ ] seamless topology의 +10 trigger·Field origin·개인 Purge 사망 복귀
- [x] 일반 타이머와 보스 타이머의 완전 분리·잔여 시간 폐기·보스 Arena 붕괴
- [x] 섹터별 보스 1개
- [ ] Timer/Purge의 재접속과 최종 UI/오디오 cue
- [ ] 8개 진행 영역과 섹터 보스의 위치 관계
- [x] 증강 v1 22장과 Player별 결정적 3장 offer·최대 6장 loadout
- [x] 적 행동과 공격 방식: 플레이어를 향한 투사체, 로프 절단 우선 판정, 본체 피해. 위치 넉백은 직접 플레이어를 추격·돌진하는 적만 받고 고정·고정경로 적은 authored 위치를 유지한다.
- [x] 적 roster 기본형: 기존 `경계 포탑`·`순찰 드론`, 경계 포탑 확장형 `절단 포탑`, 신규 `추격 드론`·`방패 드론`·`포격 드론`·`지원 드론`·`군집 드론`
- [x] 적 분류·구현 순서: 행동 요소별 대표 기본형 하나를 먼저 단독 안정화하고 같은 계열 확장형과 복합 조합은 그 뒤에 추가
- [x] encounter 선택: topology 독립 stable slot이 `고정 계열/type` 또는 `허용 pool`을 소유하며 pool은 slotId·run seed·world revision으로 결정 선택
- [x] 향후 고정 저작: 맵 제작자가 slot 선택 선언 하나만 pool에서 고정 값으로 바꾸고 위치·activation·Stable ID·AI는 재사용
- [x] 코드 구현: pure selector·다섯 enemy capability·서버 fixed step·snapshot 복원·중립 포격 투사체·방패 Rope 충돌 방어 완료
- [x] #623 canonical `SectorDefinition`·encounter validator·build/startup-only preview adapter를 enemy selector에 연결하고 preview corpus 전체에서 areaId 없는 결정 선택 검증
- [x] City Phase 3 wide Runtime에서 canonical encounter를 shipped world enemy spawn으로 사용하고 legacy Patrol route·Cutter rules를 새 schema에 보존
- [x] 검증 정책: 안정적인 코드 계약만 자동화하고 roster 목록·가중치·수치·배치·색은 고정하지 않으며 브라우저 검증 제외
- [x] Foundation 선택 중에도 월드 시간과 협동 위험은 계속 흐르고 선택 입력만 플레이어 조작과 분리

## 13. 아직 열려 있는 질문

- 어떤 physical landmark/objective transition이 +10초를 지급하는가?
- 연속 Sector에서 최초 Field origin과 개인 Purge 사망 복귀를 어떻게 정하는가?
- 보스는 섹터의 8개 진행 영역 안에 포함되는가, 별도 전투 구간인가?
- 보스 위치·전환 시점과 `n-8` 일반 구간 종료 Checkpoint·보상은 어떤 순서로 연결되는가?
- 타이머와 탈락 상태의 네트워크 권위·이탈·재접속은 어떻게 처리하는가?
- 최소 관전 HUD와 타이머·붕괴 경고의 최종 그래픽·오디오 cue는 무엇인가?
- `SECTOR 06` 보스 이후 최종 런 종료를 어떤 장면으로 표현할 것인가?
- 로프 자체도 적에게 피해나 상태 이상을 주는가?
- 첫 Foundation Augment 3종은 어떤 빌드 차이를 보여줘야 하는가?
- 절차 생성 결과의 통과 가능성을 어떤 규칙이나 자동 검사로 보장할 것인가?
- 3명의 작업을 병렬화하기 위해 가장 먼저 고정해야 할 인터페이스는 무엇인가?
