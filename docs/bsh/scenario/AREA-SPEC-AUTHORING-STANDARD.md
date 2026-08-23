# AREA-SPEC v2 저작 기준

1. Stage의 유일한 실행 저작 원본은 `docs/bsh/scenario/<sector>/<stage>/AREA-SPEC.v2.json`이며 v1 `AREA-SPEC.json`을 만들지 않는다.
2. 정확한 구조는 [`AREA-SPEC-TEMPLATE.json`](./AREA-SPEC-TEMPLATE.json), 공개 schema와 변환 계약은 `AreaSpecV2.js`·`AreaSpecV2Validator.js`가 소유한다.
3. `stage`는 폴더의 Sector·Stage, `sourceAreaId`, `legacyStageAlias`와 일치하고 `definition.id`·`sectorId`·`order`도 같은 정체성을 표현한다.
4. Runtime Stage는 `authoringMode`를 생략하거나 `runtime`으로 두며, 미승인 Stage만 `scenario`와 `scenario.status: scenario-only`를 사용한다.
5. geometry·anchor·object·objective·progression·story·camera·wind는 모두 `definition`과 `anchors`에 완전한 Runtime 값으로 기록하고 수기 catalog나 extractor snapshot에 복제하지 않는다.
6. `editor.editableDomains`와 `readOnlyDomains`는 템플릿의 공개 편집 경계를 그대로 유지하며 raw behavior는 `behaviorRefs`의 등록 ID만 참조한다.
7. `surfaces`는 일반 Stage collision·Rope·terrain의 완전한 목록이다. Runtime compiler는 boundary·city wing·seam·transit barrier를 추가하지 않는다. `worldObjects`는 Story display·Augment Node 등 authored object의 위치만 편집하고 kind·cue·상호작용 규칙은 잠근다.
8. catalog ID·revision·Stage 순서·source/output path는 `AREA-CATALOG*.json` manifest가 소유하고 모든 선택 Stage의 `source`는 `generated`여야 한다.
9. `npm run validate:area-specs`는 Sector 01~06의 canonical v2 파일이 정확히 48개인지와 각 파일의 schema·Runtime 의미·경로 정체성을 검증한다.
10. `node scripts/area-authoring-v2/generateAreaCatalogs.mjs --check`는 manifest와 generated Runtime module의 byte-level freshness를 검증한다.
11. 신규 또는 변경 Stage는 validator와 generator check를 통과한 뒤 production compiler·renderer 경로에서 확인하며 v1·수기 executable fallback을 추가하지 않는다.
