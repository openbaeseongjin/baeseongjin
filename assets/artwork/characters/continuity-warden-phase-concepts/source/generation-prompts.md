# Historical Generation Prompts — Player-Style Pixel Regeneration v3

상태: `SUPERSEDED / PROVENANCE ONLY / DO NOT USE FOR NEW FRAME AUTHORING`

이 문서는 현재 승인된 64×96 픽셀 기준이 만들어진 과거 이력만 보존한다. 앞으로 Boss06 캐릭터·모션은 고해상도 ImageGen 원본을 새로 만들거나 축소하지 않고 승인된 logical PNG를 직접 편집한다.

## 공통 입력과 고정 규칙

- Identity anchor: `docs/boss/06/images/warden-reference/images/15b7dc49-3633-4e09-88f4-e6b0b7abf38e.png`
- Pose references: Guard `2bd43b91-69e5-4962-995c-919431c9290f.png`, Security Command `security-command/images/사이버_경비병과_홀로그램_방패.png`
- Pixel-language reference: `assets/runtime/characters/player-main/locomotion.png` 첫 idle frame과 `source/player-style-reference/player-idle-16x.png`
- 도구: OpenAI built-in ImageGen
- 한 명, 한 포즈, right-facing, 전신, 2:3 portrait
- Player의 `24×24 → 48×48`과 같은 world pixel 크기를 사용하기 위해 논리 `64×96`을 저작하고 최종 `128×192`에 2배 정수 확대
- 논리 `64×96`의 정확한 16배 미리보기인 `1024×1536` 생성
- Player와 같은 큰 정사각 픽셀, near-black 외곽, 평평한 명암 덩어리와 낮은 디테일 밀도 사용
- Graphite body, Cold Steel exoskeleton, 제한적 Cyan, compact Helmet/Visor, Solid Armor Plate Shield, Short Shock Baton, back/waist Thruster housing 고정
- VFX, 배경, 바닥, 그림자, 텍스트, UI, 시트, Rope, 신규 장비와 판타지 장식 금지
- 생성기가 투명 alpha 대신 밝은 체크 배경을 만든 경우 16:1 축소 뒤 연결 배경과 닫힌 공간의 white matte를 제거한다. 캐릭터 형태를 추가 생성하거나 보간하지 않는다.

## Phase Early — Guard

Prompt intent:

> Exact same Warden in a right-facing Guard pose. Match Player's huge square pixels, flat clustered shading and low detail density. Compact angular solid forearm shield forward, low stable weight, helmet/torso/legs still visible, short baton held back and inactive. Strict logical 64×96 pixel art rendered as a 16x nearest-neighbor preview; no VFX or background.

선택 원본: `source/pixel-normalized-v3-player-style/phase-early-human-duel-imagegen-16x.png`

첫 시안은 Shield가 몸 전체를 가리는 Riot Shield 비율이라 탈락했다. 선택 시안은 Shield를 약 60% 수준의 compact forearm plate로 줄이고 Torso와 양쪽 다리를 노출했다.

## Phase Mid — Security Command

Prompt intent:

> Preserve the exact Guard-frame identity and change only the pose. Upright stable feet, torso open, shield lowered beside the body, short baton lowered, one open hand issuing an external-system command. It must not read as melee, Guard, Counter, Dash, or Charge. No hologram or Beam VFX.

선택 원본: `source/pixel-normalized-v3-player-style/phase-mid-security-chain-imagegen-16x-v2-smaller-head.png`

초기 중반 원본은 같은 몸 크기에서 Helmet/Head만 초반·후반보다 커 보여 탈락했다. v2는 머리만 폭·높이 약 18% 줄여 reinforced collar 안에 다시 배치하고 command hand, Shield, Baton, Torso와 다리 크기는 유지했다. 이전 논리 프레임과 export는 각각 `*-v1-large-head.png`로 보존한다.

## Phase Late — Counter Ready

Prompt intent:

> Preserve the exact same Warden and equipment. Wide stable legs, torso open with a small forward lean, shield lowered beside/slightly behind the body but still visible, short baton low and inactive. Read as imminent Shield counter, not Guard, Baton wind-up, Dash, or Charge.

선택 원본: `source/pixel-normalized-v3-player-style/phase-late-control-pressure-imagegen-16x.png`

Charge 시안은 `Shield Bash` 오독 위험으로 탈락했다. 후반 기획의 실제 변화인 Counter 증가와 Guard 감소를 색·변신·신규 기술 없이 자세로 보여주기 위해 Counter Ready를 최종 대표 상태로 사용했다.

## 정규화 계약

1. ImageGen 선택 원본이 정확히 `1024×1536`인지 확인한다.
2. nearest-neighbor로 정확히 `64×96`에 16:1 축소한다.
3. 캔버스 가장자리와 연결된 밝은 무채색 배경 및 닫힌 공간의 white matte를 alpha 0으로 바꾼다.
4. 나머지 픽셀은 alpha 255로 고정한다.
5. Player의 near-black 화면 언어를 확장한 Graphite / Cold Steel / Cyan 최대 15색 팔레트에 최근접 매핑한다.
6. 64×96 논리 프레임의 feet center를 `x≈32`, 최하단을 `y=93`에 맞춘다.
7. 각 logical pixel을 동일한 `2×2` RGBA 블록으로 복제해 정확히 `128×192`로 만든다.
8. 4배 미리보기와 Player 거리 검수본은 nearest-neighbor 정수 확대만 사용한다.
