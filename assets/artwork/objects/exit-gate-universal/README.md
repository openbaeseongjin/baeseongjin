# Exit Gate Universal

## 핵심 목표

- Asset ID: `exit-gate-universal`
- Category: `objects`
- 용도: Sector 01~06 공용 출구문의 잠금·열림 상태 시각 리소스
- 역할: 상호작용 가능한 출구의 시각 표현. 충돌·통과 판정은 그래픽과 별도 계약이다.
- 상태: `64×64 AUTHORING EXPORT · RUNTIME CONSUMED · NO DEDICATED VALIDATOR`

## 표현 계약

- 흑연색·철색 벌크헤드와 제한된 Amber 잠금 표시·Cyan service light를 사용한다.
- 닫힌 두 문짝, 중앙 seam, 수평 잠금 바로 `closed / locked`를 색과 무관하게 구분한다.
- `opened`는 잠금 바와 중앙 문짝이 사라지고 양옆에 접힌 문짝과 투명한 중앙 개구부가 드러난다.
- 특정 Sector의 배관·주거·상점·보안·옥상 구조 문법과 대표 강조색을 사용하지 않는다.
- 정면 단일 오브젝트이며 저작 기준점은 `bottom-center`, 하단은 출구 데크 바닥에 맞춘다.
- 제작 캔버스는 `64×64 RGBA`, 실제 불투명 영역은 `(6, 2)~(57, 63)`의 `52×62`다. 현재 Runtime mock의 `52×62` 상대 크기와 바닥 접촉을 보존한다.
- 외곽 프레임·두 문짝·중앙 seam·수평 잠금 바·상단 service header만 남기고 고해상도 내부 패널선은 제거했다.

## 상태 맵

| 상태 | 형태 계약 | 파일 |
| --- | --- | --- |
| `closed / locked` | 중앙에서 맞물린 두 문짝과 수평 잠금 바 | `export/exit-gate-universal-64x64.png` |
| `opened` | 양옆에 접힌 문짝과 중앙 투명 개구부, 잠금 바 없음 | `export/exit-gate-universal-opened-64x64.png` |

## 파일

- `source/exit-gate-universal-imagegen-v1.png`: 최초 ImageGen 원본 (`1146×1373 RGBA`)
- `source/exit-gate-universal-imagegen-v2-cleanup.png`: 배경 잔상 제거 편집 원본 (`1199×1312 RGBA`)
- `source/generation-prompt-v1.txt`: 최초 생성 프롬프트
- `source/generation-prompt-v2-cleanup.txt`: 배경 정리 편집 프롬프트
- `source/build-exit-gate-universal.cjs`: 제한 팔레트 `64×64` 픽셀 재저작 원본
- `export/exit-gate-universal-64x64.png`: 실제 크기 투명 PNG authoring export
- `export/exit-gate-universal-opened-64x64.png`: 열림 상태 실제 크기 투명 PNG authoring export
- `preview/exit-gate-universal-concept-v1.png`: 현재 검토용 콘셉트
- `preview/exit-gate-universal-64x64-review.png`: 최근접 보간 `8×` 검수 이미지 (`512×512`)
- `preview/exit-gate-universal-opened-64x64-review.png`: 열림 상태 최근접 보간 `8×` 검수 이미지 (`512×512`)
- `preview/exit-gate-universal-states-review.png`: 닫힘→열림 상태 비교 이미지 (`1056×512`)

## 제작 기록

- 도구: OpenAI built-in `image_gen`, Node.js `v24.19.0` built-in `zlib`
- 제작일: 2026-08-24
- 입력 이미지·외부 레퍼런스: 없음. V2는 V1만 편집 입력으로 사용했다.
- 외부 라이선스 자료: 없음
- 생성물 사용 조건: 프로젝트 사용 전 OpenAI 생성물 이용 조건과 저장소 배포 정책을 확인한다.
- 재생성: `node source/build-exit-gate-universal.cjs`

## 검증 상태

- 두 export 모두 크기 `64×64`, RGBA, alpha 값 `0/255`만 사용, 반투명 픽셀 `0`개를 확인했다.
- 두 상태 모두 불투명 경계 `(6, 2)~(57, 63)`을 유지한다. 닫힘은 `11`색, 열림은 `8`색이다.
- 실제 `1×`와 최근접 보간 `8×`에서 닫힌 문짝·잠금 바와 열린 중앙 개구부가 색 없이도 구분되고 바닥 접점이 흔들리지 않음을 확인했다.
- 중간 열림 animation은 제작하지 않았다.
- Sector 01~06 공용 `world-object:gate` presentation의 닫힘·열림 상태로 Runtime에 연결했다.

## Runtime 연결

- 승격 경로: `assets/runtime/objects/exit-gate-universal/gate-closed.png`, `gate-opened.png`
- 로더 경계: `RuntimeAssetCatalog`와 `WorldObjectSpriteAssetCatalog`
- 좌표 기준점: authored `bottom-center`; PNG의 마지막 불투명 행이 출구 데크 접점과 일치한다.
- 상태 권위: 공용 Gate의 `gateUnlocked`가 `closed`와 `opened` sprite를 선택한다.
- 로드 실패: 같은 bounds와 anchor를 쓰는 기존 Sector별 Canvas Gate mock으로 fallback한다.
- PNG 교체로 collision·trigger·interaction·objective·network 상태를 변경하지 않는다.

## 비범위

- renderer·catalog·collision·interaction·network 변경
- 닫힘과 열림 사이의 중간 animation 제작
