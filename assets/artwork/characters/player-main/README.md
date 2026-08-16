# player-main 최종 캐릭터 모션 패키지

`player-main`은 사용자가 2026-08-15 제공한 `pixellab-ready-character.png`를 최종 외형 기준으로 삼은 기본 플레이어 캐릭터다. 일곱 상태의 21개 프레임을 24×24 투명 PNG 셀로 정규화했다.

## 제작 계약

| 항목 | 값 |
| --- | --- |
| asset ID | `player-main` |
| 필수 상태 | `idle`, `run`, `jump`, `fall`, `rope`, `hit`, `respawn` |
| 기본 방향 | 오른쪽, 왼쪽은 renderer `flipX` |
| 논리 프레임 | 24×24 px |
| 게임 출력 | 48×48 px |
| 기준 anchor | `(0.5, 0.625)` |
| 런타임 형식 | 투명 PNG multi-atlas + `sprite-manifest.json` |
| 런타임과 분리할 값 | collider, hitbox, 물리, 피해량, 네트워크 상태 |

## 최종 프레임

| 상태 | 프레임 | 판독 기준 |
| --- | ---: | --- |
| `idle` | 2 | 접지선·전체 높이를 고정하고 어깨·가슴·스카프만 움직이는 호흡 |
| `run` | 8 | 2등신 비율을 고정한 좌우 접지·하강·통과·상승, 짧은 다리의 무릎 방향·겹침·명암 교체 |
| `jump` | 1 | 다리를 접은 상승 실루엣 |
| `fall` | 1 | 팔·다리를 넓힌 하강 실루엣 |
| `rope` | 4 | 한 손 그립·빈 앞손·몸 전체는 고정하고, 긴 스카프가 계속 뒤쪽을 향한 채 얕은 파동이 목에서 꼬리 끝으로 이동 |
| `hit` | 2 | 수평 반동 뒤 웅크린 회복 자세 |
| `respawn` | 3 | 청록 실루엣 → 부분 복원 → 외곽광이 있는 완전 복원 |

달리기 clip의 frame duration은 여덟 프레임 내부 비율을 정의한다. 실제 phase는 `PlayerAnimationController`가 수평 이동 거리 180px당 한 주기로 진행하므로, 짧은 방향키 탭 뒤 관성 속도가 남아 있어도 제자리에서 여러 주기를 재생하지 않는다.

2026-08-15 사용자 검토에서 `idle`, `run`, `jump`, `fall`이 납품 승인됐다. `rope`, `hit`, `respawn`은 게임 연결을 위한 임시 프레임이며 추가 수정 전에는 최종 자산으로 배포하지 않는다. 최신 승인본만 묶은 전달 패키지는 `output/player-main-approved-motions-with-fall-2026-08-15/`에 있다.

## 결과 파일

- `export/player-main-sprite-sheet.png`: 전체 8×3 master sheet, 192×72 RGBA, 21개 사용 frame
- `export/locomotion.png`: 대기·점프·낙하·로프 6×2 atlas, 144×48 RGBA
- `export/run.png`: 달리기 전용 8×1 atlas, 192×24 RGBA
- `export/actions.png`: 5×1 atlas, 120×24 RGBA
- `preview/final-motion-review.png`: 21개 프레임 확대 검토 보드
- `preview/<state>.gif`: 상태별 timing을 적용한 검토용 animation
- `preview/test-results.md`: 정적·animation·runtime validator 결과

## 원본과 정규화

- 최종 외형 원본: `source/pixellab-ready-character.png` (58×55 RGBA, 사용자가 제공)
- 포즈 생성: OpenAI built-in ImageGen, identity-preserving reference workflow. `idle`·`run` v2는 `source/idle-run-v2-imagegen.png`, 긴 다리 후보 v3는 `source/run-v3-imagegen.png`, 2등신 비율을 복구한 최종 달리기 v4는 `source/run-v4-imagegen.png`에 보존한다.
- 생성 원본: `source/imagegen-master-sheet-rgb.png` (4×4 pose grid)
- 투명화 중간 결과: `source/imagegen-master-sheet-transparent.png`
- 정규화 도구: `source/normalize_generated_sheet.py`, `source/normalize_idle_run_v2.py`, `source/normalize_run_v3.py`, `source/normalize_run_v4.py`, `source/normalize_rope_v2.py`, `source/normalize_rope_v3.py`, `source/normalize_rope_v4.py`, `source/normalize_rope_v5.py`, Pillow nearest-neighbor

ImageGen 결과가 실제 alpha 대신 밝은 checkerboard RGB를 포함해, 가장자리와 연결된 중립색 background 및 matte fringe만 제거했다. 캐릭터 내부의 흰 눈과 청록 효과는 연결 성분이 달라 보존된다. 각 pose를 1px 이상 여백이 남는 24×24 셀로 맞추고 전체 sheet에 공통 24색 palette를 적용했다.

달리기 v4는 모든 frame 폭을 idle 최대 폭 이하로 제한하고, 하체 폭이 머리 폭보다 4px를 초과해 넓어지지 않도록 검사한다. 이 기준은 다리 교차를 보이게 하면서도 긴 런지 때문에 2등신 인상이 무너지는 회귀를 막는다.

로프 v5는 v3의 뒤쪽 한 손 그립·청록 손목의 빈 앞손·2등신 몸체를 네 프레임에 같은 픽셀로 복제한다. 스카프는 모든 프레임에서 목 뒤 x=7부터 셀의 안전 여백 x=1까지 수평으로 이어지고, 중심선의 1픽셀 굴곡만 목에서 꼬리 끝으로 이동한다. 따라서 꼬리의 가로 길이는 7px로 유지되고 세로 범위는 최대 5px라, 위아래로 깃발처럼 왕복하지 않고 이동 관성에 끌려 뒤로 흐르는 모습이 된다. 머리카락도 뒤쪽 끝의 작은 영역만 같은 방향으로 반응하며 그 밖의 픽셀 차이는 0이어야 한다. frame 높이와 폭, idle 대비 시각 질량, 중립 1×1 cue도 함께 검사한다. 로프 탑승 중 공격은 아직 별도 animation으로 구현하지 않았으며, 추가할 때는 그립 손과 지점을 고정하고 앞손만 공격한다.

외부 에셋은 사용하지 않았다. 제공된 원본의 프로젝트 사용 권한과 최종 귀속은 사용자·팀이 관리한다.

## 개발 연결

정규화된 runtime package는 `assets/runtime/characters/player-main/`에 있으며 게임 bootstrap이 기본 player definition으로 불러온다. `npm run validate:sprite-assets -- assets/runtime/characters/player-main` 통과 전에는 runtime-ready로 보지 않는다.
