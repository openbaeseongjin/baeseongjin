# player-main runtime package

이 폴더는 사용자가 제공한 최종 캐릭터 원본을 일곱 player animation 상태로 정규화한 runtime-ready package다.

- `locomotion.png`: 144×48, 24×24 cell 6×2 (`idle`, `jump`, `fall`, 4-frame `rope`)
- `run.png`: 192×24, 24×24 cell 8×1 (`run` 전용)
- `actions.png`: 120×24, 24×24 cell 5×1
- `sprite-manifest.json`: frame 순서, duration, cue와 렌더 크기

원본·ImageGen prompt·사람용 preview·변환 기록은 `assets/artwork/characters/player-main/`에 있다. collider, hitbox, 물리, 피해량과 네트워크 상태는 이 package에 포함하지 않는다.

검증:

```powershell
npm run validate:sprite-assets -- assets/runtime/characters/player-main
```

게임 bootstrap은 이 package를 기본 player definition으로 자동 로드한다. manifest 로딩 실패 시에만 내장 mock definition으로 복구한다.
