# Gate Control Panel Universal

## 핵심 목표

- Asset ID: `gate-control-panel-universal`
- Category: `objects`
- 용도: Sector 01~06 공용 출구문 조작 패널의 대기·차단·열림 상태 시각 리소스
- 역할: 상호작용 가능. 충돌·활성 반경·Gate 진행 판정은 그래픽과 별도 계약이다.
- 상태: `48×48 AUTHORING EXPORT · RUNTIME CONSUMED · NO DEDICATED VALIDATOR`

## 표현 계약

- 흑연색·철색 본체와 제한된 Amber 상태 bar·Cyan service light를 사용한다.
- 큰 매입 화면, 닫힌 actuator cover, 좁은 pedestal과 넓은 foot의 네 덩어리만 우선해 읽힌다.
- `opened`는 한 장의 actuator cover가 양옆으로 갈라지고 중앙 core가 노출된다.
- 특정 Sector의 배관·주거·상점·보안·옥상 구조 문법과 대표 강조색을 사용하지 않는다.
- 정면 단일 오브젝트이며 저작 기준점은 `bottom-center`, 하단은 출구 데크 바닥에 맞춘다.
- 제작 캔버스는 `48×48 RGBA`, 실제 불투명 영역은 `(7, 3)~(40, 47)`의 `34×45`다. 플레이어보다 약간 작은 실루엣과 바닥 접촉을 보존한다.
- 매입 화면·닫힌 actuator cover·좁은 pedestal·넓은 foot만 남기고 고해상도 볼트와 내부 패널선은 제거했다.
- 향후 `ready`도 actuator cover·화면 구획·표시 리듬의 형태 변화로 구분하고 색만 바꾸지 않는다.

## 상태 맵

| 상태 | 형태 계약 | 파일 |
| --- | --- | --- |
| `blocked / idle` | 닫힌 한 장 actuator cover와 비활성 화면 | `export/gate-control-panel-universal-48x48.png` |
| `opened` | 양옆으로 갈라진 cover와 노출된 중앙 core | `export/gate-control-panel-universal-opened-48x48.png` |

## 파일

- `source/gate-control-panel-universal-imagegen-v1.png`: 최초 ImageGen 원본 (`1207×1303 RGBA`)
- `source/generation-prompt-v1.txt`: 최초 생성 프롬프트
- `source/build-gate-control-panel-universal.cjs`: 제한 팔레트 `48×48` 픽셀 재저작 원본
- `export/gate-control-panel-universal-48x48.png`: 실제 크기 투명 PNG authoring export
- `export/gate-control-panel-universal-opened-48x48.png`: 열림 상태 실제 크기 투명 PNG authoring export
- `preview/gate-control-panel-universal-concept-v1.png`: 현재 검토용 콘셉트
- `preview/gate-control-panel-universal-48x48-review.png`: 최근접 보간 `8×` 검수 이미지 (`384×384`)
- `preview/gate-control-panel-universal-opened-48x48-review.png`: 열림 상태 최근접 보간 `8×` 검수 이미지 (`384×384`)
- `preview/gate-control-panel-universal-states-review.png`: 차단→열림 상태 비교 이미지 (`800×384`)

## 제작 기록

- 도구: OpenAI built-in `image_gen`, Node.js `v24.19.0` built-in `zlib`
- 제작일: 2026-08-24
- 입력 이미지·외부 레퍼런스: 없음
- 외부 라이선스 자료: 없음
- 생성물 사용 조건: 프로젝트 사용 전 OpenAI 생성물 이용 조건과 저장소 배포 정책을 확인한다.
- 재생성: `node source/build-gate-control-panel-universal.cjs`

## 검증 상태

- 두 export 모두 크기 `48×48`, RGBA, alpha 값 `0/255`만 사용, 반투명 픽셀 `0`개를 확인했다.
- 두 상태 모두 불투명 경계 `(7, 3)~(40, 47)`을 유지한다. 차단은 `12`색, 열림은 `8`색이다.
- 실제 `1×`와 최근접 보간 `8×`에서 닫힌 한 장 cover와 갈라진 cover·노출 core가 색 없이도 구분되고 바닥 접점이 흔들리지 않음을 확인했다.
- 별도 `ready` 형태와 중간 조작 animation은 제작하지 않았다. `blocked / idle / ready`는 닫힌 형태를 공유한다.
- Sector 01~06 공용 `world-object:gate-panel` presentation의 닫힘·열림 상태로 Runtime에 연결했다.

## Runtime 연결

- 승격 경로: `assets/runtime/objects/gate-control-panel-universal/panel-closed.png`, `panel-opened.png`
- 로더 경계: `RuntimeAssetCatalog`와 `WorldObjectSpriteAssetCatalog`
- 좌표 기준점: authored `bottom-center`; PNG의 마지막 불투명 행이 출구 데크 접점과 일치한다.
- 상태 권위: 공용 Panel renderer의 `opened` 상태가 `closed`와 `opened` sprite를 선택한다.
- 로드 실패: 같은 bounds와 anchor를 쓰는 기존 Sector별 Canvas Panel mock으로 fallback한다.
- PNG 교체로 interaction radius·objective·Gate 진행·network 상태를 변경하지 않는다.

## 비범위

- renderer·catalog·collision·interaction·network 변경
- `ready` 상태와 중간 조작 animation 제작
