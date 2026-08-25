# Boss 06 Continuity Warden arena platforms

## 목적과 상태

- Asset ID: `boss-06-continuity-warden-arena-platforms`
- Category: `environments`
- 역할: Boss06 V4의 기존 collision surface에 입힐 최종 봉쇄 보안 활주로·단방향 Ledge·출발 데크 제작 시트
- 상태: **RUNTIME INTEGRATED**
- 기준 geometry: `3200px` Main Runway, one-way Ledge 3개, 별도 Departure Deck
- 기준점: 보행면 중앙 `top-center`

## 시각 방향

- 일반 Sector 06 플랫폼의 가벼운 외부 service-gantry와 달리, Boss Stage는 두꺼운 봉쇄 장갑·대칭 보안 리브·하향 버팀대·매입 command channel로 구분한다.
- Main Runway는 가장 두껍고 무거운 실루엣, one-way Ledge는 얇은 blade 실루엣, Departure Deck는 동일 재질 안의 muted amber 매입선으로 구분한다.
- 상단 보행선은 평평하고 연속적으로 유지하며 난간·안테나·돌출 hook·가짜 발판을 두지 않는다.
- deep navy·graphite·cool blue-gray·pale steel을 사용한다. Cyan은 매입된 휴면 conduit에만 작게 제한하고 공격 Telegraph의 red/orange·magenta는 사용하지 않는다.

## 파일

| 경로                                                                   | 형식·크기           | 역할                                     |
| ---------------------------------------------------------------------- | ------------------- | ---------------------------------------- |
| `source/boss-06-continuity-warden-arena-platforms-imagegen-v1.png`     | RGBA PNG `1619×971` | built-in ImageGen 최종 투명 원본         |
| `source/generation-prompt.md`                                          | Markdown            | 생성·수정 프롬프트와 입력 reference 역할 |
| `export/boss-06-continuity-warden-arena-platforms-module-sheet-v1.png` | RGBA PNG `1619×971` | 검토용 투명 제작 시트                    |
| `preview/boss-06-continuity-warden-arena-platforms-review-v1.png`      | RGBA PNG `1619×971` | 투명 배경 검토본                         |

## 제작·출처·라이선스

- 도구: OpenAI built-in ImageGen, 2026-08-25
- 입력 reference: 기존 Sector 06 플랫폼 review, Sector 06 Runtime 배경 composite, 승인된 Continuity Warden motion review
- reference 역할: 팔레트·픽셀 밀도·세계관 연속성 비교만 사용했고 source pixel이나 Stage geometry를 복제하지 않았다.
- 외부 에셋 복사: 없음
- 라이선스: 이 프로젝트용 생성 자산

## Runtime 연결

- Runtime package: `assets/runtime/environments/boss-06-continuity-warden-arena/`
- 원본 PNG를 변형 없이 runtime atlas로 복사하고 rectangle frame으로 `900×120` 장갑 panel과 `900×8` 상단 cap을 선택한다.
- `bossStageId: boss-06` 표면만 전용 terrain definition을 선택하며 일반 Sector 06 package는 유지한다.
- Collision polygon, one-way edge chain, surface kind, grappleable, Rope, Physics, Camera, Boss FSM, Map Editor geometry와 Network authority는 변경하지 않는다.
- 일반 `sector-06-rooftop-evacuation` package를 교체하지 않는다.

## 검수 결과와 열린 항목

- PNG는 `Format32bppArgb`; 캔버스 모서리 alpha `0`을 확인했다.
- 상단 보행선, solid/one-way 두께 차이, Boss Stage의 강화된 실루엣을 제작 시트에서 확인했다.
- ImageGen 원본의 승인 픽셀을 런타임에서 직접 crop하므로 별도 고화질 생성물이나 보간 PNG가 없다.
- Runtime validator와 실제 게임 화면 검증 결과는 runtime package README와 작업 인계에 기록한다.
