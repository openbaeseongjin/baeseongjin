# Runtime UI assets

HUD, 아이콘과 메뉴 그래픽의 검증된 runtime package를 `<asset-id>/`에 둔다. 증강 아이콘은 [`augment-icons/`](./augment-icons/README.md)의 Stable ID 파일명·loader·validator 계약을 사용한다.

시작 화면은 [`startup-splash/one-rope-splash.png`](./startup-splash/one-rope-splash.png)를 고정 자산으로 사용한다. `index.html`은 원본 비율을 보존하는 `contain` 배치와 검은 여백을 소유하고, 좌측 하단 CSS 로더와 최소 1초 노출은 `StartupSplashScreen`이 소유한다. 승인 원본과 제작 기록은 [`assets/artwork/ui/startup-splash/`](../../artwork/ui/startup-splash/)에 둔다.

이 두 계약 밖의 UI 그래픽은 별도 runtime 계약이 생기기 전에는 [`assets/artwork/ui/`](../../artwork/README.md)에만 납품한다.
