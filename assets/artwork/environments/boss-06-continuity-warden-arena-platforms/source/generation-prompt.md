# Boss 06 arena platform generation prompt

## 제작 입력

- 도구: OpenAI built-in ImageGen
- 생성일: 2026-08-25
- Use case: `stylized-concept` → `precise-object-edit` → `background-extraction`
- Image 1: 기존 Sector 06 플랫폼의 스타일·차별화 reference
- Image 2: Sector 06의 팔레트·개방 하늘·외부 옥상 분위기 reference
- Image 3: 승인된 Continuity Warden의 픽셀 밀도·장갑 재질·Cyan 위계 reference

## 최종 제작 의도

```text
Boss06 V4의 3200px Main Runway, one-way Ledge 3개와 Departure Deck에 사용할 모듈 제작 시트다.
일반 Sector 06의 가벼운 service-gantry 대신 두꺼운 봉쇄 장갑, 대칭 보안 리브, 하향 버팀대와 매입 command channel로 최종 보스 전용 공간을 표현한다.
논리 32×32 tile과 32×8 one-way blade를 전제로 큰 사각 픽셀 덩어리, 최대 8색, 1~2px outline을 사용한다.
deep navy, graphite, cool blue-gray, pale steel을 기본으로 하고 Cyan은 작은 휴면 conduit, muted amber는 Departure Deck에만 제한한다.
보행면은 평평하고 연속적이어야 하며 난간, 안테나, hook, socket, sign, character, Rope, Anchor, Telegraph와 가짜 collision ledge를 금지한다.
배경은 genuine transparent alpha이며 checkerboard, text, label, grid, UI와 watermark를 넣지 않는다.
```

## 수정 기록

1. 최초 생성에서 재질 미세 묘사와 Departure Deck 난간이 과해졌다.
2. 두 번째 편집에서 난간·돌출물을 제거하고 팔레트와 픽셀 덩어리를 단순화했다.
3. 마지막 `background-extraction` 편집은 플랫폼 형태를 고정하고 불투명 흰 배경만 genuine transparent alpha로 교체했다.

## 금지 범위

- 런타임 atlas나 manifest로 직접 사용하지 않는다.
- PNG 외곽으로 collision을 만들지 않는다.
- Boss06의 authored surface 위치·폭·높이·one-way·grappleable 계약을 변경하지 않는다.
