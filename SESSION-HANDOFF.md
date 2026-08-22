# 세션 핸드오프

이 문서는 기준 문서에 아직 흡수되지 않은 항목만 임시로 기록한다. 운영 기준은 [`docs/documentation-rules.md`](docs/documentation-rules.md)를 따른다.

## 현재 미흡수 항목

### [L2] Sector 03 기본 배경은 승인된 seam-match V4 depth-islands package를 사용한다

- `sector-03-01`~`sector-03-08`의 기본 authored backdrop은 `assets/runtime/environments/sector-03-central-exchange/`의 fixed background와 좌·우 island 2개다.
- depth map은 offline 추출 근거로만 보존하고 Runtime은 캐시된 PNG 3장을 기존 Sector 01→02와 같은 package 단위 crossfade 권위로 그린다. Sector 02 package와 gameplay geometry는 변경하지 않는다.
- 제작·Runtime·검증 기준은 `assets/artwork/environments/sector-03-central-exchange-background/README.md`, `assets/artwork/environments/sector-02-03-runtime-seam/README.md`, `assets/runtime/environments/sector-03-central-exchange/README.md`가 소유한다.

### [L1] 개발 규칙 미반영 코드를 대상 묶음별 검토 후 순차 리팩터링한다

- 현재 `docs/development-rules.md`를 기준으로 저장소 전체의 미반영 코드를 단계별로 바로잡는다.
- 각 실행 단위는 사용자 검토가 가능한 `문제 파일 + 실제 사용처` 묶음으로 제시하고, 계획 검토가 끝난 묶음만 순차 수정한다.
- 저장소 전체 개발 규칙 정렬을 하나의 리팩터링으로 보고 전용 장기 branch 하나에서 수행한다. 승인된 리팩터링 step별 Lore commit으로 이력을 분리해 사용자가 순서대로 검토·복원할 수 있게 하며, 대상 묶음마다 새 branch를 만들거나 중간 병합하지 않는다.

### [L2] 192 kbps 사용자 제공 메인 테마를 기본 등반 BGM으로 사용한다

- 사용자 제공 `main theme 192kbps.mp3`를 `main-theme` 원본으로 보존하고 48 kHz/24-bit PCM WAV master, OGG 우선·MP3 fallback runtime source로 정규화한다.
- bootstrap은 `default-mock` pack의 BGM category만 `main-theme` package로 override하고 기존 `bgm-climb` cue를 유지한다. 메뉴에서는 package를 준비하지 않으며 완료 상태는 별도 `bgm-run-complete` mock source를 유지한다.
- 전체 203.911854초 파일은 browser native loop로 반복한다. 기술 검증과 별도로 사람의 loop seam·mix 청취와 원본의 소유·공개 배포 권리 확인 전에는 release-ready로 보지 않는다. 자산·검증 상태는 `assets/audio-authoring/bgm/main-theme/README.md`와 `assets/runtime/audio/bgm/main-theme/README.md`가 소유한다.

### [L2] Sector 01 드론 Runtime 후보를 실제 게임에서 최종 검토한다

- [L2][Runtime 후보 검토 중] Shield Drone은 작은 드론 몸체가 먼저 읽히는 `32x32` 저해상도와 Sector 01 산업 콘셉트를 유지하고, 실제 맵의 45도 모서리 절단 장갑판·육각/팔각 설비 하우징·굵은 금속 덩어리 같은 폴리곤 문법을 사용한다. 몸체와 한 장짜리 물리 방패를 별도 PNG atlas로 분리해 기존 `shield-body` clip과 `guard-octants` layer에 등록하며, 방패만 gameplay `guardDirection`의 8방향을 따르고 몸체는 upright 상태를 유지한다. 원형 에너지 링과 작은 기계 장식은 사용하지 않으며 최종 완료 승인은 실제 게임 검수 뒤 별도로 받는다.
- [L2][Runtime 후보 검토 중] Artillery Drone은 투사체가 날아가거나 지속 조준하는 적이 아니다. Player가 사거리에 들어와 `idle → telegraph`로 전이할 때 그 위치를 한 번 고정하고 `0.65초` 범위 예고 뒤 고정 위치에 판정을 내린다. 로컬 Runtime은 `assets/artwork/characters/artillery-drone-t1-acquisition-redesign/`의 12-frame atlas를 사용하며, upright 대칭 몸체의 상단 셔터가 감지 순간 좌우로 열리고 중앙 센서·하부 범위 투영기가 함께 반응한 뒤 비방향성 locked 자세로 고정된다. Artillery의 `aimLayer`와 최근접 Player 방향 추적은 제거했으며 이후 공격 위치는 기존 원형 telegraph만 전달한다. 공격 FSM·범위·피해·collision·network 권위는 바꾸지 않으며 최종 완료 승인은 실제 게임 검수 뒤 별도로 받는다.
