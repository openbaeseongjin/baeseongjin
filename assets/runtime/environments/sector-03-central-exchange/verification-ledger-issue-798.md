# Verification ledger — Issue #798

- 검증 소유자: Codex
- 기준 브랜치: `origin/main`
- base/merge-base SHA: `84f5e2cf4c10833c3b19d6e0b44516fe90bb84bc`
- ledger 제외 content candidate tree: `fd56b325148558c1662f1cffdead232559f52513`
- ledger 제외 binary diff fingerprint: `6662a0c2ce2d2a9f59493c80dfdd4eb6564b9db5`
- Node: `v24.19.0`
- Python: `3.14.3`
- Browser URL: `http://127.0.0.1:4198/` (query 없음, 기본 sprite renderer)

## 자산·Runtime 결과

- V4 depth-islands 정규화: PASS — threshold `227`, 8-connectivity component 정확히 2개, neutral recomposition max RGB difference `0`
- one-sided seam 생성: PASS — 기존 Sector 02 fixed 상단과 새 Sector 03 fixed 하단 일치, Sector 03 island 하단 alpha max `0`, Sector 03 하단 `512px` 밖은 승인 V4와 동일
- Sector 02 불변성: PASS — Runtime `backdrop-fixed.png`, `parallax-island-left.png`, `parallax-island-right.png` SHA-256이 기존 승인값과 일치
- Runtime 구성: PASS — depth map은 authoring에만 존재하고 manifest는 fixed RGB PNG와 좌·우 RGBA PNG만 참조
- package alpha: PASS — 경계 중심에서 Sector 02/03의 세 레이어가 각각 동일한 `0.5` alpha, ±256 world px에서 smoothstep 대칭 `0.84375/0.15625`
- sampling/parallax: PASS — 모든 authored backdrop draw에서 smoothing 비활성, 기존 `0.018/0.030`, `0.080/0.100` 수치 유지
- `npm run validate:environment-assets -- assets/runtime/environments/sector-03-central-exchange`: PASS — 6 atlases, 5 zones, 3 backdrop layers

## 브라우저 검수

- Desktop `1280×720`: PASS — Sector 02-08→03-01 및 03-01→02-08 왕복, 색 전환·중앙 shaft·작은 시차·package 전체 alpha 확인
- Mobile landscape `844×390`: PASS — 같은 양방향 경계와 responsive crop 확인
- 시각 결함: PASS — 투명 구멍, 검은 가장자리, 늘어난 픽셀, fixed/island 별도 잔상, 건물 윤곽 이중 노출 없음
- Browser console warning/error: `0`
- 기본 URL query: 빈 문자열 — `?renderer=sprite` 없이 적용 확인

| Viewport | 비교 구간 | FPS | frame interval p95 | recent dropped steps | cumulative dropped steps |
|---|---|---:|---:|---:|---:|
| `1280×720` | Sector 01-08 / 02-01 기준 | `121 / 121` | `9 / 9ms` | `0 / 0` | `0 / 0` |
| `1280×720` | Sector 02-08 / 03-01 V4 | `121 / 121` | `9 / 9ms` | `0 / 0` | `0 / 2` |
| `844×390` | Sector 01-08 / 02-01 기준 | `121 / 121` | `9 / 9ms` | `0 / 0` | `3 / 0` |
| `844×390` | Sector 02-08 / 03-01 V4 | `121 / 121` | `9 / 9ms` | `0 / 0` | `0 / 0` |

최신 `origin/main` rebase 뒤 Sector 03-1 Runtime geometry까지 포함해 다시 측정했다. Desktop Sector 03 새 Run 구성 중 누적 drop이 `2` 증가했지만 각 구간의 안정 샘플은 `recent dropped steps 0`을 유지했고, Mobile에서는 누적 drop도 증가하지 않았다. Sector 01→02 기준과 비교해 FPS 또는 p95의 지속 회귀는 관찰되지 않았다.

## 저장소 검증

- `npm test`: PASS — Sector 03 V4 Runtime transition focused test
- `npm run check`: PASS — syntax 288 files, Area Spec 16, generated outputs 20, direction 33 tracks, scenario integration 48 stages/547 files
- `npm run format:check`: PASS — lockfile 기준 `npm ci`로 개발 의존성을 복원한 뒤 전체 대상 Prettier 확인
- `git diff --cached --check` 및 rebase 후 `git diff origin/main --check`: PASS

## 미검증

- 모바일 실기기 GPU와 멀티플레이: 이번 변경은 authored background package와 기존 로컬 렌더러 경계 권위에 한정되며, 요청된 in-app Browser mobile landscape viewport 밖의 실기기·네트워크 조합은 미검증
