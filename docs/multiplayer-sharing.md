# 임시 멀티 서버 공유

로컬 권위 서버와 정적 게임 페이지는 같은 포트에서 실행된다. 개발 중 외부 플레이어와 잠깐 확인할 때는 Cloudflare Quick Tunnel을 사용한다.

```powershell
npm run share:multiplayer
```

준비가 끝나면 터미널에 `https://...trycloudflare.com` 공유 주소가 표시된다. 참가자는 이 주소로 접속한 뒤 첫 화면에서 **멀티 플레이**를 선택한다. HTTPS 페이지는 같은 호스트의 `wss://.../multiplayer`에 자동 연결된다.

## 안전 경계

이 명령은 다음 두 자식 프로세스만 시작한다.

- `node scripts/multiplayer-server.mjs`
- `cloudflared tunnel --url http://127.0.0.1:4173 --no-autoupdate`

DNS, WARP, 시스템 프록시, 네트워크 어댑터, 라우팅, 방화벽은 변경하지 않는다. `Ctrl+C`로 종료하면 이 명령이 시작한 두 프로세스만 종료한다. 기존 `~/.cloudflared/config.yml` 또는 `config.yaml`이 있으면 그 설정을 우회하거나 변경하지 않고 안전하게 중단한다.

Quick Tunnel 주소는 실행할 때마다 달라지고 개발·테스트 용도다. 저장소나 문서에 실제 임시 주소를 고정해서 기록하지 않는다.
