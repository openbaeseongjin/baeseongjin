# Runtime audio packages

이 경로는 통합 개발자가 검증한 브라우저 오디오 package입니다. 오디오 작업자의 납품은 `assets/audio-authoring/`에 둡니다.

- `audio-manifest.schema.json`: category package 공개 계약
- `audio-pack.schema.json`: category package 조합 계약
- `<category>/default-mock/`: 현재 구조 검증용 package
- `packs/default-mock/`: 네 mock category를 조합하는 기본 pack

`default-mock` WAV는 `scripts/generateAudioMockAssets.mjs`가 만든 48 kHz PCM 구조 검증 자료이며 정식 음향 방향이 아닙니다. 다시 만들려면 generator를 실행하고 pack validator를 통과시킵니다.

```powershell
node scripts/generateAudioMockAssets.mjs
npm run validate:audio-assets -- assets/runtime/audio/packs/default-mock
```

새 package는 같은 category의 mock manifest를 복사해 시작합니다. schema·parser·mock·validator는 하나의 공개 계약이므로 함께 변경합니다. 자세한 필드는 `docs/audio-asset-format.md`를 따릅니다.
