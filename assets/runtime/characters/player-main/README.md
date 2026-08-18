# player-main runtime package

이 폴더는 사용자가 제공한 최종 캐릭터 원본을 여덟 player animation 상태로 정규화한 runtime-ready package다.

- `locomotion.png`: 144×48, 24×24 cell 6×2 (`idle`, `jump`, `fall`, 4-frame `rope`)
- `run.png`: 192×24, 24×24 cell 8×1 (`run` 전용)
- `actions.png`: 120×24, 24×24 cell 5×1
- `release-spin.png`: 192×24, 기존 `jump` 상태가 사용하는 24×24 cell 8×1 회전 atlas
- `death.png`: 384×48, 48×48 cell 8×1, 총 0.70초 죽음 모션 atlas
- `sprite-manifest.json`: frame 순서, duration, cue와 렌더 크기

`jump`는 새 gameplay 상태가 아니라 기존 상승 상태다. 65ms 간격의 8개 시각 프레임을 반복하며, renderer가 이미 적용하던 플레이어 강체 각도 회전도 그대로 유지한다.

`death.png`는 승인된 푸른 파편 모션이며 manifest의 `death` animation으로 재생된다. 사망 표현 사건은 사망 직전 위치에서 0.70초 death를 재생한 뒤 체크포인트 위치의 기존 respawn으로 전환한다.

원본·ImageGen prompt·사람용 preview·변환 기록은 `assets/artwork/characters/player-main/`에 있다. collider, hitbox, 물리, 피해량과 네트워크 상태는 이 package에 포함하지 않는다.

검증:

```powershell
npm run validate:sprite-assets -- assets/runtime/characters/player-main
```

게임 bootstrap은 이 package를 기본 player definition으로 자동 로드한다. manifest 로딩 실패 시에만 내장 mock definition으로 복구한다.
