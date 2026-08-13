# Audio authoring handoff

오디오 작업자는 `docs/audio-asset-guide.md`를 읽고 다음 구조로 결과를 인계합니다.

```text
<category>/<asset-id>/
├─ README.md
├─ source/
├─ export/
└─ preview/
```

허용 category는 `gameplay`, `ui`, `ambience`, `bgm`입니다. `export/`에는 48 kHz·24-bit PCM WAV master를 두고, README에 사용 도구·버전, prompt/설정, 출처·라이선스, mono/stereo, loop 구간과 미확정 사항을 기록합니다.

이 폴더의 결과를 게임이 직접 읽지 않습니다. 통합 개발자가 `docs/audio-asset-format.md`에 따라 `assets/runtime/audio/` package로 정규화합니다.
