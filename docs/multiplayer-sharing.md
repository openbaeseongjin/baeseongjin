# 멀티 서버 운영: 임시 공유와 Pages 배포

운영 멀티는 GitHub Pages와 분리된 게임 서버를 실행하고, 플레이어는 4자리 채널 번호만 공유한다. Pages에 배포된 `index.html`의 `meta[name="multiplayer-server"]`가 연결할 게임 서버의 HTTPS/WSS 주소를 제공하며, 모바일 화면에는 이 주소를 노출하거나 입력받지 않는다.

멀티 서버를 외부에서 열 수 있는 명령은 두 가지이며 목적이 다르다. `share:multiplayer`는 개발 중 잠깐 확인하는 임시 도구이고, `publish:multiplayer`는 컴퓨터 재시작 뒤 운영 경로를 한 명령으로 다시 여는 절차다.

## 개발 공유: `npm run share:multiplayer`

개발 모드 통합 서버(`scripts/multiplayer-server.mjs --port=4173`)가 정적 화면과 WebSocket 서버를 함께 제공하고, `http://127.0.0.1:4173` 앞에 Quick Tunnel을 연다. Pages에는 반영하지 않으므로 `index.html`의 메타 값도 바꾸지 않는다.

```powershell
npm run share:multiplayer
```

준비가 끝나면 터미널에 `https://...trycloudflare.com` 개발 주소가 표시된다. 이 주소에서 **멀티 플레이 → 새 채널 만들기**를 누르면 4자리 번호가 표시되고 다른 참가자는 같은 주소에서 번호만 입력한다. 이 명령으로 받은 주소는 게임 서버를 대신하는 운영 주소가 아니다.

## 운영 배포: `npm run publish:multiplayer`

컴퓨터 재시작 뒤 운영자는 이 한 명령으로 상시 게임 서버와 외부 터널을 다시 열고, 새 공개 주소를 Pages 설정에 반영하고, 배포까지 이어간다.

### 실행 전제 (fail-closed)

상태 변경을 시작하기 전에 아래 조건을 모두 확인하고 하나라도 어기면 게임 서버/터널도, 배포도 시작하지 않는다.

- 현재 브랜치가 `main`이다.
- 작업 트리가 완전히 깨끗하다. 관련 없는 변경은 커밋하거나 push하지 않는다.
- `origin` remote가 존재한다.
- `git fetch origin` 직후 로컬 HEAD가 `origin/main`과 정확히 같다.

이 작업은 직접 `origin main`에 배포 커밋을 push한다. 각 실행은 `index.html` 하나만 커밋하는 단일 커밋이며, 다른 파일을 stage하거나 commit하지 않는다.

### 순서

1. 위 Git 전제를 확인한다.
2. 게임 전용 서버를 컨테이너 없이 `scripts/multiplayer-server.mjs --game-only --host=0.0.0.0 --port=4175`로 실행한다. 이 경계는 정적 파일을 제공하지 않고 `/health`와 `/multiplayer` WebSocket만 제공하며, 기본적으로 공식 GitHub Pages Origin만 WebSocket에 허용한다.
3. 같은 `http://127.0.0.1:4175` 앞에 Cloudflare Quick Tunnel을 연다.
4. 새 공개 HTTPS 주소의 `/health`가 정상이고 프로세스 시작 시점의 `package.json` 버전과 일치하는지 검증한다. 검증이 끝나기 전에는 `index.html`을 변경하지 않는다.
5. 루트 `index.html`의 `meta[name="multiplayer-server"]` content 값만 새 HTTPS 주소로 교체하고 나머지 내용은 그대로 둔다.
6. `index.html`만 포함하는 단일 Lore 커밋을 만들고 `origin main`에 push한다. 커밋에는 push 전 터널 `/health` 확인을 마쳤고 GitHub Pages 전파/공개 smoke 검증은 커밋 이후 단계에서 수행함을 명시한다. push가 실패하면 로컬 커밋을 되돌리고 `index.html` 원본을 복원해 작업 트리를 깨끗하게 유지한다.
7. GitHub Pages `https://openbaeseongjin.github.io/baeseongjin/`가 새 주소를 노출할 때까지 제한된 재시도로 대기한 뒤 기존 `smokeMultiplayer` 검사로 채널 생성·2인 참가·퇴장·빈 방 제거를 검증한다.
8. push가 이미 성공한 뒤 Pages 전파·smoke 실패는 방금 반영한 서버/터널을 죽이지 않는다. 실패 원인과 함께 안내를 출력하고 서버/터널은 조사·재시도를 위해 유지한다.
9. 성공이면 Pages URL, 게임 서버 URL, 검증 결과와 Ctrl+C 수명주기 안내를 출력한다. 프로세스는 Ctrl+C/SIGTERM을 받을 때까지 게임 서버와 터널을 계속 실행하며, 신호를 받으면 이 명령이 시작한 두 프로세스만 종료한다.

Quick Tunnel 주소는 프로세스를 다시 실행할 때마다 달라진다. 즉 이 워크플로는 고정된 HTTPS/WSS 운영 주소를 제공하지 않으며, 재시작 후에는 같은 절차로 새 주소를 배포해야 한다. 사용자에게 주소를 입력시키지 않고 배포 클라이언트의 메타 설정 한 곳에서만 현재 주소를 관리한다.

## 상시 게임 서버 직접 실행

`publish:multiplayer` 대신 운영자 명령으로만 서버를 열 때도 같은 경계를 사용한다.

```powershell
$env:BAESEONGJIN_ALLOWED_ORIGINS="https://openbaeseongjin.github.io"
npm run start:game-server
```

이 명령은 컨테이너 없이 로컬 PC의 `0.0.0.0:4175`에 직접 바인딩한다. `4173`과 `4174`는 정적 개발 서버가 사용할 수 있도록 분리했다. 다른 환경이 꼭 필요하면 명령행 `--port`, `--host`로 실행 값을 직접 지정한다. 프로세스 상태 확인은 `http://127.0.0.1:4175/health`를 사용한다. 응답의 `version`은 프로세스 시작 시점의 `package.json` 버전이며, Pages 표시 버전과 달라지면 서버를 재시작해야 한다. 그 외 HTTP 경로는 404이며 게임 서버가 `index.html`이나 소스 파일을 제공하지 않는다. WebSocket 연결은 기존처럼 `/multiplayer?channel=...`만 사용한다.

TLS는 Cloudflare Tunnel에서 종료한다. Pages의 `meta[name="multiplayer-server"]`에는 현재 터널의 HTTPS/WSS 주소를 넣고, 다시 시작하는 터널마다 실제로 배포한 주소가 달라지므로 문서에서 고정 주소를 주장하지 않는다. 서버 프로세스는 `SIGINT` 또는 `SIGTERM`을 받으면 채널 시뮬레이션과 HTTP/WebSocket 서버를 순서대로 닫는다.

## 안전 경계

개발용 공유 명령은 다음 두 자식 프로세스만 시작한다.

- `node scripts/multiplayer-server.mjs`
- `cloudflared tunnel --url http://127.0.0.1:4173 --no-autoupdate`

운영 배포 명령도 같은 두 종류의 자식 프로세스만 시작한다. 즉 게임 전용 서버(`--game-only --host=0.0.0.0 --port=4175`)와 `cloudflared tunnel --url http://127.0.0.1:4175 --no-autoupdate`다. 두 명령 모두 기존 Cloudflare 설정 파일(`~/.cloudflared/config.yml`, `~/.cloudflared/config.yaml`)을 발견하면 그 설정을 우회하거나 변경하지 않고 안전하게 중단하고, `Ctrl+C`로 종료하면 이 명령이 시작한 두 프로세스만 종료한다. DNS, WARP, 시스템 프록시, 네트워크 어댑터, 라우팅, 파이어월은 변경하지 않는다.
