# Boss 03 Lower Sector Commander arena runtime package

- Stable package ID: `environment-boss-03-lower-sector-commander-arena`
- Selection key: `boss-03`
- Backdrop·palette source: `assets/runtime/environments/sector-03-central-exchange/`
- Platform module source: `assets/runtime/environments/boss-06-continuity-warden-arena/platform-modules.png`
- Runtime scope: `bossStageId: boss-03`을 가진 표면의 terrain skin만 교체한다.
- Collision polygon, one-way edge chain, `grappleable`, Boss FSM, Camera와 Network authority는 변경하지 않는다.

`platform-modules.png`는 Boss06에 승인·정규화된 긴 장갑 panel module을 픽셀 변경 없이 복사한 atlas다. Manifest의 rectangle frame이 `900×120` panel과 같은 모듈의 `900×8` 상단 cap을 직접 선택한다.

Backdrop layer·zone palette·decoration은 Sector03 package의 승인 PNG와 정의를 유지한다. 전용 terrain material은 `blockOverlay: false`로 공통 절차형 panel을 끄고 module sheet 안의 장갑 panel·rib·conduit를 중복 없이 표시한다.

검증:

```bash
npm run validate:environment-assets -- assets/runtime/environments/boss-03-lower-sector-commander-arena
```
