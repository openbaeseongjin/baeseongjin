# Sector 02 게임 오브젝트 카탈로그

작성일: 2026-08-14
상태: 시나리오 `2-1`~`2-8` mock 데이터와 runtime 연결 완료
런타임 기준: `src/game/world/areas/sector02/Sector02AreaCatalog.js`

## 목적

Sector 02의 지형·오브젝트·진행 목표·표현 cue를 안정 ID로 정리한다. 맵은 gameplay 의미만 소유하며 이미지·atlas·음원 경로를 넣지 않는다. 그래픽·오디오 담당자는 `presentationId`와 `cueIds`가 가리키는 교체 가능한 package를 제작하고, mock package가 준비되지 않은 정식 리소스의 fallback을 맡는다.

Sector 01과 Sector 02는 별도 게임 모드가 아니다. `CurrentAuthoredAreaCatalog`가 `1-1 → 1-8 → 2-1 → 2-8`을 한 월드로 조립하며 로컬·네트워크 실행 모두 같은 `GameSimulation`과 같은 월드 revision을 사용한다.

## 공용 오브젝트 상태 계약

| 종류 | 상태·자료 | gameplay 책임 | 표현 인계 |
| --- | --- | --- | --- |
| `patrol-drone` | map route/corridor, activation band, `idle/patrol → acquire → fire → cooldown` | 기존 `EnemyObject` 공격 능력 재사용. band 밖 이동·획득 금지, 공격 cycle 동안 target 유지, 표준 탄은 Rope 절단 없음 | Patrol/telegraph/fire/cooldown 표현 |
| `story-display` | stable story/cue ID | 대사·서사 자료의 위치만 제공. 충돌·완료 조건 없음 | 표시 문구·환경 cue |
| `maintenance-frame` | Gate ID 참조 | 실제 진행 출구. 2-5의 잠긴 Upper Transit Gate와 구분 | 우회 경로 가독성 |
| `augment-node` | `interact-choice`, Foundation 필요 | 2-3 Specialization 선택 흐름만 정의. 실제 pool·효과는 기획 확정 전 차단 | 선택 UI와 node 상태 |
| `checkpoint` | `inactive → active` | Sector 일반 진행 종료 복구 지점. 새 증강 보상과 별도 | 활성화 연출·cue |
| `gate` | `locked → unlocked → crossed` | 요구 objective 집계와 명시적 영역 통과 | 잠금·해제·통과 표현 |

## 영역별 인계

| 영역 | 핵심 mock 오브젝트 | 진행 계약 | 그래픽·오디오 cue |
| --- | --- | --- | --- |
| `2-1 WORKER BLOCK 12` | `g1~g4`, `community-notice`, `exit-frame` | 적 없이 Worker District의 주거 흔적과 기본 Rope 이동 소개 | residential courtyard, Group C 대기 공지 |
| `2-2 PATROL WALKWAY` | `g1~g5`, `drone-1`, cover/recovery, `exit-frame` | 첫 `Patrol Drone T1`; 이동 band 하나와 선택적 교전 | patrol cycle, active security |
| `2-3 RESIDENTIAL SERVICE NODE` | `g1~g2`, `specialization-node`, `exit-frame` | 기존 Foundation을 심화하는 `interact-choice`; pool은 `TBD`라 선택 완료 전 Gate 차단 | foundation detected, specialization available |
| `2-4 RESIDENTIAL STACK` | `g1~g9`, `drone-1`, 다중 safe/flow/pressure route | 한 Drone band 안에서 주거 수직 다중 경로 검증 | residential scale, multi-route |
| `2-5 EVACUATION WALKWAY` | `drone-1`, `upper-transit-gate`, `evacuation-status`, `maintenance-frame` | Upper Transit Gate는 서사상 잠금. 실제 진행 Gate는 Maintenance Service Frame | assembly complete, transit restricted, maintenance bypass |
| `2-6 QUIET RESIDENTIAL VOID` | `g1~g7`, courtyard background prop, `exit-frame` | 적·새 기믹 없는 이동/서사 relief | quiet residential void |
| `2-7 SHELTER ACCESS` | `drone-1~2`, `shelter-status`, safe deck, `exit-frame` | 수직으로 분리된 두 activation band와 중간 relief; 지속 crossfire 금지 | shelter status, separated patrol bands |
| `2-8 EVACUATION PLATFORM` | `drone-1~2`, `transfer-control`, `sector-end-checkpoint`, `content-boundary` | 두 band 종합 뒤 전송 기록 확인. Boss 없이 일반 진행 종료; full run 완료가 아닌 content boundary | A/B complete, C suspended, priority access active |

## 확정하지 않은 경계

- 2-3 Specialization의 이름·수치·효과·선택 pool은 `TBD`다. 현재 runtime은 geometry와 stable node/objective만 제공하고 임의 성장 규칙을 실행하지 않는다.
- 2-8은 새 Augment를 지급하지 않는다. Sector-end Checkpoint는 복구만 제공한다.
- Sector 02 Boss 위치·전투와 `2-8 → 3-1` 전환은 미정이다. 현재 월드는 2-8 Gate에서 `contentBoundaryReached`만 기록하고 `run-completed`를 발생시키지 않는다.
- 2026-08-14 `origin/main`에 `3-1 POWERED PROMENADE`와 새 Scanner system을 쓰는 `3-2 SCANNER GALLERY`가 추가됐지만, 위 전환 계약과 Scanner 방향을 사용자와 검토하기 전에는 현재 16개 연결 월드에 넣지 않는다.

## 검증 계약

1. `AreaDefinitionValidator`가 ID·참조·bounds·Rope 이동 거리·Gate 연결과 embedded asset/audio path 부재를 검사한다.
2. 두 Patrol Drone을 쓰는 2-7·2-8은 activation band가 겹치지 않아야 한다.
3. Patrol route는 월드 조립 때 area offset만큼 함께 이동해야 한다.
4. 같은 catalog revision으로 만든 로컬 실행과 권위 서버 snapshot은 같은 16개 영역과 진행 상태를 복원해야 한다.
5. 정식 그래픽·오디오는 stable ID를 보존한 채 mock catalog/package만 교체한다.
