# 오디오 리소스 작업 가이드

오디오 작업자는 생성 Skill·MCP·DAW 종류와 관계없이 편집 가능한 원본, 48 kHz master와 청취용 preview를 `assets/audio-authoring/`에 인계한다. `assets/runtime/audio/`는 통합 개발자가 브라우저용 파생 파일과 검증된 manifest를 두는 경로다. 생성 도구의 파일명이나 metadata를 게임 계약으로 사용하지 않는다.

## 역할

### 오디오 작업자

- 작업 요청에 적힌 cue의 의도, 길이, 변형과 loop를 제작한다.
- 사용 도구·버전, prompt 또는 설정, 외부 자료의 출처·라이선스를 `README.md`에 기록한다.
- `export/`에 48 kHz·24-bit PCM WAV master를 둔다.
- 위치 기반 one-shot은 mono, 넓은 환경 bed와 BGM은 필요한 경우 stereo로 납품한다.
- 게임 사건 이름, Web Audio graph, 네트워크 중복 제거와 runtime manifest를 임의로 수정하지 않는다.

### 통합 개발자

- master를 브라우저용 파일로 변환하고 `audio-manifest.json`으로 정규화한다.
- schema·loader·validator·catalog·binding을 함께 유지한다.
- 새 cue를 게임에 연결할 때 `AudioEventBindings`의 event handler 조합을 확장한다. 싱글·멀티 앱은 공용 `presentFrame` 경계만 호출하며 mixer에 사건 이름 분기를 추가하지 않는다.

## 제작·인계 경로

```text
assets/audio-authoring/<category>/<asset-id>/
├─ README.md
├─ source/       # 생성 결과 원본, DAW project, prompt와 metadata
├─ export/       # 48 kHz·24-bit PCM WAV master
└─ preview/      # 청취·검토용 압축 음원 또는 영상
```

category는 `gameplay`, `ui`, `ambience`, `bgm`만 사용한다. asset ID와 파일명은 소문자 kebab-case를 사용한다.

## 작업 요청에 포함할 정보

- category와 asset ID
- cue의 상황, 시작 조건과 종료 조건
- one-shot 또는 loop, 원하는 길이와 변형 수
- mono 또는 stereo, 위치 기반 재생 여부
- loop master라면 자연스럽게 이어지는 구간
- 참고 자료와 금지할 표현
- 정식 작업인지 구조 검증용 mock인지

현재 `default-mock`의 8개 cue는 시스템 검증 자료다. 최종 시나리오의 음향 방향이나 전체 cue 목록으로 간주하지 않는다.

## 완료 체크리스트

- `README.md`에 용도, 상태, 도구·버전, 출처·라이선스가 있다.
- 원본과 master가 분리되어 있다.
- 모든 master가 48 kHz·24-bit PCM WAV다.
- 위치 기반 단일 음원은 mono이며 stereo 사용 이유가 명확하다.
- loop의 의도한 시작·끝 시간이 기록되어 있다.
- peak clipping, 불필요한 앞뒤 무음과 눈에 띄는 loop click을 청취 확인했다.
- 미확정 사항과 통합 개발자에게 필요한 변환 사항을 적었다.

## 개발자 연결

통합 개발자는 [`audio-asset-format.md`](./audio-asset-format.md)를 전부 읽고 runtime package를 만든다. 현재 복사 가능한 예는 [`assets/runtime/audio/`](../assets/runtime/audio/)의 네 `default-mock` package와 pack이다.

```powershell
npm run validate:audio-assets -- assets/runtime/audio/packs/<pack-id>
```

validator를 통과하기 전에는 runtime-ready로 보고하지 않는다. collider·피해량·물리·서버 권위·게임 trigger는 오디오 리소스에 넣지 않는다.
