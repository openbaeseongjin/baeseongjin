# Boss06 V3 검증 현황

1. 기준 SHA `a8395580`; Map Editor Apply가 canonical Boss source와 generated module을 같은 transaction으로 갱신했다.
2. Boss validator·production map parity·scenario integration checkpoint는 PASS다.
3. Headless 120Hz에서 점프 표현은 `takeoff/jump/fall/landing`, 정점 spawn은 각도가 다른 정확히 5발이다.
4. Homing은 초기 velocity에서 Player 방향으로 tick당 `turnRate × dt` 이하만 회전하며 server/client 공용 motion을 사용한다.
5. 소환 진단은 wave당 2마리, 1→2 wave 간격 17.37초, live 6 입력에서 추가 wave 0회, defeat 뒤 잔존 0개이며 server/client Enemy ID·type이 일치했다.
6. 100초 `GameSimulation`에서 Boss 소환몹은 42.35초에 6개가 됐고 이후 최대·최종 모두 6개였다.
7. 최신 base/candidate fixed-step p95는 `1.187ms → 1.642ms`로 8.33ms 예산 안이며 양쪽 일회성 max spike는 별도 기록했다.
8. Desktop Gameplay View에서 승인 pixel Warden의 점프 pose, 5발 곡선 미사일, 소환 공격 Enemy, 새 Main/Ledge/Anchor와 승리 Bridge를 확인했고 clean tab console은 비어 있었다.
9. Map Editor는 Boss surface 7·anchor 12·route 9, bounds width/height, fan 각도 5개와 소환 좌표·수치를 편집한다.
10. 실제 모바일 viewport·1~4인 장시간 full combat·boarding은 아직 `PLAYTEST VERIFIED`가 아니다.
