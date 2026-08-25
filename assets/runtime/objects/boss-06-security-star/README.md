# Boss06 Security Star Runtime Asset

- Category: `objects`
- Asset ID: `boss-06-security-star`
- Boss object kind: `boss-security-star`
- Atlas: `security-star.png`, `832×64 RGBA`
- Frame: `64×64`, 13개
- Anchor/output: center, `64×64`
- 상태: `idle` 3, `telegraph` 4, `active` 2, `ending` 4

`WorldObjectSpriteAssetCatalog`가 실제 atlas 크기를 검사하고 Boss Stage resource preparation에서 Gate·Shuttle과 함께 준비한다. Sprite 준비 전이나 실패 시 기둥이 아닌 작은 Canvas star로 독립 fallback한다.

두 별은 selected LOW/HIGH beam bounds의 좌우 끝과 같은 presentation 좌표를 사용한다. `telegraph`는 Security Command, `active`는 실제 beam active, `ending`은 beam gap과 active→idle renderer-local 전환을 따른다. gameplay damage·bounds·timing·collision·Rope·network state는 변경하지 않는다.
