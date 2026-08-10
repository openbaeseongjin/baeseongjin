# PWA 자동 업데이트

배포 후 사용자가 브라우저 캐시를 직접 지우지 않아도 최신 게임 파일을 받게 하는 구조다.

## 구성

- `src/pwa/ServiceWorkerUpdater.js`: 서비스 워커 등록, 업데이트 확인, 새 워커 활성화 시 1회 새로고침을 담당한다.
- `sw.js`: 같은 출처의 게임 파일을 `no-store` 네트워크 요청으로 제공한다.
- `src/main.js`: 앱 시작과 종료 생명주기에 업데이트 모듈을 연결한다.

## 재사용

다른 정적 웹 프로젝트에서도 브라우저 객체와 서비스 워커 URL만 전달하면 된다.

```js
const releaseUpdater = setupServiceWorkerUpdater({
    window: globalThis.window,
    navigator: globalThis.navigator,
    scriptUrl: new URL("../sw.js", import.meta.url)
});
```

페이지 종료 시 `releaseUpdater()`를 호출해 이벤트 리스너를 해제한다. 최초 설치에서는 새로고침하지 않고, 이미 서비스 워커가 제어 중인 페이지에서 새 버전이 활성화될 때만 한 번 새로고침한다.

## 데이터 정책

- Cache Storage에 별도 버전 캐시를 만들지 않는다.
- JavaScript 모듈 URL에 수동 버전 쿼리를 붙이지 않는다.
- `localStorage`와 게임 저장 데이터는 삭제하지 않는다.
- 현재 프로토타입은 오프라인 실행보다 항상 최신 배포를 받는 것을 우선한다.
