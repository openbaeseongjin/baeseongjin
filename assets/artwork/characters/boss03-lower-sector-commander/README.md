# Boss03 Lower Sector Commander 그래픽 원본

> 상태: **REFERENCE-ONLY / 본체 기본 스프라이트 시각 승인**

사용자가 선택한 Boss03 본체 기본 스프라이트와 검토용 투명 export를 보존한다. 둥근 중량형 2족 본체, 사슬 훅, 손에 든 대형 사각 해머의 외형 기준만 소유하며 Boss03 제품 활성화, Runtime 연결, 충돌, 피해, 물리와 네트워크 권위를 만들지 않는다.

## 파일

| 역할 | 파일 | 규격·상태 |
| --- | --- | --- |
| 승인 원본 | [`source/commander-base-sprite-approved-source.png`](./source/commander-base-sprite-approved-source.png) | `1024×1536px` RGB · 체크무늬가 실제 배경에 포함된 사용자 선택 원본 · SHA-256 `B452FE68B659F29726ADAB6D768F61DC65E3D0DC1485D71CBF81EEC0AAD91F93` |
| 검토 export | [`export/commander-base-sprite-approved-128x192.png`](./export/commander-base-sprite-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 우향 · 발 중앙 anchor `(64, 152)` · SHA-256 `2528D781466B3B5960E38E8D432876CA33930807D959E09967A99313AEA78110` |

## 승인 외형

- 먹색·녹슨 철색의 둥근 장갑 본체, 낮은 센서 헤드, 넓은 어깨, 짧고 굵은 두 다리와 넓은 발을 유지한다.
- 검은 원형 전면 판과 두 적·주황 센서등을 유지한다.
- 한쪽 팔의 굵은 사슬과 곡선형 산업 훅은 중립 위치에 두고, 반대 손은 별도 손잡이 하단을 쥔 대형 사각 산업 해머를 든다.
- 손, 손잡이와 해머 머리는 분리된 실루엣으로 보이며 팔 융합형 해머나 손 변형으로 바꾸지 않는다.

## 제작·출처

- 도구: Codex 내장 이미지 생성과 결정적 픽셀 export 정규화.
- 원본 형식: 사용자 제공·선택 PNG. 외부 웹 이미지나 제3자 그래픽 파일은 합성하지 않았다.
- 검토 export는 승인 원본의 8배 픽셀 블록을 `128×192` 정수 격자로 옮기고 밝은 중성 체크무늬만 투명 처리했다. 새 형태나 장비를 다시 그리지 않았다.
- 검토 export의 불투명 영역은 `(2, 28)~(125, 152)`이며 두 발이 닿는 바닥선 중앙 `(64, 152)`을 anchor 검토 기준으로 사용한다.

## 사용 경계

- 검토 export는 한 장의 중립 자세만 포함하므로 animation atlas나 Runtime-ready package가 아니다.
- Boss 전용 공개 manifest·validator와 나머지 표현 상태가 없으므로 `assets/runtime/`으로 복사하거나 renderer에 직접 연결하지 않는다.
- 다음 승인 단위는 이 외형을 유지한 **사슬 훅 분리 파츠**다.
