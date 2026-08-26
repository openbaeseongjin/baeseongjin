# Sector 01 맵 정합 — Calibration 표시와 Camera 설계

**상태:** 사용자 승인 설계, 2026-08-22
**구현 브랜치:** `codex/sector01-calibration-camera`
**핵심 목표:** 맵 원본 권위, Calibration 밸런싱, 실행 중인 게임의 소유권을 섞지 않고 Sector 01의 남은 맵 관련 차이를 보이고 플레이 가능한 상태로 만든다.

## 핵심 요약

| 우선순위 | 이번에 완료할 일 | 완료 기준 |
| --- | --- | --- |
| P0 | 1-4 Calibration의 선택·성공 표시 | 선택 Player만 `LOADED` → HUD 상태 → `VERIFIED`를 보고, 기존 objective·gate 권위는 변하지 않는다. |
| P1 | 1-5·1-7 추적 Camera 확인 | 다음 안전 경로가 읽히지 않는 Zone만 v2 원본에서 조정하고, 지형·경로·입력은 유지한다. |
| P2 | Sector 01 직접 플레이 근거 정리 | 1-3·1-5 Cover 시야 차단, 1-4 진행, 1-5·1-7 Camera, 경로·저장 지점 가독성을 데스크톱·모바일에서 확인한다. |

### 확정된 결정

- 표시 문구는 `CALIBRATION PROFILE / LOADED`, `CALIBRATION / VERIFIED` 두 개만 사용한다.
- 카드명·계열·Calibration 상태는 선택 Player의 HUD에만 지속 표시한다. 월드 위 텍스트, 카드별 신규 대사, Player Bark는 추가하지 않는다.
- Camera는 기존 Zone ID를 유지한 추적 방식만 쓴다. 강제 Pan·연출 장면·입력 잠금은 추가하지 않는다.
- 멀티플레이 HUD는 기존 Player snapshot에 추가하는 읽기 전용 `calibrationVerifiedSourceIds`만 읽는다. 새 command·event를 만들거나 Presentation에서 성공을 다시 판정하지 않는다.
- Profile별 거리·속도·시간 수치는 이번에 결정하거나 변경하지 않는다.

### 이번 작업의 한계

기존 범용 Calibration 성공 판정은 유지한다. 따라서 열두 Profile의 개별 수치 조건은 여전히 별도 tuning 작업이며, 이번 결과를 Profile별 완전 구현으로 표시하지 않는다.

## 1. 범위와 완료 경계

이 변경은 권장된 Sector 01 후속 순서 중 맵 관련 부분을 완료한다.

1. Stage 1-4에서 Augment 선택 뒤와 기존 Calibration 성공 신호 뒤에 선택 플레이어의 Calibration 진행 상태를 표시한다.
2. Stage 1-5와 1-7의 현재 추적 Camera를 데스크톱·모바일 화면 크기에서 확인한다. 다음 안전 경로가 읽히지 않는다는 근거가 있을 때만 생성된 v2 Camera Zone의 경계와 확대 비율을 바꾼다.
3. 기존에 수동 확인으로 남은 1-3·1-5 Cover 시야 차단을 포함해 Sector 01의 이동 경로를 직접 점검하고, 실제로 확보한 근거만 기록한다.

다음 항목은 명시적으로 이번 범위 밖이다.

- 프로필별 Calibration 거리·속도·시간 밸런싱. 기존 범용 Calibration 성공 권위는 그대로 유지한다.
- 카드별 신규 대사, 플레이어 Bark, 강제 Camera Pan, 연출 장면, 입력 잠금.
- 멀티플레이 simulation·wire protocol·실행 중 게임 교체·배포 설정·새 자동 테스트 모음 변경.
- 직접 플레이 근거가 기존 계약의 맵 결함을 증명하지 않는 한 Terrain, Anchor, Recovery, Enemy, Wind, Objective, Progression, Scanner, Behavior Registry, seamless compiler 변경.

최종 보고에서는 프로필별 Calibration 조건이 별도 미구현 수치 조정 작업임을 계속 명시한다. 열두 프로필이 모두 정확한 게임플레이 정합이라고 주장하지 않는다.

## 2. 기준 원본과 소유권

| 관심사 | 소유자 | 규칙 |
| --- | --- | --- |
| Stage 1-5·1-7 Camera 값 | `AREA-SPEC.v2.json` | Map Editor의 Draft → Validate → Apply로만 수정한다. 결정적으로 생성된 출력은 항상 덮어쓰며 수기 편집하지 않는다. |
| 활성 Sector 01 Area 정의 | manifest가 선택한 생성 Catalog | Sector 01의 8개 Stage는 생성된 v2 출력을 유일한 선택 원본으로 유지한다. |
| Calibration 완료 | 기존 `GameSimulation`과 Sector Progress controller | 기존 플레이어별 범용 성공 규칙이 이번 작업의 유일한 상태 작성자다. Presentation은 성공을 판정하지 않는다. |
| Calibration 검증 상태 전달 | 기존 Player snapshot | `calibrationVerifiedSourceIds`를 additive 읽기 전용 필드로 전달한다. 이 필드는 현재 Player의 HUD만 읽고 새 wire command·event를 만들지 않는다. |
| Calibration 메시지와 HUD | 클라이언트별 표시 계층 | 현재 플레이어의 선택 Augment와 검증된 Calibration source 상태에서 표시를 만든다. 새 network message나 공유 월드 object는 만들지 않는다. |
| Calibration 수치 조정 | 별도 후속 수치 조정 작업 | 이번 작업에서는 수치를 파생·고정·변경하지 않는다. |

이 경계는 메인 개발자가 Runtime·밸런싱 코드를 독립적으로 계속 작업할 수 있게 한다. 구현은 검토 준비 전까지 전용 작업 디렉터리와 브랜치에 머문다.

## 3. Stage 1-4 Calibration 표시

### Player 경험

플레이어가 `sector-01-04:maintenance-node`에서 Augment를 선택한 뒤 다음 로컬 시스템 메시지를 한 번 표시한다.

`CALIBRATION PROFILE / LOADED`

선택 플레이어가 Augment를 보유했지만 기존 Calibration Frame 요구를 아직 완료하지 않았을 때에는 선택 카드명, 계열, 대기 중인 Calibration 상태를 로컬 HUD 한 줄에 표시한다. HUD에는 긴 카드 설명이나 월드 공간 텍스트를 넣지 않는다.

기존 성공 권위가 해당 플레이어의 검증된 source ID에 `sector-01-04:universal-calibration-frame`을 추가하면 다음 로컬 시스템 메시지를 한 번 표시한다.

`CALIBRATION / VERIFIED`

같은 HUD 줄은 검증 완료 상태로 갱신한다. 각 단계는 `(player, calibration source, selected Augment)` 조합마다 한 번만 보이므로 상태 복제 반복, 재접속, 화면 갱신으로 반복 표시되지 않는다.

### 권위와 멀티플레이 규칙

- 플레이어는 자신의 선택 카드와 Calibration 상태만 본다.
- 팀원의 선택 또는 검증은 보는 플레이어의 로컬 메시지를 만들거나 HUD를 완료 상태로 만들지 않는다.
- 기존 공유 Objective는 현재 대상 플레이어 집합이 각자 검증을 마쳤을 때만 완료된다. 나간 플레이어와 늦게 합류한 플레이어는 기존의 한 방향 Objective 동작을 유지한다.
- 현재 선택이 없으면 HUD 줄도 없다. 지원하지 않는 선택 카드가 나타나면 HUD는 검증 완료 상태를 보이지 않으며 Objective를 바꾸지 않는다.
- Presentation은 안정적인 클라이언트 상태를 읽기만 하고 Player·Objective·Gate·network state를 작성하지 않는다.

## 4. Stage 1-5·1-7 추적 Camera

Camera는 추적 Camera로 유지한다. 기존 Zone ID, terrain, anchor, route point, wind, enemy, control input을 바꾸지 않는다. Pan, 연출 장면, 잠금, 입력 억제를 추가하지 않는다.

각 기존 Zone에서 현재 플레이어, 다음 필수 안전 착지 지점 또는 Anchor, 바로 앞 위험 요소가 이해되는지 확인한다. 이후 경로의 불필요한 정보를 미리 드러내지 않아야 한다. 데스크톱·모바일은 기존의 별도 확대 비율 필드를 사용한다. 관찰한 화면이 이 기준을 만족하지 않을 때만 v2 원본을 Map Editor로 수정하고 결정적으로 재생성한다.

Camera 검토는 수치를 발명해 재설계하는 과정이 아니라 근거에 따른 과정이다. 현재 Zone이 통과하면 바이트 단위로 그대로 둔다.

## 5. 검증과 문서화

이 사용자 요청의 맵 구현에는 새 자동 테스트 모음을 추가하지 않는다. 필요한 근거는 다음과 같다.

1. 최종 후보에서 `npm run check`를 실행한다.
2. 최종 후보에서 `npm run format:check`, `git diff --check`를 각각 한 번 실행한다.
3. Camera 데이터 변경마다 Map Editor Draft → Validate → Apply를 사용하고 결정적 generated output의 최신성을 확인한다.
4. 영향을 받은 Stage Apply마다 새로운 격리된 싱글플레이 Preview를 실행한다. 실행 중인 일반 싱글플레이 또는 멀티플레이 게임은 바꾸지 않는다.
5. 데스크톱·모바일 화면 크기에서 1-3 Cover 시야 차단, 1-4 Calibration 표시와 출구 진행, 1-5 Camera 구도와 Cover 시야 차단, 1-7 Camera 구도, Sector 01 경로·저장 지점 가독성을 직접 확인한다.
6. 영향받은 `PRODUCTION-ALIGNMENT.md`에 각 결과를 `VERIFIED`, `PARTIAL`, `NOT IMPLEMENTED`으로 구분해 기록하고 scenario checkpoint를 갱신한다.

구현은 1-4·1-5·1-7 Production Alignment 문서와 통합 현황을 갱신한다. 기준 문서가 모든 승인 결정을 소유하면 임시 Sector 01 항목은 `SESSION-HANDOFF.md`에서 중복 보관하지 않고 제거한다.

## 6. 전달 순서

1. 로컬 Calibration 표시 adapter를 추가하고 simulation 권위를 바꾸지 않은 채 싱글·멀티플레이 클라이언트 표시 경로에 연결한다.
2. 새로운 게임에서 Stage 1-4의 선택 → loaded → 기존 성공 → verified → 출구 경로를 확인한다.
3. Map Editor로 1-5·1-7 Camera 필드를 검토하고, 필요할 때만 수정·재생성·검증한다.
4. 지정한 데스크톱·모바일 직접 검증을 수행하고 근거가 있는 문서만 갱신한다.
5. 최종 저장소 검사를 실행하고 검증 기록을 남긴 뒤 메인 개발자 검토용 분리 브랜치를 준비한다.
