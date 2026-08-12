# Runtime graphics assets

게임이 직접 참조하는 검증된 그래픽 package를 자산 category와 안정적인 asset ID로 관리한다.

```text
assets/runtime/<category>/<asset-id>/
```

현재 category는 `characters`, `environments`, `objects`, `effects`, `ui`다. 코드에서는 `RuntimeAssetCatalog.js`의 `runtimeAssetUrl(category, assetId, filePath)`로 package 파일 URL을 만들며 제작 도구나 임시 export 경로를 직접 참조하지 않는다.

그래픽 담당자의 원본과 납품은 [`assets/artwork/`](../artwork/)에 둔다. 담당 개발자가 자산별 manifest 계약과 validator를 통과시킨 결과만 이 경로에 연결한다. category마다 데이터 의미가 다르므로 하나의 거대 manifest를 공유하지 않는다.
