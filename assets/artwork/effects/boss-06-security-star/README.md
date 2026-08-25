# Boss06 Security Star

- Asset ID: `boss-06-security-star`
- Category: 비충돌 월드 장식 + Security Beam VFX
- 상태: `RUNTIME CONSUMED · NO DEDICATED EFFECT VALIDATOR`
- Source/tool: Pillow direct-pixel script와 `32×32 RGBA` logical frame
- Runtime export: `64×64` frame 13개의 가로 atlas `832×64`
- World output: `64×64`, center anchor, 좌우 별은 같은 atlas를 mirror
- License: 저장소 내부 직접 제작물

## 시각 계약

Boss06의 레이저 양 끝에는 벽·기둥·하우징·케이블·원형 고리 없이 떠 있는 별 두 개만 표시한다. 별은 presentation object이며 collision, Rope 부착, projectile occlusion, damage와 network authority를 추가하지 않는다.

| 상태        | 프레임 | 표현                                              |
| ----------- | -----: | ------------------------------------------------- |
| `idle`      | 3 loop | 작은 ivory/aged-amber core가 낮게 호흡            |
| `telegraph` | 4 once | amber ray가 커지고 안쪽 square mote가 core로 수렴 |
| `active`    | 2 loop | 이 상태에서만 red core와 긴 ray가 강하게 점멸     |
| `ending`    | 4 once | amber ray가 접히고 square mote가 바깥으로 흩어짐  |

상태는 색만이 아니라 core 크기, ray 길이와 mote 이동 방향으로 구분한다. Cyan 원·조준 고리·갈고리처럼 Rope anchor로 오해할 형태는 사용하지 않는다.

## 경로

- 재현 스크립트: `source/build_security_star_atlas.py`
- logical frame: `source/logical-32x32/frame-01.png` … `frame-13.png`
- 2× frame: `export/frames/frame-01.png` … `frame-13.png`
- Runtime atlas 원본: `export/security-star.png`
- 검토본: `preview/security-star.gif`, `preview/security-star-review.png`

Runtime은 `assets/runtime/objects/boss-06-security-star/`의 byte-identical atlas를 사용한다. 별 위치와 상태는 기존 Boss Security Beam presentation이 소유하고, PNG는 판정 좌표나 수명을 소유하지 않는다.
