# 오디오 리소스 교환 형식

이 문서는 오디오 작업자의 WAV master를 브라우저 게임에 연결하는 공개 계약이다. 먼저 [`audio-asset-guide.md`](./audio-asset-guide.md)를 읽는다. 원본 도구 출력은 제작 입력이며 런타임은 도구 중립 `audio-manifest.json`과 명시된 source 파일만 읽는다.

## 진입점

- package schema: [`assets/runtime/audio/audio-manifest.schema.json`](../assets/runtime/audio/audio-manifest.schema.json)
- pack schema: [`assets/runtime/audio/audio-pack.schema.json`](../assets/runtime/audio/audio-pack.schema.json)
- parser: [`src/audio/AudioManifest.js`](../src/audio/AudioManifest.js), [`src/audio/AudioPack.js`](../src/audio/AudioPack.js)
- catalog: [`src/audio/AudioCatalog.js`](../src/audio/AudioCatalog.js)
- 검증용 예: [`assets/runtime/audio/packs/default-mock/audio-pack.json`](../assets/runtime/audio/packs/default-mock/audio-pack.json)
- validator: `npm run validate:audio-assets -- <pack-or-package-directory>`

schema, parser, mock manifest, validator 중 하나를 바꾸면 나머지를 같은 변경에서 갱신한다.

## 디렉터리

```text
assets/runtime/audio/<category>/<asset-id>/
├─ audio-manifest.json
└─ <runtime source files>

assets/runtime/audio/packs/<pack-id>/
└─ audio-pack.json
```

category는 `gameplay`, `ui`, `ambience`, `bgm`이다. ID는 소문자 kebab-case다. source 경로는 package 내부 상대 경로만 허용하며 절대 URL, `..`, 역슬래시, query와 fragment를 거부한다.

## package manifest v1

```json
{
  "formatVersion": 1,
  "id": "example-sfx",
  "category": "gameplay",
  "clips": {
    "example-hit": {
      "playback": "buffer",
      "channels": "mono",
      "durationSeconds": 0.25,
      "sources": [{ "path": "example-hit.wav", "mimeType": "audio/wav" }]
    }
  },
  "cues": {
    "gameplay-example-hit": {
      "group": "gameplay",
      "kind": "one-shot",
      "clips": [{ "clip": "example-hit", "weight": 1 }],
      "spatial": "world"
    }
  }
}
```

결과물은 이 설명 예제를 기억으로 다시 쓰지 말고 같은 category의 `default-mock/audio-manifest.json`을 복사해 시작한다.

### clips

- `playback`: `buffer|stream`을 반드시 명시한다. loader가 길이나 category로 추론하지 않는다.
- `channels`: `mono|stereo`이며 validator가 WAV channel 수와 대조한다.
- `durationSeconds`: master에서 확인한 양의 길이다. validator는 WAV data 길이, runtime은 decode 또는 media metadata와 대조한다.
- `required`: 기본 `true`다. 명시적 `false`만 준비 실패 후 제외할 수 있다.
- `sources`: `{ path, mimeType }` 우선순위 배열이다. 각 source는 최대 15초 동안 순서대로 시도한다.
- `loop`: 선택적인 `startSeconds`, `endSeconds`다. 파일 duration 안에 있어야 한다.

짧은 one-shot은 `buffer`여야 한다. `buffer`는 fetch와 0초보다 긴 decode 완료가 준비 조건이고, `stream`은 지원 MIME·metadata·`canplay`·Web Audio graph 연결까지 완료해야 준비된다.

### cues

- `group`: package category와 같아야 한다.
- `kind`: `one-shot|loop`다.
- `clips`: 가중치가 있는 clip 변형이다. 가능한 경우 직전 clip을 연속 선택하지 않는다.
- `spatial`: `none|world`다. UI와 BGM은 `none`만 사용한다.
- `gainDb`, `maxVoices`, `retriggerCooldownMs`, `priority`: cue 표현 정책이다.
- `pitchRandomizationPercent`, `gainRandomizationDb`: 기본 0이며 buffer one-shot에만 적용한다. 허용 최대는 각각 ±5%, ±3 dB다.
- `transitionMs`: 기본값은 BGM 1500ms, ambience 1000ms, 그 밖의 loop 250ms다.
- `ducking`: 대상 group의 `gainDb`, `attackMs`, `releaseMs`를 선언한다. 기본은 off다.
- `minGainDb`: `world` 경고음의 거리 감쇠 floor다. 사용자와 group 음소거를 우회하지 않는다.

manifest는 게임 trigger, collider, damage, physics, network authority와 최종 시나리오 의미를 소유하지 않는다. 이들은 package 밖 `AudioEventBindings`가 읽기 전용 사건과 scene state를 cue ID로 연결한다.

## pack manifest v1

```json
{
  "formatVersion": 1,
  "id": "example-pack",
  "packages": [
    { "category": "gameplay", "assetId": "example-sfx" },
    { "category": "ui", "assetId": "default-mock" }
  ]
}
```

pack은 category별 package 참조만 가진다. cue나 clip을 복제하지 않는다. 같은 category 중복과 pack 전체 cue ID 충돌은 거부한다. `loadAudioPackDefinition(packId, { packageOverrides })`는 전체 pack 또는 category 하나를 교체한 새 immutable definition을 만들 수 있다. 이 경계가 향후 디버그 선택과 작업물 비교의 기반이며 현재 selector UI와 실행 중 hot-swap은 범위 밖이다.

## 믹서와 공간 정책

- Web Audio graph는 master 아래 `gameplay`, `ui`, `ambience`, `bgm` GainNode를 둔다.
- 기본 dB는 master -6, gameplay 0, UI -4, ambience -10, BGM -8이다.
- cue 기본은 최대 4 voice, emitter별 40ms cooldown이며 loop를 포함한 전체 논리 voice 상한은 32다.
- 한도에서는 낮은 priority 중 가장 오래된 voice를 먼저 교체한다.
- world pan은 visible bounds 중심에서 좌우 가장자리를 `0→±1`로 clamp한다.
- 거리는 160까지 0 dB, 1200에서 -36 dB이며 그 밖은 무음이다.
- BGM·ambience loop는 lifecycle key별 하나이고 전환 중에만 이전·다음 source가 겹친다.

## 시작·실패·수명주기

- 모드 선택 사용자 동작에서 AudioContext 활성화를 시작한다.
- 모든 필수 clip과 필수 cue가 준비되기 전에는 게임 loop를 시작하지 않는다.
- 선택 실패만 `degraded`로 시작하며 진단과 설정 탭에 남긴다.
- 상태는 `loading|ready|degraded|suspended|failed`다.
- `document.hidden`과 `pagehide`는 one-shot을 폐기하고 context·stream을 suspend한다. `blur`만으로는 중지하지 않는다.
- 복귀 시 과거 one-shot을 재생하지 않고 현재 BGM·ambience state만 재조정한다.
- 메뉴 복귀와 release는 소유한 voice·loop·stream 연결을 명시적으로 정리한다.

## validator

validator는 runtime parser와 같은 manifest 규칙에 더해 다음을 검사한다.

- package 밖 경로와 심볼릭 링크 이탈
- source 존재·비어 있지 않음·MIME/확장자 일치
- WAV RIFF/format/data 구조, 48 kHz와 선언 channel 수
- 양의 duration과 loop 범위
- pack category 중복, package 참조와 cue ID 충돌

정식 authoring master의 24-bit 여부는 `assets/audio-authoring/` 인계 단계에서 확인한다. runtime은 브라우저 파생본이므로 WAV bit depth를 24-bit로 제한하지 않는다.
