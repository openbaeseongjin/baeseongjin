# 환경 도트 에셋 교환 형식

이 문서는 배경·지형 표면·비충돌 장식을 정식 도트 리소스로 교체할 때 사용하는 현재 기준이다. 캐릭터 애니메이션 입력은 [`sprite-asset-format.md`](./sprite-asset-format.md)를 따르며 환경 manifest와 섞지 않는다.

그래픽 담당자는 먼저 [`graphics-asset-guide.md`](./graphics-asset-guide.md)에서 공통 작업 위치와 가독성 기준을 확인하고 `assets/artwork/environments/<asset-id>/`에 납품한다. 담당 개발자는 환경 pack을 runtime 경로로 정규화할 때 이 문서의 전체 계약을 따른다.

현재 이미지는 구조 검증용 mock이다. 폐쇄형 수직 기업도시와 고도별 구역이라는 기획은 유지하지만 구체 건물·장애물·색감은 후속 기획에서 확정한다. 참고 이미지에서는 어두운 실루엣, 큰 여백, 제한된 인공 조명, 다층 시차 같은 도트 표현 방식만 가져온다.

## 에이전트 작업 진입점

환경 리소스를 만들거나 교체하는 개발자와 AI 에이전트는 다음 순서로 작업한다.

1. 이 문서와 [`../assets/runtime/environments/sprite-manifest.schema.json`](../assets/runtime/environments/sprite-manifest.schema.json)을 읽는다.
2. [`../assets/runtime/environments/default-mock/`](../assets/runtime/environments/default-mock/)을 `assets/runtime/environments/<environment-id>/`로 복사해 PNG와 `sprite-manifest.json`을 교체한다.
3. `npm run validate:environment-assets -- <asset-directory>`를 실행한다. 기본 mock을 검사할 때는 인자를 생략해도 된다.
4. validator가 통과한 디렉터리만 renderer catalog에 연결한다.
5. 설정 버튼을 1초 길게 눌러 디버그 수치 표시를 켠 뒤 fallback component와 atlas ID가 남지 않는지 확인하고 데스크톱·모바일 실제 화면을 검증한다.

## 디렉터리 계약

```text
environment-pack/
├─ sprite-manifest.json
├─ backdrop-far.png
├─ backdrop-mid.png
├─ backdrop-near.png
├─ terrain-fill.png
├─ terrain-edge.png
└─ decoration.png
```

파일명과 atlas 개수는 예시와 달라도 된다. manifest가 상대 경로와 atlas ID를 명시하면 한 component가 여러 atlas를 사용하거나 여러 component가 같은 atlas를 참조할 수 있다. PNG는 manifest 디렉터리 안에 있어야 하며 절대 경로, URL, `..`, Windows 역슬래시는 허용하지 않는다.

## 지원 범위

| 항목 | 현재 지원 |
| --- | --- |
| 이미지 | 투명도를 포함한 PNG |
| atlas 수 | 하나 이상, ID 기반 다중 atlas |
| atlas 배열·배치 | atlas별 `size`, `frameSize`와 frame의 0 기반 `column`·`row` |
| frame 수·순서 | backdrop layer와 decoration item 배열에서 가변 |
| 출력 크기 | backdrop의 `tileWidth`·`peakHeight`, decoration item의 `size`로 원본 셀과 분리 |
| 고도 구역 | 실제 8,880m 월드 범위 안의 `waste` 0m, `industrial-maintenance` 1,800m, `residential-commercial` 3,600m, `corporate-security` 5,400m, `landing-pad` 7,200m |
| 배경 | package별 1~6개 layer의 atlas, frame 배열, 수평·수직 parallax, 기준선과 높이 |
| 지형 | 구역별 fill·edge frame과 one-way edge 색 |
| 장식 | 구역별 item 배열, frame, depth, 표면 기준 offset, 출력 크기 |
| 진단 | backdrop·terrain·decoration별 독립 준비/실패 상태와 실패 atlas ID |

현재 runtime 입력으로 GIF·WebP·PSD·ASE·프로그램 고유 프로젝트 파일은 지원하지 않는다. 이 형식들은 제작 원본이나 미리보기로만 보관하고 최종 입력을 PNG와 표준 JSON으로 내보낸다. frame duration과 상태 전이는 캐릭터 애니메이션 계약이며 환경 manifest에는 넣지 않는다.

배열 길이와 atlas 분할 방식은 바꿀 수 있다. 다만 새 field나 component 종류를 추가하면 loader, JSON Schema, example, validator, 이 문서를 같은 변경으로 갱신해야 한다. renderer가 PixelLab·SpriteCook 같은 도구 이름이나 파일명 규칙을 분기해서는 안 된다.

## 통이미지 + Depth Map 기본 배경 제작 계약

새 파라락스 배경은 기본적으로 같은 캔버스에 정렬된 두 authoring 입력을 만든다.

1. 모든 색과 구도를 가진 불투명 RGB master
2. 흰색이 가까움, 검은색이 멀어짐인 8-bit grayscale depth map

자동 import는 depth map의 큰 차이를 이용해 가까운 연결 구조를 최대 2개의 좌·우 RGBA island로 추출한다. 작은 간판·창·배선이 독립 component로 흩어지거나 두 island가 중앙 이동 여백을 가로질러 연결되면 검수 실패다. island가 가리던 영역은 별도 inpaint 입력으로 fixed background에 미리 복원하고, mask 밖 master pixel은 보존한다. 중립 위치에서 `fixed + islands`는 master와 픽셀 단위로 같아야 하며 작은 정수 이동 preview에서 투명 구멍이나 복제 seam이 없어야 한다.

depth map과 추출 threshold·component 최소 크기·재현 스크립트는 `assets/artwork/environments/<asset-id>/`에 보관한다. Runtime package에는 정규화가 끝난 fixed RGB PNG와 RGBA island PNG만 넣고 depth map을 매 프레임 해석하지 않는다. `getImageData`, per-frame pixel loop·mask 생성·texture 재생성이나 이 기능만을 위한 WebGL 경로는 지원 계약이 아니다. 추출이 불안정하면 fixed 단독 또는 검수된 수동 layer 분리로 fallback한다.

backdrop은 1~6개 layer를 허용한다. 각 layer `id`는 package 안에서 유일한 kebab-case 안정 ID이며 합성 순서는 배열 위치가 아니라 숫자 `depth`가 소유한다. `far/mid/near`는 default mock의 최소 예제일 뿐 필수 ID 집합이 아니다.

현재 authored package의 Sector 01→02, Sector 02→03, Sector 03→04 경계는 `PixelBackdropRenderer`가 Player world Y에서 파생한 단일 smoothstep 비율로 양쪽 package 전체와 sky를 교차 합성한다. 한 package의 far/mid/near는 항상 같은 alpha를 사용해 경계에서 레이어별 잔상이나 건물 분리를 만들지 않는다. Boss Stage 환경 Area는 Stage status가 `active`일 때만 현재 Area를 override한다. 이 표현 전환은 content boundary 사이의 collision, Gate, Camera, gameplay connector 또는 network state를 새로 만들지 않는다.

## manifest 구조

최상위 필드는 다음과 같다.

```json
{
  "$schema": "../sprite-manifest.schema.json",
  "formatVersion": 1,
  "id": "environment-default-mock",
  "generator": { "tool": "manual-mock", "exportVersion": null },
  "atlases": {},
  "zones": [],
  "backdrop": { "layers": [] },
  "terrain": { "materials": {} },
  "decoration": { "groups": {} }
}
```

- `formatVersion`은 현재 `1`이다. 알 수 없는 버전과 알 수 없는 field는 거부한다.
- `generator`는 추적용 정보일 뿐 runtime 분기 조건이 아니다.
- `atlases` key가 안정적인 atlas ID다. frame은 파일 경로가 아니라 이 ID를 참조한다.
- backdrop layer `id`는 package 안에서 유일한 kebab-case이고 layer 수는 1~6개다. renderer는 숫자 `depth` 오름차순으로 합성한다.
- backdrop layer나 decoration group에 atlas를 중복 지정하지 않는다. 각 frame이 자기 atlas ID를 가지므로 한 component와 한 배열 안에서도 여러 atlas를 섞을 수 있다.
- `size`는 실제 PNG 전체 크기, `frameSize`는 균일 grid 셀 크기다. 모두 양의 정수이고 전체 크기는 셀 크기로 나누어떨어져야 한다.
- frame의 `column`과 `row`는 왼쪽 위부터 시작하는 0 기반 좌표이며 선언된 grid 밖을 참조할 수 없다.
- zone의 `minAltitude`는 실제 `WORLD_CONFIG`의 약 8,880m 등반 범위 안에서 오름차순으로 정규화한다. 배경 밝기는 구역 전환과 별개로 월드 하단에서 정상까지 연속적이고 단조롭게 증가한다.

전체 field와 제한은 JSON Schema와 example manifest가 실행 가능한 기준이다. 문서 예시와 충돌하면 validator가 사용하는 schema·loader 계약을 먼저 맞춘 뒤 문서를 함께 고친다.

## PixelLab·SpriteCook 전달 형식

둘 중 어떤 도구를 사용해도 최종 인계 묶음은 다음 형태가 가장 안전하다.

- 투명 배경 PNG atlas 또는 순서가 명확한 개별 PNG frame
- 각 이미지의 실제 가로·세로와, atlas인 경우 한 셀의 가로·세로
- frame이 들어 있는 0 기반 행·열 또는 원본 frame 순서
- backdrop layer, terrain fill·edge, decoration 중 각 리소스의 역할
- 원하는 월드 출력 크기와 parallax·기준선 정보
- 도구가 내보낸 JSON이나 프로젝트 파일은 선택 자료로 포함
- 사용한 생성 도구와 버전, 라이선스·출처 정보

개별 PNG만 받았으면 import adapter가 atlas로 묶고 표준 manifest를 만든다. 도구 JSON의 배열명·tag·animation 속성은 그대로 runtime에 전달하지 않고 이 문서의 ID·grid·component 구조로 정규화한다. atlas를 여러 장으로 나누는 것은 지원 범위이며 frame 참조만 안정적인 ID를 유지하면 된다.

## 렌더링과 충돌 경계

- backdrop, collision-aligned terrain skin, non-collision decoration은 독립 하위 renderer component다. 상위 composer는 고정 순서로 호출할 뿐 profile이나 구체 장식 종류를 분기하지 않는다.
- terrain은 기존 `WorldGenerator`의 surface polygon 내부만 clip해 채운다. 보이는 외곽선과 one-way edge chain도 같은 collision vertices와 `oneWayEdgeEnd`를 사용한다. 에셋 교체가 충돌체를 바꾸지 않는다.
- decoration은 충돌을 만들지 않는다. 이동 경로 위에 단단한 발판이나 통과 가능한 벽처럼 오해할 전경을 두지 않고 배경 또는 traversal surface 바깥에만 배치한다.
- 동일 world seed와 scene snapshot은 같은 장식 배치를 만든다. `draw()`에서 `Math.random()`을 호출하지 않는다.
- 싱글과 멀티는 같은 scene renderer 경로를 사용한다. 앱에 모드별 환경 로직이나 renderer type 분기를 추가하지 않는다.
- terrain은 collision surface bounds와 edge geometry를 world가 바뀔 때만 다시 만들고, decoration은 seed·zone별 배치를 캐시한다. camera 이동 때는 공통 viewport와 교차하는 surface·edge·decoration만 그리며 이 최적화가 collision polygon이나 결정 배치를 바꾸면 안 된다.

## 독립 fallback과 진단

atlas 준비와 실패는 backdrop, terrain, decoration이 각각 판단한다.

- backdrop atlas만 실패하면 기존 polygon backdrop만 대신 그리고 terrain·decoration은 계속 도트로 그린다.
- terrain atlas만 실패하면 기존 collision geometry만 대신 그린다.
- decoration atlas만 실패하면 장식만 생략한다. 충돌이나 다른 환경 component에는 영향이 없다.
- 아직 로딩 중인 `pending`은 실패로 보고하지 않는다. 실제 load/크기 검증 실패로 전환할 때 한 번만 console 경고를 남긴다.
- 디버그 수치 표시는 실패한 component와 관련 atlas ID를 표시한다.

전체 scene이나 캐릭터 renderer로 fallback하는 것은 환경 component 실패 규칙이 아니다. 이 경계를 바꾸면 partial-failure 테스트와 실제 화면 진단을 함께 갱신한다.

## 검증 체크리스트

- 모든 PNG signature와 실제 크기가 manifest와 일치한다.
- 모든 atlas ID와 frame grid 참조가 존재하고 범위 안이다.
- 5개 zone이 하단부터 정상까지 연결되고 밝기가 고도에 따라 감소하지 않는다.
- terrain fill과 edge가 collision polygon·one-way edge chain을 정확히 따른다.
- 같은 seed에서 decoration 배치가 같다.
- camera 밖 surface·edge·decoration은 그리지 않고 다시 화면에 들어오면 같은 위치·frame으로 복원된다.
- 각 component atlas를 따로 실패시켰을 때 해당 component만 fallback한다.
- 기본 `sprite`와 `?renderer=polygon`, 싱글과 멀티가 같은 게임 상태·충돌·네트워크 계약을 유지한다.
- 데스크톱과 모바일에서 하단·중단·정상 구역을 실제 화면으로 확인한다.
