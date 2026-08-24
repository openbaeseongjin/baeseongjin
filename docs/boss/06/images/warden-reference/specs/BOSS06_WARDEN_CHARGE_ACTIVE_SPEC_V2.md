# ONE ROPE — Boss06 `CONTINUITY WARDEN`
## `warden_charge_active` Art Specification v2

> Production Order: **8 — `warden_charge`**
>
> 대응 메인 이미지: `사이버_워든의_푸른_돌진.png`
>
> 기준 문서:
> `BOSS06 GRAPHICS PRODUCTION PLAN — Continuity Warden Art Production Spec v1`
>
> 이번 문서는 `warden_charge`의 **ACTIVE pose 1장**에 대한 제작/검수 기준이다.

---

# 1. 핵심 우선순위

## P0 — 반드시 맞아야 함

1. **Charge로 즉시 읽혀야 함**
   - 짧은 Dash가 아니라 **긴 committed 돌진**이어야 한다.
   - 방향 고정 후 끝까지 밀어붙이는 인상이 있어야 한다.
   - miss 후 큰 recovery가 생길 것 같은 공격으로 읽혀야 한다.

2. **Dash와 확실히 구분**
   - Dash = 짧고 압축적
   - Charge = 더 긴 body line, 더 긴 stride, 더 긴 trail
   - 색이 아니라 **자세 / 길이 / 추진감**으로 차이를 만든다.

3. **승인된 Warden 외형 유지**
   - human-scale final boss
   - Compact Security Helmet / Visor
   - Industrial Exosuit
   - Graphite body + Cold Steel exoskeleton
   - 제한적 Cyan accent
   - horn / cape / cloth / plume / fantasy ornament 금지

4. **기존 장비 유지**
   - 왼팔: Solid Armor Plate Shield
   - 오른손: Short Shock Baton
   - Shield/Baton이 새 무기처럼 바뀌면 안 된다.
   - Charge의 주체는 몸 전체의 committed rush이지 Shield Bash나 Baton Swing이 아니다.

5. **메인 이미지 1장 규칙**
   - 캐릭터 1명
   - 포즈 1개
   - 텍스트 / 표 / UI / sprite sheet / 설명판 없음

---

## P1 — 제작 구조

- Asset ID: `warden_charge_active`
- Parent Asset: `warden_charge`
- Category: `characters`
- Facing: `right-facing`
- Left: renderer `flipX`
- Anchor: `bottom-center / feet center`
- Source baseline: `128×192 px`
- Intended world output: `128×192 world px`
- Body collider: `96×150 world px`
- Shield: separate
- Shield arm: separate
- Baton: separate
- Baton arm: separate
- Charge trail: **separate VFX**
- Runtime timing / hitbox / movement authority 유지

---

## P2 — 스타일

- Dash보다 더 길고 무거운 전진 자세
- torso가 더 강하게 전방 정렬
- stride가 길어야 함
- 뒤쪽 추진과 전방 압박이 동시에 읽혀야 함
- Shield는 기존 형태 유지, 몸에 붙어서 방해하지 않게
- Baton은 짧고 compact하게 유지
- Cyan은 visor / thruster / trail에 제한적으로 사용
- 작은 기계 디테일보다는 **committed charge silhouette** 우선

---

## P3 — 나중에 Polish

- 긴 charge trail 세부 분화
- 작은 spark / pressure cue
- 전방 dust or scrape cue
- 접지감 강화용 debris
- recovery 전환용 짧은 exhaust fade

---

# 2. Gameplay Meaning

플레이어가 즉시 읽어야 하는 메시지:

> “이건 짧은 Dash가 아니라, 끝까지 밀고 오는 큰 Charge다.”

Charge의 핵심 인상:

- 긴 거리
- 방향 고정
- 큰 압박
- 피하면 큰 반격 기회

---

# 3. Dash vs Charge

| 요소 | Thruster Dash | Charge |
|---|---|---|
| 거리 인상 | 짧음 | 김 |
| 자세 | 압축적 | 길게 뻗음 |
| Trail | 짧음 | 김 |
| 목적 | reposition / contact | committed pressure |
| recovery 인상 | 비교적 짧음 | 큼 |

이번 `warden_charge_active`는 위 표에서 **Charge 쪽**으로 읽혀야 한다.

---

# 4. 현재 이미지 검수

## PASS 요소

- 같은 Warden 계열 외형 유지
- Compact Helmet / Visor 유지
- Industrial security silhouette 유지
- Shield / Baton 장비 유지
- Blue/Cyan 추진감 존재
- 메인 이미지 1장 규칙 준수
- Dash보다 더 긴 rush 인상은 확보

## 보정 필요 요소

1. **Baton 길이**
   - 현재는 약간 긴 봉처럼 읽힐 수 있다.
   - 최종 runtime asset에서는 더 짧은 shock baton으로 보정 권장.

2. **Shield 시선 분산**
   - Shield가 너무 강조되면 Charge보다 Shield Bash처럼 오해할 수 있다.
   - 몸에 더 밀착해 silhouette를 정리할 여지 있음.

3. **Trail 분리**
   - 현재 이미지에서는 trail이 본체와 함께 보이지만,
     구현 단계에서는 `charge_trail_vfx`로 분리하는 것이 맞다.

현재 판정:

**CONCEPT PASS / RUNTIME ASSET POLISH REQUIRED**

---

# 5. Required ACTIVE Pose

필수:

- right-facing
- 몸 전체가 진행 방향으로 길게 정렬
- torso lean 강함
- stride 길게
- 앞다리는 전방 압박, 뒤다리는 추진
- 머리/visor는 진행 방향 고정
- Shield는 기존 형태 유지, Guard처럼 전면 차단 인상 금지
- Baton은 짧고 compact하게 유지
- Thruster / trail은 Dash보다 길게
- 지면을 따라 돌진하는 느낌

금지:

- 공중 비행
- 짧은 Dash와 같은 압축 자세
- Shield Bash로 읽히는 돌진
- Baton Swing active pose
- giant weapon impression

---

# 6. Telegraph와의 관계

`warden_charge` 최소 세트는:

1. `warden_charge_telegraph`
2. `warden_charge_active`

Telegraph는 다음 성질을 가져야 한다.

- 방향 고정
- 큰 준비 자세
- body line이 길어지기 시작
- Dash telegraph보다 더 committed
- 다음 순간 장거리 이동이 예고됨

즉, Active는 이미 실행 중이고 Telegraph는 **큰 돌진 직전의 잠금 자세**다.

---

# 7. Canvas / Pivot / Collider

- Source: `128×192 px`
- Output: `128×192 world px`
- 1:1
- integer pixel grid
- nearest-neighbor
- anti-aliasing으로 규격 보정 금지
- Pivot: `bottom-center / feet center`
- Body collider: `96×150 world px`

절대 규칙:

- sprite가 collider를 바꾸지 않음
- trail 길이가 damage range를 정의하지 않음
- Shield 크기가 hitbox를 정의하지 않음
- Runtime이 timing / movement / damage authority 유지

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

Charge 권장:

```text
rear charge trail VFX
→ body
→ rear arm
→ shield
→ baton
→ front arm
→ optional ground pressure cue
```

---

# 9. 금지사항

- horn
- cape
- cloth
- plume
- fantasy ornament
- giant new weapon
- long spear/staff interpretation
- Shield Bash처럼 보이는 전면 돌진
- Dash와 구분 안 되는 짧은 자세
- 이미지 내부 텍스트/표/UI

---

# 10. 검수 체크리스트

## P0

- [ ] Charge로 즉시 읽힘
- [ ] Dash보다 확실히 길고 committed
- [ ] 승인된 Warden 외형 유지
- [ ] Shield/Baton 기존 디자인 유지
- [ ] Baton이 지나치게 길지 않음
- [ ] Shield Bash처럼 보이지 않음
- [ ] 한 명 / 한 포즈 / 한 장 규칙 준수

## 기술

- [ ] transparent RGBA PNG
- [ ] right-facing
- [ ] left = flipX 가능
- [ ] bottom-center anchor
- [ ] 128×192 기준
- [ ] collider 변경 없음
- [ ] charge trail을 최종 구현 시 separate VFX로 분리
- [ ] Runtime timing authority 유지

---

# 11. 다음 단계

`warden_charge_active` 이후:

1. `warden_charge_telegraph`
2. Production Order 9 — `warden_security_command`

`warden_security_command`에서는
직접 때리는 자세가 아니라
**환경 시스템을 작동시키는 보스 상태**로 읽히는 것이 핵심이다.
