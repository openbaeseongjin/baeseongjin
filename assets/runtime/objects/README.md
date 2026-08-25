# Runtime object assets

장애물과 상호작용 오브젝트의 검증된 runtime package를 `<object-id>/`에 둔다. 아직 공개 manifest·validator 계약은 없지만 정적 PNG는 `RuntimeAssetCatalog`의 stable category·asset ID와 `WorldObjectSpriteAssetCatalog`의 실제 크기 검사를 통해 로드할 수 있다.

그래픽 package에는 충돌체, 피해량과 물리 값을 넣지 않는다.

## 현재 공용 Runtime sprite

- `story-display-universal`: `64×48` 단일 상태 정보 표지판.
- `exit-gate-universal`: `64×64` 닫힘·열림 출구문.
- `gate-control-panel-universal`: `48×48` 닫힘·열림 조작 패널.
- `boss-06-departure-gate`: Boss06 `480×760` locked·light·open 및 8-frame opening 출발문.
- `boss-06-maintenance-shuttle`: Boss06 승리 후 `500×390` Boarding 셔틀.
- `boss-06-security-star`: Boss06 Security Beam 양 끝의 `64×64` 비충돌 별 13-frame atlas.
- 앞의 세 package는 Sector 01~06 공용 presentation ID를 사용하고, Boss06 세 package는 전용 object kind를 사용한다.
- 준비 전이나 로드 실패 시 각 presentation의 기존 Canvas mock으로 독립 fallback한다.
- Boss06 출발문과 셔틀은 bottom-center를 기존 Gate bounds·Departure Deck top에 맞추고, gameplay geometry와 상태 전이는 변경하지 않는다.
- Boss06 Security Star는 center anchor로 LOW/HIGH beam 좌우 끝에 배치하며 `idle`·`telegraph`·`active`·`ending`을 기존 beam 상태에서만 파생한다.

## 현재 공용 Canvas 표현

- Checkpoint 비콘은 전용 object manifest가 생기기 전까지 `src/render/world/WorldMarkerPrimitives.js`의 공용 Canvas primitive가 싱글·멀티와 모든 환경 renderer에 동일하게 표시한다.
- 본체는 특정 Sector 강조색을 사용하지 않는 중립 흑연색·철색 장치다. 비활성은 닫힌 shutter, 활성은 벌어진 shutter와 밝은 세로 core, 이미 지난 상태는 낮은 대비로 구분한다.
- 표현 교체는 기존 Checkpoint 좌표·활성 반경·진행 저장·부활 상태에 영향을 주지 않는다.
