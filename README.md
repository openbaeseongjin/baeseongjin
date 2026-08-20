# Baeseongjin 게임 해커톤 프로젝트

로프 진자 운동을 핵심 조작으로 삼는 Canvas 기반 2D 횡스크롤 로그라이크 프로젝트다. 하나의 붕괴 도시 월드에 이어진 저작 진행 영역을 돌파하며 로프 숙련과 Foundation 선택으로 빌드를 강화하는 플레이를 목표로 한다.

## 저장소 운영

- `main` 변경은 브랜치와 Pull Request를 거치는 것을 기본으로 한다.
- 각 개발자는 병합 전에 validator와 문법 검사, 필요한 브라우저 검증을 수행한다.
- GitHub Pages는 저장소 설정의 `main` 브랜치 `/(root)`를 게시 소스로 사용하며, 루트 `index.html`을 진입점으로 삼는다.
- 상세한 개발 규칙은 `AGENTS.md`와 `docs/development-rules.md`를 따른다.

## 개발

기술 스택은 Ball Fight Simulator와 같은 Vanilla JavaScript, Canvas 2D, CSS, Node.js 기반이며 별도 번들러를 사용하지 않는다. Alpine.js는
Foundation 선택처럼 DOM 상태 UI가 필요해질 때 사용할 승인된 선택지이며 현재 프로토타입에는 아직 설치하지 않았다.

```powershell
npm install
npm start
npm run check
npm run validate:audio-assets
```

서버를 시작한 뒤 `http://127.0.0.1:4173`을 연다.

### 맵 에디터

생성된 Stage `1-1`과 `1-7`은 별도 로컬 저작 서버에서 편집한다.

```powershell
node scripts/map-editor/serveMapEditor.mjs --port=4178
```

그 다음 `http://127.0.0.1:4178/map-editor/`을 열어 Draft → Validate → Apply → Preview 순서로 사용한다. 범위와 안전 경계는 [맵 에디터 사용 가이드](docs/map-editor.md)를 따른다.

## 프로토타입 조작

- 이동: `A`/`D` 또는 좌우 방향키
- 점프: `W` 또는 위쪽 방향키
- 로프 부착: 사거리 안의 지형을 마우스로 조준한 뒤 버튼을 누르고 유지
- 1회 스윙: 부착 후 0.08초 동안 유지하고 줄에 수직인 방향으로 화면 짧은 변의 11% 이상 드래그
- 로프 해제: 마우스 버튼을 놓아 현재 속도로 비행

현재 프로토타입은 하나의 연속 월드에 조립된 Sector 01·02의 16개 저작 영역, 영역별 목표와 Gate 패널·지속 단방향 포탈, 모든 지형 표면 부착, 고정 길이 진자 운동, 접선 드래그 충격, 해제 관성,
자동 원거리 공격, 적의 로프 절단·본체 피해, 체크포인트 복귀, 1-4 Maintenance Node의 Foundation 선택, 전투 VFX, 모바일 조작과 교체 가능한 mock 오디오·탭형 설정을 포함한다.
1-4에서 `Impulse Coil`·`Relay Link`·`Shear Current` 중 하나를 고르고 사망·낙사 시 활성 체크포인트에서 최대 체력으로 재개한다.

저장소는 기본 자동 테스트 suite를 유지하지 않는다. `npm run check`의 문법·저작 계약 validator와 실제 브라우저·서버 smoke로 검증하며, 자동 테스트는 사용자가 해당 작업에서 명시적으로 요청한 경우에만 추가한다. 원격 플레이테스트에서는 설정 버튼을 1초 길게 눌러 디버그 패널을 연 뒤 **디버그 수치 표시**를 켜면 활성 시간·처치·피해·로프 절단·첫 Foundation 선택 시간을 확인하고 **진단 복사**로 기록할 수 있다. seed와 world revision은 멀티 참가자가 같은 저작 월드와 결정적 표현을 재현하기 위한 동기화 식별자로 유지한다.

## 프로젝트 문서

- [게임 해커톤 기획](docs/game-hackathon-planning.md) — 현재 방향, 열린 결정, 역할, 일정, 첫 프로토타입 범위
- [아키텍처](docs/architecture.md) — 초기 모듈 경계와 런타임 흐름
- [싱글·협동 동기화 설계](docs/multiplayer-synchronization.md) — 권위 서버, 입력 예측, 스냅샷과 상태 소유권
- [개발 규칙](docs/development-rules.md) — 객체 설계, 시뮬레이션, 의존성, 구현 및 검증 기준
- [세션 핸드오프](SESSION-HANDOFF.md) — 아직 기준 문서에 흡수되지 않은 결정·전환·blocker
- [결정 이력](docs/decision-history.md) — 반영 또는 대체된 제품·아키텍처 결정
- [개발 환경](docs/dev-environment-setup.md) — 로컬 실행 명령과 문제 해결
- [기술 스택](docs/tech-stack.md) — 언어, UI, 렌더링, 검증, 배포 기반
- [버전 관리](docs/version-management.md) — SemVer, 배포 버전 표시와 갱신 절차
- [재사용 가능한 기반](docs/reusable-game-resources.md) — 공용 게임 기반과 재사용 정책
- [구현 로드맵](docs/implementation-roadmap.md) — 현재 구현 상태, 다음 게임성 우선순위와 완료 기준
- [두 기기 협동 플레이테스트](docs/two-device-playtest-protocol.md) — 실제 기기 한 세션의 실행 순서, 기록 양식과 판정 기준
- [오디오 작업 가이드](docs/audio-asset-guide.md) — 오디오 작업자의 제작·인계 경로와 체크리스트
- [오디오 교환 형식](docs/audio-asset-format.md) — runtime package, manifest와 validator 계약

## Discord 회의록 봇

`services/meeting-bot/`은 `/meeting start`와 `/meeting end` 사이에 회의·기획·코딩 채널의 메시지와 음성 회의를 기록한다. 무료 로컬 Whisper와 선택형 로컬 Ollama를 사용해 `SUMMARY`, `DISCUSSED / DECIDED / REJECTED / HYPOTHESES / REFERENCES / ACTION ITEMS / BLOCKERS / NEXT MEETING` 회의록을 게시하며, 링크·첨부 메타데이터는 정리하되 파일을 다운로드하지 않는다. 자동 예약 시작은 하지 않고, 근거가 불명확한 아이디어나 참고자료를 `DECISIONS.md`나 `TASKS.md`로 승격하지 않는다.

Discord 설정, 무료 로컬 전사, 최소 GitHub 권한, 실행·배포 절차와 DAVE 음성 수신 제약은 [회의록 봇 README](services/meeting-bot/README.md)를 참고한다.
