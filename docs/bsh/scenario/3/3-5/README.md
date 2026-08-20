# ONE ROPE — SECTOR 03-5 COMMERCIAL OPERATIONS HUB — REV8 STAGE DRAFT REV3

> Status: DESIGN LOCKED  
> Runtime audit baseline: `d39cbb49d3d8247caf2542393994704292dd5002`  
> Sector 03 identity: **CENTRAL EXCHANGE COMPLEX — 수직 상업·환승 복합시설**  
> REV1: HOLD — short Z around Plant Core  
> REV2: HOLD — spatial diversity improved, but industrial / facility identity was wrong  
> Proposed REV3 target: **`2688×1248`**  
> Canonical Stage Name: **`COMMERCIAL OPERATIONS HUB`**  
> Runtime current name: `COMMERCIAL SERVICE NODE`  
> Spatial Signature: **BACK-OF-HOUSE VERTICAL INTERCHANGE / TENANT DELIVERY PASSAGE → OPERATIONS BALCONY → ATRIUM SIGNAGE CATWALK → TENANT TRANSFER DECK**  
> Dominant Movement: **`↘ → ↑ → ↗ → ↘ → ↗`**  
> Stage Role: **INTENTIONAL COMPRESSION / AUGMENT OFFER #3 / ACCESS MODULE B**

---

# 0. REV3 CORRECTION

Sector 03 is not an infrastructure/facility Sector.

Therefore REV2 terminology is retired:

- ~~LOWER SERVICE TRENCH~~
- ~~PLANT CORE~~
- ~~VERTICAL CALIBRATION POD~~
- ~~OVERHEAD BUSWAY~~
- ~~SWITCHGEAR / INDUSTRIAL TRANSFER~~

3-5 is now a **commercial complex back-of-house operations interchange**.

The map diversity remains, but every spatial layer must belong to a large retail/exchange complex.

---

# 1. ONE CONCEPT THAT BINDS THE VARIETY

## COMMERCIAL BACK-OF-HOUSE VERTICAL INTERCHANGE

A large commercial complex has multiple operational circulation layers:

1. **TENANT DELIVERY PASSAGE**
   - stock / delivery / staff movement behind storefronts

2. **OPERATIONS CONTROL BALCONY**
   - protected staff equipment / access / calibration point
   - Augment Node #3

3. **ATRIUM SIGNAGE ACCESS CATWALK**
   - upper catwalk serving hanging signs / lighting / wayfinding structures above the retail atrium

4. **TENANT TRANSFER DECK**
   - staff / stock / maintenance transfer point to upper tenant blocks
   - Access Module B carrier

5. **UPPER RETAIL BACK-OF-HOUSE LINK**
   - exit to 3-6 GRAND CENTRAL ATRIUM edge

So the Stage is not:
`different spaces for variety`.

It is:
`one commercial operations system experienced at different sections/heights`.

---

# 2. SPATIAL MEMORY

Player should remember:

> **behind the shops → up into a protected staff operations balcony → across the upper atrium signage catwalk → drop into the tenant transfer deck → rise toward the Grand Central Atrium**

This is visually varied but still one coherent commercial building.

---

# 3. SCALE

Target:

**`2688×1248`**

This remains intentionally compressed between:
- 3-4 large Public/Back-of-House split
- 3-6 monumental Grand Central Atrium

Every added height band has a commercial-space purpose.

---

# 4. MASTER SILHOUETTE

```text
Y -1248

                                  EXIT → 3-6
                              UPPER RETAIL LINK █████
                                         ↗
                                      G6 ●

             ATRIUM SIGNAGE ACCESS CATWALK █████████
                             G4 ●            \
                                               ↘
                                 TENANT TRANSFER DECK ███
                                 LATE GUARD + ACCESS B ●

           OPERATIONS CONTROL BALCONY █████████
                    AUGMENT FRAME #3      □
                             ↑
                           G3 ●
                             ↑

        TENANT DELIVERY PASSAGE █████
                ENTRY GUARD ●
                     ↙
                  G2 ●
                ↘
ENTRY → G1

Y 0
```

Movement rhythm remains:

> **`↘ → ↑ → ↗ → ↘ → ↗`**

The variety comes from section changes, not random zigzags.

---

# 5. PHASE A — TENANT DELIVERY PASSAGE

Entry:
`(-1184,-64)`

G1:
`(-960,-224)`

Entry Pressure Deck:
- X `-800..-544`
- Y `-288`
- W256

G2:
`(-640,-448)`

Tenant Delivery Passage:
- X `-768..-512`
- Y `-544`
- W256

Architectural meaning:
- rear-of-store loading/staff route
- compact floor height
- narrow staff circulation

Enemy:
`sector-03-05:node-entry-guard`
Support Pool.

Rules:
- short local pressure only
- kill optional
- cannot attack the Operations Balcony
- no Node kill gate

---

# 6. PHASE B — OPERATIONS CONTROL BALCONY

From the delivery passage, Player rises almost vertically.

G3:
`(-512,-736)`

Operations Control Balcony:
- X `-384..+64`
- Y `-800`
- W448

Why this space is safe:

The balcony is behind a **rated staff-access partition / tenant operations wall** that separates:
- delivery circulation
- tenant/staff control space

This blocks enemy LOS and projectile paths.

This is not an electrical control room.
It is a **commercial operations / staff access pocket**.

---

# 7. AUGMENT NODE #3

Stable Runtime object:

`sector-03-05:service-calibration-frame`

World-facing interpretation:

> **STAFF EQUIPMENT CALIBRATION FRAME**

Used by vertical-maintenance staff to check/configure their work equipment.

It sits on the Operations Balcony.

Requirements:
- true safe zone
- no Scanner
- no Patrol
- no environmental hazard
- no enemy LOS
- no kill requirement
- no Access B requirement
- each Player interacts personally
- world does not pause

The Node still provides the generic Augment #3 offer.

---

# 8. STORY

Exact Runtime copy stays:

```text
COMMERCIAL FACILITY SERVICE NODE
```

```text
EMPLOYEE CLASS
VERTICAL MAINTENANCE
```

```text
LOCAL SERVICE CHANNEL
AVAILABLE
```

```text
VERTICAL ROUTE AUTHORIZATION
INVALID
```

Interpretation:

> The commercial complex recognizes the Player as maintenance staff and grants local back-of-house access, but this still does not equal vertical-route authorization.

Do NOT infer:
- priority class identity
- Group mapping
- reason C stopped
- deliberate sacrifice
- corporate conspiracy

---

# 9. PLAYER BARK

Proposed:

> **`…내 구역 안에서는 통하는데.`**

Latest `main` now includes a local Player Bark presentation capability.

Status for 3-5:

**RUNTIME CAPABILITY VERIFIED / 3-5 BARK NOT YET AUTHORED**

Do not use System Toast as substitute.

---

# 10. PHASE C — ATRIUM SIGNAGE ACCESS CATWALK

After Augment selection:

G4:
`(+192,-928)`

Atrium Signage Access Catwalk:
- X `+256..+576`
- Y `-960`
- W320

Architectural role:
- access behind/above hanging commercial wayfinding
- lighting/signage maintenance
- overlooks a portion of the retail volume
- still clearly part of Central Exchange commercial architecture

Gameplay:
- no enemy
- high/open feel after the protected balcony
- short build-expression traversal

This replaces REV2's industrial `OVERHEAD BUSWAY`.

---

# 11. PHASE D — TENANT TRANSFER DECK

Busway-style upward continuation is removed.

Player deliberately descends from the signage catwalk:

G5:
`(+768,-832)`

Tenant Transfer Deck:
- X `+832..+1088`
- Y `-864`
- W256

Architectural role:
- links upper tenant/staff circulation
- small stock/staff transfer point
- sits laterally off the public atrium route

This makes the down-right movement meaningful:
the Player leaves the overhead signage layer and re-enters a tenant-access deck.

---

# 12. ACCESS B GUARD

Stable:
`sector-03-05:node-exit-guard`

Authority:
`SECTOR_03_LATE_POOL`

Access Module:
`sector-03:access-module:b`

Rules:
- activates only on Tenant Transfer Deck
- cannot attack Operations Balcony
- no Scanner
- no Patrol
- no Rope Cut
- kill optional for local Stage exit
- kill required to obtain Access B
- no third enemy

Narrative/function:
Access B belongs naturally on a transfer point controlling continued staff access into upper commercial circulation.

---

# 13. PHASE E — UPPER RETAIL BACK-OF-HOUSE LINK

G6:
`(+1120,-1056)`

Exit Deck:
- X `+1248..+1504`
- Y `-1152`
- W256

This short final rise connects to:

**3-6 GRAND CENTRAL ATRIUM**

The Stage should begin to hint at a larger open public volume ahead,
without fully revealing the 3-6 Atrium early.

---

# 14. RECOVERY

Recovery A:
below Operations Balcony.

Recovery B:
below Signage Catwalk.

Rules:
- 3–5 sec retry
- no Node bypass
- no Access B bypass
- no walking shortcut to Exit
- safe Node remains protected

---

# 15. WHY THE VARIETY IS NOW CONCEPTUALLY VALID

The four spaces are not four unrelated themes.

They represent four layers of one shopping-complex operations network:

```text
TENANT GOODS / STAFF MOVEMENT
        ↓
STAFF OPERATIONS / EQUIPMENT
        ↓
ATRIUM SIGNAGE ACCESS
        ↓
UPPER TENANT TRANSFER
```

Thus gameplay diversity comes from:

- low enclosed rear corridor
- sudden vertical rise
- protected mid-level balcony
- high open catwalk
- deliberate side drop
- final upper link

while the environment stays **commercial**.

---

# 16. SECTOR 03 FIT

3-1:
Market / Promenade

3-2:
Commercial Media Wall skin

3-3:
Central Retail Atrium circulation

3-4:
Public Front vs Retail Back-of-House

3-5:
**Commercial Operations Hub**

3-6:
Grand Central Atrium

This is a coherent commercial progression.

3-5 no longer introduces Sector-04-style infrastructure language.

---

# 17. MAP SIMILARITY

vs 3-4:
- 3-4 = two-route Y split
- 3-5 = one sectional back-of-house interchange
PASS.

vs 3-3:
- 3-3 = five-way atrium switchback
- 3-5 = lower → vertical → overhead → side-drop
PASS.

vs 3-2:
- overlap: maintenance access to commercial architecture
- 3-2 = one Media Wall wrap
- 3-5 = tenant operations interchange
Meaningful overlap = 1.

vs 1-4 / 2-3:
- overlap = Augment Node function only
Meaningful overlap = 1.

Maximum meaningful overlap:
**1 / PASS**

---

# 18. FIVE GATES

MAP SCALE:
**PASS — INTENTIONAL COMPRESSION**

MAP VARIETY:
**PASS CANDIDATE**
Lower / mid / upper / side layers.

SECTOR IDENTITY:
**PASS**
All major spaces are Commercial Back-of-House / Retail Operations.

MAP SIMILARITY:
**PASS**
Max overlap 1.

CURRENT RUNTIME:
**PASS**
Augment Node + 2 Guards + Access B + Story + Exit contract preserved.

---

# 19. STATUS

```text
3-5 REV1
HOLD

3-5 REV2
HOLD — INDUSTRIAL IDENTITY

3-5 REV3
COMMERCIAL OPERATIONS HUB
2688×1248

TENANT DELIVERY PASSAGE
       ↓
OPERATIONS CONTROL BALCONY
AUGMENT #3
       ↓
ATRIUM SIGNAGE ACCESS CATWALK
       ↓
TENANT TRANSFER DECK
ACCESS B
       ↓
3-6 GRAND CENTRAL ATRIUM

USER APPROVED / DESIGN LOCKED
```

## Mandatory Rope sanity
- `Entry→G1` = `275.27px`
- `G1→P1` = `172.33px`
- `P1→G2` = `186.59px`
- `G2→LowerPassage` = `160.00px`
- `LowerPassage→G3` = `192.00px`
- `G3→OpsBalcony` = `143.11px`
- `OpsBalcony→G4` = `181.02px`
- `G4→SignageCatwalk` = `71.55px`
- `Catwalk→G5` = `230.76px`
- `G5→TransferDeck` = `71.55px`
- `TransferDeck→G6` = `194.65px`
- `G6→Exit` = `160.00px`

All mandatory links ≤400px.


---

# 20. PACKAGING-TIME RE-AUDIT

Final packaging baseline:

`d39cbb49d3d8247caf2542393994704292dd5002`

Verified latest Runtime contract:

- source area `sector-03-05`
- current Runtime name `COMMERCIAL SERVICE NODE`
- subtitle `REST / AUGMENT SERVICE`
- current Runtime bounds `960×688`
- `service-calibration-frame`
  - type `augment-node`
  - objective `sector-03-05:augment-selected`
  - objective type `interact-choice`
- `node-entry-guard`
  - Support Pool
- `node-exit-guard`
  - Late Pool
  - Access Module B: `sector-03:access-module:b`
- exactly 2 enemy slots
- no Scanner
- no Patrol
- no Wind
- no Rope Cut
- Exit panel requires:
  - final deck reached
  - augment selected
- physical crossing continues to `sector-03-06`
- Player Bark presentation capability now exists in Runtime, but 3-5 Bark remains unauthored until implementation.

REV8.0 keeps all gameplay/system contracts while changing the authored space identity to:

**COMMERCIAL OPERATIONS HUB / CENTRAL EXCHANGE BACK-OF-HOUSE**

Industrial/facility-heavy REV1 and REV2 identities are superseded.
