# Presentation / VFX 계약

## 일반 설비 Hit
- 작은 white/cyan impact
- 기존 Rope impact 계열 SFX
- Damage feedback 일반 강도

## 취약부 Hit ×1.5
- Orange stress seam flash
- 1 frame~짧은 hit-stop은 구현 가능하면 검토
- 일반 hit보다 강한 SFX
- `×1.5` 또는 Critical 계열 feedback은 UI 정책과 맞으면 사용
- 단, 세계관 텍스트는 `WEAK POINT`보다 정비 언어 우선

## Exposed 상태
Phase target의 maintenance cover가 열리고 취약부가 점등된다.
8초 동안만 damage receiver enabled.

## Shield closed 대응
여기서는 '마법 보호막'처럼 보이면 안 된다.
Player-facing 표현은:
- cover closed
- clamp housing closed
- bearing guard closed
- lock housing retracted

BossEncounterRuntime의 shield state는 **내부 상태명**으로 유지.

## Collapse
Timer 0:
- 상부 Gate Crown 하강
- red/orange warning
- camera shake는 가독성을 해치지 않는 선
- Player/Anchor를 가리지 않음
