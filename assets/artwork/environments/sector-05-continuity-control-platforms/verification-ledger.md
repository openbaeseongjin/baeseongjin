# Sector 05 Continuity Control platform verification ledger

- 검증일: 2026-08-24 (Asia/Seoul)
- 기준 Git SHA: `2d6c062fbda83674a28d67f204aaafb71d0c18c9`
- candidate fingerprint: `a5f6ed1095e5006000832f25edefd8d76eea8aed5a8f8dcad36230cdb79f8900`
- fingerprint 범위: 이 원장을 제외한 변경 파일 12개의 정렬된 Git blob hash와 기준 SHA를 SHA-256으로 계산했다.

## 제작과 라이선스

- 생성 도구: OpenAI ImageGen. 게임 내 Continuity Control 배경을 재사용하거나 복제하지 않고 소재·명도·정비 상태의 참고 기준으로만 사용했다.
- 원본 형식: ImageGen PNG, RGB, 1536×1024.
- 정규화 도구: `source/build_platform_atlas.py`와 Pillow. 배경 제거, 24색 무디더 양자화, 32×32 solid 및 32×8 one-way Runtime atlas 생성을 결정적으로 수행한다.
- 인계 형식: 생성 원본 PNG, 생성 프롬프트 Markdown, 정규화 Python 원본, 투명 module sheet PNG, Runtime용 투명 PNG, review PNG.
- 라이선스: 이 저장소용으로 생성한 프로젝트 소유 제작물이며 외부 제3자 이미지·텍스처·폰트는 포함하지 않았다.

## 파일 해시

- ImageGen 원본: `C17690B1F0FED3629DAB9580CD48989FC661357BC0128F629B6A90CC34A57900`
- 투명 module sheet: `F974AF52232619E8DEBA2F65C6D11DF8D19476ECA48E695802F648E0C9852FAD`
- authoring/runtime `terrain-fill.png`: `15090A0A11C76D94F8754A35C95E2C6BA20FDCF7D66D0FE156943D979A19E359`
- authoring/runtime `terrain-edge.png`: `DD9E0F3573D1B0B22B6D6CD3BD545C036B666F58CC5DD06164B61B2ECEC842C6`
- authoring export와 Runtime PNG는 각각 동일한 SHA-256을 갖는다.

## Runtime 계약과 불변식

- 변경 package: `environment-sector-05-continuity-control` 하나뿐이다.
- stable package ID, Sector 05 area catalog, Block Pool material key `sector-05-corporate`, renderer 계약은 유지했다.
- `terrain-fill`은 32×32, `terrain-edge`는 32×8이며 보행면 기준점은 기존 top-center 계약을 따른다.
- collision surface polygon, one-way edge chain, grappleable hardpoint, Rope, 물리, 카메라, 맵 동선, 멀티플레이 상태 파일은 변경하지 않았다.
- Pale metal·밀폐 composite의 두꺼운 solid body와 얇은 one-way blade를 색뿐 아니라 두께·하부 실루엣으로 구분했다. terrain에는 hardpoint처럼 보이는 돌출부를 추가하지 않았다.

## 자동 검증

- `npm run validate:environment-assets -- assets/runtime/environments/sector-05-continuity-control`: PASS — `Environment assets valid: environment-sector-05-continuity-control (6 atlases, 5 zones, 3 backdrop layers)`
- `npm run check`: PASS — syntax 464 files, AREA-SPEC 48/48, generated outputs 54 files, production map parity 48 stages, direction specs, scenario integration checkpoint 통과.
- `npm run format:check`: PASS — `All matched files use Prettier code style!`
- 자동 테스트 suite는 사용자가 요청하지 않아 실행하거나 추가하지 않았다.

## 실제 화면 검증

- 데스크톱: 실제 게임 Stage 5-4, CSS 1280×720. 밝은 control-deck 보행선이 배경보다 먼저 읽혔고 solid/one-way 두께가 구분됐으며 Player와 cyan H01 grapple hardpoint가 terrain에서 분리되어 보였다.
- 모바일 landscape: 실제 게임 Stage 5-4, CSS 844×390. 작은 화면에서도 보행선, solid body, one-way blade, Player 판독성이 유지됐다.
- 설정 버튼 1초 길게 누르기로 디버그 수치 표시를 열어 두 viewport를 확인했다. 두 화면 모두 `ENV FALLBACK` 진단이 없었다.
- 브라우저 console warning/error: 0건. atlas 누락이나 fallback 표시는 관찰되지 않았다.

## 범위 판정

- Sector 05는 기존 공용 mock, Sector 03의 graphite·muted-gold service frame, Sector 04의 warm stone·sage residential deck와 다른 pale sealed precision silhouette를 갖는다.
- 현재 기준 브랜치에서 Sector 01과 Sector 06 terrain PNG는 아직 서로 동일한 mock hash다. 따라서 저장소 전체의 6개 Sector 실루엣 완전 분리는 두 Sector의 별도 terrain 작업이 끝나야 충족된다. 이번 변경은 요청 범위대로 Sector 05에만 적용했다.
