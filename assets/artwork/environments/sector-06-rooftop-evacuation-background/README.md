# Sector 06 Rooftop / Evacuation Background

## 용도와 상태

- Asset ID: `sector-06-rooftop-evacuation-background`
- 상태: `RUNTIME NORMALIZED / BROWSER REVIEW REQUIRED`
- 출력: `1024×1536` opaque master·fixed PNG, 8-bit grayscale depth map, 좌·우 RGBA parallax island
- 적용 범위: Sector 06 배경 분위기, 건물 밀도, 하늘 노출 리듬, offline depth-island 분리
- 비범위: Collision, Terrain geometry, Camera, gameplay route, Rope Anchor, Enemy, Network authority

## 시각 계약

- 6-1~6-6에 대응하는 하단·중단은 건물과 rooftop 설비가 화면을 채운다.
- 6-7부터 하늘이 좁게 열리고 6-8 Pad 03 접근에서만 노출이 커진다.
- Sector 05의 graphite-gray·lavender 성분은 master 하단 15% 안에서 deep navy·charcoal Sector 06 건축으로 흡수되며 hard seam을 만들지 않는다.
- 건물·gantry·mast·cable은 비충돌 배경으로 읽혀야 하며 가짜 발판·Rope Anchor·상호작용 대상을 만들지 않는다.

## 생성·정규화 기록

- Tool: OpenAI built-in ImageGen + offline Python normalization
- Reference: 사용자 제공 Sector 05·06 PNG, 화풍·팔레트·도시 스케일 참고용
- Reference license: 사용자 제공 자료이며 별도 외부 출처·사용권 증빙은 확인되지 않음
- Offline threshold: `224`, minimum component `500px`, 8-connectivity
- 결과: 좌측 `437,056px`, 우측 `381,101px`, 정확히 두 island
- 중립 합성: master 대비 최대 channel difference `0`
- 이동 미리보기: 좌 `+8px`, 우 `-8px`; 검은 구멍·투명 공백·복제 seam 없음

Discord `코딩` 채널의 배경 렌더링 변경안은 제안 근거로만 사용했고, 저장소의 그래픽·픽셀·환경 계약과 일치하는 offline master/depth/inpaint/2-island 항목만 반영했다. Runtime은 depth map을 읽지 않는다.

## 핵심 파일

- `source/sector-05-continuity-user-reference-v1.png`, `source/sector-06-rooftop-evacuation-user-reference-v1.png`: 사용자 제공 전환·스타일 참고
- `source/generation-prompt-v2-sector05-transition.txt`: 하단 15% 전환 생성 프롬프트
- `source/depth-islands-v4-contract/`: master, ImageGen depth/inpaint, 프롬프트, 재현 스크립트
- `export/depth-islands-v4-contract/`: 정규화된 master, depth, fixed, 좌·우 island
- `preview/sector-05-to-06-continuity-review-v1.png`: Sector 05 아래·Sector 06 위 연결 검토본
- `preview/depth-islands-v4-contract/`: 중립 합성과 작은 offset 검토본
