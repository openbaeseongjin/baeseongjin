# Gate Control Panel Universal Runtime Asset

## 계약

- Category: `objects`
- Asset ID: `gate-control-panel-universal`
- Presentation ID: `world-object:gate-panel`
- 상태 파일: `panel-closed.png`, `panel-opened.png`
- 크기: 상태별 `48×48 RGBA`
- 좌표 기준점: `bottom-center`
- 상태: `RUNTIME CONSUMED · NO DEDICATED OBJECT VALIDATOR`

Sector 01~06의 출구문 조작 패널은 같은 중립 외형을 사용한다. `blocked / idle / ready`는 `closed`, Gate 해제 또는 해당 objective 완료는 `opened`를 선택한다. authored position·interaction radius·objective·Gate 진행·network 상태는 이 package가 소유하지 않는다.

## 출처와 정규화

- Authoring source: `assets/artwork/objects/gate-control-panel-universal/`
- Runtime PNG는 대응 authoring export를 픽셀 변경 없이 복사한다.
- OpenAI built-in `image_gen` 원본을 Node.js built-in `zlib` 기반 저작 스크립트로 제한 팔레트 `48×48` RGBA에 정규화했다.
- 두 상태의 불투명 경계는 `(7, 3)~(40, 47)`이며 alpha는 `0/255`만 사용한다.
- 외부 레퍼런스와 외부 라이선스 자료는 사용하지 않았다.

## 로드와 fallback

- `RuntimeAssetCatalog`가 package URL을 만들고 `WorldObjectSpriteAssetCatalog`가 상태별 실제 `48×48` 크기를 검증한다.
- 준비 완료 전 또는 해당 상태 로드 실패 시 기존 Sector별 Canvas Gate Panel mock을 그린다.
- sprite와 fallback은 같은 presentation bounds와 authored anchor를 사용한다.

## 검증

- 두 PNG의 크기·RGBA·alpha·불투명 경계·authoring/runtime SHA-256 일치
- Sector 01~06의 공용 presentation ID 사용 여부
- 데스크톱·모바일 실제 브라우저에서 닫힘·열림과 bottom-center 접지 확인
- 강제 로드 실패 시 Canvas fallback 확인
