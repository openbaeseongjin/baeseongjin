# Continuity Warden Phase 1 VFX

상태: `AUTHORING PIXEL CANDIDATE / LOCAL RANGE IMAGE + PARTICLE CUE INTEGRATED / PNG RUNTIME CONTRACT PENDING`

## 목적과 범위

Boss06 `CONTINUITY WARDEN` 1페이즈의 충격봉, Guard, 지상 대시, 긴 돌진, Security Command와 단일 LOW/HIGH 보안 빔을 캐릭터 PNG와 분리된 픽셀 VFX로 고정한다. 전용 effects manifest·loader·validator가 없으므로 이 폴더는 authoring 자료만 소유하고 Runtime이나 `assets/runtime/effects/`를 변경하지 않는다.

- Category: `effects`
- Asset ID: `continuity-warden-phase-1-vfx`
- Source: `source/logical/`의 직접 저작 픽셀 PNG
- 제작 도구: Pillow의 integer pixel primitive와 승인된 캐릭터 logical frame 합성
- 고해상도 ImageGen·축소 과정: 사용하지 않음
- Character overlay logical frame: `64×96`
- Beam tile logical frame: `64×16`
- Direction telegraph logical frame: `64×32`
- Export: logical pixel의 정확한 2× nearest-neighbor 확대, transparent RGBA PNG, binary alpha
- Preview GIF와 review: checker 배경을 포함한 검수 전용
- Gameplay damage, bounds, timing, trigger, lifetime와 network authority: 범위 밖

## Cue map

| Effect ID                 | Frames | 결합 상태                           | 시각 언어                                                         |
| ------------------------- | -----: | ----------------------------------- | ----------------------------------------------------------------- |
| `baton-electric-arc`      |      9 | `baton-1`·`baton-2`·`overhead-slam` | Warning amber arc → Hazard contact flash → 지면 crack             |
| `guard-block-impact`      |      6 | `guard-block`                       | Shield 전면의 흰 impact star와 amber/pink 파편                    |
| `ground-dash-thruster`    |      6 | `ground-thruster-dash`              | 짧은 Cyan rear flame → 짧은 streak → 제동 먼지                    |
| `charge-thruster`         |      8 | `charge`                            | Cyan ring 축적 → 긴 core flame·trail → skid spark → recovery 잔류 |
| `security-command-glyph`  |      6 | `security-command`                  | 열린 손의 작은 Cyan ring·bracket pulse                            |
| `security-beam-telegraph` | 4 loop | LOW/HIGH beam warning               | Amber 점선 경계와 내부 순서 pulse                                 |
| `security-beam-active`    | 4 loop | LOW/HIGH beam active                | Pink danger band와 흰 core pulse                                  |
| `ground-dash-telegraph`   | 4 loop | 지상 대시 예고                      | Cyan 점선 경로와 짧은 chevron                                     |
| `charge-telegraph`        | 4 loop | 긴 돌진 예고                        | Amber 방향 고정선과 긴 chevron                                    |

LOW와 HIGH는 같은 beam tile을 서로 다른 authored hazard bounds에 배치한다. 높이 차이는 gameplay presentation object가 소유하며 PNG를 중복 제작하거나 VFX manifest에 판정 bounds를 넣지 않는다. 연속 빔 순서 표시는 Runtime의 existing warning object가 소유한다.

## 경로

- 직접 저작 logical frame: `source/logical/<effect-id>/frame-*.png`
- 투명 개별 export: `export/frames/<effect-id>/frame-*.png`
- 가로 atlas 후보: `export/<effect-id>.png`
- 단독 GIF: `preview/<effect-id>.gif`
- 캐릭터 합성 GIF: `preview/composite-*.gif`
- 전체 검수본: `preview/phase-1-vfx-review.png`
- 직접 도트 제작 스크립트: `source/build_direct_pixel_vfx.py`

## 제작 규칙

- 새 고해상도 원본을 생성하거나 축소하지 않는다.
- 모든 선, arc, shard, flame과 glyph는 logical grid에 정수 좌표로 직접 그린다.
- 캐릭터 silhouette, Shield 면, Baton 접점과 발밑을 장시간 가리지 않는다.
- 근접 예고는 amber, 대시는 cyan/sky, 실제 hazard contact와 beam active는 pink/white를 사용한다.
- 캐릭터 body와 VFX는 독립 PNG로 유지한다. 합성 GIF는 위치 검수 근거일 뿐 Runtime texture가 아니다.
- particle state나 frame lifetime을 네트워크 snapshot에 추가하지 않는다.

## Runtime 승격 전 남은 항목

- 공개 effects asset schema·loader·validator가 없어 PNG atlas 자체는 Runtime에서 읽지 않는다.
- `ContinuityWardenRuntime`의 기존 state·action phase와 동일 hazard bounds에 큰 계단형 amber/pink/white Baton range image와 전 폭 pink/white active beam range image를 procedural Canvas cue로 연결하고, particle은 추가 발동·impact 강조로 유지했다.
- 별도 effects 계약이 생기면 같은 presentation ID와 gameplay bounds를 유지한 채 PNG tile/overlay로 표현만 교체한다.
- 1x desktop/mobile Stage에서 Player·Rope·Anchor·지형 경계를 가리지 않는지 검수
- procedural Canvas cue와 향후 sprite VFX 중 최종 표현 소유자 결정
