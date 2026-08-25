# 증강 아이콘 그래픽 인계

- 각 증강과 시작 Spell을 Stable ID 파일명 그대로 `export/<stable-id>.png`에 납품한다.
- 모든 파일은 투명 배경 `32×32` 또는 `48×48` 정사각 PNG 한 장이며 애니메이션과 atlas를 사용하지 않는다. 한 package 안에서 증강별 원본 크기가 달라도 된다.
- 실제 HUD는 원본 크기와 분리해 선택 카드와 Spell 슬롯에서 `32×32`, Rope·Passive 상태 줄에서 `16×16`으로 nearest-neighbor 표시한다.
- 증강 선택 카드는 같은 Stable ID의 아이콘을 이름·family·tagline·설명과 함께 표시한다. 장착 뒤 슬롯이나 상태 줄에서 다른 그림으로 바꾸지 않는다.
- 아이콘은 색만이 아니라 중심 실루엣으로 서로 구분하고, 작은 상태 줄에서도 Rope·공격·유틸·이동 역할이 읽혀야 한다.
- 파일 목록은 코드 catalog가 소유한다. `npm run validate:augment-icons -- assets/artwork/ui/augment-icons/export`로 누락·추가 ID와 PNG 크기를 확인한다.
- 제작 원본은 `source/`, 게임 크기 검토 이미지는 `preview/`에 두고 사용 도구·버전·출처·라이선스를 이 README에 추가한다.
- 검증된 export는 개발 담당자가 같은 파일명으로 `assets/runtime/ui/augment-icons/`에 복사한다. manifest나 JavaScript 수정은 필요 없다.

현재 상태: **그래픽 납품 대기 / Canvas fallback 연결 완료**
