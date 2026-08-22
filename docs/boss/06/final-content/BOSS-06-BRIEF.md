# BOSS 06 — PAD 03 SHUTTLE CONTAINMENT SECURITY

> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `7e235084e86591adef107d84c9f527e5fadb2d3e`
> 위치: **POST-6-8 FINAL SECURITY ENCOUNTER**
> 최종 목표: **ROOFTOP PAD 03 → MAINTENANCE SHUTTLE → EVACUATION COMPLETE**

## 1. 한 줄 정의

6-8에서 Player가 적 없는 Open-Sky final approach를 끝내고 실제 `MAINTENANCE SHUTTLE / STANDBY` 앞에 도달하지만 `ACCESS DENIED / CONTAINMENT VIOLATION`으로 막힌다. Boss06는 Shuttle 자체가 아니라 Shuttle을 붙잡고 출발을 차단하는 **Pad 03 Containment Clamp Security System**이며, Player는 삼각형으로 배치된 Structural Island를 순회해 P1의 Clamp A, P2의 Clamp B를 서로 다른 방식으로 해제하고, P3에서 Shuttle 뒤쪽 Departure Tower의 Interlock을 파괴한다.

## 2. Boss의 실체

**Boss = Pad 03 Containment Clamp Security System**

구성:
- MAINTENANCE SHUTTLE — 탈출 목표 / 파괴 대상 아님
- CLAMP A — Left Structural Island
- CLAMP B — Upper Structural Island
- DEPARTURE TOWER — Right Structural Island
- DEPARTURE INTERLOCK — 최종 잠금장치
- PAD LIGHTING ARMS — P3 보조 위협
- PAD BEACON — 승리 후 정상화

핵심 감정:

> **“게임 시작부터 찾던 탈출선이 눈앞에 있고, 마지막 보안 장치만 풀면 된다.”**

## 3. Arena

Arena는 Shuttle을 중심으로 한 **삼각형 Structural Island** 구조다.

```text
                ISLAND B
                CLAMP B
                   △
                  / \
                 /   \
        ISLAND A     ISLAND C
        CLAMP A      DEPARTURE TOWER
                \   /
                 \ /
               PAD 03
               SHUTTLE
```

규칙:
- OPEN SKY 유지
- Shuttle은 전투 내내 시각적 중심
- Mandatory route는 Structural Island chain
- Recovery layer는 visible / non-instant-death
- Moving Platform 없음
- 새 Rope input 없음
- 새 성장 없음

## 4. P1 — CLAMP A

P1 질문:

> **“Clamp Sweep을 읽고 위치적으로 뒤를 잡을 수 있는가?”**

패턴:

```text
LOW ARM SWEEP
→ MAX EXTENSION
→ REAR JOINT EXPOSED
→ PLAYER FLANKS VIA STRUCTURAL ROUTE
→ ROPE IMPACT
→ CLAMP A RELEASE
```

특징:
- Low Sweep
- 가장 읽기 쉬운 첫 Phase
- 약점 = Rear Joint
- Timing보다 위치 읽기 비중이 큼
- Clamp가 파괴되는 게 아니라 Shuttle에서 RELEASE

## 5. P2 — CLAMP B

P2 질문:

> **“같은 Clamp family를 더 높은 Rope arc와 짧은 timing window에서 처리할 수 있는가?”**

패턴:

```text
HIGH ARM SWEEP
→ SWEEP CLEARS
→ SHORT COUNTER-WINDOW
→ SIDE COUPLING EXPOSED
→ ROPE COMMIT
→ IMPACT
→ CLAMP B RELEASE
```

특징:
- High Sweep
- P1과 다른 높이
- 약점 = Side Coupling
- 짧지만 읽을 수 있는 Counter-Window
- P1 = positional read / P2 = timing read

## 6. P3 — DEPARTURE TOWER

세 번째 Clamp를 반복하지 않는다.

P1/P2 이후:
- Clamp A released
- Clamp B released
- 둘 다 재활성화하지 않음

남은 문제:

```text
DEPARTURE AUTHORIZATION
DENIED
```

Shuttle 뒤쪽의 **대형 Departure Tower**가 최종 Interlock을 유지한다.

### P3 위협

Pad Lighting Arms가 Security Mode로 전환된다.

역할:
- Pad 접근 Route 일부 Sweep
- whole-arena lock 금지
- 즉사 금지
- Rope Cut 금지
- Clamp A/B 재등장 금지

### P3 목표

```text
FINAL STRUCTURAL-ISLAND TRAVERSE
→ DEPARTURE TOWER
→ DEPARTURE INTERLOCK
→ ROPE IMPACT
```

## 7. Victory

Interlock 파괴 후 추가 난이도 없음.

순서:

```text
PAD SECURITY
OVERRIDDEN

DEPARTURE INTERLOCK
RELEASED
```

1. Clamp A/B가 Shuttle에서 천천히 후퇴
2. Pad Beacon 순차 정상 점등
3. Shuttle idle machinery / engine tone 시작
4. `MAINTENANCE SHUTTLE / BOARDING AVAILABLE`
5. Player가 안전하게 Shuttle로 접근
6. Boarding

## 8. Ending 연결

Boarding 이후:

1. Shuttle 상승
2. 처음으로 수직도시 전체가 아래에 보임
3. Lower city는 대부분 어둡게
4. Upper levels에는 일부 조명 유지
5. Player silhouette
6. Red Scarf
7. 긴 독백 없음
8. `EVACUATION COMPLETE`

Ending은:
- 복수 아님
- 혁명 아님
- 세계 해결 아님
- **ONE PERSON / PARTY ESCAPED**까지만

## 9. Story Boundary

Boss06가 새로 말하지 않는 것:
- 새로운 음모
- Cascade intentional twist
- named CEO villain
- Shuttle fake reveal
- chosen hero
- casualty total
- city recovery epilogue

Boss06는 **Security clearance problem → Escape**만 해결한다.

## 10. 전투 원칙

- Shuttle은 피해 대상 아님
- P1/P2/P3 역할 반복 금지
- P1 = Low Sweep + Rear Joint
- P2 = High Sweep + Counter-Window
- P3 = Departure Tower + Lighting Arms
- Boss Timer 없음
- Arena Collapse 없음
- Instant-death sky 없음
- Open-Sky recovery 유지
- Rope 숙련도가 전투 효율에 직접 연결

## 11. Rope QA

Base Hook Reach: **400px**

Final combat scaffold:
- authored relations: **16**
- max authored relation: **358.05px**
- non-adjacent ≤400px shortcuts: **0**

결론:
- Mandatory authored relation 전부 400px 이내
- 비의도 ≤400px shortcut 0
