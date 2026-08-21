# 세션 핸드오프

이 문서는 기준 문서에 아직 흡수되지 않은 항목만 임시로 기록한다. 운영 기준은 [`docs/documentation-rules.md`](docs/documentation-rules.md)를 따른다.

## 현재 미흡수 항목

### [L2] 192 kbps 사용자 제공 메인 테마를 기본 등반 BGM으로 사용한다

- 사용자 제공 `main theme 192kbps.mp3`를 `main-theme` 원본으로 보존하고 48 kHz/24-bit PCM WAV master, OGG 우선·MP3 fallback runtime source로 정규화한다.
- bootstrap은 `default-mock` pack의 BGM category만 `main-theme` package로 override하고 기존 `bgm-climb` cue를 유지한다. 메뉴에서는 package를 준비하지 않으며 완료 상태는 별도 `bgm-run-complete` mock source를 유지한다.
- 전체 203.911854초 파일은 browser native loop로 반복한다. 기술 검증과 별도로 사람의 loop seam·mix 청취와 원본의 소유·공개 배포 권리 확인 전에는 release-ready로 보지 않는다. 자산·검증 상태는 `assets/audio-authoring/bgm/main-theme/README.md`와 `assets/runtime/audio/bgm/main-theme/README.md`가 소유한다.
