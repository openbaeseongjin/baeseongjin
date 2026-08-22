# Verification ledger — Issue #827

- 검증 소유자: Codex
- 기준 브랜치: `origin/main`
- base/merge-base SHA: `000c5056a4f4148d6821c9a820f7b495c97d8ab9`
- ledger 제외 content candidate tree: `7645072d1b54693b29682230ba2c9d97ce3ad609`
- ledger 제외 binary diff fingerprint: `6726fcf4741524feaac7a2882dca49dd5f796d43`
- Node: `v24.19.0`
- Python: `3.14.3`
- Browser URL: `http://127.0.0.1:4199/` (query 없음, 기본 sprite renderer)

## 자산·Runtime 결과

- V8 depth far/mid/near 재현: PASS — moving threshold `190`, near threshold `220`, 좌·우 component 각각 정확히 2개
- 합성 무결성: PASS — neutral recomposition max RGB difference `0`, moving mask 밖 max RGB difference `0`
- Runtime/export 일치: PASS — far `A702F665…`, mid `27DF36C8…`, near `0C11EFD0…` SHA-256 동일
- Sector 02 불변성: PASS — focused test가 승인된 Sector 02 runtime 3개 PNG의 기존 SHA-256을 확인
- Runtime 구성: PASS — depth map은 authoring에만 존재하고 manifest는 캐시된 far RGB와 mid/near RGBA PNG만 참조
- package alpha: PASS — 경계 중심에서 Sector 02/03의 세 layer가 각각 동일한 `0.5` alpha, ±256 world px에서 smoothstep 대칭 `0.84375/0.15625`
- sampling/parallax: PASS — nearest sampling, 정수 좌표 이동, `0.018/0.030`, `0.050/0.065`, `0.080/0.100`
- 환경 asset validator: PASS — 6 atlases, 5 zones, 3 backdrop layers

## 브라우저 검수

- Desktop `1280×720`: PASS — Sector 02-08과 Sector 03-01 왕복, 색 전환·중앙 canyon·작은 시차·package 전체 alpha 확인
- Mobile landscape `844×390`: PASS — 같은 양방향 경계와 responsive crop 확인
- 시각 결함: PASS — 투명 구멍, 검은 가장자리, 늘어난 픽셀, layer별 별도 잔상, 건물 윤곽 이중 노출 없음
- Browser console warning/error: `0`
- 기본 URL query: 빈 문자열 — `?renderer=sprite` 없이 적용 확인

| Viewport | 구간 | FPS | frame interval p95 | draw p95 | recent / cumulative dropped steps |
|---|---|---:|---:|---:|---:|
| `1280×720` | Sector 02-08 | `121` | `10ms` | `5ms` | `0 / 0` |
| `1280×720` | Sector 03-01 V8 | `121` | `11ms` | `4ms` | `0 / 9` |
| `844×390` | Sector 02-08 | `121` | `11ms` | `4ms` | `0 / 0` |
| `844×390` | Sector 03-01 V8 | `121` | `11ms` | `4ms` | `0 / 18` |

Sector 03 새 Run 생성 직후 누적 drop이 Desktop `9`, Mobile `18` 증가했지만 3~5초 안정 샘플의 recent dropped steps는 모두 `0`이었다. Sector 02 기준과 비교해 FPS 또는 frame interval p95의 지속 회귀는 관찰되지 않았다.

## 저장소 검증

- `python .../extract_far_mid_near.py`: PASS
- `npm run validate:environment-assets -- assets/runtime/environments/sector-03-central-exchange`: PASS
- `node tests/sector03BackgroundTransition.mjs`: PASS
- 최신 `origin/main` rebase: PASS — base `000c5056a4f4148d6821c9a820f7b495c97d8ab9`, 충돌 및 binary diff fingerprint 변경 없음
- `npm test`: PASS — Sector 03 V8 far/mid/near Runtime transition focused test
- `npm run check`: PASS — syntax 397 files, Area Spec 16, generated outputs 21, direction 33 tracks, scenario integration 48 stages/547 files
- `npm run format:check`: PASS — 전체 대상 Prettier 확인
- `git diff origin/main --check`: PASS

## 미검증

- 모바일 실기기 GPU와 멀티플레이: 이번 변경은 authored background package와 기존 로컬 renderer 경계 권위에 한정되며, 요청된 in-app Browser mobile landscape viewport 밖의 실기기·네트워크 조합은 미검증
