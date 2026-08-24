# Historical Generation Prompts

상태: `SUPERSEDED / PROVENANCE ONLY / DO NOT USE FOR NEW FRAME AUTHORING`

이 문서는 현재 승인된 저해상도 프레임이 만들어진 과거 생성 이력만 보존한다. 앞으로 `CONTINUITY WARDEN`의 새 캐릭터·모션은 고해상도 ImageGen sheet를 생성·축소하지 않고 `../logical-64x96/`의 승인 픽셀 프레임을 직접 편집한다.

## 공통 고정값

- Use case: `stylized-concept`
- Asset type: pixel-art game boss animation keyframe sheet
- Identity anchor: `continuity-warden-phase-concepts/source/pixel-normalized-v3-player-style/`
- 한 cell에 같은 Warden 한 명, right-facing, 전신, 동일 scale과 bottom-center anchor
- compact Helmet, small head-to-shoulder ratio, Cyan visor, Graphite armor, Cold Steel exoskeleton, compact forearm Shield, short Shock Baton, back/waist Thruster housing 유지
- 큰 hard square pixel, near-black outline, flat cluster shading, 14색 고정 팔레트
- 투명 배경, 텍스트·UI·Rope·VFX·추가 장비·추가 캐릭터 금지

## combat-idle

3×2, 6 frame. Shield는 허벅지/골반 옆에 낮추고 Baton은 아래에서 비활성. 양발 접점은 고정하며 호흡, 어깨 상승, Helmet dip과 작은 무게중심 이동만 사용한다. Frame 6은 Frame 1로 자연스럽게 이어진다.

첫 생성본은 Shield가 Guard처럼 정면에 있어 탈락했다. 선택본은 낮춘 Shield 기준 이미지를 identity anchor로 다시 생성한 `source/imagegen/combat-idle-sheet-imagegen.png`다.

## baton-combo

3×3, 9 frame. 1~~3은 짧은 전방 가로 타격, 4~~6은 반대 방향 되치기, 7~9는 명확한 Overhead Slam의 예고·접촉·회수다. Shield는 몸 옆에 유지하고 Shield Bash로 읽히지 않으며, 궤적·전기·스파크는 포함하지 않는다.

선택본: `source/imagegen/baton-combo-sheet-imagegen.png`

## guard

3×2, 6 frame. 중립에서 compact Shield를 올리고 낮은 무게중심의 전방 Guard를 만든 뒤, 정면 충돌 recoil, 재안정과 해제로 돌아온다. Helmet·Torso·양쪽 Leg가 Shield 뒤에 완전히 가려지지 않는다.

선택본: `source/imagegen/guard-sheet-imagegen.png`

## ground-dash

3×2, 6 frame. 중립 → 낮은 예고 → 짧은 발진 → 수평 travel → front-foot brake → 복귀. 긴 Charge, Shield Bash와 구분하고 Shield는 옆에, Baton은 뒤에 둔다. Thruster flame, trail, speed line과 dust는 포함하지 않는다.

첫 생성의 travel frame은 공중 도약처럼 보여 수정했고, 첫 수정은 prone tackle처럼 보여 다시 수정했다. 선택본은 약 35도 상체 전경사와 달리기형 travel keyframe을 가진 `source/imagegen/ground-dash-sheet-imagegen.png`다.
