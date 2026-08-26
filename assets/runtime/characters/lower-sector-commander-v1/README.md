# Lower Sector Commander local runtime package

> 상태: **LOCAL RUNTIME INTEGRATION / sprite profile 기본 / Polygon fallback**

Boss03 본체 10개 모션과 그랩 전용 훅·사슬·장력 표현을 코드 소유 불변 clip으로 제공한다. Boss 전용 공개 manifest·validator가 아직 없으므로 player 또는 일반 몹 manifest를 재사용하지 않으며, 필수 본체 atlas가 실제 실패한 경우에만 기존 Boss Polygon 표현으로 복구한다.

| 파일 | 셀 | 프레임 | 역할 |
| --- | ---: | ---: | --- |
| `idle.png` | `256×256` | 4 | 중립 대기 |
| `walk.png` | `256×256` | 8 | 이동 거리 144px당 한 주기의 중량 보행 |
| `jump.png` | `256×256` | 6 | 이륙·상승·정점·낙하·착지 |
| `grab-lock.png` | `256×256` | 4 | 대상 고정 예고 |
| `grab-pull.png` | `288×256` | 6 | 실제 훅 비행 뒤 눈높이 끌기 2·구속 유지 1 |
| `enemy-summon.png` | `288×256` | 6 | 해머 고정·훅 팔 신호·좌우 소환 명령 |
| `hammer-slam.png` | `256×256` | 8 | 예고·타격·회복 |
| `body-charge.png` | `256×256` | 6 | 압축·돌진·제동 |
| `hit.png` | `256×256` | 3 | 피격 반동 |
| `defeated.png` | `256×256` | 8 | 센서 소등·전도 |
| `hook-flight.png` | `64×64` | 4 | 사출 훅 회전 |
| `pull-tension.png` | `128×64` | 4 | 포획 지점 장력 |
| `chain-link.png` | `32×24` | 1 | 양 끝점 사이 반복 링크 |

본체 cell은 공통 발 접지 anchor와 액션 확장 여백을 포함한다. 기본 출력은 `256×256`, 좌우 동작 폭이 큰 `grab-pull`·`enemy-summon`은 `288×256`이며 anchor Y는 공통 `(0.59375)`다. 각 clip의 첫 기준 자세를 같은 `184px` 높이로 정규화하고, 긴 해머·훅 동작은 본체를 축소하지 않고 좌우 투명 여백을 사용한다. 원본 공격 방향은 `grab-lock`·`grab-pull`이 좌향, 나머지 본체 clip이 우향이며 renderer가 gameplay 공격 방향과 다를 때만 반전한다. 긴 사슬은 고정 길이 atlas가 아니라 Boss 손과 실제 hook tip 또는 포획 Player 사이에 링크를 반복 배치한다. 비행 중에는 hook tip을 따라 사슬이 늘어나고, 포획 뒤에는 팽팽한 사슬과 별도 장력 frame을 표시한다.

`walk`는 8개 frame을 그대로 사용하되 이동 거리 `144px`마다 한 주기를 재생한다. 이전 34.56px 주기는 180~260px/s 보행에서 초당 5회 이상 반복되어 발 교대가 떨림처럼 보였고, 현재 주기는 같은 속도에서 초당 약 1.25~1.81회로 중량감을 유지한다.

## 출처와 정규화

- 원본 도구: Codex 내장 ImageGen.
- 본체 source: `assets/artwork/characters/boss03-lower-sector-commander/source/motion-authoring-v1/`.
- 점프 source: `assets/artwork/characters/boss03-lower-sector-commander/source/motion-authoring-v2-jump/`.
- VFX source: `assets/artwork/effects/boss03-chain-hook-pull/source/`.
- 결정적 변환: `normalize_runtime_assets.py`가 frame 분리, 제한 palette 재매핑, alpha `0/255`, nearest-neighbor 확대와 공통 anchor 정렬을 수행한다.
- 검토본: 각 authoring 폴더의 `preview/runtime-v1/`에 있다.

## 비소유 범위

이 package와 clip 시간은 collider, hitbox, 사거리, 피해량, 강제 이동, 물리와 네트워크 결과를 정의하지 않는다. `jump`의 앞 5개 frame은 기본 0.95초 체공에, 마지막 frame은 0.3초 착지 전환에 맞춘 표현이며 gameplay 점프 궤적을 바꾸지 않는다. 조준선·대상 경고 원·해머 충격 파편은 기존 gameplay 표현을 유지한다.
