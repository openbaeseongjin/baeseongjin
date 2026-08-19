# DIRECTION-SPEC RUNTIME CAPABILITY MATRIX

> AUTHORING SNAPSHOT: `main@ddaeaba6aec183e49b974de88bafed87493080b2` (2026-08-19)
> 상태 정의는 [`DIRECTION-SPEC-AUTHORING-STANDARD.md`](./DIRECTION-SPEC-AUTHORING-STANDARD.md) §3을 따른다.

이 표는 `DIRECTION-SPEC.json`의 각 필드/값이 **오늘 시점 실제 Runtime에 대응 코드가 있는지**를 기록한다. 추측하지 않는다 — 아래 상태는 모두 직접 `grep`/코드 열람으로 확인한 결과이며, 확인하지 못한 항목은 `VERIFIED`나 `NOT IMPLEMENTED`로 단정하지 않고 `HOLD`로 남긴다. `scripts/validateDirectionSpecs.mjs`의 KNOWN registry는 이 표의 `VERIFIED`/`PARTIAL` 항목과 동기화되어야 한다 — 이 표를 갱신하지 않고 검증기 registry만 넓히지 않는다.

## Trigger

| Direction Feature | Current Runtime | Runtime Location | Status | Notes |
|---|---|---|---|---|
| `area-enter` | `ENTRY_PRESENTATIONS[currentAreaId]` | `src/game/presentation/AuthoredStoryPresentation.js:3,1451` | VERIFIED | `#enqueue(\`area:${id}\`, ...)` |
| `position-zone` | `POSITION_PRESENTATIONS[currentAreaId]` | `src/game/presentation/AuthoredStoryPresentation.js:190,1453-1455` | VERIFIED | trigger token 기반 |
| `object-trigger` | `TRIGGER_CUE_PRESENTATIONS[cueId]` (Area `cueIds` 경유) | `src/game/presentation/AuthoredStoryPresentation.js:760,1461` | VERIFIED | `AreaDefinition.cueIds`가 실제로 노출되는 필드(§0의 `storyTriggers`와 다름) |
| `objective-started` | `OBJECTIVE_PRESENTATIONS[event.objectiveId]` | `src/game/presentation/AuthoredStoryPresentation.js:1167,1467` | PARTIAL | objectiveId 키 맵은 존재. started/completed 두 이벤트가 같은 맵으로 `#enqueue`되는 것으로 보이나(1467/1470 두 호출) 두 이벤트가 서로 다른 프레젠테이션을 선택할 수 있는지는 이번 패스에서 라인 단위로 확인하지 못했다 — 구현 전 재확인 필요 |
| `objective-completed` | 위와 동일 | 위와 동일 | PARTIAL | 위와 동일 |
| `gate-unlocked` | `GATE_PRESENTATIONS[event.gateId]` | `src/game/presentation/AuthoredStoryPresentation.js:1314,1473` | VERIFIED | |
| `enemy-activated` | 없음(Story Presentation 계층) | — | NOT IMPLEMENTED | Enemy activation 자체는 AREA-SPEC `enemies[].activation`으로 존재(구현 계약 아님, 트리거 아님). Story Beat trigger로 연결하는 코드 없음 |
| `enemy-defeated` | 없음(Story Presentation 계층) | — | NOT IMPLEMENTED | Combat 이벤트는 `src/game/combat/**`에 존재하나 Direction Beat trigger로 소비하는 코드 없음 |
| `augment-selected` | 없음(Story Presentation 계층) | — | NOT IMPLEMENTED | Augment 선택 이벤트는 `src/game/augments/**`에 존재하나 Direction Beat trigger로 소비하는 코드 없음 |
| `route-lock-changed` | 없음(Story Presentation 계층) | — | NOT IMPLEMENTED | routeLock 개념 자체는 `LegacyAreaSeamlessSectorRuntime.js` 컴파일 결과에 존재(`AREA-SPEC-AUTHORING-STANDARD.md` §0). Direction Beat trigger로 노출 안 됨 |

## Scope / Multiplayer

| Direction Feature | Current Runtime | Runtime Location | Status | Notes |
|---|---|---|---|---|
| `scope: local-player / party / world` | 불명 | `src/game/simulation/GameSimulation.js`, `src/game/runtime/OwnerPredictionRuntime.js`, `src/game/replay/CommandReplay.js` | HOLD | Multiplayer 권위/예측 코드는 존재하나, DIRECTION-SPEC의 3단 `scope` enum과 1:1 대응하는 필드를 이번 패스에서 확인하지 못했다. 실제 구현 전 별도 audit 필요 |
| `worldPause` | 없음 | — | NOT IMPLEMENTED | `src/game/` 전체 문자열 검색 0건 |

## Control

| Direction Feature | Current Runtime | Runtime Location | Status | Notes |
|---|---|---|---|---|
| `playerControl.{movement,aim,rope,action,interaction}` | 없음 | — | NOT IMPLEMENTED | `src/game/` 전체 문자열 검색 0건. Beat 단위 개별 입력 잠금 프레임워크가 없다 |
| `replayPolicy`(once-per-run/once-per-life/once-per-sector-attempt/repeatable) | 단일 dedupe만 존재 | `src/game/presentation/AuthoredStoryPresentation.js:1421,1424-1429`(`this.seenTokens`, `#enqueue`) | PARTIAL | 인스턴스 생존 동안 토큰 1회만 재생하는 dedupe primitive는 있음. 4종 replayPolicy를 구분하는 프레임워크는 없음 — `once-per-run`에 가장 가깝고 나머지 3종은 구현 필요 |

## Camera

| Direction Feature | Current Runtime | Runtime Location | Status | Notes |
|---|---|---|---|---|
| `camera.mode: authored-zone` | `resolveAuthoredCameraShot()` zone 해석 | `src/game/camera/AuthoredCameraDirector.js:55` | VERIFIED | |
| `camera.mode: composition-contract` | 없음 | — | NOT IMPLEMENTED | 문자열 검색 0건 |
| `camera.mode: temporary-shot` | 없음 | — | NOT IMPLEMENTED | 문자열 검색 0건 |
| `camera.mode: default` | 암묵적 fallback 추정 | `src/game/camera/AuthoredCameraDirector.js` | HOLD | zone 미해당 시 fallback 동작은 있으나 `"default"`라는 명시적 mode 값으로 다뤄지는지 미확인 |

## Tracks

| Direction Feature | Current Runtime | Runtime Location | Status | Notes |
|---|---|---|---|---|
| `tracks.systemText` | `AuthoredStoryPresentation` 프레젠테이션 항목(title/detail/duration) | `src/game/presentation/AuthoredStoryPresentation.js` | VERIFIED | ENTRY/POSITION/OBJECTIVE/GATE/TRIGGER_CUE 프레젠테이션이 이 형태 |
| `tracks.dialogue` | 불명 | — | HOLD | systemText와 분리된 전용 dialogue 트랙 존재 여부 미확인 |
| `tracks.character` | 불명 | — | HOLD | Character blocking/animation 연출 트랙 미확인 |
| `tracks.object` | 불명 | — | HOLD | Object animation 연출 트랙 미확인 |
| `tracks.camera` | `authored-zone`을 벗어난 per-beat camera track | — | HOLD | zone 시스템 외 beat 단위 camera track 존재 여부 미확인 |
| `tracks.audio` | `AudioEventBindings` 안정 cueId 재생 | `src/audio/AudioEventBindings.js:20-105,113` | VERIFIED | `host.play(cueId, request)` 계약 존재. Beat track에서 이 cueId를 참조하는 것은 가능 |
| `tracks.vfx` | 불명 | — | HOLD | 이번 패스에서 VFX 시스템을 직접 열람하지 못했다 |
| `tracks.lighting` | 불명 | — | HOLD | 이번 패스에서 Lighting 시스템을 직접 열람하지 못했다 |
| `tracks.gameplayEvent` | 불명 | — | HOLD | Beat에서 gameplay event를 직접 발행하는 계약 미확인 |

## 요약

VERIFIED 6 · PARTIAL 3 · NOT IMPLEMENTED 6 · HOLD 8.

가장 중요한 시사점: **Beat의 뼈대(trigger 5종, systemText, audio, authored-zone camera)는 이미 실제 코드에 연결할 수 있지만, `worldPause`/`playerControl`/`replayPolicy` 세분화/`composition-contract`·`temporary-shot` camera mode는 스키마상 필수 필드인데도 오늘은 전부 NOT IMPLEMENTED다.** 첫 Stage(1-1)가 새 표준의 첫 실사용 사례가 될 때, 이 필드들은 실제로 구현하기 전까지 DIRECTION-SPEC에서 `status: "NOT IMPLEMENTED"`로 명시하고 값 자체(예: `worldPause: false`, `playerControl: 전부 true`)는 안전한 기본값으로 채우는 방식을 권장한다 — §7-4 No-Guess Rule과 충돌하지 않는다(값 자체를 발명하는 게 아니라 "현재 아무것도 잠그지 않는다"는 안전한 기본 상태를 서술하는 것).
