# Boss06 Maintenance Shuttle Runtime Asset

## 계약

- Category: `objects`
- Asset ID: `boss-06-maintenance-shuttle`
- Boss object kind: `boss-maintenance-shuttle`
- 파일: `maintenance-shuttle-boarding.png`
- atlas 크기: `500×390 RGBA`
- world 표시 크기: `250×195`
- Anchor: actual bottom contact `(0.356, 1)`
- 상태: `RUNTIME CONSUMED · NO DEDICATED OBJECT VALIDATOR`

Boss06 승리 연출의 `shuttle-reveal`과 Player별 Boarding 구간에서 같은 정적 sprite를 사용한다. `hidden` 상태는 렌더하지 않으며, authored `shuttlePosition (4630, -1055)`은 Departure Deck top에 닿는 실제 하단 착지 픽셀의 중심을 소유한다.

## 출처와 정규화

- Authoring source: `assets/artwork/objects/boss-06-maintenance-shuttle/`
- 사용자가 승인한 OpenAI built-in ImageGen PNG에서 밝은 중립 배경을 제거했다.
- `250×195` logical image를 32색 이하·no-dither·binary alpha로 정규화하고 nearest-neighbor `2×`로 출력했다.
- 외부 레퍼런스와 외부 라이선스 자료는 포함하지 않았다.

## 로드와 fallback

- `RuntimeAssetCatalog`가 stable package URL을 만든다.
- `WorldObjectSpriteAssetCatalog`가 실제 `500×390` 크기를 검증한다.
- Boss Stage resource preparation이 Warden sprite와 셔틀 sprite를 첫 프레임 전에 함께 준비한다.
- 준비 전 또는 로드 실패 시 `MaintenanceShuttleRenderer`의 기존 Canvas 표현을 사용한다.
- sprite와 fallback은 같은 실제 하단 접점 anchor `(0.356, 1)`·`250×195` world size를 사용한다.

## 비소유 범위

이 package는 Shuttle 접촉점 외의 Boarding zone, Gate·camera timing, collision, physics, completion 또는 network authority를 소유하지 않는다.

## 검증

- PNG 크기·RGBA·32색 이하·binary alpha·nearest `2×` 검증
- `npm run check`
- `npm run format:check`
- `git diff --check`
- Boss06 victory presentation desktop/mobile 및 강제 asset 실패 fallback 확인

2026-08-25 확인 결과:

- Desktop `1280×720`: `shuttle-reveal`의 기수·캐노피·수직미익·승선문·램프 표시, 브라우저 오류 없음
- Mobile `390×844`: 승리 카메라가 셔틀 중심을 표시하며 승선문·램프 식별, 브라우저 오류 없음
- Runtime PNG 격리: 기존 Canvas 셔틀 fallback 표시 후 PNG 원복
