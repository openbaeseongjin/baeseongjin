# ONE ROPE — Boss06 `CONTINUITY WARDEN`
## `warden_thruster_dash_active` Art Specification v3

> Production Order: **7 — `warden_thruster_dash`**
>
> 대응 메인 이미지: `사이보그_워든의_질주_대시_sprite.png`
>
> 기준 문서: `BOSS06 GRAPHICS PRODUCTION PLAN — Continuity Warden Art Production Spec v1`
>
> 상태: **CONCEPT REVIEW**

---

# 1. 핵심 우선순위

## P0 — 반드시 맞아야 함

1. **짧고 빠른 Ground Thruster Dash로 읽혀야 함**
   - 짧은 horizontal reposition/contact attack
   - `Charge`보다 훨씬 짧고 압축된 인상
   - 순간적으로 오른쪽으로 치고 들어가는 움직임

2. **승인된 Warden 외형 유지**
   - human-scale final boss
   - Compact Security Helmet / Visor
   - Industrial Security Harness / Exosuit
   - Graphite body + Cold Steel exoskeleton
   - 제한적 Cyan
   - horn / plume / cape / cloth / crown-like ornament 금지

3. **기존 장비 그대로 유지**
   - 왼팔: Solid Armor Plate Shield
   - 오른손: 짧은 Shock Baton
   - Shield/Baton이 Dash의 공격 주체처럼 보이면 안 됨
   - 장비는 몸에 밀착되어 movement silhouette를 방해하지 않아야 함

4. **Thruster가 이동 방향을 설명**
   - 이동 방향: 오른쪽
   - Thruster exhaust/trail: 왼쪽 뒤
   - short-range Thruster
   - 긴 rocket trail 금지

5. **Dash와 Charge를 실루엣으로 구분**
   - Dash = 짧고 압축적
   - Charge = 길고 committed
   - 색이 아니라 body lean / stride / trail 길이로 구분

6. **한 명 / 한 포즈 / 한 장**
   - 텍스트 없음
   - 표 없음
   - UI 없음
   - sprite sheet 없음
   - concept sheet 없음

---

## P1 — 제작 구조

- Asset ID: `warden_thruster_dash_active`
- Parent Asset: `warden_thruster_dash`
- Category: `characters`
- 기본 방향: `right-facing`
- 좌측: renderer `flipX`
- Anchor: `bottom-center / feet center`
- Source baseline: `128×192 px`
- Intended world output: `128×192 world px`
- Body collider: `96×150 world px`
- Thruster housing: body baked 또는 small overlay
- Thruster flame/trail: **separate VFX**
- Shield: separate
- Baton: separate
- Runtime movement / timing authority 유지

---

## P2 — 스타일

- 짧고 무거운 forward lean
- 뒤발이 강하게 밀어내는 silhouette
- 앞다리는 짧게 전진
- Shield는 왼팔 측면에 밀착
- Baton은 오른손에 낮고 compact하게 유지
- Cyan은 visor / Thruster 중심
- 작은 기계 디테일보다는 movement silhouette 우선
- 실제 1x / 모바일 크기에서 방향이 읽혀야 함

---

## P3 — 나중에 Polish

- 짧은 exhaust particles
- 짧은 cyan speed streak
- 작은 dust kick
- actuator flash
- 짧은 heat / pressure cue

---

# 2. Gameplay Meaning

플레이어가 즉시 읽어야 하는 메시지:

> “Warden이 짧게 폭발적으로 치고 들어온다.”

Ground Thruster Dash는:

- short
- quick
- horizontal
- reposition
- active contact damage

를 가진다.

---

# 3. Dash vs Charge

| 요소 | Thruster Dash | Charge |
|---|---|---|
| 이동 인상 | 짧음 | 김 |
| Body lean | 압축적 | 길게 뻗음 |
| Trail | 짧음 | 김 |
| 행동 의도 | reposition + contact | committed pressure |
| miss recovery | 비교적 짧음 | 큼 |

두 상태는 **색이 아니라 자세와 trail 길이**로 구분한다.

---

# 4. 현재 이미지 검수

## PASS 요소

- horn / cape / cloth 없음
- compact security helmet 유지
- 짧은 Shock Baton 유지
- Shield가 기존 장비로 유지됨
- 오른쪽 진행 방향이 읽힘
- 왼쪽 뒤 Thruster 분사가 보임
- 짧은 Dash 인상은 확보됨
- 메인 이미지 1장 규칙 준수

## 보정 필요 요소

1. **Shield 밀착도**
   - 현재 Shield가 여전히 silhouette에서 크게 보임
   - Runtime용 최종 에셋에서는 몸 옆에 더 밀착해 Shield Bash 오해를 줄일 것

2. **다리 자세**
   - 실제 ground dash에서는 한쪽 발이 지면을 강하게 밀어내는 느낌을 더 강화
   - 공중 부양처럼 읽히지 않도록 발 접지감을 명확히 할 것

3. **Thruster VFX 분리**
   - 본체 PNG와 trail을 분리
   - trail 길이가 실제 damage path를 정의하지 않음

현재 판정:

**CONCEPT PASS / RUNTIME POLISH REQUIRED**

---

# 5. Required ACTIVE Pose

- right-facing
- torso가 오른쪽으로 짧게 lean
- visor가 진행 방향을 봄
- 뒤발이 지면을 강하게 밀어냄
- 앞발은 짧게 전진
- Shield는 왼팔에 밀착
- Baton은 오른손에 compact하게 유지
- back/waist Thruster가 왼쪽 뒤로 짧게 분사
- 비행 자세 금지
- 완전 수평 자세 금지

---

# 6. 금지사항

- giant shield charge
- Shield Bash처럼 보이는 자세
- Baton swing
- long charge trail
- wings
- giant rocket exhaust
- teleport effect
- horn
- cape
- cloth
- fantasy aura
- 신규 무기 추가
- collider/hitbox를 이미지 크기로 정의

---

# 7. Canvas / Pivot / Collider

## Canvas
- Source: `128×192 px`
- Output: `128×192 world px`
- 1:1
- integer pixel grid
- nearest-neighbor
- non-integer scaling 금지
- anti-aliasing으로 규격 맞추기 금지

## Pivot
- `bottom-center / feet center`

## Collider
- Body collider: `96×150 world px`
- sprite 크기 ≠ collider
- Shield 크기 ≠ contact range
- Thruster trail 길이 ≠ damage range
- Runtime이 movement / damage / timing authority

---

# 8. Layer Order

```text
rear thruster VFX
→ body
→ rear arm
→ shield
→ baton
→ front arm
→ optional dust / speed cue
```

공통 계약:

```text
rear VFX
→ body
→ rear arm
→ weapon/shield
→ front arm
→ front VFX
```

---

# 9. 최소 애니메이션 계약

`warden_thruster_dash` 최소 키 포즈:

1. `warden_thruster_dash_telegraph`
2. `warden_thruster_dash_active`

이번 이미지는 **ACTIVE** 담당.

Telegraph에서는:

- 무게중심 약간 뒤
- 무릎/골반 압축
- Thruster 점화 직전
- active보다 body lean 작게

표현한다.

---

# 10. 검수 체크리스트

## P0

- [x] 승인된 Warden 계열 외형 유지
- [x] horn / cape / cloth 없음
- [x] 짧은 Dash 방향이 읽힘
- [x] Thruster가 뒤쪽으로 분사
- [x] Baton이 짧은 Shock Baton
- [x] 한 명 / 한 포즈 / 한 장
- [ ] Shield를 최종 runtime 에셋에서 더 몸에 밀착
- [ ] ground contact를 더 명확히 보정

## 기술

- [x] right-facing
- [ ] 최종 export에서 transparent RGBA PNG 확인
- [ ] bottom-center anchor 정렬
- [ ] Thruster trail separate
- [x] collider 변경 없음
- [x] Runtime timing authority 유지

---

# 11. 다음 단계

1. `warden_thruster_dash_telegraph`
2. Production Order 8 — `warden_charge`

다음 `warden_charge`는 반드시 이번 Dash보다:

- body lean이 더 길고
- trail이 더 길고
- committed pressure 인상이 더 강하게

보여야 한다.

---

# 12. 전달 규칙

이후 모든 Boss06 그래픽 작업은 반드시 같은 세트로 전달한다.

1. **MD 파일 먼저 생성**
2. **MD 링크를 먼저 제공**
3. **메인 이미지 1장 생성**
4. **이미지가 MD의 P0을 통과하는지 검수**
5. 실패하면 폐기 후 재생성

이미지만 단독으로 전달하지 않는다.
