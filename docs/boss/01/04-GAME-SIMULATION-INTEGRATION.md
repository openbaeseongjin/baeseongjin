# GameSimulation 통합 계약

## 목표
기존 BossEncounterRuntime의 `applyDamage()`를 Player Rope Impact와 연결한다.

## 권장 처리 위치
현재 Player step에서 일반 Rope Impact를 계산하는 단계와 인접하게 Boss contact를 평가한다.

개념 순서:

```text
prepare player step
→ input / rope simulation
→ normal enemy rope impacts
→ BOSS PHASE TARGET CONTACT
→ augment impacts
→ remaining world step
```

정확한 삽입 위치는 현재 GameSimulation의 최신 control flow를 따라야 한다.

## Boss impact 입력

필요:
- player id
- player position
- player velocity
- rope attached 여부
- current boss snapshot
- current phase target
- Player contact state

## 판정

1. Boss encounter가 `active`인가?
2. Shield가 `exposed`인가?
3. Player Rope가 attached인가?
4. 현재 Rope Impact minimum speed 이상인가?
5. 현재 Phase assembly에 `outside → inside`로 진입했는가?
6. Impact position이 weak point radius 안인가?
7. Damage 계산
8. `applyBossDamage(playerId, finalDamage)`

## 중요한 Phase floor
BossEncounterRuntime이 이미 phaseHealth floor를 강제하므로,
150 피해가 계산돼도 Phase 120을 넘겨 다음 Phase HP까지 깎으면 안 된다.
이 로직은 기존 Runtime에 맡긴다.

## 실패 결과
Shield closed:
`accepted:false / core-shielded` 또는 Boss target resolver 단계에서 no-hit.

Speed below minimum:
Boss damage API를 호출하지 않는다.

Repeated overlap:
Boss damage API를 호출하지 않는다.

## Multiplayer
Boss HP는 shared.
Contact edge state는 Player별이어야 한다.

예:
- P1이 target 안에 머무름 → 1회만
- P2가 새로 진입 → 별도 1회 가능
