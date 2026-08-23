# Verification ledger — Issue #910

- 검증 소유자: Codex
- 기준 브랜치: `origin/main`
- base/merge-base SHA: `ee3c80567c8f5bf2727ce52bac83b939e726c0f8`
- ledger 제외 content candidate tree: `8c98627d20044cdb29ab90a919d101bd5dad0daa`
- ledger 제외 binary diff fingerprint: `bdbd21ec0f2cdaf5e7ceef4143b9dd338add1f52e27a7b0b6315088e0c77f570`
- Node: `v24.19.0`
- Python: `3.14.3`
- Browser URL: `http://127.0.0.1:4178/` (production single-player sprite renderer)

## 자산·Runtime 결과

- Runtime/export SHA-256: PASS — far `89db581580d864e49a111d3e5a05c3cf6e6e362601e30b1f471fa1201b85ac52`, mid `881d1837a32837c2b5e346fff91dc4a9367b726a426e1e26955f815cd8da94a4`, near `bd0647f9b5972bbdc1eedcd42872e54555fe219a8788f6644316cfaaa93f8753`
- 재현 빌드: PASS — 저장된 master·hidden Far·현재 이미지 전용 경계로 `build-layers.ps1`을 다시 실행했고 export와 Runtime 세 PNG가 일치
- 레이어 불변식: PASS — neutral composite의 원본 mismatch 0, Mid/Near alpha overlap 0, 보이는 원본 pixel mismatch 0, Far와 이동 합성의 투명 pixel 0
- Runtime 구성: PASS — far RGB와 mid/near RGBA `1024×1536`, 세 layer 모두 nearest sampling과 cache된 PNG를 사용
- 환경 asset validator: PASS — 6 atlases, 5 zones, 3 backdrop layers
- Area 선택: PASS — `sector-05-01`~`sector-05-08`이 `sector-05-continuity-control` package를 사용
- package alpha: PASS — Sector 04→05 경계 중심에서 양쪽 package가 각각 `0.5`, ±256 world px에서 smoothstep 대칭 `0.84375/0.15625`, 각 package의 far/mid/near는 항상 같은 alpha
- 동시 작업 조정: PASS — #897의 공용 Sector 04 선택·교차 전환 계약이 먼저 병합된 뒤 최신 main에서 Sector 05 pair만 확장

## 브라우저 검수

- Desktop `1280×720`: PASS — production single-player를 `5-1`에서 시작해 Far/Mid/Near, authored terrain, Player, HUD 합성 순서 확인
- Mobile landscape `844×390`: PASS — 같은 Sector 05 package와 responsive crop 확인
- 시각 결함: PASS — 투명 구멍, 검은 가장자리, layer별 잔상, 건물 윤곽 이중 노출 없음
- Browser console renderer warning/error: `0`

## 저장소 검증

- `npm run validate:environment-assets -- assets/runtime/environments/sector-05-continuity-control`: PASS
- `npm run check`: PASS
- `npm run format:check`: PASS
- `git diff --cached --check`: PASS
- 최신 `origin/main` rebase: PASS — base `ee3c80567c8f5bf2727ce52bac83b939e726c0f8`

## 미검증

- `npm test`: 사용자가 자동 테스트 실행을 명시하지 않아 저장소 규칙에 따라 실행하지 않음
- Sector 04→05 전체 수동 등반: package 경계의 표현 전환과 양쪽 실제 Stage 화면을 검수했으며 전체 gameplay traversal은 이번 배경 통합 범위 밖
- 모바일 실기기 GPU와 멀티플레이: in-app Browser mobile landscape viewport와 로컬 단일 플레이 표현 범위 밖
