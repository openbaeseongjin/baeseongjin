# 6-5 PRODUCTION ALIGNMENT REV2.1

Runtime: generated source with one Scanner controlling only C1-C3; browser tuning pending.

Latest checked main:
`8b344f0f7a2309bfb316655668ed180718db7781`

Current Runtime rechecked:
- Hook reach derived from 1200px/s × 1/3 sec = 400px
- Access Scan phases = AVAILABLE / WARNING / LOCKED / RESET
- new Attach allowed only in AVAILABLE / WARNING
- current Rope persists through LOCKED by existing Access Scan contract

REV2.1 supersedes REV2 because pre-package QA closed two geometry bypasses.
