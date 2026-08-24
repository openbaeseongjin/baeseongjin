# ONE ROPE — Boss06 `CONTINUITY WARDEN`
## Warden Body Base Art Specification v1

> 목적: Boss06 `CONTINUITY WARDEN`의 첫 제작 에셋인 `warden_body_base`를 실제 게임 그래픽으로 제작하기 위한 확정 규격.
>
> 본 문서는 현재 GitHub 그래픽 규칙과 지금까지 확정한 디자인 결정을 기준으로 한다.

---

## 1. Asset ID

`warden_body_base`

작업 분류:

- Category: `characters`
- Authoring path: `assets/artwork/characters/<asset-id>/`
- Runtime 리소스 연결은 별도 통합 단계에서 진행
- 게임용 export는 투명 PNG 사용

---

## 2. Core Character Direction

### Final Direction

**Heavy Security Enforcer + Industrial Exosuit**

기본 체형은 무겁고 안정적인 인간형 보안 집행자이며,
Industrial Exosuit는 작은 기계 디테일이 아니라 큰 구조 단위로만 표현한다.

### Character Identity

- human-scale final boss
- security enforcer
- human wearing powered industrial/security equipment
- giant mecha 금지
- humanoid robot처럼 보이지 않도록 유지
- 작은 화면에서도 실루엣으로 역할이 읽혀야 함

---

## 3. Body Silhouette

### Body Type

- 넓은 어깨
- 두꺼운 torso
- 안정적인 하체
- 전진 시 무게감 있는 중심
- 일반 인간형보다 강한 존재감
- 지나치게 거대한 체형은 금지

### Exoskeleton Distribution

**Back / Spine + Hip / Leg**

주요 외골격 구조:

- back/spine frame
- waist actuator
- hip support
- knee actuator

상체 전면과 팔 주변은 비교적 단순하게 유지한다.

이유:

- Shield/Baton silhouette 보존
- Thruster Dash / Charge의 기계적 설득력 확보
- 작은 화면에서 기계 디테일 노이즈 방지

---

## 4. Head / Helmet

### Direction

**Compact Security Helmet + Reinforced Collar**

- 작은 보안 헬멧
- visor 포함
- neck/shoulder reinforced collar
- 얼굴 디테일보다는 helmet silhouette 우선
- helmet + collar는 body에 bake

금지:

- 지나치게 큰 helmet
- giant mech head
- 과도한 antenna / cable / decoration
- 얼굴 세부 묘사에 의존하는 판독

---

## 5. Color / Value Structure

### Base Palette Direction

- Body: **Graphite**
- Exoskeleton: **Cold Steel / Blue-gray**
- Helmet / Collar: Graphite 계열
- Visor: 제한적인 Cyan
- Thruster / active system: 제한적인 Cyan

### Readability Rule

상태 차이를 색으로 해결하지 않는다.

우선순위:

1. pose
2. silhouette
3. weight distribution
4. direction
5. VFX
6. color

Cyan은 시스템 활성 상태를 보조하는 용도로만 사용한다.

---

## 6. Shield Direction

> Shield 자체는 별도 파츠지만, body base와의 비율 및 결합을 고려하기 위해 본 문서에 기록한다.

### Shield Form

**Heavy Angular + Compact Forearm Shield**

### Shield Surface

**Solid Armor Plate**

특징:

- 평상시 forearm에 밀착
- Guard에서는 전방 면적이 크게 읽혀야 함
- Counter Ready에서는 몸 옆/아래로 빠져 silhouette가 작아져야 함
- 별도 energy panel / decorative rib / luminous strip은 필수 아님

---

## 7. Production Canvas

### Source Canvas

**128 × 192 px**

- 32px 기본 모듈 기준
- 4 × 6 tile canvas
- integer pixel grid
- anti-aliasing 금지
- non-integer scaling 금지

### Intended World Output

**128 × 192 world px**

- source 1 px = world 1 px
- 1:1 출력
- pixel snap 유지

---

## 8. Collider Relationship

Actual Boss Body Collider:

**96 × 150 world px**

중요:

- 제작 캔버스와 collider는 별도 계약
- sprite가 collider를 결정하지 않음
- hitbox / hurtbox / damage / physics 변경 금지
- 불투명 body 영역은 대략 96×150 기준과 자연스럽게 대응
- 장비 때문에 body 전체 canvas를 불필요하게 확장하지 않음

### Visual Envelope Rule

허용:

- helmet
- shoulder armor
- collar
- exoskeleton edge

등이 collider보다 약간 돌출되는 것

금지:

- 실제 피격 가능 영역을 심각하게 오해하게 만드는 과장
- giant silhouette
- 지나치게 넓은 transparent padding으로 pivot 감각이 흐려지는 구성

---

## 9. Facing Rule

### Authoring Direction

**Right-facing**

### Opposite Direction

**Left = renderer `flipX`**

기본적으로 좌우 별도 sprite를 제작하지 않는다.

예외는 gameplay readability가 실제로 깨질 때만 허용한다.

---

## 10. Anchor / Pivot

### Character Anchor

**Bottom-center / Feet center**

모든 Warden frame은 발 중앙 기준을 유지한다.

목적:

- 공격 상태 변경 시 body 흔들림 방지
- Guard / Baton / Charge에서 지면 접촉 유지
- frame 간 수평/수직 jitter 방지

---

## 11. Layer Order

확정 레이어 순서:

```text
rear VFX
→ body
→ rear arm
→ weapon/shield
→ front arm
→ front VFX
```

### Body Layer Includes

- torso
- helmet
- reinforced collar
- back/spine exoskeleton
- hip/leg exoskeleton
- base thruster housing

### Separate Layers

- shield
- shield arm
- baton
- baton arm
- combat VFX

---

## 12. Readability Requirements

`warden_body_base` 단독 상태에서도 최소한 다음이 보여야 한다.

- 일반 병사가 아니라 상위 보안 집행자
- 인간형
- 무거운 체형
- 산업용 외골격 착용
- Shield / Baton을 붙일 수 있는 명확한 arm silhouette
- 등/허리 Thruster 계통이 설득력 있게 연결될 공간
- final boss의 무게감

### Small-screen Rule

실제 게임 1x / 모바일 화면에서도:

- head
- torso
- shoulder
- legs
- exoskeleton mass

가 하나의 노이즈 덩어리가 되지 않아야 한다.

---

## 13. Pixel Art Rules

- nearest-neighbor 전제
- anti-aliasing 사용 금지
- pixel boundary 유지
- integer-scale 전제
- 1px 작은 장식 과밀 금지
- 큰 실루엣 블록 우선
- 확대 미리보기보다 실제 게임 크기 검수를 우선

세부 기계 묘사는 아래보다 후순위다.

1. body silhouette
2. pose readability
3. weapon readability
4. gameplay state readability
5. mechanical detail

---

## 14. Forbidden Directions

다음 방향은 사용하지 않는다.

- giant mecha
- supernatural armor
- CEO / corporate mastermind visual
- Rope/Grapple equipment
- excessive cyberpunk neon
- tiny cables / bolts / panels 과밀
- color-only state readability
- sprite shape로 collider 결정
- weapon을 body canvas에 bake하여 canvas를 과도하게 확장
- left/right duplicate production without necessity

---

## 15. Asset Delivery Structure

권장 authoring 구조:

```text
assets/artwork/characters/continuity-warden/
├─ README.md
├─ source/
├─ export/
│  └─ warden_body_base.png
└─ preview/
```

게임용:

- transparent RGBA PNG
- `warden_body_base.png`
- 128×192 px
- right-facing
- bottom-center anchor 기준
- 1:1 world output 전제

---

## 16. Preflight Checklist

이미지 제작 후 반드시 확인:

- [ ] 128×192 source canvas
- [ ] transparent background
- [ ] right-facing
- [ ] bottom-center feet anchor
- [ ] 96×150 collider 기준과 시각적으로 자연스러움
- [ ] helmet + collar가 body에 baked
- [ ] back/spine + hip/leg exoskeleton
- [ ] Shield/Baton은 body에 bake하지 않음
- [ ] Graphite + Cold Steel 중심
- [ ] Cyan은 제한적으로만 사용
- [ ] 1x에서 human-scale final boss로 읽힘
- [ ] giant mech처럼 보이지 않음
- [ ] 모바일 크기에서도 silhouette가 유지됨
- [ ] anti-aliasing 없음
- [ ] gameplay physics/collider를 그래픽으로 변경하지 않음

---

## 17. Next Production Step

이 문서가 확정되면 다음 순서로 진행한다.

1. `warden_body_base` 제작
2. 실제 게임 크기 silhouette 검수
3. collider 대비 시각 크기 검수
4. PASS 시 `warden_shield_guard`
5. 이후 `warden_shield_counter_ready`

`warden_body_base`가 통과하기 전에는 공격/Shield/VFX 세부 제작으로 넘어가지 않는다.
