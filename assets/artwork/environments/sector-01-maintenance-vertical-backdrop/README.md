# Sector 01 Maintenance 세로 배경 원본

Sector 01의 `1-1 SERVICE SHAFT`부터 `1-8 CONTAINMENT GATE`까지 이어지는 한 개의 수직 정비 시설을 한 장에 설계한 원경 제작 후보다. 현재 검토본 `dark-v3`는 Sector 문서 공용 배경의 명도·팔레트·픽셀 표현에 맞춰 `dark-v2`의 명암만 보정한 후보이며, 이전 1-1 Runtime PNG와 밝은 V1은 생성 입력으로 사용하지 않았다.

## 상태

- 자산 ID: `sector-01-maintenance-vertical-backdrop`
- 분류: environment authoring, sector-wide `far` background master
- 현재 상태: `AUTHORING REVIEW CANDIDATE V3`
- 생성 도구: OpenAI built-in ImageGen
- 생성일: `2026-08-17 KST`
- V3 입력 이미지: `dark-v2` 편집 대상, `docs/bsh/scenario/1/images/sector-01-background-reference.png` 명도·팔레트 기준
- 외부 자산: 없음
- 라이선스: 프로젝트 자체 생성 자산
- 제작 크기: `1024×1536` RGB PNG
- Runtime 상태: V2 depth layer package가 연결됐으며 현재 중경은 `mid-connected-v3`를 사용한다. `dark-v3` master는 Runtime 입력이 아니다.

## 파일

- `source/imagegen-sector-wide-vertical-2026-08-17.png`: ImageGen 원본
- `export/sector-01-maintenance-vertical-master.png`: `SUPERSEDED AUTHORING DRAFT`, 상단 조명과 전체 명도가 너무 밝아 현재 기준에서 제외
- `source/imagegen-sector-wide-vertical-dark-v2-2026-08-17.png`: 문서 공용 배경의 어두운 시각 언어를 적용한 V2 ImageGen 원본
- `export/sector-01-maintenance-vertical-dark-v2.png`: `SUPERSEDED AUTHORING DRAFT`, 문서 기준보다 Shadow가 과도하게 눌린 V2
- `source/imagegen-sector-wide-vertical-dark-v3-2026-08-17.png`: V2의 구조를 유지하고 문서 레퍼런스 명도로 보정한 V3 원본
- `export/sector-01-maintenance-vertical-dark-v3.png`: 현재 검토·후속 분할용 V3 무손실 PNG

## V2 깊이 레이어 분리본

사용자가 지정한 첨부 이미지는 잘못된 `/C:/` 접두사 때문에 직접 열 수 없었지만, 프로젝트의 `export/sector-01-maintenance-vertical-dark-v2.png`와 SHA-256·바이트 길이가 같은 파일이었다. 이 V2 평면 이미지를 위치·팔레트 기준으로 삼아, 가려진 원경을 복원해 세 개의 깊이 평면으로 재구성했다. 따라서 이것은 기계적인 픽셀 추출이 아니라 **V2를 기준으로 한 레이어 재제작 후보**다.

- 상태: `AUTHORING REVIEW CANDIDATE — V2 DEPTH LAYERS / CONNECTED MID V3`
- 크기: 모두 `1024×1536` PNG
- 생성 도구: OpenAI built-in ImageGen, 2026-08-17 KST
- Runtime 상태: `far`, `mid-connected-v3`, `near`가 `assets/runtime/environments/sector-01-maintenance/`에 연결됐다. manifest·Collision·Gameplay 좌표는 변경하지 않는다.
- `source/layers-v2/imagegen-sector-01-maintenance-v2-{far,mid,near}-2026-08-17.png`: ImageGen 원 출력. `mid`·`near`의 밝은 무채색 체크 매트는 출력 도구가 실제 알파를 제공하지 않아 남은 것이다.
- `export/layers-v2/sector-01-maintenance-v2-far.png`: 전체 캔버스를 채우는 불투명 원경. 중앙 샤프트·원거리 벽·희미한 청색 안개만 둔다.
- `export/layers-v2/sector-01-maintenance-v2-mid.png`: 최초 투명 중경 분리본. 설비 지지 구조가 부족해 `supported-v2` 검토본으로 대체됐다.
- `export/layers-v2/sector-01-maintenance-v2-near.png`: 실제 투명 알파 PNG. 좌우 프레임, 굵은 배관, 근경 설비 상자, 우하단 밸브만 둔다.
- `export/layers-v2/sector-01-maintenance-v2-layers-composite-preview.png`: `far → mid → near` 순서의 정적 합성 검수용 미리보기이며 Runtime 입력이 아니다.
- `source/layers-v2/imagegen-sector-01-maintenance-v2-mid-supported-v2-2026-08-17.png`: 기존 중경과 합성 장면을 편집 입력으로 사용한 지지 구조 보정 원출력.
- `export/layers-v2/sector-01-maintenance-v2-mid-supported-v2.png`: 현재 중경 검토본. 허브·팬·제어 설비를 벽 브래킷, 트러스, 덕트, 세로 서비스 레일과 배관으로 연결한 실제 투명 알파 PNG다.
- `export/layers-v2/sector-01-maintenance-v2-layers-supported-v2-composite-preview.png`: `far → mid-supported-v2 → near` 합성 검수본.
- `source/layers-v2/imagegen-sector-01-maintenance-v2-mid-connected-v3-2026-08-17.png`: 열린 배관 끝을 정상 연결 또는 명확한 배기 캡으로 정리한 ImageGen 원출력.
- `export/layers-v2/sector-01-maintenance-v2-mid-connected-v3.png`: 실제 투명 알파로 정규화한 `connected-v3` 중경 최종 export. 현재 Runtime `backdrop-mid.png`와 같은 파일이다.
- `export/layers-v2/sector-01-maintenance-v2-layers-connected-v3-composite-preview.png`: `far → mid-connected-v3 → near` 합성 검수본.
- `source/normalize_layer_matte.py`: ImageGen의 밝은 무채색 체크 매트를 기존 기준으로 binary alpha로 정규화하고 합성 preview를 만드는 재현 스크립트.

`mid`·`near`는 밝은 저채도 매트(평균 명도 140 이상, 채널 편차 60 이하)만 실제 알파 0으로 정규화했다. 파랑·청록·호박 조명과 어두운 금속 픽셀은 보존했다. 샘플 검사 결과 `far`는 불투명, `mid`와 `near`에는 각각 21,000개·12,900개 이상의 8px 간격 투명 표본이 있다.

바닥과 봉쇄 셔터는 이 분리본에 넣지 않았다. 화면상 바닥은 향후 기존 collision surface와 정확히 맞춘 **terrain skin**으로 별도 제작해야 하며, parallax 장식에 넣으면 보이는 바닥과 실제 충돌이 불일치할 수 있다.

### Supported Mid V2 보정 의도

- 큰 기계를 독립된 장식 덩어리로 띄우지 않고, 가까운 측벽 또는 후면 구조 격자에 하중이 전달되는 연결부를 반드시 보인다.
- 상단 허브는 짧은 벽 브래킷·후면 트러스·케이블, 팬은 우측 덕트 칼라·세로 기둥, 하단 설비는 세로 서비스 레일·배관·케이블 행거로 지지한다.
- 지지 구조는 기계 뒤나 가까운 측벽 방향에 두며 중앙 이동 여백을 가로지르는 넓은 데크·발판·브리지는 만들지 않는다.
- 원본 주요 설비의 위치·크기·팔레트는 유지하며, 새 구조는 모두 중경 비충돌 장식이다.

보정 프롬프트의 핵심은 `기존 설비와 구도를 유지하고, 각 설비를 가까운 측벽·후면 격자에 짧은 브래킷·트러스·덕트·세로 레일·배관으로 체결하되 중앙 이동 공간과 비충돌 가독성을 보존한다`였다. ImageGen이 투명 영역을 밝은 체크 매트로 출력해 최초 분리본과 같은 기준으로 실제 알파 0으로 정규화했다.

### Connected Mid V3 보정 의도

- 중경 배관은 빈 공간에서 이유 없이 잘린 형태로 끝내지 않는다. 가까운 설비 본체·서비스 레일·덕트 manifold로 되물리거나, 연결이 불필요한 배기구는 넓은 볼트 flange와 guard cap으로 의도적인 끝임을 보여준다.
- 상단 허브와 팬은 보조 배관까지 하나의 폐쇄된 설비 계통으로 연결하고, 하단 좌측 제어함의 상부 배기구는 raw cut 대신 flange cap으로 마감한다.
- 하단 좌측 제어함과 우하단 동력함의 하부 배관은 본체 또는 지지 레일로 돌아오는 폐쇄 loop로 정리한다.
- 새 연결은 가는 중경 비충돌 장식으로 제한하며 중앙 Rope 이동 여백을 가로지르는 발판·데크·벽 실루엣을 만들지 않는다.
- 생성 원본의 체크 매트는 `source/normalize_layer_matte.py`로 `min RGB >= 140`, 채널 편차 `<= 60`인 픽셀만 alpha 0으로 바꿨다. `connected-v3`는 `1024×1536` RGBA이며 투명 픽셀 `1,250,476`, 불투명 픽셀 `322,388`이다.

## 고정 제작 의도

- 이미지 맨 아래는 넓은 금속·콘크리트 시작 바닥으로 닫고, 바닥 아래에 추가 Shaft나 낭떠러지를 표시하지 않는다.
- 최하단 봉쇄 셔터와 시작 바닥에서 1-1의 “사고 직후 하층 고립”이 먼저 읽혀야 한다.
- 아래에서 위로 `SERVICE SHAFT → DOUBLE ANCHOR SHAFT → SECURITY CHECK → MAINTENANCE NODE → AUGMENT TEST BAY → COOLING SHAFT → PRESSURE BYPASS → CONTAINMENT GATE`의 환경 밀도와 설비 종류가 이어진다.
- 중앙 50~55%는 Rope 이동과 Gameplay Overlay를 위해 비교적 비우고, 큰 기계·Pipe·Frame은 좌우 가장자리에서 공간을 감싼다.
- Navy·Charcoal을 기본으로 아래는 가장 어둡게, 위로 갈수록 푸른 안개와 조명을 점진적으로 늘린다. Cyan은 보조광, Amber는 드문 경고등으로 제한한다.
- 최상단은 거대한 Containment 구조와 Lower Grid의 약해지는 조명 뒤로 Muted Warm Worker District 전환광만 희미하게 보인다.
- Player·Rope·Anchor·Enemy·Projectile·Wind Arrow·UI·라벨·Route Line은 넣지 않는다.
- 이 이미지는 Collision, Platform 좌표, Camera, Stable Object 또는 Gameplay 상태를 소유하지 않는다.

## V1 생성 프롬프트

```text
Use case: stylized-concept
Asset type: original 2D pixel-art game environment authoring concept, a single sector-wide vertical far-background master for SECTOR 01 MAINTENANCE. This is a brand-new generation from text only. Do not reference, imitate, continue, or preserve any earlier generated image or repository image.

Primary request: depict the entire continuous vertical journey through Sector 01, from the absolute lowest floor at 1-1 to the containment transition at 1-8, as one tall continuous underground industrial shaft.

Composition/framing: very tall portrait composition, side-on orthographic 2D game view, no perspective tilt, no isometric view, no collage and no separate panels. The whole structure must read as one continuous vertical facility. The central 50–55% remains relatively open and low-contrast for future rope traversal and gameplay overlays; enormous machinery and structural framing cluster mainly along the left and right edges.

CRITICAL BOTTOM START: the very bottom edge of the image must show a broad, solid, unmistakable lowest service-floor slab spanning most of the frame. It is the actual starting ground of 1-1, with worn metal plating over heavy concrete, drainage channels, low maintenance curb, and a sealed ground-service shutter embedded into the lowest chamber. The floor must visibly close the bottom of the facility: no abyss, no shaft, no dangling ascent continuing below it. The viewer should immediately understand “the climb starts here on the bottom floor,” not “this is already halfway up.”

Vertical environmental progression, bottom to top:
1. Lowest 1-1 SERVICE SHAFT: grounded service floor, sealed lower access, dense old pipes and inactive maintenance machinery, deep darkness.
2. 1-2 DOUBLE ANCHOR SHAFT: taller lift-bypass void with a visibly stalled industrial lift silhouette and vertical guide rails, still far-background and non-gameplay.
3. 1-3 SECURITY CHECK: restrained scanner frames and security conduits; slightly more ordered industrial structure, no active weapon or enemy.
4. 1-4 MAINTENANCE NODE: a compact diagnostic machinery zone with one large recessed maintenance console silhouette, subtle equal-status firmware indicator lights only.
5. 1-5 AUGMENT TEST BAY: heavy load-test frames, crane rails, cable drums and reinforced structural bays.
6. 1-6 COOLING SHAFT: the largest ventilation void, two monumental fan housings at different heights, condensation, drain pipes, cold mist and a central cooling core.
7. 1-7 PRESSURE BYPASS: a huge vertical pressure network with thick pipes, valve core, gauge clusters and vent housings.
8. Highest 1-8 CONTAINMENT GATE: massive containment lock machinery and blast-shutter silhouette, dying lower-grid lights, with only a very subtle muted warm glimpse of the worker district beyond the upper transition.

Style/medium: high-quality crisp 2D pixel art with intentional hard pixel clusters, clean silhouette design, no painterly blur, no photorealism, no 3D render. Large forms and restrained detail suitable for a far background; lower contrast and lower saturation than gameplay objects.

Lighting/mood: oppressive enclosed vertical corporate city infrastructure. The bottom is darkest and heaviest; illumination increases gradually and monotonically upward. Deep navy and charcoal dominate, cool blue haze creates depth, desaturated cyan is sparse technical fill light, amber warning lights are rare. The highest transition may have a small amount of muted warm residential light, but the facility remains industrial and tense.

Materials/textures: worn steel, stained concrete, ribbed industrial panels, oxidized pipes, cable bundles, condensation, soot, old warning paint, all simplified into readable pixel clusters.

Constraints: one continuous shaft; the bottom floor must be obvious and occupy the lowest visible band; no open space below the bottom floor; no playable floating platforms; no bright landable ledges; no player; no rope; no anchors; no enemies; no sentry turrets; no projectiles; no wind arrows; no UI; no labels; no readable text; no logos; no watermark. Background machinery must not resemble foreground collision platforms. Preserve generous center negative space. Entirely original composition generated from this text only.
```

## V2 생성 프롬프트

```text
Use case: stylized-concept
Asset type: brand-new 2D pixel-art game environment authoring concept, one tall sector-wide vertical far-background master for SECTOR 01 MAINTENANCE.

Input images: Image 1 is the authoritative style, darkness, palette, pixel rendering, depth, and industrial-density reference from the Sector 01 scenario document. Match Image 1 as closely as possible in overall visual language: near-black navy and charcoal foreground framing, very low-key illumination, subdued desaturated blue haze only in the distant center, hard chunky pixel clusters, sparse tiny orange maintenance lights, massive pipe and fan silhouettes, and restrained cyan machinery glows. Use Image 1 for mood and style only; do not copy its exact geometry or turn its landscape composition into a crop.

Primary request: create a new very tall portrait composition showing the complete continuous Sector 01 climb from 1-1 through 1-8 inside one enormous enclosed underground maintenance facility. This must be a fresh composition. Do not use or preserve the previously generated bright vertical image or the previous 1-1 runtime background.

CRITICAL DARKNESS MATCH:
- Keep roughly 75–85% of the image in deep shadow, close to Image 1.
- The left and right structural masses should be near-black navy/charcoal with only faint edge separation.
- The central shaft may contain dim, desaturated blue atmospheric depth, but never a bright blue glow.
- Orange lights must be tiny, rare point lights, not broad illumination.
- Cyan lights must be dimmer and less saturated than future gameplay Rope and Anchor colors.
- No bright amber sky, no sunrise, no daylight, no large warm glow, no high-key upper area.
- The top remains enclosed and dark. Behind the final containment transition, allow only an extremely faint muted warm hint, not an open bright exterior.

Composition/framing: 2:3 portrait, side-on orthographic 2D gameplay environment, no perspective tilt, no isometric view, no collage or panels. One continuous vertical facility. Keep the center 50–55% relatively open and low-detail for future rope traversal and gameplay overlays. Enormous pipes, steel frames, ducts, vents and cable bundles frame the left and right edges. Industrial silhouettes become subtly more ordered and security-heavy toward the top, not brighter.

CRITICAL BOTTOM START: the very bottom edge must show a broad, solid, unmistakable lowest service floor spanning most of the frame, using the same dark pixel-art material language as Image 1. Include worn metal plating over heavy concrete, drainage channels, a low maintenance curb, and a sealed ground-service shutter embedded in the lowest chamber. The floor visibly closes the bottom: no abyss, shaft, dangling structures, or implied playable area below it. The image must clearly begin on the floor at 1-1, not in the middle of an ascent.

Bottom-to-top Sector progression:
1. Lowest 1-1 SERVICE SHAFT: grounded start floor, sealed lower access, dense dormant pipework and inactive machinery.
2. 1-2 DOUBLE ANCHOR SHAFT: dark stalled lift silhouette, guide rails and deeper vertical void.
3. 1-3 SECURITY CHECK: restrained scanner frames and security conduit architecture, no active enemy.
4. 1-4 MAINTENANCE NODE: compact recessed diagnostic machinery zone with three equally dim firmware indicators.
5. 1-5 AUGMENT TEST BAY: heavy load-test frames, crane rail, cable drum and reinforced structural bays.
6. 1-6 COOLING SHAFT: largest ventilation void, two monumental fan housings at different heights, condensation and a central cooling core.
7. 1-7 PRESSURE BYPASS: thick vertical pressure pipes, huge valve core, dark gauges and vent housings.
8. Highest 1-8 CONTAINMENT GATE: massive lock machinery and closed blast-shutter silhouette, dying lower-grid lights and only the faintest muted warm trace beyond the transition.

Style/medium: match Image 1's crisp dark pixel art as closely as possible: hard edges, deliberate blocky clusters, simplified industrial forms, no painterly blur, no smooth concept-art brushwork, no photorealism, no 3D render. Far-background contrast and detail remain lower than future gameplay objects.

Constraints: the bottom floor is mandatory and visible; one continuous shaft; no bright landable ledges; no prominent floating gameplay platforms; no player; no rope; no anchors; no enemies; no sentry turrets; no projectiles; no wind arrows; no UI; no labels; no readable text; no logos; no watermark. Background structures must remain lower contrast than gameplay collision. Preserve ample central negative space. Exact geometry is original, but visual darkness, palette, pixel scale, industrial silhouette language, fog depth and tiny light distribution should closely match Image 1.
```

## V3 명도 보정 프롬프트

```text
Use case: precise-object-edit
Asset type: 2D pixel-art game environment authoring concept, Sector 01 vertical far-background master.

Input images:
- Image 1 is the edit target. Preserve its complete tall composition, exact geometry, bottom floor, sealed ground-service shutter, machinery placement, vertical shaft structure, aspect ratio, pixel-art forms, and all existing objects.
- Image 2 is the authoritative Sector 01 scenario-document reference for darkness, shadow separation, navy/charcoal palette, central blue haze brightness, sparse orange point lights, and pixel contrast.

Primary request: change only the tonal balance and low-key lighting of Image 1 so it matches Image 2 more closely. Image 1 is currently too crushed and darker than Image 2. Gently lift the darkest blue-black midtones and the central desaturated blue haze enough to reveal layered pipe and structural silhouettes at approximately the same perceived brightness and depth separation as Image 2. Keep it dark, enclosed, moody, and industrial.

Required tonal adjustment:
- Raise shadow detail and midtone visibility modestly, especially in the central shaft and distant layers.
- Preserve near-black left and right foreground masses, but give their major pipe and frame edges the subtle separation visible in Image 2.
- Keep the central haze dim desaturated navy-blue, not glowing cyan.
- Keep orange lights tiny and sparse.
- Keep cyan lights dim and subordinate to gameplay colors.
- Do not introduce a bright warm top, daylight, sunrise, open sky, bloom, or broad amber illumination.
- The upper containment area remains enclosed and dark, with only the same tiny muted warm hint already present.

Hard invariants: change only exposure, shadow separation, and color grading. Do not crop, rearrange, add, remove, resize, or redesign any structure. Preserve the broad lowest service floor at the absolute bottom edge and the sealed shutter exactly. Preserve the fact that there is no abyss or shaft below the bottom floor. Preserve one continuous vertical facility and the central negative space. No player, rope, anchor, enemy, turret, projectile, wind arrow, UI, labels, readable text, logo, or watermark. Keep crisp hard-edged pixel art; no blur, painterly rendering, photorealism, or 3D look.
```

## 생성 후 검수

- [x] 최하단 바닥과 봉쇄 셔터가 이미지 맨 아래에서 명확히 보인다.
- [x] 바닥 아래에 추가 상승 구간이나 낭떠러지가 없다.
- [x] 하층에서 상층까지 하나의 연속 수직 시설로 읽힌다.
- [x] Lift, Node, Test Frame, Cooling Fan, Pressure Network, Containment 구조가 아래→위 흐름으로 구분된다.
- [x] 중앙 이동 공간이 좌우 구조물보다 낮은 밀도로 유지된다.
- [x] Player·Rope·Anchor·Enemy·UI·라벨·경로선이 없다.
- [x] V1은 기존 1-1 생성 이미지와 문서 PNG를 입력하지 않았다.
- [x] V2는 이전 생성 이미지를 입력하지 않고 Sector 공용 문서 이미지만 Style Reference로 사용했다.
- [x] V2는 화면 대부분을 Near-black Navy·Charcoal로 유지하고 중앙 Blue Haze와 Orange·Cyan 점광원을 낮은 밝기로 제한한다.
- [x] V3는 V2의 구조·최하단 바닥을 유지하고 명도만 문서 레퍼런스에 가깝게 보정했다.
- [x] 8px 간격 표본 평균 명도는 문서 레퍼런스 `24.54`, V3 `26.96`이다. 밝은 V1 `45.61`, 과도하게 어두운 V2 `13.81`보다 기준에 가깝다.
- [x] 사용자 아트 방향 승인: V2 깊이 분리본과 지지 구조 보정본을 Sector 01 Runtime 후보로 사용
- [x] 사용자 보정 방향: 중경 배관은 설비에 연결하거나 의도적인 파손·캡 마감으로 읽혀야 하며 raw cut처럼 남기지 않음
- [x] Sector 진행률 기준 `far/mid/near` Runtime manifest 정규화: `assets/runtime/environments/sector-01-maintenance/`
- [x] `mid-connected-v3` 데스크톱·`390×844` 모바일 Runtime 검수

## 후속 연결 범위

`1024×1536` 원본은 Runtime Collision이나 Gameplay Geometry로 사용하지 않는다. 현재 package는 `far/mid/near`를 서로 다른 atlas로 정규화하고 연속 World의 Sector 01 진행률로 세 레이어를 각기 다른 낮은 parallax로 스크롤한다. 실제 발판·벽·Gate·Portal trigger와 상호작용 object는 기존 Runtime 좌표를 그대로 사용하며 이미지에 구워 넣지 않는다.
