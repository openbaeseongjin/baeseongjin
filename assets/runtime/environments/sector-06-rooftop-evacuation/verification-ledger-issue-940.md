# Verification ledger — Issue #940

- 검증 소유자: Codex
- 기준 브랜치: `origin/main`
- base/merge-base SHA: `504daea15049675dcad54f97437c450954f3b6f7`
- ledger 제외 content candidate tree: `ff1f4263ed70e11dbe48a3a4b21eb38d123a9be6`
- ledger 제외 staged binary diff fingerprint: `a1b8f73eacb3ece8b4b016bf67215e2063d9bc5d100096f6871c9e92b040a435`
- Node: `v24.19.0`
- Python: `3.14.3`
- Browser URL: `http://127.0.0.1:4194/` (production single-player sprite renderer)
- 최신 `origin/main` rebase: PASS — `504daea15049675dcad54f97437c450954f3b6f7`; upstream 변경은 Boss·Sector 02 character·운영 배포 범위이며 환경 renderer/package diff는 동일해 browser 증거를 재사용함

## 자산·Runtime 결과

- Offline 재현: PASS — threshold `224`, 8-connectivity, minimum component `500px`에서 좌 `437,056px`·우 `381,101px` 두 island, centroid X `201.05/841.71`, neutral max channel difference `0`, offset preview `+8/-8px`
- Runtime/export SHA-256: PASS — fixed `E5044DD8BEAD04730BD2A7E03B9467E435931D175E89330143E1C4B6558F8D5D`, left `306316E2534B091DADBEDCCDA68415A1F8FE429E8A37B41296C26CB4F4C1C97A`, right `4DA2E58159FBB6503B3262EE2E4961579A8F4CC0B686AEA947DCBAAD7FAD3E9B`
- 환경 asset validator: PASS — 6 atlases, 5 zones, 3 backdrop layers
- Area 선택: PASS — `sector-06-01`~`sector-06-08`이 `sector-06-rooftop-evacuation` package를 사용
- 전환 중간값: PASS — Sector 05 세 layer는 각각 alpha `0.5`·filter `blur(6.00px)`, Sector 06 세 layer는 각각 alpha `0.5`·filter `none`
- 경계 권위: PASS — 기존 `5-8 → Boss05 → 6-1` gameplay 흐름·collision·Camera·network state를 변경하지 않음

## 브라우저 검수

- Desktop `1280×720`: PASS — 6-1·6-6·6-7·6-8 production 화면 확인
- Mobile landscape `844×390`: PASS — 6-6·6-7·6-8 responsive crop 확인
- 노출 리듬: PASS — 6-6 건물 전용, 6-7 상단의 좁은 하늘, 6-8의 넓어진 하늘·Pad 03·Shuttle 확인
- 시각 결함: PASS — 투명 구멍, 검은 가장자리, island seam, layer별 잔상 없음
- Browser console renderer warning/error: `0`

## 저장소 검증

- `npm run validate:environment-assets -- assets/runtime/environments/sector-06-rooftop-evacuation`: PASS
- `npm run check`: PASS
- `npm run format:check`: PASS
- `git diff origin/main..HEAD --check`: PASS
- `npm run check:scenario-integration`: PASS — 시작·종료 checkpoint

## 미검증

- `npm test`: 사용자가 자동 테스트 실행을 명시하지 않아 저장소 규칙에 따라 실행하지 않음
- Sector 05→06 전체 수동 등반: 실제 Stage 화면과 전환 renderer 중간값을 검수했으며 Boss05를 포함한 전체 gameplay traversal은 배경 통합 범위 밖
- 모바일 실기기 GPU와 멀티플레이: in-app Browser mobile landscape viewport와 로컬 단일 플레이 표현 범위 밖
- 사용자 제공 참고 이미지의 외부 출처·사용권 증빙: 별도 확인 자료가 없어 authoring README에 미확인 상태를 유지
