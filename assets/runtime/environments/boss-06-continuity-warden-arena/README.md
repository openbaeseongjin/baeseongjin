# Boss 06 Continuity Warden arena runtime package

- Stable package ID: `environment-boss-06-continuity-warden-arena`
- Selection key: `boss-06`
- Source artwork: `assets/artwork/environments/boss-06-continuity-warden-arena-platforms/`
- Runtime scope: `bossStageId: boss-06`을 가진 표면의 terrain skin만 교체한다.
- Collision polygon, one-way edge chain, grappleable, Boss FSM, Camera와 Network authority는 변경하지 않는다.

`platform-modules.png`는 승인된 ImageGen RGBA 원본을 변형 없이 복사한 atlas다. Manifest의 rectangle frame이 긴 장갑 panel `900×120`과 같은 모듈의 상단 cap `900×8`을 직접 선택하므로 고화질 재생성이나 보간된 별도 PNG를 만들지 않는다.

이 material은 `blockOverlay: false`로 공통 절차형 사선 panel을 끄고 승인 PNG 안의 장갑 panel·rib·cyan conduit를 그대로 표시한다.

Backdrop과 decoration 항목은 환경 manifest v1의 독립 fallback 계약을 충족하기 위한 Sector 06 사본이며 Boss 전용 선택에서는 terrain component만 사용한다.

검증:

```bash
npm run validate:environment-assets -- assets/runtime/environments/boss-06-continuity-warden-arena
```

- 2026-08-25 validator: **PASS** — 3 atlases, 5 zones, 1 backdrop layer
- Map Editor production Gameplay View: `boss-06` 전용 definition 선택, Boss 전용 surface 15개와 기존 collision 배치 유지 확인
