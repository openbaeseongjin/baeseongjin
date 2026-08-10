# 재사용 가능한 게임 기반

## 공개 진입점

공용 기반은 `src/game-kit/index.js`를 통해서만 사용한다. 현재 공개 API는 `Vector2` 하나이며 실제 필요가 생길 때만 확장한다.

## 현재 기반

| 모듈 | 책임 |
| --- | --- |
| `Vector2` | 2차원 위치·속도 계산 |
| `FixedStepRunner` | 결정적 고정 간격 업데이트 |
| `InputSampler` | 브라우저 입력의 동결 snapshot |
| `CanvasRenderer` | DPR 대응 플랫 Canvas 렌더링 |

`FixedStepRunner`, `InputSampler`, `CanvasRenderer`는 현재 애플리케이션 기반이지만, 복수 게임에서 실제로 필요해질 때만 `game-kit` 이동을 검토한다.

## Ball Fight Simulator와의 관계

기존 프로젝트에서 확인한 폴더 경계, Canvas 렌더링, 물리 디버깅, 테스트 패턴을 참고했다. 현재 파일은 해당 코드를 복사하지 않고 이 프로젝트 계약에 맞게 새로 작성했다.

다음 코드는 기본 재사용 대상에서 제외한다.

- 기존 `PhysicsBody`: 게임별 이동 정책과 상태 가정 포함
- 기존 지형 생성기: 사냥터와 스테이지 규칙 포함
- 캐릭터, 능력, 전투 UI, 진행 데이터

향후 직접 이식하려면 파일 단위 승인, 사용·귀속 방침, 경계 테스트가 필요하다.
