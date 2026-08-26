# Sector 02 (2-1~2-8) Camera Zone / Story Presentation 점검

[`1/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md`](../1/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md)
마지막 절 "범위에서 제외한 것 — Sector 02"는 Sector 02의 `cameraZones`가
비어 있는 것을 1-5~1-8과 같은 종류의 **미구현 gap**으로 보고 "처음부터 새로
설계해야 한다"고 적었다. 이 문서는 그 전제를 다시 확인한 결과를 정정하고,
실제로 남아 있는 Story Presentation 공백만 구현 가능한 형태로 정리한다.

## Part 0 — Camera Zone은 gap이 아니다 (정정)

`docs/bsh/scenario/2/2-1`~`2-8`의 `## 14. Camera` 절 8개를 전부 직접
확인했다. 전부 동일한 결론을 명시한다:

| Stage | 원문 |
| --- | --- |
| 2-1 | "2-1에서는 새로운 Camera System을 만들지 않는다." |
| 2-2 | "2-2에서는 Custom Camera Pan 없음 — 대신 공간 배치로 Drone을 미리 노출한다." |
| 2-3 | "Custom Camera: 필요 없음 — Node가 큰 공간의 중앙 Landmark로 보이도록 Level Composition으로 해결한다." |
| 2-4 | "Custom Camera Pan을 추가하지 않는다." |
| 2-5 | (동일 패턴, Custom Pan 언급 없이 Level Composition으로 해결) |
| 2-6 | "새 Camera Mechanic은 추가하지 않는다." |
| 2-7 | (동일 패턴) |
| 2-8 | "Custom Pan 없음. Scale은 Player와 Architecture의 상대적 크기로 보여준다." |

즉 8개 Stage 전부 `AuthoredCameraDirector.js`의 기본값(Desktop Zoom `1`,
Mobile `0.72`, `HORIZONTAL_PLAYER_RATIO 0.38`/`VERTICAL_PLAYER_RATIO 0.58`
고정 추적)만 쓰고, 원하는 구도는 **Level Geometry 배치**(P1 도달 시 특정
오브젝트들이 한 화면에 들어오게 좌표를 잡는 방식)로 해결한다고 스스로 명시한다.
Sector 01처럼 Zone별로 zoom을 좁히거나 넓히는 연출이 애초에 설계되지
않았다. `Sector02AreaCatalog.js`의 `cameraZones` 필드가 8개 area 전부
비어 있는 것은 **의도된 상태**이며, `cameraZone(...)` 객체를 채워 넣는
구현 작업은 필요 없다.

(참고: 실제 구도 검증 — 예를 들어 2-2의 "P1 도착 시 Player+Cover
A+Drone+Patrol Destination 중 최소 3개가 한 화면"이 실제 `bounds.width`·
zoom `1` 기준으로 화면에 들어오는지 — 는 Camera 코드 문제가 아니라 Level
Geometry 좌표 문제이므로 이 문서의 범위 밖이다.)

## Part 1 — Story Presentation 공백 3건

`src/game/presentation/AuthoredStoryPresentation.js`를 직접 읽고
`ENTRY_PRESENTATIONS`/`POSITION_PRESENTATIONS`/`OBJECTIVE_PRESENTATIONS`/
`GATE_PRESENTATIONS` 네 딕셔너리의 `sector-02-*` 키를 전수 확인했다(PR #507
반영 이후 기준). 결과:

- `ENTRY_PRESENTATIONS`: 2-1·02·03·04·05·07·08 있음, **2-6만 없음**
- `POSITION_PRESENTATIONS`: 2-1·05·07만 있음, **2-2·03·04·06·08 없음**
- `OBJECTIVE_PRESENTATIONS`: 2-3·08만 있음(둘 다 실제로 유일하게 필요한 곳)
- `GATE_PRESENTATIONS`: 2-8만 있음(Sector 종료 지점이라 유일하게 필요)

이 중 각 Stage README의 `## 15. Story Trigger` 절과 대조했을 때, **실제
텍스트 트리거인데 아직 코드에 없는 것은 3건뿐**이다. 나머지
(POSITION 없는 2-4·2-8, GATE 없는 2-1~2-7)는 아래 "이미 커버됨" 절에서
근거와 함께 gap이 아님을 밝힌다.

### 공백 1 — `sector-02-02` POSITION: SECURITY STATUS

2-2 §15 TRIGGER B(환경 패널, P1 도달 근처):

> `SECURITY PATROL / ACTIVE` · `RESIDENTIAL TRANSIT / RESTRICTED`

좌표 근거: `route-p1` (-144, -256), `cover-a` platform이 x -32~96 / y
-320, `p1` platform이 x -320~32 / y -256. 두 platform이 겹치는 구간에
패널이 있다고 보고 그 사각형을 bounds로 잡았다.

```js
"sector-02-02": Object.freeze([
    Object.freeze({
        token: "security-status",
        minLocalX: -320, maxLocalX: 96,
        minLocalY: -320, maxLocalY: -192,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-02-02:security-patrol-active", title: "SECURITY PATROL", detail: "ACTIVE", durationSeconds: 1.1 }),
            Object.freeze({ id: "sector-02-02:residential-transit-restricted", title: "RESIDENTIAL TRANSIT", detail: "RESTRICTED", durationSeconds: 1.1 })
        ])
    })
])
```

§15 "넣지 말 것"에 `GROUP C CONTAINMENT` / `WORKER LOCKDOWN` /
`EVACUATION DENIED` / `CLASS C RESTRICTION` 같은 직접 해석 문구가
명시적으로 금지돼 있다 — 위 두 문구만 사용하고 추가로 확대 해석하지 않았다.

### 공백 2 — `sector-02-03` POSITION: NODE DETECTION

2-3 §15 TRIGGER B(Node 접근 시, 상호작용 전):

> `GRAPPLE DEVICE DETECTED` · `EMERGENCY CONFIGURATION ACTIVE`

TRIGGER C("FOUNDATION AUGMENT DETECTED / SPECIALIZATION AVAILABLE")는
이미 `ENTRY_PRESENTATIONS`(`sector-02-03:foundation-detected`)와
`OBJECTIVE_PRESENTATIONS`(`sector-02-03:specialization-selected`)가
사실상 흡수했으므로 다시 추가하지 않는다. TRIGGER B만 비어 있다.

좌표 근거: `specialization-node`가 (0, -416), 접근 경로인 `route-p2`가
(0, -384). Node 진입 직전 구간을 bounds로 잡았다.

```js
"sector-02-03": Object.freeze([
    Object.freeze({
        token: "node-detection",
        minLocalX: -96, maxLocalX: 96,
        minLocalY: -480, maxLocalY: -320,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-02-03:grapple-device-detected", title: "GRAPPLE DEVICE", detail: "DETECTED", durationSeconds: 0.9 }),
            Object.freeze({ id: "sector-02-03:emergency-configuration-active", title: "EMERGENCY CONFIGURATION", detail: "ACTIVE", durationSeconds: 1.1 })
        ])
    })
])
```

§15 원문에 "1-4와 같은 기업 시스템 언어를 재사용한다"는 메모가 있다 —
`sector-01-04:telemetry-analyzed`/`override-available` 톤(짧은 시스템
로그체)과 동일한 어조를 그대로 따랐다.

### 공백 3 — `sector-02-06` ENTRY: 없음

2-6은 `ENTRY_PRESENTATIONS`에 키 자체가 없다. §15 원문은 이례적으로
"2-6의 Story Trigger는 거의 모두 Environmental Trigger다"라고 밝히고
TRIGGER A/B/C 전부 "텍스트 없음" / "별도 Status Message 없음"이라
명시한다 — 즉 나머지 7개 Stage와 달리 **텍스트 트리거가 거의 없는 것 자체가
의도**다. 다만 같은 절 끝에 예외를 하나 허용한다:

> ### Optional Minimal Sign
> 필요하다면: `RESIDENTIAL BLOCKS 12–18` 정도의 위치 정보만 허용.
> ### 금지
> `TRANSFER SUSPENDED` / `SHELTER CAPACITY FULL` / `GROUP A` / `GROUP B` /
> `PRIORITY ACCESS` — 2-6에서 새 Evacuation Evidence를 추가하지 않는다.

다른 7개 Stage가 전부 `ENTRY_PRESENTATIONS`로 지역 식별 배너를 갖고
있는데 2-6만 완전히 없는 것은, 그 자체가 "Optional Minimal Sign"의 존재를
전제로 한 것인지 아니면 단순 누락인지 README만으로는 완전히 확정되지
않는다. 아래는 README가 명시적으로 허용한 범위 안에서 다른 7개와 형식을
맞춘 제안이며, **적용 여부는 사용자 확인 후 진행을 권장한다**(다른
gap과 달리 "안 넣는 것"도 유효한 해석이라 임의로 확정하지 않았다).

```js
"sector-02-06": Object.freeze([
    Object.freeze({
        id: "sector-02-06:residential-blocks",
        title: "QUIET RESIDENTIAL VOID",
        detail: "RESIDENTIAL BLOCKS 12–18",
        durationSeconds: 1.3
    })
])
```

## Part 2 — 이미 커버됨 (재분석 방지용 기록)

- **`sector-02-01`**: TRIGGER C(COMMUNITY NOTICE, P4)가
  `POSITION_PRESENTATIONS`의 `community-notice`/`assembly-status`로 이미
  구현됨. TRIGGER B는 원문이 "텍스트가 아니라 소품으로" 암시한다고 명시 —
  코드 대상 아님.
- **`sector-02-04`**: TRIGGER B(FLOOR MARKERS)·TRIGGER C(LIVED-IN
  DENSITY) 둘 다 원문이 "텍스트가 아니라"고 명시(반복 배경 소품으로 밀도
  암시). `POSITION_PRESENTATIONS` 대상 문구 자체가 없다 — 없는 것이 맞다.
- **`sector-02-05`**: TRIGGER C(STATUS DISPLAY, P3)가
  `POSITION_PRESENTATIONS`의 `assembly-complete`/`transit-restricted`/
  `upper-transit`로 이미 구현됨.
- **`sector-02-07`**: TRIGGER C(MAIN SHELTER STATUS, P5)가
  `POSITION_PRESENTATIONS`의 `shelter-capacity`/`transfer-suspended`/
  `designated-area`로 이미 구현됨.
- **`sector-02-08`**: TRIGGER C(FINAL TRANSFER CONTROL, P10)가
  `OBJECTIVE_PRESENTATIONS`의 `transfer-control-read`(group-a/b/c)로,
  이어지는 "PRIORITY ACCESS: ACTIVE"가 `GATE_PRESENTATIONS`의
  `sector-02-08:gate`로 이미 구현됨.
- **`GATE_PRESENTATIONS`가 2-1~2-7에 없는 것**: 각 Stage README의 Gate
  통과 지점에 2-8 수준의 고유 전환 문구가 없다(그냥 다음 Stage로 진행) —
  Sector 01도 모든 Stage가 아니라 의미 있는 전환에만 GATE_PRESENTATIONS를
  쓰는 것과 같은 패턴이라 gap으로 보지 않는다.

## 다음 단계

1. 공백 1·2(`sector-02-02`, `sector-02-03`의 `POSITION_PRESENTATIONS`)를
   `AuthoredStoryPresentation.js`에 그대로 옮긴다 — 확정 가능.
2. 공백 3(`sector-02-06` `ENTRY_PRESENTATIONS`)은 위에 적은 대로 해석이
   갈릴 수 있어 적용 전 확인 필요.
3. `tests/authoredStoryPresentation.mjs`에 추가되는 케이스를 보강한다.
4. 적용 후 영향받은 Stage `PRODUCTION-ALIGNMENT.md`에 근거를 기록하고
   checkpoint를 재계산한다.
