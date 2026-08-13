# SECTOR 01-1 — SERVICE SHAFT

수직도시 그래플 액션 게임의 **오프닝 튜토리얼 레벨(1-1)** 설계 문서.

## 문서 보기

- 로컬: `index.html`을 브라우저로 열기
- GitHub Pages: Settings → Pages → Source를 `main / (root)`로 설정하면
  `https://<user>.github.io/<repo>/` 에서 바로 열림

## 폴더 구조

```
.
├── index.html                        # 레벨 디자인 문서 (완전 단일 파일, 이미지 내장)
├── README.md
└── images/                           # 원본 레퍼런스 (고해상도 PNG)
    ├── 01_gameplay_reference.png     # Gameplay Visual Reference
    └── 02_level_layout.png           # Annotated Level Layout
```

> `index.html`은 레퍼런스 이미지를 **base64로 내장**하고 있어 파일 하나만 열어도 그림까지 전부 보입니다.
> `images/` 폴더는 아트 작업용 원본 고해상도 PNG 보관용입니다.

## 요약

| 항목 | 값 |
|---|---|
| 목표 플레이 시간 | 1:30 – 2:00 |
| 진행 방향 | 아래 → 위 (수직) |
| Anchor | 2 (A: Rope 학습 / B: Swing 상승 학습) |
| 적 | Sentry Turret ×1 |
| 종료 조건 | Service Terminal → Gate Override → SERVICE SHAFT 02 |

**Core Loop**: 이동 → Anchor 발견 → Rope Attach → Swing → Release → 더 높은 위치에 착지

## 설계 원칙 (요약)

1. 시스템을 설명하지 않고 **상승 루프만** 체득시킨다.
2. 모든 좌우 이동의 목적은 결국 **높이를 얻는 것**이다.
3. 색은 장식이 아니라 **Gameplay Information** — Cyan은 Rope/Anchor 전용, Red는 위험 전용.
4. 적은 HP를 깎는 장치가 아니라 **Rope 경로를 바꾸는 장치**다.
5. 카메라는 캐릭터를 크게 보여주는 것보다 **다음 Rope 판단을 가능하게** 하는 것이 우선.

---

REV 1.0 — Internal Level Design Doc
