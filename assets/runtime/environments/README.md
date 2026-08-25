# Environment sprite assets

환경 표현을 위한 pixel sprite 리소스다. 캐릭터 sprite와 별도의 manifest v1 계약을 사용하며 Runtime은 backdrop과 terrain atlas만 그린다. 기존 decoration atlas와 group은 교환 형식 호환 자료로 보존하지만 자동 배치하거나 gameplay 시작 자산으로 로드하지 않는다.

그래픽 담당자의 납품 경로는 `assets/artwork/environments/<asset-id>/`이며 공통 기준은 [`docs/graphics-asset-guide.md`](../../../docs/graphics-asset-guide.md)를 따른다. 이 폴더는 담당 개발자가 납품된 환경 PNG를 `<environment-id>/` runtime package로 정규화하는 경로이며 세부 계약은 [`docs/environment-asset-format.md`](../../../docs/environment-asset-format.md)를 따른다.

## 구조

```
assets/runtime/environments/
├─ sprite-manifest.schema.json   # 환경 manifest JSON Schema
├─ default-mock/
│     ├─ sprite-manifest.json    # 복사 가능한 예제
│     ├─ backdrop-far.png        # 원경 silhouette atlas
│     ├─ backdrop-mid.png        # 중경 silhouette atlas
│     ├─ backdrop-near.png       # 근경 silhouette atlas
│     ├─ terrain-fill.png        # 지형 fill tile atlas
│     ├─ terrain-edge.png        # 지형 edge tile atlas
│     └─ decoration.png          # 장식 atlas
├─ boss-06-continuity-warden-arena/ # Boss 06 전용 terrain skin
├─ sector-01-maintenance/        # Sector 01 최종 authored package
├─ sector-02-worker-district/    # Sector 02 최종 authored package
├─ sector-03-central-exchange/   # Sector 03 최종 authored package
├─ sector-04-upper-residential/  # Sector 04 최종 authored package
├─ sector-05-continuity-control/ # Sector 05 최종 authored package
├─ sector-06-rooftop-evacuation/ # Sector 06 최종 authored package
└─ README.md
```

## 검증

```bash
npm run validate:environment-assets
npm run validate:environment-assets -- assets/runtime/environments/default-mock
```

## 계약

- 캐릭터 manifest와 별도의 `sprite-manifest.schema.json`을 사용한다.
- 여러 PNG atlas를 ID로 등록한다. 각 frame은 0 기반 cell 또는 atlas 내부의 정수 rectangle을 직접 참조한다.
- atlas 파일 수·크기와 frame 배열 길이는 바꿀 수 있지만 manifest field는 schema·loader·validator의 공개 계약을 따른다.
- backdrop은 package별 1~6개 layer를 허용한다. layer `id`는 package 안에서 유일한 kebab-case 안정 ID이고, 실제 합성 순서는 숫자 `depth`가 소유한다. `default-mock`의 `far/mid/near`는 최소 예제이며 더 세분화된 package를 제한하지 않는다.
- 상대 PNG 경로만 허용하고 asset directory 이탈을 거부한다.
- `formatVersion: 1`, 5개 zone, backdrop layer, terrain material, terrain Block Pool 대응표, decoration group을 필수로 요구한다.
- Runtime은 world seed·surface hash로 decoration item을 자동 배치하지 않는다. 배경 세부는 authored backdrop에 포함하고 독립 객체는 Map Editor world object로 명시한다.
- authored package 선택은 `AuthoredAreaEnvironmentCatalog`의 stable Area ID가 소유하며 Boss 전용 terrain package는 stable Boss Stage ID가 소유한다.
- 일반 맵은 Player의 현재 Area package를 사용한다. Boss source Area는 Boss encounter가 `active`인 동안 backdrop 기준을 override하고, stable Boss Stage ID에 전용 terrain package가 있으면 `bossStageId`를 가진 Arena 표면만 그 terrain material을 사용한다. 개별 edge atlas가 준비되지 않은 표면은 collision polygon 외곽선으로 복구하고 draw를 중단하지 않는다.
- terrain preset/variant는 package의 역할→preset 대응표와 `sectorId + surface.kind + stable surface.id`로 resolver가 고른다. `AREA-SPEC`과 Map Editor는 terrain skin field를 소유하지 않는다.
- Sector 01→02, Sector 02→03, Sector 03→04, Sector 04→05, Sector 05→06 전환은 `PixelBackdropRenderer`가 Player world Y에서만 파생한 비율로 양쪽 backdrop과 sky를 교차 합성한다. Sector 05→06만 나가는 Sector 05 package 전체에 같은 alpha와 증가하는 blur를 적용하고 들어오는 Sector 06 package는 blur 없이 합성한다. gameplay·camera·network state나 collision을 추가하지 않는다.
- player animation definition/schema에 환경 의미를 넣지 않는다.
