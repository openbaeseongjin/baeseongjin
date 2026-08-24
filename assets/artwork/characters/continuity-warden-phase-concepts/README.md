# Continuity Warden Phase Pixel Concepts

상태: `USER-APPROVED PIXEL IDENTITY / REFERENCE-ONLY / NOT RUNTIME-READY`

## 목적

Boss06 `CONTINUITY WARDEN`의 단일 HP 전투에서 달라지는 초반·중반·후반 강도를 같은 캐릭터 외형의 대표 픽셀 프레임 세 장으로 고정한다. 화면에 P1/P2/P3를 표시하거나 변신·신규 기술을 추가하지 않는다.

## 공통 자산 계약

- Category: `characters`
- Asset ID: `continuity-warden-phase-concepts`
- Source / world output: `128×192 px`, `1:1`
- 실제 저작 격자: `64×96 logical px`; 각 논리 픽셀을 정확한 `2×2` 블록으로 확대해 `128×192`에 배치
- 화면 도트 밀도 기준: 현재 Player의 `24×24 source → 48×48 world output`과 동일한 source-pixel `2×` 출력
- Format: transparent RGBA PNG, binary alpha
- Direction: right-facing; left는 향후 renderer `flipX`
- Anchor: bottom-center / feet center; 불투명 픽셀의 최하단은 `y=187`, 하단 투명 여백은 4px
- Palette: transparent + Graphite / Cold Steel / limited Cyan 최대 15색
- 동일 외형: compact security helmet, cyan visor, back/spine + hip/leg exoskeleton, compact Solid Armor Plate Shield, short Shock Baton, back/waist Thruster housing
- Collider `96×150`, hitbox, damage, physics, AI와 network authority는 이미지와 별도다.
- 캐릭터 PNG에는 Beam, command glyph, charge trail, spark, dust 등 VFX를 합치지 않는다.

## 사용자 승인 제작 기준

`export/`의 세 대표 픽셀 이미지와 `preview/boss-phase-review.png`를 Boss06 후속 캐릭터·모션의 외형 기준으로 사용한다.

- 새 프레임은 `source/pixel-normalized-v3-player-style/*-logical-64x96.png`와 승인된 애니메이션 logical frame을 직접 편집한다.
- 새 고해상도 ImageGen 원본이나 고해상도 keyframe sheet를 만든 뒤 64×96으로 축소하지 않는다.
- 기존 `1024×1536` 생성물과 이전 고해상도 콘셉트는 제작 이력 보존용 `SUPERSEDED / DO NOT USE FOR NEW FRAME AUTHORING`이다.
- 128×192 export와 정수 확대 preview는 승인 logical pixel을 그대로 복제한 표시 결과이며 별도 고해상도 저작 기준이 아니다.
- 현재 Helmet/Head 비율, 몸 크기, 장비 위치, 팔레트와 feet/bottom anchor를 바꾸지 않는다.

## 페이즈 대표 프레임

| 구간 | Export                                   | 대표 상태        | 기획 판독                                                                                        |
| ---- | ---------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| 초반 | `export/phase-early-human-duel.png`      | Guard            | 인간전 중심. 전방 방패의 큰 면과 낮은 무게중심이 보이되 Helmet·Torso·Leg를 가리지 않는다.        |
| 중반 | `export/phase-mid-security-chain.png`    | Security Command | 보안 장치 사용 증가. 안정된 발, 열린 command hand, 낮춘 Shield와 Baton으로 직접 공격과 구분한다. |
| 후반 | `export/phase-late-control-pressure.png` | Counter Ready    | Guard 감소·Counter 증가. Shield를 몸 옆/아래로 내리고 Torso를 열어 정면 반격 압박을 전달한다.    |

후반 대표 프레임은 최초 Charge 시안을 사용하지 않는다. 해당 시안은 Shield가 진행 방향을 선점해 Shield Bash로 오해될 수 있어 폐기했으며, 현행 전투 강도 문서의 `반격 사용 증가 / 방어 사용 감소 / 신규 기술 없음`을 더 직접적으로 설명하는 Counter Ready를 선택했다.

## 과거 제작·정규화 이력

- 과거 생성 도구: OpenAI built-in ImageGen; 신규 Boss06 frame 제작에는 사용하지 않음
- Player 스타일 기준: `assets/runtime/characters/player-main/locomotion.png`의 24×24 idle frame; 확대 기준은 `source/player-style-reference/`
- 생성 원본: `1024×1536`, 논리 `64×96`의 16배 정수 미리보기
- 정규화: nearest-neighbor `16:1` 축소 → 밝은 checker matte 제거 → 불투명 alpha `255` / 배경 alpha `0` 고정 → 최대 15색 고정 팔레트 → feet-center 정렬 → 각 논리 픽셀을 정확한 `2×2`로 확대
- 승인된 제작 원본은 64×96 논리 프레임이며 같은 폴더의 1024×1536 생성물은 이력 보존 전용
- 4배 정수 검수 이미지: `preview/*-4x.png`
- 최종 세 포즈 검수본: `preview/boss-phase-review.png`; Player는 표시하지 않음
- Player와 실제 출력 밀도만 대조한 이전 검수본: `preview/player-boss-distance-review.png`
- 이전 고해상도 콘셉트와 128×192 세부 도트 후보: `source/*-imagegen.png`, `source/pixel-normalized-v2/`; `SUPERSEDED / DO NOT USE AS PIXEL EXPORT`
- 상세 prompt와 탈락 사유: `source/generation-prompts.md`

## 검수 결과

- 세 export 모두 정확히 `128×192`, `Format32bppArgb`
- alpha 값은 `0, 255`만 존재해 반투명/안티앨리어싱 경계 없음
- 각 export는 투명색을 제외한 14~15색 제한 팔레트 사용
- 모든 `2×2` output 블록의 RGBA가 완전히 동일하고 대응하는 `64×96` 논리 프레임과 일치
- Player와 Boss가 모두 source pixel 하나를 world `2×2`로 출력하므로 같은 카메라 거리에서 도트 크기가 일치
- source에서 logical까지 `1024×1536 → 64×96`의 정확한 16:1 축소, logical에서 output까지 정확한 2:1 확대
- 상태 차이를 색이 아닌 Shield 위치, Torso 노출, 무게중심과 팔 방향으로 구분
- 중반 Helmet/Head는 초반·후반과 같은 어깨 대비 비율로 축소하고 Security Command의 몸·장비·손동작은 유지
- 한 명·한 포즈·한 장, 텍스트·UI·환경·VFX 없음
- Giant mecha, Rope 장비, Energy Shield, 신규 무기, horn/cape/cloth와 과도한 Cyan 없음

실제 Boss 전용 character manifest·loader·validator 계약은 아직 없다. 따라서 이 결과를 runtime-ready로 부르거나 `assets/runtime/`에 연결하지 않는다. Runtime 승격 전에는 실제 Stage의 1x·모바일 Gameplay View에서 Player·Rope·Anchor·Telegraph와 함께 실루엣을 다시 검수하고, Shield/Baton arm 및 VFX layer 분리와 animation frame 계약을 별도로 확정해야 한다.

첫 모션 제작 우선순위인 `combat-idle`, 충격봉 3연타, `Guard`, 지상 추진 대시의 저작 후보는 [`../continuity-warden-animation-set-v1/`](../continuity-warden-animation-set-v1/)이 소유한다. 세 페이즈 대표 이미지는 모션 keyframe 근거로만 사용하며 페이즈별 Idle 교체나 변신으로 해석하지 않는다.

## 출처와 범위

- 디자인 근거: `docs/boss/06/`, `src/game/boss-authoring/specs/boss-06.json`
- 이미지 근거: GitHub `docs/boss/06/images/warden-reference/`의 reference-only 이미지와 상태 규격
- 외부 참고 이미지의 production provenance와 라이선스: 미검증
- 이번 변경 범위: authoring 픽셀 후보와 문서만. Runtime, collider, hitbox, damage, AI, physics, renderer와 network state는 변경하지 않는다.
