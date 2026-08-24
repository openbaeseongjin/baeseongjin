# Sector 05 Continuity Control platform V2 verification ledger

- 검증일: 2026-08-24 (Asia/Seoul)
- 기준 Git SHA: `91ee9d9c332dfc31d69176c189c4f1570c458bb4`
- tracked binary diff hash: `bfe7a24bf66e0716c1a34cd26ed85982bcb5128a`
- candidate fingerprint: `0987ce3c7d7ea9f78fcf89b809fe1ce2bcc17843383761be914ddd444d85e1d2`
- fingerprint 범위: 기준 SHA, `git diff --binary HEAD` hash, 이 V2 원장을 제외한 정렬된 untracked path·Git blob hash를 SHA-256으로 계산했다.

## 제작 기준과 결과

- Asset ID: `sector-05-continuity-control-platforms`
- 생성 도구: OpenAI built-in ImageGen. Sector 05 배경은 팔레트·재질 마감·명도 위계·정비 상태 reference로만 사용했으며 발판 위치·건축 geometry·source pixel을 복제하지 않았다.
- V2 생성 입력: logical `32×32` solid와 `32×8` one-way, 최대 8색, 1~2 logical-pixel outline, 2px 미만 detail 금지, top-center 보행면, 색이 아닌 두께·하부 실루엣 구분을 프롬프트에 명시했다.
- ImageGen 원본: RGB PNG `1536×1024`. 투명 요청에도 baked neutral checker가 포함되어 Runtime에 직접 사용하지 않았다.
- 정규화: `source/build_platform_atlas.py`와 Pillow가 외곽 연결 checker만 제거하고 무디더 24색 RGBA module sheet를 만든 뒤 8색 `32×32` fill과 7색 `32×8` edge를 결정적으로 생성한다.
- 라이선스: 이 프로젝트를 위해 생성한 제작물이다. 외부 제3자 이미지·텍스처·폰트는 포함하지 않았다.

## V2 파일 해시

- ImageGen V2 source: `4B8572C0C43CD011C895AA8C0B047C5BA5885B7A1D7A29481DA2C273DDA80195`
- normalized RGBA module sheet V2: `6C85B8D34998615F1C0FEFD6F465CB75C3299040D455C64DA232FDB72E71DBA7`
- authoring/runtime `terrain-fill.png`: `D9273EC2E3F012841AEE019F7166C704645027AC00AF01F45DBC24627A5A27F0`
- authoring/runtime `terrain-edge.png`: `C43F92BDA1CEEA57228B5F5D8556B9B1994313749CAAEE93C0D8FBF5148795B0`
- authoring export와 Runtime PNG는 각각 동일한 SHA-256을 가진다.

## Runtime 계약과 불변식

- 변경 package는 `environment-sector-05-continuity-control` 하나다.
- atlas는 RGBA fill `32×32`, RGBA edge `32×8`이며 nearest sampling과 기존 top-center 보행면 계약을 따른다.
- stable package ID, Area catalog, material key `sector-05-corporate`, Block Pool role mapping과 renderer 구조는 유지했다.
- collision surface polygon, one-way edge chain, surface kind, grappleable hardpoint, Rope, Physics, Camera, Stage geometry, Map Editor, AREA-SPEC와 Network authority를 변경하지 않았다.
- terrain에는 socket·hook·jaw·clamp·post·rail 같은 돌출물을 넣지 않아 기존 cyan hardpoint만 돌출된 기계 실루엣으로 남는다.

## 자동 검증

- `npm run validate:environment-assets -- assets/runtime/environments/sector-05-continuity-control`: PASS — `Environment assets valid: environment-sector-05-continuity-control (6 atlases, 5 zones, 3 backdrop layers)`
- `npm run check`: PASS — syntax 455 files, AREA-SPEC 48/48, generated outputs 54 files, production map parity 48 stages, direction specs와 scenario integration checkpoint 통과.
- `npm run format:check`: PASS — `All matched files use Prettier code style!`
- 자동 테스트 suite는 사용자가 요청하지 않아 실행하거나 추가하지 않았다.

## 실제 게임 화면 검증

- 데스크톱: 실제 Stage 5-4, CSS `1280×720`. pale-titanium 보행선이 상세 배경보다 먼저 읽히고 두꺼운 sealed solid body, Player, cyan H01 hardpoint가 분리됐다.
- 모바일 landscape: 실제 Stage 5-4, CSS `844×390`. 1x에 가까운 축소 화면에서도 보행선·solid body·얇은 one-way chain과 Player 판독성이 유지됐다.
- 설정 버튼 1초 길게 누르기로 디버그 수치 표시를 열어 두 viewport를 확인했다. 두 화면에 `ENV FALLBACK` 진단이 없었다.
- 브라우저 warning/error: 데스크톱 0건, 모바일 0건. atlas 누락과 첫-frame polygon fallback을 관찰하지 않았다.

## 판정

- V2는 콘셉트 시트의 미세 묘사보다 실제 게임 logical grid와 1x 판독성을 먼저 적용해 Sector 05 Runtime terrain으로 사용할 수 있다.
- Sector 05는 pale sealed precision deck로 Sector 03의 graphite·muted-gold service frame 및 Sector 04의 warm stone·sage residential deck와 구분된다.
- 현재 기준 브랜치의 Sector 01과 Sector 06은 서로 같은 mock terrain을 공유하므로 저장소 전체 6개 Sector의 완전한 실루엣 분리는 두 Sector의 별도 작업이 필요하다. 이번 V2 변경은 Sector 05만 소유한다.
