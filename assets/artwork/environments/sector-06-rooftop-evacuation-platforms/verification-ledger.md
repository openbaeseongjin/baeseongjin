# Sector 06 platform verification ledger

- 검증일: `2026-08-24` (Asia/Seoul)
- Base SHA: `9cf4b0189030921b212c512e686f1b85d499d106`
- Candidate fingerprint: `009a80bcad29f752f3c2aebea9113616f3a6f5983cfec61d101200c2115c9cbf`
- Fingerprint 범위: base SHA, tracked binary diff, 이 ledger를 제외한 정렬된 untracked path/blob hash
- 제작 도구·원본: OpenAI built-in ImageGen RGBA PNG `1536×1024`; Pillow 무디더 저색수·정수 픽셀 정규화
- 출처·라이선스: 외부 에셋 복사 없음. 프로젝트 전용 생성·정규화 자산.

## 산출물 무결성

| 파일 | SHA-256 |
| --- | --- |
| ImageGen 원본 | `98a57be0c3ca98c837150bd6b8b70c936f89c260af02e2ac6e644fd7c5cbbd6f` |
| 정규화 module sheet | `a16d039f98a77c5fe1393339330e2002ca37dd356aa76a8e32115bc65377ea66` |
| authoring/runtime `terrain-fill.png` | `91a93dd5e4c12cc5a3184aa90393e931deb6f902f86ee0a53afccbb0886f4028` |
| authoring/runtime `terrain-edge.png` | `b9e039b9e46a71d01b56676393ffac32882f1ef8e678ab5d59238ddef7566510` |

- Authoring export와 Runtime atlas의 fill·edge hash는 각각 동일하다.
- Runtime fill은 RGBA `32×32`, 5색, 완전 불투명이다.
- Runtime edge는 RGBA `32×8`, 7색, 완전 불투명이다.

## Runtime 계약·불변식

- 기존 package ID `environment-sector-06-rooftop-evacuation`, material ID `sector-06-rooftop`, Sector 06 area stable selection과 Block Pool 계약을 유지했다.
- 변경 범위는 Sector 06 terrain fill/edge PNG, 해당 manifest atlas·palette, package 문서뿐이다.
- collision surface polygon, one-way edge chain, surface kind, grappleable, Rope, Physics, Camera, Stage geometry, Map Editor, AREA-SPEC와 multiplayer/network state는 변경하지 않았다.
- PNG alpha나 외곽선으로 collision을 생성하지 않는다. 기존 renderer가 authored surface를 clip·tile하고 동일 edge chain을 stroke한다.

## 화면 검증

- 데스크톱 `1280×720`: Stage `1-1`, `2-1`, `3-1`, `4-1`, `5-4`, `6-8` 실제 게임 화면 비교 완료.
- 모바일 가로 `844×390`: 같은 6개 대표 Stage 실제 게임 화면 비교 완료.
- Sector 06 Stage `6-8`: pale aviation-metal walking cap과 deep-navy open service-gantry bay/diagonal brace가 읽히며 Player와 Cyan Rope·Anchor보다 먼저 튀지 않는다.
- Sector 01~06은 플랫폼만으로 산업 catwalk, 보수 주거 bridge, 환승 deck, 주거 amenity deck, 밀폐 control deck, 외부 aviation gantry의 실루엣이 구분된다.
- 디버그 진단에서 `ENV FALLBACK`과 `ATLAS ERROR` 표시는 0건이며 브라우저 warning·error 로그도 각각 0건이다.

## 명령 검증

최종 candidate 결과:

```text
PASS npm run validate:environment-assets -- assets/runtime/environments/sector-06-rooftop-evacuation
     Environment assets valid: environment-sector-06-rooftop-evacuation (6 atlases, 5 zones, 3 backdrop layers)
PASS npm run check
     Syntax 455 files; AREA-SPEC 48/48; generated 54; production map parity 48; direction 26/187; scenario integration 48 stages
PASS npm run format:check
     All matched files use Prettier code style
PASS git diff --check
```
