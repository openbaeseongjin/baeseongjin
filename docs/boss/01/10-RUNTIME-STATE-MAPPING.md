# Runtime state → World presentation mapping

| Boss Runtime | World |
|---|---|
| inactive | HeadHouse normal / Boss trigger not committed |
| active + phase 1 + closed | Clamp housing closed |
| active + phase 1 + exposed | Clamp service cover open |
| phase 2 + closed | Fan bearing guard closed |
| phase 2 + exposed | Bearing inspection cover open |
| phase 3 + closed | Lock pin housing retracted/guarded |
| phase 3 + exposed | Lock pin assembly lowered/exposed |
| collapseActive | Upper Gate Crown descends using collapseDistance |
| completed | all Boss threats off + C-01 offline + route unlock |

## 중요
`shieldState`는 내부 코드 명칭이다.
화면에 에너지 Shield를 반드시 만들라는 뜻이 아니다.

이 Boss에서는 mechanical cover/open state로 표현한다.
