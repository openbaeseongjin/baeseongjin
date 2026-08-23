# Verification ledger — Issue #897

- 검증 소유자: Codex
- 기준 브랜치: `origin/main`
- base/merge-base SHA: `f9ceaa5498c9109c041efe28e61fb70bf4f523ad`
- ledger 제외 content candidate tree: `0734cae849cbc5805fef4ec77e41bc157811c967`
- ledger 제외 binary diff fingerprint: `a2ceb74409645741ffc17942fd67acf0579b0b7c`
- Node: `v24.19.0`
- Python: `3.14.3`
- Browser URL: `http://127.0.0.1:4204/map-editor/preview.html?stage=4-4` (기본 sprite renderer)

## 자산·Runtime 결과

- Runtime/export SHA-256: PASS — far `5DC63879…`, mid `F2E3715A…`, near `6C35E0F6…`
- Runtime 구성: PASS — far RGB와 mid/near RGBA `1024×1536`, depth map은 authoring에만 존재하고 manifest는 캐시된 세 backdrop PNG만 참조
- 환경 asset validator: PASS — 6 atlases, 5 zones, 3 backdrop layers
- Area 선택: PASS — `sector-04-01`~`sector-04-08`이 `sector-04-upper-residential` package를 사용
- package alpha: PASS — Sector 03→04 경계 중심에서 양쪽 세 layer가 각각 `0.5`, ±256 world px에서 smoothstep 대칭 `0.84375/0.15625`, 각 package의 far/mid/near는 항상 같은 alpha
- sampling: PASS — 세 layer 모두 nearest sampling
- Boss override: PASS — `active` Boss Stage만 source Area 배경을 우선하며 inactive Stage는 현재 Sector 04 배경을 가리지 않음

## 브라우저 검수

- Desktop `1280×720`: PASS — 4-4 production Gameplay View에서 far/mid/near, authored terrain, Player, HUD 합성 순서 확인
- Mobile landscape `844×390`: PASS — 같은 Sector 04 package와 responsive crop 확인
- 시각 결함: PASS — 투명 구멍, 검은 가장자리, layer별 잔상, 건물 윤곽 이중 노출 없음
- Browser console renderer warning/error: `0`

## 저장소 검증

- `npm test`: PASS — Sector 02→03과 Sector 03→04 package 교차 전환, inactive/active Boss override, 승인 PNG hash 확인
- `npm run validate:environment-assets -- assets/runtime/environments/sector-04-upper-residential`: PASS
- `npm run check:scenario-integration`: PASS — 48 stages, 536 scenario files, 61 authored-area files, 6 authored-sector files
- `npm run check`: PASS — syntax 463 files, Area Spec 48/48, generated outputs 54, direction 26 definitions/187 tracks
- `npm run format:check`: PASS
- `git diff origin/main --check`: PASS
- 최신 `origin/main` rebase: PASS — base `f9ceaa5498c9109c041efe28e61fb70bf4f523ad`, #905의 inactive Boss 배경 계약을 유지하고 Sector 03→04 pair만 확장
- 동시 작업 조정: PASS — #897이 공용 환경 선택·교차 전환 계약을 먼저 병합하고 #910이 최신 main 위에서 Sector 05 공유 경계를 이어받음

## 미검증

- Sector 03→04 전체 수동 등반: 현재 canonical Runtime에는 Boss 03과 Sector 03→04 gameplay connector가 없어 실제 이동 경로가 열려 있지 않다. 이번 변경은 기존 경계 함수의 표현 package pair만 추가하며 collision·Gate·Camera·gameplay connector를 만들지 않는다.
- 모바일 실기기 GPU와 멀티플레이: 요청된 in-app Browser mobile landscape viewport와 로컬 단일 플레이 표현 범위 밖이므로 미검증
