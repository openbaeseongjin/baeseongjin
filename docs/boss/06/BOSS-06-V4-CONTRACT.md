# Boss06 V4 Arena·상태 선택 계약

1. AS IS: 3920px 활주로·좌우 Recovery·벽 표현이 충돌과 어긋난다. → TO BE: 3200px 단일 바닥과 좌우 낭떠러지를 사용하며 자동 Recovery를 두지 않는다.
2. AS IS: Ledge·Recovery·Anchor 역할이 섞인다. → TO BE: 주 바닥 안쪽의 단방향 플랫폼 3개와 Base Hook Reach 400px 이내 U1~U10만 전투 이동 구조로 사용한다.
3. AS IS: Runtime 조건문이 이동과 공격을 직접 전이한다. → TO BE: 대기·걷기·점프·내려가기·낙하·착지·공격·패배를 구체 StateDefinition 카탈로그로 소유한다.
4. 플랫폼 점유는 전용 이벤트나 저장 boolean 없이 매 tick 보스 발 좌표와 canonical surface bounds로 계산한다.
5. 이동 lane은 좌표 predicate가 안전한 상태만 남긴다. Neutral은 거리·ID 순 최근접 active Player를 선택하고 공격 진입 뒤 target/facing을 고정한다.
6. 공격 선택은 `worldSeed + attempt + selectionSequence`의 결정적 난수이며 선택 패턴은 0.25, 나머지는 선택마다 0.25씩 1.0까지 회복한다.
7. `대시→충격봉`, `보안 빔→돌진`은 강제 pending 없이 다음 선택 한 번에만 후속 패턴 가중치를 2배로 한다.
8. 보스는 평상시 플레이어를 걷기·일반 점프·플랫폼 끝 낙하로 추적하고, 지상 돌진은 주 바닥 착지 뒤에만 시작해 몸체 폭으로 계산한 끝점에서 멈춘다.
9. 120×150 Warden Polygon 하나를 본체 물리·ImpactTarget·기본탄·Spell·멀티 client prediction이 공유하며 정면 Guard/Counter만 피해를 막는다.
10. Security Beam은 3초 active 시작 pulse와 이후 0.5초 간격을 합쳐 서버 공용 pulse 6개를 만들고 각 순간 겹친 Player에게 20 피해를 적용한다. 이탈 중인 pulse는 피해가 없고 재진입하면 현재 이후 pulse부터 다시 적용한다. 기존 220px Bridge·Boarding과 Boss snapshot v2를 유지하며 Warden의 직접 Player 처치는 최대 HP 이내로 100 회복한다.
