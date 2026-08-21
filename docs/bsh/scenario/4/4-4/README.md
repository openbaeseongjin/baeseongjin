# SECTOR 04 — 4-4 RESIDENT REFUGE HALL

Status: **DESIGN LOCKED / RUNTIME NOT IMPLEMENTED**<br>
Package baseline: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>
Approved gameplay preview: **MAP REV2**<br>
Approved story/dialogue preview: **STORY REV3**

## 1. One-line memory

> **낮은 Refuge Deck에서 시작해, 닫힌 방화구획 위의 MEP 유지관리 Truss를 따라 계속 상승하며 정상 작동 중인 상층 대피공간을 통과하는 Stage.**

## 2. Why this route exists

4-4는 임의로 위쪽 발판을 타는 Stage가 아니다. 다음 목적지인 **UPPER AMENITY ACCESS → 4-5**가 더 높은 레벨에 있고, Resident Refuge Hall 자체가 지형/건축적으로 세 단계 상승한다.

각 Chamber 사이의 바닥은 비상시 압력 구획을 유지하는 **FIRE / SMOKE COMPARTMENT DOOR**로 끊겨 있다. 바닥은 recovery 공간이지 다음 Chamber로 이어지는 통과로가 아니다. 시설관리자인 Player가 실제로 연속해서 사용할 수 있는 상향 동선은 천장 **MEP MAINTENANCE TRUSS**다.

```text
BLOCK C / LOW REFUGE ENTRY
        ↗ T1–T4
       M1 MID SERVICE LEDGE
          ↗ T5–T7
         M2 HIGH SERVICE LEDGE
            ↗ T8–T10
           M3 FINAL LEDGE
              ↗ T11
          HIGH AMENITY ACCESS → 4-5
```

## 3. Gameplay contract

- Bounds: **5376×2240**
- Net movement: **continuous upward ascent**
- Mandatory Base-Rope relation max in approved preview: **390.61px**
- Current audited Base Hook Reach: **400px**
- Enemy: **Patrol ×2**
- Recovery: Chamber A/B/C Refuge Floors
- No Override / Relay / Key / Pursuit / Cutter / Wind / Scanner / Augment
- No kill gate

### Failure meaning

Falling is not arbitrary death. Player lands on a Refuge recovery floor. But sealed compartment doors prevent using the floor as a flat shortcut, so the Player must solve the same upward Truss problem again.

## 4. Story purpose

4-4 is **NORMALITY**. The shock is not a new disaster. It is that the protected upper-residential refuge infrastructure still looks maintained and operational while lower sectors have already shown severe failure.

Allowed facts:
- `RESIDENT REFUGE / PRESSURIZATION NORMAL`
- `FIRE COMPARTMENT A/B / SEALED / PRESSURE HOLD`
- `AIR QUALITY / NORMAL`
- `LIFE-SUPPORT / NORMAL`
- `UPPER AMENITY ACCESS / OPEN`

Forbidden explanation:
- who was selected for protection
- capacity allocation / priority tiers
- corporate continuity policy
- why the system chooses one population over another

Those explanations belong to Sector05.

## 5. Dialogue contract

SYSTEM = objective state.<br>
PLAYER = human reaction.

Core Bark: **`“…아래는 저 꼴인데.”`**

Trigger intent:
- after the first real ascent is complete,
- Player is grounded/stable,
- Rope is not attached/actively controlled,
- Patrol is not actively acquiring/pressuring the Player.

Do not add another explanatory/success Bark.

## 6. Beat order

1. Block C Entry — pressure/ventilation normal, no Bark.
2. Fire Compartment A — sealed structure read, no Bark.
3. First stable upper landing — life-support normal → one Player Bark.
4. Chamber A Patrol — silent gameplay pressure.
5. Chamber B — another step upward; normal air + sealed pressure hold.
6. Chamber B Patrol — silent gameplay pressure.
7. High Refuge Chamber — life-support still normal; let space speak.
8. Amenity Access — `OPEN`, silent handoff to 4-5.

## 7. Uniqueness

Not 4-1: no basin descent/cross-valley climb.<br>
Not 4-2: no courtyard crescent/interior escape.<br>
Not 4-3: no visible-goal fault → local objective descent → return ascent.

Reserved 4-4 signature:
**STEPPED PRESSURIZED REFUGE HALL → SEALED GROUND COMPARTMENTS → CONTINUOUS OVERHEAD MEP ASCENT → PATROL-PUNISHED RECOVERY FLOORS.**

## 8. Progression

4-4 owns **no Resident Security Override**. Sector04 contract remains:
- A = 4-2
- B = 4-5
- C = 4-7
- 4-8 requires any 2 of 3

4-4 must remain traversable without A and must not mutate the Override count.
