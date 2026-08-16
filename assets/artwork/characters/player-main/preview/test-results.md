# player-main test results

- Result: **PASS**
- Master sheet: 192×72 RGBA, 24×24 cell 8×3
- Runtime atlases: locomotion 144×48, run 192×24, actions 120×24
- Required animations: 7/7
- Occupied frames: 21/21; trailing transparent cells: 3/3
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
- Run lower-body adjacent differences: 0.385, 0.306, 0.308, 0.072, 0.443, 0.310, 0.323, 0.226
- Run lower-body color differences: 0.917, 0.929, 0.879, 0.675, 0.866, 0.816, 0.839, 0.860

## Silhouette difference

| Check | Measured | Minimum | Result |
| --- | ---: | ---: | --- |
| idle 호흡 변화 | 0.089 | 0.020 | PASS |
| run 반대 접지 | 0.211 | 0.050 | PASS |
| run 반대 통과 | 0.217 | 0.050 | PASS |
| jump/fall 구분 | 0.350 | 0.250 | PASS |
| hit 반동/회복 | 0.548 | 0.350 | PASS |
| hit/respawn 구분 | 0.496 | 0.400 | PASS |

## Animation previews

| State | Frames | GIF durations (ms) | Result |
| --- | ---: | --- | --- |
| `idle` | 2 | 520, 520 | PASS |
| `run` | 8 | 90, 90, 90, 90, 90, 90, 90, 90 | PASS |
| `jump` | 1 | 1000 | PASS |
| `fall` | 1 | 1000 | PASS |
| `rope` | 4 | 90, 90, 90, 90 | PASS |
| `hit` | 2 | 80, 160 | PASS |
| `respawn` | 3 | 150, 150, 150 | PASS |

## Manual visual review

- `idle`: 접지선과 전체 높이를 유지하며 어깨·가슴·스카프만 작게 호흡한다.
- `run`: 2등신의 큰 머리와 짧은 몸통·다리를 유지한 채 좌우 접지·하강·통과·상승 자세가 교차한다.
- `jump`/`fall`: 다리를 접은 상승 자세와 팔다리를 편 하강 자세가 구분된다.
- `rope`: 그립 손·빈 앞손·머리 중심·몸통·골반·다리를 고정하고, 스카프는 네 프레임 내내 뒤쪽으로 뻗은 채 얕은 파동만 목에서 꼬리 끝으로 전달된다.
- `hit`: 수평 반동 뒤 웅크린 회복 자세로 이어진다.
- `respawn`: 청록 실루엣에서 완전한 캐릭터와 외곽광으로 진행한다.
- 48×48 실제 출력에서도 검은 몸, 흰 눈, 빨간 스카프와 상태 실루엣이 판독된다.

자동 validator와 저장소 전체 검사는 아래 명령의 실제 실행 결과로 별도 확인한다.
