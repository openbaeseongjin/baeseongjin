# Baeseongjin 게임 해커톤 프로젝트

로프 진자 운동을 핵심 조작으로 삼는 Canvas 기반 2D 횡스크롤 로그라이크 프로젝트다. 완전 절차 생성 월드를 이동하며 아티팩트를 수집하고 빌드를 강화하는 플레이를 목표로 한다.

## 저장소 운영

- `main` 변경은 브랜치와 Pull Request를 거치는 것을 기본으로 한다.
- 각 개발자는 병합 전에 로컬 테스트와 문법 검사, 필요한 브라우저 검증을 수행한다.
- GitHub Pages는 저장소 설정의 `main` 브랜치 `/(root)`를 게시 소스로 사용하며, 루트 `index.html`을 진입점으로 삼는다.
- 상세한 개발 규칙은 `AGENTS.md`와 `docs/development-rules.md`를 따른다.

## 개발

기술 스택은 Ball Fight Simulator와 동일한 Vanilla JavaScript, Alpine.js, Canvas 2D, CSS, Node.js 기반이며 별도 번들러를 사용하지 않는다.

```powershell
npm install
npm start
npm test
npm run check
```

서버를 시작한 뒤 `http://127.0.0.1:4173`을 연다.

## 프로토타입 조작

- 이동: `A`/`D` 또는 좌우 방향키
- 점프: `W` 또는 위쪽 방향키
- 로프 부착: 사거리 안의 지형을 마우스로 조준한 뒤 버튼을 누르고 유지
- 1회 스윙: 부착 후 0.08초 동안 유지하고 줄에 수직인 방향으로 마우스를 80px 이상 드래그
- 로프 해제: 마우스 버튼을 놓아 현재 속도로 비행

현재 프로토타입은 동일 시드의 48단계 수직 등반 지형, 모든 지형 표면 부착, 고정 길이 진자 운동, 접선 드래그 충격, 해제 관성,
카메라 추적과 낙사 재시작을 포함한다. 적과 아티팩트는 다음 구현 단계다.

## 프로젝트 문서

- [게임 해커톤 기획](docs/game-hackathon-planning.md) — 현재 방향, 열린 결정, 역할, 일정, 첫 프로토타입 범위
- [아키텍처](docs/architecture.md) — 초기 모듈 경계와 런타임 흐름
- [개발 규칙](docs/development-rules.md) — 객체 설계, 시뮬레이션, 의존성, 구현 및 검증 기준
- [세션 핸드오프](SESSION-HANDOFF.md) — 현재 유효한 결정과 다음 작업
- [결정 이력](docs/decision-history.md) — 반영 또는 대체된 제품·아키텍처 결정
- [개발 환경](docs/dev-environment-setup.md) — 로컬 실행 명령과 문제 해결
- [기술 스택](docs/tech-stack.md) — 언어, UI, 렌더링, 테스트, 배포 기반
- [버전 관리](docs/version-management.md) — SemVer, 배포 버전 표시와 갱신 절차
- [재사용 가능한 기반](docs/reusable-game-resources.md) — 공용 게임 기반과 재사용 정책
