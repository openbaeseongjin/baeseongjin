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

## 검증

```powershell
npm test
npm run check
npm run format:check
git diff --check
```

`npm test`는 고정 스텝, 입력 snapshot, 벡터 계산, `game-kit` 의존 경계를 확인한다. `npm run check`는 모든 JavaScript와 MJS 파일의 문법을 검사하고, `npm run format:check`는 Prettier 형식을 확인한다.

## 문제 해결

- 포트가 사용 중이면 다른 포트를 전달한다.
- 브라우저에서 모듈 오류가 나면 `index.html`을 파일로 직접 열지 말고 로컬 서버를 사용한다.
- 물리 결과가 실행마다 다르면 고정 스텝 밖에서 상태를 바꾸거나 비결정적 난수를 사용하지 않았는지 확인한다.
