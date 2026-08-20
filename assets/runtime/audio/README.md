# Runtime audio packages

이 경로는 통합 개발자가 검증한 브라우저 오디오 package입니다. 오디오 작업자의 납품은 `assets/audio-authoring/`에 둡니다.

- `audio-manifest.schema.json`: category package 공개 계약
- `audio-pack.schema.json`: category package 조합 계약
- `<category>/default-mock/`: 현재 구조 검증용 package
- `packs/default-mock/`: 네 mock category를 조합하는 기본 pack

`default-mock` WAV는 `scripts/generateAudioMockAssets.mjs`가 만든 48 kHz PCM 구조 검증 자료이며 정식 음향 방향이 아닙니다. 다시 만들려면 generator를 실행하고 pack validator를 통과시킵니다.

0.45.0 gameplay package의 `direction-*` cue 일곱 개는 1-1/1-2 Direction Runtime의 relay, rope/air, cable/brake, free-air attach와 security 전환 adapter를 검증하는 procedural mock이다. 기획 action token은 `DirectionDefinition` authoring adapter가 cue ID로 변환하며 gameplay trigger를 manifest에 넣지 않는다.

현재 gameplay package의 `gameplay-action-swing`은 Action 시작 연결을 검증하기 위해 기존 짧은 mock 변형을 재사용한다. 이는 정식 주먹·Action 음색이 아니며, 후속 오디오 작업자는 stable cue ID를 유지한 채 전용 48 kHz master와 runtime source로 교체한다.

```powershell
node scripts/generateAudioMockAssets.mjs
npm run validate:audio-assets -- assets/runtime/audio/packs/default-mock
```

새 package는 같은 category의 mock manifest를 복사해 시작합니다. schema·parser·mock·validator는 하나의 공개 계약이므로 함께 변경합니다. 자세한 필드는 `docs/audio-asset-format.md`를 따릅니다.
