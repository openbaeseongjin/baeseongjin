# Stage Package Template (v1)

새 Stage 폴더(`docs/bsh/scenario/<sector>/<stage>/`)를 만들 때 아래 파일들을 복사해 시작한다. 각 파일의 필드/규칙은 [`../DIRECTION-SPEC-AUTHORING-STANDARD.md`](../DIRECTION-SPEC-AUTHORING-STANDARD.md) §9를 따른다.

| Stage 파일 | 이 template 폴더의 원본 | 비고 |
|---|---|---|
| `README.md` | [`README.template.md`](./README.template.md) | |
| `AREA-SPEC.json` | [`../AREA-SPEC-TEMPLATE.json`](../AREA-SPEC-TEMPLATE.json) | 기존 파일 재사용 — 여기서 복제하지 않는다 |
| `DIRECTION-SPEC.json` | [`../DIRECTION-SPEC-TEMPLATE.json`](../DIRECTION-SPEC-TEMPLATE.json) | 기존 파일 재사용 — 여기서 복제하지 않는다 |
| `PRODUCTION-ALIGNMENT.md` | [`PRODUCTION-ALIGNMENT.template.md`](./PRODUCTION-ALIGNMENT.template.md) | |
| `RUNTIME-HANDOFF.md` | [`RUNTIME-HANDOFF.template.md`](./RUNTIME-HANDOFF.template.md) | |
| `VALIDATION.md` | [`VALIDATION.template.md`](./VALIDATION.template.md) | |
| `ASSET-REQUIREMENTS.md` | [`ASSET-REQUIREMENTS.template.md`](./ASSET-REQUIREMENTS.template.md) | |

이 폴더의 파일은 모두 placeholder다. Sector 01(또는 다른 Sector)의 실제 Story/Map content를 여기서 발명하지 않는다 — 실제 Stage 내용은 승인된 기획(README/AREA-SPEC/DIRECTION-SPEC 원본)에서만 가져온다.
