# Main Theme

## 상태와 범위

- asset ID: `main-theme`
- category: `bgm`
- 상태: `INTEGRATED CANDIDATE · LISTENING/RIGHTS REVIEW`
- 적용: 게임 시작 뒤 등반 플레이의 `bgm-climb`
- 제외: 메뉴와 완료 상태. 완료 상태는 기존 `bgm-run-complete` mock을 유지합니다.

## 원본과 권리

- 원본: 사용자가 대화에 첨부한 `main theme 192kbps.mp3`
- 보존 경로: `source/main-theme-original.mp3`
- 원본 SHA-256: `3F769C7B99542972137BDEB2036536826653F015A2437FC34F63706D9DCDFC5C`
- 원본 규격: MP3, 44.1 kHz, stereo, 192 kbps, 203.911837초
- metadata: BPM 93, `LAME in FL Studio 20`, date 2023
- 라이선스: 사용자 제공 파일. 저작권 소유와 공개 배포 허가는 아직 확인되지 않았습니다.

## 정규화와 파생본

- 도구: FFmpeg 9.0.1 essentials build
- 처리: decode → stereo 유지 → 48 kHz resample → 단순 gain `-3 dB` → 24-bit PCM WAV
- master: `export/main-theme.wav`, 48 kHz, 24-bit PCM, stereo, 203.911854초
- master SHA-256: `0FD7279417C1B2CAB8C0E383EF20FEF6C49B8859B6E89FD9255479F9D17EAE72`
- master loudness: `-16.6 LUFS-I`, `-3.2 dBTP`, LRA `2.7 LU`
- preview: `preview/main-theme-review.mp3`, 48 kHz, stereo, 192 kbps
- runtime: OGG Vorbis quality 6 우선, MP3 192 kbps fallback
- loop: 별도 수동 경계 없이 전체 파일을 browser native loop로 반복합니다.

원본과 master는 분리해 보존합니다. 자동 validator와 브라우저 재생 경로가 통과해도 사람의 loop seam·게임플레이 mix 청취와 공개 배포 권리 확인 전에는 최종 release-ready로 판정하지 않습니다.
