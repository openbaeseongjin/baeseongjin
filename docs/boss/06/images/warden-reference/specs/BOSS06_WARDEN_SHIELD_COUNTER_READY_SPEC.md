# ONE ROPE — Boss06 `CONTINUITY WARDEN`
## `warden_shield_counter_ready` Art Specification v1

> 목적: Boss06의 `COUNTER READY` 상태를 `GUARD`와 즉시 구분 가능한 실루엣으로 표현한다.
>
> 기준 캐릭터: 승인된 `warden_body_base`
>
> 기준 방패: 승인된 `warden_shield_guard`와 **동일한 Solid Armor Plate Shield**

---

# 1. 핵심 우선순위

## P0 — 반드시 맞아야 함

1. **GUARD와 첫눈에 다른 실루엣**
   - Guard: Shield가 몸 앞을 크게 막음
   - Counter Ready: Shield가 **몸 옆·아래로 내려감**

2. **Shield는 사라지면 안 됨**
   - 같은 방패를 유지한다.
   - 단, 몸 앞을 가리지 않도록 낮추거나 뒤로 뺀다.

3. **상체가 열려 있어야 함**
   - 가슴과 torso가 보임
   - 몸을 약간 전방으로 기울임
   - 즉시 Shield Bash로 튀어나갈 수 있는 준비 자세

4. **승인된 Warden 외형 유지**
   - Heavy Security Enforcer 체형
   - Compact Helmet + Reinforced Collar
   - Back/Spine + Hip/Leg Exoskeleton
   - Graphite + Cold Steel
   - 제한적 Cyan

5. **색이 아니라 자세로 판독**
   - Counter Ready를 별도 색상으로 구분하지 않는다.
   - Shield 위치와 무게중심이 핵심이다.

---

## P1 — 제작 구조

- Asset ID: `warden_shield_counter_ready`
- Category: `characters`
- 기본 방향: right-facing
- left-facing: renderer `flipX`
- anchor: bottom-center / feet center
- Runtime timing이 authority
- game export: transparent RGBA PNG
- Shield와 Shield Arm은 separate layer 유지

---

## P2 — 스타일

- Shield: Heavy Angular + Compact Forearm 구조
- Surface: Solid Armor Plate
- Body: Graphite
- Exoskeleton / Shield: Cold Steel / Blue-gray
- Cyan: visor / active system 보조 accent만
- 작은 기계선보다 큰 silhouette 우선

---

## P3 — 나중에 Polish

- Counter trigger flash
- Shield Bash motion trail
- 짧은 impact spark
- 미세한 actuator glow

P3는 P0 판독성이 통과한 뒤 진행한다.

---

# 2. Gameplay Meaning

`COUNTER READY` 중 플레이어가 Warden 정면을 공격하면
Warden이 `Shield Bash`로 반격한다.

따라서 플레이어는 공격 전에 다음을 즉시 읽어야 한다.

> “이 자세는 Guard가 아니다. 지금 정면으로 들어가면 반격당한다.”

그래픽은 판정을 만들지 않고
기존 Runtime의 counter 상태를 표현한다.

---

# 3. Guard와의 차이

| 요소 | GUARD | COUNTER READY |
|---|---|---|
| Shield 위치 | 몸 앞 | 몸 옆 / 아래 |
| Shield 면적 | 크게 노출 | 축소되어 보임 |
| Torso | Shield 뒤에 숨음 | 전면 노출 |
| 무게중심 | 낮고 고정 | 전방으로 이동 |
| 인상 | 버팀 / 차단 | 튀어나갈 준비 |
| 다음 행동 | 방어 유지 | Shield Bash 가능 |

이 차이는 작은 화면에서도 확인되어야 한다.

---

# 4. Counter Ready Pose

필수 자세:

- 다리는 넓고 안정적으로 벌림
- 앞쪽 무릎은 약간 굽힘
- 상체는 전방 lean
- head/visor는 공격 방향을 봄
- Shield arm은 몸 옆·아래
- Shield는 최소한 일부가 화면에서 명확하게 보여야 함
- 반대쪽 팔은 균형 유지 또는 다음 행동 준비

금지:

- Shield가 다시 정면을 덮는 자세
- Shield가 완전히 사라지는 자세
- Baton 공격 준비처럼 보이는 자세
- Dash/Charge 준비처럼 과도하게 몸을 눕히는 자세

---

# 5. Shield Contract

Counter Ready에서도 Guard와 **동일한 Shield**를 사용한다.

변하는 것은:

- arm angle
- Shield position
- body lean
- weight distribution

변하지 않는 것은:

- Shield 디자인
- Shield 크기
- Shield 재질
- gameplay 판정 자체

별도 Counter 전용 방패를 만들지 않는다.

---

# 6. Canvas / Pivot

기본 계약:

- Source canvas: `128×192 px`
- Intended world output: `128×192 world px`
- 1:1
- right-facing
- bottom-center / feet-center anchor

Action pose 때문에 시각 영역이 넘어가면
정수 단위의 확장 canvas는 허용할 수 있지만:

- feet anchor는 유지
- body scale은 유지
- collider는 변경하지 않음

---

# 7. Collider / Runtime Boundary

Boss body collider:

**96×150 world px**

절대 규칙:

- Shield PNG가 counter hitbox를 만들지 않음
- sprite 크기로 front/rear 판정을 계산하지 않음
- Shield Bash 판정은 Runtime authority
- 그래픽으로 damage / physics / knockback / AI 변경 금지
- animation timing이 Runtime state timing을 바꾸지 않음

---

# 8. Layer Order

공통 계약:

```text
rear VFX
→ body
→ rear arm
→ weapon/shield
→ front arm
→ front VFX
```

Counter Ready 권장:

```text
rear shield portion
→ body
→ shield arm
→ lowered shield
→ front arm
→ optional counter cue
```

방패가 body 앞을 크게 가리지 않는 것이 핵심이다.

---

# 9. 이미지 제작 규칙

메인 이미지는 **한 장**만 제작한다.

이미지 안에 넣지 않는 것:

- 설명글
- asset name
- 표
- 치수
- 제작 노트
- UI
- 여러 포즈를 한 장에 모은 sprite sheet형 설명판

메인 이미지는 캐릭터와 자세 자체만 보여준다.

설명은 이 MD에서만 관리한다.

---

# 10. 검수 체크리스트

## P0 PASS

- [ ] 승인된 Warden과 같은 캐릭터로 보임
- [ ] 승인된 Guard와 같은 Shield를 사용함
- [ ] Shield가 화면에서 보임
- [ ] Shield가 몸 앞을 막지 않음
- [ ] torso가 명확히 보임
- [ ] 상체가 반격 방향으로 lean
- [ ] Guard와 텍스트 없이 구분 가능
- [ ] Dash / Baton pose와도 구분 가능

## 기술 PASS

- [ ] right-facing
- [ ] left는 flipX 가능
- [ ] bottom-center anchor 유지
- [ ] transparent PNG
- [ ] pixel-art silhouette 유지
- [ ] anti-aliasing에 의존하지 않음
- [ ] collider / physics 변경 없음

---

# 11. 현재 제작 상태

`warden_shield_counter_ready` 이미지 1차 시안 제작 단계.

특히 아래 두 항목을 최우선으로 검수한다.

1. **Guard와 충분히 다른가**
2. **Shield가 낮아졌지만 여전히 동일 장비로 보이는가**

두 항목 중 하나라도 실패하면 이미지 재제작 후 다음 에셋으로 넘어간다.

---

# 12. 다음 에셋

P0 PASS 후:

`warden_baton_telegraph`
