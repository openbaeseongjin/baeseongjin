# WORLD MASTER STRUCTURE — VERTICAL SOCIAL CROSS-SECTION

> 상태: `DRAFT · WORLD STRUCTURE CONFIRMATION` — Sector 04 재정의 제안 포함, 사용자 승인 필요
> 원본: `WORLD-MASTER-STRUCTURE-SNOWPIERCER-DRAFT.html` (interactive HTML, 이 문서로 대체)

> **⚠ 현재 Sector 04 authored 상태와의 충돌**: 이 문서는 Sector 04를 `UPPER RESIDENTIAL / AMENITY DISTRICT`로 재정의할 것을 제안한다. 그러나 `docs/bsh/scenario/4/README.md`(REV 1.1)는 이미 Sector 04를 `TRANSIT / INFRASTRUCTURE`(Cutter Fire / Transit Wake / Momentum Under Interruption, 8/8 Stage 상세 완성, standalone Area catalog 구현 반영)로 authored 완료했다. 이 문서를 승인하면 기존 Sector 04 전체를 재설계해야 한다 — 이 문서만으로 Sector 04 재정의를 확정하지 않는다. 사용자의 명시적 결정이 먼저 필요하다.

Snowpiercer식 "각 구역 = 다른 사회 기능 / 계층 / 분위기"를 수직 Mega-Structure 전체 Sector에 적용하는 안이다.

## 핵심 구조

```text
MAINTAIN → LIVE → CONSUME → LIVE BETTER → CONTROL → ESCAPE
```

진행 높이가 단순 난이도 상승이 아니라 **같은 건물의 사회 구조를 아래에서 위로 해부하는 과정**이 된다.

```text
SPACE FIRST → SOCIAL FUNCTION → ARCHITECTURAL CAUSALITY → ROPE GAMEPLAY
```

**핵심 변경 제안**: Sector 04의 Gameplay(Cutter/Wake)를 먼저 고정한 뒤 공간을 맞추는 방식을 중단한다. 먼저 전체 건물 안에서 04가 어떤 사람들의 어떤 생활을 보여줘야 하는지 결정하고, 그 다음 기존 Runtime mechanic 중 맞는 것을 재사용한다.

## 6-Sector Vertical World (제안)

높이 순(Rooftop → Lower Core):

| Sector | Tag | 이름 | 용도 | 공간 | 핵심 질문 |
|---|---|---|---|---|---|
| 06 | ESCAPE | ROOFTOP / EVACUATION | 최종 탈출·외부 하늘·Pad 03 | Open sky · antenna mast · structural islands · pad perimeter | "끝까지 살아서 탈출할 수 있는가?" |
| 05 | POWER | CORPORATE ZONE | 의사결정·Incident Continuity·조직 권력 | Wide · clean · bright · empty · controlled · sealed surfaces | "누가 무엇을 보존하기로 결정했는가?" |
| 04 | **PROPOSED** | UPPER RESIDENTIAL / AMENITY DISTRICT | 상층 거주·여가·교육·의료·개인 서비스 | Sky residence · garden · club · private clinic · school · generous atrium | "같은 건물인데 왜 여기의 삶은 이렇게 달랐는가?" |
| 03 | PUBLIC | CENTRAL EXCHANGE COMPLEX | 대중 상업·교류·일상 서비스·환승 | Market · retail · grand atrium · service spine · transfer mezzanine | "같은 사고인데 이동 조건은 왜 달랐는가?" |
| 02 | LABOR LIFE | WORKER DISTRICT | 노동자와 가족의 실제 생활권 | Apartment exterior · balcony · canteen · laundry · shelter walkway | "왜 이 사람들은 여기서 기다리고 있었는가?" |
| 01 | BACKSTAGE | MAINTENANCE | 건물을 유지하는 설비·정비 공간 | Pipe · fan · machinery · catwalk · cooling shaft · containment | "Rope로 이 시설을 빠져나갈 수 있는가?" |

`Sector 05 CORPORATE ZONE`은 이 문서 작성 시점 표기다. 실제 저장소의 `docs/bsh/scenario/5/README.md`는 REV 3.0에서 `CONTINUITY CONTROL`로 이미 재작성되어 있다(`scenario-development-integration.md` 항목 64 참고) — 이 문서는 그 갱신 이전 표기를 그대로 보존한 draft이며, 이 문서를 이유로 Sector 05 표기를 되돌리지 않는다.

## 왜 Sector 04는 Upper Residential / Amenity인가 (제안 근거)

| | SECTOR 02 — WORKER LIFE | SECTOR 04 — UPPER LIFE (제안) |
|---|---|---|
| 밀도 | 좁고 밀도 높은 주거 | 넓고 여백 많은 주거·Amenity |
| 공용시설 | 공동 Balcony / Canteen / Laundry | Sky garden / private lounge / clinic |
| 생활 리듬 | Shift schedule / Shelter signage | 개별적이고 조용한 서비스 |
| 상태 | 생활 흔적이 많고 마감은 낡음 | 더 밝고 깨끗한 재료·큰 시야 |
| 사고 대응 흔적 | 대피 허가를 기다린 흔적 | 상부 운영·대피 시스템이 더 오래 살아 있었던 흔적 |

같은 "거주"를 반복하는 게 아니라 **노동자 생활권과 상층 생활권을 의도적으로 대조**한다. 설국열차식 사회 단면도의 가장 강한 효과를 수직도시에 적용하는 지점.

## Sector 04 후보 비교 (제안 시점 평가)

| 후보 | 설명 | 평가 |
|---|---|---|
| ① Upper Residential / Amenity ★ 추천 | 노동자 주거와 직접 계층 대비. Corporate 직전의 사회적 상승이 가장 선명. | 사회 대비 ★★★★★ · 비주얼 변화 ★★★★★ · Story 연결 ★★★★★ |
| ② Civic / Institutional | 병원·학교·행정·공공서비스. 도시 기능은 풍부하지만 Corporate와 행정 이미지가 일부 겹침. | 사회 대비 ★★★★☆ · 비주얼 변화 ★★★★☆ · Story 연결 ★★★★☆ |
| ③ Logistics / Distribution | 물류·창고·공급망. Gameplay 구조는 좋지만 아래→위 사회 계층 상승 흐름이 약해짐. | 사회 대비 ★★★☆☆ · 비주얼 변화 ★★★★☆ · Gameplay ★★★★★ |
| ④ Vertical Mobility | Lift·Transfer Core. Rope와 잘 맞지만 "사회 기능의 객차"보다 연결 통로처럼 느껴질 위험. | 사회 대비 ★★☆☆☆ · 공간 독립성 ★★★☆☆ · Gameplay ★★★★★ |

원본 HTML에서는 ①이 기본 선택(`selected`) 상태였다 — 그 상태를 그대로 보존한다(승인을 의미하지 않는다).

## Snowpiercer식 World Rule

1. **한 Sector = 하나의 사회 기능** — 기믹 이름이 아니라 "누가 여기서 무엇을 했는가?"가 Sector 이름과 공간을 결정한다.
2. **입장 5초 안에 이전 Sector와 달라야 함** — 재료·밀도·천장 높이·조명·생활 흔적·사람의 계층이 즉시 바뀐다.
3. **Gameplay는 구조에서 발생** — Anchor·Enemy·Hazard를 먼저 정하고 방을 만들지 않는다. 실제 건축 구조가 Rope 행동을 만든다.
4. **위로 갈수록 권력과 공간 여유 증가** — 무조건 고급스러워지는 게 아니라, 누가 공간·빛·안전·이동권을 더 많이 가졌는지 보이게 한다.
5. **Story는 환경 비교로 누적** — 긴 로그보다 2↔4, 3↔5처럼 같은 기능의 다른 계층 상태를 비교하게 만든다.
6. **기존 Mechanic은 재검토** — Sector 04의 Cutter/Wake는 아직 LOCKED가 아니다(이 문서 작성 시점 기준). 새 공간에 자연스럽다면 유지, 아니면 다른 기존 Runtime 조합으로 교체한다.

## Story Escalation

| Sector | 요약 |
|---|---|
| 01 · FACILITY | Lower systems really shut down. |
| 02 · WORKER | People waited; evacuation was not equal. |
| 03 · PUBLIC | Same incident, unequal movement conditions. |
| 04 · UPPER LIFE | Upper life / services remained safer or available longer — exact causal link still unknown. |
| 05 · CORPORATE | Post-incident continuity decisions and lower-sector deprioritization become explicit. |
| 06 · ESCAPE | Truth known; objective remains Rooftop Pad 03 and escape. |

## Next Gate (원본 제안)

- **먼저 확정할 것**: Sector 04가 "Upper Residential / Amenity District"인지, 또는 다른 후보인지 World Master 수준에서 확정.
- **그 다음**: 04 공간 기능을 8개 Stage로 분해 → 해당 공간에서 자연스럽게 발생하는 Rope / Enemy / Hazard를 최신 Runtime·Augment 기준으로 다시 설계.

이 저장소의 현재 상태(Sector 04 REV 1.1 8/8 완성)를 고려하면, 이 Next Gate를 실행하려면 "Sector 04 재설계 여부" 자체를 먼저 사용자가 결정해야 한다 — 이 문서를 반영 근거로 Sector 04를 임의로 재작성하지 않는다.
