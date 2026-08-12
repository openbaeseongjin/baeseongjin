# 플레이어 스프라이트 제작 starter

이 폴더는 현재 개발용 player mock의 일곱 동작을 실제 납품 형식인 투명 PNG multi-atlas와 `sprite-manifest.json`으로 옮긴 작업 시작점입니다. 최종 아트가 아니며 현재 게임이 이 폴더를 자동으로 읽지도 않습니다.

## 그래픽 담당자가 할 일

1. 이 폴더 전체를 `assets/sprites/<character-id>/`처럼 `assets/sprites/` 바로 아래 sibling으로 복사합니다.
2. `locomotion.png`와 `actions.png`의 각 24×24 cell을 아래와 같은 의미의 새 그림으로 교체합니다. 셀 사이에 padding, gap 또는 bleed를 넣지 않고 투명 배경을 유지합니다.
3. 프레임 수, 순서, atlas 크기를 바꾼 경우 `sprite-manifest.json`의 atlas `size`, animation `cell`, `durationMs`도 함께 고칩니다.
4. 기본 원본 방향은 오른쪽입니다. 왼쪽 방향은 renderer가 `flipX`로 표시하므로 별도 좌향 atlas가 필수는 아닙니다.
5. 다음 명령을 통과시킵니다.

```powershell
npm run validate:sprite-assets -- assets/sprites/<character-id>
```

`sprite-manifest.json`의 `$schema`는 `../sprite-manifest.schema.json`이므로 폴더를 위 위치로 복사한 뒤에도 유효합니다. collider, hitbox, 물리 값 또는 network 상태는 이 manifest에 넣지 않습니다. 그런 값은 스프라이트와 독립된 게임 런타임 조립이 소유합니다.

## 셀 배치

`locomotion.png`는 96×48, 24×24 cell의 4×2 atlas입니다.

| 행  | column 0 | column 1 | column 2 | column 3 |
| --- | -------- | -------- | -------- | -------- |
| 0   | `idle-0` | `idle-1` | `run-0`  | `run-1`  |
| 1   | `jump`   | `fall`   | `rope-0` | `rope-1` |

`actions.png`는 120×24, 24×24 cell의 5×1 atlas입니다.

| 행  | column 0 | column 1 | column 2    | column 3    | column 4    |
| --- | -------- | -------- | ----------- | ----------- | ----------- |
| 0   | `hit-0`  | `hit-1`  | `respawn-0` | `respawn-1` | `respawn-2` |

`frame-map.png`는 위 순서를 라벨과 함께 보여 주는 사람용 참고 이미지입니다. runtime manifest에서는 참조하지 않습니다.

## 원본과 다른 예제의 역할

- [`../player-action-mock.svg`](../player-action-mock.svg)는 현재 런타임이 직접 읽는 개발용 mock이며, 각 동작 의미와 pose의 원본입니다.
- 이 폴더의 PNG는 저장소의 `scripts/generatePlayerProductionTemplate.mjs`가 그 SVG의 정수 좌표 사각형을 native 24×24 pixel로 rasterize한 뒤 두 atlas로 repack한 결과입니다. PixelLab, SpriteCook 또는 ImageGen은 사용하지 않았습니다.
- [`../examples/player-multi-atlas`](../examples/player-multi-atlas)는 schema와 validator 회귀를 위한 결정적 fixture일 뿐 그래픽 품질이나 최종 pose의 참고 자료가 아닙니다.

이 starter를 복사해 만든 결과물도 개발자가 별도로 `PlayerSpriteManifest` 로딩 경계에 연결하기 전에는 게임에 나타나지 않습니다. 최종 runtime 연결은 그래픽 납품과 분리된 후속 개발 작업입니다.

PNG를 다시 생성해야 하면 저장소 루트에서 `node scripts/generatePlayerProductionTemplate.mjs`를 실행합니다. 이 명령은 이 폴더의 세 PNG를 현재 mock SVG 기준으로 다시 만듭니다.
