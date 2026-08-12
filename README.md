# Baeseongjin 게임 해커톤 프로젝트

로프 진자 운동을 핵심 조작으로 삼는 Canvas 기반 2D 횡스크롤 로그라이크 프로젝트다. 완전 절차 생성 월드를 이동하며 아티팩트를 수집하고 빌드를 강화하는 플레이를 목표로 한다.

## 저장소 운영

- `main` 변경은 브랜치와 Pull Request를 거치는 것을 기본으로 한다.
- 각 개발자는 병합 전에 로컬 테스트와 문법 검사, 필요한 브라우저 검증을 수행한다.
- GitHub Pages는 저장소 설정의 `main` 브랜치 `/(root)`를 게시 소스로 사용하며, 루트 `index.html`을 진입점으로 삼는다.
- 상세한 개발 규칙은 `AGENTS.md`와 `docs/development-rules.md`를 따른다.

## 개발

기술 스택은 Ball Fight Simulator와 같은 Vanilla JavaScript, Canvas 2D, CSS, Node.js 기반이며 별도 번들러를 사용하지 않는다. Alpine.js는
아티팩트 선택처럼 DOM 상태 UI가 필요해질 때 사용할 승인된 선택지이며 현재 프로토타입에는 아직 설치하지 않았다.

```powershell
npm install
npm start
npm test
npm run check
npm run validate:world
```

서버를 시작한 뒤 `http://127.0.0.1:4173`을 연다.

## 프로토타입 조작

- 이동: `A`/`D` 또는 좌우 방향키
- 점프: `W` 또는 위쪽 방향키
- 로프 부착: 사거리 안의 지형을 마우스로 조준한 뒤 버튼을 누르고 유지
- 1회 스윙: 부착 후 0.08초 동안 유지하고 줄에 수직인 방향으로 화면 짧은 변의 11% 이상 드래그
- 로프 해제: 마우스 버튼을 놓아 현재 속도로 비행

현재 프로토타입은 새 런·새 멀티 채널마다 시드가 달라지는 48단계의 큰 절차 생성 월드, 모든 지형 표면 부착, 고정 길이 진자 운동, 접선 드래그 충격, 해제 관성,
자동 원거리 공격, 적의 로프 절단·본체 피해, 체크포인트 복귀, 아티팩트 선택·누적·일부 손실, 정상 도달 완료, 전투 VFX와 모바일 조작을 포함한다.
각 신규 체크포인트에서 공격력·연사·로프 공명 중 하나를 선택해 빌드를 강화하며, 실패하면 최근 아티팩트 약 1/3을 잃고 활성 체크포인트에서 재개한다.

절차 생성 안전성은 `npm run validate:world`로 고정 회귀 시드 5개와 연속 탐색 시드 1,000개를 검사한다. 원격 플레이테스트에서는
배포 URL에 `?metrics=1`을 붙여 활성 시간·처치·피해·로프 절단·첫 보상 시간을 확인하고 **진단 복사**로 기록할 수 있다. 다음 단계는 실제 초반 플레이테스트와 서로 다른 기기의 2인 장시간 검증이다.
복사한 실패 월드는 싱글 URL에 `?seed=시드값&metrics=1`을 붙여 같은 지형으로 다시 실행한다.

## 프로젝트 문서

- [게임 해커톤 기획](docs/game-hackathon-planning.md) — 현재 방향, 열린 결정, 역할, 일정, 첫 프로토타입 범위
- [아키텍처](docs/architecture.md) — 초기 모듈 경계와 런타임 흐름
- [싱글·협동 동기화 설계](docs/multiplayer-synchronization.md) — 권위 서버, 입력 예측, 스냅샷과 상태 소유권
- [개발 규칙](docs/development-rules.md) — 객체 설계, 시뮬레이션, 의존성, 구현 및 검증 기준
- [세션 핸드오프](SESSION-HANDOFF.md) — 현재 유효한 결정과 다음 작업
- [결정 이력](docs/decision-history.md) — 반영 또는 대체된 제품·아키텍처 결정
- [개발 환경](docs/dev-environment-setup.md) — 로컬 실행 명령과 문제 해결
- [기술 스택](docs/tech-stack.md) — 언어, UI, 렌더링, 테스트, 배포 기반
- [버전 관리](docs/version-management.md) — SemVer, 배포 버전 표시와 갱신 절차
- [재사용 가능한 기반](docs/reusable-game-resources.md) — 공용 게임 기반과 재사용 정책
- [구현 로드맵](docs/implementation-roadmap.md) — 현재 구현 상태, 다음 게임성 우선순위와 완료 기준
- [두 기기 협동 플레이테스트](docs/two-device-playtest-protocol.md) — 실제 기기 한 세션의 실행 순서, 기록 양식과 판정 기준

## Discord 회의록 봇

`services/meeting-bot/`은 `/meeting start`와 `/meeting end` 사이에 회의·기획·코딩 채널의 메시지와 음성 회의를 기록한다. 무료 로컬 Whisper와 선택형 로컬 Ollama를 사용해 `SUMMARY`, `DISCUSSED / DECIDED / REJECTED / HYPOTHESES / REFERENCES / ACTION ITEMS / BLOCKERS / NEXT MEETING` 회의록을 게시하며, 링크·첨부 메타데이터는 정리하되 파일을 다운로드하지 않는다. 자동 예약 시작은 하지 않고, 근거가 불명확한 아이디어나 참고자료를 `DECISIONS.md`나 `TASKS.md`로 승격하지 않는다.

Discord 설정, 무료 로컬 전사, 최소 GitHub 권한, 실행·배포 절차와 DAVE 음성 수신 제약은 [회의록 봇 README](services/meeting-bot/README.md)를 참고한다.
