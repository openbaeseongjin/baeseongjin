# Boss03 구속 분리 자산 P0 검수

> 판정: **AUTHORING PASS / RUNTIME BLOCKED**

## 승인 대상

| 자산 | 규격 | SHA-256 |
| --- | --- | --- |
| `export/commander-grab-held-body-approved-128x192.png` | `128×192` RGBA | `4D7CC3D6BF1F4560244F9216C6F57DCC25185969D8773D732C7C984CF7FE6B29` |
| `export/commander-grab-held-hook-head-approved-48x48.png` | `48×48` RGBA | `734748C5C725E871554830B59C72C13E8B3DCA546D26E98266E7CDBD409EA7FC` |
| `export/commander-grab-held-chain-link-approved-16x16.png` | `16×16` RGBA | `EF45788AC0E2B0AE4836C9C81CF55714A07267D31BDD1F1E5787DDD403EE9383` |

## 점검 결과

- 세 PNG 모두 alpha가 `0/255`뿐이며 가장자리 불투명 픽셀과 잘림이 없다.
- 본체 불투명 범위는 `(6, 43)~(121, 152)`이고 발 바닥선은 공통 기준 `y=152`다.
- 본체는 당김의 수평 신전 자세와 다른 낮은 근거리 구속 자세이며, Player·훅·체인·조준선·VFX를 포함하지 않는다.
- 두 눈·상단 경고등·본체 비율·별도 손잡이를 쥔 대형 해머가 승인 외형과 일치한다.
- 훅 머리와 체인 링크는 당김 승인본과 바이트 단위로 동일해 상태 사이 장비 외형이 변하지 않는다.
- 정규화 도구를 다시 실행해도 크기·alpha·SHA-256이 변하지 않는다.

## 차단 경계

Boss03 전용 manifest·validator·renderer binding과 실제 Stage 1x·모바일 가독성 검수가 없으므로 Runtime-ready 승인은 하지 않는다. 짧은 체인 길이·회전·결합 좌표·Player 구속 위치·공격 판정은 향후 renderer와 gameplay 계약이 소유한다.
