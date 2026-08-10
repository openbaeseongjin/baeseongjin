# 저장소 에이전트 지침

이 규칙은 이 저장소에서 작업하는 모든 자동화 에이전트에 적용한다.

1. `docs/development-rules.md`를 개발의 최상위 규칙으로 취급한다. 구현 전에 해당 문서와 `SESSION-HANDOFF.md`를 읽고, 모듈 경계, 검증, 문서화, 결정 수명주기 계약을 지킨다.
2. 현재 유효한 L1/L2 결정은 `SESSION-HANDOFF.md`에 기록한다. 완전히 반영되었거나 다른 결정으로 대체된 항목만 대체 관계를 보존한 채 `docs/decision-history.md`로 이동한다.
3. 자동 CI를 전제로 하지 않는다. 각 개발자는 병합 전에 `npm test`, `npm run check`, `npm run format:check`를 실행하고, 화면 변경은 브라우저에서 직접 검증한 뒤 Pull Request에 결과를 기록한다.
