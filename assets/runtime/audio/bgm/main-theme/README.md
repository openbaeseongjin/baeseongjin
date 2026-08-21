# Main Theme Runtime Package

## 상태와 범위

- asset ID: `main-theme`
- category: `bgm`
- 상태: `TECHNICALLY INTEGRATED · LISTENING/RIGHTS REVIEW`
- 적용 cue: 등반 플레이 중 `bgm-climb`
- 유지 cue: 완료 상태 `bgm-run-complete`
- 비범위: 메뉴 음악, gameplay·physics·network 변경

## 파일과 재생 정책

| clip           | 재생                     | source 우선순위                | 길이         | loop                          |
| -------------- | ------------------------ | ------------------------------ | ------------ | ----------------------------- |
| `climb`        | `stream`, stereo, 비공간 | OGG Vorbis → MP3               | 203.911854초 | 전체 파일 browser native loop |
| `run-complete` | `stream`, stereo, 비공간 | 기존 default mock의 48 kHz WAV | 2초          | 0~2초                         |

`climb`은 압축 codec padding 차이를 피하려고 manifest에 수동 loop 경계를 선언하지 않습니다. 시작과 끝의 음악적 연결감은 실제 게임 청취 승인이 필요합니다.

## 출처와 변환

- 원본: 사용자 제공 `main theme 192kbps.mp3`
- 원본 SHA-256: `3F769C7B99542972137BDEB2036536826653F015A2437FC34F63706D9DCDFC5C`
- master: 48 kHz, 24-bit PCM WAV, stereo, 203.911854초
- 정규화: 단순 gain `-3 dB`, master `-16.6 LUFS-I`, `-3.2 dBTP`
- runtime OGG: FFmpeg 9.0.1 `libvorbis`, quality 6
- runtime MP3 fallback: FFmpeg 9.0.1 `libmp3lame`, 192 kbps
- 완료 음악: `bgm/default-mock/run-complete.wav` byte-identical 복사

사용자가 파일을 제공했지만 저작권 소유와 공개 배포 라이선스는 아직 확인되지 않았습니다. 로컬 게임 통합은 완료하되 공개 배포 전 권리 확인이 필요합니다.

## 검증

- package validator: PASS — `npm run validate:audio-assets -- assets/runtime/audio/bgm/main-theme`
- Chromium 메뉴: PASS — 싱글 플레이 선택 전 audio asset 요청 0건
- Chromium 등반 진입: PASS — `main-theme/audio-manifest.json`을 사용해 필수 stream 준비 뒤 게임 진입, OGG 우선 source 계약, audio resume/failure 안내 없음
- 완료 cue 분리: PASS — `AudioEventBindings`가 완료 상태에서만 `bgm-run-complete`를 선택하고 package가 별도 `run-complete.wav`를 제공합니다.
- 브라우저 warning/error: 0건
- 사람의 loop seam·음량·게임플레이 가독성 청취: 미확인
