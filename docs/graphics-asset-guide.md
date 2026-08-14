# 그래픽 리소스 작업 가이드

플레이어, 몹, 배경, 지형, 장애물, 투사체, VFX, UI 등 모든 그래픽 작업은 `assets/artwork/` 한 곳에 둔다. `assets/runtime/`은 개발자가 검증된 결과를 게임에 연결하는 경로이므로 그래픽 담당자가 직접 작업하지 않는다. 픽셀 제작 캔버스, 타일 격자와 화면 위계는 [`pixel-graphics-design-guide.md`](./pixel-graphics-design-guide.md)를 현재 기준으로 사용한다.

## 작업 경로

```text
assets/artwork/<category>/<asset-id>/
├─ README.md               # 용도, 상태, 크기, 사용 도구와 출처
├─ source/                 # PSD, Aseprite, 생성 도구 원본 등
├─ export/                 # 투명 PNG, atlas 또는 PNG sequence
└─ preview/                # GIF, WebP, 정지 미리보기
```

category는 아래 이름을 사용한다.

| 종류 | category | 예시 |
| --- | --- | --- |
| 플레이어·몹·보스 | `characters` | `assets/artwork/characters/player-main/` |
| 배경·지형·환경 장식 | `environments` | `assets/artwork/environments/city-main/` |
| 장애물·상호작용 오브젝트 | `objects` | `assets/artwork/objects/security-laser/` |
| 투사체·VFX | `effects` | `assets/artwork/effects/enemy-projectile/` |
| HUD·아이콘·메뉴 | `ui` | `assets/artwork/ui/health-icon/` |

새 종류가 필요하면 별도 최상위 폴더를 만들지 말고 이 표와 `RuntimeAssetCatalog.js`의 `RUNTIME_ASSET_CATEGORIES`에 같은 category를 추가한다.

## 공통 표현 기준

- 실제 게임 크기와 모바일 화면에서 실루엣만으로 역할과 상태가 구분돼야 한다.
- 픽셀 자산의 종류별 제작 크기와 `32×32` 기본 격자는 [`pixel-graphics-design-guide.md`](./pixel-graphics-design-guide.md)를 따른다.
- 상태 차이를 색이나 작은 장식에만 의존하지 않는다. 자세, 외곽선, 무게중심과 움직임 방향을 먼저 다르게 만든다.
- 플레이어·몹·위험 장애물·투사체·상호작용 오브젝트·배경 장식의 시각적 중요도를 구분한다.
- 충돌하는 지형과 장애물은 경계가 분명해야 하고, 비충돌 장식은 발판이나 막힌 길로 오해되지 않게 한다.
- 현재 환경 방향은 폐쇄형 수직 기업도시다. 어두운 실루엣, 큰 여백, 제한된 인공 조명과 다층 시차를 기본으로 하되 구체 디자인은 작업 요청을 따른다.
- mock은 동작과 배치 확인용이다. mock의 색과 완성도를 그대로 따라 그릴 필요는 없다.

### mock도 공간 피드백을 전달한다

- mock은 정식 리소스가 아니어도 시나리오가 정한 공간 유형, 섹터별 색 위계와 오브젝트 역할을 보존해야 한다. 산업 Shaft를 암석 지형으로, 주거 수직도시를 산 실루엣으로 대체해 레벨 인상을 바꾸지 않는다.
- Anchor·Checkpoint·Terminal·Gate처럼 플레이어가 읽어야 하는 오브젝트는 원형 디버그 마커나 문자만 띄우지 않고, 정식 제작 전에라도 역할을 구분할 수 있는 기계 설비·비콘·패널·문 실루엣으로 표현한다.
- Recovery point, route point, activation band처럼 제작자가 확인하는 자료는 기본 플레이 화면에 노출하지 않는다. 필요하면 명시적인 진단 모드에서만 실제 게임 표현과 구분되는 방식으로 표시한다.
- 문서 레퍼런스 이미지는 구조·깊이·명도 위계를 비교하는 근거다. 출처·사용권과 runtime 제작 규격을 확인하기 전에는 이미지 파일을 그대로 게임 배경으로 복사하지 않는다.
- mock 화면 검증은 플레이어가 기획 문서를 읽지 않아도 현재 섹터와 주요 상호작용 오브젝트를 구분할 수 있는지를 데스크톱·모바일 실제 크기에서 확인한다.
- 절차 생성 초기 개발용 `default-mock` decoration sprite는 authored stage에 겹쳐 그리지 않는다. authored backdrop이 섹터별 비충돌 배경 장식과 설비 조명을 소유한다.
- authored 영역의 mock은 `area.bounds`를 따라 월드 좌표의 벽체·층간 벌크헤드·Gate 개구부를 보여준다. Gate와 Terminal을 빈 공간에 독립된 기호로 띄우지 않고 해당 방 구조에 결합하며, 하나의 연속 월드라는 이유로 영역 경계를 시각적으로 지우지 않는다.

## 종류별 확인 사항

### 캐릭터

- 플레이어 필수 상태는 `idle`, `run`, `jump`, `fall`, `rope`, `hit`, `respawn`이다.
- `jump`와 `fall`, `hit`과 `respawn`은 첫 프레임 자세만으로도 구분한다.
- 몹과 보스는 작업 요청에 적힌 이동·공격·피격·사망 상태만 제작한다. 플레이어 상태 목록을 그대로 적용하지 않는다.
- 기본 방향, 좌우 반전 여부, 원본 셀 크기와 게임 출력 크기를 `README.md`에 기록한다.
- 플레이어 atlas 배치는 [`player-production-template/frame-map.png`](../assets/runtime/characters/player-production-template/frame-map.png)를 참고한다. 현재 starter의 24×24 셀과 48×48 출력은 manifest 연결 예시이며 정식 디자인 크기가 아니다. 정식 player는 `32×32`~`48×48` 제작 셀을 사용하고 실제 PNG와 manifest의 `frameSize`를 함께 맞춘다.

### 배경과 지형

- 배경은 far·mid·near 깊이와 반복 경계를 구분한다.
- 지형 이미지는 기존 collision surface 위에 입히는 표면이다. PNG 모양으로 충돌 지형을 새로 결정하지 않는다.
- 환경 장식은 이동 경로 밖이나 배경에 두며 충돌을 추가하지 않는다.
- 현재 구역은 `waste`, `industrial-maintenance`, `residential-commercial`, `corporate-security`, `landing-pad` 다섯 가지다.
- 현재 pack 구성은 [`assets/runtime/environments/default-mock/`](../assets/runtime/environments/default-mock/)을 참고한다.

### 장애물과 오브젝트

- `충돌함`, `통과 가능`, `배경 장식`, `상호작용 가능` 중 역할을 `README.md`에 명시한다.
- 활성·비활성, 파괴 전·후, 공격 예고·발동처럼 플레이 중 구분해야 할 상태를 작업 요청에 맞춰 제작한다.
- collider, hitbox, 피해량과 물리 값은 그래픽 파일에 넣지 않는다.

### 투사체와 VFX

- 작은 크기에서도 플레이어·적 소유와 이동 방향이 구분돼야 한다.
- 발사체 본체, 예고, 비행과 충돌 효과를 구분해 납품한다.
- GIF와 WebP는 검토용으로만 사용하고 게임용 이미지는 투명 PNG로 export한다.

## 완료할 때 전달할 것

- 자산 종류와 ID, `assets/artwork/` 아래 결과 경로
- 제작 원본과 투명 PNG export
- 상태·프레임·atlas 배치를 확인할 수 있는 미리보기
- 실제 원본 크기와 게임에서 의도한 출력 크기
- 사용 도구와 버전, 외부 자료의 출처와 라이선스
- 아직 정해지지 않았거나 개발 연결이 필요한 항목

## 개발자 연결 경로

그래픽 납품 이후 담당 개발자가 `export/` 결과를 다음 runtime 계약으로 정규화한다.

| 자산 | runtime 경로 | 기준과 검증 |
| --- | --- | --- |
| 플레이어 | `assets/runtime/characters/player-main/` | [`sprite-asset-format.md`](./sprite-asset-format.md), `npm run validate:sprite-assets -- assets/runtime/characters/player-main` |
| 환경 | `assets/runtime/environments/<pack-id>/` | [`environment-asset-format.md`](./environment-asset-format.md), `npm run validate:environment-assets -- assets/runtime/environments/<pack-id>` |

몹, 장애물, 상호작용 오브젝트, 투사체와 VFX에는 아직 전용 runtime 계약이 없다. 담당 개발자가 자산 종류에 맞는 schema·loader·validator를 만든 뒤 연결한다. 그래픽 담당자는 runtime 연결, 충돌, 물리, 전투, 네트워크와 fallback을 수정하지 않는다.
