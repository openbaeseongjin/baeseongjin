# ONE ROPE — SECTOR PROGRESSION / KEY CONTRACT
## Sector01–04 cross-check

> Status:
> - Sector01 Runtime: VERIFIED 3-of-3
> - Sector02 Runtime: VERIFIED 3-of-3
> - Sector03 design/runtime modules: VERIFIED 3-of-3; final 3→4 transition unresolved
> - Sector04 design: DESIGN LOCKED 2-of-3; Runtime NOT IMPLEMENTED
> - Audit baseline: `3c9f661bba58af6f7351e00754c12aef86575a12`

---

# 1. META RULE

Each Sector may contain persistent cross-Stage progression sources.

The meta pattern is:

```text
PLAY STAGES
→ FIND / EARN SECTOR SOURCES
→ KEEP SOURCE STATE ACROSS STAGES
→ CHECK SECTOR BOUNDARY REQUIREMENT
→ UNLOCK NEXT SECTOR PATH
```

A source Stage's local exit does not automatically have to require that source.

---

# 2. SECTOR 01

Current Runtime pattern:

```text
Access Module A
Access Module B
Access Module C
↓
3 OF 3
↓
Sector01 → Sector02 transit lock opens
```

Current carrier stages:
`1-3 / 1-6 / 1-7`

Status:
**VERIFIED CURRENT RUNTIME**

---

# 3. SECTOR 02

```text
2-2  Access Module A
2-5  Access Module B
2-7  Access Module C
↓
3 OF 3
↓
Sector02 → Sector03 transit lock opens
```

Important:
carrier Stage local exits do not require their Access Module.

Status:
**VERIFIED CURRENT RUNTIME**

---

# 4. SECTOR 03

```text
3-2  Access Module A
3-5  Access Module B
3-7  Access Module C
↓
3 OF 3
```

Current Access modules are retained in Runtime.

However:
Post-Sector03 Boss / Transition → Sector04 is still unresolved,
so the final 3→4 boundary is not yet a finished current-world lock.

Status:
**3-of-3 progression VERIFIED / final sector transition NOT IMPLEMENTED**

---

# 5. SECTOR 04

Sector04 intentionally changes the rule.

```text
4-2  Resident Security Override A
4-5  Resident Security Override B
4-7  Resident Security Override C
↓
ANY 2 OF 3
↓
4-8 QUORUM CHECK
↓
PROTECTED ASCENT / FINAL SECTOR04 ROUTE
```

Valid:
- A+B
- A+C
- B+C
- A+B+C

Required:
`count >= 2`

## Critical local-stage rule

`4-4 and 4-6 own no Override and must not increment or gate the Sector04 quorum.`


```text
4-2 exit DOES NOT require A
4-5 exit DOES NOT require B
4-7 exit DOES NOT require C
```

Otherwise player choice is fake.

## 4-8

4-8 gives no new Override.

It only checks current unique collected sources.

If `<2`:
- final path remains locked
- remaining source guidance/backtrack must remain possible

If `>=2`:
- quorum accepted
- final protected route opens

Status:
**DESIGN LOCKED / RUNTIME NOT IMPLEMENTED**

---

# 6. IMPLEMENTATION REQUIREMENTS FOR 2-OF-3

Do not hardcode Sector04 into existing 3-of-3 assumptions.

Progression model should support data such as:

```text
sourceIds:
A
B
C

requiredCount:
2
```

Required validation:
- unique source counting
- shared multiplayer authority
- no double increment
- death persistence
- respawn persistence
- reconnect persistence
- late join convergence
- backtrack to missed source
- final gate consistency
- UI marker consistency

---

# 7. MANDATORY PLANNING GATES

For every new Stage from 4-3 onward, review:

1. MAP SCALE
2. MAP SIMILARITY
3. OBSTACLE FUNCTION
4. STAGE LENGTH / PACING
5. CURRENT GITHUB RUNTIME
6. STORY / DIRECTION
7. **SECTOR PROGRESSION / KEY STRUCTURE**

This progression gate is now mandatory.
