# Built-in ImageGen edit prompt

## Input roles

- Image 1: edit target — the comparison board whose `CURRENT APPROVED` column contains the seven approved enemy identities.
- Image 2: material and mood reference — the approved Sector 04 Upper Residential / Amenity District master.
- Use case: `precise identity-preserving pixel-art material edit`.

## Edit contract

Create a clean material-reference board for the same seven monsters. Preserve exact silhouettes, proportions, equipment, facing, pose, pixel-art scale and role identity. Preserve role and behavior colors exactly: Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red warning colors, and Sentry/Pursuit sensors and exhaust.

Change only neutral exterior metal toward maintained Sector 04 cool gray, blue-green graphite, pale architectural alloy and restrained olive-gray weathering. Moss or lichen may appear only as sparse flat discoloration inside existing neutral plate shapes. Do not add grass blades, leaves, vines, protrusions, weapons, limbs, accessories, text on bodies or new micro-details. The district is maintained and unusually normal, not ruined; use minimal dust and oxidation with no heavy rust.

Keep hard-edged low-resolution pixel art, integer pixels and nearest-neighbor appearance. Do not use antialiasing, blur, translucent edges, background inside sprite bounds or watermarks. The built-in output is retained only as a material-treatment reference. Final atlases are rebuilt deterministically from approved source pixels so atlas geometry and binary alpha cannot drift.

## User-approved vine feasibility edit

- Edit target: `source/imagegen/enemy-family-material-reference.png`
- Saved result: `preview/test/sector-04-enemy-vine-test-v1.png`
- Use case: `precise-object-edit`

Add restrained creeping vines only to the seven monsters in the Sector 04 variant column while keeping the Current Approved column unchanged. Use one or two thin dark-green strands on larger neutral metal housings with two to four small blocky leaves; use one short trace with at most two leaves on Swarm. Preserve identity, silhouette, equipment, facing, pose, role colors, sensors, cores, barrels, exhausts, warning panels and moving joints. Do not add weapons, limbs, flowers, thick bushes, long hanging growth, dirt clumps, antialiasing, blur, glow or translucent edges.

The approved ImageGen result is a visual target only. Runtime atlases use deterministic cell-local masks that replace existing neutral metal pixels and preserve every source alpha byte.
