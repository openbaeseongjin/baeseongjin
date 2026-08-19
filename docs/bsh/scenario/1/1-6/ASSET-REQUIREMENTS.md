# 1-6 ASSET REQUIREMENTS — REV8.0

## Actual game art identity

Huge Cooling Distribution cross-flow plenum.

Environment may contain:
- giant cooling fans
- ventilation duct
- louvers
- condensation
- steam
- cooling pipes
- service bridges
- airflow indicators
- hanging cables
- large negative space

## Gameplay-vs-preview separation

Actual game art may use these environment assets.

But `MAP-PREVIEW.html` must only show an environment element when it has gameplay function.

Examples:
- Wind Zone: SHOW
- Wind Occluding Baffle: SHOW
- Fan Housing with no collision/hazard role: HIDE
- decorative steam: HIDE
- decorative cable: HIDE
- background cooling core: HIDE

## Wind visual language in actual game

Rope / Anchor:
cyan readability remains reserved.

Wind:
communicate by motion:
- particles
- steam
- cloth/cable movement
- vent shutters
- fan rotation

Do not rely on permanent cyan wind lines in final art.

## Fan A

Visual state:
steady continuous operation.

Must not read as:
blade-contact death hazard.

## Fan B

Must visibly communicate:
- LULL
- WARNING spin-up
- ACTIVE burst
- DECAY

Timing must be readable without text tutorial.

## Wind Shadow

Functional Baffle:
heavy fixed Cooling duct / splitter / shielding structure.

Must visually justify:
- solid body
- airflow break

No movement language.

## Access Intake Pocket

Must read as optional maintenance intake:
- deeper
- denser
- higher local security
- still part of Cooling system

Carrier + Guards remain gameplay readable.

## Audio

Fan A:
steady low-frequency rotation + airflow.

Wind Shadow:
clear reduction / muffling.

Fan B:
- lull idle
- mechanical spin-up
- warning
- active air burst
- decay

Barks should not be masked by Fan audio.

At Exit:
fan rhythm transitions toward pressure pipe / valve stress rhythm.
