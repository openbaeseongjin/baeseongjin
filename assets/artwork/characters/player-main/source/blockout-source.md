# 이전 blockout 대체 기록

이 파일이 설명하던 repository mock 기반 `idle`·`run` blockout은 사용자가 제공한 최종 캐릭터 원본으로 대체되었다.

현재 기준 자료와 변환기는 다음과 같다.

- 최종 외형 원본: `pixellab-ready-character.png`
- ImageGen 포즈 원본: `imagegen-master-sheet-rgb.png`
- 알파 제거 중간 결과: `imagegen-master-sheet-transparent.png`
- 정규화 스크립트: `normalize_generated_sheet.py`

`export/idle-run-blockout.png`과 `preview/idle-run-preview.png`도 이제 최종 캐릭터 프레임에서 다시 생성된다. 기존 mock 픽셀은 결과물에 남아 있지 않다.
