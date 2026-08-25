# Runtime effect assets

투사체와 VFX의 검증된 standalone runtime package를 `<effect-id>/`에 둔다. 아직 공개 manifest·loader·validator 계약은 없으며, 계약이 생기기 전에는 [`assets/artwork/effects/`](../../artwork/README.md)에 납품한다. 특정 Boss sprite definition과 같은 수명주기로만 쓰는 부착 파츠는 Boss character local Runtime package에 정규화할 수 있으며 standalone effect 계약으로 간주하지 않는다.

효과의 판정과 수명주기는 gameplay가 소유하며 그래픽 package는 표현 자료만 가진다.
