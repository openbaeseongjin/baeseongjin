# Boss03 chain-hook pull VFX 저작 후보

> 상태: **APPROVED AUTHORING / BOSS03 ATTACHED RUNTIME v1**

Boss03의 `grab-pull`에 필요한 사출 훅, 늘어나는 사슬, 성공 뒤 장력을 서로 다른 수명의 저작 단위로 분리한 원본 후보다. 충돌, 사거리, 판정 시간, Player 강제 이동, 피해량과 네트워크 결과를 정의하지 않는다.

## 파일

| 역할 | 파일 | 규격·상태 |
| --- | --- | --- |
| 훅 비행 | [`source/hook-flight-4-imagegen.png`](./source/hook-flight-4-imagegen.png) | `1983×793px` RGBA · 4프레임 원본 후보 · SHA-256 `450DD9B9B9B53816D70DEF6BD56A7A875FD44B1AA892D18697AF45E36B322D1C` |
| 사슬 전개 | [`source/chain-extension-6-imagegen.png`](./source/chain-extension-6-imagegen.png) | `1725×912px` RGB · 6프레임 원본 후보 · 체크무늬 배경 제거 필요 · SHA-256 `D3E9D6D1E7ADCB75B3AA04D2773FFA59573E49AD1008DB10EA9AD3A6CF5FAAB8` |
| 당김 장력 | [`source/pull-tension-4-imagegen.png`](./source/pull-tension-4-imagegen.png) | `2172×724px` RGBA · 4프레임 원본 후보 · SHA-256 `3517D0F612E55C71A427C2F6CEC9030ACEE7839AAF165C784EE3087583CB245D` |
| 적용 미리보기 | [`preview/boss03-chain-hook-pull-applied-v1.png`](./preview/boss03-chain-hook-pull-applied-v1.png) | `2172×724px` RGB · 3단계 설명 보드 · SHA-256 `DE2F46C2FACC01D182ECAAE5EFC6D57A7BA1798C47D6D3C76C5087B8E80CBC57` |
| Runtime 검토 | [`preview/runtime-v1/boss03-chain-hook-runtime-review.png`](./preview/runtime-v1/boss03-chain-hook-runtime-review.png) | 정규화된 사출 훅 4·장력 4·반복 링크 1 검토 보드 |

재생성 조건과 최종 프롬프트는 [`PROMPTS.md`](./PROMPTS.md)에 기록한다.

## VFX 저작 단위

1. `hook-flight`: 이동 위치는 gameplay가 소유한다. 동일 중심점에서 훅의 상·중·하 피치와 짧은 속도 픽셀만 변하는 4프레임이다.
2. `chain-extension`: 고정된 양 끝점 사이에서 링크 수가 늘고 처짐이 감소해 직선이 되는 6단계다. 훅 본체는 포함하지 않는다.
3. `pull-tension`: 접촉 뒤 훅과 짧은 사슬은 고정하고, 처짐 해소와 국소 응력 픽셀만 변하는 4프레임이다. 큰 타격 폭발은 포함하지 않는다.

## 제작 기준

- 도구: Codex 내장 ImageGen.
- Boss 기준: `assets/artwork/characters/boss03-lower-sector-commander/source/boss03-idle-player-style-selected-v1.png`와 기존 `grab-lock`, `grab-pull` 동작 원본.
- Player 기준: `assets/artwork/characters/player-main/source/pixellab-ready-character.png`.
- 사슬은 굵은 사각 철제 링크, 먹색 외곽선, 녹슨 주황 가장자리로 표현한다. 청록색·전기·섬유 질감을 금지해 Player Rope와 구분한다.
- 외부 이미지나 제3자 그래픽은 사용하지 않았다.

## Runtime v1 정규화 결과

- `hook-flight`는 `64×64` 4프레임, `pull-tension`은 `128×64` 4프레임, 사슬은 `32×24` 반복 링크로 정규화했다.
- 가장자리는 alpha `0/255`, 제한 palette와 nearest-neighbor 픽셀 경계를 사용한다.
- 사출 단계에는 Boss 손과 대상 위치 사이 링크 수가 늘고 처짐이 줄며, 포획 뒤에는 링크를 직선으로 유지하고 장력 frame을 대상 지점에 표시한다.
- 공개 standalone VFX manifest·loader·validator가 없으므로 `assets/runtime/effects/`가 아니라 `assets/runtime/characters/lower-sector-commander-v1/`의 Boss 부착 리소스로 연결한다.
- Player Rope의 청록색 선과 구분되는 먹색·녹슨 주황 링크를 유지하며 판정·강제 이동·피해 수명은 기존 gameplay가 소유한다.

## 적용 미리보기 단계

1. `launch`: 훅이 손목 결합부에서 분리되고 짧은 사슬이 각진 곡선으로 풀린다.
2. `extension`: 훅이 Player에 접근하며 사슬의 처짐이 줄고 거의 직선이 된다.
3. `taut-pull`: 훅이 Player를 관통하지 않고 몸 바깥을 걸며 사슬이 팽팽해진다.
