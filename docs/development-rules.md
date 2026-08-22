# 개발 규칙

이 문서는 Baeseongjin 프로젝트의 구현·검증·문서·Git 작업 기준이다. 게임별 세부 명세보다 상위에 있는 개발 계약이며, 코드와 문서가 충돌하면 현재 동작을 검증한 뒤 이 문서를 함께 현행화한다.

## 1. 기본 원칙

1. **동작을 먼저 증명한다.** 감으로 수치를 고치지 않고 재현 가능한 시뮬레이션, validator 또는 실제 사용자 경로로 확인한다.
2. **한 책임은 한 소유자에게 둔다.** 같은 규칙을 여러 모듈이 해석하거나 보정하지 않는다.
3. **작은 변경을 끝까지 검증한다.** 넓은 기능을 한 번에 넣기보다 실행 가능한 수직 단위로 나눈다.
4. **기존 변경을 보존한다.** 관련 없는 사용자 작업을 되돌리거나 덮어쓰지 않는다.
5. **문서와 검증을 구현의 일부로 본다.** 사용자 동작이나 공개 계약이 바뀌면 같은 작업에서 갱신한다.
6. **의존성보다 기존 기반을 우선한다.** 새 패키지는 명시적인 필요와 승인 없이는 추가하지 않는다.
7. **임시 완성을 금지한다.** 실행되지 않는 placeholder, 생략 부호, 설명 없는 TODO를 결과물로 남기지 않는다.
8. **반복 수정은 구조 검증 신호다.** 같은 기능에서 유사 수정이 계속되거나 한 수정 뒤 연관 버그가 이어지면 추가 증상 패치를 멈추고 정체성·상태 소유권·capability·권한 경계를 검증한다.
9. **이동 가능성은 합성 충돌로 검증한다.** 개별 발판이 맞아 보여도 Stage 경계의 source/target deck, seam, city wing을 모두 합친 수평 구간이 전체 폭을 막을 수 있다. 같은 Sector 안의 양방향 이동 계약은 경계마다 Player가 통과할 수 있는 하강 개구부를 수치로 검사한다. 렌더되는 단단한 수평 플랫폼은 별도 차단 장치로 명시·표현되지 않는 한 Rope 부착 가능해야 하며 `oneWay`와 `grappleable`을 서로 독립적인 우연 값으로 두지 않는다.

## 2. 작업 시작과 종료

### 시작 전

- `git status --short --branch`로 브랜치와 기존 변경을 확인한다.
- `package.json`의 스크립트와 관련 문서를 먼저 확인한다.
- 수정 대상의 import, export, caller와 기준 문서를 함께 조사한다.
- 현재 제품·구현 결정은 주제별 기준 문서에서, 아직 승격되지 않은 대화 결정은 `SESSION-HANDOFF.md`에서, 전체 이력은 `docs/decision-history.md`에서 확인한다.
- 변경의 완료 기준과 하지 않을 일을 짧게 고정한다.

### 종료 전

- 관련 validator와 문법 검사를 실행하고 실제 사용자 경로를 확인한다.
- 사용자 화면 변경은 실제 브라우저에서 확인한다.
- `git diff --check`를 통과한다.
- 코드, README, 개발 규칙, 설계 문서가 같은 동작을 설명하는지 확인한다.
- 알려진 위험과 검증하지 못한 항목을 숨기지 않는다.

### 메인 개발 대화와 핸드오프 프롬프트

- 현재 대화에서 받은 일반 개발 요청은 현재 대화에서 직접 수행한다. 원격 프롬프트가 유용할 수 있다는 에이전트 판단만으로 핸드오프 작성 흐름으로 전환하지 않는다.
- `handoff-prompt-writer`는 사용자가 `$handoff-prompt-writer`를 명시하고 다른 새 대화에 넘길 개발 프롬프트를 요청할 때만 실행한다. 설치 메타데이터의 `policy.allow_implicit_invocation`은 `false`로 유지한다.
- 구현·수정·조사·검토·계획·정리·위임·병렬 작업이라는 표현만으로는 활성화하지 않는다. 스킬 자체를 설명·설정·문제 해결·편집하려는 요청도 운영 호출이 아니다.
- 음성 사례를 검증할 때는 핸드오프 문서와 `.handoffs/` 변경이 생기지 않는지 확인한다. 명시 호출 사례에서만 저장된 마스터 프롬프트와 복사용 한 줄을 생성한다.

### 효율 우선 실행과 검증 예산

개발 작업의 시간 낭비를 줄이는 우선순위는 `불필요한 자동 테스트 금지 → 독립 검증 병렬화 → shared checkout 대기 제거 → 범위 팽창 억제 → 실행기 라우팅 조정`이다. 자동 테스트가 제품 요구를 대신하지 않게 하고 실제 실행·validator·문법·형식 증거를 사용한다.

- 시작 전에 `scope budget`을 적는다. 최소 항목은 소유 경로 또는 경로 그룹, 허용 변경 범주(`구현`, `기준 문서`, `운영`, 사용자가 명시한 경우의 `테스트`), 직접 갱신할 기준 문서, 명시적 비범위다.
- 발견한 문제가 새 경로 그룹·변경 범주·공개 계약을 요구하면 조용히 범위를 넓히지 않는다. 현재 결과에 필수면 범위와 완료 조건을 명시적으로 갱신하고, 독립 정리라면 후속 작업으로 분리한다. 런타임 수정과 저장소 전체 stale 문서 청소를 관성적으로 한 작업에 합치지 않는다.
- 검증은 `command 또는 수동 기준`, `소유자`, `base SHA`, `diff fingerprint`, `결과`, `관련 환경`, `재실행 조건`을 기록한 ledger로 관리한다. 커밋된 candidate는 tree SHA를 fingerprint로 쓰고, 미커밋 candidate는 base SHA·`git diff --binary HEAD`·소유한 untracked 파일 내용의 hash를 사용한다. `diff --stat`이나 수정 시각만 fingerprint로 쓰지 않는다. base·관련 diff·설정·의존 환경이 같으면 fresh PASS를 재사용한다.
- 구현 반복 중에는 가장 작은 관련 validator·문법 검사·재현 명령을 실행한다. 자동 테스트는 사용자가 해당 작업에서 명시한 경우에만 실행한다.
- 검증 명령이 실패하면 가장 좁은 입력으로 재현·수리하고 관련 입력이 바뀐 항목만 다시 실행한다.
- 서로 독립인 구현·문서·시각 검증 lane은 의존 그래프를 먼저 만든 뒤 준비된 lane을 한 wave에서 실행한다. 같은 worktree에서 writer가 있는 동안 read-only verifier가 변하는 diff를 읽게 하지 말고, 쓰기 완료와 fingerprint 고정 뒤 독립 verifier를 함께 실행한다.
- 독립 작업은 별도 Git worktree를 기본으로 한다. worktree는 기존 Git object database를 공유하고 작업 파일·branch·index만 분리한다. shared checkout 직렬화는 worktree를 만들 수 없거나 실제 같은 hunk·public contract에 순서 의존성이 있을 때만 사용하며 대기 이유를 기록한다.
- 자동 구현기는 고정 설계면 빠른 direct 경로를 우선하고, 미해결 구현 대안이 있을 때만 planned 경로를 쓴다. scope와 wall-time budget을 넘으면 부분 diff를 보존하고 좁은 수리로 전환하며 같은 broad pass를 반복하지 않는다. 구체 실행 계약은 해당 Skill을 단일 기준으로 사용한다.

## 3. 시뮬레이션 기반 구현 검증

물리, 절차 생성, 전투, 보상처럼 시간과 수치가 개입하는 기능은 UI보다 먼저 독립 시뮬레이션으로 검증한다.

### 원칙

- 동일 초기 상태, 시드, 입력은 허용 오차 안에서 같은 결과를 내야 한다.
- 생성 이벤트로 재생하는 예측 객체의 위치·속도 적분식은 서버와 클라이언트에 복사하지 않는다. 하나의 환경 독립 공용 모듈을 양쪽에서 호출하고, 같은 초기 상태를 여러 tick 진행한 뒤 위치·속도가 일치하는 재현 명령 또는 진단을 남긴다.
- 시뮬레이션은 렌더링이나 DOM 없이 실행 가능해야 한다.
- 한 번의 성공 사례보다 정상·경계·실패 시나리오를 함께 검증한다.
- 결과는 상태, 사건, 수치로 측정하고 화면 느낌만으로 판정하지 않는다.
- 멀티 동기화 버그는 `health`, 로프 부착·비활성 시간, 투사체 ID·개수, pending claim과 서버·동료 상태의 수렴값을 직접 단언한다. 스크린샷과 VFX는 시뮬레이션 정합성의 합격 근거로 사용하지 않는다.
- 클라이언트 연출은 `공용 월드 효과`와 `개인 상태 효과`를 명시적으로 분류한다. 공용 효과는 모든 클라이언트가 같은 판정 사건에서 로컬 생성하고, 개인 효과는 사건의 `playerId`·`sourcePlayerId`·`targetId`와 현재 viewer ID를 capability가 비교해 당사자에게만 생성한다. 사망 animation과 개인 부활 문구를 같은 가시성으로 묶지 않으며, `player-respawned`의 상태 문구는 causal 중복 제거와 표시 수명을 각 클라이언트가 소유한다. 앱이나 Canvas 렌더러에 사건 종류별 viewer 분기를 추가하지 않는다.
- NaN, Infinity, 속도 폭주, 무한 루프는 즉시 실패로 처리하고 원인 직전 상태를 보존한다.

### 로프·월드 적용 기준

- 게임 상태는 1/120초 고정 스텝에서만 변경한다.
- 입력은 렌더 프레임마다 snapshot으로 동결한다.
- 로프 장력, 충돌 보정, 속도 제한의 적용 순서를 고정한다.
- 절차 생성은 같은 시드의 동일 결과와 다른 시드의 변화를 함께 검사한다.
- 지형 생성 성공은 모양이 생성됐다는 뜻이 아니라 실제 이동 가능한 경로가 있다는 뜻이다.

### 기본 수치와 강화 수치 제안

- 새 gameplay 기본값·강화값을 제안할 때 정수는 5, 소수 첫째 자리는 0.5, 소수 둘째 자리는 0.05 단위를 기본으로 한다. 사용자가 명시한 값과 정확한 계산 파생값은 이 반올림 규칙보다 우선한다.
- 기존 기본 수치를 강화하는 효과는 가능한 한 고정 결과값이 아니라 percentage multiplier 또는 reduction으로 정의한다. 예: 사거리 `+20%`, cooldown `-50%`.
- 기준 문서에는 `기본값 → 적용 비율 → 현재 파생값`을 함께 남긴다. 기본값을 바꿀 때 카드별 고정값을 다시 맞추는 구조를 만들지 않는다.

## 4. 객체와 책임 설계

새 상태나 행동은 먼저 작은 순수 함수로 구현할 수 있는지 확인하고, 객체가 필요할 때 아래 순서로 판단한다. 같은 책임을 상속·조합·믹스인에 중복해서 두지 않는다.

### Is-A: 정체성

- 클래스는 정체성, 상태 불변식, 수명주기가 함께 있을 때 사용한다.
- 상속은 하위 클래스가 상위 클래스의 공개 계약을 예외 없이 만족할 때만 사용한다.
- 부모의 내부 필드나 호출 순서를 알아야 동작하는 하위 클래스는 만들지 않는다.
- 코드 몇 줄을 재사용하려는 목적의 상속은 금지하고 조합이나 순수 함수로 바꾼다.
- 기반 클래스는 최소한의 안정된 계약만 제공한다. 기능별 빈 hook을 미리 늘어놓지 않는다.

### Has-A: 소유 상태

- 독립된 규칙, 검증, 수명주기를 가진 상태는 별도 객체로 조합한다.
- 소유자는 구성 객체의 생성·주입·해제를 책임지고 공개 API로만 사용한다.
- 구성 객체의 내부 필드를 바깥에서 직접 고치지 않는다.
- 공유 가능한 서비스는 생성자나 팩토리에서 주입한다. 숨은 singleton이나 전역 조회로 가져오지 않는다.
- 교체 가능성이 아니라 책임 경계를 만들기 위해 조합한다. 의미 없는 한 줄 wrapper는 만들지 않는다.

### Can-Do: 믹스인과 독립 능력

- 믹스인은 여러 클래스가 선택적으로 공유하는 작고 직교적인 능력에만 사용한다.
- 표준 형태는 `Base => class extends Base { ... }`이며 인스턴스 생성 뒤 prototype을 변경하지 않는다.
- 믹스인은 구체 클래스 이름, 월드 진행, UI, 전역 상태를 알지 않는다.
- 필요한 상태와 공개 메서드는 최소화하고, 생성자 인수는 `...args`로 부모에게 전달한다.
- 적용 순서에 따라 결과가 달라지거나 같은 메서드를 덮어쓰는 믹스인은 금지한다. 충돌하면 조합 객체로 승격한다.
- 능력에 독립 상태·검증·해제 과정이 커지면 믹스인이 아니라 Has-A 컴포넌트로 바꾼다.

```js
const RopeAttachable = (Base) =>
    class extends Base {
        attachRope(anchor) {
            this.ropeAnchor = { ...anchor };
        }

        detachRope() {
            this.ropeAnchor = null;
        }
    };

class Player extends RopeAttachable(GameObject) {}
```

위 예시처럼 믹스인은 능력 자체만 표현한다. 부착 가능 거리, 장력, 실패 처리 같은 게임 규칙은 이를 소유한 게임 시스템이 결정한다.

### 선택 기준

1. 입력만으로 결과가 나오는 계산인가? → 순수 함수
2. 객체의 정체성인가? → 클래스와 필요한 경우 Is-A
3. 독립된 상태와 수명주기인가? → Has-A 컴포넌트
4. 여러 정체성에 붙는 작고 무상태에 가까운 능력인가? → Can-Do 믹스인
5. 두 믹스인이 서로의 내부를 알아야 하는가? → 믹스인을 중단하고 명시적인 조합 객체로 재설계

### 고정 대응표와 동적 membership

- enum·state·definition에서 값·resolver·구체 구현을 고르는 고정 대응표는 `Object.freeze({ [key]: value })`와 property lookup으로 소유한다.
- 고정 key를 `Map`·`Set`으로 감싸지 않는다. `Map`·`Set`은 실행 중 key가 추가·삭제되는 객체 수명주기, contact, dedupe와 membership 상태에만 사용한다.
- 일회성 중복 검사와 module-load catalog index는 객체 lookup을 사용한다. 동적 상태가 아니라는 근거가 없으면 편의상 `Map`·`Set`을 선택하지 않는다.

### 구조적 버그의 책임 경계 복구

같은 기능이나 책임 경계에서 유사 결함이 재발하거나, 한 수정 뒤 같은 데이터·사건 경로의 연관 결함이 이어지면 이를 개별 버그의 우연한 연속이 아니라 **근본 구조 검증 트리거**로 취급한다. 다음 국소 패치 전에 현재 구조가 아래 계약을 지키는지 확인하고, 어긋난 경계가 원인이면 그 경계를 먼저 복구한다. 이 기준은 투사체뿐 아니라 플레이어, 로프, 적, 보상과 앞으로 추가할 모든 게임 객체에 적용한다.

1. **상태 변화 원인을 정한다.** 직접 사용자 입력에 반응하면 `InputDrivenObject`, 입력 없이 월드 시간과 규칙으로 진행되면 `SimulationDrivenObject`다. 이는 서버나 클라이언트 중 어디에서 실행되는지를 뜻하지 않는다.
2. **수명주기 소유자를 정한다.** 준비·진행·대기·승인·거부·소비·재시도처럼 서로 제약하는 상태는 해당 객체 또는 Has-A 컴포넌트가 공개 명령으로 전이한다. 예측기나 receipt 처리기가 외부 boolean을 직접 풀어 객체를 되살리지 않는다.
3. **행동을 capability로 정한다.** 같은 월드 단계에서 종류별 행동이 다르면 같은 capability 계약을 구현하는 서로 다른 Can-Do 믹스인을 조합한다. 객체 종류 선택은 팩토리에서 끝내고 스케줄러의 `if (type)` 분기로 퍼뜨리지 않는다.
4. **조정 계층을 얇게 유지한다.** 월드 스케줄러는 단계와 context, 저장소는 등록과 ID 대응, 전송 계층은 claim·receipt·snapshot 전달만 담당한다. 이 계층이 객체 종류별 운동·충돌·수명·거부 정책을 해석하면 책임이 잘못 올라온 것이다.
5. **실행 권한과 도메인 로직을 분리한다.** 플레이어 당사자 사건은 소유자 또는 피해 클라이언트가 먼저 적용하고, 중립 월드는 서버가 진행한다. 양쪽은 같은 객체·컴포넌트·capability의 공용 규칙을 사용하며 서버·클라이언트별 복제 구현을 만들지 않는다. 서버는 소유 클라이언트 상태·사건의 검증·중복 제거·복제 공유를 담당하고, 정상 승인 중인 소유자 상태를 스냅샷으로 다시 쓰지 않는다.
6. **사건과 수렴을 모두 검증한다.** 로컬 사건이 한 번만 즉시 발생하는지, 승인·거부 뒤 수명 상태가 유효한지, 같은 원인의 다른 객체 종류에서도 중앙 타입 분기가 생기지 않는지, 최종적으로 소유자·서버·동료 상태가 수렴하는지를 실제 재현 경로와 진단으로 확인한다.

`LocalPlayerPredictor`, 저장소, 서버 세션처럼 실행 환경을 조정하는 클래스가 구체 객체의 게임 규칙이나 수명주기를 소유하기 시작하면 구조 경계가 무너진 신호다. 새 예외를 추가하기 전에 해당 로직을 객체, Has-A 컴포넌트 또는 capability로 되돌린다.

구조 검증 결과에는 최소한 `반복된 증상`, `깨졌거나 정상으로 확인된 불변식`, `현재 상태의 단일 쓰기 주체`, `클라이언트·서버 사건 흐름`, `수정 범위와 회귀 증거`를 남긴다. 구조 경계가 정상이고 서로 독립된 원인이라는 증거가 있으면 국소 수정으로 끝내며, 반복됐다는 이유만으로 불필요한 대규모 리팩터링을 만들지 않는다.

### InputDrivenObject와 SimulationDrivenObject

- 게임 객체는 직접 사용자 입력에 반응하는지에 따라 하나의 권한 정체성을 가진다.
- `InputDrivenObject`는 플레이어, 로프처럼 소유 사용자의 입력에 같은 프레임부터 반응해야 하는 객체다. 소유 클라이언트가 상태의 단일 쓰기 주체로 먼저 시뮬레이션하고 서버는 입력·운동·사건 claim을 검증해 다른 복제본에 공유한다.
- `SimulationDrivenObject`는 적, 자동 행동 객체, 직접 조작하지 않는 투사체처럼 사용자 입력을 직접 받지 않는 객체다. 서버 고정 스텝이 상태를 진행하고 클라이언트는 스냅샷 또는 생성·해결 사건으로 재생한다.
- 이 이름은 객체가 어느 프로세스에 존재하는지가 아니라 상태 변화의 원인을 뜻한다. 서버에도 검증용 `InputDrivenObject` 상태가 있고 클라이언트에도 표시·예측용 `SimulationDrivenObject` 복제본이 있을 수 있다.
- 한 객체가 런타임 조건에 따라 두 정체성을 오가지 않는다. 직접 조작 가능 여부가 바뀌는 기능은 별도 객체로 교체하거나 명시적인 소유권 전환 사건을 설계한다.
- `SimulationDrivenObject`가 `InputDrivenObject`에 충돌·피격 같은 체감 사건을 만들면 피해 `InputDrivenObject`의 소유 클라이언트가 즉시 반응하고 claim을 보낸다. impact의 정상 전송은 사건 자료와 사건 결과에 한정된 상태 지문만 포함하며 전체 소유자 상태를 포함하지 않는다.
- 서버의 정상 승인 receipt와 snapshot은 소유 `InputDrivenObject`를 복구하는 명령이 아니다. 소유자의 HP·피격 무적·생명·로프·무기 쿨다운·시간 제한 강화는 로컬 공용 시뮬레이션이 계속 작성하며, 서버 복제본과 동료가 승인된 상태·사건을 따라간다. impact 지문 불일치 때는 서버가 피해자 상태를 요청해 흡수하며 소유자를 서버 상태로 되감지 않는다.
- impact 상태 지문은 해당 사건이 바꾸는 지속 필드만 결정적 순서로 투영하고 물리·타이머 실수를 도메인 허용 단위로 양자화해 만든다. raw 객체 전체, 렌더링 상태, 입력 제어 상태, 다른 동기화 경계가 소유한 필드를 섞지 않는다. 지문은 불일치 감지용이며 인증·치트 방지 수단으로 취급하지 않는다.
- 피해 claim의 receipt는 로컬에서 이미 인식한 HP·부활·로프 전이를 되감는 명령이 아니다. 서버는 정상 claim에 같은 전이를 적용해 지문을 비교하고, 일치하지 않을 때만 `impact-claim-receipt`를 `accepted: true`, `resolution: recovery-required`로 반환한다. 피해 클라이언트는 그때의 최신 소유자 상태를 한 번 전송하며 서버와 동료가 이를 따른다. 소비한 적 탄환을 되살리지 않는다.
- 적 탄환 본체 피격은 복제 객체의 대미지로 로컬 HP와 치명 시 체크포인트 부활까지 같은 `GameSimulation` 명령에서 즉시 적용한다. snapshot과 receipt는 이 HP·부활·로프 상태를 덮지 않는다. 멀티 HUD는 소유 클라이언트 상태를 표시하고 서버 복제본과 동료가 피해 클라이언트의 확정 결과로 수렴한다.
- 체크포인트 claim은 전이 직전 `owner-motion`을 먼저 보낸 뒤 로컬 `GameSimulation`의 활성 체크포인트·로프 해제를 즉시 적용한다. pending checkpoint 뒤의 사망·낙사는 예측 활성 지점을 사용한다. 거부 receipt는 이전 공용 진행도와 소유자 상태를 복원하고 그 뒤 입력·pending impact를 원래 tick 순서로 재실행한다. 화면 피드백만 먼저 표시하고 실제 부활 기준은 서버 snapshot을 기다리는 분리 구현을 두지 않는다.

### 입력 capability 디스패치

- 앱, 권한 어댑터, 예측기는 플레이어·로프 같은 구체 타입을 검사하거나 직접 입력 메서드를 호출하지 않는다.
- 정규화된 입력 프레임은 하나의 `InputDispatcher`를 거친다. 디스패처는 소유권이 일치하는 `InputDrivenObject` 중 입력 capability 믹스인을 가진 객체에만 해당 intent를 전달한다.
- 이동과 점프는 `LocomotionInput`, 로프 조준·부착·해제는 `RopePointerInput` Can-Do 믹스인에 한 번만 둔다. 믹스인은 고유 capability 계약을 사용하며 서로 같은 메서드를 덮어쓰거나 적용 순서에 의존하지 않는다.
- 객체 종류가 늘어날 때 디스패처의 구체 타입 분기를 추가하지 않는다. 새 객체는 필요한 입력 capability를 조합하고 실제 객체 호출 경로에서 계약을 확인한다.
- 네트워크는 입력 프레임과 대상 소유자·tick·sequence를 운반할 뿐, 믹스인별 게임 규칙을 다시 구현하지 않는다. 싱글, 클라이언트 예측과 서버 검증은 같은 디스패처와 capability 구현을 사용한다.

### 시뮬레이션 capability 디스패치

- 적 공격, 자동 무기, 유도탄·직선탄 운동처럼 직접 입력 없이 진행되는 행동은 해당 `SimulationDrivenObject`의 Can-Do capability에 한 번만 구현한다.
- `GameSimulation`과 도메인 시스템은 객체 종류를 분기하지 않고 현재 단계의 capability ID와 필요한 context를 `SimulationDispatcher`에 전달한다. 디스패처는 그 ID를 가진 객체만 안정적인 순서로 실행한다.
- 한 객체에 이동·공격처럼 여러 capability가 붙을 수 있으므로 “객체당 capability 하나”를 가정하지 않는다. 각 단계는 무관한 capability를 실행하지 않도록 dispatcher 계약을 유지한다.
- capability는 객체 자신의 상태 전이와 행동을 소유하고, 월드 스케줄러는 단계 순서·대상 집합·공용 context와 사건 연결만 조정한다. 전송 계층이나 예측 저장소에 별도 운동 공식을 복제하지 않는다.
- capability 디스패치는 네트워크 권한을 결정하지 않는다. `InputDrivenObject`와 `SimulationDrivenObject`의 상태 변화 원인, 클라이언트 claim과 서버 중립 시뮬레이션 경계는 기존 분할 권한 규칙을 그대로 따른다.
- 화면에 전달되는 gameplay object는 상태 변화 원인과 별개로 종류별 `render-snapshot` capability mixin을 가져야 한다. Player·Rope·Enemy·Projectile의 mixin은 자기 소유 상태만 detached DTO로 만들며, 중앙 snapshot 조립기에서 `instanceof`, object kind switch, prototype getter 의존 또는 필드별 복사를 추가하지 않는다. 새 renderable 종류는 capability 존재, 중첩 mutable reference 비공유, 실제 `GameSimulation` 전후 snapshot 보간, 싱글·멀티 scene parity를 같은 변경에서 검증한다.
- 같은 단계에서 종류별 동작이 다르면 중앙 `if (type)` 분기를 추가하지 않고 같은 capability ID를 구현하는 서로 다른 믹스인을 조합한다. 종류 선택은 객체 생성 팩토리 경계에서만 하고 스케줄러·예측 저장소·전송 계층으로 퍼뜨리지 않는다.
- 충돌 가능·claim 대기·거부 후 재시도 같은 수명 상태는 해당 객체가 공개 명령으로 소유한다. receipt 처리기가 객체의 임시 boolean을 직접 풀거나 같은 겹침에 객체를 복구하지 않는다. 재시도가 가능한 중립 객체도 분리 후 재진입 같은 명시적 재무장 조건을 통과해야 한다.
- 예측 객체 저장소는 등록, 식별자 대응, 권위 사건 정리와 렌더 snapshot만 담당한다. 운동·충돌·피드백 발생 조건·거부 정책을 객체 종류별로 해석하지 않는다.

### 구현 계약과 검증

- 클래스는 생성 직후 유효한 상태여야 하며 별도 `init()` 호출을 전제로 하지 않는다. 비동기 준비가 필요하면 팩토리가 준비된 인스턴스를 반환한다.
- 외부에 노출할 상태는 명령 메서드나 읽기 전용 snapshot으로 제공한다.
- 생성자에서는 필드 초기화만 하고 이벤트 등록, 타이머 시작, DOM 접근은 명시적 수명주기 메서드로 분리한다.
- 기반 클래스, 각 믹스인과 실제 조합의 공개 계약을 구분해 문서화하고 실제 호출 경로에서 확인한다.
- 하위 클래스가 부모 계약을 깨는 예외 분기를 요구하면 상속 관계를 제거한다.

## 5. 컴포넌트 구현 규칙

이 문서의 컴포넌트는 독립된 책임과 공개 계약을 가진 조합 단위다. DOM UI는 Alpine.js 컴포넌트를 사용하지만 게임 객체를 ECS로 구성하지는 않는다.

### 게임 컴포넌트

- 위치, 로프 상태, 체력처럼 독립된 불변식과 수명주기를 가진 상태만 컴포넌트로 분리한다.
- 컴포넌트는 소유 엔티티의 구체 타입을 알지 않고 필요한 값과 의존성을 인수로 받는다.
- 컴포넌트끼리 내부 필드를 직접 읽지 않는다. 조정이 필요하면 상위 게임 시스템이 공개 명령과 event를 연결한다.
- 한 상태의 최종 쓰기 권한은 한 컴포넌트나 시스템만 가진다.
- 매 프레임 생성되는 임시 객체를 컴포넌트로 포장하지 않는다.

### DOM UI 컴포넌트

- Alpine.js의 반응형 상태와 선언형 binding을 사용하고 문자열 `innerHTML` 조립을 금지한다.
- 로컬 표시 상태, DOM 구조, 사용자 상호작용, `attach()`/`detach()` 수명주기만 소유한다.
- 게임 상태는 읽기 전용 view model로 받고, 사용자 행동은 intent나 공개 명령으로 밖에 전달한다.
- 물리, 전투, 보상 계산을 UI 이벤트 핸들러나 template 안에 넣지 않는다.
- 다른 컴포넌트의 DOM이나 비공개 상태를 직접 탐색·수정하지 않는다.
- 이벤트 listener, observer, timer는 `detach()`에서 모두 해제한다.
- 버튼·대화상자 등은 키보드 조작, focus, `role`, `aria-*` 계약을 함께 구현한다.

### Canvas 렌더 컴포넌트

- renderer는 전달받은 snapshot과 카메라만 읽고 시뮬레이션 상태를 변경하지 않는다.
- `draw()` 안에서 입력 처리, 물리 진행, 랜덤 추출, event 발행을 하지 않는다.
- 월드 객체별 그리기 함수는 좌표 변환이나 DPR 보정을 중복하지 않는다.
- 공통 Canvas 호스트는 context, DPR·resize, 좌표 변환, HUD·오버레이를 소유하고 월드 표현은 선택된 scene renderer에 한 번 위임한다.
- 고정 HUD의 표시 토글은 각 클라이언트의 표현 상태로만 두고 게임 명령·시뮬레이션·네트워크 snapshot에 넣지 않는다. 모바일·짧은 가로 viewport의 고정 HUD는 별도 gameplay 정보를 줄이지 않고 축소 레이아웃을 사용하며, 토글은 고정 상태·objective 패널과 하단 조작 안내를 함께 숨긴다. 토글 중에도 Player HP·Action cooldown과 Enemy HP의 머리 위 bar는 유지한다.
- 렌더 프로필은 bootstrap factory 경계에서만 선택한다. 앱·시뮬레이션·네트워크 snapshot에 프로필별 타입 분기나 스프라이트 자산 계약을 추가하지 않는다.
- 현재 기본 프로필은 `sprite`다. 기존 표현은 `?renderer=polygon`으로 유지하며 두 프로필은 같은 읽기 전용 scene snapshot을 소비하고 polygon renderer를 내부 모드 분기로 확장하지 않는다.
- 시각 효과에 시간 상태가 필요하면 렌더러가 임의로 게임 시간을 만들지 않고 명시적인 render clock 또는 snapshot 값을 받는다.
- 스프라이트 애니메이션은 불변 clip 데이터와 외부 phase 입력을 분리한다. Player와 일반 몹은 상태 coverage와 manifest를 분리하되 정규화 뒤에는 공용 `SpriteAnimation`의 `frames + duration + loop + frameAt(elapsed)` clip을 사용한다. 순간 상태는 표현 경과 시간을 사용하고 player 달리기처럼 보폭이 이동량과 맞아야 하는 반복 상태는 실제 수평 이동 거리로 phase를 진행한다. Animation state나 frame index를 gameplay·network snapshot에 추가하지 않으며 Canvas painter는 보간을 끈 그리기만 담당하고 이미지 로딩·캐시·게임 시간·이동 거리 진행을 함께 소유하지 않는다.
- 상태 머신은 현재 상태·경과 시간·허용 전이만 아는 순수 조합 컴포넌트로 만들고, 도메인 snapshot·사건을 상태 전이 입력으로 바꾸는 resolver와 분리한다. 재사용성을 이유로 의미와 수명이 다른 기존 도메인 상태를 한 FSM으로 강제 이전하지 않는다.
- 여러 actor의 순간 애니메이션은 사건 대상 ID로 각 표현 FSM에 전달한다. animation state나 frame index를 게임·네트워크 권위 snapshot에 저장해 동기화하지 않는다.
- 로컬 예측 사건과 서버 확정 사건이 같은 화면 전이를 뜻하면 causal object ID를 같은 presentation ID로 정규화한다. 서버 receipt 때문에 이미 시작한 `hit`·`death`·`respawn`이나 로컬 death 카메라 hold를 다시 재생하지 않는다.
- 스프라이트 출력 크기·anchor와 collider 크기·형태를 하나의 에셋 설정으로 결합하지 않는다. collider는 플레이어 런타임 조립과 물리가 소유하고 렌더 프로필 또는 PNG 교체로 암묵적으로 변경하지 않는다.
- 새 렌더 프로필이 기존 scene renderer의 일부만 바꿔야 하면 전체 클래스를 복사·상속 override하지 않는다. 안정된 그리기 순서를 유지하는 layer composer와 역할별 renderer를 조립한다.
- 상위 renderer/composer에 `if (profile)`·`switch (actorType)` 분기를 두지 않는다. composer는 하위 renderer를 호출만 하고 각 하위 컴포넌트가 자기 collection의 draw 계약을 완결하며, 종류 선택은 immutable factory 조립에서 끝낸다.
- 환경 renderer는 backdrop·terrain·decoration으로 분리하고 고도 zone, atlas frame, Canvas 호출과 component 상태를 각 하위 renderer가 소유한다. 싱글·멀티 앱에 같은 환경 분기나 진단 전달 코드를 복제하지 않는다.
- 도트 terrain은 기존 collision surface polygon을 그대로 clip·stroke하고 one-way edge도 동일 vertex chain을 사용한다. 비충돌 decoration은 seed 기반 결정 배치로 만들며 traversal 경로 위에 충돌할 것처럼 보이는 전경을 만들지 않는다.
- 공통 Canvas host는 CSS viewport와 camera로 visible world bounds를 한 번 계산해 불변 viewport로 전달한다. composer나 앱은 객체 종류를 분기해 컬링하지 않으며 terrain·decoration·actor·projectile 하위 renderer가 자기 bounds와 안전 margin을 적용해 실제 draw 여부를 완결한다. sprite·polygon 또는 싱글·멀티별 별도 컬링 경로를 만들지 않는다.
- collision surface bounds·edge 정보와 seed 기반 decoration placement처럼 정적인 계산은 소유 renderer가 world·zone 변화에 맞춰 무효화하는 캐시로 보관한다. camera 이동이나 매 draw마다 전체 월드 배치를 다시 만들지 않으며 캐시가 gameplay collision·권위 상태를 소유하게 하지 않는다.
- backing store 배율은 기기 DPR, 명시적 최대 DPR과 최대 backing pixel 예산을 함께 적용한다. 기본 최대 DPR 2와 약 3 Mi-pixel 예산을 바꾸면 작은 화면의 픽셀 선명도, 큰 태블릿의 backing 크기와 `imageSmoothingEnabled=false`를 함께 검증한다. 기기별 user-agent 분기나 싱글·멀티별 해상도 정책을 두지 않는다.
- 렌더 성능 진단은 프레임 간격·draw 시간·fixed-step drop·CSS/backing 크기·유효 DPR·하위 collection의 `drawn/total`을 관찰할 수 있어야 한다. 진단 값은 읽기 전용이며 물리 120Hz, 네트워크 전송률, gameplay state 또는 자동 품질 전환의 입력으로 사용하지 않는다.
- 여러 환경 atlas는 캐릭터와 분리된 `environment-asset-format.md` 계약으로 로드한다. atlas 실패는 backdrop·terrain·decoration 단위로만 fallback하고 pending을 실패로 고정하지 않으며, loader·schema·example·validator 중 하나를 바꾸면 나머지 계약과 component별 실패 진단을 함께 갱신한다.
- 모든 그래픽 작업의 공통 진입점과 인계 경로는 `graphics-asset-guide.md`와 `assets/artwork/<category>/<asset-id>/`를 따른다. 담당 개발자가 검증된 export를 `assets/runtime/<category>/<asset-id>/`로 승격하고 `RuntimeAssetCatalog`의 category·asset ID 경계로 참조하며, 전용 계약이 없는 자산에 의미가 다른 player·environment manifest를 임시로 재사용하지 않는다.
- 시나리오 문서용 이미지는 `bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`의 생성 전 Runtime 확인, 대표 Camera Shot, Player 상대 크기, 한 줄 live Rope, 정확한 오브젝트 수와 상태 검수를 통과해야 한다. 전체 경로·좌표의 권위는 Approved Blockout이 소유하지만 선택한 Camera Shot에 보이는 발판·장애물·Cover의 좌우·상하 관계와 상대 폭은 이미지에서도 보존한다. 생성 구도를 위해 Gameplay Geometry를 이동·확대·병합하지 않으며 `RETIRED`·`PENDING REGENERATION` 이미지를 다음 생성의 Style Anchor로 연쇄 사용하지 않는다.
- collider는 공개 계약과 shape별 클래스로 만들고 런타임 factory에서 조립한다. `CircleCollider`와 convex `PolygonCollider` snapshot을 공용 판정이 직접 소비하며 box는 중심 기준 네 꼭짓점을 가진 polygon 편의 생성자다. 앱·renderer·충돌·전투 함수가 전역 반지름이나 별도 사각형 판정을 가져와 같은 shape 규칙을 다시 해석하지 않는다. concave 외곽은 여러 convex collider로 분해하는 별도 compound 계약 전에는 단일 polygon으로 넣지 않는다.
- Player·Enemy·Projectile의 공통 Physics는 `position`·`velocity`·`acceleration` 세 벡터를 소유한다. gameplay `applyImpulse()`는 velocity를 직접 바꾸지 않고 현재 tick의 acceleration에 누적하며, 공용 tick은 acceleration → velocity → position 순서로 한 번 적분한 뒤 acceleration을 초기화한다. 회전 객체는 별도 `AngularPhysicsMixin`을 조합해 angular acceleration → angular velocity → angle을 같은 순서로 적분하고, 회전하지 않는 객체는 이 capability를 갖지 않는다. Player와 Enemy 같은 이동 actor의 controller·행동·Patrol은 Runtime 좌표를 직접 변경하지 않는다. 속도·displacement intent를 공용 surface physics step에 전달하고, 그 step만 위치 적분, 활성 collision surface와 Player↔Player·Player↔Enemy·Enemy↔Enemy body 해결을 수행한다. collider는 복제한 working velocity를 해결하고 surface physics가 그 차이를 acceleration에 누적·반영한다. circle↔circle, circle↔polygon, polygon↔polygon은 같은 contact normal·penetration 결과를 사용한다. 동적 body 접촉은 법선 속도를 0으로 자르는 벽 처리로 대체하지 않고 collider bounding size 기반 질량, 상대 속도와 반발 계수로 자기 권위 body의 위치 보정·impulse를 계산한다. `kinematic` body는 공용 Physics·Collider를 사용하고 authored velocity를 제공하지만 inverse mass 0으로 외부 impulse를 받지 않으며 `canGroundActors`·반발 계수로 접촉 의미를 선언한다. `sentry` 고정형 Turret만 `static` body이며 다른 Enemy는 authored 이동 방식과 무관하게 동적 body다. spawn·reset·권위 snapshot restore는 이동이 아닌 명시적 상태 전이로 분리한다.
- 충돌 최적화는 Quadtree broad phase가 swept collider AABB와 교차하는 후보만 고르고 기존 narrow phase가 최종 판정한다. camera visibility나 Player와의 단순 거리로 surface를 제거하지 않으며 정적 surface index는 월드 전체를 유지한다. 화면 기반 관심 영역 밖 Enemy를 쉬게 할 때는 충돌만 끄지 않고 해당 Enemy의 행동·Patrol·넉백·공격·물리 step 전체를 동결한다. 멀티 서버는 특정 대표 Player가 아니라 모든 active Player 관심 영역의 합집합을 사용하고, 같은 입력·Player 상태에서는 싱글과 서버가 동일한 활성 집합을 계산해야 한다.
- 기본 renderer profile과 query override는 bootstrap 한 곳에서 결정한다. asset load 실패 fallback은 명시적이고 진단 가능해야 하며 선택 실패를 조용히 삼키지 않는다.
- 렌더러 변경은 실제 브라우저에서 기본 프로필 보존, 사용자 정의 프로필 위임, 잘못된 프로필 거부, 애니메이션 loop/clamp 경계와 좌우 반전 목적 영역을 확인한다.
- 멀티플레이 파티클·VFX·화면 흔들림은 권위 판정 이벤트를 받아 각 클라이언트가 로컬로 생성·진행한다. 서버 시뮬레이션과 네트워크 스냅샷에 표현 객체나 효과 수명을 넣지 않는다.

### 모바일 우선 분할 권한 규칙

- 플레이어·로프처럼 특정 소유자가 있는 입력 주도 사건은 소유 클라이언트가, 충돌·피격은 피해 클라이언트가 최초 트리거한다. 서버 응답을 받은 뒤 이동, 넉백, 로프 해제, UI 전환 또는 VFX를 처음 시작하면 안 된다.
- 동적 actor 충돌은 각 권위가 자기 body에만 같은 질량·상대 속도 공식을 적용한다. Player는 소유 클라이언트가 즉시 반응하고 최신 owner motion으로 공유하며, Enemy와 Enemy↔Enemy 응답은 중립 서버가 진행한다. 서버가 Player를 대신 밀거나 소유 클라이언트가 Enemy 권위 위치를 확정하지 않는다.
- 몹·적 투사체 생성과 궤적처럼 어느 한 클라이언트에 맡길 수 없는 중립 시뮬레이션 사건은 서버가 진행한다. 대상 없는 중립 사건을 임의의 대표 클라이언트에게 위임하지 않는다.
- 클라이언트는 트리거 프레임에 로컬 상태와 피드백을 적용하고, `eventKey`, `clientTick`, 관련 객체 ID와 최소 판정 자료만 서버에 보낸다. 일반 claim은 서버가 자체 중립 객체·규칙으로 검증할 수 있는 결과값을 신뢰 입력으로 보내지 않는다. 피해자 최종 판정인 impact는 예외적으로 관측 대미지와 결과 상태 지문을 보내며, 전체 소유자 상태는 지문 불일치 복구 때만 보낸다.
- 즉시 사건 경로와 지속 상태 수렴 경로를 분리한다. 사건을 클라이언트가 먼저 트리거했다는 이유로 장기 상태 동기화를 생략하지 않는다.
- `InputDrivenObject`는 최신 소유자 상태가 서버와 다른 클라이언트의 수렴 원점이다. `owner-motion`은 인증·프로토콜 형식·유한값과 세션 tick 범위를 통과한 최신 상태를 값의 크기와 무관하게 공용 `GameSimulation` 명령에 적용한다. 중복·역순·세션 범위 밖 tick과 완료된 런의 후속 상태는 성공한 no-op으로 처리하며 `ownerMotionTick`을 전진시키지 않는다. 속도·각속도·이동 거리·로프 offset 봉투로 거부하거나 receipt를 이유로 소유자를 지연된 서버 위치에 복원하지 않는다. 클라이언트와 서버가 함께 사용하는 각도 정규화·각속도 clamp 같은 도메인 물리 규칙은 네트워크 거부가 아니므로 유지한다. impact 불일치는 서버가 피해 클라이언트의 최신 결과 상태를 흡수한다.
- 멀티 서버 fixed tick은 `InputDrivenObject`의 이동·점프·로프 capability를 다시 실행하지 않는다. 각 플레이어 snapshot은 최신 적용 `owner-motion`의 `ownerMotionTick`을 함께 가지며, 반복된 이전 tick은 새 위치 표본을 만들지 않는다. 서버 tick은 플레이어 타이머와 `SimulationDrivenObject` 월드 진행에 사용한다. 기준 상태에서 미확정 입력을 재실행하는 복구는 체크포인트처럼 별도 rollback 계약을 가진 사건 전이에만 둔다.
- `SimulationDrivenObject`와 공용 월드 상태는 서버 스냅샷이 수렴 원점이다. 원격 표시는 보간하고 표본 공백만 제한 외삽하되 다음 스냅샷에서 반드시 서버 궤도로 돌아온다.
- 원격 보간 시계를 첫 스냅샷에 영구 고정하지 않는다. 최신 `serverTick` 오차를 제한된 양으로 계속 흡수하고, 장시간 타이머 드리프트와 단일 수신 지연 모두에서 보간 시간축이 급변하거나 지속 외삽으로 밀리지 않는지 네트워크 진단으로 확인한다.
- 원격 위치 표본의 tick은 그 상태를 실제로 만든 시계를 사용한다. 적·공용 객체는 `serverTick`, 플레이어는 `ownerMotionTick`으로 보간하며 플레이어 목표 시각에는 공용 `inputLeadTicks`를 더해 서버 시계와 소유자 예측 시계를 맞춘다. 반복된 owner motion을 새 server tick의 새 위치처럼 취급하지 않는다.
- 플레이어 당사자 사건에서 서버 역할은 claim 검증, 중복 제거, 서버 복제 상태 갱신과 다른 클라이언트로의 배포다. impact는 정상 경로에서 같은 사건 전이의 상태 지문만 비교하고, 불일치 때만 피해자의 최신 상태를 요청한다. 서버는 별도로 중립 객체의 생성·궤적·수명주기를 진행하되, 지연된 플레이어 복제 위치로 피격이나 절단을 먼저 발생시켜 모바일 클라이언트 반응을 왕복 지연시키거나 정상 스냅샷으로 소유자 상태를 다시 쓰면 안 된다.
- 공격 클라이언트가 적중을 claim하는 플레이어 투사체는 멀티 서버 fixed tick에서 적 충돌과 HP 감소를 다시 실행하지 않는다. 서버는 검증용 궤적·대상 소실·수명만 진행하고 승인된 claim에서 최종 대미지와 resolve 사건을 한 번 확정한다.
- 플레이어 소유 예측 객체의 생성도 소유 클라이언트가 즉시 적용하고 spawn claim으로 확정한다. 멀티 서버 fixed tick은 같은 플레이어 객체를 별도로 생성하지 않으며, 서버는 claim의 소유권·tick·쿨다운·대상·초기 상태를 검증해 생성 ID와 사건을 멱등 확정한다. 예측 생성이 쿨다운·자원·충전량도 바꿨다면 prediction ID에 적용 직전·직후 값과 tick을 함께 보존한다. 여러 동종 prediction이 pending일 때 앞 거절은 후속 효과를 현재 상태에서 제거하지 않고 후속 항목의 rollback 기준만 거절된 원인이 없었던 시간축으로 갱신한다. 마지막 pending 거절에서 최초 상태로 복구한다.
- 입력 capability가 강화 타이머처럼 지속 전투 상태를 바꾸면 소유 클라이언트가 즉시 적용한 뒤 별도 claim으로 그 전이를 공유한다. 같은 입력에서 파생 객체도 생성된다면 서버 전송 순서를 `최신 owner-motion → 상태 전이 claim → 객체 spawn claim`으로 고정해 서버 복제본이 검증된 상태로 객체 파라미터를 계산하게 한다. 거부 receipt는 해당 로컬 전이 이전 값으로 복구하고, 승인 뒤에는 서버 복제본과 동료가 소유 클라이언트 값으로 수렴한다. 정상 스냅샷은 소유자의 강화 타이머를 다시 쓰지 않는다.
- 멀티 서버 fixed tick은 플레이어 체력 0 스캔으로 사망·부활을 시작하거나 보상 선택 명령으로 Foundation을 확정하지 않는다. 피해·사망은 피해자 impact claim, Foundation 선택은 foundation-selection claim의 검증 경계에서만 서버 복제 상태와 공유 사건에 반영한다.
- 여러 클라이언트가 감지 가능한 사건은 결정적 `eventKey`로 멱등 처리한다. 다른 클라이언트는 확정 사건을 받으면 자신의 로컬 표현 컴포넌트에서 연출한다.
- 연결, 인증, 참가·퇴장, 빈 방 제거와 서버 장애처럼 클라이언트가 발생시킬 수 없는 세션 수명주기는 예외적으로 서버가 시작할 수 있다.
- 새 게임플레이 시스템의 멀티 검증은 최소한 `로컬 트리거가 서버 receipt보다 먼저 발생함`, `정상 claim은 최소 사건 자료만 보냄`, `상태 불일치 때만 복구 상태를 보냄`, `중복 claim은 한 번만 확정됨`, `각 사건 claim 계약에 맞는 거부 처리`, `승인 receipt와 정상 snapshot이 소유 클라이언트 상태·연출을 되감지 않음`, `서버 복제본과 동료가 소유자의 상태로 수렴함`, `중립 객체는 모든 클라이언트가 서버 상태로 수렴함`을 실제 서버·클라이언트 진단에서 확인한다.
- 예측 가능한 중립 객체는 원래 spawn 이벤트를 활성 수명 동안 보존하고 일반 스냅샷이 아니라 중간 입장 welcome에서만 재사용한다. claim 대기 객체는 로컬 궤적을 계속 진행하며, 승인 resolve의 중복 피드백 억제, 계약별 거부 처리와 서버 수명 만료를 실제 멀티 경로에서 확인한다.
- 새 네트워크 상태에는 정상 승인 시 수렴 대상, 거부 시 복구 기준점, 원격 보간 여부를 명시하고 두 기기 검증에서 입력 종료 뒤 같은 공유 상태로 모이는지 확인한다.
- 기존 서버 시작형 플레이어 당사자 사건을 건드리는 작업은 같은 범위에서 소유자·피해자 클라이언트 트리거형으로 전환한다. 중립 시뮬레이션 사건은 서버 소유 이유와 클라이언트에 맡기지 않을 상태 경계를 명시한다.
- 멀티 서버 fixed tick은 복제 플레이어의 위치만으로 낙사처럼 당사자 클라이언트가 이미 판정하는 사건을 보조 발생시키지 않는다. 신뢰성은 동일 claim의 멱등 처리와 연결 종료 정책으로 확보하며 서버 중복 트리거로 보완하지 않는다.

### 파일과 공개 계약

- 기본은 컴포넌트 하나당 파일 하나이며 파일명과 대표 export 이름을 맞춘다.
- 외부 사용자는 `index.js` 같은 공개 진입점만 import하고 내부 파일 경로에 결합하지 않는다.
- props, view model, event payload는 필요한 필드만 가진 평평한 구조를 우선한다.
- 컴포넌트는 초기 상태, 공개 명령, 상태 전이, 해제를 실제 호출 경로에서 검증한다. DOM/Canvas 컴포넌트는 실제 사용자 경로의 브라우저 검증을 수행한다.

## 6. 로직 소유권

- 입력 수집은 `InputSampler`만 담당한다.
- 고정 시간 진행은 `FixedStepRunner`만 담당한다.
- 게임 상태 전이는 `src/game/`이 담당한다.
- Canvas 호출과 그리기는 renderer가 담당한다.
- 범용 계산은 `src/game-kit/`이 담당하되 게임 엔티티나 UI를 import하지 않는다.
- 하나의 수치를 여러 계층에서 덮어쓰지 않는다. 최종 값을 결정하는 모듈을 하나로 정한다.
- 이벤트를 만든 모듈과 이벤트의 효과를 해석하는 모듈의 경계를 공개 계약으로 둔다.

## 7. 함수와 모듈 분리

- 한 함수는 한 문장으로 설명되는 책임만 가진다.
- 조건 분기가 게임 규칙의 이름을 가지면 별도 함수나 모듈로 승격한다.
- `update()`와 `draw()`가 여러 시스템을 직접 해석하지 않게 한다.
- 공용 계산은 입력과 출력을 명확히 하고 숨은 전역 상태를 읽지 않는다.
- 파일이 커졌다는 이유만으로 나누지 않고, 변경 이유와 소유권이 달라질 때 나눈다.
- 순환 import와 양방향 의존을 금지한다.

## 8. 공용 기반 경계

- 공개 진입점은 `src/game-kit/index.js`다.
- `game-kit` 내부 import는 같은 경계 안에서 끝나야 한다.
- `game-kit`은 플레이어, 로프, 적, Foundation, 월드 진행, HUD를 알지 못한다.
- 한 게임에서만 사용하는 코드는 실제 두 번째 사용처가 생기기 전까지 게임 영역에 둔다.
- 공용화할 때는 원래 구현을 복제하지 않고 단일 구현과 호환 경로만 유지한다.
- `Math.random()`을 공용 시뮬레이션에 직접 사용하지 않는다.

## 9. 입력과 수명주기

- 이벤트 리스너는 명시적인 `attach()`와 `detach()`를 가진다.
- 모듈 import만으로 전역 이벤트나 타이머가 시작되면 안 된다.
- `requestAnimationFrame`, 타이머, observer는 소유자가 종료 시 반드시 해제한다.
- UI 입력을 게임 상태로 바로 쓰지 않고 정규화한 snapshot을 전달한다.
- 키보드와 포인터가 같은 행동을 만들면 행동 intent 수준에서 합친다.
- 포인터 드래그 중 `pointerleave`, `pointercancel`, 창 `blur`, 문서 숨김처럼 다음 렌더 프레임을 보장할 수 없는 종료 사건은 입력 상태만 지우지 않는다. 해제 snapshot을 만든 직후 같은 공용 게임 명령 경로에 동기 전달하고, 멀티에서는 일반 전송 주기 제한을 우회해 소유자 상태 전이까지 즉시 보낸다. 중복 종료 사건은 활성 포인터 ID와 눌림 상태로 한 번만 처리하며 다른 모바일 조작 버튼의 해제를 로프 종료로 취급하지 않는다.

## 10. Canvas와 UI

- renderer는 상태를 읽기만 하고 게임 상태를 변경하지 않는다.
- 월드 좌표와 화면 좌표 변환은 카메라가 소유한다.
- 시나리오가 구간별 Shot을 요구하면 local Y 범위·desktop/mobile zoom·player screen ratio를 area definition의 `cameraZones`에 선언하고 싱글·멀티 공용 Camera Director가 해석한다. 모바일의 최종 zoom은 Full HD `1920×1080` 기준 viewport를 현재 CSS viewport 안에 맞춘 값에 authored `mobileZoom / 0.72` 상대 Shot 비율을 곱하며, renderer·입력 계층이 별도 보정식을 만들지 않는다. 멀티에서 공용 진행보다 뒤에 남은 플레이어가 있으므로 현재 Shot은 공용 `currentAreaId`가 아니라 로컬 플레이어의 물리 좌표로 고른다.
- 표시 시간이 있는 Objective Sequence의 진행·완료와 Gate 개방은 공용 월드 진행 상태가 소유한다. Presentation은 사건을 읽어 문구·그래픽·오디오만 재생하며 완료 시각이나 Gate 상태를 변경하지 않는다. 문서가 입력 차단을 명시하지 않으면 연출 중 이동을 허용한다.
- 같은 Sector 안의 정적 `sector-seam`과 Stage surface를 진행 상태로 추가·제거하지 않는다. Sector 경계를 실제로 잠글 때는 stable transit device의 visual과 blocker collider를 같은 geometry에서 파생하고 `blockedByRouteId`처럼 unlock 시 blocker만 비활성화하는 반대 극성 계약을 사용한다. `requiredRouteId` 발판을 잠금 장치로 재사용해 unlock 순간 새 바닥이 생기게 하지 않는다. 공용 unlock camera scene은 event ID로 중복 제거하고 gameplay pause·무적 여부를 제품 계약대로 명시한다.
- 90~120초 같은 첫 플레이 시간은 강제 대기나 영역 전용 이동 제한으로 맞추지 않는다. 권위 시뮬레이션의 영역 체류·클리어 시간을 설정 버튼 길게 누르기로 여는 디버그 수치에서 수집하고, 실제 표본이 벗어날 때 Geometry·Camera·Recovery 동선을 조정한다.
- DPR 보정과 resize는 렌더링 경계에서 한 번만 처리한다.
- 색만으로 상태를 전달하지 않고 형태, 굵기, 움직임, 문구를 함께 사용한다.
- 사용자 입력, 성공, 실패, 쿨다운은 화면에서 구분 가능해야 한다.
- 화면 밖 objective 안내는 방향을 문장으로 하드코딩하지 않고 world position을 현재 camera로 투영한 screen-edge indicator를 사용한다. viewport 안에서는 world marker, 밖에서는 edge arrow 중 하나만 표시하고 safe-area·고정 HUD·모바일 조작 bounds를 피한다. 여러 후보가 있으면 제품 계약이 정한 다음 대상 하나만 안내해 화살표 중첩을 만들지 않으며 공용 HUD 표시 토글을 따른다.
- Canvas 변경은 시작·동작 중·종료 또는 해제 상태를 실제 화면으로 검증한다.
- 렌더 최적화는 실제 브라우저에서 보이는 결과가 같은지와 화면 안/밖 객체를 함께 둔 draw 감소를 증명한다. 설정 버튼 길게 누르기로 디버그 수치 표시를 켜고 CSS/backing 크기, DPR, frame p50/p95, draw p50/p95와 dropped steps를 확인한다.
- 스프라이트 clip은 자산이 실제로 표현하는 행동 의미와 일치해야 한다. 지원하지 않는 행동을 방향 전환용 프레임 등 무관한 프레임에 임의 대응하지 않고, 불가피한 대체는 definition에 명시적 fallback으로 선언한다.
- player sprite definition은 여러 atlas·frame·출력 크기, anchor·offset, 상태 coverage, frame 경계와 fallback 순환을 검증한다. 일반 몹은 별도 `enemy-sprite-asset-format.md` 계약으로 타입별 presentation state coverage·alias, clip frame 순서·양수 duration·loop와 fallback 순환을 검증한다. 자산 로더는 각 실제 이미지 크기를 atlas 선언과 대조하며 renderer는 행·열 의미나 생성 도구 형식을 자체 해석하지 않는다.
- PixelLab·SpriteCook 같은 생성 도구의 ZIP·metadata·개별 frame은 import 입력으로만 다룬다. 도구별 adapter가 표준 manifest를 만들고 renderer와 gameplay에는 도구 이름 분기를 추가하지 않는다. GIF·WebP는 미리보기로만 사용한다.
- sprite manifest는 frame 순서·duration·loop·fallback과 표현 cue만 소유한다. collider·hitbox·피해량·무적 시간·물리·네트워크 권위 상태를 넣지 않으며 생성 도구 keypoint를 collider로 자동 변환하지 않는다.
- 스프라이트 관련 개발·에셋 작업은 루트 `AGENTS.md`에서 `sprite-asset-format.md`의 JSON Schema·example manifest·표준 validator 명령으로 진입하게 한다. loader, schema, example, validator 중 하나를 바꾸면 같은 계약 변경으로 함께 갱신하며 새 결과물은 validator 통과 전 완료로 보지 않는다.
- 환경 리소스 작업은 `environment-asset-format.md`의 PNG 묶음·JSON Schema·example manifest와 `validate:environment-assets` 명령으로 진입한다. PixelLab·SpriteCook 원본 배열과 metadata는 import 입력일 뿐 renderer에 도구별 분기를 만들지 않는다.
- 오디오 리소스 작업은 `audio-asset-guide.md`의 authoring 인계와 `audio-asset-format.md`의 runtime package를 분리한다. 생성 Skill·MCP·DAW 원본은 입력 자료이며 schema·parser·mock·validator가 공유하는 도구 중립 manifest로 정규화한다.
- 오디오 manifest는 clip source·load·loop와 cue 표현 정책만 소유한다. 게임 사건 연결은 package 밖 `AudioEventBindings`의 조합 가능한 handler가 소유하고 싱글·멀티 앱은 같은 `presentFrame` 경계만 호출한다. Web Audio graph와 voice 수명은 audio host가 소유하며 gameplay·simulation·network state는 음원 경로나 mixer를 import하지 않는다.
- 오디오와 sprite 같은 표현 package는 stable ID·catalog·immutable definition 주입 경계를 유지한다. package 선택은 렌더·재생 결과만 바꾸며 물리·충돌·전투·명령·network snapshot을 변경하지 않는다. 공개 loader의 전체 pack·category override와 bootstrap 선택 주입은 validator와 실제 로딩 경로에서 확인한다.
- 오디오 media의 비동기 재생 거부는 준비 성공과 구분해 voice를 정리하고 host snapshot·개발 진단에 전파한다. 사용자 활성화 제약은 다음 사용자 동작에서 재시도 가능한 `suspended`, 복구 불가능한 필수·선택 실패는 각각 `failed`·`degraded`로 명시하며 실패를 adapter 내부 배열에만 남기지 않는다.
- 오디오 scene·binding처럼 120Hz 고정 스텝에서 호출될 수 있는 경로는 같은 lifecycle key·cue·gain·pan 입력을 멱등 처리한다. 값이 같을 때 Web Audio automation을 추가하지 않고, 값이 변할 때는 해당 `AudioParam`의 기존 예약을 취소·교체한다. 앱별 호출 빈도 제한으로 우회하지 말고 공용 voice/adapter 진단으로 확인한다.
- emitter cooldown, causal ID, runtime failure처럼 사건 수에 따라 늘 수 있는 오디오 기록은 명시적 상한을 가진다. buffer source 시작 실패는 생성한 handle·node·voice를 즉시 정리한다. `stopAll`은 one-shot·loop를, `suspend`는 one-shot을, `release`는 남은 voice·loop와 cooldown·variation·causal 추적 Map까지 결정적으로 비워야 한다.
- 스프라이트 화면 변경은 데스크톱과 모바일 크기에서 상태의 자세·실루엣·동작을 비교한다. 색 변화만을 상태 구분의 유일한 근거로 사용하지 않는다.
- 정식 actor sprite가 준비된 경로에는 fallback mock의 본체 보조선·센서 블록을 중복 합성하지 않는다. gameplay 의미가 있는 telegraph·상태 bar는 공용 표현으로 유지하며, 실제 적이 화면에 들어오는 재현 가능한 Stage·seed에서 정식 frame draw와 fallback 비활성을 함께 검증한다.

## 11. 코드 스타일과 파일 관리

- 식별자는 영어, 문서와 사용자 문구는 한국어를 기본으로 한다.
- 클래스는 `PascalCase`, 함수·변수는 `camelCase`, 상수는 `UPPER_SNAKE_CASE`를 사용한다.
- boolean은 `is`, `has`, `can`, `should`처럼 의미가 드러나는 이름을 쓴다.
- 매직 넘버는 소유 모듈의 설정 객체나 상수로 올린다.
- 컬렉션은 의도를 드러내는 `map`, `filter`, `find`, `for...of`를 우선한다.
- 파일명과 대표 export 이름을 맞춘다.
- 파일명 변경 시 import, HTML 진입점과 문서를 한 번에 검색하고 수정한다.
- UTF-8과 저장소 줄바꿈 규칙을 유지한다.

## 12. 검증과 회귀 방지

### 반복 유사 버그 모순 감사

같은 증상군이 이전 수정 뒤 다시 보고되거나 사용자가 “아직도”, “여전히”, “또”와 같이 반복 회귀를 명시하면 증상별 보정 전에 다음 감사를 수행한다.

1. 관련 파일의 Git 이력과 `SESSION-HANDOFF.md`·기준 문서·decision history에서 이전 수정과 대체 결정을 확인한다.
2. 같은 의미를 쓰는 상태 필드, controller, event, protocol과 compatibility alias를 검색해 권위 소유자가 둘 이상인지 확인한다.
3. client/server, owner/shared simulation, collision/renderer, authored/runtime이 같은 predicate와 데이터 원점을 사용하는지 나란히 비교한다.
4. 이전 수정이 크기·표현·예외 조건만 바꾸고 기존 모순된 권위 계약을 유지했는지 확인한다.
5. 편집 전에 사용자 증상과 함께 단일 권위·정적 geometry·상태 수렴 같은 근본 불변식을 재현 가능한 명령·로그·브라우저 경로로 확인한다.

반복 회귀에서는 diff가 작다는 이유로 관측값 override, whitelist 확장, fallback 분기 또는 한쪽 계층만의 predicate를 추가하지 않는다. 기존 계약끼리 양립하지 않으면 최신 사용자 결정에 맞는 권위 하나를 남기고 나머지 상태와 호환 경로를 제거하거나 표시 전용 파생값으로 격리한다. 감사 결과는 최종 보고와 Lore commit의 Constraint 또는 Rejected trailer에 남겨 다음 수정자가 같은 증상 패치를 반복하지 않게 한다.

### 자동 테스트 금지와 명시 요청 예외

- 저장소는 기본 자동 테스트 suite를 유지하지 않는다. 테스트 코드가 제품과 별도 권위·유지보수 대상이 되는 것을 막기 위한 사용자 결정이다.
- 사용자가 현재 작업에서 테스트 작성이나 특정 자동 회귀를 명시적으로 요청한 경우에만 그 범위의 테스트를 추가한다. 과거 관례, 에이전트 판단, 일반적인 “버그 수정” 표현만으로 테스트를 만들지 않는다.
- schema·asset·scenario validator는 제품 입력을 거부하는 실행 계약이므로 테스트와 구분해 유지한다. 문법·형식 검사와 실제 브라우저·서버 smoke도 유지한다.
- 테스트가 없다는 이유로 구현 내부 상태를 수동 단언하는 임시 스크립트를 저장소에 남기지 않는다. 필요한 일회성 진단은 실행 결과만 보고하고 제품 파일로 승격하지 않는다.

기본 검증 명령:

```powershell
npm run check
npm run format:check
git diff --check
```

이 목록은 최종 candidate가 통과해야 할 정적·계약 검증 집합이며 각 단계·각 실행기마다 반복하라는 뜻이 아니다. 화면 변경은 실제 브라우저, 멀티 서버 변경은 해당 smoke 절차로 별도 확인한다.

- 버그 수정은 관측된 출력만 덮어쓰는 예외 처리로 끝내지 않는다. 원인이 된 상태 소유권, 식별자, 데이터 흐름 또는 공개 계약의 불변식을 복구하고 같은 원인에서 파생되는 경로를 검색한다.
- 에이전트는 현재 작업의 메인 개발자로서 사용자 결과 전체를 책임진다. 최소 변경 자체를 목표로 하지 않고 근본 원인을 복구하는 단일 권위와 공개 계약을 세운 뒤 모든 생산 호출자, 싱글·멀티 상태, 표현, 저장·복원, migration과 기준 문서를 같은 변경에서 정렬한다.
- seed와 world revision은 저작 월드·중립 시뮬레이션·결정적 표현의 싱글·멀티 재현 계약으로 유지하되 대량 seed sweep 자동 테스트를 만들지 않는다.
- Canvas 기능은 브라우저 증거, 멀티플레이는 실제 서버·클라이언트 smoke 없이 완료 처리하지 않는다.
- CI와 로컬 검증 명령이 다르면 문서와 워크플로를 함께 맞춘다.

## 13. Git 운영

- `main` 변경은 짧은 브랜치와 PR을 기본으로 한다.
- 사용자가 `main` 병합을 요청하거나 병합까지 완료하라고 명시한 작업은 예외 없이 [`.codex/skills/github-task-flow/SKILL.md`](../.codex/skills/github-task-flow/SKILL.md)를 적용한다. 사용자가 skill 이름을 다시 입력할 필요는 없으며, Issue·전용 worktree·단일 Lore 커밋·PR·최신 `main` rebase·재검증·일반 merge commit·Issue 종료의 전체 절차를 외부 blocker가 없는 한 완료한다.
- 모든 PR은 병합 직전에 `git fetch origin main`과 `git rebase origin/main`으로 전용 작업 브랜치를 최신 `main` 위에 올린다. 검증 뒤 `origin/main`이 다시 전진했으면 리베이스하되 변경된 입력과 연결된 ledger 항목만 무효화한다.
- 최종 리베이스 뒤 final candidate의 필수 검사 ledger를 완성하고, `git merge-base HEAD origin/main`과 `git rev-parse origin/main`이 같은 SHA인지 확인한다. rebase가 no-op이고 candidate fingerprint와 환경이 같으면 같은 전체 suite를 반복하지 않는다. 충돌은 작업 브랜치에서만 해결하며 PR이 mergeable인지 다시 확인한다.
- 이미 push한 단일 소유 전용 작업 브랜치의 리베이스 결과만 `git push --force-with-lease`로 갱신할 수 있다. `--force`는 사용하지 않는다.
- `main`을 rebase, reset 또는 force-push하지 않는다. 공유 브랜치이거나 단일 소유 여부를 증명할 수 없는 브랜치는 재작성하지 말고 소유자와 조정할 때까지 병합을 중단한다.
- 브랜치 리베이스는 PR 병합 방식과 구분한다. 별도 결정이 없으면 최신 `main`에 리베이스한 브랜치를 일반 merge commit으로 병합하며 squash merge와 rebase merge를 사용하지 않는다.
- 관련 없는 파일을 한 커밋에 섞지 않는다.
- 커밋 전 staged diff와 포함 파일을 확인한다.
- 생성물, 로컬 로그, `.omx/`, 비밀 파일은 추적하지 않는다.
- 커밋 메시지는 변경 내용보다 변경 이유를 먼저 설명하고 저장소의 Lore trailer 규칙을 따른다.

### 동시 Codex 작업과 GitHub 범위 조정

- `.codex/skills/coordinate-github-tasks/SKILL.md`는 두 활성 Codex 대화가 실제로 동시에 구현 소스를 수정하고 같은 checkout·hunk·public contract에서 충돌할 때만 사용한다. 계획 분배는 사용자가 소유하며 계획 전용 대화, 예정 파일, 열린 Issue·PR 또는 같은 저장소라는 사실만으로 조정하지 않는다.
- 구현을 완료한 대화에는 상태 확인·범위 카드·ACK·후속 구현 메시지를 보내거나 대화를 재활성화하지 않는다. 새 구현은 새 대화에서 시작하고, 완료된 결과는 code·commit·PR·Issue를 읽기 전용 근거로 사용한다.
- 실제 changed paths가 분리되면 대화 메시지와 GitHub 댓글 없이 독립 진행한다. 작업 제목·요약보다 checkout과 실제 diff·hunk·public contract를 근거로 사용하며, 활성 편집과 충돌을 증명할 수 없으면 추측으로 연락하지 않는다.
- 독립 경로·심볼·계약을 소유한 새 작업은 별도 Git worktree와 branch를 기본으로 사용한다. 기존 Git object database를 공유하므로 별도 clone은 만들지 않는다. 같은 저장소라는 이유만으로 선행 merge를 기다리지 않는다.
- 같은 `cwd`의 shared checkout에서는 브랜치·작업 트리·stage를 모든 대화가 공유하므로 실제 동시 편집이 확인되면 한 대화만 Git 쓰기를 소유한다. shared checkout은 환경상 worktree를 만들 수 없거나 실제 같은 hunk·public contract에 순서 의존성이 있을 때만 사용한다.
- 같은 파일이라도 심볼과 hunk가 분리되면 독립 소유할 수 있다. 같은 hunk, public API, schema, fixture, 공통 index와 기준 문서는 한 작업만 소유하고 다른 작업은 요구사항과 재현 사례를 전달한 뒤 선행 병합을 기다린다.
- 실제 충돌이 확인된 활성 편집 대화에만 겹친 경로·checkout·소유자·병합 순서를 한 번 전달한다. 실제 병합 의존성이 있고 양쪽 Issue가 있을 때만 같은 최소 결정을 Issue 댓글에 기록한다.
- 고정된 3회 조정 재확인은 하지 않는다. 실제 diff가 새 공유 경계로 넓어지거나 shared checkout 소유자가 바뀌거나 선행 PR 병합으로 의존 작업이 재개될 때만 다시 확인한다.
- 각 작업은 자기 worktree·브랜치·stage·커밋·PR만 변경한다. 선행 구현이 완료되면 그 대화를 다시 호출하지 않고 PR 또는 merge SHA를 확인한 뒤 의존 worktree를 최신 `origin/main`에 rebase하고 영향받은 verification ledger 항목만 다시 수행한다.

### AI 도구 설정 동기화(vsync)

- AI 코딩 도구(Codex·OpenCode·Cursor·Claude Code)의 스킬·MCP 설정의 단일 소스는 `.codex/`다. 스킬은 `.codex/skills/`, MCP는 `.codex/config.toml`에서만 편집한다.
- 다른 도구의 스킬 사본(`.opencode/skills/`, `.cursor/skills/` 등)과 MCP 설정(`opencode.json`, `.cursor/mcp.json` 등)은 `vsync sync`가 포맷 변환(JSON↔TOML↔JSONC와 환경 변수 문법 포함)으로 생성한다. 대상 도구 파일을 직접 편집하지 않으며 손으로 다시 쓴 변경은 다음 sync에서 덮어쓴다.
- `.vsync.json`은 프로젝트 수준 공개 설정이고 비밀을 포함하지 않는다. MCP 자격 증명은 환경 변수 참조(`{env:DISCORD_TOKEN}` 등)로만 남긴다.
- 소스를 편집한 작업은 같은 변경에서 `vsync sync`로 대상 도구를 갱신하고 생성·갱신된 대상 파일도 함께 커밋한다.

## 14. 문서 관리

- 루트 README는 실행과 진입점, `docs/README.md`는 문서 인덱스와 읽는 순서만 설명한다. 문서 작성 위치·파일 형식·이미지 첨부와 인덱스 운영의 상세 기준은 `docs/documentation-rules.md`를 따른다.
- 같은 내용을 여러 문서에 복제하지 않고 기준 문서를 링크한다.
- 기능이 바뀌면 관련 기획·아키텍처·도움말을 같은 작업에서 현행화한다.
- 완전히 대체된 결정은 삭제하지 않고 `docs/decision-history.md`로 이동한다.
- 아직 기준 문서가 소유하지 않는 결정·진행 중 전환·열린 위험만 `SESSION-HANDOFF.md`에 유지한다. 기준 문서에 충분히 흡수된 항목은 핸드오프에서 제거한다.
- 설계·점검·인계 문서는 세부 나열보다 `핵심 목표 → 우선순위 → 확정 결정 → 제외 범위 → 실행 순서`를 먼저 제시한다. 현재 판정·영향·다음 행동을 앞에 두고, 근거와 구현 상세는 뒤에 둔다. 문서와 사용자 문구는 한국어를 기본으로 하되 코드 식별자·파일 경로·확정 문자열은 원문을 유지한다.

### 시나리오 기획·개발 통합 체크포인트

- `docs/bsh/scenario/`는 Sector·Stage의 기획·제작 계약을 소유하고, `docs/scenario-development-integration.md`는 전체 Stage 목록과 현재 authored Runtime 연결 상태·차단 요소·마지막 확인 근거를 소유한다.
- 상세 Stage README의 존재, 기획 교차검토, Runtime 연결과 실제 플레이테스트를 서로 다른 상태로 기록한다. 문서가 추가됐다는 이유만으로 구현 또는 검증 완료로 표시하지 않는다.
- 시나리오 문서와 `src/game/world/areas/`, `src/game/world/sectors/` 또는 Sector validator를 바꾼 작업은 `npm run check:scenario-integration`의 fingerprint 경보를 해소해야 한다. 실제 변경 영향과 검증 근거를 통합 현황에 기록한 뒤 marker를 갱신하며 hash만 맞추지 않는다.
- 좌표·문구·cue처럼 기존 계약 안에서 흡수할 변경과 맵 순서·핵심 기믹·완료 조건·Gate 연결·asset 경계처럼 사용자 검토가 필요한 변경을 분리한다.
- Stage 문서에 고정 SHA를 남길 때는 `AUTHORING SNAPSHOT`으로 표시한다. 현재 main·Runtime 상태를 뜻하는 `CURRENT MAIN` 표기로 고정 SHA를 남기지 않는다.

### 대화 결정 흡수 절차

사용자가 대화에서 향후 구현에 영향을 주는 결정을 명시하면 문서 작업도 해당 구현의 완료 조건으로 본다. 다음 순서를 같은 Issue와 커밋에서 수행한다.

1. **최초 기록:** 결정한 즉시 `SESSION-HANDOFF.md`에 임시 기록한다. 구현이 끝난 뒤 기억에 의존해 몰아서 기록하지 않는다.
2. **충돌 정리:** 기존 활성 결정과 충돌하면 최신 사용자 결론으로 기존 항목을 고치고, 대체 이유가 필요한 이전 결정은 `docs/decision-history.md`로 옮긴다. 모순된 두 결론을 동시에 활성 상태로 두지 않는다.
3. **규칙 승격:** 다음 작업에서도 반복될 원칙이면 아래 기준 문서에 일반화한다. 대화 문장을 그대로 복사하기보다 적용 조건, 금지 사항과 검증 방법이 드러나는 규칙으로 정리한다.
4. **핸드오프 제거:** 기준 문서가 결정·적용 조건·검증 방법을 충분히 소유하면 `SESSION-HANDOFF.md`의 임시 항목을 완전히 제거한다. 기준 문서 링크만 남기는 요약도 중복으로 본다.
5. **정합성 검증:** 종료 전에 결정의 핵심 용어를 검색해 코드와 기준 문서가 같은 결론을 설명하는지 확인하고, 승격 완료 항목이 핸드오프에 남지 않았는지 확인한다. 누락된 문서 수정은 후속 작업으로 미루지 않는다.

기준 문서의 소유 범위는 다음과 같다.

| 결정 종류                                                            | 기준 문서                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 게임 방향, 플레이 흐름, 열린 기획 결정                               | `docs/game-hackathon-planning.md`, `docs/implementation-roadmap.md` |
| 시나리오 Stage 목록, Runtime 연결 상태, 차단 요소와 마지막 확인 근거 | `docs/scenario-development-integration.md`                          |
| 모듈 책임, 상태 소유권, 의존 방향                                    | `docs/architecture.md`                                              |
| 멀티 권위, 전송, 채널과 세션 정책                                    | `docs/multiplayer-synchronization.md`                               |
| 클래스·믹스인·컴포넌트·검증·Git과 대화 결정 흡수 절차                | `docs/development-rules.md`                                         |
| 문서 인덱스, 작성 위치, 파일 형식과 이미지 첨부                      | `docs/documentation-rules.md`                                       |
| Pages, PWA, 서버 실행, 버전 운영                                     | 해당 배포·버전 문서                                                 |
| 아직 승격되지 않은 결정·진행 중 전환·문서화되지 않은 blocker         | `SESSION-HANDOFF.md`                                                |
| 대체되거나 종료된 결정과 이유                                        | `docs/decision-history.md`                                          |

다음 내용은 영구 결정으로 승격하지 않는다.

- 한 번만 실행할 명령이나 상태 확인 요청
- 곧 폐기할 임시 URL, PID, 디버깅 값
- 에이전트가 편의를 위해 세운 가정이나 아직 사용자가 확정하지 않은 제안
- 자격 증명, 토큰, 개인 정보

사용자의 최신 명시적 결정은 과거 문서보다 우선한다. 다만 에이전트가 추론한 내용은 결정으로 간주하지 않고, 필요한 경우 열린 항목으로 표시한다.

### 결정 기록 등급

- **L1:** 제품 방향, 공개 계약, 데이터·아키텍처 경계처럼 쉽게 뒤집으면 안 되는 결정
- **L2:** 구현 방식, 조작, 수치, 표현처럼 후속 검증으로 조정 가능한 결정

각 결정은 맥락, 결정, 영향, 검증 상태를 포함한다.

## 15. Stage direction 저작과 개발자 검토

- Stage 연출은 `DIRECTION-SPEC.json`을 기획 원본으로 사용하고 공용 `direction-spec.schema.json`·normalizer/compiler·validator를 통해 immutable `DirectionDefinition`으로 변환한다. Runtime owner나 renderer에 Stage별 문자열·trigger 분기를 새로 추가하지 않는다.
- 기획 의도와 게임 품질이 시스템 편의보다 우선한다. 의미를 보존할 수 없는 action, 새 authority가 필요한 command, 큰 성능·멀티 동기화·asset 위험은 자동 근사하지 않고 `review-required`로 개발자에게 원본 의도·차단 근거·대안·비용/위험·추천안을 전달한다.
- 개발자는 기획 의도를 유지하는 adapter·시스템 확장과 최적화를 직접 결정할 수 있다. 효과를 축소·변형하는 fallback은 기획자 승인을 받고 `fallbackPolicy`에 승인자·원본 의도·대체 action·손실 의미를 기록한다.
- `DirectionRuntime`은 Beat timeline·dedupe·replay·cancellation과 command dispatch만 소유한다. Camera·Text·Bark·Audio·Lighting·Character는 local, Player state는 owner, Enemy·Collision·Objective·Gate·공용 world는 server authority adapter가 실행하며 scope/authority mismatch는 compile 실패다.
- `DESIGN LOCKED`와 `optional`은 사람이 결정한다. `unsupported/compile-failed/review-required/unbound/implemented/verified`는 compiler·adapter coverage·acceptance test에서 산출하며 README에 구현 상태를 별도 수동 복제하지 않는다.
- 필수 track이 `verified`가 아니면 Stage release를 차단한다. `optional: true`만 손실을 노출한 상태로 release할 수 있다. schema나 command 계약을 바꾸면 compiler, validator, migrated fixtures, domain adapter coverage, architecture와 scenario integration 문서를 같은 변경에서 갱신한다.

## 16. 보안과 외부 변경

- 자격 증명, 개인 정보, 토큰을 코드·로그·문서에 남기지 않는다.
- 파괴적 명령, 데이터 삭제, 권한 변경, 라이선스 변경은 명시적 승인을 받는다.
- 외부 계정 연결, 배포, 공개 범위 변경은 요청된 범위에서만 수행한다.
- 의심스러운 비밀 파일을 발견하면 값을 출력하지 않고 위치와 유형만 보고한다.

## 17. Windows와 도구 시행착오 방지

- PowerShell과 Bash 문법을 섞지 않는다.
- 검색은 `rg`와 구조화된 파서를 우선한다.
- 재귀 삭제·이동은 대상 절대 경로를 먼저 확인한다.
- 장시간 서버는 별도 프로세스로 실행하고 검증 후 정확한 PID를 종료한다.
- 자동 구현기가 중단돼도 하위 프로세스가 남아 파일을 덮어쓸 수 있으므로, 직접 작업으로 전환하기 전에 프로세스와 최근 수정 시간을 확인한다.
- 대량 치환 후에는 import, 문법, 관련 validator와 `git diff --check`를 다시 실행한다.
