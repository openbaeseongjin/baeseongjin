# Story Display Universal Runtime Asset

## 계약

- Category: `objects`
- Asset ID: `story-display-universal`
- Presentation ID: `world-object:story-display`
- 파일: `story-display.png`
- 크기: `64×48 RGBA`
- 상태: `RUNTIME CONSUMED · NO DEDICATED OBJECT VALIDATOR`

Sector 01~06의 `story-display`는 같은 정적 정보 패널 외형을 사용한다. authored position과 `coordinateAnchor`가 배치를 소유하며, 발판 위 pedestal은 `bottom-center`와 발판 상단 Y를 공유하고 벽 rail은 `center`를 유지한다. 이 package는 collision, interaction, 문구, cue 또는 network 상태를 소유하지 않는다.

현재 authored instance는 Sector 02의 4개, Sector 03의 28개, Sector 05의 4개다. Sector 01·04·06에는 아직 instance가 없으며, 이후 추가되는 객체도 공용 `world-object:story-display` presentation ID를 통해 같은 package를 사용한다.

## 출처와 정규화

- Authoring source: `assets/artwork/objects/story-display-universal/`
- Runtime PNG는 authoring export를 픽셀 변경 없이 복사한다.
- OpenAI built-in `image_gen` 원본을 Node.js `pngjs`와 `sharp`로 `64×48` 제한 팔레트 RGBA에 정규화했다.
- 외부 레퍼런스와 외부 라이선스 자료는 사용하지 않았다.

## 로드와 fallback

- `RuntimeAssetCatalog`가 package URL을 만들고 `WorldObjectSpriteAssetCatalog`가 실제 `64×48` 크기를 검증한다.
- 준비 완료 전 또는 로드 실패 시 `AuthoredWorldObjectRenderer`가 기존 mock 패널을 그린다.
- sprite와 fallback은 같은 `world-object:story-display` bounds와 authored anchor를 사용한다. PNG의 마지막 불투명 행은 바닥형 `bottom-center` 접점과 일치한다.

## 검증

- PNG 크기·RGBA·alpha·팔레트 검증
- `npm run check`
- `npm run format:check`
- `git diff --check`
- 실제 브라우저에서 기본 sprite와 강제 실패 fallback을 확인한다.
- Stage 3-4 데스크톱 `1280×720`과 모바일 `390×844`에서 실제 크기 가독성을 확인했다.
