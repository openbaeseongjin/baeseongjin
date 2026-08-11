# 임시 멀티 서버 공유

운영 멀티는 GitHub Pages와 분리된 고정 게임 서버를 항상 실행하고, 플레이어는 4자리 채널 번호만 공유한다. 아래 Quick Tunnel 명령은 운영 서버를 대신하지 않으며 개발 중 외부 연결을 잠깐 확인할 때만 사용한다.

```powershell
npm run share:multiplayer
```

준비가 끝나면 터미널에 `https://...trycloudflare.com` 개발 주소가 표시된다. 이 주소에서 **멀티 플레이 → 새 채널 만들기**를 누르면 4자리 번호가 표시되고 다른 참가자는 같은 주소에서 번호만 입력한다.

운영 배포에서는 루트 `index.html`의 다음 값을 현재 실행 중인 게임 서버의 공개 주소로 설정한다.

```html
<meta name="multiplayer-server" content="https://game.example.com" />
```

모바일 화면에는 이 서버 주소를 노출하거나 입력받지 않는다.

## 상시 게임 서버 실행

운영 호스트에서는 Pages Origin만 허용한 뒤 정적 파일을 제공하지 않는 게임 전용 모드로 실행한다.

```powershell
$env:BAESEONGJIN_ALLOWED_ORIGINS="https://openbaeseongjin.github.io"
npm run start:game-server
```

이 명령은 컨테이너 없이 로컬 PC의 `0.0.0.0:4175`에 직접 바인딩한다. `4173`과 `4174`는 정적 개발 서버가 사용할 수 있도록 분리했다. 다른 환경이 꼭 필요하면 명령행 `--port`, `--host`로 실행 값을 직접 지정한다. 프로세스 상태 확인은 `http://127.0.0.1:4175/health`를 사용한다. 응답의 `version`은 프로세스 시작 시점의 `package.json` 버전이며, Pages 표시 버전과 달라지면 서버를 재시작해야 한다. 그 외 HTTP 경로는 404이며 게임 서버가 `index.html`이나 소스 파일을 제공하지 않는다. WebSocket 연결은 기존처럼 `/multiplayer?channel=...`만 사용한다.

TLS는 Cloudflare Tunnel에서 종료하고, Pages의 `meta[name="multiplayer-server"]`에는 현재 터널의 HTTPS/WSS 주소를 넣는다. 서버 프로세스는 `SIGINT` 또는 `SIGTERM`을 받으면 채널 시뮬레이션과 HTTP/WebSocket 서버를 순서대로 닫는다.

현재 프로토타입은 계정 인증이 필요 없는 Quick Tunnel 프로세스를 상시 서버 앞에 계속 실행한다. 터널 프로세스가 살아 있는 동안 주소는 유지되지만 재시작하면 주소가 달라지므로, 새 주소의 `/health`와 Pages Origin WebSocket을 확인한 뒤 `index.html`의 메타 값만 교체해 다시 배포한다. Cloudflare 계정과 도메인이 준비되면 같은 4175 origin을 Named Tunnel에 연결해 주소 교체 작업을 없앤다.

## 안전 경계

개발용 공유 명령은 다음 두 자식 프로세스만 시작한다.

- `node scripts/multiplayer-server.mjs`
- `cloudflared tunnel --url http://127.0.0.1:4173 --no-autoupdate`

DNS, WARP, 시스템 프록시, 네트워크 어댑터, 라우팅, 방화벽은 변경하지 않는다. `Ctrl+C`로 종료하면 이 명령이 시작한 두 프로세스만 종료한다. 기존 `~/.cloudflared/config.yml` 또는 `config.yaml`이 있으면 그 설정을 우회하거나 변경하지 않고 안전하게 중단한다.

Quick Tunnel 주소는 실행할 때마다 달라진다. 사용자에게 주소를 입력시키지는 않으며, 배포 클라이언트의 메타 설정 한 곳에서만 현재 주소를 관리하고 일반 문서나 코드 여러 곳에 복제하지 않는다.
