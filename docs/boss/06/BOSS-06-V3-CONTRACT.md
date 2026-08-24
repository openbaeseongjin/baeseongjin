# Boss06 V3 전투·Arena 계약

1. AS IS: Warden이 평지 보행과 선형 대시만 반복한다. → TO BE: 지상·3개 Raised Ledge를 점프로 오가는 수직 AI를 사용한다.
2. AS IS: Boss와 미사일 이동이 별도 공식에 묶일 수 있다. → TO BE: 점프는 공용 acceleration 적분, 유도탄은 공용 projectile motion capability가 소유한다.
3. 유도미사일은 지상에서 발사하지 않고 점프 정점에서 정확히 5발을 `-50°/-25°/0°/25°/50°` 부채꼴로 동시에 발사한다.
4. 각 미사일은 초기 각도를 보존한 채 `1.75rad/s` 이하로 현재 Player 방향에 휘며, 서버가 생성·진행하고 spawn/resolve 사건으로 클라이언트가 재생한다.
5. 소환 패턴은 이동형 공격 Enemy pool에서 2마리를 생성하고 15초 미만에는 재사용하지 않으며, 살아 있는 Boss 소환몹이 6마리 이상이면 선택하지 않는다.
6. Warden 표현은 gameplay state와 분리된 `takeoff → jump → fall → landing` locomotion 상태와 소환 위치 2곳의 예고를 보여준다.
7. Arena는 3920px Main Runway, 좌·중·우 Ledge, U1~U10 상부 경로, 좌·우 Recovery와 승리 후 220px Bridge로 교체한다.
8. 모든 solid surface는 일반 Rope 부착 가능하며 U1~U10·RR-left/right만 `swing-attack` 역할을 추가로 가진다.
9. 맵 좌표의 단일 원본은 canonical `boss-06.json`이며 Runtime은 착지·복구·소환·Emitter·Gate·Bridge·Boarding을 이 definition에서 읽는다.
10. 완료 기준은 validator·parity·scenario checkpoint와 Gameplay View의 5발 곡선·점프 4상태·2마리 소환·6마리 skip·승리 동선 확인이다.
