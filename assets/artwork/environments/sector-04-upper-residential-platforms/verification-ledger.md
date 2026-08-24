# Sector 04 Upper Residential platform verification ledger

- 검증일: 2026-08-24 (Asia/Seoul)
- 검증 소유자: Codex
- GitHub Issue: `#1002`
- Base SHA: `c74da1d1a88820f676b659d652b27a97622712b7`
- Candidate fingerprint: `858e0a444c30cfd4e1b009814032a6df6a0d23bfcaa3b394072f37c1f6753d4a`
- fingerprint 범위: 이 ledger를 제외한 Sector 04 platform authoring·export와 Runtime package 변경 파일의 sorted Git blob 목록
- Browser URL: `http://127.0.0.1:4184/?sector04-platform-v2=1`

## 제작·Runtime 경계

- 제작 도구: OpenAI built-in ImageGen V2 모듈 시트 + Pillow neutral-checker 제거·20색 RGBA 정규화·정수 픽셀 atlas builder
- 원본 형식: RGB PNG `1536×1024`, 정규화 RGBA PNG `1536×1024`, prompt Markdown, Python source
- Runtime 형식: RGBA `terrain-fill.png` `32×32`, RGBA `terrain-edge.png` `32×8`
- 라이선스: 프로젝트 자체 생성, 외부 에셋 복사 없음
- authoring/runtime SHA-256 동일:
  - fill: `A0751D9CBC19B4CDC49A7F497D031441AFF29E7F343340C117FC25B77123015F`
  - edge: `945ACBF8B50A6107D92EAC4B2F4256853A8347EB9E7C0704A99B3FF9C24B81E5`
- catalog·renderer·AREA-SPEC·Map Editor·collision·one-way chain·grappleable·Rope·Physics·Network 파일 변경 없음

## 검증 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| Environment validator | PASS | `Environment assets valid: environment-sector-04-upper-residential (6 atlases, 5 zones, 3 backdrop layers)` |
| 데스크톱 실제 게임 | PASS | Stage 4-4, `1280×720`, pale-ivory curb·연속 sage reveal·밀폐형 amenity skybridge fascia 판독 |
| 모바일 실제 게임 | PASS | Stage 4-4, landscape `844×390`, 1x 보행면·Player 판독 유지 |
| solid/one-way 문법 | PASS | solid는 기존 polygon 두께와 넓은 sealed fascia, one-way는 기존 얇은 chain과 `32×8` 중성 curb를 사용 |
| 색 경쟁 | PASS | warm gray·desaturated sage reveal이 Cyan Rope·Anchor 및 Red/Orange Telegraph와 분리됨 |
| fallback·atlas | PASS | 두 viewport 디버그 지표에 `ENV FALLBACK` 없음, console warning/error `0` |
| 물리·동선 보존 | PASS (diff invariant) | manifest palette·atlas와 PNG·문서만 변경; gameplay/world/network source 변경 없음 |

기존 검증 base `8ad9adadcb784116b05afff442849ec43109e322`에서 최신 `origin/main`으로 이동하며 Sector 02 enemy, story-display authored data, 공용 exit-gate·control-panel sprite가 추가됐다. 마지막 rebase의 `SharedSceneRenderers.js` 변경은 world object sprite 선택에 한정되고 Sector 04 environment package·terrain renderer·Stage 4-4 지형 입력에는 변경이 없다. Sector 04 candidate fingerprint도 동일하므로 플랫폼 데스크톱·모바일 화면 증거를 재사용했고, 상류 JavaScript 변경을 포함한 `npm run check`와 `npm run format:check`는 최신 base에서 다시 실행했다. 위 fingerprint는 ledger를 제외한 13개 staged blob을 정렬해 산출한 값이다.

## 전역 실루엣 상태

Sector 04는 Sector 02의 마모된 concrete·보수판, Sector 03의 graphite service deck와 다른 밝고 평평한 courtyard stone·sealed residential skybridge 실루엣을 가진다. 다만 이 base의 Sector 01·05·06 terrain PNG SHA-256은 서로 동일한 mock이므로, 저장소 전체 6-way 실루엣 구분은 해당 세 Sector의 전용 terrain 변경이 각각 병합된 뒤 완료된다.

## 최종 정적 검증

| 명령 | 결과 |
| --- | --- |
| `npm run check` | PASS |
| `npm run format:check` | PASS |
| `git diff --check` | PASS |

`npm test`는 사용자가 자동 테스트 실행을 명시하지 않아 저장소 규칙에 따라 실행하지 않았다.
