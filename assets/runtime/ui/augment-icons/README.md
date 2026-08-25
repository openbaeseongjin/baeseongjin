# Augment icon runtime package

검증된 `32×32` 또는 `48×48` 투명 정사각 PNG를 `<stable-id>.png` 이름으로 둔다. 증강별 원본 크기는 달라도 된다. `AugmentIconAssetCatalog`가 증강과 시작 Spell catalog에서 전체 Stable ID를 가져오므로 manifest와 경로 대응표를 따로 유지하지 않는다.

선택 카드, Spell 슬롯과 Rope·Passive 상태 HUD는 같은 Stable ID의 한 이미지를 공유한다. 선택 카드의 이름·family·tagline·설명은 `AugmentCatalog`가 소유하며 아이콘 package가 별도 문구를 중복하지 않는다. 비픽셀 일러스트를 더 작은 슬롯에 표시할 때는 고품질 보간으로 비율과 안티앨리어싱을 유지한다.

정식 파일이 없거나 load·decode·크기 검증에 실패하면 선택 카드, Spell 슬롯과 Rope·Passive 상태 HUD가 각 카테고리의 Canvas fallback을 사용한다.

```powershell
npm run validate:augment-icons -- assets/runtime/ui/augment-icons
```
