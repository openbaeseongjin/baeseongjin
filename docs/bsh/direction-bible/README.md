# ONE ROPE — Direction Bible Drafts

이 폴더는 아직 승인되지 않은 게임 전체 단위(모든 Sector에 걸친) 연출/서사 기획 draft를 보관한다. `docs/bsh/scenario/`의 Sector·Stage 문서와 달리 특정 Stage 하나가 아니라 **게임 전체의 목소리·정서·세계 구조**를 다룬다.

원본은 상호작용 HTML(interactive toolbar/미리보기)로 전달됐다. `docs/documentation-rules.md` §4에 따라 발표 자료가 아닌 기획 문서는 Markdown을 유지해야 하므로, 상호작용 기능은 버리고 내용만 이 폴더의 Markdown 문서로 옮겼다 — 문장·수치·표는 재해석 없이 그대로 옮겼다.

| 문서 | 상태 | 역할 |
|---|---|---|
| [`protagonist-voice-arc-rev1.md`](./protagonist-voice-arc-rev1.md) | `HYPOTHESIS` | Sector 01~06에 걸친 주인공 대사 톤·문장 형태·감정 노출의 단계적 변화 |
| [`world-master-structure-snowpiercer-draft.md`](./world-master-structure-snowpiercer-draft.md) | `DRAFT · WORLD STRUCTURE CONFIRMATION` | 6-Sector 수직 사회 단면도 구조 제안. **Sector 04를 `TRANSIT/INFRASTRUCTURE`에서 `UPPER RESIDENTIAL/AMENITY`로 재정의하는 안 포함 — 현재 authored Sector 04(REV 1.1, 8/8 완성)와 정면으로 충돌한다** |
| [`global-atmosphere-arc-rev2.md`](./global-atmosphere-arc-rev2.md) | `HYPOTHESIS` | Sector 01~06의 공간/조명/카메라/음향/UI/실패감이 따라야 할 감정 아크 |

## 승인 상태와 다음 단계

세 문서 모두 `[01-MAP-UNIQUENESS-RULES.md 등 ONE ROPE 표준의] 상태 라벨` 기준으로 아직 `HYPOTHESIS`/`DRAFT`이며 `VERIFIED`나 `DESIGN LOCKED`가 아니다(`docs/bsh/scenario/DIRECTION-SPEC-AUTHORING-STANDARD.md` §3). 이 폴더에 문서를 추가한 것은 **보관과 참조만을 위한 것**이며 다음을 의미하지 않는다:

- Sector 04 재정의 승인 — World Master Structure 문서의 경고를 먼저 읽는다.
- 어떤 Stage의 `README.md`/`AREA-SPEC.json`/`DIRECTION-SPEC.json` 갱신 — 이 폴더 추가만으로는 어떤 Stage 문서도 변경하지 않았다.
- Runtime 구현 대상 확정 — `src/`는 이번 변경에서 건드리지 않았다.

특히 Sector 04 재정의는 **사용자의 명시적 결정**이 있어야 실제 Stage 재설계로 이어질 수 있다. 그 전까지 `docs/bsh/scenario/4/`의 기존 `TRANSIT/INFRASTRUCTURE` 내용이 현재 기준이다.
