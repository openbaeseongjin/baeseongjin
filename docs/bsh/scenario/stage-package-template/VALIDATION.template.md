# <STAGE ID> — VALIDATION

> AUTHORING SNAPSHOT: `main@<GITHUB_MAIN_SHA>` (<YYYY-MM-DD>)

`DIRECTION-SPEC-AUTHORING-STANDARD.md` §10 Two-layer Validation을 따른다 — Automated Contract와 Visual Acceptance 둘 다 통과해야 최종 PASS다.

## Automated — Schema / Runtime Capability

- `npm run validate:area-specs`: <결과>
- `npm run validate:direction-specs`: <결과, runtime-capability warning 개수 포함>
- `npm run validate:stage-package-cross-references`: <결과>

## Automated — Geometry (AREA-SPEC)

- ID uniqueness / bounds / mandatory route / recovery / Base Rope 400 clear / Long Rope 480 preserves encounter / referenced target IDs exist: <결과>

## Automated — Story / Camera / Assets

- <해당 Beat별 자동 검증 결과>

## Visual Acceptance (사람)

각 Beat: Player visible? Next action visible? Story object visible? Toast가 조준을 가리지 않는가? Hazard/Enemy readable? Object staging 정확한가? Lighting이 시선을 이끄는가? Camera 너무 좁거나 넓지 않은가? Multiplayer 충돌 없는가?

## Gameplay / Story Acceptance

- <no-Augment mandatory clear 등 §10 체크리스트 결과>

## Result

`PASS / PASS WITH NOTES / REVIEW / FAIL·REDESIGN`
