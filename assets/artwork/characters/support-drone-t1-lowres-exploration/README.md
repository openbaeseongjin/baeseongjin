# Support Drone T1 Low-Resolution Exploration

- Status: `RUNTIME APPROVED`
- Asset ID: `support-drone-t1-lowres-exploration`
- Runtime target: `support-drone-t1` (지원 드론)
- Logical export: transparent RGBA `32×32`, opaque bounds `24×23`; intended world output approximately `56×56`
- Generated: 2026-08-22 with Codex built-in ImageGen; identity and motion references normalized deterministically with Pillow by `source/normalize_support_drone.py`
- Source and license: generated for this repository from repository-owned style references without external artwork; repository license

## Purpose

현재 gameplay의 지원 드론은 Player를 공격하거나 projectile을 발사하지 않는다. authored 위치를 유지하면서 반경 안에서 체력 비율이 가장 낮은 아군을 선택해 초록색 `support-link`로 지속 회복한다. 현재 `320px` 탐색 범위와 초당 `18 HP`는 역할을 해석하기 위한 gameplay 참고값이며 이 자산이 소유하거나 변경하지 않는다.

선택안은 세로로 안정된 clipped-diamond 본체, 보호된 큰 green restoration core, 몸체 양옆에서 분리된 두 개의 가는 relay bar와 작은 하부 hover mass를 사용한다. Relay bar는 향후 `support-link` 때 열리거나 대상 방향으로 반응할 수 있지만 기본 자세에서는 접힌 상태다. 총구·탄환·의료 십자·방패판·포격 셔터와 하부 투영기·추격 쐐기·순찰 드론의 넓은 side motor pod를 사용하지 않는다.

## Deliverables

- `source/imagegen-support-drone-sheet.png`: ImageGen `3×3` design exploration source, RGB `1254×1254` with a baked light checkerboard
- `source/imagegen-support-link-animation-reference.png`: ImageGen `4×2` motion reference, graded-alpha RGBA `1536×1024`; the dark background and glow are excluded from exports
- `source/generation-prompt.md`: identity and motion prompts, references, selection and background-normalization notes
- `source/normalize_support_drone.py`: middle-center concept selection, checkerboard removal, nearest-neighbor reduction, palette normalization, deterministic motion construction and preview generation
- `export/support-neutral.png`: transparent palette-normalized `32×32` neutral candidate
- `export/support-idle.png`: transparent `128×32` atlas, four `32×32` frames
- `export/support-link.png`: transparent `128×32` atlas, four `32×32` frames
- `export/support-motion.png`: transparent `128×64` authoring atlas; row 0 `support-idle`, row 1 `support-link`
- `preview/support-neutral-8x.png`: nearest-neighbor enlarged silhouette review
- `preview/support-runtime-size-check.png`: logical `32×32` and intended `56×56` comparison
- `preview/support-family-scale-review.png`: current enemy family plus Support at intended world output sizes
- `preview/support-idle.gif`: `8×` review loop, four frames at `200 ms` each
- `preview/support-link.gif`: `8×` review loop, four frames at `160 ms` each
- `preview/support-motion-atlas-4x.png`: both atlas rows enlarged with nearest-neighbor sampling
- `preview/support-animation-states.png`: representative idle/link silhouette comparison

Normalization selects zero-based cell column `1`, row `1`, rejects the light RGB checkerboard, scales the opaque concept to a maximum `24×24` area with nearest-neighbor sampling, and maps every opaque pixel to four shared body colors plus the existing Support VFX greens `#4ade80` and `#bbf7d0`. The two relay tips are normalized symmetrically so generated lighting does not erase the role cue. The export uses binary alpha, no smooth interpolation and no tool-specific runtime metadata.

## Presentation scope

이번 산출물은 `support-idle`과 `support-link`의 authoring motion candidate다. 역할은 본체보다 떨어져 있는 세로 relay silhouette와 보호된 중앙 core로 먼저 읽고 초록색은 이를 보조한다. 몸체는 upright·center anchor를 유지하며 좌우 방향을 갖지 않는다.

- `support-idle`: `4 frame`, `200/200/200/200 ms`, loop. 접힌 relay를 유지한 채 본체가 `0 → -1 → 0 → +1 px`로 천천히 부유하고 core가 작게 호흡한다.
- `support-link`: `4 frame`, `160/160/160/160 ms`, loop. 본체는 고정하고 relay 두 개가 대칭으로 `1 → 2 → 2 → 1 px` 열리며 core가 확장·수축한다. 루프 내내 relay가 열린 실루엣을 유지해 연결 중임을 즉시 구분한다.

Frame duration 합은 시각 재생 길이일 뿐 gameplay의 회복 tick, 목표 선택 또는 행동 전이 시간을 소유하지 않는다. `support-link`의 대상 방향은 gameplay `targetId`와 기존 공용 green line/particle presentation이 소유하므로 sprite에 beam이나 target을 그리지 않는다. 공용 `idle`과 `knockback`은 Runtime manifest에서 `support-idle`로 명시적으로 fallback한다.

## Runtime integration

- `export/support-motion.png`를 [`assets/runtime/characters/sector-01-enemies/support-motion.png`](../../../runtime/characters/sector-01-enemies/support-motion.png)로 정규화하고 enemy manifest v4의 `support-drone-t1`에 등록했다.
- Gameplay healing target selection, range, healing amount, collider, physics와 network authority는 변경하지 않았다.
- 2026-08-22 사용자는 이미지와 애니메이션을 완료 자산으로 확정했다. Runtime validator와 몬스터 모션 더미의 데스크톱·모바일 검증 결과는 package README가 소유한다.
