# Patrol Drone T1 Low-Resolution Exploration

- Status: `RUNTIME APPROVED`
- Asset ID: `patrol-drone-t1-lowres-exploration`
- Runtime target: `patrol-drone-t1` (순찰 드론)
- Logical export: transparent RGBA `32×32`, opaque bounds `28×15`; intended world output approximately `56×56`
- Generated: 2026-08-22 with Codex built-in ImageGen; normalized and animated deterministically with Pillow by `source/normalize_patrol_drone.py`
- Source and license: the user-selected Patrol Drone image and motion reference were generated for this repository in this Codex task without external artwork; repository license

## Purpose

고정 authored route를 왕복하는 첫 이동형 Security를 공격보다 먼저 읽히게 한다. 선택안은 넓고 안정된 수평 차체, 분리된 양쪽 hover/motor pod, 중앙의 매입형 red-orange scan visor와 작은 하부 표준 emitter만 사용한다. 추격 드론의 전방 쐐기, Shield의 외부 방패판, Artillery의 셔터·하부 범위 투영기, Sentry의 바닥 고정부와 겹치지 않는다.

## Deliverables

- `source/imagegen-patrol-drone-sheet.png`: ImageGen 3×3 authoring exploration source
- `source/user-selected-patrol-reference.png`: user-selected neutral appearance reference
- `source/imagegen-patrol-animation-reference.png`: ImageGen identity-preserving motion reference; retained for pose intent only because its checkerboard is baked RGB rather than transparency
- `source/generation-prompt.md`: generation, extraction, and animation-reference prompts
- `source/normalize_patrol_drone.py`: selected middle-left concept normalization and deterministic animation generation
- `export/patrol-neutral.png`: palette-normalized transparent `32×32` base image
- `export/patrol-move-right.png`: four-frame rightward patrol loop, `128×32`
- `export/patrol-move-left.png`: four-frame leftward patrol loop, `128×32`
- `export/patrol-acquire.png`: two-frame target acquisition, `64×32`
- `export/patrol-track.png`: four-frame scan tracking, `128×32`
- `export/patrol-lock-fire.png`: two lock frames followed by two fire frames, `128×32`
- `export/patrol-cooldown.png`: four-frame recovery, `128×32`
- `export/patrol-motion-attack.png`: combined 4-column × 6-row authoring atlas, `128×192`
- `preview/patrol-neutral-8x.png`: nearest-neighbor enlarged review
- `preview/patrol-direction-review.png`: base and horizontal-mirror readability review
- `preview/patrol-runtime-size-check.png`: logical `32×32` and intended `56×56` comparison
- `preview/patrol-family-scale-review.png`: current approved enemy family and Patrol at intended world output sizes
- `preview/patrol-move-right.gif`: rightward movement loop review
- `preview/patrol-move-left.gif`: leftward movement loop review
- `preview/patrol-attack-cycle.gif`: full acquire-to-cooldown attack review
- `preview/patrol-animation-states.png`: representative state key poses
- `preview/patrol-motion-attack-atlas-4x.png`: combined atlas review on the authoring background

ImageGen source output is `1536×1024` RGBA with soft alpha at the generated silhouette edge. Normalization selects the middle-left concept, thresholds alpha to binary, scales it with nearest-neighbor sampling, and maps every opaque pixel to the shared six-color enemy palette. The export uses no smooth interpolation or tool-specific metadata.

## Presentation scope

이번 산출물은 사용자 선택 외형을 유지한 좌우 이동 및 공격 authoring candidate다. 모든 셀은 `32×32`, anchor는 중앙이며 이동 중에만 1픽셀 부유한다. 좌우 이동은 각각 4프레임 loop이고 진행 방향 반대쪽 motor pod의 짧은 amber/red pulse로 이동성을 보강한다. 기체 자체는 회전하지 않는다.

공격은 `acquire` 2프레임/250ms, `track` 4프레임/800ms, `lock` 2프레임/200ms, `fire` 2프레임/80ms, `cooldown` 4프레임/1000ms의 총 14프레임/2.33초다. 이 timing은 현재 gameplay 상태 길이에 맞춘 표현용 기준이며 gameplay 권위는 아니다. 중앙 센서의 개방·scan bar·압축 lock 뒤 하부 emitter만 짧게 연장 및 점화한다. 발사 방향과 실제 투사체 궤적은 gameplay가 소유하며 이 atlas에는 projectile을 그리지 않는다.

통합 atlas 행은 위에서부터 `move-right`, `move-left`, `acquire`, `track`, `lock+fire`, `cooldown`이다. `acquire` 행은 2프레임만 사용하고 뒤 2셀은 투명하다. Runtime `patrol-move`는 right-facing 첫 행을 사용하고 현재 authored route 목표점의 좌우 차이로 renderer가 전체 frame을 반전한다. `idle → patrol-wait → patrol-move`와 `knockback → patrol-wait` fallback을 명시했고, 공격 상태는 각 authored row에 직접 연결했다. 둘째 `move-left` 행은 authoring 비교·원본으로 보존하지만 Runtime clip은 중복 frame을 등록하지 않는다.

## Runtime integration

- `export/patrol-motion-attack.png`를 [`assets/runtime/characters/sector-01-enemies/patrol-motion-attack.png`](../../../runtime/characters/sector-01-enemies/patrol-motion-attack.png)로 정규화하고 enemy manifest v4의 `patrol-drone-t1`과 legacy alias `patrol-drone`에 등록했다.
- Gameplay collider, damage, projectile, AI, patrol speed·route와 network authority는 변경하지 않았다.
- 2026-08-22 사용자는 이미지와 애니메이션을 완료 자산으로 확정했다. Runtime validator와 몬스터 모션 더미의 데스크톱·모바일 검증 결과는 package README가 소유한다.
