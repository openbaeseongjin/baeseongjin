# SECTOR 04 — RESIDENT SECURITY OVERRIDE QUORUM CONTRACT

Semantic sources:
- A — earlier Sector04 / 4-2
- B — earlier Sector04 / 4-5
- C — 4-7

4-8 rule:
`COUNT(A,B,C) >= 2`

Truth table:
- 000 FAIL
- 100 FAIL
- 010 FAIL
- 001 FAIL
- 110 PASS
- 101 PASS
- 011 PASS
- 111 PASS

Rules:
- no override is individually mandatory
- no preferred pair
- no substitute credential
- no 4-8-local Override source
- failure keeps a real safe return path
- pass releases the Protected Ascent Interlock

Implementation must use actual persistent state from the latest main/approved earlier-stage migrations.
