# Boss03 당김 분리 자산 P0 검수

> 판정: **AUTHORING PASS / RUNTIME BLOCKED**

## 승인 대상

| 자산 | 규격 | SHA-256 |
| --- | --- | --- |
| `export/commander-grab-pull-body-approved-128x192.png` | `128×192` RGBA | `8E46EFBB84647D1BB70141084386EEDCC7FCC25FF4395D357F866757CF3A198C` |
| `export/commander-grab-hook-head-approved-48x48.png` | `48×48` RGBA | `734748C5C725E871554830B59C72C13E8B3DCA546D26E98266E7CDBD409EA7FC` |
| `export/commander-grab-chain-link-approved-16x16.png` | `16×16` RGBA | `EF45788AC0E2B0AE4836C9C81CF55714A07267D31BDD1F1E5787DDD403EE9383` |

## 점검 결과

- 세 PNG 모두 alpha가 `0/255`뿐이며 가장자리 불투명 픽셀과 잘림이 없다.
- 본체 불투명 범위는 `(5, 62)~(123, 152)`이고 발 바닥선은 공통 기준 `y=152`다.
- 본체는 중립·예고와 구분되는 후방 버팀 자세이며, 훅·체인·Player·조준선·VFX를 포함하지 않는다.
- 훅 머리는 단일 곡선 훅과 상단 결합 고리만, 체인 링크는 반복 가능한 단일 수평 링크만 포함한다.
- 해머는 반대 손에 별도 손잡이로 쥔 대형 사각 장비이며 팔이나 손과 융합되지 않았다.
- 정규화 도구를 다시 실행해도 크기·alpha·SHA-256이 변하지 않는다.

## 차단 경계

Boss03 전용 manifest·validator·renderer binding과 실제 Stage 1x·모바일 가독성 검수가 없으므로 Runtime-ready 승인은 하지 않는다. 체인 길이·결합 좌표·회전·공격 판정은 향후 renderer와 gameplay 계약이 소유한다.
