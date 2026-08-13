# 저장소 에이전트 지침

이 규칙은 이 저장소에서 작업하는 모든 자동화 에이전트에 적용한다.

1. 구현 전에 `SESSION-HANDOFF.md`와 `docs/development-rules.md`를 읽고 현재 결정, 다음 작업, 반복 규칙을 확인한다. 관련 주제의 기준 문서도 함께 읽는다.
2. 사용자가 대화에서 향후 작업에 영향을 주는 제품·조작·아키텍처·워크플로 결정을 명시하면, 별도 요청을 기다리지 말고 같은 작업에서 먼저 `SESSION-HANDOFF.md`에 반영한다. 최신 명시적 결정이 이전 결정보다 우선하며 서로 모순되는 활성 항목을 남기지 않는다.
3. 한 번의 작업을 넘어서 반복 적용할 내용은 `docs/development-rules.md`의 결정 흡수 절차에 따라 해당 기준 문서에도 승격한다. `SESSION-HANDOFF.md`에는 현재 결론과 기준 문서 위치만 남겨 다음 에이전트가 같은 질문을 다시 하지 않게 한다.
4. 에이전트의 추정은 사용자 결정처럼 기록하지 않는다. 일회성 실행 요청, 임시 디버깅 값, 비밀 정보도 영구 규칙으로 승격하지 않는다.
5. 완전히 반영되었거나 다른 결정으로 대체된 항목만 대체 관계를 보존한 채 `docs/decision-history.md`로 이동한다.
6. 코드·설정 변경을 끝내기 전에 이번 대화의 명시적 결정이 핸드오프와 기준 문서에 반영됐는지 검색하고, 누락된 문서를 같은 Issue와 커밋에 포함한다.
7. 자동 CI를 전제로 하지 않는다. 각 개발자는 병합 전에 `npm test`, `npm run check`, `npm run format:check`를 실행하고, 화면 변경은 브라우저에서 직접 검증한 뒤 Pull Request에 결과를 기록한다. 버전 또는 멀티플레이 서버 코드가 바뀐 작업은 PR 병합만으로 완료 처리하지 않고 `docs/version-management.md`의 기존 필수 변경·완료 절차까지 수행한다.

## Sprite asset work

- 스프라이트 생성·교체·import·atlas·animation metadata 작업은 파일을 만들기 전에 `docs/graphics-asset-guide.md`와 `docs/sprite-asset-format.md`를 전부 읽고 `assets/runtime/characters/README.md`에서 현재 구현 상태와 mock 범위를 확인한다.
- PixelLab·SpriteCook의 원본 export 형식을 런타임 계약으로 사용하지 않는다. 도구별 입력은 여러 PNG atlas와 `sprite-manifest.json`으로 정규화하고 renderer·gameplay에 도구별 분기를 추가하지 않는다.
- 새 player runtime 리소스는 `assets/runtime/characters/fixtures/player-multi-atlas/sprite-manifest.json`을 공개 계약으로 사용하고 `assets/runtime/characters/player-production-template/`에서 시작해 `npm run validate:sprite-assets -- <directory>`를 통과시킨다. 문서 예제를 기억으로 다시 쓰거나 별도 manifest 변형을 만들지 않는다.
- 스프라이트 작업 결과에는 생성·변환한 파일 경로, 사용 도구와 원본 형식, 실제 validator 결과를 기록한다. collider·hitbox·피해량·물리 설정은 스프라이트 manifest에 넣지 않는다.
- `assets/runtime/characters/sprite-manifest.schema.json`, fixture manifest, `PlayerSpriteManifest.js`와 validator는 하나의 공개 계약이다. 어느 하나를 변경하면 나머지와 `docs/sprite-asset-format.md`를 같은 변경에서 갱신하고 multi-atlas 회귀 테스트를 실행한다.

## Environment asset work

- 배경·지형 표면·비충돌 장식의 생성·교체·import·atlas 작업은 파일을 만들기 전에 `docs/graphics-asset-guide.md`와 `docs/environment-asset-format.md`를 전부 읽고 `assets/runtime/environments/README.md`에서 현재 mock 범위를 확인한다.
- PixelLab·SpriteCook의 원본 배열과 metadata를 런타임 계약으로 사용하지 않는다. 도구별 입력은 여러 PNG atlas와 환경 전용 `sprite-manifest.json`으로 정규화하며 캐릭터 animation schema나 renderer에 도구별 분기를 추가하지 않는다.
- 새 environment runtime 리소스는 `assets/runtime/environments/default-mock/sprite-manifest.json`을 복사해 시작하고 `npm run validate:environment-assets -- <directory>`를 통과시킨다. atlas 개수와 frame 배열은 바꿀 수 있지만 loader·schema·example·validator를 하나의 공개 계약으로 유지한다.
- terrain 표현은 기존 collision surface polygon과 one-way edge chain을 그대로 사용한다. decoration은 충돌을 추가하지 않고 이동 경로 밖 또는 배경에만 배치하며, asset 실패는 backdrop·terrain·decoration별 독립 fallback과 `?metrics=1` 진단으로 검증한다.

## Audio asset work

- 오디오 생성·교체·import·codec·loop 작업은 파일을 만들기 전에 `docs/audio-asset-guide.md`와 `docs/audio-asset-format.md`를 전부 읽고 `assets/audio-authoring/README.md`와 `assets/runtime/audio/README.md`에서 인계·mock 범위를 확인한다.
- Skill·MCP·DAW 원본을 런타임 계약으로 사용하지 않는다. 원본·48 kHz/24-bit PCM WAV master·preview는 `assets/audio-authoring/<category>/<asset-id>/`에 인계하고, 통합 개발자가 browser source 배열과 `audio-manifest.json`으로 정규화한다.
- 새 runtime package는 같은 category의 `assets/runtime/audio/<category>/default-mock/audio-manifest.json`에서 시작한다. pack은 `assets/runtime/audio/packs/default-mock/audio-pack.json` 구조를 따르고 `npm run validate:audio-assets -- <pack-or-package-directory>`를 통과시킨다.
- `audio-manifest.schema.json`, `audio-pack.schema.json`, parser, mock manifest와 validator는 하나의 공개 계약이다. 하나를 바꾸면 나머지와 `docs/audio-asset-format.md`를 같은 변경에서 갱신한다.
- manifest에는 clip·source·loop와 cue 표현 정책만 둔다. 게임 trigger·collider·damage·physics·network authority는 넣지 않으며 `AudioEventBindings` 밖에서 게임 사건 이름을 오디오 engine에 추가하지 않는다.
- package 교체는 stable ID·catalog·immutable definition 주입 경계를 사용한다. 향후 디버그 selector를 위해 특정 mock 경로를 gameplay나 mixer에 하드코딩하지 않는다.

## Split-authority gameplay events

- 플레이어·로프처럼 특정 소유자가 있는 입력 주도 사건은 해당 소유 클라이언트가, 충돌·피격은 피해 클라이언트가 최초 트리거한다. 서버 응답을 기다린 뒤 모바일 움직임, 피격 반응, UI 또는 VFX를 시작하지 않는다.
- 몹·적 투사체 생성과 궤적처럼 어느 한 클라이언트에 맡길 수 없는 중립 시뮬레이션 사건은 서버가 진행한다. 이를 안정적인 플레이어 ID의 대표 클라이언트에게 위임하지 않는다.
- 입력 주도 객체와 중립 시뮬레이션 객체가 만나는 피격·절단은 피해 클라이언트가 claim한다. 정상 impact claim은 사건 자료와 사건 결과에 한정된 양자화 상태 지문만 보내며, 서버가 같은 전이를 적용한 지문이 일치하면 사건을 공유한다. 지문은 동기화 불일치 감지용이지 보안 증명이나 서버 판정 대체물이 아니다.
- impact 지문이 다를 때만 서버가 `state-diverged`로 복구 자료를 요청하고, 피해 클라이언트가 그 시점의 소유자 상태를 한 번 보내 서버와 동료를 자기 결과로 수렴시킨다. 정상 impact마다 전체 상태를 보내거나 서버 상태로 피해 클라이언트를 되감지 않는다.
- 서버의 주역할은 소유 클라이언트가 만든 상태·사건을 검증해 다른 복제본에 공유하는 것이다. 정상 승인 중인 소유자의 HP·피격 무적·생명·로프·쿨다운·시간 제한 강화는 서버 snapshot으로 다시 쓰지 않는다. 서버가 직접 진행하는 상태는 몹·중립 투사체·공용 월드·세션 수명주기다.
- 새 이벤트 구현에는 로컬 트리거가 서버 receipt보다 먼저 발생하는지, 정상 경로가 최소 사건 자료만 보내는지, 상태 불일치 때만 복구 상태를 보내는지, 중복 claim이 한 번만 확정되는지, 서버 확정이 소유 클라이언트 반응을 되감지 않는지와 중립 객체가 특정 클라이언트 연결에 의존하지 않는지를 검증한다.
