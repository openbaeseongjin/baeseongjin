# player-main test results

- Result: **PASS**
- Master sheet: 192×72 RGBA, 24×24 cell 8×3
- Runtime atlases: locomotion 144×48, run 192×24, actions 120×24, release-spin 192×24
- Unregistered runtime candidate: death 384×48
- Required animations: 7/7
- Occupied frames: master 21/21 + release-spin 8/8 + death candidate 8/8; trailing master cells transparent 3/3
- Cell clipping: 0 frames
- Idle ground line: stable; whole-body height delta <= 1px
- Compact run width: 18, 18, 18, 19, 19, 17, 17, 19px; idle maximum 19px
- Run head/lower-body widths: 13/15px, 13/14px, 12/16px, 13/16px, 13/16px, 12/16px, 12/15px, 13/16px; lower body may exceed head by at most 4px
- Compact rope width/height: 20×21px, 20×21px, 20×21px, 20×21px; idle maximum 19×21px
- Rope visual mass: 232, 232, 232, 231 pixels; idle floor 234px, minimum 90%
- Rope presentation scale: neutral 1×1
- Rope fixed body/hand differences outside hair/scarf zones: 0, 0, 0; required 0
- Rope adjacent hair/scarf differences: 0.233, 0.300, 0.350, 0.400; each >=0.200 and one >=0.350
- Rope adjacent loose-hair changed pixels: 4, 6, 4, 4; minimum 4
- Rope scarf tail: 21, 21, 21, 21 pixels, width 7, 7, 7, 7px, height 4, 5, 4, 5px, left edge x=1, 1, 1, 1
- Jump spin phases: 8 distinct frames; adjacent silhouette differences 0.303, 0.329, 0.348, 0.194, 0.148, 0.124, 0.130, 0.373
- Death candidate: exact canonical F1 identity, 8 frames, 700ms, 48×48 cells, separated 1~3px particles, expanding radii 8.17, 16.00, 21.05, 21.14
- Run lower-body adjacent differences: 0.385, 0.306, 0.308, 0.072, 0.443, 0.310, 0.323, 0.226
- Run lower-body color differences: 0.917, 0.929, 0.879, 0.675, 0.866, 0.816, 0.839, 0.860

## Silhouette difference

| Check | Measured | Minimum | Result |
| --- | ---: | ---: | --- |
| idle 호흡 변화 | 0.089 | 0.020 | PASS |
| run 반대 접지 | 0.211 | 0.050 | PASS |
| run 반대 통과 | 0.217 | 0.050 | PASS |
| jump/fall 구분 | 0.342 | 0.250 | PASS |
| hit 반동/회복 | 0.548 | 0.350 | PASS |
| hit/respawn 구분 | 0.496 | 0.400 | PASS |

## Animation previews

| State | Frames | GIF durations (ms) | Result |
| --- | ---: | --- | --- |
| `idle` | 2 | 520, 520 | PASS |
| `run` | 8 | 90, 90, 90, 90, 90, 90, 90, 90 | PASS |
| `jump` | 8 | 65, 65, 65, 65, 65, 65, 65, 65 | PASS |
| `fall` | 1 | 1000 | PASS |
| `rope` | 4 | 90, 90, 90, 90 | PASS |
| `hit` | 2 | 80, 160 | PASS |
| `death` | 8 | 120, 80, 80, 80, 80, 80, 80, 100 | PASS |
| `respawn` | 3 | 150, 150, 150 | PASS |

`death`의 manifest frame duration 합계와 검토 GIF는 모두 700ms다.

## Manual visual review

- `idle`: 접지선과 전체 높이를 유지하며 어깨·가슴·스카프만 작게 호흡한다.
- `run`: 2등신의 큰 머리와 짧은 몸통·다리를 유지한 채 좌우 접지·하강·통과·상승 자세가 교차한다.
- `jump`/`fall`: 흰 눈·청록 포인트·붉은 스카프가 타원 둘레를 이동하는 8단계 상승 회전과 팔다리를 편 하강 자세가 구분된다.
- `rope`: 그립 손·빈 앞손·머리 중심·몸통·골반·다리를 고정하고, 스카프는 네 프레임 내내 뒤쪽으로 뻗은 채 얕은 파동만 목에서 꼬리 끝으로 전달된다.
- `hit`: 수평 반동 뒤 웅크린 회복 자세로 이어진다.
- `respawn`: 청록 실루엣에서 완전한 캐릭터와 외곽광으로 진행한다.
- `death`: 초반 캐릭터 형태가 뭉개지지 않고, 이후 작은 푸른 파편이 방사형으로 벌어진다.
- 48×48 실제 출력에서도 검은 몸, 흰 눈, 빨간 스카프와 상태 실루엣이 판독된다.
- 실제 게임은 데스크톱 1280×720과 모바일 390×844에서 로드 경고 없이 확인했다.

`npm run validate:sprite-assets -- assets/runtime/characters/player-main` 결과: `Sprite assets valid: player-main (5 atlases, 8 animations)`.

저장소 전체 검사는 최종 candidate에서 별도 실행한다.
