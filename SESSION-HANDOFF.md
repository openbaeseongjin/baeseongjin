# 세션 핸드오프

## 현재 기준

- 프로젝트: Canvas 기반 2D 고정 길이 로프 액션 로그라이크
- 브랜치: `main`
- 현재 단계: 로그라이크 런 순환 P0와 멀티 전송 기반 완료, P1·P2 실제 플레이테스트 대기
- 실행 기반: 브라우저 ES Module, Canvas 2D, Node.js 로컬 서버와 무번들 테스트
- 제품 기준: `docs/game-hackathon-planning.md`
- 개발 일정: `docs/development-schedule.md`
- 구현 순서: `docs/implementation-roadmap.md`
- 문서 인덱스: `docs/README.md`
- 구조와 규칙: `docs/architecture.md`, `docs/development-rules.md`

## 현재 구현

- `$github-task-flow`가 만드는 Lore 커밋은 제목·본문·검증 설명을 한국어로 작성한다. trailer 키와 규약상 고정 열거 값만 원문을 유지하며, 상세 규칙은 `.agents/skills/github-task-flow/SKILL.md`를 따른다. 같은 저장소를 여러 Codex 작업이 동시에 개발할 때는 `.agents/skills/coordinate-github-tasks/SKILL.md`로 checkout·실제 diff·심볼·공개 계약 중첩을 확인하고 작업 메시지와 연결된 Issue 댓글에서 단일 소유자·의존 관계·병합 순서를 합의한다. 같은 checkout은 선행 작업이 병합될 때까지 Git 게시 단계를 직렬화하며, 반복 기준은 `docs/development-rules.md`의 **동시 Codex 작업과 GitHub 범위 조정**을 따른다.
- 고정 길이 로프: 사거리 440px, 화면 짧은 변의 11% 접선 드래그, 0.08초 최소 홀드, 부착당 한 번 780 임펄스
- 현재 기본 런은 하나의 연속 월드에 Sector 01·02의 저작 영역 16개를 순서대로 조립하며, 모든 표면 로프 부착과 수평 발판 아래→위 통과를 유지한다.
- seed와 world revision은 싱글·멀티가 같은 저작 월드 정의와 결정적 표현을 재현하는 식별자다. 48단계 절차 경로 생성과 summit 완료는 현재 기본 제품 시나리오가 아니며 필수 테스트에서 제외한다. `GameSimulation`은 첫 플레이어 호환 별칭 없이 플레이어 상태 쓰기를 소유하고, 서버 세션·로컬 예측·멀티 앱은 `docs/architecture.md`의 snapshot·공개 명령 경계만 사용한다.
- PC와 모바일 공용 이동·점프·로프 명령, 모바일 중앙 `좌 · 점프 · 우` 조작 바와 멀티터치
- 사거리 기반 자동 공격, 원거리 적, 로프 절단, 본체 피해·넉백·무적 시간
- 체력, 사망·낙사 시 플레이어별 활성 체크포인트 즉시 부활
- 전투 HUD·VFX·파티클과 Android PWA 설치·자동 최신 배포 적용
- 모바일은 전체 상태 HUD 대신 생존에 필수인 HP 전용 패널을 항상 표시
- `CanvasRenderer`가 camera 기반 불변 world viewport를 프레임당 한 번 만들고 terrain·decoration·enemy·projectile 하위 renderer가 직접 컬링한다. 정적 surface geometry와 seed·zone 장식 배치는 renderer가 캐시하며 sprite·polygon, 싱글·멀티가 같은 경로를 사용한다. 기본 Canvas 정책은 DPR 최대 2와 backing store 최대 `3 * 1024 * 1024` pixel이고 `GameRendererFactory.canvasOptions`로 조정할 수 있다. 상세 경계는 `docs/architecture.md`와 `docs/development-rules.md`를 따른다.
- authored world의 mock은 디버그 도형이 아니라 레벨 피드백이 가능한 공간 blockout이어야 한다. Sector 01은 `industrial-maintenance`, Sector 02는 `residential-commercial` 환경 표현을 고도와 무관하게 `sectorId`에서 선택한다. 각 authored 영역은 하나의 연속 월드 안에서도 `area.bounds` 기반 좌우 벽체·층간 벌크헤드·Gate 개구부로 방·Shaft·Atrium의 공간 단위가 읽혀야 하며, Gate와 Terminal을 빈 공간에 독립된 기호로 띄우지 않는다. `areaId`와 방 구분은 UI·게임 진행 상태를 위한 논리 단위이지 별도 물리 월드나 멀티플레이 권한 구역이 아니다. Anchor·Checkpoint·Terminal·Gate는 역할을 읽을 수 있는 설비 실루엣으로 표시하고 Gate는 X 디버그 표식 대신 잠금·해제 상태가 구분되는 문으로 표현한다. mock Gate 문은 플레이어보다 조금 크고 하단이 출구 데크 바닥에 닿게 하며, Gate 패널 전체 실루엣은 플레이어보다 조금 작게 유지한다. Recovery point 같은 설계용 위치와 절차 생성 초기 개발용 `default-mock` decoration sprite는 기본 플레이 화면에 노출하지 않고, authored backdrop이 섹터별 비충돌 배경 장식과 설비 조명을 소유한다. 영역마다 별도 scene·world를 로드하지 않지만 열린 Gate는 플레이어 중심이 바닥 기준 문 내부 aperture에 직접 들어온 순간에만 같은 월드의 다음 영역 입구로 보내는 지속 단방향 포탈이다. 문 위·옆 공간과 Gate barrier·출구 bounds는 포탈 판정이 아니므로 로프 이동 중 상태 초기화를 일으키지 않으며, 상세 계약은 `docs/architecture.md`의 저작 영역 Gate 계약을 따른다. 사용권을 확인하지 않은 시나리오 레퍼런스 이미지는 runtime asset으로 사용하지 않으며 반복 기준은 `docs/graphics-asset-guide.md`의 **mock도 공간 피드백을 전달한다**를 따른다.
- authored 사각 surface와 world object는 저작 좌표가 시각/충돌 사각형의 어느 점인지 `coordinateAnchor`로 명시한다. 수평 보행 발판·천장 부착 구조는 `top-center`, 바닥에 선 Gate·패널과 수직 바닥 고정 구조는 `bottom-center`, 자유 배치 표식은 `center`를 사용한다. `AuthoredCoordinateAnchor`가 꼭짓점과 렌더 bounds를 같은 기준점에서 계산하고 assembler가 기준점도 함께 이동시킨다. 층별 렌더 오프셋으로 바닥 접촉을 보정하지 않으며 상세 계약은 `docs/architecture.md`의 저작 좌표 기준점 규칙을 따른다.
- 모든 authored 영역의 출구 조작은 `영역별 선행 목표 달성 → 문 옆 Gate 패널 활성화 → 패널 조작 → Gate 개방`으로 통일한다. 목표 종류는 시나리오별로 달라도 실제 문을 여는 입력은 바꾸지 않는다. 패널 조작은 별도 PC 키를 추가하지 않고 PC `W/↑`와 모바일 점프 버튼을 가까운 패널의 문맥 상호작용으로 함께 사용한다. 각 영역의 좌우 경계는 고정 충돌 벽으로 닫고, 층 경계는 Gate 개구부를 제외한 전폭 고정 충돌 격벽으로 막는다. 잠긴 동안은 Gate barrier가 개구부까지 막아 로프 탄성으로 벽 바깥을 돌아가거나 다른 위치를 월경할 수 없게 한다. 상세 구조는 `docs/architecture.md`의 저작 영역 Gate 계약과 `docs/sector-01-world-structure-plan.md`를 따른다.
- 싱글도 `PlayerCommand → LocalAuthority → GameSimulation` 공용 경계를 사용하며, 로컬 `PlayerPhysics`의 prototype getter를 복제하지 않고 하위 player renderer에 전달해 sprite·polygon 모두 같은 강체 각도를 그린다. ID 선택과 상태 보존 계약은 `docs/architecture.md`의 **렌더링 프로필 경계**를 따른다.
- 별도 Discord 서비스는 상세 분류 앞에 결정적 3~5줄 `SUMMARY`가 있는 회의 기록과 기본 비활성 read-only Codex 기획 작업을 제공하며, Discord 입력을 비신뢰 데이터로 취급한다.
- 고정 게임 서버의 4자리 채널 생성·참가, 채널별 독립 월드와 2인 분할 권한 동기화
- 120Hz 권위 틱, 20Hz 스냅샷, 자기 예측·동료 보간과 투사체 사건 재생. 현재 적용된 분할 권한 방식과 상세 프로토콜의 단일 기준은 `docs/multiplayer-synchronization.md`다.
- 20Hz snapshot 전송은 협상된 누적 ACK 기준으로 클라이언트당 미확인 4개만 유지한다. 느린 수신자는 중간 지속 상태를 최신값으로 합치되 spawn·hit·resolve 사건은 모두 보존해, reliable WebSocket 적체가 과거 원격 위치와 몹 HP를 뒤늦게 재생하지 않게 한다. 상세 흐름 제어 계약은 `docs/multiplayer-synchronization.md`를 따른다.
- 플레이어 간 원형 몸체 충돌과 실제 접속자 ID를 소유하는 로컬 예측 시뮬레이션
- `owner-motion`은 인증·프로토콜 형식·유한값과 세션 tick 범위를 통과한 최신 소유 클라이언트 상태를 서버 복제본과 동료의 최종 수렴 원점으로 공용 `GameSimulation`에 적용한다. 속도·각속도·이동 거리·로프 offset 봉투로 거부하지 않으며 중복·역순·세션 범위 밖 tick과 완료된 런의 후속 상태는 성공한 no-op으로 처리해 `ownerMotionTick`을 오염시키거나 소유자를 되감지 않는다. 멀티 서버 fixed tick은 복제 플레이어 위치만으로 낙사를 시작하지 않고 최신 fallen `owner-motion`에서 부활·아티팩트 손실·공유 사건을 한 번 확정한다.
- 서버는 소유 클라이언트가 만든 플레이어 상태·사건을 검증해 다른 클라이언트에 공유하는 허브다. 소유자의 HP·피격 무적·생명·로프·쿨다운·시간 제한 강화는 서버 snapshot이나 impact receipt로 다시 쓰지 않는다. 서버가 상태를 직접 진행하는 범위는 몹·중립 투사체·공용 월드·세션 수명주기이며, 서버 상태로 소유자 전체를 복원하는 경우는 최초 입장·재접속과 체크포인트처럼 별도 복구 계약을 가진 사건 전이로 제한한다. 정상 또는 무시된 `owner-motion` receipt는 소유자 복원·입력 재실행을 시작하지 않는다. 상세 계약은 `docs/multiplayer-synchronization.md`를 따른다.
- impact의 최종 체감 결과는 피해 클라이언트가 소유한다. 정상 claim은 사건 자료와 도메인 상태 지문만 보내며 서버가 같은 전이를 적용해 일치하면 바로 확정한다. `state-diverged`일 때만 서버가 projectile·피해자 연결에 묶인 일회용 `recoveryId`를 발급하고, 피해 클라이언트가 응답 시점의 최신 소유자 상태·`stateTick`·새 지문을 한 번 보내 서버·동료를 자기 결과로 수렴시킨다. challenge 없는 전체 상태는 거부하고, 승인 복구는 상태와 `ownerMotionTick`을 원자적으로 갱신하며 로컬 HP·로프·부활·아티팩트 손실은 복구하지 않는다. 엔진 공식 레퍼런스 대비 핵심 충족표와 상세 기준은 `docs/multiplayer-synchronization.md`의 **다른 게임 엔진 기준 충족 점검**과 **impact claim과 최종 수렴**을 따른다.
- 투사체는 같은 `projectile-motion`·`client-projectile-collision` capability ID에 종류별 믹스인을 조합한다. 운동·충돌·claim 거부 뒤 수명 정책과 복제 상태는 객체가 소유하며 `PredictableProjectileStore`와 `GameSimulation`은 종류별 분기 없이 등록·식별자 대응·단계 실행·사건 연결만 담당한다. 상세 규칙은 `docs/architecture.md`와 `docs/development-rules.md`를 따른다.
- 정적 파일을 노출하지 않는 상시 게임 서버 실행 모드와 `/health` 상태 확인
- game-only 서버는 기본적으로 공식 GitHub Pages Origin만 WebSocket에 허용하며 개발용 정적 통합 서버는 이 제한을 강제하지 않는다.
- `npm run publish:multiplayer`는 컴퓨터 재시작 뒤 운영자가 한 명령으로 상시 게임 서버와 외부 공유 터널을 다시 열고, 새 공개 주소를 Pages 설정에 반영해 배포까지 이어가는 운영 경로를 제공한다. 실행 전 clean `main` 전제를 확인하고 `index.html` 메타 값만 교체한 단일 커밋을 `origin main`에 push한 뒤 Pages 노출·공개 smoke를 검증하며, push 후 실패는 서버/터널을 유지한 채 안내만 출력한다. 기존 `share:multiplayer`는 로컬 정적 화면까지 함께 공유하는 개발용 경로로 유지한다. 상세 절차는 `docs/multiplayer-sharing.md`를 따른다.

실제 조작 기반 전체 등반 검사, 서로 다른 기기의 장시간 2인 플레이테스트와 고정 HTTPS/WSS 운영 주소 배포는 아직 완료하지 않았다.

## 다음 작업

Sector 01 공용 배경 아트 기준은 `docs/bsh/scenario/README.md`다. `1-1`~`1-8`은 Navy·Charcoal 기반의 거대한 산업 정비 시설로 연결하고, 전경의 어두운 구조물·중경의 플레이 공간·원경의 푸른 안개로 깊이를 분리한다. 중앙의 큰 여백, 제한된 Cyan 설비등, 드문 Orange 경고등을 유지하되 Player·Rope·Anchor·Collision·Sentry Telegraph의 가독성을 항상 우선한다. 이미지의 구조물을 실제 지형으로 복제하지 않고 각 Stage README의 Geometry·Mechanic 규격을 따른다. 제공 이미지는 출처·사용권과 런타임 제작 규격을 확인하기 전까지 문서용 레퍼런스로만 사용한다.

섹터 1 맵 구조는 `docs/sector-01-world-structure-plan.md`를 현재 기준으로 구현한다. 실제 월드는 하나이며 `1-1`~`1-8`은 별도 월드가 아니라 같은 붕괴 도시 안의 진행 영역이다. 각 영역이 정의한 처치·무력화·우회·상호작용·이동 달성 조건을 만족하면 문 옆 Gate 패널이 활성화되고, 플레이어가 패널을 조작해야 명시적 출구가 열린다. 첫 활성 플레이어가 열린 문 안으로 들어가면 공용 진행을 다음 영역으로 한 번 전진시키고 그 플레이어만 이동한다. 문은 지속 단방향 포탈로 남아 뒤의 플레이어도 직접 들어온 시점에 각각 이동하며 공용 진행을 다시 올리지 않는다. 포탈은 별도 world/scene을 만들지 않고 월드·런·체력·생명·아티팩트·무기 수치·체크포인트·공용 오브젝트 진행을 유지한다. 각 진입자에게만 로프·속도·회전·접지·포인터 버퍼·일시 전투 타이머·무기 재사용 대기를 초기화하고 도착 인원을 겹치지 않게 배치한다. 일반 타이머는 섹터 전체에서 유지되고 Gate 통과 때 보충되며, 0초부터 하층 붕괴가 상승한다. 붕괴 탈락자는 최소 관전 뒤 다음 Gate에서 합류하고 전원 탈락 때만 해당 섹터 일반 구간을 재시작한다. 기획자 지정 보스 진입에서는 일반 시간과 붕괴를 끝내고 잔여 시간을 폐기한 뒤 별도 보스 타이머를 시작하며, 0초부터 Arena가 붕괴하고 전원 탈락은 보스 시도만 재시작한다. 메인 개발자는 수치를 mock으로 먼저 연결하고 팀·기획자가 공동 플레이로 최종 조정한다. 기준은 `docs/sector-timer-and-boss-flow.md`다. 보스 위치·전투 시나리오는 기획자 확정 전 추정 구현하지 않는다.

Sector 01-1의 현재 기준은 `docs/bsh/scenario/1/1-1/README.md`의 `SERVICE SHAFT` REV 3.1과 `PRODUCTION-ALIGNMENT.md`다. 첫 Authored Stage를 32px Grid·960×960 Blockout으로 만들고, A=Attach·B=Release Timing·C=Swing Enjoyment와 R1/R2/R3의 5초 이내 재시도를 검증한다. 최초 플레이의 목표 클리어 시간은 90~120초지만 이를 강제 대기시간이나 전용 속도 제한으로 만들지 않는다. C01~C05의 local Y Camera Zone과 desktop/mobile zoom을 싱글·멀티 공용 카메라에 적용하고, 실제 `RunMetrics.areaTiming` 표본이 목표를 벗어나면 Geometry·Camera·Recovery를 조정한다. Turret·Wind·Augment·필수 공중 ReAttach는 제외하며, `swingImpulse = 0`에서도 전 구간이 재미있고 안정적으로 통과되어야 한다. Terminal은 이동을 막지 않는 0.9초 문구 세 개를 공용 진행 상태로 2.7초 처리한 뒤 Gate를 열며, 하부 봉쇄와 Rooftop Pad 03 Maintenance Shuttle 목표를 전달한다.

Sector 01-2의 현재 기준은 `docs/bsh/scenario/1/1-2/README.md`의 `DOUBLE ANCHOR SHAFT` REV 3.1, `PRODUCTION-ALIGNMENT.md`, `docs/bsh/scenario/1/AUGMENT-STORY-INTEGRATION.md`다. 32px Grid·960×1088 승인 Blockout에서 A=복습·B=첫 Airborne Handoff·C=방향 반전·D=설명 없는 Flow Test를 검증한다. 숙련자는 A→B→C→D를 무착지로 연결하고, 초보자는 P1/P2/P3 Recovery를 이용해 3~5초 안에 해당 Handoff를 재시도할 수 있어야 한다. C01~C05 카메라는 현재 공용 추적·보간 안에서 다음 Anchor·Recovery·P4·Gate를 우선 표시한다. 진입·첫 상승·P4 도달·패널 준비에는 각각 `lift-offline`, `manual-access-only`, `power-reduction-stage-2`, `security-access-check`를 개인 화면에 한 번 표시하며 입력을 막지 않는다. Enemy·Damage Hazard·Wind·Augment 효과와 선택 UI는 제외한다. `rope-telemetry-start`와 A→B→C→D Attach·Release·Recovery 측정은 향후 Foundation 세 Profile의 공통 진단 자료지만 입력·지표·멀티 동기화 경계를 함께 정해야 하므로 사용자 방향 검토 전 구현하지 않는다. Gate·패널은 P4의 `y=-960`을 `bottom-center`로 사용하고 실제 문 개구부만 지속 단방향 포탈로 판정한다.

Sector 01-3의 현재 기준은 `docs/bsh/scenario/1/1-3/README.md`의 `SECURITY CHECK` REV 3.0과 `PRODUCTION-ALIGNMENT.md`다. 32px Grid·960×1152 Blockout에서 Scanner 인증 뒤 첫 Sentry T1의 `idle → acquire → track → lock → fire → cooldown` 공격 언어와 B→C Safe/Flow/Recovery 경로를 검증한다. R1은 `x=-32~224`, `y=-576`이며 Sentry activation은 전체 폭의 `y=-928~-384`다. Camera Shot은 로컬 플레이어 좌표로 고르고 Scanner·경고·위반·Access Denied는 개인 화면에 한 번 표시한다. Sentry 상태·고정 조준 방향은 서버 snapshot으로 공유하고 sprite/polygon mock은 같은 상태를 읽는다. Cover Wall C1 뒤와 `y<-928`에서는 LOS와 Encounter가 끝나야 하며, Turret 파괴는 Clear 조건이 아니다. 첫 Projectile은 Rope를 자르지 않고 one-shot·과도한 Knockback·전체 재등반을 만들지 않아야 한다. 상단 Service Panel의 `MAINTENANCE OVERRIDE → VIOLATION LOGGED`가 1-4 Maintenance Node로 연결된다. 기존 두 PNG는 이전 Cooling Shaft 이미지라 제작 기준으로 사용하지 않는다.

Sector 01-4의 현재 기준은 `docs/bsh/scenario/1/1-4/README.md`의 `MAINTENANCE NODE` REV 3.0이다. 1-3의 압박 뒤 첫 Build Choice를 제공하는 휴식·보상 Stage로, `IMPULSE COIL`·`RELAY LINK`·`SHEAR CURRENT` 세 Foundation Augment를 고정 제시한다. 선택 전후 Rope 차이가 즉시 읽혀야 하며, 짧은 Calibration 공간은 세 선택 모두 통과 가능해야 한다. 실제 Enemy와 본격적인 Build 검증은 1-5로 미루고, 기존 Artifact/Reward Selection과의 재사용 범위 및 `swingImpulse`의 기본 Rope 귀속 여부를 구현 전에 확정한다.

Sector 01-5의 현재 기준은 `docs/bsh/scenario/1/1-5/README.md`의 `AUGMENT TEST BAY` REV 3.0이다. 새 기믹 없이 하나의 960px 폭 Maintenance Test Bay를 세 Build가 다르게 해석하도록 구성한다. `IMPULSE COIL`은 Zone A Long Arc, `RELAY LINK`는 Zone B C→D→E Chain, `SHEAR CURRENT`는 Zone C의 Rope Geometry와 재사용 Sentry T1 제어에서 강점을 보여야 한다. 어떤 Augment도 통과 필수 조건이 아니며 Base Safe Route와 Recovery를 항상 제공한다. Build별 선택률·경로·시간·Turret 상호작용을 기록하고, 다음 1-6에서 Wind를 새로 소개한다.

Sector 01-6의 현재 기준은 `docs/bsh/scenario/1/1-6/README.md`의 `COOLING SHAFT` REV 3.0이다. Enemy와 Damage Hazard 없이 Rope에 작용하는 첫 External Force인 Wind만 학습한다. Fan A는 약한 Continuous Wind로 B→C Wind-assisted Swing을 안전하게 소개하고, Fan B는 `LULL → WARNING → ACTIVE → LULL` 주기로 기다리는 Safe Route와 Active Wind를 이용하는 Flow Route를 함께 제공한다. Wind Visual·Fan Animation·실제 Force는 같은 State Source를 사용해야 하며, Recovery와 Wind Shadow에서 조작권을 회복할 수 있어야 한다. 세 Augment 모두 통과 가능해야 하고 다음 1-7 `PRESSURE BYPASS`에서 Wind·Turret·Build를 조합한다.

Sector 01-7의 현재 기준은 `docs/bsh/scenario/1/1-7/README.md`의 `PRESSURE BYPASS` REV 3.0이다. 새 기믹 없이 Rope Chaining·선택 Augment·Sentry T1·Pulsed Wind·Cover/Wind Shadow·Recovery를 처음 조합한다. A→B 약풍과 C→D 무풍 Turret 복습 뒤 D→E에서만 Main Vent와 Turret LOS를 겹쳐 실패 원인을 단계적으로 읽게 한다. Safe Route는 Shot과 Vent LULL을 기다리고, Flow Route는 TRACK·WARNING을 읽어 ACTIVE Wind를 이용한다. Turret 파괴는 필수가 아니며 F 이후에는 LOS와 Wind를 모두 끝낸 뒤 Manual Bypass를 조작한다. `1-8` 기준으로 Manual Bypass는 위쪽 탈출 경로를 열고, 일반 Sentry Projectile은 Rope를 자르지 않으며, 압력은 잠시 안정화됐다가 Containment로 다시 악화되는 방향으로 확정됐다.

Sector 01-8의 현재 기준은 `docs/bsh/scenario/1/1-8/README.md`의 `CONTAINMENT GATE` REV 3.0이다. 새 기믹이나 Boss 없이 Sector 1 **일반 구간** 학습을 회수한다. T1은 Wind 없는 Lower Security Phase, T2는 Final Pulsed Wind와 겹치는 Synthesis Phase를 맡으며 두 Turret은 절대 동시 Crossfire를 만들지 않는다. Mid Safe Deck과 H 이후 Complete Relief로 Phase를 분리하고, 모든 Foundation Build에 Safe Route와 해당 Phase Recovery를 제공한다. Gate Override 뒤 Lower Grid Shutdown을 아래부터 순차 연출하고 Worker District Preview 끝에서 일반 구간 종료 Checkpoint를 활성화한다. 이 Stage에는 보스를 넣지 않으며, Sector 01 보스 전환 위치와 전투 시나리오는 별도로 확정한다. 1-7의 Lock 항목은 `Manual Bypass = 위쪽 탈출 경로 개방`, `Standard Sentry Projectile = Player Hit Only / Rope Cut 없음`, `압력은 잠깐 안정화되지만 Containment로 다시 악화`로 확정한다.

실제 두 기기 검증은 `docs/two-device-playtest-protocol.md`의 단일 협동 시나리오와 기록 양식을 사용한다. 문서 작성은 플레이테스트 완료를 뜻하지 않는다.

장르·핵심 조작·전체 진행 같은 게임 기획은 완료 상태다. 2026-08-14 최신 `origin/main` 기준 현재 상세 시나리오는 `SECTOR 01`의 `1-1`~`1-8`, `SECTOR 02`의 `2-1`~`2-8`, `SECTOR 03`의 `3-1`~`3-2`, 총 18개다. 메인 개발은 날짜별 예정 수량이 아니라 현재 실제 시나리오가 나온 영역까지 섹터·번호 순서대로 mock 연결하고, 새 문서가 추가되면 Git 변경을 확인해 이어 붙인다. 현재 runtime은 먼저 확정된 `1-1 → 2-8` 16개 영역을 한 월드로 연결했다. 새 `3-1 POWERED PROMENADE`는 Enemy·새 기믹이 없는 blockout이고 `3-2 SCANNER GALLERY`는 새 Access Scan Field를 도입한다. 앞단의 Sector 02 Boss/전환과 새 Scanner system은 큰 방향 변경이므로 사용자 검토 전 구현·연결 방식을 고정하지 않는다.

`2-3 RESIDENTIAL SERVICE NODE`의 Specialization은 1-4에서 고른 Foundation Augment를 유지한 채 그 방향을 한 단계 심화하는 성장으로 시나리오에 명시됐다. Artifact 선택의 입력·UI 흐름은 재사용 후보지만 Artifact와 Rope Augment의 ID·의미 체계는 합치지 않는다. 실제 Specialization 이름·효과·수치·선택 pool은 아직 미정이므로 geometry와 node flow만 먼저 구현하고 성장 규칙을 임의 확정하지 않는다. `2-5 EVACUATION WALKWAY`의 잠긴 Upper Transit Gate는 서사적 장애물이며 실제 다음 진행 경로는 Maintenance Service Frame이다. `2-8 EVACUATION PLATFORM`은 Boss가 없는 Sector 02 일반 진행 Finale와 Sector-end Checkpoint까지 구현하며 그 뒤 Boss/`3-1` 전환 순서는 공통 Boss Flow가 확정되기 전 연결하지 않는다. 새 시나리오의 좌표·문구·cue 조정은 기존 계약 안에서 흡수하지만 맵 순서·핵심 기믹·완료 조건·Gate 연결·asset 경계 변경은 사용자 검토를 먼저 받는다.

Sector 02의 Patrol Drone은 별도 적·별도 전투 FSM으로 만들지 않는다. 기존 `EnemyObject`에 맵이 제공하는 순찰 corridor/route와 activation band를 소비하는 선택적 Patrol capability를 조합하고 기존 acquire·track·lock·fire·cooldown과 투사체 규칙을 재사용한다. Patrol 자료가 없는 기존 Sentry는 정지 동작을 그대로 유지한다. Drone은 자기 activation band를 벗어나지 않고 한 공격 cycle 동안 선택한 target을 유지하며, 다른 band의 플레이어 진입으로 cross-zone 재조준하거나 두 Drone이 지속 crossfire를 만들지 않게 한다. 영역별 stable ID와 미확정 경계는 `docs/sector-02-game-object-catalog.md`를 기준으로 한다.

맵 외에도 개발을 막는 세 기획 게이트가 있다. 증강 내용·현재 아티팩트와 Module의 관계·관련 UI와 게임 요소는 8월 14일까지, NPC 역할·대사·대화 시스템·관련 UI와 게임 요소는 8월 15일까지, 엔딩·진입 조건·최종 흐름·관련 UI와 게임 요소는 8월 19일까지 확정한다. 각각 첫 Maintenance Node, 첫 NPC 섹터, `SECTOR 06` 구현의 선행 조건이다. 역할별 병렬 일정과 마감은 `docs/development-schedule.md`, 상세 구현 완료 기준은 `docs/implementation-roadmap.md`의 **제출 전 시나리오 구현 트랙**을 따른다.

메인 개발자는 현재 작성된 맵을 `SECTOR 01 → 02 → 03 → 04 → 05 → 06` 및 섹터 내 번호 순서로 구현한다. 각 맵을 시작할 때 등장 오브젝트·상태·표현 cue를 먼저 정리하고 gameplay와 레벨 흐름을 mock으로 플레이 가능하게 만든다. 맵 definition에는 이미지·atlas·음원 파일 경로를 넣지 않고 stable object/state/event/presentation/cue ID만 둔다. 환경·오디오는 검증된 runtime catalog의 package를 사용하고 준비되지 않았으면 `default-mock`을 선택한다. authored object는 교체 가능한 world-object mock presentation catalog를 거쳐 표시한다. 그래픽·오디오 담당자는 같은 ID와 mock 배치를 이어받아 정식 package·binding만 교체하며 지형·물리·완료 조건·Gate·네트워크 권위를 바꾸지 않는다.

로컬 실행과 네트워크 실행은 별도의 맵·게임플레이 구현이 아니다. 둘 다 `GameSimulationFactory`에서 같은 현재 authored catalog로 만든 하나의 `GameSimulation`을 사용한다. 네트워크 경로는 서버 스냅샷의 동일 world revision과 공용 진행 상태를 검증·복원할 뿐 별도 맵을 만들지 않는다. 실행 방식마다 월드 catalog를 따로 선택하는 코드를 추가하지 않는다.

시나리오 mock 연결 뒤 최근 멀티 변경을 실제 두 기기에서 확인한다. 두 플레이어가 겹치지 않고 서로를 지지하는지, 모바일 HP가 항상 보이는지, 각 플레이어의 자동 공격 한 발이 예측본과 서버 확정본으로 중복 표시되지 않는지를 한 채널에서 함께 검증한다. 실패 시 채널 번호·월드 시드·`?metrics=1` 진단 복사 결과와 재현 순서를 남긴다.

`docs/implementation-roadmap.md`의 P1을 순서대로 진행한다.

1. 초반 2분 지표 표본을 수집하고 비교
2. 초반 난이도와 체크포인트 간격 플레이테스트
3. 실제 조작 기반 전체 등반 검사
4. 고정 HTTPS/WSS 호스트를 정한 뒤 상시 게임 서버를 배포하고 Pages의 서버 주소를 설정
5. 서로 다른 실제 기기에서 로프 절단·사망·개별 체크포인트 부활·아티팩트 손실·정상 도달을 한 세션으로 검증
6. 모바일망 지연과 장시간 세션에서 예측 오차, 보정 체감과 재접속 정책을 측정

멀티 접속 중 `?metrics=1` 패널에서 RTT·스냅샷 간격·대기 명령 수·명령 거부율과 보정 거리 p50/p95·하드 스냅·외삽 시간·탄환 예측 취소를 확인할 수 있다. 같은 패널과 **진단 복사**는 frame interval·draw duration p50/p95/max, 최근·누적 dropped steps, CSS/backing 크기, 실제·유효 DPR과 collection별 `drawn/total`도 제공한다. 이 값은 게임 규칙이나 물리 120Hz를 자동 조정하지 않으며 실제 기기 플레이테스트에서 체감 문제와 함께 기록한다.

태블릿 클라이언트 렉 최적화의 자동 회귀와 데스크톱 브라우저 확인은 완료했지만 실제 문제가 발생한 태블릿과 비교 휴대폰의 수치는 아직 수집하지 않았다. 다음 두 기기 테스트에서는 같은 채널·같은 시점의 네트워크 지표와 렌더 지표를 함께 복사해 RTT 문제와 로컬 draw/backing-store 문제를 분리한다.

`npm run smoke:multiplayer`는 Pages 표시 버전과 게임 서버 `/health.version`이 같은지 먼저 확인한 뒤, Pages의 서버 설정을 읽어 공개 WSS에서 새 채널 생성, 2인 합류, 퇴장 반영, 빈 방 제거와 권위 RunMetrics 수신을 검증한다. 멀티플레이 코드나 버전 변경을 배포한 뒤에는 상시 게임 서버 프로세스를 재시작해야 하며, 버전 불일치는 이전 서버 코드가 실행 중인 배포 오류로 취급한다. PR 병합은 이 작업의 완료가 아니며 서버 재시작과 공개 smoke 통과까지가 완료 조건이다. 외부 네트워크 검사이므로 3분 제한의 기본 `npm test`와 분리하며, 기준 절차는 `docs/version-management.md`의 **필수 변경·완료 절차**를 따른다.
자동 멀티 시나리오는 OS 네트워크 설정을 바꾸지 않고 테스트 WebSocket 경계에서 왕복 지연 0/50/100/200ms와 송신 명령 손실 0/2/5%의 모든 조합을 재현한다. 최대 프로필에서도 늦은 명령 거부 원칙을 유지하도록 입력은 30틱(250ms) 앞에 예약한다. 12개 프로필마다 실제 클라이언트 두 개가 같은 방에 참가하며, 자기 입력의 즉시 예측과 서버 공유 복제 지속뿐 아니라 입력 종료 뒤 서버 복제본·동료 표시 위치가 소유 클라이언트 상태에 4px, 속도 20px/s 이내로 수렴하는지 검증한다. 세 경로의 로프 부착 상태, 두 클라이언트가 받은 HP·생명·무기·아티팩트와 체크포인트·런 상태도 각 권한 원점의 승인 결과와 같아야 한다. 원격 보간 시계는 새 스냅샷마다 최신 `serverTick` 오차의 12.5%를 최대 50ms 범위에서 흡수해 브라우저·서버 타이머 드리프트가 장시간 지속 외삽으로 누적되지 않게 한다.
RTT 측정용 명령 송신 시각은 권위 snapshot ACK로 정리하고, ACK가 유실되더라도 최근 2,048개만 유지해 장시간 손실 세션의 클라이언트 메모리를 제한한다.
멀티 연결 종료 시 오프라인 진행이나 자동 세션 복원은 하지 않고 메뉴로 돌아간다. 연결 후 권위 메시지의 프로토콜·JSON·계약 오류가 발생해 더 이상 상태 수렴을 보장할 수 없어도 마지막 정상 상태에 머물지 않고 구체적인 `closeReason`을 보존해 세션을 종료한다. 마지막 4자리 채널 번호를 참가 입력에 보존하며, 동료가 남아 월드가 유지된 경우 사용자가 같은 번호로 새 플레이어 연결을 명시적으로 시작한다. 0명이 된 채널 월드는 즉시 삭제한다.

P0 정책은 최근 아티팩트 약 1/3 손실, 체크포인트 보상, 3개 선택지, 스윙 성공 후 3초 강화로 확정됐다. 이후 수치는 플레이테스트 결과로 조정한다.

## 활성 결정

### [L1] 대화에서 확정된 결정을 문서 계층에 즉시 흡수한다

- 사용자가 향후 작업에 영향을 주는 결정을 명시하면 같은 작업에서 먼저 이 문서의 활성 결정 또는 다음 작업에 반영한다.
- 반복 적용할 제품·아키텍처·개발 규칙은 주제별 기준 문서로 일반화하고, 이 문서에는 현재 결론과 기준 위치를 남긴다.
- 최신 명시적 결정이 이전 결정보다 우선한다. 충돌하는 이전 결정은 활성 상태로 남기지 않고 대체 이유와 함께 `docs/decision-history.md`로 이동한다.
- 일회성 명령, 임시 URL·PID·디버깅 값, 에이전트의 미확정 추정은 영구 결정으로 승격하지 않는다.
- 에이전트의 필수 실행 순서는 `AGENTS.md`, 상세 기록·승격·검증 절차는 `docs/development-rules.md`의 **대화 결정 흡수 절차**를 따른다.

### [L2] 문서 인덱스와 주제별 기준 문서를 분리한다

- `docs/README.md`는 링크와 한 줄 역할 중심의 인덱스로 유지하고 주제별 상세 설명은 개별 기준 문서에서 관리한다. 일반 문서 형식, 작업자별 위치와 이미지 연결 기준은 `docs/documentation-rules.md`를 따른다.

### [L2] 개발 대화의 핸드오프 프롬프트는 명시 호출로만 만든다

- 설치된 `handoff-prompt-writer`는 사용자가 `$handoff-prompt-writer`를 명시하고 새 대화로 넘길 프롬프트 작성을 요청할 때만 실행한다.
- 현재 대화의 일반 구현·수정·조사·검토·계획·정리·병렬 작업 요청을 핸드오프로 바꾸지 않는다. 스킬 자체의 설명·설정·문제 해결·편집 요청도 핸드오프 문서 생성이 아니다.
- UI 메타데이터는 `policy.allow_implicit_invocation: false`를 유지하며, 상세 경계와 검증 기준은 `docs/development-rules.md`의 **메인 개발 대화와 핸드오프 프롬프트**를 따른다.

### [L1] 버그 수정은 증상 완화가 아니라 근본 불변식을 복구한다

- 같은 기능이나 책임 경계에서 유사 수정이 계속되거나 수정 뒤 연관 버그가 이어지면 근본 구조 검증 트리거로 취급한다. 다음 국소 패치 전에 Is-A·Has-A·Can-Do, 상태의 단일 쓰기 주체, 클라이언트·서버 사건 흐름과 최종 수렴 경계를 확인한다.
- 사용자가 버그를 고치라고 하면 관측된 한 증상만 예외 처리하지 않고 잘못된 상태 소유권, 식별자, 데이터 흐름 또는 공개 계약을 찾아 복구한다.
- 최소 diff는 목표가 아니라 제약이다. 같은 원인에서 파생될 수 있는 연관 문제를 막는 데 필요한 모듈 경계와 불변조건까지 수정한다.
- 회귀 테스트는 보이는 증상뿐 아니라 근본 불변식이 깨진 입력을 재현하고, 잘못 구성된 상태가 사건을 만들기 전에 실패하는지도 검증한다.
- 구조가 정상이고 결함 원인이 서로 독립적이라는 근거가 있으면 국소 수정으로 끝내며, 반복 발생만을 이유로 불필요한 대규모 리팩터링을 만들지 않는다.
- 상세 실행 기준은 `docs/development-rules.md`의 **구조적 버그의 책임 경계 복구**와 **테스트와 회귀 방지**를 따른다.

### [L1] 로프 숙련과 아티팩트 빌드를 핵심 경험으로 둔다

- 순간 플레이는 로프 숙련이 주도하고 아티팩트는 공격 방식과 성장 폭을 만든다.
- 자동 공격 빌드도 이동과 생존에서 로프를 대체할 수 없다.

### [L1] 한 런은 하나의 붕괴 도시 월드를 48개 진행 영역으로 연결한다

- 실제 월드는 하나이며 여러 스테이지나 scene으로 나눠 다시 생성하지 않는다. `6개 섹터 × 8개 맵`은 같은 월드 안의 저작된 진행 영역 순서다.
- 각 영역은 입구·이동 경로·필수 완료 조건·명시적 출구를 가진다. 완료 조건은 적 처치로 고정하지 않고 처치·무력화·우회·상호작용·이동 달성·증강 선택 중 시나리오가 요구하는 것을 사용한다.
- 완료 조건을 만족하면 문 옆 Gate 패널이 활성화되고, 패널 조작으로만 출구가 열린다. 첫 진입자가 공용 다음 영역을 한 번 활성화한 뒤에도 문은 지속 단방향 포탈로 유지되며, 각 플레이어는 직접 들어온 순간 자기만 다음 영역 입구의 지정 위치로 이동한다. 전환은 같은 월드·런에서 처리하고 체력·생명·아티팩트·무기 수치·체크포인트·공용 오브젝트 상태를 유지하되, 해당 진입자의 로프·속도·회전·접지·입력 버퍼·일시 전투 상태와 무기 재사용 대기는 초기화한다.
- 완료 조건은 Gate를 직접 자동 개방하지 않고 문 옆 패널을 활성화한다. 모든 층은 활성 패널 조작으로만 문을 열며, 층간 경계는 Gate 개구부 외 전폭을 고정 충돌 격벽으로 막아 로프 탄성 우회를 허용하지 않는다.
- 출구는 붕괴 도시 탈출에서 현재 영역의 문제를 해결했고 다음 구역으로 넘어간다는 사실을 명확히 전달한다.
- 각 섹터의 일반 진행 영역은 섹터 전체 총 타이머를 공유한다. 타이머는 영역 사이에서 초기화하지 않고 명시적 Gate 통과 때 보충하며, 0초부터 하층 붕괴가 상승한다.
- 붕괴에 잡힌 플레이어는 입력이 차단되고 생존 동료를 자동 추적하며 다음 Gate에서 합류한다. 일반 구간 전원 탈락은 해당 섹터 일반 구간을 재시작한다.
- 기획자가 정한 보스 진입 지점에서는 일반 타이머·붕괴를 종료하고 잔여 시간을 폐기한 뒤 별도 보스 타이머를 시작한다. 보스 타이머 0초부터 Arena가 붕괴하고 전원 탈락은 보스 시도만 재시작하며, 보스 처치 뒤 다음 섹터 진입에서 새 일반 타이머를 시작한다.
- 시간·Gate 보충량·붕괴 속도는 메인 개발자가 mock으로 구현하고 팀·기획자가 공동 플레이로 최종 조정한다. `1-8`에는 보스를 넣거나 기존 Shutdown·Worker District Reveal·일반 구간 종료 Checkpoint를 이동하지 않는다. 보스 위치·정체·전투 시나리오와 네트워크 권위·재접속·최종 cue는 아직 열려 있다. 상세 기준은 `docs/sector-timer-and-boss-flow.md`다.
- 새 싱글 실행과 새 멀티 채널의 seed·revision은 모든 클라이언트가 같은 저작 월드 정의와 결정적 표현을 재현하는 계약으로 유지한다. seed를 절차 경로 통과성 검증 대상으로 사용하지 않는다.
- 체크포인트 위치는 저작 영역과 섹터 흐름에 맞춰 다시 배치하되, 한번 활성화한 진행 지점은 아래로 내려가도 후퇴하지 않는다.
- 현재 구현된 최종 영역 `sector-02-08`의 출구는 아직 전체 게임 완료가 아니라 다음 시나리오가 준비되지 않았음을 나타내는 content boundary다.
- 실패해 최근 체크포인트로 복귀하면 현재 런의 아티팩트 일부를 잃는다. 전부 유지하거나 전부 초기화하지 않는다.
- 현재 기본 손실은 2개 이상 보유 시 최근 획득 순서부터 약 1/3이며, 최소 1개는 유지한다.
- 첫 비시작 체크포인트에서 동력핵·연사 톱니·로프 공명기 중 하나를 고르며, 좌우 이동과 점프 입력을 PC·모바일이 공유한다.
- 데스크톱은 보유 아티팩트와 로프 공명 시간을 HUD에서 확인한다. 모바일은 플레이 공간을 위해 기타 상태 HUD를 숨기되 HP 전용 패널은 항상 표시하고, 아티팩트 획득·손실은 토스트로 알린다.
- 시작점을 제외한 각 신규 체크포인트가 보상을 한 번씩 제공하며, 같은 아티팩트의 중복 효과는 곱연산으로 누적된다.
- 기본 `npm test`는 현재 저작 영역 연결·Gate 진행·content boundary와 싱글·멀티 공용 시스템만 제품 시나리오로 검증한다. 48단계 절차 월드 생성·1,000시드 sweep·summit claim 테스트는 기본 suite에서 실행하지 않는다. 상세 기준은 `docs/development-rules.md`의 테스트와 회귀 방지 절을 따른다.
- `RunMetrics`가 활성 플레이 시간·체크포인트·처치·피해·로프 절단·사망·첫 보상 시간과 현재 저작 영역 체류 시간·영역별 클리어 시간을 권위 시뮬레이션에서 수집하며, 멀티는 이 값을 서버 snapshot으로 전달해 HUD와 진단 복사에 사용한다.
- 배포 URL에 `?metrics=1`을 붙이면 일반 게임 규칙을 바꾸지 않고 현재 RunMetrics 개발 패널을 표시한다.
- 메트로배니아식 자유 역주행과 능력 잠금은 초기 범위에서 제외한다. 현재 기준의 상세 구현 흐름은 `docs/sector-01-world-structure-plan.md`를 따른다.

### [L1] 싱글과 멀티는 공용 권한 시뮬레이션을 사용한다

- 입력 장치 상태는 불변 입력 프레임으로 정규화하고 하나의 `InputDispatcher`를 거친다. 디스패처는 소유권이 일치하고 입력 capability 믹스인을 가진 `InputDrivenObject`에만 intent를 전달한다.
- 싱글은 플레이어 1명인 같은 시뮬레이션이며, 향후 네트워크는 명령·스냅샷 전송 계층만 교체한다.
- 체력이 0이 되거나 낙사한 플레이어는 동료 상호작용이나 팀 전멸을 기다리지 않고 각자 활성 체크포인트에서 즉시 최대 체력으로 부활한다.
- `CommandRecorder`가 dt와 PlayerCommand 복제본을 기록하고, 재생 결과의 위치·전투·체크포인트·아티팩트·지표 다이제스트로 결정성을 비교한다.
- `PlayerCommandBatch` 프로토콜 v3가 목표 틱·플레이어 ID·입력 `sequence`와 협동 `interact` 의도를 정규 정렬하고 JSON 왕복 시 동일한 불변 계약을 유지한다.
- 사용자 직접 입력에 반응하는 플레이어·로프는 별도 `InputDrivenObject`, 적·자동 행동 객체·직접 조작하지 않는 투사체는 `SimulationDrivenObject`로 분류한다. 이는 실행 위치가 아니라 상태 변화 원인의 Is-A 정체성이다.
- 멀티 권한 감각은 P2P형으로 둔다. 특정 플레이어의 이동·로프·피격처럼 명확한 당사자가 있는 결과는 소유자 또는 피해자 클라이언트가 먼저 판정한다. 어느 한 클라이언트에 맡길 수 없는 몹·적 투사체 생성과 궤적은 서버가 중립적으로 진행한다. 두 영역이 만나는 impact는 피해 클라이언트가 사건과 결과 지문을 claim하고 서버가 같은 전이를 적용해 수렴 여부를 확인하며, 서버의 지연된 플레이어 위치만으로 피격을 먼저 발생시키거나 취소하지 않는다.
- 협동 동기화는 클라이언트 트리거·서버 검증형으로 설계하며, 1/120초 공용 규칙·60Hz 입력·20Hz 공유 스냅샷을 초기값으로 사용한다. 아티팩트는 플레이어별 빌드이며 각자 사망·낙사로 체크포인트 부활할 때 해당 플레이어의 최근 아티팩트 약 1/3만 손실한다. 상세 계약은 `docs/multiplayer-synchronization.md`를 따른다.
- 투사체·낙하물처럼 예측 가능한 객체는 전체 위치를 반복 전송하지 않는다. 플레이어 자동 무기 발사는 소유 클라이언트가 즉시 예측한 뒤 `projectile-spawn-claim`으로 보내며, 서버는 소유권·tick·쿨다운·최근접 대상·발사 위치를 검증해 같은 projectile ID receipt와 spawn 사건을 멱등 확정한다. 멀티 서버 fixed tick은 플레이어 탄환을 따로 생성하지 않고 쿨다운·확정 탄환의 검증용 궤적·수명만 진행하며, 거부 receipt는 로컬 예측 탄환을 취소한다. 몹·적 투사체 같은 중립 객체의 생성·궤적·수명은 서버가 담당한다. 양쪽 모두 생성 틱과 초기 상태를 공유해 각 클라이언트가 재생하며, 플레이어와 만나는 피격·로프 절단은 피해 클라이언트 claim으로 확정한다. 공격 클라이언트의 탄환과 피해 클라이언트가 충돌 처리한 적 탄환은 첫 로컬 적중에서 소비되며 receipt 거부로 되살아나지 않는다. 중간 입장 welcome은 활성 객체의 원래 spawn 이벤트를 같은 ID로 다시 제공한다. 상세 계약은 `docs/multiplayer-synchronization.md`를 따른다.
- 플레이어 자동 발사 예측은 탄환뿐 아니라 발사 직전·직후 무기 쿨다운과 tick을 prediction ID별로 보존한다. 승인 receipt는 공유 확정을 뜻하며 소유자의 쿨다운을 서버 스냅샷으로 다시 쓰지 않는다. 앞 발사가 거절됐을 때 후속 발사 claim이 pending이면 현재 후속 쿨다운은 유지하고 그 후속 항목의 복구 기준만 앞 발사가 없었던 시간축으로 갱신한다. 마지막 pending 거절은 경과 tick을 뺀 준비 상태로 복구한다.
- 로프 공명 강화는 소유 클라이언트가 스윙 프레임에 즉시 적용하고 `owner-motion → rope-swing-claim → projectile-spawn-claim` 순서로 보낸다. 서버는 소유권·tick·위치·부착 anchor·아티팩트를 검증해 강화 타이머와 `rope-swing` 사건을 멱등 공유한다. 스윙마다 강화 직전·직후 값과 tick을 보존하며, 앞 스윙 거절 뒤 후속 스윙이 pending이면 후속 강화는 유지하고 후속 rollback 기준만 교정한다. 마지막 거절은 최초 스윙 이전 값으로 수렴한다. 승인 뒤 서버 복제본과 동료가 소유자의 강화 결과로 수렴하며 소유자는 스냅샷 타이머로 되감기지 않는다.
- 파티클·타격 VFX·피해 숫자·화면 흔들림은 서버가 상태나 수명으로 시뮬레이션하지 않는다. 서버는 고유 ID가 있는 판정 이벤트만 확정하고, 싱글과 멀티의 각 클라이언트가 같은 피드백 컴포넌트로 효과를 생성·진행·소멸시킨다.
- `AuthorityCommandInbox`가 플레이어별 승인 `sequence`와 허용 틱 범위를 검사해 재적용 원본·지연 진단 계약을 유지한다. 멀티 서버는 이 명령으로 `InputDrivenObject` 물리를 다시 실행하지 않으며 최신 적용 `owner-motion`만 플레이어·로프 연속 상태를 바꾼다.
- `WorldSnapshotEnvelope` 프로토콜 v4가 단조 `snapshotSequence`·중립 월드 `serverTick`·플레이어별 `ownerMotionTick`·월드 식별자·승인 번호·비예측 상태·이벤트를 묶으며, 투사체 같은 예측 객체 배열이 반복 상태로 들어가는 것을 거부한다. player 상태에는 소유자 각도·각속도와 로프 손 local offset도 포함하며, sequence는 같은 server tick의 참가·퇴장·claim 확정 봉투 순서를 구분한다.
- `GameSimulation`의 권위 틱에서 승인된 플레이어 spawn claim·중립 자동 발사·수명 만료·승인된 충돌 claim이 `PredictableObjectEvent`를 발행하며, 전송 계층은 사건을 한 번만 drain한다.
- `AuthoritySnapshotBuilder`가 플레이어별 상태·적·진행·승인 번호·사건만 권위 봉투로 만들고, 지형은 시드와 `WORLD_GENERATION_REVISION`으로 재생성하며 투사체 배열은 제외한다.
- 플레이어는 물리·체력·아티팩트를 Has-A로 소유하고 로프는 부착·장력·드래그 상태를 가진 별도 `InputDrivenObject`로 둔다. 이동·점프는 `LocomotionInput`, 로프는 `RopePointerInput` Can-Do 믹스인 한 곳에 구현한다.
- `InputDispatcher`는 구체 클래스나 `instanceof` 분기 없이 capability 존재 여부로 입력을 전달한다. 싱글·클라이언트 예측·서버 검증은 같은 디스패처와 믹스인을 사용하며 전송 계층은 이를 재구현하지 않는다.
- 적 공격·자동 무기와 투사체 운동·클라이언트 충돌도 각 `SimulationDrivenObject`의 Can-Do capability 한 곳에 구현한다. 유도탄과 직선탄은 동일한 `projectile-motion`·`client-projectile-collision` capability ID 아래 서로 다른 믹스인을 조합한다. 월드 단계는 `SimulationDispatcher`에 capability ID를 지정해 같은 객체의 무관한 능력을 실행하지 않으며, 구체 클래스 분기를 중앙 스케줄러·예측 저장소·receipt 처리기에 추가하지 않는다.
- 시뮬레이션 capability 디스패치는 실행 구조만 정리하며 분할 권한을 바꾸지 않는다. 중립 객체는 서버가 진행하고 플레이어 당사자 피격·적중은 소유자 또는 피해 클라이언트가 먼저 claim하는 기존 계약을 유지한다. 상세 구현 규칙은 `docs/architecture.md`와 `docs/development-rules.md`를 따른다.
- `PlayerRuntimeFactory`는 `PlayerObject`, 별도 `RopeObject`, `AutomaticWeaponObject`와 Has-A 컴포넌트를 조립하고 소유자 입력 객체 목록을 반환한다. `GameSimulation`은 객체 등록·고정 tick·단계 실행·사건 연결을 조정하는 월드 스케줄러로 유지한다.
- `GameSimulation.stepCommandBatch()`는 싱글과 소유 클라이언트 예측에서 다음 틱의 입력 capability를 실행한다. 멀티 서버 fixed tick은 같은 스케줄러의 입력 주도 객체 단계를 끄고 플레이어 타이머·무기 쿨다운과 중립 월드만 진행한다.
- 이벤트의 즉시 체감과 지속 상태 수렴은 별도 경로다. 플레이어·로프·HP·사망·개별 체크포인트 부활의 수렴 원점은 서버 스냅샷이 아니라 소유·피해 클라이언트의 로컬 `GameSimulation` 결과이며, 서버 복제본과 동료가 검증된 claim·최신 `owner-motion`을 통해 이를 따라간다. 몹·공용 월드의 수렴 원점만 서버 스냅샷이다. `owner-motion`은 거부·롤백 없이 최신 소유자 상태를 적용하고, 체크포인트처럼 별도 복구 계약이 있는 사건 전이만 기준 상태와 미확정 입력으로 재실행한다. impact 지문 불일치는 서버가 피해 클라이언트의 최신 상태를 흡수한다. 동료와 적은 지연된 두 스냅샷 사이 보간과 제한 외삽으로 각 권한 원점에 수렴한다. 상세 계약은 `docs/multiplayer-synchronization.md`를 따른다.
- 멀티 체크포인트 도달은 소유 클라이언트가 자기 예측 위치에서 먼저 감지해 로컬 `GameSimulation`의 활성 체크포인트·보상·로프 해제와 피드백을 즉시 적용하고, 전이 직전 최신 `owner-motion` 다음에 체크포인트 ID·tick·위치 claim을 보낸다. pending 동안 로컬 치명 피격과 낙사는 새 체크포인트를 사용한다. 서버 fixed tick은 복제 위치만으로 체크포인트나 보상을 시작하지 않으며 승인 claim만 공용 활성 체크포인트·플레이어별 보상·`checkpoint-reached` 사건을 멱등 확정한다. 거부 receipt는 이전 공용 진행도와 소유자 상태를 복원하고 이후 입력·pending impact를 재실행한다. 싱글 자동 감지와 멀티 예측·서버 검증은 같은 체크포인트 활성화 로직을 사용한다.
- 현재 저작 시나리오의 진행은 objective·Gate 패널·포탈 사건과 `sector-02-08` content boundary를 사용한다. 과거 절차 월드의 summit claim·즉시 `completed` 전이는 호환 코드로만 남아 있으며 엔딩 시나리오가 확정되기 전까지 기본 제품 테스트에서 제외한다.
- 활성 로프 드래그가 브라우저 상단 UI로 빠지거나 `pointercancel`, 창 포커스 상실, 문서 숨김으로 끝나면 로프 유지가 아니라 해제 의도로 처리한다. 클라이언트는 렌더 프레임 재개를 기다리지 않고 해제 입력을 공용 시뮬레이션에 즉시 적용하며, 멀티는 일반 60Hz 전송 제한을 우회해 명령과 `owner-motion`을 바로 보낸다. 세부 입력 수명주기는 `docs/development-rules.md`, 동기화 계약은 `docs/multiplayer-synchronization.md`를 따른다.
- 플레이어끼리는 반지름 기반 물리 충돌을 한다. 각 소유 클라이언트가 다른 플레이어의 공유 위치를 기준으로 겹침의 절반을 즉시 해소하고 상대에게 파고드는 속도만 제거한 뒤 `owner-motion`으로 공유한다. 접선 방향 로프 관성은 보존하며 위에서 닿으면 다른 플레이어 위에 설 수 있다.
- 특정 플레이어에게 귀속되는 이동·로프·공격·피격·절단 같은 사건은 소유자 또는 피해자 클라이언트가 즉시 로컬 적용하고 claim을 보낸다. 서버는 체감 경로를 먼저 시작하지 않는다. impact는 인증·형식·중복과 결과 지문을 확인하고, 그 밖의 claim은 각 계약의 tick·중립 객체 자료를 검증해 공용 결과를 확정·배포한다.
- 플레이어 자동 무기 투사체는 발사한 클라이언트가 적중을 먼저 판정한다. 멀티 서버 fixed tick은 검증용 궤적·대상 소실·8초 수명만 진행하고 적 충돌이나 HP 감소를 자동 시작하지 않는다. 공격 클라이언트는 첫 적중에서 총알을 소비하고 VFX와 hit claim을 한 번만 만든다. 거부 receipt가 총알을 같은 겹침에 복구하지 않으며 승인 뒤에는 서버 적 HP 스냅샷과 resolve 사건으로 모두 수렴한다.
- 멀티 서버 fixed tick은 체력 0을 스캔해 사망·부활을 시작하거나 보상 선택 입력을 직접 확정하지 않는다. 플레이어 사망·부활은 피해 `player-impact` claim, 아티팩트 획득은 `artifact-selection` claim에서만 검증·확정한다. 싱글은 같은 `GameSimulation`의 기본 자동 복구와 로컬 보상 입력을 유지한다.
- 몹·적 투사체 생성과 궤적처럼 특정 플레이어에게 귀속할 수 없는 중립 월드 사건은 서버가 진행한다. 이를 대표 클라이언트에게 위임하지 않으며 참가자 연결 수명과 분리한다.
- 이 분할 권한 규칙은 신규 기능과 수정 기능에 즉시 적용한다. 플레이어 당사자 사건과 중립 시뮬레이션 사건의 경계를 먼저 정하고 양쪽 로직을 같은 주체에서 중복 실행하지 않는다.
- 클라이언트의 자기 캐릭터 체감을 최우선으로 한다. 자기 탄환 충돌뿐 아니라 자신과 교차한 적 탄환의 본체 피격·로프 절단도 피해 클라이언트가 즉시 판정해 피드백·넉백·HP·치명 시 체크포인트 부활과 아티팩트 손실까지 같은 로컬 `GameSimulation` 전이로 적용하고 claim을 보낸다. 멀티 HUD도 마지막 서버 플레이어가 아니라 소유 클라이언트의 HP·로프 비활성·아티팩트를 표시한다. 피해 경로는 피격 직전 `owner-motion`을 캡처하고 로컬 반응을 먼저 적용한 뒤, 전송선에서는 캡처한 motion 다음 사건·관측 대미지·부활 여부·상태 지문만 담은 impact claim 순서를 지킨다. 정상 승인 뒤 서버 HP·부활·로프 상태를 소유 클라이언트에 다시 적용하지 않는다.
- impact receipt는 피해 클라이언트가 이미 인식한 HP·부활·아티팩트·로프 상태를 되감지 않는다. 서버가 같은 전이를 적용한 지문이 다르면 `state-diverged`로 복구 자료를 요청하고, 그때만 피해 클라이언트가 최신 소유자 상태를 한 번 보내 서버 복제본과 동료를 수렴시킨다. 정상 impact마다 전체 상태를 보내거나 소비한 적 탄환을 다시 표시하지 않는다.
- 클라이언트 피드백은 공용 월드 효과와 개인 상태 효과를 capability/mixin으로 분리한다. 타격·로프 절단 위치의 링·파티클은 모든 클라이언트가 같은 사건으로 재생하지만 화면 흔들림·피해 강조·로프 절단 경고는 사건의 공격자 또는 피해 당사자 화면에서만 재생한다. 서버는 효과 수명이나 파티클을 전송하지 않고 `sourcePlayerId`·`targetId`가 포함된 판정 사건만 공유한다. 상세 계약은 `docs/architecture.md`와 `docs/multiplayer-synchronization.md`를 따른다.
- 소유자의 로프·HP·생명·위치가 서버 복제 스냅샷과 달라도 소유자 상태를 스냅하지 않는다. 최초 입장·재접속과 체크포인트처럼 별도 복구 계약이 있는 사건 전이에서만 공유 기준 상태를 사용한다. `owner-motion` receipt는 소유자 상태 복원이나 누적 입력 재실행을 일으키지 않으며, impact 불일치는 반대로 피해자의 최신 상태를 서버가 흡수해 HP·부활·로프를 로컬에서 복구하지 않는다.
- 서버의 적은 사거리 안의 살아 있는 최근접 플레이어를 안정적인 ID 동률 규칙으로 조준하고 적 투사체 생성·궤적을 진행한다. 각 피해 클라이언트는 자기 예측 위치에서 로프를 몸체보다 먼저 판정해 playerId가 있는 절단·피격 claim을 만든다.
- 동료 구조, 다운 대기, 팀 전멸 상태는 사용하지 않는다. 사망·낙사한 플레이어만 활성 체크포인트로 즉시 되돌리고 다른 플레이어와 공용 월드 시간은 그대로 진행한다.
- 체크포인트 아티팩트 선택 중에도 공용 월드 시간·적·투사체·동료는 계속 진행한다. 선택 중인 플레이어의 좌우·확정 입력은 클라이언트 UI가 즉시 처리하고 중립 게임 명령으로 바꿔 이동·점프·로프에 중복 적용하지 않는다. 확정은 이동 입력의 30틱 선행 예약과 분리된 `artifact-selection` claim으로 보내며, 서버는 활성 보상과 선택지를 검증하고 플레이어·체크포인트별로 멱등 확정한다. 먼저 선택한 동료는 즉시 다시 움직일 수 있다.
- 보상 오버레이는 진행 중인 전투를 식별할 수 있는 반투명 암막을 사용하고 `선택 중에도 전투 진행` 경고를 표시한다. 선택 카드의 가독성을 유지하되 월드를 불투명하게 가리지 않는다.
- 각 플레이어는 사망·낙사할 때 자신의 최근 아티팩트 약 1/3을 잃되 최소 1개를 유지하고 playerId가 있는 손실·부활 사건을 발행한다. 동료의 상태와 무관하며 다른 플레이어의 위치·체력·아티팩트는 초기화하지 않는다.
- `AuthorityServerSession`이 연결 소유권을 검사한 명령을 목표 tick에 소비해 승인 sequence를 전진시키고, 별도 `owner-motion`만 플레이어 연속 상태에 적용한다. 서버 120Hz 틱은 중립 월드와 타이머를 진행하고 6틱마다 20Hz 스냅샷과 플레이어별 `ownerMotionTick`을 만든다. `MultiplayerGameServer`가 이 경계를 실제 WebSocket에 연결한다.
- 현재 serverTick 이하의 늦은 명령은 `elapsed-tick`으로 거부하며 ACK를 올리지 않는다. 초기 서버는 과거 입력 롤백을 지원하지 않는다.
- `RemoteCommandStream`이 로컬 플레이어의 목표 틱·sequence와 미승인 명령을 보존하고, 새 스냅샷 ACK만 반영하며 역순·중복 스냅샷을 거부한다. `OwnerPredictionRuntime`은 이 입력 원본으로 마지막 공유 상태에서 미확정 입력을 같은 1/120초 시뮬레이션에 재적용한다.
- `RemoteWorldStateBuffer`가 최대 8개 공유 스냅샷을 보관하고 동료·적 위치를 100ms 지연된 server tick의 두 표본 사이에서 보간한다. 미래 표본이 없을 때만 최대 120ms 외삽하며 원격 플레이어 HP·체크포인트 부활·로프·진행 상태는 최신 검증 공유값을 즉시 사용하고 사건을 한 번만 전달한다. 소유 플레이어 상태에는 이 버퍼 값을 쓰지 않는다. 같은 serverTick의 더 큰 `snapshotSequence`도 수용하되 보간 이력은 최신 표본으로 교체해, 즉시 생성된 상태·사건을 누락하지 않는다.
- 권위 플레이어 스냅샷은 예측 재시작에 필요한 `isGrounded`와 로프 `length`·`currentLength`를 포함하며, 이 물리 값은 보간하지 않는다.
- 원격 상태 버퍼는 최근 2,048개 `eventId`를 기억해 서로 다른 스냅샷에 재전송된 같은 사건도 한 번만 VFX·피드백 대기열에 전달한다.
- 자기 로프 예측 재시작을 위해 승인 틱의 aim·pointer·viewport·누름 전이·부착 버퍼·스윙 드래그 진행을 `control` 스냅샷으로 보낸다. 부착 후보는 월드에서 다시 계산한다.
- `OwnerPredictionRuntime`은 소유 `InputDrivenObject` 집합의 입력 이력·예측 tick·claim 수명·별도 복구 계약이 있는 사건 전이·표시 보정만 담당한다. `owner-motion` receipt로 물리 상태를 복원하지 않으며 impact receipt도 로컬 피해 상태를 복구하지 않고 `state-diverged`일 때 최신 소유자 상태를 서버에 전달한다. 실제 이동·로프·전투 규칙은 capability 믹스인과 시뮬레이션 단계에 둔다.
- 소유 `InputDrivenObject`는 앱의 120Hz 고정 스텝마다 capability 입력과 피해 사건을 즉시 적용하고 제한된 이력을 보존한다. 60Hz submit, `owner-motion` receipt와 정상 스냅샷은 소유자 상태를 되감지 않는다. 서버 상태를 로컬 복구 기준으로 사용하는 경우는 최초 입장·재접속과 체크포인트처럼 별도 복구 계약이 있는 사건 전이뿐이다.
- 자기 플레이어의 물리 예측과 Canvas 표시 상태를 분리한다. 정상 동기화 중에는 서버 위치·HP·로프·생명 상태로 스냅하지 않는다. `owner-motion`은 상태 크기 때문에 거부하거나 receipt로 표시 보정을 시작하지 않으며 impact `state-diverged`는 서버·동료 쪽을 피해자의 최신 상태로 수렴시킨다.
- `CommandReceipt`가 명령 본문 없이 승인·거부 playerId·sequence를 전달한다. 승인 입력은 스냅샷 ACK까지 유지하고 거부 입력은 `RemoteCommandStream`에서 즉시 제거하며 중복 receipt는 멱등이다.
- `AuthorityWireAdapter`가 인증 playerId와 command 문자열만 받아 receipt 문자열을 반환하고, 권위 틱에서 예정된 snapshot 문자열을 만든다. 실제 WebSocket은 이 경계만 호출한다.
- `MultiplayerGameServer`는 여러 4자리 채널을 동시에 관리한다. 각 채널은 최대 2명의 독립된 `GameSimulation`과 권위 시계를 가지며, 마지막 참가자가 나갈 때만 해당 월드를 폐기한다.
- Pages의 플레이어는 서버 주소를 입력하지 않는다. 배포된 `index.html`의 고정 서버 주소로 연결해 방장이 새 채널 번호를 만들고 참가자는 모바일 숫자 키패드로 번호만 입력한다.
- `npm run start:game-server`는 컨테이너 없이 로컬 `0.0.0.0:4175`에서 `/health`와 `/multiplayer`만 제공하고 정적 파일은 노출하지 않는다. 개발용 `npm run start:multiplayer`와 Quick Tunnel은 로컬·임시 검증에만 사용한다.

### [L2] 게임 시작 전에 최신 배포 버전을 확인하는 로딩 화면을 표시한다

- 문서가 열린 직후 게임 모드 메뉴보다 먼저 중앙 로딩 화면을 표시하고 서비스 워커 등록·업데이트 확인이 끝날 때까지 `최신 버전을 확인하는 중`임을 알린다.
- 새 서비스 워커가 활성화되면 로딩 상태를 유지한 채 자동 새로고침해 새 게임 파일을 받는다. 이미 최신이거나 업데이트 확인을 지원하지 않는 환경에서는 로딩을 끝내고 게임 모드 메뉴를 표시한다.
- 이 화면은 멀티 서버 연결 대기가 아니라 싱글·멀티 공통 앱 시작 단계에만 속한다.

### [L1] 공용 기반과 게임 규칙을 분리한다

- `game-kit`은 순수 기반만 소유하고 로프·월드·적·아티팩트·HUD는 `src/game/`과 렌더링 계층이 소유한다.
- Vanilla JavaScript ES Module, Canvas 2D, CSS, Node.js, npm, Prettier와 무번들 구조를 유지한다. Alpine.js는 DOM 상태 UI가 실제로 필요할 때만 도입한다.

### [L2] 고정 길이 로프에서 접선 충격과 중력으로 회전한다

- 로프는 몸 중심이 아니라 부착 순간 anchor 쪽으로 선택한 손의 local-space `attachmentOffset`에 연결한다. 몸체 각도에 따라 손끝 world 위치가 회전하며 joint 제약력은 선속도와 각속도에 함께 작용한다.
- 플레이어 각운동은 physics mixin 상속이 아니라 `PlayerPhysics Has-A AngularMotion` 조합으로 확정했다. collider도 독립 Has-A 조합이고 `FixedLengthRope`는 local anchor를 참조하는 외부 joint다. Box2D·Rapier·Unity 공식 강체 구조를 따른 근거와 확장 규칙은 `docs/architecture.md`의 **플레이어 강체 회전과 손 로프 관절**을 따른다.
- 로프 해제 시 각속도를 보존하고 손끝 접선 속도의 설정 비율을 중심 이동 속도에 전달한다. 지면 접촉 중에는 `angle = 0` 방향의 복원 토크와 감쇠를 적용해 오뚜기처럼 일어서며 공중에서는 약한 각 감쇠만 적용한다.
- `owner-motion` v2, `WorldSnapshot` v4, `player-impact` v4가 angle·angularVelocity·attachmentOffset을 전달한다. `owner-motion`은 형식·유한값·단조 tick만 경계로 삼고 물리량 봉투로 거부하지 않으며, impact 복구 상태는 별도 challenge와 전체 스키마를 검증한다. 원격 각도는 ownerMotionTick 기준 최단 회전 보간과 제한 외삽을 사용하며 상세 계약은 `docs/multiplayer-synchronization.md`의 **플레이어 강체 회전과 손 관절 동기화**를 따른다.
- 자동 무기 발사점은 몸 중심이 아니라 조합된 `Collider.outsidePointToward()`가 대상 방향으로 계산한 형상 바깥 점이다. 발사체 반경과 8px 여유를 포함하며 소유자는 최신 `owner-motion` 다음 총구 위치 claim을 보내고, 서버는 같은 collider 계약으로 계산한 위치 오차를 검증한 뒤 claim 위치를 동료에게 공유한다. 구현 경계는 `docs/architecture.md`, 전송·수치 검증 계약은 `docs/multiplayer-synchronization.md`를 따른다.

- 부착 순간 거리를 고정 반경으로 유지하고 방사 속도를 제거한다.
- 능동 운동량은 임계 접선 드래그가 부착당 한 번 만드는 임펄스로만 추가한다.
- A/D 홀드나 저속 자동 보정은 부착 중 스윙 속도를 만들지 않는다.

### [L2] 초기 비주얼은 Canvas 플랫 도형과 가독성 중심 VFX를 사용한다

- 에셋 제작보다 로프 궤적, 충돌, 피해, 로프 절단 원인을 먼저 읽을 수 있게 한다.
- 현재 기본 표현은 혼합 도트 `sprite` 프로필이며, 기존 폴리곤 표현은 시뮬레이션과 분리된 `?renderer=polygon` 프로필로 계속 제공한다.
- 같은 게임 상태를 폴리곤과 도트 렌더러 중 선택해 그릴 수 있으며, 새 actor 표현은 프로필 조립 경계에서만 교체한다.
- 도트 캐릭터의 원본 프레임 기준은 24×24픽셀이며 현재 개발용 player definition의 월드 출력 크기는 48×48픽셀이다. 정식 스프라이트 구조는 캐릭터 하나에 여러 atlas PNG를 ID로 등록하고 각 animation frame이 atlas를 참조할 수 있어야 하며, atlas·원본 프레임·출력 크기의 가로·세로와 anchor·offset을 명시적으로 받는다.
- 첫 도트 프로필은 플레이어·적·플레이어 투사체·적 투사체를 스프라이트로 대체하고 지형·체크포인트·VFX·HUD는 기존 폴리곤·Canvas 표현을 유지하는 혼합 프로필로 구현한다.
- 첫 구현에서 실제 프레임 애니메이션은 플레이어에만 적용하고, 적과 양측 투사체는 교체 가능한 정적 스프라이트로 표시한다.
- 플레이어 첫 애니메이션 상태는 `idle`, `run`, `jump`, `fall`, `rope`, `hit`, `respawn`으로 둔다. 피격 애니메이션은 충돌 VFX와 별개로 캐릭터의 피격감을 전달해야 한다.
- 개발용 mock 단계에서도 일곱 상태는 실제 데스크톱·모바일 플레이 화면에서 동작 의미가 구분돼야 한다. 자산이 제공하지 않는 행동을 비슷해 보이는 방향 프레임에 임의 대응해 시스템만 연결된 상태로 끝내지 않으며, 상태 가독성을 막는 원인이 clip·자산 정의 경계에 있으면 국소 보정보다 그 경계를 복구한다.
- `hit`과 `respawn` 애니메이션은 자기 캐릭터와 화면에 보이는 원격 동료 모두 재생한다. 기존 판정·부활 사건의 `playerId`를 renderer 전용 presentation event로 보존해 각 클라이언트가 재생하며, 네트워크 snapshot에 애니메이션 상태를 권위 상태로 추가하지 않는다. 피해 클라이언트의 즉시 사건과 서버 확정은 같은 causal ID로 중복 제거해 애니메이션을 다시 시작하지 않는다.
- 플레이어 표현 상태의 우선순위는 `respawn > hit > rope > jump/fall > run > idle`이다. 현재 mock의 `hit`은 0.24초, `respawn`은 0.45초이며 정식 리소스에서는 manifest frame duration 합계를 사용한다. 재생 뒤 현재 지속 상태로 돌아가고, 새 피격은 `hit`을 처음부터 재생하되 `respawn` 중 일반 피격은 무시한다. 이는 표현 전이일 뿐 물리와 입력을 멈추지 않는다.
- 플레이어 facing은 actor별 renderer 상태로 둔다. 수평 속도가 임계값을 넘으면 갱신하고 정지·수직 점프·로프·피격·부활 중에는 마지막 유효 방향을 유지하며 최초 방향은 오른쪽이다. 좌우 별도 이미지를 요구하지 않고 `flipX`를 사용하며 gameplay·network state에는 facing을 추가하지 않는다.
- 실제 렌더 경로 검증을 위해 최소한의 24×24 개발용 mock 스프라이트를 함께 제공하되, 완성형 캐릭터 디자인·색감·고급 픽셀 아트에는 공수를 쓰지 않는다. mock 고유 정보는 게임 상태 계약에 넣지 않고 동일 규격 atlas 교체로 정식 에셋을 적용할 수 있어야 한다.
- mock은 직접 새로 그리는 데 공수를 쓰지 않고 24×24 규격과 용도에 맞는 외부 공개 예제를 사용할 수 있다. 외부 에셋은 재배포·수정 가능한 라이선스를 확인하고 저장소에 출처와 라이선스를 함께 기록한다.
- 스프라이트의 시각 크기·anchor와 플레이어 충돌체는 서로 독립된 조합 요소로 둔다. 렌더 프로필이나 PNG 교체가 물리를 암묵적으로 바꾸지 않으며, 향후 충돌체 크기·형태를 플레이어 조립 경계에서 교체할 수 있어야 한다.
- 충돌체는 공개 `Collider` 계약과 첫 `CircleCollider` 구현으로 클래스화하고 `PlayerRuntimeFactory`가 플레이어에 조립한다. 다른 shape의 실제 충돌 계산은 필요해질 때 추가한다.
- 도트 프로필을 덧붙이기 전에 관련 결합을 함께 해소한다. `PolygonSceneRenderer`의 배경·지형·로프·actor·VFX 레이어를 조합 가능하게 분리하고, `PlayerPhysics`에서 구체 원 반지름과 지형 충돌 책임을 collider 경계로 이동하며, 앱이 `PLAYER_CONFIG.radius`를 직접 전달하는 경로를 제거한다. 새 프로필을 기존 거대 클래스 복사·타입 분기·상속 override로 만들지 않는다.
- 상위 scene renderer/composer는 profile·actor 종류를 `if/switch`로 해석하지 않고 조립된 하위 renderer를 고정 순서로 호출만 한다. player, enemy, player projectile, enemy projectile과 공용 환경·로프·VFX의 실제 그리기는 각각의 하위 renderer 컴포넌트 함수가 전부 소유하며 profile factory가 필요한 구현 조합을 선택한다.
- 이번 구조 정렬은 플레이어와 혼합 도트 프로필에 직접 필요한 범위로 제한한다. 적·투사체를 공통 collider로 전환하거나 저장소 전체 조합 구조를 일괄 리팩터링하지 않는다.
- 애니메이션 상태를 renderer 내부 조건문으로 흩뜨리지 않는다. 현재 상태·경과 시간·허용 전이를 소유하는 재사용 가능한 순수 `StateMachine` 조합 컴포넌트와 플레이어 전용 상태 resolver를 분리하며, 기존 gameplay·투사체의 서로 다른 도메인 상태를 이번 작업에서 이 컴포넌트로 강제 이전하지 않는다.
- `sprite`가 기본 렌더 프로필이고 기존 폴리곤 표현은 `?renderer=polygon`으로 선택한다. 알 수 없는 프로필은 경고 후 `sprite`로 복구하며 player sprite asset 준비 실패 시 조립된 polygon renderer가 전체 scene을 대신 그린다.
- mock player asset은 저장소에서 직접 만든 `assets/runtime/characters/player-mock/player-action-mock.svg`이며 atlas layout과 출처 기록은 `assets/runtime/characters/README.md`에 있다. `PlayerSpriteManifest`·`PlayerSpriteDefinition`·`SpriteImageAssetSet`이 PixelLab·SpriteCook 원본을 여러 PNG atlas와 도구 중립 animation manifest로 정규화해 frame별 atlas를 선택한다. 프레임 수·순서·속도는 manifest가 소유하고 collider는 별도 조합으로 유지한다. 다른 개발자와 AI 에이전트는 루트 `AGENTS.md`에서 `docs/sprite-asset-format.md`의 JSON Schema·fixture·`validate:sprite-assets` 명령으로 진입한다.
- 렌더러 선택이 물리·전투·네트워크 snapshot 계약을 바꾸지 않으며, 교체 가능한 렌더 경계의 상세 기준은 `docs/architecture.md`를 따른다.

### [L2] 그래픽 작업은 공통 가이드와 자산별 production template에서 시작한다

- 그래픽 담당자의 공통 진입점은 `docs/graphics-asset-guide.md`이며 모든 결과물은 종류와 무관하게 `assets/artwork/<category>/<asset-id>/`에 원본·PNG·미리보기를 인계한다. 담당 개발자는 검증된 export를 `assets/runtime/<category>/<asset-id>/` package로 연결하고 게임 코드는 `RuntimeAssetCatalog`에서 category와 안정적인 asset ID로 파일 URL을 만든다.
- 정식 픽셀 그래픽은 `docs/pixel-graphics-design-guide.md`의 `32×32` 기본 격자, 자산 종류별 제작 크기와 화면 위계를 따른다. 작은 캐릭터와 거대한 다층 배경의 대비를 사용하고 플레이 영역은 밝고 선명하게, 배경은 깊어질수록 명도 대비·채도·도트 밀도를 낮춘다.
- 현재 24×24 player mock과 production starter는 렌더러·manifest 연결 검증 자료이며 정식 캐릭터 크기 기준이 아니다. 정식 player는 32×32~48×48 셀을 사용하고 액션 확장은 48×48~64×64까지 허용하되 실제 셀 크기를 manifest에 기록한다.
- 전용 template이 없는 자산에 player나 environment manifest를 억지로 재사용하지 않는다. 담당 개발자가 자산 종류에 맞는 공개 계약을 만든 뒤 runtime 경로로 승격하며, 충돌·물리·전투·네트워크 값은 그래픽 리소스와 분리한다.
- 기본 player의 일곱 상태는 48×48 출력과 모바일 화면에서 자세·실루엣만으로 구분할 수 있게 제작한다. 다른 actor의 상태 목록은 플레이어 계약을 복사하지 않고 작업 요청에서 별도로 정한다.
- 현재 런타임 mock인 `assets/runtime/characters/player-mock/player-action-mock.svg`는 동작 의미를 확인하는 자료이고, 정식 납품 형식은 여러 PNG atlas와 `sprite-manifest.json`이므로 그래픽 담당자에게 SVG mock이나 validator fixture를 직접 출발점으로 주지 않는다.
- `assets/runtime/characters/player-production-template/`은 현재 mock의 일곱 상태·프레임·재생 설정을 실제 납품 형식으로 옮긴 개발 연결용 starter다. 그래픽 담당자는 배치만 참고해 `assets/artwork/characters/player-main/`에 납품하고, 담당 개발자가 starter를 `assets/runtime/characters/player-main/`으로 복사해 PNG와 manifest를 정규화한다.
- starter는 그래픽 생성·정규화·validator 통과를 위한 인계 자료일 뿐 현재 런타임이 자동 참조하지 않는다. 기본 player 연결과 최종 교체는 별도 개발 작업으로 남긴다.
- starter의 위치, cell map, 수정 범위와 검증 절차는 `docs/sprite-asset-format.md`와 `assets/runtime/characters/README.md`를 기준으로 유지한다.

### [L2] 오디오 기반 계약과 현재 게임의 mock 연결을 구현했다

- 실제 게임 시나리오는 작성 중이므로 첫 작업에서 시나리오별 최종 큐 목록·정식 음원·완성형 음악 방향을 고정하지 않는다.
- 오디오 작업자 기준은 `docs/audio-asset-guide.md`, runtime 공개 계약은 `docs/audio-asset-format.md`다. 구현은 `src/audio/`, `assets/runtime/audio/`와 공용 탭형 설정 메뉴에 있으며 현재 게임 사건에 교체 가능한 mock을 연결한다.
- 첫 기반은 게임·UI 일회성 효과음, 반복 환경음과 BGM을 각각 독립 볼륨 그룹과 수명주기로 지원하고 세 계층 모두를 mock으로 재생 검증한다.
- 현재 구현의 모든 사건에 mock을 붙이지 않는다. 눈에 띄는 대표 사건만 사용해 즉시 로컬 효과음, 멀티 확정과의 중복 제거, UI 효과음, 환경 loop와 BGM 전환 계약을 검증한다.
- 새 게임 요소의 오디오는 오디오 시스템 핵심의 조건 분기를 늘리는 방식이 아니라 교체 가능한 cue 정의와 연결 구성을 붙여 자유롭게 추가할 수 있어야 한다.
- 사용자가 통합 개발자이며 런타임 구조·manifest·믹싱·검증의 미확정 기술 기본값도 인터뷰로 결정한다. 에이전트가 자율 기술 결정 권한을 가진 것으로 간주하지 않는다.
- 첫 기반은 외부 오디오 미들웨어나 새 라이브러리 대신 브라우저가 제공하는 기본 오디오 API를 사용한다. 구체적인 API 조합과 재생 정책은 인터뷰에서 별도로 확정한다.
- 기본 API 조합은 Web Audio 중심 혼합 방식이다. 짧은 효과음과 짧은 loop는 `AudioBufferSourceNode`, 긴 BGM·환경음은 `<audio>`를 `MediaElementAudioSourceNode`로 같은 Web Audio 믹서에 연결한다.
- 생성 Skill·MCP의 고유 출력은 제작 입력으로만 취급한다. 그래픽처럼 도구 중립적인 오디오 작업자 인계 형식과 검증된 runtime package를 분리하며 구체 디렉터리·manifest 계약은 인터뷰에서 확정한다.
- runtime `audio-manifest.json`은 파일·load 방식·loop 같은 `clips`와 볼륨 그룹·변형·동시발음 같은 `cues`를 소유한다. 게임 사건·상태에서 cue ID로 가는 연결은 별도 `AudioEventBindings`의 조합 가능한 handler가 소유하고 싱글·멀티 앱은 같은 `presentFrame` 경계만 호출하며 manifest에 게임 trigger를 넣지 않는다.
- cue의 공간 정책은 `none|world`다. BGM·UI는 비공간음이고 gameplay·ambience의 `world` cue는 로컬 플레이어 기준 좌우 pan과 거리 감쇠를 적용한다. 중요한 화면 밖 경고는 cue별 최소 음량을 가지며 첫 범위에 3D/HRTF를 넣지 않는다.
- 모드 확정 사용자 동작에서 `AudioContext` 활성화를 시작하되 선택된 package의 필수 buffer decode와 긴 stream 재생 준비가 끝난 뒤에만 게임을 시작한다. 필수·선택 cue의 실패 경계는 진행 중인 인터뷰에서 별도로 확정한다.
- manifest 항목은 기본적으로 필수다. 명시적으로 `required: false`인 보조 변형만 실패를 허용하며, 필수 SFX·ambience·BGM의 load·decode 실패는 게임 시작을 차단한다. 선택 항목 실패는 해당 항목만 제외하고 진단에 기록하며 validator와 runtime loader가 같은 계약을 사용한다.
- 첫 mock 믹서는 게임플레이 우선·헤드룸 프리셋을 사용한다. 초기값은 master `-6 dB`, gameplay `0 dB`, UI `-4 dB`, ambience `-10 dB`, BGM `-8 dB`이고 master와 각 그룹의 사용자 조정 범위는 음소거부터 `0 dB`까지다. 설정·manifest에는 dB로 기록하고 Web Audio graph 경계에서 선형 gain으로 변환하며, 이 수치는 공개 구조를 바꾸지 않고 이후 청취 검증으로 조정할 수 있는 기본 프리셋이다.
- 첫 마일스톤에 전체 오디오 설정 UI를 포함한다. 설정 화면은 오디오 전용 팝업이 아니라 모드 선택 화면과 플레이 중 모두 접근 가능한 공용 탭 메뉴로 만들고, 첫 `오디오` 탭에서 전체 음소거와 master·gameplay·UI·ambience·BGM 볼륨을 조절한다. 탭은 명시적 `attach()` 뒤 등록하고 좌우·Home·End 키보드 이동을 공유하며 생성자는 DOM 탐색·listener·설정 구독을 시작하지 않는다. 이후 그래픽 등 다른 설정 영역을 독립적으로 추가할 수 있게 하되 실제 그래픽 설정 구현은 이번 오디오 범위에 포함하지 않는다. 모든 오디오 값을 버전이 붙은 `localStorage` 항목에 저장하며 누락·손상·미지원 버전은 확정된 초기 프리셋으로 복구한다.
- 설정은 선택적인 보정 수단이며 첫 실행에서 사용자의 조정을 요구하지 않는다. 확정된 기본 프리셋만으로 주요 gameplay cue의 가청성, 그룹 간 우선순위와 master 헤드룸이 정상이어야 하며 기본 설정 상태를 대표 청취·회귀 검증의 기준으로 삼는다.
- one-shot voice 정책은 cue별 설정과 전체 안전 상한을 함께 사용한다. 기본 `maxVoices`는 cue당 4개, 같은 emitter의 기본 `retriggerCooldownMs`는 40ms, 전체 활성 voice 상한은 32개다. cue는 제한·cooldown·priority를 덮어쓸 수 있고, 상한 초과 시 가장 낮은 priority에서 가장 오래된 voice부터 교체한다. BGM과 반복 loop는 lifecycle key별 하나만 유지한다.
- 싱글·멀티의 `presentFrame`은 120Hz 고정 스텝에서도 호출될 수 있으므로 같은 lifecycle key의 cue·gain·pan이 그대로면 Web Audio parameter automation을 추가하지 않는다. 값이 변할 때만 기존 예약을 취소하고 현재 값으로 교체한다. 전체 논리 voice 32개 외에도 causal ID 256개, emitter cooldown key 512개, runtime failure 64개를 현재 안전 상한으로 유지하며 새 binding이 플레이 시간에 비례하는 무상한 기록을 만들지 않게 한다.
- 반복 one-shot은 제작된 여러 clip 변형을 우선 사용한다. 여러 변형이 있으면 cue의 가중치를 적용하되 가능한 경우 직전에 재생한 clip을 연속 선택하지 않는다. pitch·gain 무작위화는 기본적으로 꺼져 있고 cue가 명시한 buffer one-shot에만 적용한다. 권장 범위는 pitch `±2%`, gain `±1 dB`이며 validator는 각각 `±5%`, `±3 dB`를 넘는 선언을 거부한다. BGM과 loop에는 변형 무작위화를 적용하지 않는다.
- 기본 전환은 BGM `1.5초`, ambience `1초` crossfade와 일반 loop 시작·종료 `250ms` fade를 사용한다. 같은 lifecycle key의 전환은 논리적으로 하나를 유지하되 crossfade 동안에만 이전·다음 source가 함께 존재할 수 있다.
- ducking은 기본적으로 꺼져 있고 중요한 cue가 대상 그룹과 envelope를 명시할 때만 적용한다. 첫 권장값은 BGM `-6 dB`, ambience `-3 dB`, attack `50ms`, release `400ms`이며 cue 정의로 조정할 수 있다. audio engine은 구체 게임 사건이 아니라 선언된 ducking 정책만 해석한다.
- `document.hidden` 또는 `pagehide`에서 AudioContext와 media stream을 일시정지하고 진행 중인 one-shot은 폐기한다. 단순 window `blur`에는 입력만 해제하고 오디오는 유지한다. 문서 복귀 시 hidden 동안의 효과음을 몰아서 재생하지 않고 현재 scene state가 요구하는 BGM·ambience·loop만 다시 조정한다. 브라우저가 자동 resume을 막으면 다음 사용자 입력에서 재개하고 작은 오디오 재개 안내를 표시한다.
- world cue의 Pan은 source의 수평 위치를 현재 visible world bounds의 중심→좌우 가장자리에서 `0→±1`로 정규화하고 clamp한다. 거리 gain은 로컬 플레이어와 source의 2D 월드 거리 `160`까지 `0 dB`, 이후 dB 선형으로 감소해 `1200`에서 `-36 dB`, 그 밖에서 무음이다. 필수 경고 cue의 기본 `minGainDb`는 `-18 dB`이며 거리 감쇠 뒤에 floor로 적용한다.
- 첫 mock cue ID는 `ui-confirm`, `gameplay-rope-attach`, `gameplay-weapon-fire`, `gameplay-player-hit`, `gameplay-checkpoint-reached`, `ambience-altitude-wind`, `bgm-climb`, `bgm-run-complete`의 8개다. 현재 UI 확인, 로컬 로프 부착, 예측·공유 투사체 생성, 피해 클라이언트의 즉시 피격과 서버 공유, 체크포인트 진행, 실행 중 환경 loop, 등반 BGM과 완료 상태 전환에 각각 binding한다. causal ID가 있는 로컬 예측과 서버 확정은 한 번만 재생하며 이 mock ID 집합은 최종 시나리오 cue 목록이 아니다.
- 각 clip은 `playback: buffer|stream`을 명시하고 MIME이 포함된 source 배열 순서대로 fallback한다. `buffer`는 fetch 성공과 길이가 0보다 큰 `AudioBuffer` decode 완료, `stream`은 지원 source 선택·metadata 로드·`canplay` 도달·`MediaElementAudioSourceNode` graph 연결 완료를 준비 상태로 본다. source 하나당 timeout은 15초이며 모든 source가 실패한 필수 clip은 시작을 차단하고 선택 clip은 제외한 뒤 진단한다.
- 준비 뒤 media `play()` 거부도 adapter 내부에 숨기지 않고 실패 voice를 정리해 host snapshot과 진단 복사에 남긴다. 사용자 활성화 제약은 `suspended`로 전이해 다음 입력에서 재시도하고 그 밖의 필수·선택 runtime 실패는 각각 `failed`·`degraded`로 전이한다.
- buffer source가 graph 연결 뒤 `start()`에 실패해도 최초 오류를 보존하면서 active handle과 node를 즉시 해제한다. `stopAll`은 one-shot·loop를, `suspend`는 재생이 끝난 것으로 간주할 one-shot을 정리하고, `release`는 남은 voice·loop와 cooldown·variation·causal 추적 상태까지 결정적으로 비운다. 동일 loop 72,000회 스트레스 확인과 고유 emitter 1,024개·buffer 시작 실패 자동 회귀는 완료했으며 실제 두 모바일 기기의 장시간 frame·heap 계측은 플레이테스트에 남아 있다. 상세 불변식은 `docs/architecture.md`, `docs/development-rules.md`와 `docs/audio-asset-format.md`를 따른다.
- 오디오 resource package category 허용 목록은 `gameplay`, `ui`, `ambience`, `bgm`이다. 각 package는 `assets/runtime/audio/<category>/<asset-id>/audio-manifest.json`에 두고, `assets/runtime/audio/packs/<pack-id>/audio-pack.json`이 category와 stable asset ID로 하나 이상의 package를 조합한다. pack은 package 참조만 소유하고 cue·clip 또는 gameplay binding을 중복 소유하지 않는다. aggregate validator는 알 수 없는 category·package, 중복 참조와 pack 전체 cue ID 충돌을 거부한다. 향후 디버그 선택은 전체 pack 또는 특정 category package를 교체해 새 immutable definition을 조립한다.
- 일반 UI와 개발 진단을 분리한다. 시작 화면에는 준비 진행률과 필수 실패의 원인·재시도·메뉴 복귀만 표시한다. 선택 자산 실패는 게임을 계속하되 오디오 설정 탭에 `일부 음원 사용 불가` 상태만 작게 표시한다. `?metrics=1`과 기존 진단 복사에는 pack/package ID, `loading|ready|degraded|suspended|failed`, AudioContext 상태, clip별 선택 source·MIME·실패 코드, 필수/선택 준비 수, 그룹별 활성 voice 수와 cooldown drop·voice stealing 누계를 포함한다.
- 필수 stream이 모든 source fallback과 timeout 뒤에도 `canplay`에 도달하지 못하면 다른 gameplay 음원이 준비됐어도 자동 degraded 시작을 허용하지 않는다. `failed`로 시작을 차단하고 재시도·메뉴 복귀를 제공한다. 제작자가 해당 항목을 `required: false`로 명시한 경우에만 제외 후 시작할 수 있다.
- mock은 기반 시스템과 싱글·멀티 연결을 증명하는 교체 가능한 검증 자료이며 향후 시나리오나 정식 오디오의 런타임 계약으로 굳히지 않는다.
- 세부 자산 범위, 재생·믹싱 계약과 완료 기준은 인터뷰를 마쳤고 위 두 오디오 기준 문서와 `docs/architecture.md`에 승격했다. 다음 작업은 최종 시나리오가 구체화될 때 정식 package를 추가하고 기존 binding에 대표 cue만 확장하는 것이다.

### [L1] 오디오와 그래픽 runtime package는 디버그 선택 가능한 경계를 가진다

- 오디오와 스프라이트가 어느 정도 갖춰지면 디버그 모드에서 여러 작업물을 바꿔가며 같은 게임 동작을 비교 검증할 수 있어야 한다.
- 최초 오디오 기반과 이후 그래픽 연결은 안정적인 asset ID, catalog와 주입 가능한 definition 선택 경계를 두어 package가 기본 구현에 하드코딩되지 않게 한다. 오디오는 공개 pack/category override와 bootstrap definition loader를 회귀 테스트한다.
- package 선택은 표현 자료만 바꾸며 물리·충돌·전투·네트워크 권위와 시뮬레이션 상태를 바꾸지 않는다.
- 이번 오디오 작업은 실제 디버그 선택 UI·URL·hot-swap을 구현하지 않는다. stable ID·catalog·definition 주입과 서로 다른 가짜 package 교체 테스트까지 만들고, 실제 선택 UX는 작업물이 쌓인 뒤 추가한다.

### [L1] mock 기반 개발은 전문 제작물을 기다리지 않는다

- 메인 개발자는 그래픽·오디오·맵의 정식 작업물이 없어도 검증된 mock으로 시스템과 전체 플레이 흐름을 계속 완성한다.
- 그래픽·오디오·맵 담당자는 제공된 가이드·template·mock 배치를 기준으로 메인 개발과 병행하며, 전문 작업물 완료는 플레이테스트·최종 스퍼트·예선 제출의 선행 조건이 아니다.
- 통합 마감까지 계약 validator와 실제 화면·청취 검증을 통과한 결과만 제출 빌드에 교체 적용한다. 준비되지 않았거나 통합 위험이 큰 작업물은 mock fallback을 유지하고 메인 개발 일정을 막지 않는다.
- 양쪽 작업의 유일한 필수 선행 합의는 manifest·loader·이벤트 binding 같은 공개 교환 계약 변경이다. 역할별 일정과 제출 판단은 `docs/game-hackathon-planning.md`의 **역할 분담**을 따른다.
- 시나리오는 `6개 섹터 × 섹터당 8개 맵 = 48개 맵`이며 일정과 인계는 섹터 단위로 관리한다. 메인 개발자는 `SECTOR 01 → 06` 순서로 진행하고 각 섹터 안의 8개 맵은 번호순으로 구현한다. 맵별 오브젝트·상태·표현 cue를 먼저 목록화하고 mock으로 동작을 완성하면 그래픽·오디오 담당자가 앞 섹터 결과부터 정식 리소스로 교체 제작한다.
- 그래픽·오디오 1차 생산 마감은 2026년 8월 19일이며, 전체 자산 완료가 아니라 앞서 공개된 우선 오브젝트의 첫 교체 묶음을 뜻한다.
- 증강, NPC 대사·대화 시스템, 엔딩과 각각에 연결된 UI·게임 요소는 전문 표현 리소스와 달리 관련 섹터 개발의 필수 선행 기획이다. 확정되지 않은 내용을 메인 개발자가 임의의 mock 규칙으로 대신 결정하지 않는다.

### [L1] 환경 도트 표현은 독립 component와 전용 multi-atlas 계약으로 조립한다

- 참고 이미지는 구체 디자인이 아니라 어두운 다층 실루엣·큰 여백·제한된 조명 같은 도트 화면 구성만 참고한다. 실제 mock은 기획 채널에서 확정한 폐쇄형 수직 기업도시의 폐기물·산업 정비·주거 상업·기업 보안·착륙장 5구역을 실제 약 8,880m 월드 범위 안에 나누고 고도 기반 일출 밝기 변화를 따른다.
- 기존 `WorldGenerator`와 collision은 바꾸지 않는다. backdrop, collision polygon과 정확히 맞는 terrain skin, 이동 경로 밖의 non-collision decoration을 독립 하위 renderer로 조립하며 상위 renderer나 싱글·멀티 앱이 구체 component 종류를 분기하지 않는다.
- 환경 리소스는 캐릭터 animation manifest와 분리된 여러 PNG atlas·JSON Schema·example·validator 계약을 사용한다. PixelLab·SpriteCook의 배열·metadata·개별 frame은 표준 manifest로 정규화하며 atlas 분할 수와 frame 배열은 계약 안에서 바꿀 수 있다.
- asset 실패는 backdrop·terrain·decoration별로만 fallback하고 `?metrics=1`에서 실패 component와 atlas ID를 확인한다. 상세 교환 형식과 AI 작업 진입점은 `docs/environment-asset-format.md`, 구조 규칙은 `docs/architecture.md`와 `docs/development-rules.md`를 따른다.

### [L1] 모든 PR은 최신 main에 rebase한 뒤 병합한다

- 병합 직전에 전용 작업 브랜치를 최신 `origin/main` 위로 rebase하고 필수 검사를 다시 실행한다. 검증 뒤 `main`이 전진하면 같은 절차를 반복한다.
- 이미 push한 단일 소유 전용 브랜치는 `--force-with-lease`로만 갱신할 수 있다. `main`과 공유 브랜치는 재작성하지 않는다.
- 브랜치 rebase 뒤에도 PR은 별도 결정이 없는 한 일반 merge commit으로 병합한다. 실행 절차와 검증 기준은 `docs/development-rules.md`의 Git 운영 규칙을 따른다.

### [L2] GitHub Pages는 main 루트에서 직접 게시하고 최신 배포를 우선한다

- 루트 `index.html`을 진입점으로 사용하고 별도 빌드 workflow를 두지 않는다.
- PWA는 게임 저장 데이터를 삭제하지 않으며, 현재는 오프라인 캐시보다 최신 리소스 적용을 우선한다.

### [L1] Discord 명령은 설정된 서버와 회의 채널의 모든 멤버에게 연다

- 설정된 서버의 모든 멤버가 설정된 회의 텍스트 채널에서 `/meeting start/end`를 사용할 수 있다. 다른 서버·채널 차단과 단일 활성 회의 제한은 유지한다.
- 설정된 서버의 모든 멤버가 설정된 회의 텍스트 채널에서 `/codex plan/status/result/cancel`을 사용할 수 있다. 다른 서버·채널 차단과 읽기 전용 Skill·입력 상한·단일 로컬 작업 큐는 유지한다. 공개 게이트웨이는 고정 loopback Ollama만 허용하고, 멤버별 동시 1건과 `CODEX_MAX_OUTSTANDING_JOBS` 전체 상한을 적용한다.
- 세부 실행·권한 설정은 `services/meeting-bot/README.md`를 기준으로 한다.

### [L2] 회의록은 상세 분류 앞에 안전한 요약을 제공한다

- Discord와 GitHub 회의록은 승인된 최종 상세 필드에서만 만든 3~5줄 `SUMMARY`를 맨 위에 표시한다. 각 줄은 240자로 제한하고 결정·할 일·블로커·다음 회의·논의를 우선하며, 가설과 제외 항목은 해당 라벨을 유지한다.
- `SUMMARY`는 표시용 파생 데이터이며 `DECISIONS.md`와 `TASKS.md` 승격 근거로 사용하지 않는다. 요약 자체는 새 모델 호출을 하지 않고 최종 상세 필드에서 결정적으로 만든다. 상세 분류에는 아래 정책에 따라 선택형 무료 로컬 Ollama 후보 생성기를 사용할 수 있다.
- 세부 형식과 검증 기준은 `services/meeting-bot/README.md`를 따른다.

### [L1] 활성 회의의 자연 대화와 세 채널 참고자료를 근거 기반으로 정리한다

- 기존 회의 채널은 `/meeting start/end` 명령과 캡처 대상에 유지하고, `DISCORD_REFERENCE_CHANNEL_IDS`로 기획·코딩 채널을 추가한다. 시작과 종료 사이의 메시지만 수집하며 종료 시 제한된 채널 기록을 다시 읽어 수정·삭제·Gateway 누락을 최종 상태로 맞춘다. 기록 조회가 실패한 채널은 실시간 캡처를 유지하고 블로커를 남긴다.
- `MEETING_CLASSIFIER_ENABLED=true`이면 이미 설치된 로컬 Ollama 모델이 자연스러운 한국어/영어 대화에서 일곱 상세 분류 후보를 만든다. 모든 후보는 실제 발언 ID와 정확한 인용문을 가져야 하고, 질문·불확실성·주제 일치·화자·명시적 합의/거절/약속/일정을 결정적 게이트가 다시 검증한다. 실패하면 명시적 라벨 기반 규칙으로 폴백하며 OpenAI·Codex 계정·유료 API를 사용하지 않는다.
- `REFERENCES`는 모델과 분리된 비승격 필드다. 채널명·작성자·시각·외부 URL·첨부파일명/형식/크기만 기록하고 링크나 파일을 열거나 내려받지 않는다. Discord 서명 첨부 URL은 저장하지 않으며 참고자료는 `DECISIONS.md`와 `TASKS.md`의 근거가 될 수 없다.
- 회의록 채널의 열람 범위는 모든 캡처 채널보다 넓어서는 안 된다. 공개 GitHub 게시의 별도 `ALLOW_PUBLIC_GITHUB_MINUTES` 동의 게이트는 유지한다.

### [L2] Discord의 Codex 호출은 허용 목록 기반 읽기 전용 기획으로 시작한다

- `/codex plan/status/result/cancel`만 V1에 포함하고 실제 코드 수정, 설치, GitHub 게시와 병합은 제외한다.
- Discord 내용은 비신뢰 데이터 경계와 입력 상한을 적용하고 `meeting-to-game-plan`, `repo-task-plan`, `discord-repo-cross-reference` Skill만 선택할 수 있다.
- `discord-repo-cross-reference`는 Discord 주장·결정·작업과 저장소 코드·문서·테스트·결정 기록을 양방향으로 대응시키되 어느 쪽도 자동 승인이나 수정 권한으로 취급하지 않는다. 실행 계약은 `.agents/skills/discord-repo-cross-reference/SKILL.md`를 따른다.
- Discord 자유 조회·공유는 브라우저 자동화나 meeting-bot 내부 구현이 아니라 저장소의 `.codex/config.toml`에서 범용 `@discord-mcp/cli` stdio MCP를 직접 실행한다. 자격 증명은 저장소에 두지 않고 로컬에서는 `DISCORD_TOKEN`, Codex Cloud에서는 별도 Secret으로 관리한다. 서버·채널은 봇이 볼 수 있는 목록에서 대화 중 선택을 재사용하되 복수이거나 모호하면 질문한다. MCP는 `users,messages,channels`만 노출하고, 쓰기는 사용자가 승인한 문구의 메시지 전송만 허용하며 편집·삭제·반응·관리 작업은 금지한다. 실행 계약은 `.agents/skills/discord-repo-cross-reference/SKILL.md`를 따른다.
- Discord의 공개 `/codex` 게이트웨이는 고정 loopback Ollama와 허용 Skill만 사용하고 구조화 출력을 검증하며 애플리케이션 비밀을 전달하지 않는다. 인증된 Codex CLI와 LM Studio 공급자는 공개 게이트웨이에서 거부하여 서버 멤버가 Codex 계정 할당량이나 더 넓은 로컬 엔드포인트를 소비하지 못하게 한다.
- `/codex` 출력은 신뢰된 instruction에 한글이 있으면 한국어, 없으면 영어를 요청한다. 결과의 모든 표시 필드는 Latin·Hangul 문자 체계만 허용하고 저장·게시 전에 재검증한다. 한자·가나 등 비허용 문자가 나오면 로컬 Ollama로 1회만 교정하며, 반복 실패와 기존 비호환 결과는 원문을 게시하지 않는다.
- 로컬 회의 분류 또는 `CODEX_PROVIDER=ollama` 공개 게이트웨이가 켜진 상태에서 `/meeting start`가 승인되면 회의 캡처를 먼저 활성화하고 백그라운드에서 고정 loopback API와 선택 모델을 확인한다. 서버가 꺼져 있으면 비밀을 제외한 환경으로 `OLLAMA_BIN serve`를 숨김·분리 프로세스로 자동 실행한다. 실행 또는 모델 확인이 실패해도 회의 기록은 계속하고 분류는 안전한 규칙으로 폴백하며 `/codex`는 사용 불가로 알린다. 모델 자동 설치나 유료 API 우회는 하지 않고 Ollama 프로세스는 `/meeting end` 뒤에도 유지한다.
- `CODEX_ENABLED=false`와 `MEETING_CLASSIFIER_ENABLED=false`가 각각 기본이며 서로 독립적으로 활성화한다.

## 갱신 규칙

- 현재 구현과 다음 작업에 영향을 주는 결정만 이 문서에 유지한다.
- 완전히 흡수되거나 대체된 결정은 대체 이유와 함께 `docs/decision-history.md`로 이동한다.
- 수치와 구현 사실은 코드·테스트와 일치시킨다.
