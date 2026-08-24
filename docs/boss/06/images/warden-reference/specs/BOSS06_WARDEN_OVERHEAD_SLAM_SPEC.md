# ONE ROPE — Boss06 `CONTINUITY WARDEN`
## `warden_overhead_slam` Art Specification v2

> 목적: Boss06의 `OVERHEAD SLAM` 상태를 메인 이미지 1장 기준으로 실제 게임 제작에 연결하기 위한 우선순위형 규격 문서.
>
> 대응 메인 이미지: `사이버_보안병의_전격_강타_포즈.png`
>
> 기준 캐릭터: 승인된 `warden_body_base`

---

# 1. 핵심 우선순위

## P0 — 반드시 맞아야 함

1. **같은 Warden 캐릭터 유지**
   - Heavy Security Enforcer + Industrial Exosuit
   - Compact Security Helmet + Reinforced Collar
   - Graphite body + Cold Steel exoskeleton
   - 제한적 Cyan accent
   - 뿔 / 망토 / 왕관형 장식 / 천 장식 추가 금지

2. **Overhead Slam으로 즉시 읽혀야 함**
   - 위에서 아래로 내려치는 vertical attack
   - 일반 Baton 1/2타보다 큰 silhouette
   - combo finisher 느낌이 있어야 함

3. **무기는 짧은 Shock Baton 계열 유지**
   - 해머 / 메이스 / 장봉 / 창 / 검처럼 보이면 안 됨
   - 한 손 기반 근접 보안 장비
   - 짧고 단단한 silhouette가 우선

4. **Ground Impact는 보조 신호**
   - 바닥 충격 cue는 공격 방향을 읽히게 돕는 수준
   - 실제 피해 범위를 과장하는 거대한 폭발처럼 보이면 안 됨

5. **이미지는 메인 이미지 1장만**
   - 캐릭터 1명
   - 포즈 1개
   - 텍스트 / 표 / 설명 / UI / sprite sheet 없음

---

## P1 — 제작 구조

- Asset ID: `warden_overhead_slam`
- Category: `characters`
- 기본 방향: right-facing
- left-facing: renderer `flipX`
- anchor: bottom-center / feet center
- Baton: separate part
- Baton arm: separate part
- Ground impact VFX: separate
- Export: transparent RGBA PNG
- Runtime timing (`telegraph / active / recovery`)이 authority

---

## P2 — 스타일

- Body: Graphite
- Exoskeleton: Cold Steel / Blue-gray
- Cyan: visor / baton discharge / impact cue에 제한적으로 사용
- 작은 디테일보다는 큰 silhouette 우선
- 실제 1x와 모바일 크기에서도 pose가 읽혀야 함
- giant mecha처럼 보이지 않음

---

## P3 — 나중에 Polish

- 짧은 electric discharge
- 소형 impact spark
- 작은 debris
- recovery dust
- 짧은 glow pulse

P3는 P0 판독성과 P1 제작 구조가 통과한 뒤 추가한다.

---

# 2. Gameplay Meaning

`warden_overhead_slam`은 Baton 3연타의 마지막 강한 마무리 공격이다.

기본 인식 목표:

> “지금은 일반 Baton swing이 아니라, 더 크고 더 위험한 내려찍기다.”

플레이어는 텍스트 없이도:
- 공격 방향
- 공격 크기
- combo finisher 성격

을 읽을 수 있어야 한다.

---

# 3. 현재 승인 방향

현재 이미지에서 유지할 핵심:

- horn 없는 compact helmet
- 무거운 human-scale security enforcer 체형
- 큰 vertical slam silhouette
- 제한적 Cyan impact cue
- reinforced collar / 하체 외골격 구조

실제 게임 에셋용으로 조정할 핵심:

- Baton을 더 짧고 compact한 shock baton으로 보정
- Ground impact를 더 분리된 VFX asset로 정리
- `warden_body_base`와 비율 일치 재점검

---

# 4. Required Pose

## Active Pose

필수 조건:

- Baton이 위에서 아래로 내려치는 방향
- 상체가 크게 전방/하방으로 이동
- 다리는 충격을 버티기 위해 넓게 벌림
- 무릎은 굽힘
- torso는 낮아짐
- 머리/visor는 공격 방향 유지
- feet anchor는 유지

## 금지

- 수평 Baton swing처럼 보이는 자세
- Shield Bash처럼 보이는 자세
- Dash/Charge처럼 과도하게 앞으로 눕는 자세
- giant hammer를 휘두르는 인상

---

# 5. Baton Contract

## 반드시

- short shock baton
- one-hand dominant
- industrial security weapon
- compact silhouette
- 짧은 전기 discharge 허용

## 금지

- war hammer
- mace
- polearm
- spear
- staff
- sword
- giant energy blade
- fantasy weapon ornament

---

# 6. Ground Impact VFX Contract

권장 별도 에셋:

`overhead_slam_ground_impact`

목적:
- vertical attack direction 보조
- 타격 순간 전달
- combo finisher 인상 강화

주의:
- VFX 크기 ≠ damage radius
- body와 분리된 asset
- Player / Rope / terrain을 과도하게 가리지 않음

---

# 7. Canvas / Output

기본 계약:

- Source canvas: `128×192 px`
- Intended world output: `128×192 world px`
- 1:1
- bottom-center / feet center
- right-facing

확장이 필요한 경우:
- 정수 pixel 단위 확장만 허용
- body scale 유지
- anchor 유지
- collider 변경 금지

---

# 8. Collider / Runtime Boundary

Boss body collider:

**96×150 world px**

절대 규칙:

- sprite silhouette가 collider를 바꾸지 않음
- Baton 길이가 melee range를 정의하지 않음
- Ground impact VFX가 실제 피해 범위를 정의하지 않음
- animation 이미지가 gameplay timing을 바꾸지 않음
- damage / knockback / AI / physics는 Runtime authority

---

# 9. 레이어 순서

고정 계약:

```text
rear VFX
→ body
→ rear baton arm
→ baton
→ front/support arm
→ ground impact VFX
→ front VFX
```

---

# 10. 이미지 제작 규칙

메인 이미지는 **한 장**만 제작한다.

이미지 내부 금지:
- 설명글
- asset name
- 치수
- 표
- UI
- sprite sheet
- 다중 포즈
- 환경 설명판
- 제작 노트

설명은 이 MD 파일에서만 관리한다.

---

# 11. 검수 체크리스트

## P0 PASS

- [ ] 승인된 Warden과 동일 캐릭터로 보임
- [ ] 뿔 / 천 장식 / 불필요한 추가 장식 없음
- [ ] vertical slam으로 즉시 읽힘
- [ ] 일반 Baton 1/2보다 큰 실루엣
- [ ] Baton이 short shock baton 계열로 유지됨
- [ ] giant hammer / mace처럼 보이지 않음
- [ ] Ground impact가 보조 역할만 함
- [ ] 메인 이미지 1장 규칙 준수

## 기술 PASS

- [ ] right-facing
- [ ] left = flipX 가능
- [ ] bottom-center anchor 유지
- [ ] transparent RGBA PNG
- [ ] 1:1 pixel output 전제
- [ ] collider / gameplay timing 변경 없음

---

# 12. 현재 상태

**IMAGE + MD 세트 보완 완료**

이번 턴 기준으로:
- 메인 이미지 1장 제공
- 대응 MD 제공
- 우선순위형 문서 형식 적용

다음 턴부터도 같은 규칙을 유지한다.

---

# 13. 다음 에셋

다음 제작 후보:

`warden_thruster_dash`
