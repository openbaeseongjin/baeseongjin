# 기술 스택

이 프로젝트는 Ball Fight Simulator와 같은 브라우저 네이티브 구조를 사용한다. 별도 번들러나 프론트엔드 빌드 단계 없이 정적 파일을 그대로 실행하고 GitHub Pages에 게시한다.

## 핵심 스택

| 영역 | 기술 | 사용 기준 |
|---|---|---|
| 언어 | Vanilla JavaScript | TypeScript 변환이나 번들 과정 없이 ES Module로 작성한다. |
| 게임 화면 | Canvas 2D API | 월드, 플레이어, 로프, 적, VFX를 렌더링한다. |
| UI | DOM API, 필요 시 Alpine.js 3.x | 현재 설치되지 않았다. Foundation 선택처럼 상태를 가진 DOM UI가 복잡해질 때 도입한다. |
| 스타일 | CSS | 현재는 `index.html`의 정적 앱 셸 스타일을 사용하며 규모가 커질 때 파일을 분리한다. |
| 로컬 실행 | Node.js 20 이상 | 정적 서버와 validator·검사 스크립트를 실행한다. |
| 패키지 관리 | npm | 개발 도구와 명령을 관리한다. |
| 포맷팅 | Prettier | Ball Fight Simulator와 같은 포맷 규칙을 사용한다. |
| 배포 | GitHub Pages | `main` 브랜치의 `/(root)`를 게시하고 루트 `index.html`을 진입점으로 사용한다. |

## 구조 원칙

- ES Module을 사용하며 번들러를 도입하지 않는다.
- Alpine.js를 도입하더라도 DOM UI만 담당하고 게임 상태 전이와 물리 계산을 소유하지 않는다.
- Canvas renderer는 snapshot을 읽어 그리기만 하며 게임 상태를 변경하지 않는다.
- 물리, 절차 생성, 전투, 보상 로직은 브라우저 DOM 없이 Node.js에서 재현·진단할 수 있어야 한다.
- 외부 라이브러리는 Ball Fight Simulator에 있다는 이유만으로 추가하지 않는다. 이 프로젝트의 기능에 실제로 필요할 때만 도입한다.

## Ball Fight Simulator와 다른 항목

- TensorFlow.js는 Ball Fight Simulator의 학습 기능 전용이므로 현재 스택에 포함하지 않는다.
- 게임 규칙, 엔티티, UI 내용은 공유하지 않고 공용 기반과 구현 패턴만 맞춘다.
