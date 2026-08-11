# 개발 환경 설정

## 요구 사항

- Node.js 20 이상
- 최신 Chromium, Firefox 또는 Safari

런타임 npm 의존성은 없으며 개발 도구로 Prettier만 사용한다.

## 실행

```powershell
npm install
npm start
```

기본 주소는 `http://127.0.0.1:4173`이다. 다른 포트는 `npm start -- 5000`처럼 지정한다.

정적 페이지와 멀티 서버를 함께 개발할 때는 `npm run start:multiplayer`를 사용한다. 실제 상시 서버와 같은 정적 파일 비노출 경계는 `npm run start:game-server`로 확인한다. 이 명령은 컨테이너 없이 로컬 `0.0.0.0:4175`에 직접 실행되며 `/health`와 `/multiplayer` WebSocket만 제공한다. game-only 모드는 기본적으로 `https://openbaeseongjin.github.io` Origin만 허용한다. 다른 공식 프런트엔드가 필요하면 `BAESEONGJIN_ALLOWED_ORIGINS` 또는 `--allowed-origins=`로 명시적으로 교체한다.

## 검증

공개 배포가 실제 게임 서버와 연결되는지는 다음 smoke 검사로 확인한다. 기본값은 GitHub Pages이며 다른 배포는 `-- --page=https://example.test/game/`처럼 지정한다. 검사는 Pages의 표시 버전과 게임 서버 `/health.version` 일치 여부를 먼저 확인한 뒤, 대상 페이지의 Origin을 브라우저와 같이 WebSocket handshake에 포함하고 새 4자리 채널 생성, 두 번째 플레이어 참가, 퇴장 반영과 빈 방 제거까지 수행한다. 버전이 다르면 이전 코드로 실행 중인 서버이므로 서버 프로세스를 재시작한 후 다시 검사한다. 외부 네트워크에 의존하므로 기본 `npm test`에는 포함하지 않는다.

```powershell
npm run smoke:multiplayer
```

```powershell
npm test
npm run check
npm run format:check
git diff --check
```

`npm test`는 게임플레이, 멀티플레이, 클라이언트 배포의 3개 메인 시나리오를 실행하며 전체 3분 제한을 자체 검사한다. 세부 구현값보다 로프·전투·로그라이크 진행, 실제 WebSocket 채널, 모바일·PWA·상시 서버 계약을 우선 검증한다. `npm run check`는 모든 JavaScript와 MJS 파일의 문법을 검사하고, `npm run format:check`는 Prettier 형식을 확인한다.

## 문제 해결

- 포트가 사용 중이면 다른 포트를 전달한다.
- 브라우저에서 모듈 오류가 나면 `index.html`을 파일로 직접 열지 말고 로컬 서버를 사용한다.
- 물리 결과가 실행마다 다르면 고정 스텝 밖에서 상태를 바꾸거나 비결정적 난수를 사용하지 않았는지 확인한다.
