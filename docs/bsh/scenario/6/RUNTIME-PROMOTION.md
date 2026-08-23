# Sector 06 Runtime promotion

Sector 06의 Runtime 권위는 `6-1~6-8 AREA-SPEC.v2.json → AREA-CATALOG.sector06.json → generated sector06 catalog`이다.

| Stage | Runtime 계약 |
| --- | --- |
| 6-1 | 적·Wind 없는 Skybreak 경로와 5개 recovery catch |
| 6-2 | 단일 continuous Wind `(-1,0) / 500 / falloff 80`과 Wind 밖 Lee pocket |
| 6-3 | Standard Sentry 1기, optional kill, Cutter 없음 |
| 6-4 | 위협 없는 rest Stage; Sector Timer는 Stage 진입에서 초기화하지 않음 |
| 6-5 | Scanner 1개가 C1·C2·C3만 제어하며 동일 목적 상시 grapple bypass 없음 |
| 6-6 | Patrol 1기, ping-pong `48px/s`, endpoint wait `0.45s`, optional kill |
| 6-7 | Cutter Sentry 1기, 실제 `cutter-fire`, optional kill |
| 6-8 | 적 없는 Pad 접근과 기존 interact console의 denial, `content-boundary` |

Stage 연결은 `6-1 → ... → 6-8`만 소유한다. `5-8 → 6-1`, Final Security, Boss, boarding, access grant와 ending은 포함하지 않는다.

일반 Timer의 `60초 / +10초 / cap 60초 / Purge 240px/s` 수치는 확정됐지만, `+10초 physical trigger`, 최초 Field origin, 개인 Purge 사망 복귀는 [`sector-timer-and-boss-flow.md`](../../../sector-timer-and-boss-flow.md)에서 HOLD다. 따라서 이번 승격은 새 Timer·Purge 상태, snapshot, UI 또는 AI를 만들지 않는다.

Camera 숫자 권위는 Stage 문서에 없으므로 초기 승격은 default authored camera를 사용한다. desktop/mobile framing과 플레이 감각은 실제 브라우저 sweep에서 좁게 튜닝한다.
