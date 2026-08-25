# Boss06 Departure Gate Runtime Asset

## 계약

- Category: `objects`
- Asset ID: `boss-06-departure-gate`
- Boss object kind: `boss-departure-gate`
- 크기: `480×760 RGBA`
- Anchor: `bottom-center`
- gameplay states: `locked`, `light`, `open`
- presentation motion: `opening-00..07` over the existing `0.3s` light interval
- 상태: `RUNTIME CONSUMED · NO DEDICATED OBJECT VALIDATOR`

Gate의 bottom-center는 Departure Deck 왼쪽에서 visual 반폭만큼 떨어진 Deck top 좌표다. 따라서 `480×760` sprite 전체가 `600px` Deck 위에 포함되며, 기존 `220×705` collision bounds는 변경하지 않는다.

## 파일

- `departure-gate-locked.png`
- `departure-gate-light.png`
- `departure-gate-open.png`
- `opening/opening-00.png` … `opening/opening-07.png`

모든 파일은 authoring export와 동일한 `480×760` RGBA PNG다. `opening` frame은 gameplay state를 추가하지 않고 `light`의 표현 진행도만 소비한다.

## 로드와 fallback

- `RuntimeAssetCatalog`가 stable package URL을 만든다.
- `WorldObjectSpriteAssetCatalog`가 각 실제 `480×760` 크기를 검증한다.
- Boss Stage resource preparation이 Warden·Gate·Shuttle asset을 함께 준비한다.
- 준비 전 또는 현재 상태 이미지 로드 실패 시 `DepartureGateRenderer` Canvas 표현을 사용한다.
- Gate 실패는 Shuttle sprite 사용을 막지 않고 Shuttle 실패도 Gate 상태 sprite 사용을 막지 않는다.

## 비소유 범위

이 package는 Gate collision, `gateOpen`, Bridge, Boarding zone, victory timing, gameplay, physics 또는 network authority를 소유하지 않는다.

## 검증

- 11개 PNG `480×760 RGBA`와 authoring/runtime byte 일치
- locked/light/open 및 opening frame 상태 연결
- `npm run check`
- `npm run format:check`
- `git diff --check`
- Boss06 victory presentation desktop browser 및 강제 asset 실패 fallback 확인
