# ONE ROPE — Boss06 `CONTINUITY WARDEN`
## `warden_baton_telegraph` Art Specification v1

> 목적: Boss06의 Baton 1/2 및 일부 Back Swing 계열에서 재사용할 수 있는 **공격 예고(wind-up) 자세**를 정의한다.
>
> 기준 캐릭터: 승인된 `warden_body_base`

---

# 1. 핵심 우선순위

## P0 — 반드시 맞아야 함

1. **Baton 공격이 곧 나올 것이 실루엣으로 읽혀야 함**
   - 오른손 Baton을 뒤·위로 당긴다.
   - active strike와 확실히 다른 wind-up 자세여야 한다.

2. **Shield 공격처럼 보이면 안 됨**
   - Shield는 공격 주체가 아니다.
   - 화면 전면을 Shield가 가리지 않는다.

3. **같은 Warden 유지**
   - Heavy Security Enforcer + Industrial Exosuit
   - Compact Helmet + Reinforced Collar
   - Graphite + Cold Steel
   - 제한적 Cyan

4. **몸의 회전이 공격 방향을 설명해야 함**
   - torso는 타격 방향 반대로 약간 비틀림
   - 다음 순간 정면 strike로 이어질 수 있는 준비 자세

5. **색보다 자세가 우선**
   - Telegraph를 Cyan 증가나 색 변화만으로 표현하지 않는다.

---

## P1 — 제작 구조

- Asset ID: `warden_baton_telegraph`
- Category: `characters`
- 기본 방향: right-facing
- left-facing: renderer `flipX`
- anchor: bottom-center / feet center
- Baton: separate
- Baton arm: separate
- Runtime timing이 authority
- game export: transparent RGBA PNG

---

## P2 — 스타일

- Baton은 짧고 굵은 산업용 shock baton
- 장검 / 광선검처럼 보이지 않음
- 손잡이와 타격부의 큰 덩어리 우선
- Cyan은 충전 상태 보조 accent 정도만 사용
- 장식보다 attack direction readability 우선

---

## P3 — 나중에 Polish

- 약한 Baton charge glow
- 짧은 pre-swing arc
- 손목/팔 actuator light
- 미세한 전기 spark

P3는 P0 판독성 통과 후 추가한다.

---

# 2. Gameplay Meaning

`warden_baton_telegraph`는 Warden의 근접 공격이 발동하기 전
플레이어에게 회피 또는 위치 변경 시간을 주는 시각 신호다.

플레이어는 텍스트 없이 다음을 이해해야 한다.

> “지금 Warden이 Baton을 휘두르기 직전이다.”

Animation은 Runtime의 telegraph 시간을 따른다.
그래픽 frame duration이 gameplay timing을 결정하지 않는다.

---

# 3. Required Pose

필수 자세:

- 오른손에 짧은 Shock Baton
- Baton을 몸 뒤·위로 당김
- 팔꿈치가 뒤로 빠짐
- 어깨가 타격 반대 방향으로 열림
- torso가 약간 비틀림
- 무릎은 안정적으로 굽힘
- 머리/visor는 목표 방향을 바라봄
- 다음 프레임에서 정면 strike로 자연스럽게 이어질 수 있음

금지:

- 이미 Baton이 목표 방향으로 완전히 뻗은 active pose
- Shield Bash 준비 자세
- Charge/Dash처럼 전신이 지나치게 전방으로 누운 자세
- Overhead Slam처럼 Baton이 머리 정중앙 위에 크게 올라간 자세

---

# 4. Baton Contract

Baton은 Warden의 오른손 장비다.

필수 특징:

- short-range
- industrial security weapon
- 한 손 사용
- 짧고 단단한 silhouette
- shock 기능을 제한적 Cyan으로 보조

금지:

- sword
- spear
- long staff
- giant energy blade
- supernatural weapon

---

# 5. Reuse Contract

이 telegraph base는 가능한 범위에서 아래 상태에 재사용한다.

- `baton-1`
- `baton-2`
- `back-swing`의 초기 wind-up 일부

단:

- `overhead-slam`은 별도 큰 wind-up 필요
- `counter-bash`는 Shield 계열이므로 재사용하지 않음

재사용은 pose readability가 유지되는 범위에서만 허용한다.

---

# 6. Canvas / Pivot

기본:

- Source canvas: `128×192 px`
- Intended world output: `128×192 world px`
- 1:1
- right-facing
- bottom-center / feet-center anchor

Baton이 canvas 밖으로 일부 확장될 경우:

- 정수 단위 확장 가능
- feet anchor 유지
- body scale 유지
- collider 변경 금지

---

# 7. Layer Order

공통:

```text
rear VFX
→ body
→ rear arm
→ weapon/shield
→ front arm
→ front VFX
```

Baton Telegraph 권장:

```text
rear VFX
→ body
→ rear baton arm
→ baton
→ front balancing arm
→ optional baton charge cue
```

Baton의 손잡이 pivot은 손 위치에 고정한다.

---

# 8. Collider / Runtime Boundary

Boss body collider:

**96×150 world px**

절대 규칙:

- Baton visual length ≠ attack hitbox length
- sprite가 melee damage range를 결정하지 않음
- telegraph frame이 attack timing을 변경하지 않음
- collider / damage / knockback / AI / physics 변경 금지
- Runtime state와 actionPhase가 authority

---

# 9. 이미지 제작 규칙

메인 이미지는 **한 장**만 제작한다.

이미지 안에 넣지 않는다:

- 설명글
- asset name
- 치수
- 표
- UI
- 여러 포즈
- sprite sheet 설명판
- 환경 장식

설명은 이 MD에서만 관리한다.

---

# 10. 검수 체크리스트

## P0 PASS

- [ ] 승인된 Warden과 동일 캐릭터
- [ ] Baton이 짧은 shock baton으로 읽힘
- [ ] Baton이 뒤·위로 당겨져 있음
- [ ] 다음 순간 정면 strike가 예상됨
- [ ] active strike와 확실히 구분됨
- [ ] Shield 공격처럼 보이지 않음
- [ ] Dash / Charge / Overhead Slam과 구분됨
- [ ] 텍스트 없이 telegraph로 읽힘

## 기술 PASS

- [ ] right-facing
- [ ] left = flipX 가능
- [ ] bottom-center anchor 유지
- [ ] transparent RGBA PNG
- [ ] pixel-art silhouette 유지
- [ ] collider / gameplay timing 변경 없음

---

# 11. 현재 상태

설계 규격 확정.

이미지 생성 시 반드시
**Shield-driven attack가 아니라 Baton wind-up pose**인지 먼저 검수한다.

P0 통과 전에는 다음 에셋으로 넘어가지 않는다.

---

# 12. 다음 에셋

PASS 후:

`warden_baton_strike_active`
