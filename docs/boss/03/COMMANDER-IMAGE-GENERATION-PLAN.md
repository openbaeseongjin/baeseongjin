# BOSS03 LOWER SECTOR COMMANDER 이미지 생성 기획

> 상태: **REFERENCE-ONLY / 생성 전 기획 확정 대기**
>
> 범위: 본체 기본 스프라이트 1종과 양팔 장비 참고 이미지 2종의 외형 기준만 정한다. 이 문서는 Boss03을 제품에 재도입하거나, Runtime 자산·충돌·공격 판정·물리·네트워크 규칙을 만드는 근거가 아니다.

## 1. 제품 경계

- 현재 제품 Boss는 Boss06 하나이며, Sector 03의 `3-8 → 4-1` direct Gate는 변하지 않는다.
- 결과물은 Boss03의 **REFERENCE-ONLY** 시각 기준이다. 생성한 PNG는 Runtime 배경, 지형, Collision 또는 플레이 가능한 보스 자산으로 사용하지 않는다.
- 전투의 그랩·해머 규칙은 [Commander 참고 계약](./LOWER-SECTOR-COMMANDER-REFERENCE-CONTRACT.md)이 소유한다. 본 문서는 그 규칙을 바꾸거나 수치·범위를 추가하지 않는다.

## 2. 이번 생성물

모든 결과물은 하나의 참고용 자산 패키지 `lower-sector-commander`에 속한다. 이 패키지는 Runtime package가 아니며, 세 이미지는 아래 파일명으로만 구분한다.

| export 파일 | 파일 역할 | 캔버스·기준점 | 포함 범위 |
| --- | --- | --- | --- |
| `commander-body-base.png` | 본체 기본 스프라이트이자 전체 외형 기준 | `128×192px`, 우향, `bottom-center (0.5, 1.0)`, 투명 RGBA PNG | 중량형 2족 본체와 중립 자세의 양팔 장비를 모두 보이는 단일 실루엣 |
| `commander-gripper-arm.png` | 앞쪽 팔 장비의 분리 참고 이미지 | `64×96px`, 우향, `shoulder-coupling (0.0, 0.5)`, 투명 RGBA PNG | 유압 팔부터 대칭 2지 병렬 그리퍼까지. 몸통·다리는 포함하지 않음 |
| `commander-hammer-arm.png` | 뒤쪽 팔 장비의 분리 참고 이미지 | `64×96px`, 우향, `shoulder-coupling (0.0, 0.5)`, 투명 RGBA PNG | 유압 팔부터 짧고 두꺼운 사각 파일드라이버형 해머까지. 몸통·다리는 포함하지 않음 |

- `commander-body-base`는 완성된 한 장의 전체 외형 시안이다. 분리 팔 이미지는 이 본체를 잘라 낸 Runtime 파츠가 아니라, 장비의 형태와 결합 위치를 확인하는 별도 참고물이다.
- `shoulder-coupling`은 각 팔 이미지의 왼쪽 중앙에 놓인 로컬 기준점이다. 본체의 어깨 좌표 또는 Runtime 합성 오프셋은 Boss Runtime 계약이 승인되기 전까지 정하지 않는다.
- 세 캔버스 크기는 고정이다. 장비 끝이 잘리거나 팔의 중립 자세가 흐려진 생성물은 크기를 바꾸지 않고 반려·재생성한다.
- 이번 범위에는 행동 포즈, 스프라이트 시트, 애니메이션, 조준선·경고 원, 끌어오기·해머 VFX, UI, 배경이 없다.

## 3. 외형 정체성

### 본체

- 인간형 로봇이나 외골격 슈트가 아닌, **완전 기계형 지휘 유닛**이다.
- 자세는 그랩과 해머 내려찍기의 준비 방향을 한눈에 읽을 수 있는 **중량형 2족 보행기**다.
- 낮고 넓은 센서 헤드 중앙에 가로형 황색 단일 시야를 둔다. 눈·얼굴·입·인간 조종석처럼 읽히는 요소는 넣지 않는다.
- 넓고 무거운 하체, 짧고 견고한 관절, 큰 장비 질량으로 일반 Player보다 최소 네 배 큰 보스 실루엣으로 읽혀야 한다.

### 양팔

- 우향 기준 카메라에 가까운 앞쪽 팔은 **대형 유압 집게손**이다. 대칭 2지 병렬 그리퍼가 평행하게 벌어지고 닫히는 구조로, 대상을 잡아 끌 수 있어야 한다.
- 우향 기준 먼 뒤쪽 팔은 **사각 파일드라이버형 산업 해머**다. 길고 날카로운 무기나 도끼가 아니라, 짧고 두꺼운 사각 타격부와 수직 압착 질량이 읽혀야 한다.
- 기본 스프라이트에서는 두 장비가 모두 중립 자세로 장착돼야 한다. 그리퍼가 앞쪽이라는 관계와 해머가 뒤쪽이라는 관계가 겹침 때문에 뒤바뀌면 안 된다.

### 재질·색

- 주색은 먹색 강철과 녹슨 철색이다. 표면에는 기름때, 긁힘, 덧댄 수리 패치가 보이는 중고 산업 장비의 사용감을 둔다.
- 황색은 센서 시야와 소수의 경고등에만 제한적으로 쓴다. 갑주 전체를 밝게 칠하거나 황색만으로 상태를 구분하지 않는다.
- 광택이 강한 신품 메카, 네온 사이버펑크, 청록색 주조명, 유기 조직, 마법·판타지 장식은 사용하지 않는다.

## 4. 픽셀 그래픽 규칙

- 실제 픽셀 단위로 그린 선명한 2D 픽셀 아트여야 한다. 안티앨리어싱, 흐림, 반투명 가장자리, 서브픽셀 선, 페인팅 질감은 허용하지 않는다.
- 본체 캔버스는 `32px × 32px` 모듈의 `4 × 6` 구성으로 잡는다. 머리 → 몸통 → 앞쪽 그리퍼 → 뒤쪽 해머 → 다리의 순서로 큰 실루엣을 먼저 읽을 수 있어야 한다.
- 투명 배경과 불투명 스프라이트 외곽을 분명히 분리한다. 체크무늬, 단색 배경, 그림자 바닥, 환경 장식, 글자, 로고, 테두리 프레임을 이미지에 넣지 않는다.
- 본체는 우향 단일 방향으로 생성한다. 좌향 변형, 등·정면 뷰, 여러 포즈, 시트 배열을 한 파일에 함께 넣지 않는다.
- 픽셀 상태·위험성은 황색만으로 표현하지 않고 장비 위치, 몸의 기울기, 외곽선과 실루엣으로도 구분할 수 있게 설계한다. 이번 기본 스프라이트는 중립 상태만 다룬다.

## 5. 생성 프롬프트 기준

### `commander-body-base`

```text
Use case: reference-only game-asset concept.
Asset type: one clean 2D pixel-art boss sprite, transparent PNG, exact 128 by 192 pixels.
Primary request: a fully mechanical industrial command unit, a heavy bipedal walker facing right in strict side view, feet centered on the bottom anchor. Show the whole neutral silhouette, including both mounted arms.
Subject: low wide sensor head with one horizontal yellow visor slit; broad heavy legs; charcoal steel and rusty iron; worn second-hand factory machinery with oil stains, scratches, and visible repair patches. The near/front arm is a large hydraulic symmetric two-prong parallel gripper. The far/rear arm is a short, thick, square pile-driver industrial hammer.
Style: crisp hand-authored 2D pixel art, hard pixel edges, limited palette, no anti-aliasing, readable at 1x and integer scale.
Background: actual transparent background.
Avoid: humans, exosuits, faces, cockpits, organic or fantasy parts, shiny new mecha, neon cyberpunk colors, cyan glow, text, logos, UI, sprite sheets, action pose, terrain, cast ground shadow, outlines with semi-transparent pixels.
```

### `commander-gripper-arm`

```text
Use case: reference-only game-asset component.
Asset type: one clean 2D pixel-art arm reference, transparent PNG, exact 64 by 96 pixels.
Primary request: a right-facing industrial hydraulic arm from a shoulder coupling to a large symmetric two-prong parallel gripper. The gripper is the near/front arm of a heavy bipedal command walker and is held in a neutral open-ready pose.
Style and material: crisp pixel art; charcoal steel, rusty iron, tiny yellow warning light only; oil stains, scratches, repair patches; no anti-aliasing.
Background: actual transparent background.
Avoid: torso, legs, hammer, humanoid hand, organic claw, weapon blade, text, UI, sprite sheet, environment, semi-transparent pixels.
```

### `commander-hammer-arm`

```text
Use case: reference-only game-asset component.
Asset type: one clean 2D pixel-art arm reference, transparent PNG, exact 64 by 96 pixels.
Primary request: a right-facing industrial hydraulic arm from a shoulder coupling to a short, thick, square pile-driver hammer. The hammer is the far/rear arm of a heavy bipedal command walker and is held in a neutral resting pose.
Style and material: crisp pixel art; charcoal steel, rusty iron, tiny yellow warning light only; oil stains, scratches, repair patches; no anti-aliasing.
Background: actual transparent background.
Avoid: torso, legs, gripper, axe, sword, long spear, humanoid hand, organic parts, text, UI, sprite sheet, environment, semi-transparent pixels.
```

## 6. 생성 뒤 판정 기준

### 통과 조건

- 세 export 파일이 각각 정해진 파일명·크기·RGBA PNG 형식을 지키며, alpha 값은 완전 투명(`0`) 또는 완전 불투명(`255`)만 사용한다.
- 본체가 `128×192px`, 투명 배경, 우향, 발 중앙 기준을 지키며 머리·양팔 장비·다리가 한 장에서 끊기지 않고 보인다.
- 본체의 기준점은 `bottom-center (0.5, 1.0)`, 각 분리 팔의 기준점은 `shoulder-coupling (0.0, 0.5)`로 기록한 위치와 일치한다.
- 가까운 팔은 대칭 2지 병렬 그리퍼, 먼 팔은 짧고 두꺼운 사각 파일드라이버 해머로 즉시 구분된다.
- 낮고 넓은 머리와 가로 황색 단일 시야가 보이며, 사람·외골격 슈트가 아니라 중고 산업용 기계로 읽힌다.
- 1배율과 정수배 확대에서 가장자리 흐림·반투명 픽셀·안티앨리어싱이 없고, 먹색 강철·녹슨 철색·제한적 황색의 역할이 분명하다.
- 분리 팔 이미지는 몸통과 다리 없이 장비 전체가 보이고, 본체의 앞/뒤 팔 배치와 모순되지 않는다.

### 반려 조건

- 배경·UI·글자·로고·다수 포즈·시트 배열·환경 그림자·다른 캐릭터가 섞인 이미지.
- 황색 또는 색 변화만으로 장비·상태를 구분하게 만든 이미지.
- 그리퍼와 해머의 앞/뒤 팔 관계가 바뀌거나, 장비가 별도의 보스 본체처럼 보이는 이미지.
- 지정한 캔버스보다 작거나 큰 이미지, 반투명 가장자리·그림자, 또는 장비가 잘린 이미지.
- Collider, hitbox, 피해량, 그랩 사거리, Rope, 체력, 물리 또는 Runtime 연결 정보를 PNG나 자산 명세에 넣는 작업.

## 7. 결과물 기록과 다음 경계

- 승인 뒤 생성한 파일은 `assets/artwork/characters/lower-sector-commander/` 아래에 아래 구조로 보관한다.

```text
lower-sector-commander/
├─ README.md
├─ source/                 # 생성 요청 원문과 도구 원본
├─ export/                 # commander-body-base.png, commander-gripper-arm.png, commander-hammer-arm.png
└─ preview/                # 본체의 1×·4× 정수배 정지 미리보기
```

- README에는 상태(`REFERENCE-ONLY`), 각 export 파일명, 제작 캔버스, 실제 불투명 영역, 기준점, `32×32` 기준 격자, 기본 우향과 **좌우 반전 미결정**, 생성 도구·버전·원본 형식, 프롬프트 출처, 라이선스 정보와 이 기획서 링크를 기록한다.
- 이 참고 단계의 의도한 출력은 원본 1×와 nearest-neighbor 4× 검수 미리보기뿐이다. 실제 게임 출력 크기·좌우 반전 정책은 Boss Runtime 공개 계약이 승인될 때 정의한다.
- 생성 직후의 참고 이미지 검수와 Runtime 연결 뒤의 화면 검수는 구분한다. Runtime 연결 전에는 각 파일의 크기·RGBA·alpha·기준점·1×/4× 픽셀 선명도·실루엣을 확인한다. Runtime 연결 뒤에는 데스크톱과 모바일 실제 게임 화면에서 Player, Rope, Anchor, Telegraph, 충돌 발판보다 과도하게 복잡하거나 가려지지 않는지 확인한다.
- 생성물은 별도 Boss Runtime 공개 계약과 loader·manifest·renderer 연결이 승인되기 전까지 `production-ready` 또는 `Runtime PASS`로 표시하지 않는다.
- 기본 본체가 승인된 뒤에만 그랩 자세, 해머 내려찍기 자세, 조준선·경고 원, 끌어오기·충돌 VFX의 별도 기획을 시작한다.

## 8. 사용자 확정 사항

| 항목 | 확정 내용 |
| --- | --- |
| 첫 이미지 | 본체 기본 스프라이트 |
| 기체 유형 | 완전 기계형 지휘 유닛, 중량형 2족 보행기 |
| 본체 출력 | `128×192px`, 우향, 발 중앙 기준 |
| 팔 배치 | 가까운 팔은 그리퍼, 반대 팔은 해머 |
| 그리퍼 | 대칭 2지 병렬 그리퍼, 대형 유압 집게손 |
| 해머 | 짧고 두꺼운 사각 파일드라이버형 산업 해머 |
| 머리 | 낮고 넓은 센서 헤드, 가로형 황색 단일 시야 |
| 표면·색 | 먹색 강철, 녹슨 철색, 제한적 황색 경고등, 기름때·긁힘·수리 패치 |
| 납품 범위 | 양팔 장비를 갖춘 본체 전체 + 그리퍼 팔·해머 팔의 별도 참고 이미지 |
