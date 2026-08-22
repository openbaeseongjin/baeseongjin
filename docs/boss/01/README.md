# Boss 01 콘텐츠 인계

상태: `AUTHORED FINAL CONTENT / RUNTIME PARTIALLY IMPLEMENTED`

현재 콘텐츠 기준은 사용자 제공 `ONE-ROPE-BOSS-01-FINAL-CONTENT-HANDOFF.zip`이다. Boss core의 HP·Phase·Breaker·8초 노출 상태는 이미 Runtime에 있으나 physical Arena, Core/Breaker world object, threat 배치, damage·전멸 재시도 연결, 자동 entry, `2-1` transition은 미구현이다.

- source ZIP SHA-256: `b74e12c0750bb4f75af99edf233a8a1a0175bbc756fb4fe88bb1092322acc81e`
- authored documents: [`BOSS-01-BRIEF.md`](./final-content/BOSS-01-BRIEF.md), [`BOSS-01-COMPONENTS.md`](./final-content/BOSS-01-COMPONENTS.md), [`MAP-PREVIEW.html`](./final-content/MAP-PREVIEW.html)
- current transition and Timer authority: [`../../scenario-development-integration.md`](../../scenario-development-integration.md), [`../../sector-timer-and-boss-flow.md`](../../sector-timer-and-boss-flow.md)

`1-8` 내부에는 Boss를 넣지 않는다. Boss는 checkpoint 뒤 별도 Post-Sector slot에 들어가며, 초기 Boss Timer와 시간 만료 Arena collapse는 구현 입력이 아니다.

최신 FINAL 콘텐츠는 Boss 01의 authoring intent를 갱신하지만 Runtime 권위는 바꾸지 않는다. 아래 REV2.1 자료와 그 안의 제안 코드·사양은 historical reference로만 유지한다.

## REV2.1 legacy reference

이 디렉터리의 기존 REV2.1 자료는 이전 사용자 제공 인계를 보존한 historical reference다. ZIP SHA-256은 `42e949499fb46526677a0f250b5232f47d308497fddfb44f4ac7fe472943a21`이며, 원본의 25개 문서·정적 미리보기·사양·참조 코드 파일을 수록했다. `12-CLAUDECODE-IMPLEMENT.md`는 첨부물 내부의 실행 지침이므로 사용자 요청의 일부로 취급하지 않았고 포함하거나 실행하지 않았다.

`README-FIRST.md`의 마크다운 줄바꿈용 후행 공백 4개만 저장소의 `git diff --check` 정책을 위해 제거했다. 그 외 24개 파일은 원본 ZIP과 바이트 단위로 일치하며, `MANIFEST.md`의 SHA-256 값은 변환 전 원본 기준이다.

## REV2.1 범위와 권위

이전 REV2.1 병합은 기획 인계를 저장소에서 검토 가능한 형태로 보존한다. `reference-code/`는 제안 코드이며 `src/`에 적용하거나 실행하지 않았다. `docs/MAP-PREVIEW.html`은 기획 검토용 정적 미리보기이며 Runtime 배경·충돌·월드 지형이 아니다.

현재 Runtime과 후속 구현 범위의 권위는 다음 순서로 판단한다.

1. 최신 `src/game/boss/Boss01Definition.js`·`BossEncounterRuntime.js`와 현재 제품 기준 문서
2. [`../../sector-timer-and-boss-flow.md`](../../sector-timer-and-boss-flow.md), [`../../scenario-development-integration.md`](../../scenario-development-integration.md), [`../../implementation-roadmap.md`](../../implementation-roadmap.md)
3. 이 디렉터리의 REV2.1 기획 인계

ZIP의 authoring snapshot은 `e1c558ef9e09ecbc09254cb3fc45306186755570`이고, 이 인계 병합 때 검토한 main 기준은 `a04e70e1514da2da249b4bdf3f55fd21ab854471`이다. 따라서 ZIP 자체의 “아직 미구현” 표기는 현재 상태를 설명하지 않는다. 현행에는 Boss 01의 Has-A runtime과 top-level snapshot이 있으나 physical Arena, Breaker/Core/Emitter/Wind world mock, 자동 진입, 일반 전투 피해·전멸 재시도 연결, 승리 뒤 `2-1` 전환은 아직 연결되지 않았다.

## 구현 전에 해소할 차이

- ZIP의 `timerSeconds: 210`, `collapseSpeed: 80` 및 시간 만료 HeadHouse closure는 현재 제품 계약과 충돌한다. 초기 Boss 01은 시간 제한과 Arena collapse 없이 시작하며, 이 값들은 후속 Timer 결정 전 Runtime 입력으로 사용하지 않는다.
- ZIP은 `1-8 Maintenance Override → Boss 01`의 인과를 제안한다. 현행 Boss는 `1-8` 내부가 아닌 checkpoint 뒤 별도 Post-Sector Boss slot에 넣는 계약이므로, 실제 trigger와 Sector 01→02 lock owner는 별도 구현·승인에서 재감사해야 한다.
- ZIP의 arena 좌표·phase target·weak point·threat JSON과 reference code는 검토 가능한 제안이다. 현행 collision, prediction/authority, sector transition, presentation owner에 직접 연결하지 않는다.

이 차이를 해소하는 후속 작업은 최신 main을 다시 읽고, 현재 Runtime 권위와 충돌하지 않는 명시적 제품 결정을 문서화한 뒤 별도 Issue에서 진행한다.

## 원본 구성

- `01-DESIGN-LOCK.md`부터 `11-DEVELOPER-QUESTIONS-DO-NOT-GUESS.md`, `13-CURRENT-GITHUB-BASELINE.md`: 원본 기획·통합 인계
- `spec/`: Arena, definition delta, phase threat 제안 사양
- `reference-code/`: 실행되지 않는 제안 코드
- `qa/`: 후속 구현에서만 사용할 수 있는 인수·검증 계획
- `docs/`: REV2.1 route 정적 미리보기와 변경 기록
- `MANIFEST.md`: 원본 파일 SHA-256 목록
