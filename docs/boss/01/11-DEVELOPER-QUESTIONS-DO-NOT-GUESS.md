# 구현 중 추측하지 말아야 할 것

다음은 기획이 아니라 현재 Runtime owner를 확인해 결정해야 한다.

1. Boss Arena가 seamless world 안에서 어떤 Area/landmark ID를 가져야 하는가
2. 1-8 이후 실제 Sector transition lock owner가 어느 파일인가
3. Boss presentation event consumer가 현재 어느 계층인가
4. Dynamic collision surface transform을 기존 시스템이 지원하는가
5. Boss impact를 prediction에 넣을지 authoritative-only로 먼저 넣을지
6. Enemy/Wind phase enable/disable을 spawn/despawn으로 할지 activation filter로 할지

이 항목은 구현자가 latest main을 읽고 결정한다.

단, 결정 결과는 다음 기획 권위를 깨면 안 된다:
- Boss 1 승리 전 Sector02 진입 금지
- Phase target 3개
- weak ×1.5
- no new input / AI
- Phase 3 no-crossfire
