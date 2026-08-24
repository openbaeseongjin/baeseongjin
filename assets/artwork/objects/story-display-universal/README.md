# Story Display Universal

## 핵심 목표

- Asset ID: `story-display-universal`
- Category: `objects`
- 용도: Sector 01~06 어디에서도 이질적이지 않은 비충돌 중간 정보 표지판 공용 콘셉트
- 상태: `64×48 AUTHORING EXPORT · RUNTIME CONSUMED · NO DEDICATED VALIDATOR`

## 표현 계약

- 단일 정면 정보 패널이며 특정 Sector의 건축 문법·대표 강조색·문구에 종속되지 않는다.
- 흑연색·철색 본체와 제한된 Cyan·Amber service indicator만 사용한다.
- 화면에는 실제 문자·숫자·로고를 굽지 않고 큰 정보 블록만 둔다.
- 36개 `story-display`의 공지·경로·보안·기록 의미는 Runtime presentation이 소유한다.
- 실제 논리 제작 크기는 `64×48 RGBA`이며 반투명 픽셀 없이 정수 픽셀 경계를 사용한다.
- 내부 디테일은 외곽 프레임·화면·두 정보 블록·양쪽 상태등·하부 bracket으로 제한한다.
- 벽 rail과 바닥 pedestal 어느 쪽에도 결합 가능한 중립 하부 bracket을 가진다.
- 정적 오브젝트 한 상태만 제공하며 화면의 의미별 내용은 별도 Runtime overlay가 소유한다.
- Sector 01~06은 공용 `world-object:story-display` presentation ID를 통해 같은 외형을 사용한다.

## 파일

- `source/story-display-universal-imagegen-v1.png`: 최초 ImageGen 원본 (`1448×1086 RGBA`)
- `source/story-display-universal-imagegen-v2-simplified.png`: 디테일 축소·투명 배경 ImageGen 원본 (`1536×1024 RGBA`)
- `source/generation-prompt-v1.txt`: 최초 생성 프롬프트
- `source/generation-prompt-v2.txt`: 단순화·배경 추출 프롬프트
- `source/build-story-display-universal.cjs`: 제한 팔레트 `64×48` 픽셀 정규화 원본
- `export/story-display-universal-64x48.png`: 실제 크기 authoring export
- `preview/story-display-universal-concept-v1.png`: 최초 콘셉트 검토 이미지
- `preview/story-display-universal-64x48-review.png`: 최근접 보간 `8×` 검수 이미지 (`512×384`)

## 제작 기록

- 도구: OpenAI built-in `image_gen`, Node.js `pngjs`, `sharp`
- 제작일: 2026-08-24
- 입력 이미지·외부 레퍼런스: 없음
- 외부 라이선스 자료: 없음
- 생성물 사용 조건: 프로젝트 사용 전 OpenAI 생성물 이용 조건과 저장소 배포 정책을 확인한다.
- 재생성: bundled Node module 경로를 `NODE_PATH`에 지정하고 `node source/build-story-display-universal.cjs`를 실행한다.

## 검증 상태

- export 크기 `64×48`, RGBA, alpha 값 `0/255`만 사용, 반투명 픽셀 `0`개 확인 완료
- 비투명 경계 `(1, 4)~(62, 45)`, 불투명 팔레트 `11`색 확인 완료
- 실제 `1×`와 최근접 보간 `8×`에서 정면 실루엣·무문자 화면·제한 팔레트 육안 확인 완료
- 이 저장소에는 일반 world-object 전용 Runtime asset contract·validator가 없어 Runtime 검증은 미수행
- Stage 3-4에서 실제 데스크톱 `1280×720`·모바일 `390×844` sprite 배치와 강제 로드 실패 fallback 검수 완료

## Runtime 연결

- 승격 경로: `assets/runtime/objects/story-display-universal/story-display.png`
- 로더 경계: `RuntimeAssetCatalog`와 `WorldObjectSpriteAssetCatalog`
- 좌표 기준점: 각 authored object의 기존 `coordinateAnchor`를 유지한다.
- 로드 실패: `AuthoredWorldObjectRenderer`의 기존 mock 패널로 독립 fallback한다.
- PNG 교체로 collision·interaction·story cue·network 상태를 변경하지 않는다.

## 비범위

- `story-display`별 문구·아이콘·상태 animation 제작
- authored `story-display`의 좌표·anchor·문구·cue 변경
- collision·interaction·network 변경
