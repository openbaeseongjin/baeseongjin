# Boss03 motion authoring v1

> 상태: **APPROVED AUTHORING / RUNTIME v1 NORMALIZED**

선택된 [`boss03-idle-player-style-selected-v1.png`](../boss03-idle-player-style-selected-v1.png)을 외형 기준으로 삼아 Codex 내장 ImageGen으로 순차 생성한 Boss03 본체 모션 시트다. Player의 도트 밀도·굵은 외곽선·큰 색 덩어리를 참고했으며 외부 그래픽은 사용하지 않았다.

## 모션 시트

| 순서 | 클립 | 파일 | 생성 프레임 | 출력 | PNG | SHA-256 |
| ---: | --- | --- | ---: | --- | --- | --- |
| 1 | `idle` | [`idle-4-imagegen.png`](./idle-4-imagegen.png) | 4 | `2172×724` | RGBA | `8AB9C73E0E09C49158E3AD8B3862DF3D10A669F1957CA4D4D7B66A6E53E1EC6E` |
| 2 | `walk` | [`walk-8-imagegen.png`](./walk-8-imagegen.png) | 8 | `1672×941` | RGB | `5B107BB07B35E0296BB8CD8EA9D475A5D0A29BC45422D65EBF7323EF21105AC1` |
| 3 | `grab-lock` | [`grab-lock-4-imagegen.png`](./grab-lock-4-imagegen.png) | 4 | `2172×724` | RGBA | `6D0DE4659D2528D3AD06896A9FACED895A52F3BA58280ECAD7119E976CA270B5` |
| 4 | `grab-pull` v2 | [`grab-pull-6-imagegen-v2.png`](./grab-pull-6-imagegen-v2.png) | 6 | `1254×1254` | RGB | `1668DA4A439B26E033DA8646D6B30B3C5C7D52430AFEFE5DB705FD9ED086130A` |
| 5 | `enemy-summon` v1 | [`enemy-summon-6-imagegen-v1.png`](./enemy-summon-6-imagegen-v1.png) | 6 | `1254×1254` | RGB | `D50964ED95C8A4E24AE88E37AFEC7290DB68092974E2CA4AF9521291ECBE3DDF` |
| 6 | `hammer-slam` | [`hammer-slam-8-imagegen.png`](./hammer-slam-8-imagegen.png) | 8 | `1774×887` | RGB | `4FCF468BCDD576C488EB8D21962CC751FC7B4DD9FAE1D12451C33DC0BD0D056A` |
| 7 | `body-charge` | [`body-charge-6-imagegen.png`](./body-charge-6-imagegen.png) | 6 | `1536×1024` | RGBA | `69732D454D7DCD500A62891A560E855AC80CA468046A8DFE5CD0778F89646D79` |
| 8 | `hit` | [`hit-3-imagegen.png`](./hit-3-imagegen.png) | 3 | `1881×836` | RGBA | `3F70A56B2B80209A4B395740DC0356737E4447C98CACB79E0A0D4F1BD5619644` |
| 9 | `defeated` | [`defeated-8-imagegen.png`](./defeated-8-imagegen.png) | 8 | `1774×887` | RGB | `354E2619FB7B8B81CEEDE253D8642F8921078CB65B778D261CD5C6EA67599D2A` |

이 폴더의 본체 원본은 9개 클립·53개 생성 프레임이다. 별도 jump authoring을 포함한 Runtime 본체는 10개 clip이며, 결정적 정규화 뒤 기본 `256×256`, 확장 동작 `288×256` cell과 alpha `0/255`, 공통 접지 anchor를 사용한다.

## 프레임 의도

- `idle`: 발·해머 접지를 유지한 작은 몸통 호흡.
- `walk`: 짧은 보폭의 접지·하강·통과·상승을 좌우로 반복하며 Runtime은 이동 거리 `144px`당 한 주기로 재생한다.
- `grab-lock`: 중립에서 뒤로 체중을 싣고 훅 팔로 대상을 고정하는 예고.
- `grab-pull`: 실제 hook tip 비행 뒤 전신이 뒤로 젖혀지는 당김, 눈높이 구속과 해머 전환의 본체 동작.
- `enemy-summon`: 해머를 지지대로 고정하고 훅 팔·센서로 좌우 소환 위치에 명령하는 본체 동작.
- `hammer-slam`: 들어 올리기, 정점 예고, 내려찍기, 충돌 자세, 회복.
- `body-charge`: 저자세 압축 예고, 발진, 진행 자세, 제동·회복.
- `hit`: 중량형 상체 반동과 낮은 복귀.
- `defeated`: 센서 감광, 무릎 붕괴, 해머 이탈, 측면 전도, 센서 소등.

## 분리 VFX 인계

| 우선 | 효과 | 역할 |
| ---: | --- | --- |
| 필수 | `grab-target-lock` | 보스 팔 조준선과 고정 대상 발밑 경고 원을 동시에 표시한다. |
| 필수 | [`grab-hook-flight`](../../../../effects/boss03-chain-hook-pull/README.md) | 사출 훅, 늘어난 사슬과 성공 뒤 팽팽해지는 당김 방향을 표현한다. 3단계 적용 미리보기를 제작했다. |
| 필수 | `hammer-slam-impact` | 판정 순간의 짧은 충격 링과 바닥 파편을 표현한다. |
| 권장 | `body-charge-cue` | 예고 먼지, 진행 방향 잔상과 충돌 순간 타격을 표현한다. |
| 권장 | `commander-hit-spark` | 본체 실루엣을 가리지 않는 작은 장갑 스파크다. |
| 선택 | `commander-shutdown` | 센서 소등 잔광과 얇은 연기만 사용하고 폭발은 만들지 않는다. |

효과는 본체 시트에 합치지 않는다. 사출 훅·반복 사슬 링크·당김 장력은 별도 저작 원본에서 정규화해 Boss03 local Runtime package에 부착했다. Runtime ID와 판정 수명은 이 폴더가 정의하지 않는다.

## Runtime v1 결과

- [`normalize_runtime_assets.py`](./normalize_runtime_assets.py)가 보드 frame 분리, 체크무늬·반투명 fringe 제거, 16색 제한 palette 재매핑과 nearest-neighbor 정렬을 수행한다.
- authoring export는 `../../export/runtime-v1/`, 검토 보드는 `../../preview/runtime-v1/`, 게임 리소스는 `assets/runtime/characters/lower-sector-commander-v1/`에 둔다.
- clip마다 첫 기준 자세의 불투명 높이를 `184px`로 맞추고, 액션 확장에는 `256×256` 투명 canvas를 사용해 해머·훅 때문에 본체 배율이 줄어들지 않게 한다. anchor는 `(0.5, 0.59375)`다.
- 원본 공격 방향은 `grab-lock`·`grab-pull`이 좌향, 나머지 본체 clip이 우향이다. renderer는 현재 frame의 원본 방향과 gameplay 공격 방향이 다를 때만 수평 반전한다.
- `walk`는 8프레임 순서와 접지 anchor를 유지하고, Runtime의 거리 기반 phase를 `144px` 한 주기로 고정해 180~260px/s 보행에서 과도한 발 교대를 방지한다.
- `jump`는 별도 `motion-authoring-v2-jump`의 6프레임 atlas를 사용한다. 조준선·경고 원·해머 충격은 기존 gameplay 표현을 유지한다.
- Boss 전용 공개 manifest·validator가 없으므로 local Runtime 통합과 Polygon fallback 경계를 유지한다.

생성에 사용한 공통 조건과 클립별 prompt set은 [`PROMPTS.md`](./PROMPTS.md)에 기록한다.
