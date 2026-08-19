# <STAGE ID> — ASSET REQUIREMENTS

> AUTHORING SNAPSHOT: `main@<GITHUB_MAIN_SHA>` (<YYYY-MM-DD>)

`DIRECTION-SPEC-AUTHORING-STANDARD.md` §7-3 Asset Rule을 따른다. 모든 asset reference는 `VERIFIED existing`(이미 있음) / `REQUIRED new`(신규 필요) / `OPTIONAL`(있으면 좋음)로 표시하고, PLACEHOLDER 허용 여부를 명시한다. 경로를 추측해서 적지 않는다.

| Stable Asset ID | Category | Purpose | Required Status | Fallback |
|---|---|---|---|---|
| `<asset-id>` | `<sprite/environment/audio/...>` | `<이 asset이 어떤 Beat/track에서 쓰이는지>` | `VERIFIED existing / REQUIRED new / OPTIONAL` | `<PLACEHOLDER 허용 여부 및 대체안>` |
