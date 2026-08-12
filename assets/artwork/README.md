# Graphics artwork staging

모든 그래픽 리소스의 통합 제작·인계 공간이다. 게임은 이 경로를 직접 읽지 않으며 담당 개발자가 검증된 `export/` 결과를 자산별 runtime 경로에 연결한다.

`<category>/<asset-id>/` 아래에 작업 설명 `README.md`, 제작 원본 `source/`, PNG 결과 `export/`, 검토용 `preview/`를 둔다. category는 `characters`, `environments`, `objects`, `effects`, `ui`를 사용하며 전체 기준은 [`docs/graphics-asset-guide.md`](../../docs/graphics-asset-guide.md)를 따른다.
