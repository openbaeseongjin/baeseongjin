# Sector 01 맵 정합 및 Calibration 표시 구현 계획

> **에이전트 실행 지침:** REQUIRED SUB-SKILL: `superpowers:executing-plans`를 사용해 이 계획을 작업 단위별로 실행한다. 각 단계의 완료 여부는 체크박스로 기록한다.

**목표:** Sector 01의 v2 맵 원본과 Camera Zone을 직접 확인하고, Stage 1-4에서 선택 Player만 Calibration의 로드·검증 상태를 보게 만든다.

**구조:** `GameSimulation`은 기존의 범용 Calibration 판정을 계속 유일하게 작성한다. Player snapshot이 그 판정의 읽기 전용 복사본을 전달하고, 새 `CalibrationPresentation`은 선택·검증 상태를 로컬 HUD와 시스템 메시지로 표현한다. 맵 값은 코드가 아니라 Map Editor의 Draft → Validate → Apply로만 바꾸며, 직접 플레이에서 불일치가 확인된 Stage만 v2 원본과 generated 출력까지 원자적으로 갱신한다.

**기술 스택:** Vanilla ES module, Canvas 2D renderer, Node.js authoring validator/generator, 기존 Map Editor authoring server.

**설계:** [`2026-08-22-sector01-map-parity-design.md`](../specs/2026-08-22-sector01-map-parity-design.md)

## 전역 제약

- Map Editor 범위는 Bounds·Entry, Terrain, Anchor, Recovery·Route, 기존 Enemy slot·activation·허용 적, Wind source·zone·cycle, Camera Zone이다.
- v2 원본은 Map Editor의 Draft → Validate → Apply로만 수정한다. generated JS는 수기 편집하지 않는다.
- `GameSimulation.#advanceCalibrationVerification()`과 기존 Progress controller는 Calibration 성공·Objective·Gate의 유일한 권위다.
- 멀티플레이에는 새 command·event·성공 판정을 추가하지 않는다. `calibrationVerifiedSourceIds`만 기존 Player snapshot에 additive 읽기 전용 필드로 포함한다.
- `CALIBRATION PROFILE / LOADED`, `CALIBRATION / VERIFIED`만 새 시스템 문구로 사용한다. Player Bark·카드별 신규 대사·월드 지속 텍스트는 만들지 않는다.
- 12개 Profile의 거리·속도·시간 수치와 검증 조건은 변경하지 않는다.
- 저장소 기본 자동 테스트 suite는 추가·실행하지 않는다. validator, 문법·형식 검사, 실제 브라우저 단일/멀티 플레이만 검증 근거로 사용한다.
- 메인 개발자의 seamless facade·Progression·멀티플레이 authority 변경과 충돌하지 않도록 이 worktree/branch에서만 작업하고, additive snapshot field 외 공개 계약을 넓히지 않는다.

## 변경 파일 구조

| 경로                                               | 책임                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/game/players/PlayerRenderSnapshot.js`         | 권위 Player가 이미 보유한 Calibration 검증 source ID를 render/network snapshot으로 읽기 전용 복사한다. |
| `src/game/presentation/CalibrationPresentation.js` | `1-4`의 선택 Player에 한정해 로드/검증 메시지와 지속 HUD 모델을 만든다. 성공을 계산하지 않는다.        |
| `src/game/GameApp.js`                              | 싱글플레이의 snapshot·authority event를 Presentation에 전달하고 renderer scene에 모델을 넣는다.        |
| `src/game/MultiplayerGameApp.js`                   | 예측 선택은 즉시, snapshot 검증 상태는 권위 값으로 표현한다. 팀원 상태는 전달하지 않는다.              |
| `src/render/CanvasRenderer.js`                     | 기존 HUD와 Story toast를 가리지 않는 위치에 Calibration HUD와 시스템 메시지를 그린다.                  |
| `docs/bsh/scenario/1/1-4/PRODUCTION-ALIGNMENT.md`  | 실제 UI 구현 범위, additive snapshot 경계, 수치 미구현 범위를 기록한다.                                |
| `docs/bsh/scenario/1/1-5/PRODUCTION-ALIGNMENT.md`  | 직접 플레이로 확인한 Camera/경로/LOS 결과만 기록한다.                                                  |
| `docs/bsh/scenario/1/1-7/PRODUCTION-ALIGNMENT.md`  | 직접 플레이로 확인한 Camera/경로/Wind 결과만 기록한다.                                                 |
| `docs/scenario-development-integration.md`         | 변경된 Runtime·시나리오 상태와 검증 marker를 실제 근거로 갱신한다.                                     |

`docs/bsh/scenario/1/{1-4,1-5,1-7}/AREA-SPEC.v2.json`과 `src/game/world/areas/generated/sector01/Sector01Stage{04,05,07}.generated.js`는 직접 플레이에서 시나리오 불일치가 증명될 때만 Map Editor Apply의 한 묶음으로 변경한다. Camera Zone을 포함한 해당 generated 파일은 수기 편집 금지다.

---

### 작업 1: 권위 Calibration 검증 상태를 기존 Player snapshot에 투영

**파일:**

- 수정: `src/game/players/PlayerRenderSnapshot.js:25-31`
- 확인: `src/game/network/WorldSnapshotEnvelope.js:42-70`

**인터페이스:**

- 소비: `PlayerObject.calibrationVerifiedSourceIds: string[]`
- 생성: 모든 `player.renderSnapshot()` 결과의 `calibrationVerifiedSourceIds: readonly string[]`
- 보존: `WORLD_SNAPSHOT_PROTOCOL_VERSION`과 모든 command/event 형식

- [x] **1단계: snapshot에 불변 배열을 추가한다.**

    `selectedAugmentIds` 바로 뒤에 다음 읽기 전용 값을 둔다. 원본 배열을 노출하거나 UI가 쓸 수 있게 하지 않는다.

    ```js
    calibrationVerifiedSourceIds: Object.freeze([...this.calibrationVerifiedSourceIds]),
    ```

- [x] **2단계: snapshot envelope의 additive 전달 경계를 확인한다.**

    `WorldSnapshotEnvelope.normalizeState()`가 `normalizeNetworkJson(state, "state")`로 Player 객체를 복사하고 id/tick만 검사하는 현재 구조를 유지한다. 새 command/event, protocol version 증가, server handler, `OwnerMotionState` 변경은 만들지 않는다.

- [x] **3단계: 로컬 예측과 원격 샘플을 대조한다.**

    `GameSimulation.playerState()`와 `OwnerPredictionRuntime.presentationState()`가 같은 render snapshot을 사용하고, `RemoteWorldStateBuffer.sample()`이 Player의 비위치 필드를 spread로 보존하는지 확인한다. 이로써 싱글과 멀티의 현재 Player가 동일 필드를 읽는다.

- [x] **4단계: 작업 단위 검사를 실행하고 커밋한다.**

    실행: `node scripts/checkSyntax.mjs`
    기대 결과: 수정 파일을 포함한 JavaScript 문법 검사가 통과한다.

    ```powershell
    git add src/game/players/PlayerRenderSnapshot.js
    git commit -m "feat: expose calibration verification in player snapshots"
    ```

### 작업 2: Player-local Calibration Presentation 모델을 추가

**파일:**

- 생성: `src/game/presentation/CalibrationPresentation.js`
- 확인: `src/game/augments/FoundationAugmentCatalog.js`, `src/game/simulation/GameSimulation.js:2121-2140`

**인터페이스:**

- 생성: `new CalibrationPresentation({ viewerId })`
- 입력: `update(dt, { currentAreaId, player, events })`
- 출력: `snapshot()` → `null` 또는 `{ toast, hud }`
- Stable ID: `sector-01-04:maintenance-node`, `sector-01-04:universal-calibration-frame`

- [x] **1단계: 고정 Stage와 Stable ID를 단일 상수로 선언한다.**

    ```js
    const CALIBRATION_AREA_ID = "sector-01-04";
    const CALIBRATION_NODE_ID = "sector-01-04:maintenance-node";
    const CALIBRATION_FRAME_ID = "sector-01-04:universal-calibration-frame";
    ```

- [x] **2단계: HUD 모델은 snapshot만 읽도록 구현한다.**

    `player.augmentRuntimeState.consumedSourceIds`에 Node ID가 있고 마지막 `selectedAugmentIds`가 catalog에서 해석될 때만 HUD를 만든다. `calibrationVerifiedSourceIds.includes(CALIBRATION_FRAME_ID)`는 상태 문구만 `검증 완료`로 바꾼다. HUD는 Stage `sector-01-04` 밖에서는 `null`이고, 카드 이름과 catalog의 `definition.family`를 표시한다.

- [x] **3단계: 메시지 중복을 상태 전이로 제한한다.**

    `foundation-selected` 또는 `predicted-foundation-selected` 중 viewer의 Player ID와 Node ID가 일치하는 한 번의 event만 `CALIBRATION PROFILE / LOADED` toast로 enqueue한다. `VERIFIED`는 첫 frame의 이미 검증된 snapshot에서는 enqueue하지 않고, 같은 연결 안에서 `false → true`로 바뀔 때만 `CALIBRATION / VERIFIED` toast를 enqueue한다. prediction과 authority event의 같은 선택은 `(viewerId, nodeId, augmentId)` token으로 한 번만 보인다.

- [x] **4단계: Presentation은 권위를 쓰지 못하게 고정한다.**

    클래스는 Player, Objective, Gate, world object, network API를 import하거나 변경하지 않는다. `update()`는 현재 snapshot과 event를 읽어 `{ toast, hud }`만 반환하며, toast에는 `text`와 `durationSeconds`, HUD에는 `augmentId`, `name`, `family`, `verified`만 둔다.

- [x] **5단계: 작업 단위 검사를 실행하고 커밋한다.**

    실행: `node scripts/checkSyntax.mjs`
    기대 결과: 새 presentation module을 포함한 문법 검사가 통과한다.

    ```powershell
    git add src/game/presentation/CalibrationPresentation.js
    git commit -m "feat: add local calibration presentation model"
    ```

### 작업 3: 싱글·멀티 앱과 Canvas HUD를 연결

**파일:**

- 수정: `src/game/GameApp.js:24-90, 188-200, 283-312`
- 수정: `src/game/MultiplayerGameApp.js:26-125, 486-509, 557-626`
- 수정: `src/render/CanvasRenderer.js:74-105, 290-359, 361-386`

**인터페이스:**

- 소비: `CalibrationPresentation.update()`과 `.snapshot()`
- 생성: renderer scene의 `calibrationPresentation`
- 보존: `storyPresentation`, `PlayerMessagePresentation`, `ClientStatusFeedback`, 기존 HUD 가시성 토글

- [x] **1단계: 두 App에 같은 local presenter를 생성한다.**

    두 constructor에서 viewer ID로 `CalibrationPresentation`을 하나 만들고, Camera shot이 계산된 뒤 `currentAreaId`, 현재 Player snapshot, 해당 frame의 authority/predicted events를 전달한다. 멀티플레이는 `authority.presentationState()`만 넘기며 팀원 `state.players`를 넘기지 않는다.

- [x] **2단계: renderer scene에 snapshot을 한 번만 전달한다.**

    두 `render()`의 `renderer.draw({...})` 인자에 다음 형태의 값을 추가한다.

    ```js
    calibrationPresentation: this.calibrationPresentation.snapshot(),
    ```

    `storyPresentation`의 queue와 `playerMessagePresentation`의 차단 정책은 변경하지 않는다.

- [x] **3단계: CanvasRenderer에 분리된 HUD/메시지 draw path를 둔다.**

    `scene.hudVisible !== false`일 때만 좌측 기존 상태 HUD 아래에 카드명·계열·`대기 중` 또는 `검증 완료`를 그린다. toast는 기존 Story toast와 겹치지 않게 중앙 상단의 다음 줄에서 `presentation.toast.text`를 그대로 그린다. `CALIBRATION PROFILE / LOADED`와 `CALIBRATION / VERIFIED`를 분리·변형하지 않는다. `hudVisible`이 false여도 toast의 짧은 표시는 유지한다.

- [ ] **4단계: 직접 실행으로 로컬 상태와 멀티 분리를 확인한다.**

    싱글플레이에서 1-4를 시작해 Node 선택 뒤 `LOADED`와 HUD가 보이고, Frame 안에서 기존 canonical 행동 후 `VERIFIED`와 HUD 갱신이 보이는지 확인한다. 멀티플레이 두 창에서는 선택/검증한 창만 해당 HUD·toast를 보며, 상대 창의 HUD·toast·Objective/Gate가 먼저 완료되지 않는지 확인한다.

- [x] **5단계: 작업 단위 검사를 실행하고 커밋한다.**

    실행: `node scripts/checkSyntax.mjs`
    기대 결과: App, renderer, presentation 변경을 포함한 문법 검사가 통과한다.

    ```powershell
    git add src/game/GameApp.js src/game/MultiplayerGameApp.js src/render/CanvasRenderer.js
    git commit -m "feat: render local calibration status"
    ```

### 작업 4: Map Editor로 Stage 1-4·1-5·1-7의 맵과 Camera를 직접 검증

**파일:**

- 확인: `tools/map-editor/index.html`, `tools/map-editor/main.js`, `scripts/map-editor/MapEditorAuthoringServer.mjs`
- 조건부 수정: `docs/bsh/scenario/1/{1-4,1-5,1-7}/AREA-SPEC.v2.json`
- 조건부 생성: `src/game/world/areas/generated/sector01/Sector01Stage{04,05,07}.generated.js`

**인터페이스:**

- 소비: Map Editor의 Stage GET, Draft, Validate, Apply, 새 싱글플레이 Preview
- 생성: 시나리오와 실제 플레이가 불일치할 때만 canonical v2 spec과 같은 Apply의 deterministic generated output
- 보존: Zone ID, Terrain/Anchor/Route/Enemy/Wind의 이미 검증된 의미, 수기 generated 편집 금지

- [x] **1단계: editor와 Runtime source 상태를 눈으로 확인한다.**

    `node scripts/map-editor/serveMapEditor.mjs --port=4178`로 editor를 실행한다. `http://127.0.0.1:4178/map-editor/`에서 1-4·1-5·1-7을 각각 선택해 `runtime-generated` 상태, component label/효과, Camera Zone overlay를 확인한다.

- [ ] **2단계: 시나리오 기준의 확인표로 새 싱글플레이 Preview를 실행한다.**

    - 1-4: Vestibule의 Guard 한 명, non-grappleable Service Baffle, 안전 Node Chamber, Universal Calibration Frame, upper-left exit와 C01~C04가 함께 읽혀야 한다.
    - 1-5: Horseshoe → Long Right Span → Controlled Drop/Low Slot → Re-launch → Upper Return → Final Deck, Wind 없음, Low/Upper Guard 두 슬롯, Cover LOS와 C01~C05가 읽혀야 한다.
    - 1-7: Lower→Middle against Pulse→Left Safe Shadow→Upper with Pulse→Bypass, 동일한 RIGHT Pulse, real Wind Baffle, mainline 적 0, Access C의 Carrier+Guard+Guard, C01~C08이 읽혀야 한다.

- [x] **3단계: 불일치가 증명된 경우에만 Apply한다.**

    문제 Stage의 Draft에서 필요한 map component 또는 Camera Zone만 수정하고 Validate를 통과시킨다. Apply가 v2 JSON과 generated module을 함께 갱신한 뒤, 새 Preview에서 같은 확인표를 다시 통과시킨다. 동작이 이미 기준을 만족하면 Apply하지 않고 source 파일의 바이트도 바꾸지 않는다.

- [ ] **4단계: 모든 v2 변경을 generator/validator로 확인하고 커밋한다.**

    실행: `npm run validate:area-specs`와 `node scripts/area-authoring-v2/generateAreaCatalogs.mjs --check`
    기대 결과: v2 spec과 deterministic generated output이 모두 최신이다.

    ```powershell
    git add docs/bsh/scenario/1 src/game/world/areas/generated/sector01
    git commit -m "feat: align Sector 01 authored map data"
    ```

    이 커밋은 실제 Apply가 source를 변경했을 때만 만든다.

### 작업 5: 실제 근거를 기준 문서와 통합 현황에 승격하고 최종 검증

**파일:**

- 수정: `docs/bsh/scenario/1/1-4/PRODUCTION-ALIGNMENT.md`
- 수정: `docs/bsh/scenario/1/1-5/PRODUCTION-ALIGNMENT.md`
- 수정: `docs/bsh/scenario/1/1-7/PRODUCTION-ALIGNMENT.md`
- 수정: `docs/scenario-development-integration.md`
- 수정: `SESSION-HANDOFF.md`

**인터페이스:**

- 소비: 작업 1~4의 commit SHA, actual map Apply 여부, desktop/mobile 및 멀티플레이 관찰 결과
- 생성: `VERIFIED`/`PARTIAL`/`NOT IMPLEMENTED`을 분리한 현행 Integration 기록
- 보존: Profile별 수치·개별 validation `NOT_IMPLEMENTED`, Player Bark `NOT IMPLEMENTED`의 정직한 상태

- [ ] **1단계: 1-4 Alignment를 실제 결과로 갱신한다.**

    Calibration Story/Presentation 행을 `LOADED`/`VERIFIED` 시스템 메시지와 player-local HUD 구현으로 갱신한다. player snapshot의 additive 읽기 전용 필드, UI가 성공 권위를 쓰지 않는 경계, 12 Profile 수치·조건은 계속 `NOT IMPLEMENTED`이라는 사실을 함께 기록한다.

- [ ] **2단계: 1-5·1-7의 직접 플레이 결과만 기록한다.**

    Camera, route, Cover LOS, Wind/Shadow는 실제 데스크톱·모바일 관찰이 있는 항목만 `VERIFIED`로 승격한다. 보지 못한 구간은 기존 상태를 유지하거나 `PARTIAL`로 쓴다. Apply가 없었으면 Camera/geometry가 바뀌었다고 쓰지 않는다.

- [ ] **3단계: 시나리오 통합 marker와 handoff를 정리한다.**

    `npm run check:scenario-integration -- --print`로 최신 fingerprint와 열린 gate를 재검토한 후 `docs/scenario-development-integration.md`에 Runtime 상태·근거·미구현 범위를 기록한다. 1-4 Presentation, map editor 범위, Camera 범위의 영구 문서 소유가 충분하면 `SESSION-HANDOFF.md`의 L1을 완전히 제거한다.

- [ ] **4단계: 단일 최종 candidate 검증을 한 번 실행하고 ledger를 남긴다.**

    ```powershell
    npm run check
    npm run format:check
    git diff --check
    npm run check:scenario-integration
    ```

    데스크톱·모바일 싱글플레이와 두 창 멀티플레이의 실제 관찰을 같은 문서에 남긴다. base SHA, final candidate SHA 또는 diff fingerprint, 환경, 결과, 재실행 조건을 development-rules ledger 계약에 맞춰 기록한다.

- [ ] **5단계: 문서 변경을 커밋한다.**

    ```powershell
    git add docs/bsh/scenario/1/1-4/PRODUCTION-ALIGNMENT.md docs/bsh/scenario/1/1-5/PRODUCTION-ALIGNMENT.md docs/bsh/scenario/1/1-7/PRODUCTION-ALIGNMENT.md docs/scenario-development-integration.md SESSION-HANDOFF.md
    git commit -m "docs: record Sector 01 map parity evidence"
    ```

## 계획 자체 점검

- **설계 범위:** Snapshot 전달(작업 1), Player-local 표시(작업 2~3), Map Editor/Camera 직접 근거(작업 4), 문서 승격·검증(작업 5)으로 설계의 모든 완료 조건을 다룬다.
- **권위 경계:** UI는 `calibrationVerifiedSourceIds`와 선택 상태를 읽기만 하며, `GameSimulation`, Progress controller, Map Editor Apply만 각각의 기존 권위를 유지한다.
- **명시적 제외:** Profile 수치/개별 검증, Bark, 강제 연출, 새 자동 테스트, 새 multiplayer command/event, 수기 generated 편집은 작업에 없다.
- **표현 일관성:** Stable ID는 v2 source의 `sector-01-04:maintenance-node`, `sector-01-04:universal-calibration-frame`만 사용한다.
