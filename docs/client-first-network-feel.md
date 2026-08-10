# 클라이언트 체감 우선 멀티플레이 개선 계획

## 결론

멀티플레이의 자기 캐릭터는 서버 응답을 기다리지 않고 로컬 입력으로 현재 시간축을 계속 예측한다. 서버는 같은 `GameSimulation` 규칙으로 결과를 검증하고, 클라이언트는 권위 스냅샷을 받으면 해당 틱으로 복원한 뒤 현재 예측 틱까지 입력을 재실행한다. 동료와 적은 별도의 지연된 시간축에서 두 권위 스냅샷 사이를 보간한다.

이는 최종 상태를 클라이언트에 맡긴다는 뜻이 아니다. 이동·점프·정적 지형 충돌·로프·자기 탄환과 타격 연출은 먼저 예측하지만, HP·적 사망·로프 절단·다운·부활·체크포인트·아티팩트는 서버가 최종 확정한다.

## 레퍼런스에서 채택할 원칙

- [Valve Source Multiplayer Networking](https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking): 자기 입력은 클라이언트 예측, 다른 엔티티는 과거 시간축의 두 스냅샷 사이 보간을 사용한다.
- [Unity Netcode prediction](https://docs.unity.cn/Packages/com.unity.netcode@1.5/manual/intro-to-prediction.html): owner-predicted 객체는 입력 프레임에 반응하고, 권위 스냅샷 수신 후 롤백·재실행한다.
- [Unity Netcode interpolation](https://docs.unity.cn/Packages/com.unity.netcode@1.5/manual/interpolation.html): 외삽은 보간 표본이 없을 때만 쓰는 제한적 폴백이며 예측과 다른 시간축이다.
- [Unreal networked movement](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine): 클라이언트 이동 기록과 서버 보정을 별도 예측 데이터로 관리한다.

## 현재 어긋남

1. `MultiplayerGameApp.update()`는 명령 전송 시점에만 예측을 갱신해 자기 캐릭터가 렌더 프레임마다 계속 진행되지 않는다.
2. `LocalPlayerPredictor.reconcile()`은 최신 스냅샷부터 미승인 명령까지만 재생하며 현재 예측 틱과 잔여 프레임 시간을 소유하지 않는다.
3. 새 권위 상태를 물리·표시 상태 구분 없이 바로 복원해 작은 오차도 화면 순간이동이 된다.
4. `RemoteWorldStateBuffer`는 두 스냅샷 사이 보간이 아니라 최신 위치에서 속도로 미래를 외삽한다.
5. 자기 탄환은 서버 `spawn` 사건이 도착한 뒤에만 표시된다.

## 순차 구현 단위

### A. 지속되는 소유자 예측 시계

- [완료] `LocalPlayerPredictor`가 현재 predicted tick과 최대 512틱 입력 이력을 소유한다.
- [완료] 앱의 기존 120Hz 고정 스텝마다 예측을 진행하고 명령 전송 cadence는 별도 60Hz로 제한한다.
- [완료] submit과 receipt는 예측 상태를 되감지 않고 새 권위 스냅샷만 현재 predicted tick까지 입력을 재실행한다.

### B. 롤백·재실행과 표시 보정

- [완료] ACK 이하 입력을 제거하고 권위 틱부터 현재 predicted tick까지 입력을 재실행한다.
- [완료] 160px 이하 위치 오차는 별도 표시 offset으로 100ms 안에 감쇠한다.
- [완료] 160px 초과 오차, 로프 부착 불일치와 생명 상태 변경은 즉시 권위 상태로 맞춘다.
- [완료] 최근 보정 거리·남은 보정 시간·하드 스냅 누계를 예측기 지표로 제공한다.

### C. 실제 원격 스냅샷 보간

- [완료] 최대 8개 스냅샷을 보관하고 100ms 지연된 서버 tick의 앞뒤 표본을 보간한다.
- [완료] 정상 수신 중에는 외삽하지 않고, 미래 표본이 없을 때만 최대 120ms 외삽한다.
- [완료] 자기 플레이어는 소유자 예측 위치를 사용하고 HP·다운·로프 절단 같은 비위치 판정은 최신 권위 값을 즉시 사용한다.

### D. 자기 공격 예측

- [완료] 자기 자동 발사에 소유자와 발생 tick 기반 `predictionId`를 붙여 탄환과 예상 타격 VFX를 즉시 표시한다.
- [완료] 서버 `spawn/resolve`가 같은 ID를 확정하면 중복 생성·VFX 없이 승격한다.
- [완료] 로컬 충돌은 `predictionId`·대상·clientTick·적중 위치만 hit claim으로 보내고, 서버가 연결 소유권·탄환·대상·tick 범위·위치 오차·중복을 검증한 뒤 서버 대미지로 확정한다.
- 적 HP와 사망은 권위 스냅샷을 따르며, 적 탄환의 플레이어 피격은 피해 클라이언트 주장에 맡기지 않는다.

### E. 계측과 실제 기기 검증

- [완료] Issue #181의 RTT·스냅샷 간격·대기 명령·거부율을 새 구조 위에 재적용한다.
- [완료] 보정 거리 p50/p95, 하드 스냅 수, 외삽 시간과 예측 취소 수를 `?metrics=1` 패널에 추가한다.
- 0/50/100/200ms 지연과 0/2/5% 손실을 한 멀티 E2E에서 검증하고 전체 테스트를 3분 이내로 유지한다.

## 실행 순서

A → B → C → D → E로 진행한다. A와 B가 자기 조작감의 직접 원인이므로 먼저 별도 GitHub 작업으로 완료하고 PC·모바일 체감을 확인한 뒤 공격 예측 범위를 넓힌다. 각 단위는 Issue, 단일 Lore 커밋, PR, 일반 merge commit으로 `main`에 반영한다.
