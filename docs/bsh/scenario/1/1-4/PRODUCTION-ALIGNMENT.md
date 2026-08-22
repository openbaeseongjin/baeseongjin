# 1-4 PRODUCTION ALIGNMENT — REV8.1

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## MAP-PREVIEW primary route sync — 2026-08-20

`MAP-PREVIEW.html`의 Entry→Vestibule→Baffle Approach→Node→Calibration→Exit Transfer→Final Deck endpoint 전체를 Runtime `routePoints`와 seamless `world.route`에 반영했다. Calibration gameplay와 collision은 변경하지 않았다.

## Current Runtime vs REV8.1

| Item | Current | REV8.1 | Status |
|---|---|---|---|
| Bounds | 1152×832 | 1152×832 | VERIFIED |
| Entry | (+224,-32) | (+224,-32) | VERIFIED |
| Node | (-96,-288) | (-96,-288) | VERIFIED |
| First offer | Runtime generic compatible 3 cards | preserve | VERIFIED |
| Old fixed Foundation 3 | retired (was already unread dead data - `createDeterministicFoundationRewardSelection` never read it) | retired | DOC FIX |
| Guard | (432,-160) Vestibule | (+432,-160) Vestibule | VERIFIED |
| Guard kill gate | none | none | VERIFIED / PRESERVE |
| Chooser pauses world | no | no | VERIFIED / PRESERVE |
| Service Baffle | static, solid, `grappleable:false`, bottom-anchored on Vestibule Deck | static LOS blocker | VERIFIED (LOS block itself is MANUAL/visual, see below) |
| Universal Calibration Frame | new `calibration-frame` object, radius 400 | new | VERIFIED |
| `augment-selected` | current objective | preserve | VERIFIED |
| `augment-calibrated` | new `augment-calibration` objective type + `#advanceCalibrationVerification()` in GameSimulation.js | new personal validation + shared completion | IMPLEMENTED (see Runtime implementation note - generalized, not per-profile) |
| Exit requirement | augment-selected + augment-calibrated | augment-selected + augment-calibrated | VERIFIED |
| Selection Story | protocol accepted + card online | preserve | VERIFIED |
| Calibration 시스템 표시 | 선택 Player의 `CALIBRATION PROFILE / LOADED`·`CALIBRATION / VERIFIED`와 카드명·계열·검증 상태 HUD | Profile 로드 / 검증 | IMPLEMENTED (시스템 표시에 한함, 성공 판단은 읽지 않음) |
| 저작 Calibration 서사 / Player Bark | 별도 저작 대사 없음 | Profile별 서사와 Bark | NOT IMPLEMENTED (이번 범위에서 대사를 만들지 않음) |
| Camera zones | 4, re-authored bounds | 4, re-authored bounds | VERIFIED |

## Runtime implementation note (calibration verification is generalized, not per-profile)

`CALIBRATION-PROFILES.json` marks all 12 profiles `NOT_IMPLEMENTED` and each has a bespoke success
condition (exact distance windows, timing windows, specific instrument contact). Implementing all 12
bespoke conditions was out of scope for this pass. Instead, `GameSimulation.js`'s
`#advanceCalibrationVerification()` implements one **generic, real** verification signal that still
satisfies every AUTOMATED acceptance test:

- rope-family Augments (no `actionId` in `FoundationAugmentCatalog`) verify on a live rope attach
  (`player.ropeObject.rope.isAttached`) while within the Frame's `interactionRadius`.
- action-family Augments verify on a canonical action activation (`actionState.rechargeQueue.length > 0`
  or `actionState.activeAction != null`, the latter covering `slow-fall`, which never enqueues a
  cooldown) while in range.

This is never satisfied by card ownership alone (verified in `tests/augmentCalibration.mjs`), works for
any of the 12 cards (no specific-card requirement), is Player-local (per-player tracked on
`PlayerObject.calibrationVerifiedSourceIds`), and the shared objective only completes once every
currently active, already-selected Player has personally verified
(`SectorProgressController.js`/`WorldProgressController.js`'s `completingCalibrationPlayer()`) - a
leaver drops out of that set on their own next tick, and completion is one-way so a late joiner cannot
relock an already-open gate. What is genuinely **not** implemented: each profile's exact distance/timing
window, authored Calibration Story와 Player Bark다. 기존 AREA-SPEC의
`calibration-profile-presentation`, `nonlethal-calibration-pulse`는 여전히 `NOT_IMPLEMENTED`다.

## Player-local Calibration 시스템 표시 — 2026-08-22

`CalibrationPresentation`은 `sector-01-04:maintenance-node` 선택 이벤트와 기존 Player snapshot만 읽는다.
선택한 Player는 한 번의 `CALIBRATION PROFILE / LOADED` 시스템 메시지와 카드 이름·계열·`대기 중` HUD를 보고,
기존 `GameSimulation.#advanceCalibrationVerification()`이 Frame source ID를 snapshot에 기록한 뒤에는 한 번의
`CALIBRATION / VERIFIED` 메시지와 `검증 완료` HUD를 본다.

- `calibrationVerifiedSourceIds`는 기존 Player snapshot에만 additive 읽기 전용으로 들어간다. 새 command,
  성공 이벤트, 프로토콜 version, Gate/Objective 판정은 만들지 않았다.
- 싱글은 local authority snapshot, 멀티는 `authority.presentationState()`의 **현재 Player**만 전달한다.
  다른 Player의 HUD/메시지는 만들지 않는다.
- Presentation은 성공을 쓰지 않으며, 12 Profile의 거리·속도·시간 조건도 바꾸지 않는다.
- 2026-08-22 loopback 미리보기에서 1-4 새 싱글플레이 실행과 기존 Canvas가 browser error 없이 시작되는 것을
  확인했다. Node 선택→Frame 행동의 전체 수동 플레이 시퀀스는 수치 tuning과 함께 별도 실제 플레이 검증으로 남긴다.

## Current Augment contract authority

Current catalog provides 22 cards.
At an empty first build, compatibility admits Rope + Base Action cards and excludes Signature/Modifier cards that require an Action context.

REV8.1 does not reintroduce Foundation tiers.

## New runtime boundary

REV8.1 requires a calibration owner separate from Presentation.

It must:
1. read selected card for each Player
2. load that card's profile
3. observe canonical gameplay events/state in the Calibration Frame
4. complete personal calibration only on valid selected-card use
5. aggregate current required Player passes to shared objective
6. never pause world
7. never change shared geometry by Player card

Presentation only visualizes:
- profile loaded
- calibration verified

It must not decide success.

## Safety

Service Baffle must block the single entry Guard's LOS/projectiles into Node and Calibration areas.

Instant Guard calibration pulse must be explicitly nonlethal.

## Verdict

`IMPLEMENTED (범용 Calibration 검증 + Player-local 시스템 표시). Remaining gap: Profile별 개별 성공 조건, 저작 Calibration 서사와 Player Bark는 NOT IMPLEMENTED.`
