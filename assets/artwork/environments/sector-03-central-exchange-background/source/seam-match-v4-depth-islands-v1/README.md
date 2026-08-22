# Sector 03 seam-match V4 depth islands V1

- Asset ID: `sector-03-central-exchange-background`
- Category: environment authoring / parallax extraction candidate
- Canvas: `1024 x 1536`
- Source: user-supplied opaque RGB PNG
- Tool: OpenAI built-in ImageGen for depth and inpaint inputs; Python/Pillow/NumPy/OpenCV for tool-neutral PNG normalization and connected-component extraction
- License/provenance: user-supplied project image plus project-owned AI-generated derivative inputs; external redistribution rights not verified
- Runtime state: Issue #798 integrated at `assets/runtime/environments/sector-03-central-exchange/`
- Non-scope: collision, terrain, camera, gameplay, enemies, triggers, and network authority

## Extraction contract

- Depth convention: white near, black far
- Threshold: `227`
- Minimum 8-connected component area: `500 px`
- Expected near components: exactly two, one touching each horizontal canvas edge
- Parallax review displacement: left `+8 px`, right `-8 px`
- Fixed plate: generated inpaint is consumed only inside the union of the two masks; every fixed pixel outside the masks remains identical to the master

## Outputs

- `../../export/seam-match-v4-depth-islands-v1/sector-03-central-exchange-background.png`
- `../../export/seam-match-v4-depth-islands-v1/sector-03-central-exchange-depth-map.png`
- `../../export/seam-match-v4-depth-islands-v1/backdrop-fixed.png`
- `../../export/seam-match-v4-depth-islands-v1/parallax-island-left.png`
- `../../export/seam-match-v4-depth-islands-v1/parallax-island-right.png`
- `../../preview/seam-match-v4-depth-islands-v1/sector-03-central-exchange-master-depth-pair.png`
- `../../preview/seam-match-v4-depth-islands-v1/sector-03-central-exchange-neutral.png`
- `../../preview/seam-match-v4-depth-islands-v1/sector-03-central-exchange-shifted.png`
- `../../preview/seam-match-v4-depth-islands-v1/sector-03-central-exchange-layer-contact-sheet.png`

## Observed validation

- Common canvas: all five export PNGs are `1024 x 1536`
- Fixed/background opacity: RGB, fully opaque
- Depth normalization: 8-bit grayscale `L`
- 8-connected components at threshold `227`: exactly `2`
- Left island: `182,373 px` (`11.5950%`), bounding box `(0, 0, 271, 1536)`
- Right island: `175,831 px` (`11.1790%`), bounding box `(764, 0, 260, 1536)`
- Neutral recomposition maximum RGB difference from master: `0`
- Fixed pixels outside the union mask maximum RGB difference from master: `0`
- Shift review: left `+8 px`, right `-8 px`; fixed plate remains visible beneath both displaced cutouts

### SHA-256

| File | SHA-256 |
|---|---|
| `sector-03-central-exchange-background.png` | `50C4D8D82274CABD0E7AB8E2DF8F13445B1366E25980CB9C0B735A2FD033E770` |
| `sector-03-central-exchange-depth-map.png` | `3225BBABC1D67E05F4044D6C207FFE3B6EED22B9EC342DF92D7C56D6332FEC29` |
| `backdrop-fixed.png` | `7E88BAE97BA48AC97561B895DD45561C292395F628F113A956C8C9F4B76153BF` |
| `parallax-island-left.png` | `74417833133BD9AEB60420B37A8C0E37E9B007377E93CBBB459DC952012DE73E` |
| `parallax-island-right.png` | `BCAB7F868521EE0765788A7BB7DDABC4B93592031346748255D7BC64CC5F543B` |
