# ONE ROPE — Boss06 `CONTINUITY WARDEN`
## `warden_shield_guard` Art Specification v1

> 목적: Boss06 `CONTINUITY WARDEN`의 `GUARD` 상태를 실제 게임에서 즉시 판독할 수 있도록 하는 Shield Guard 그래픽 제작 규격.
>
> 기준 에셋: `warden_body_base`
>
> 대응 메인 이미지: `사이버_방패를_든_중장갑_수호병.png`

---

## 1. Asset ID

`warden_shield_guard`

분류:

- Category: `characters`
- 역할: Boss06 `GUARD` 상태용 전방 방어 그래픽
- 게임용 export: transparent RGBA PNG
- Runtime timing과 방어 판정은 그래픽이 아니라 기존 Boss Runtime이 authority

---

## 2. Gameplay Meaning

`GUARD`는 Warden이 Shield를 전방에 세워 정면 공격을 완전히 막는 상태다.

그래픽의 최우선 목표는:

> 플레이어가 텍스트나 색 변화 없이도
> “지금 정면 공격은 막힌다”는 사실을 즉시 이해하게 만드는 것.

`COUNTER READY`와는 반드시 다른 silhouette를 사용한다.

---

## 3. Base Character Contract

`warden_body_base`의 기존 확정 규칙을 유지한다.

- Heavy Security Enforcer + Industrial Exosuit
- Compact Security Helmet + Reinforced Collar
- Back/Spine + Hip/Leg exoskeleton
- Graphite body
- Cold Steel / Blue-gray exoskeleton
- Cyan accent는 제한적으로만 사용
- human-scale final boss
- giant mecha 표현 금지

---

## 4. Shield Form

### Final Shield Direction

**Heavy Angular + Compact Forearm Shield**

### Surface

**Solid Armor Plate**

핵심 특징:

- Guard 상태에서는 Shield 면적이 정면에서 크게 읽혀야 함
- 직사각형 Riot Shield보다 산업 보안 장비에 가까운 angular silhouette
- 작은 decorative rib, 복잡한 문양, 과한 패널 분할은 필수 아님
- 방패 표면의 큰 덩어리가 먼저 읽혀야 함

---

## 5. Guard Pose

### Required Silhouette

- Shield를 몸 전방에 확실히 세움
- 상체는 Shield 뒤로 약간 들어감
- 무게중심은 낮고 안정적
- 전진 공격 자세가 아니라 방어 자세로 읽혀야 함
- Baton 공격 자세와 혼동되지 않아야 함

### Body Relationship

- Warden body의 중심은 유지
- Shield가 몸 전체를 완전히 가려 인간형 실루엣이 사라지면 안 됨
- Helmet / shoulder / lower body 일부는 Shield 바깥에서 읽혀야 함

---

## 6. Readability Priority

Guard는 아래 순서로 읽혀야 한다.

1. Shield의 큰 전방 면
2. 낮고 안정적인 무게중심
3. 몸이 Shield 뒤에 배치된 자세
4. 팔의 전방 지지 방향
5. 제한적인 VFX / accent

색만으로 Guard를 표현하지 않는다.

---

## 7. Guard vs Counter Ready Contract

### Guard

- Shield: **앞**
- Shield silhouette: **크게**
- Body: **뒤**
- Weight: **안정적 / 방어적**

### Counter Ready

- Shield: **몸 옆 또는 아래**
- Shield silhouette: **작게**
- Body: **앞으로 열림**
- Weight: **반격 준비**

두 상태는 같은 Shield 디자인을 사용할 수 있지만
**arm pose와 Shield 위치는 재사용하지 않는다.**

---

## 8. Canvas / Output Rule

기본 body 제작 규격:

- Source canvas: `128×192 px`
- Intended world output: `128×192 world px`
- 기본 방향: right-facing
- left-facing: renderer `flipX`
- anchor: bottom-center / feet center

Shield가 body 밖으로 크게 돌출되는 경우:

- body 기준점은 그대로 유지
- 필요한 경우 action frame canvas만 확장 가능
- 비정수 scaling 금지
- pivot 이동 금지
- 확장 canvas가 collider나 Guard 판정 범위를 의미하지 않음

---

## 9. Collider / Gameplay Boundary

중요:

- Warden body collider = 기존 `96×150 world px` 계약 유지
- Shield PNG 외곽선으로 collider를 만들지 않음
- Shield visual size가 실제 Guard 방어 판정을 결정하지 않음
- Guard front/rear 판정은 Runtime authority
- 그래픽 변경으로 physics / damage / knockback / AI를 변경하지 않음

그래픽은 기존 판정을 **설명하는 표현 계층**이다.

---

## 10. Layer Order

공통 레이어 계약:

```text
rear VFX
→ body
→ rear arm
→ weapon/shield
→ front arm
→ front VFX
```

Guard에서는 특히:

```text
body
→ shield arm
→ shield
→ supporting/front arm
→ block VFX
```

순서가 명확히 유지되어야 한다.

---

## 11. Shield Detail Rule

### Keep

- 큰 Solid Armor Plate
- 두꺼운 외곽 실루엣
- Cold Steel 계열 장갑
- 제한적인 Cyan active element
- 산업 보안 장비다운 단단한 구조

### Avoid

- 작은 볼트/패널 과밀
- 과도한 네온
- transparent energy shield처럼 보이는 표현
- shield 자체가 거대 메카 장비처럼 보이는 비율
- 방패 표면의 텍스트/설명 라벨
- 상태를 색만으로 표현

---

## 12. VFX Relationship

Guard 본체 그래픽과 별도로 필요한 gameplay VFX:

`guard-block-spark`

목적:

- 실제 정면 공격이 막힌 순간을 명확히 전달
- Shield의 평상시 모습과 “막아낸 순간”을 분리

주의:

- VFX는 실제 판정 범위를 넓게 보이게 하지 않음
- VFX canvas 크기 ≠ Guard 판정 크기

---

## 13. Export Rule

게임용 이미지:

- transparent RGBA PNG
- anti-aliasing 금지
- nearest-neighbor 전제
- pixel snap 유지
- source와 output은 정수 배율 사용

이미지 안에는 다음을 넣지 않는다.

- 설명글
- 규격표
- 치수
- asset name
- UI frame
- 제작 노트

설명은 이 MD 파일에서만 관리한다.

---

## 14. Review Checklist

- [ ] `warden_body_base` 외형과 동일 캐릭터로 읽힘
- [ ] Shield가 Solid Armor Plate로 읽힘
- [ ] Guard 상태가 정면 방어로 즉시 읽힘
- [ ] Counter Ready와 silhouette 차이를 만들 수 있음
- [ ] Shield가 Warden 전체를 완전히 가리지 않음
- [ ] 기본 body feet anchor가 유지됨
- [ ] right-facing 기준 유지
- [ ] left는 `flipX`로 사용 가능
- [ ] Cyan이 보조 accent 수준에 머묾
- [ ] 실제 1x / 모바일 크기에서도 Shield 방향이 읽힘
- [ ] Collider / Guard 판정을 아트가 변경하지 않음
- [ ] 이미지 내부에 설명 텍스트 없음

---

## 15. Current Status

`warden_shield_guard` 메인 이미지 1차 제작 완료.

다음 검수 포인트:

1. 실제 게임 크기에서 Shield가 너무 크게 보이지 않는지
2. Warden human-scale silhouette가 유지되는지
3. Guard와 향후 Counter Ready를 충분히 다르게 만들 수 있는지
4. Shield가 gameplay front-block 상태를 자연스럽게 설명하는지

PASS 시 다음 제작:

`warden_shield_counter_ready`
