# Exit Gate Universal Runtime Asset

## 계약

- Category: `objects`
- Asset ID: `exit-gate-universal`
- Presentation ID: `world-object:gate`
- 상태 파일: `gate-closed.png`, `gate-opened.png`
- 크기: 상태별 `64×64 RGBA`
- 좌표 기준점: `bottom-center`
- 상태: `RUNTIME CONSUMED · NO DEDICATED OBJECT VALIDATOR`

Sector 01~06의 출구문은 같은 중립 외형을 사용한다. `gateUnlocked`가 false면 `closed`, true면 `opened`를 선택한다. authored position·Gate trigger·collision·objective·portal·network 상태는 이 package가 소유하지 않는다.

## 출처와 정규화

- Authoring source: `assets/artwork/objects/exit-gate-universal/`
- Runtime PNG는 대응 authoring export를 픽셀 변경 없이 복사한다.
- OpenAI built-in `image_gen` 원본을 Node.js built-in `zlib` 기반 저작 스크립트로 제한 팔레트 `64×64` RGBA에 정규화했다.
- 두 상태의 불투명 경계는 `(6, 2)~(57, 63)`이며 alpha는 `0/255`만 사용한다.
- 외부 레퍼런스와 외부 라이선스 자료는 사용하지 않았다.

## 로드와 fallback

- `RuntimeAssetCatalog`가 package URL을 만들고 `WorldObjectSpriteAssetCatalog`가 상태별 실제 `64×64` 크기를 검증한다.
- 준비 완료 전 또는 해당 상태 로드 실패 시 기존 Sector별 Canvas Gate mock을 그린다.
- sprite와 fallback은 같은 presentation bounds와 authored anchor를 사용한다.

## 검증

- 두 PNG의 크기·RGBA·alpha·불투명 경계·authoring/runtime SHA-256 일치
- Sector 01~06의 공용 presentation ID 사용 여부
- 데스크톱·모바일 실제 브라우저에서 닫힘·열림과 bottom-center 접지 확인
- 강제 로드 실패 시 Canvas fallback 확인
