# 스프라이트 리소스 교환 형식

이 문서는 PixelLab, SpriteCook 또는 수작업으로 만든 플레이어 캐릭터를 게임에 넣을 때 사용하는 현재 기준 형식이다. 도구의 원본 export는 입력 자료일 뿐이며, 런타임은 도구에 종속되지 않은 PNG atlas 묶음과 `sprite-manifest.json`을 소비한다. 상태 구성이 다른 일반 몹에는 이 player 계약을 재사용하지 않고 [`enemy-sprite-asset-format.md`](./enemy-sprite-asset-format.md)를 따른다.

그래픽 담당자는 먼저 [`graphics-asset-guide.md`](./graphics-asset-guide.md)에서 공통 작업 위치를, [`pixel-graphics-design-guide.md`](./pixel-graphics-design-guide.md)에서 캐릭터 제작 크기와 화면 위계를 확인하고, 캐릭터 프레임 수나 atlas 구조를 바꿀 때 이 문서의 전체 계약을 확인한다.

기본 mock은 SVG atlas 하나를 코드로 정의하지만 런타임은 `PlayerSpriteManifest.js`와 `SpriteImageAssetSet`을 통해 manifest 기반 multi-atlas 리소스도 읽는다. renderer는 현재 frame의 atlas ID로 이미지를 선택하며 생성 도구를 해석하지 않는다. 그래픽 담당자는 [`assets/runtime/characters/player-production-template/`](../assets/runtime/characters/player-production-template/)의 배치를 참고해 `assets/artwork/characters/<asset-id>/`에 납품하고, 담당 개발자가 production template을 runtime package로 복사해 정규화한다.

## AI 에이전트 작업 진입점

스프라이트를 생성하거나 교체하는 개발자와 AI 에이전트는 이 문서를 끝까지 읽은 뒤 다음 순서로 작업한다.

1. 작업이 PixelLab·SpriteCook 원본을 만드는 단계인지, 저장소 표준 리소스로 정규화하는 단계인지 구분한다.
2. 원본 생성 단계라면 아래 **도구별 원본 수령 형식**으로 export하고 원본을 임의로 재배열하지 않는다.
3. 정규화 단계라면 납품된 `assets/artwork/characters/<character-id>/export/`를 확인하고 `assets/runtime/characters/player-production-template/`을 `assets/runtime/characters/<character-id>/`로 복사해 `sprite-manifest.json`과 모든 PNG atlas를 함께 만든다.
4. 실제 PNG 크기, atlas ID·cell 범위, 여덟 animation 상태, duration·fallback과 collider 분리를 확인한다.
5. 결과 보고에 출력 경로, 생성 도구·버전, 원본에서 수행한 crop·padding·repacking, 검증 명령과 결과를 남긴다.

구현 기준 파일과 작업 시작점은 다음과 같다.

- JSON Schema: [`assets/runtime/characters/sprite-manifest.schema.json`](../assets/runtime/characters/sprite-manifest.schema.json)
- player production starter: [`assets/runtime/characters/player-production-template/`](../assets/runtime/characters/player-production-template/)
- schema·validator 계약 fixture: [`assets/runtime/characters/fixtures/player-multi-atlas/sprite-manifest.json`](../assets/runtime/characters/fixtures/player-multi-atlas/sprite-manifest.json)
- 런타임 loader: [`src/render/sprites/PlayerSpriteManifest.js`](../src/render/sprites/PlayerSpriteManifest.js)

에이전트는 production starter를 `<character-id>/` package로 복사해 PNG와 값을 교체하고 `$schema`를 `../sprite-manifest.schema.json`으로 맞춘 뒤 `npm run validate:sprite-assets -- <directory>`를 실행한다. JSON 파싱, 상대 PNG 경로, 실제 PNG 크기, atlas 격자·cell 범위, 여덟 상태 coverage, fallback 순환과 duration을 모두 통과해야 `runtime-ready`로 보고한다. `fixtures/player-multi-atlas`는 공개 계약 회귀용 fixture로 유지하며 아트 품질이나 현재 13개 pose의 기준으로 사용하지 않는다.

### 현재 production, starter와 fallback mock

- 현재 게임은 시작 시 `assets/runtime/characters/player-main/sprite-manifest.json`을 읽어 싱글·멀티 player renderer에 주입한다. manifest 로딩·파싱 실패 때만 `assets/runtime/characters/player-mock/player-action-mock.svg`의 내장 definition으로 복구한다.
- `assets/runtime/characters/player-production-template/`은 그 mock의 13개 distinct frame, timing과 presentation cue를 정식 PNG multi-atlas 형식으로 옮긴 복사 가능한 starter다.
- 그래픽 담당자의 결과물은 `assets/artwork/characters/<character-id>/`에 두고, 개발자가 정규화한 runtime package만 `assets/runtime/characters/<character-id>/`에 둔다.
- 다른 character package를 sibling 폴더에 추가하는 것만으로 기본 캐릭터가 바뀌지는 않는다. 기본 package를 바꿀 때는 catalog의 manifest URL과 bootstrap 주입 경계를 함께 갱신한다.

### 작업 요청 템플릿

다른 개발자나 AI 에이전트에는 다음 정보를 한 번에 전달한다.

```text
docs/sprite-asset-format.md를 전부 읽고 <character-id> 리소스를 준비한다.
원본: <PixelLab character ZIP | SpriteCook PNG sheets/frames | manual PNG frames>
필수 상태: idle, run, jump, fall, rope, hit, death, respawn
정식 제작 프레임: 32×32~48×48, 액션 확장: 48×48~64×64
현재 starter: 24×24 개발 mock 배치, 기본 방향: right, 기본 출력: 48×48
출력: <target-directory>/sprite-manifest.json + manifest가 참조하는 모든 PNG atlas
금지: collider/physics/network 설정 포함, GIF/WebP 런타임 사용, renderer의 도구별 분기
완료 보고: 생성 파일, 사용 도구·버전, 정규화 내용, validator 결과
검증: npm run validate:sprite-assets -- <target-directory>
```

## 전달받을 파일

정식 리소스는 다음 묶음으로 받는다.

```text
player-main/
├─ sprite-manifest.json
├─ locomotion.png
├─ actions.png
└─ source/                 # 선택 사항, 런타임에서 읽지 않음
   └─ original-export.zip
```

- 런타임 이미지는 투명 배경의 PNG로 받는다. GIF와 WebP는 미리보기로만 사용한다.
- 캐릭터 하나가 여러 atlas PNG를 사용할 수 있다. atlas마다 이미지 크기와 격자가 달라도 된다.
- 각 atlas는 여백과 셀 사이 간격이 없는 균일 격자로 정규화한다. 불규칙하게 packing된 도구 출력은 import 단계에서 다시 packing한다.
- 현재 개발 mock과 production starter는 24×24픽셀 논리 프레임을 사용한다. 정식 player 제작 크기는 `pixel-graphics-design-guide.md`의 32×32~48×48 기준을 따르며 액션 프레임은 48×48~64×64로 확장할 수 있다. starter와 다른 크기를 쓰면 PNG atlas와 manifest의 `size`·`frameSize`를 함께 바꾸고 원본을 비정수 배율로 축소하지 않는다.
- 파일명, atlas 개수, 프레임 순서와 프레임 개수는 고정 계약이 아니다. manifest의 ID 참조만 계약으로 삼는다.

## manifest v2

다음은 두 atlas를 사용하는 설명용 예다. 결과물은 이 코드 블록을 옮겨 적지 말고 위의 machine-readable example manifest를 복사해 만든다.

```json
{
  "formatVersion": 2,
  "id": "player-main",
  "generator": {
    "tool": "spritecook",
    "exportVersion": null,
    "sourceExport": "source/original-export.zip"
  },
  "render": {
    "facing": "right",
    "size": { "width": 48, "height": 48 },
    "anchor": { "x": 0.5, "y": 0.625 },
    "offset": { "x": 0, "y": 0 },
    "pixelSnap": true
  },
  "atlases": {
    "locomotion": {
      "image": "locomotion.png",
      "size": { "width": 96, "height": 48 },
      "frameSize": { "width": 24, "height": 24 }
    },
    "actions": {
      "image": "actions.png",
      "size": { "width": 96, "height": 24 },
      "frameSize": { "width": 24, "height": 24 }
    }
  },
  "animations": {
    "idle": {
      "loop": true,
      "frames": [
        { "atlas": "locomotion", "cell": { "column": 0, "row": 0 }, "durationMs": 360 },
        { "atlas": "locomotion", "cell": { "column": 1, "row": 0 }, "durationMs": 360 }
      ]
    },
    "run": {
      "loop": true,
      "frames": [
        { "atlas": "locomotion", "cell": { "column": 2, "row": 0 }, "durationMs": 100 },
        { "atlas": "locomotion", "cell": { "column": 3, "row": 0 }, "durationMs": 100 }
      ]
    },
    "jump": {
      "loop": false,
      "frames": [
        { "atlas": "locomotion", "cell": { "column": 0, "row": 1 }, "durationMs": 180 }
      ]
    },
    "fall": {
      "loop": false,
      "frames": [
        { "atlas": "locomotion", "cell": { "column": 1, "row": 1 }, "durationMs": 180 }
      ]
    },
    "rope": {
      "loop": true,
      "frames": [
        { "atlas": "locomotion", "cell": { "column": 2, "row": 1 }, "durationMs": 140 },
        { "atlas": "locomotion", "cell": { "column": 3, "row": 1 }, "durationMs": 140 }
      ]
    },
    "hit": {
      "loop": false,
      "frames": [
        { "atlas": "actions", "cell": { "column": 0, "row": 0 }, "durationMs": 120 },
        { "atlas": "actions", "cell": { "column": 1, "row": 0 }, "durationMs": 120 }
      ],
      "cue": {
        "scale": { "x": 1.12, "y": 0.9 },
        "offset": { "x": -2, "y": 1 },
        "opacity": 0.92
      }
    },
    "death": { "fallback": "respawn" },
    "respawn": {
      "loop": false,
      "frames": [
        { "atlas": "actions", "cell": { "column": 2, "row": 0 }, "durationMs": 150 },
        { "atlas": "actions", "cell": { "column": 3, "row": 0 }, "durationMs": 150 },
        { "atlas": "actions", "cell": { "column": 2, "row": 0 }, "durationMs": 150 }
      ]
    }
  }
}
```

### 필드 규칙

- `formatVersion`은 parser 호환성 버전이다. 현재 v2는 `death`를 필수 상태로 추가하며, 의미가 달라지는 변경은 버전을 올린다.
- `generator`는 선택적인 출처 기록이다. renderer가 도구별 분기에 사용하지 않는다.
- `atlases`는 atlas ID를 키로 갖는 객체다. `size`는 실제 PNG 크기와 일치해야 하고 두 축 모두 `frameSize`로 나누어떨어져야 한다.
- 각 frame은 atlas ID, 0부터 시작하는 행·열과 양의 정수 `durationMs`를 가진다. 배열 순서가 재생 순서다.
- `loop`는 마지막 프레임 뒤 반복 여부다. 비반복 clip은 상태가 바뀔 때까지 마지막 프레임에 고정된다.
- `fallback`을 사용하는 animation은 `frames` 대신 다른 animation ID 하나를 참조한다. 순환 fallback은 금지한다.
- `cue`는 scale·offset·opacity 같은 표현 보정만 허용한다. 생략하면 중립값을 사용한다.
- 기본 원본 방향은 오른쪽이며 왼쪽은 renderer의 `flipX`로 그린다.
- `hit`, `death`, `respawn` 같은 시간 제한 표현의 재생 길이는 frame duration 합계다. 상태 우선순위와 어떤 사건이 상태를 시작하는지는 JSON이 아니라 resolver가 소유한다.

manifest에는 collider·hitbox·hurtbox, 피해량·무적 시간, 물리 속성, 네트워크 권위 상태를 넣지 않는다. 특히 생성 도구가 keypoint를 제공하더라도 게임 충돌체로 자동 변환하지 않는다.

### 런타임 로딩

`loadPlayerSpriteManifest(manifestUrl)`는 JSON을 읽고 상대 PNG 경로를 manifest URL 기준으로 해석해 불변 `PlayerSpriteDefinition`으로 변환한다. bootstrap은 Player·Enemy·Environment definition으로 lazy `SpriteSceneResourceBundle` 하나를 만든다. `prepareArea({ areaId, sectorId })`는 Player와 실제 시작 Area의 Enemy·Environment atlas만 load·decode·크기 검증까지 기다리고, 나머지 package는 current gate와 독립적으로 background 준비한다. 정상 gameplay 첫 frame에는 current package의 pending fallback을 노출하지 않는다. Player atlas가 실제로 실패하면 local/remote Player renderer만 polygon body로 복구하며 준비된 Enemy·Environment 표현은 유지한다. 같은 bundle은 싱글·멀티·디버그 재시작에서 재사용한다.

```js
import { SpriteSceneRenderer, SpriteSceneResourceBundle } from "/src/render/SpriteSceneRenderer.js";
import { loadPlayerSpriteManifest } from "/src/render/sprites/PlayerSpriteManifest.js";

const definition = await loadPlayerSpriteManifest(
    new URL("./assets/runtime/characters/player-main/sprite-manifest.json", import.meta.url)
);
const resources = new SpriteSceneResourceBundle({ playerDefinition: definition });
await resources.prepareArea();
const renderer = new SpriteSceneRenderer({ resources });
```

## 도구별 원본 수령 형식

### PixelLab

가능하면 PixelLab의 수정하지 않은 character ZIP 전체를 받는다. 공식 ZIP export에는 방향별 기본 PNG, animation·direction별 개별 frame PNG와 `metadata.json`이 들어간다. import adapter는 필요한 측면 방향과 상태를 고르고 PNG들을 atlas로 다시 묶은 뒤 이 문서의 manifest를 생성한다.

- 권장 원본: character ZIP 전체
- 사용 자료: `animations/<animation>/<direction>/frame_*.png`, `metadata.json`
- 보존만 하는 자료: 생성 정보와 keypoint. collider 결정에는 사용하지 않는다.
- 주의: 작업 방식에 따라 지원 크기와 생성 프레임 수가 다르므로 요청값을 믿지 않고 실제 PNG 크기와 파일 수를 검사한다.

공식 참고: [PixelLab API v2 문서](https://api.pixellab.ai/v2/docs), [PixelLab 사용 문서](https://www.pixellab.ai/docs)

### SpriteCook

가능하면 animation별 투명 PNG sprite sheet와 개별 frame PNG를 함께 받는다. SpriteCook의 WebP·GIF는 동작 검토용으로만 보관한다. 공식적으로 범용 JSON manifest가 보장되지 않으므로 파일명과 도구 고유 metadata를 런타임 계약으로 삼지 않고 import adapter가 이 문서의 manifest를 만든다.

- 권장 원본: animation별 PNG sprite sheet와 individual frames
- 선택 자료: looping WebP preview, Unity·Godot package
- 런타임 제외: GIF·WebP, 엔진 전용 package
- 주의: 생성 요청의 width·height와 실제 결과가 다를 수 있으므로 실제 출력 크기를 검사한다.

공식 참고: [SpriteCook API 문서](https://www.spritecook.ai/api-docs), [sprite sheet export 안내](https://www.spritecook.ai/ai-sprite-sheet-generator), [animation guide](https://www.spritecook.ai/docs/guide-animate-sprite)

## 지원 범위와 검증

manifest v2의 지원 범위는 다음과 같다.

- 한 캐릭터의 여러 atlas PNG와 필수 `death` 상태
- atlas마다 다른 가로·세로 크기와 행·열 수
- 상태마다 다른 프레임 수·순서·재생 속도
- 상태별 loop 또는 마지막 프레임 clamp
- 명시적 animation fallback과 표현 cue
- atlas ID를 통한 프레임 선택과 좌우 반전

`npm run validate:sprite-assets -- <directory>`는 manifest 구조를 runtime loader와 같은 계약으로 검사하고 PNG header의 실제 크기를 선언과 대조한다. 자동 테스트는 atlas·cell 참조 범위, 필수 여덟 상태 coverage, fallback 순환, 양수 duration, 경로 이탈 거부와 multi-atlas frame 선택을 검증한다. 도구 export를 앱이 직접 읽거나 renderer에 PixelLab·SpriteCook 분기를 추가하지 않는다.
