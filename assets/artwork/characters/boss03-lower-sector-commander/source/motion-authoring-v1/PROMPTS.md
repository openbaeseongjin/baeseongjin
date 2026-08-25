# Boss03 motion authoring v1 prompt set

## 공통 입력과 제약

- 도구: Codex 내장 ImageGen.
- 외형 기준: `../boss03-idle-player-style-selected-v1.png`.
- 도트 밀도 기준: `assets/artwork/characters/player-main/source/pixellab-ready-character.png`.
- 공통 요청: 우향, 동일 Boss 비율·장비·두 센서, frame별 동일 scale·발 기준선·foot-center anchor, Player와 같은 굵은 외곽선·큰 평면 색 덩어리·희소한 highlight.
- 공통 금지: 추가 캐릭터·텍스트·UI·환경·바닥 그림자·VFX·그라데이션·안티앨리어싱·3D 질감·미세 기계 노이즈.
- 출력 의도: `128×192px` 논리 frame의 nearest-neighbor authoring board와 투명 배경. 실제 생성 출력은 정규화 전 source로만 사용한다.

## 클립별 최종 prompt delta

| 클립 | 레이아웃 | 동작 요청 |
| --- | --- | --- |
| `idle` | 4×1 | 중립 → 몸통·어깨 1px 상승 → 중립 → 1px 하강. 발·해머·훅 접지 고정. |
| `walk` | 4×2 | 좌 접지·하강·통과·상승 → 우 접지·하강·통과·상승. 짧은 보폭과 장비 지연. |
| `grab-lock` | 4×1 | 중립 → 체중 후방 이동 → 훅 팔 조준 → 1.5초 고정 자세. 긴 사슬은 제외. |
| `grab-pull` | 3×2 | 고정 자세 → 발사 반동 → 팔 전개 → 강한 당김 → 구속 → 해머 마무리 전환. Player·긴 사슬 제외. |
| `hammer-slam` | 4×2 | 중립 → 들기 → 상승 → 정점 예고 → 하강 → 충돌 자세 → 반동 → 회복. 충격 VFX 제외. |
| `body-charge` | 3×2 | 중립 → 압축 시작 → 0.8초 저자세 예고 → 발진 → 진행 유지 → 제동·회복. 먼지·잔상 제외. |
| `hit` | 3×1 | 중립 → 가장 큰 후방 상체 반동 → 낮은 복귀. 공격자·스파크 제외. |
| `defeated` | 4×2 | 감광 → 무릎 붕괴 → 해머 이탈 → 한쪽 무릎 → 전도 → 바닥 충돌 → 정착 → 센서 소등. 폭발·분해 제외. |

각 prompt는 본체와 수명이 다른 사출 훅·사슬·조준선·경고 원·충돌 효과를 포함하지 않도록 반복해서 제한했다.
