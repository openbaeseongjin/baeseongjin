# 6-6 PRODUCTION ALIGNMENT REV2.2

Latest checked main:
`8b344f0f7a2309bfb316655668ed180718db7781`

Current verified Rope baseline:
- hookSpeed 1200
- hookFlightRatio 1/3
- Hook Reach 400
- hookReload 0.5
- attachBuffer 0.1
- swingImpulse 780
- releaseAngularTransfer 0.55

Current Patrol/Combat behavior:
- no valid target → patrol advances
- valid target → patrol stops and attacks
- Rope cut only with cutter-fire; 6-6 does not use it

REV2.2 supersedes REV2.1 solely to close Base-Reach skips found during pre-package QA.
