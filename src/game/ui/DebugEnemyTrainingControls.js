import { enemyDisplayName } from "../combat/EnemyArchetypeCatalog.js";

export class DebugEnemyTrainingControls {
    constructor({
        documentTarget = globalThis.document,
        onSpawn = () => null,
        onPrevious = () => null,
        onActual = () => null,
        onNext = () => null,
        onAuto = () => null,
        onRemove = () => null
    } = {}) {
        this.documentTarget = documentTarget;
        this.onSpawn = onSpawn;
        this.onPrevious = onPrevious;
        this.onActual = onActual;
        this.onNext = onNext;
        this.onAuto = onAuto;
        this.onRemove = onRemove;
        this.definition = null;
        this.enabled = true;
        this.attached = false;
        this.spawn = () => this.spawnSelected();
        this.previous = () => this.render(this.onPrevious());
        this.actual = () => this.render(this.onActual());
        this.next = () => this.render(this.onNext());
        this.auto = () => this.render(this.onAuto());
        this.remove = () => {
            this.onRemove();
            this.render(null);
        };
    }

    attach() {
        if (this.attached) return false;
        this.fieldset = this.documentTarget.querySelector("[data-debug-enemy-training]");
        this.packageOutput = this.documentTarget.querySelector("[data-debug-enemy-package]");
        this.enemySelect = this.documentTarget.querySelector("[data-debug-enemy-type]");
        this.spawnButton = this.documentTarget.querySelector("[data-debug-enemy-spawn]");
        this.statusOutput = this.documentTarget.querySelector("[data-debug-enemy-status]");
        this.toolbar = this.documentTarget.querySelector("[data-debug-enemy-toolbar]");
        this.previousButton = this.documentTarget.querySelector("[data-debug-enemy-previous]");
        this.actualButton = this.documentTarget.querySelector("[data-debug-enemy-actual]");
        this.nextButton = this.documentTarget.querySelector("[data-debug-enemy-next]");
        this.autoButton = this.documentTarget.querySelector("[data-debug-enemy-auto]");
        this.removeButton = this.documentTarget.querySelector("[data-debug-enemy-remove]");
        if (
            !this.fieldset ||
            !this.packageOutput ||
            !this.enemySelect ||
            !this.spawnButton ||
            !this.statusOutput ||
            !this.toolbar ||
            !this.previousButton ||
            !this.actualButton ||
            !this.nextButton ||
            !this.autoButton ||
            !this.removeButton
        ) {
            throw new Error("DebugEnemyTrainingControls is missing controls");
        }
        this.spawnButton.addEventListener("click", this.spawn);
        this.previousButton.addEventListener("click", this.previous);
        this.actualButton.addEventListener("click", this.actual);
        this.nextButton.addEventListener("click", this.next);
        this.autoButton.addEventListener("click", this.auto);
        this.removeButton.addEventListener("click", this.remove);
        this.attached = true;
        this.renderDefinition();
        this.renderAvailability();
        this.render(null);
        return true;
    }

    setDefinition(definition) {
        this.definition = definition;
        if (this.attached) this.renderDefinition();
    }

    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        if (this.attached) this.renderAvailability();
        if (!this.enabled && this.attached) this.render(null);
    }

    renderDefinition() {
        this.packageOutput.textContent = this.definition?.id ?? "사용 불가";
        this.enemySelect.textContent = "";
        for (const enemyType of Object.keys(this.definition?.enemies ?? {})) {
            const option = this.documentTarget.createElement("option");
            option.value = enemyType;
            option.textContent = `${enemyDisplayName(enemyType)} · ${enemyType}`;
            this.enemySelect.append(option);
        }
        this.renderAvailability();
    }

    renderAvailability() {
        const ready = this.enabled && Boolean(this.definition) && this.enemySelect.options.length > 0;
        this.fieldset.disabled = !this.enabled;
        this.spawnButton.disabled = !ready;
        if (!this.enabled) this.statusOutput.textContent = "싱글플레이 전용 기능입니다.";
        else if (!this.definition) this.statusOutput.textContent = "몬스터 Runtime package를 불러오지 못했습니다.";
        else if (this.enemySelect.options.length === 0)
            this.statusOutput.textContent = "검수 가능한 몬스터가 없습니다.";
        else this.statusOutput.textContent = "현재 화면의 가까운 안전한 발판에 더미 하나를 생성합니다.";
    }

    spawnSelected() {
        if (!this.enabled || !this.definition || !this.enemySelect.value) return null;
        const result = this.onSpawn(this.enemySelect.value);
        if (!result?.created) {
            this.statusOutput.textContent = result?.reason ?? "더미를 생성하지 못했습니다.";
            return null;
        }
        this.statusOutput.textContent = `${enemyDisplayName(this.enemySelect.value)} 더미를 생성했습니다.`;
        this.render(result.state);
        return result.state;
    }

    render(state) {
        if (!this.attached) return state;
        if (!this.enabled || !state) {
            this.toolbar.hidden = true;
            return state;
        }
        this.toolbar.hidden = false;
        this.actualButton.textContent =
            state.mode === "actual"
                ? `실전 · ${state.currentState}`
                : `${state.mode === "auto" ? "자동" : "고정"} · ${state.currentState}`;
        this.actualButton.title = "실전 AI 모드로 돌아가기";
        this.autoButton.textContent = state.mode === "auto" ? "자동 중지" : "자동 순환";
        this.autoButton.setAttribute("aria-pressed", String(state.mode === "auto"));
        this.toolbar.dataset.mode = state.mode;
        this.toolbar.dataset.enemyType = state.enemyType;
        return state;
    }

    detach() {
        if (!this.attached) return false;
        this.spawnButton.removeEventListener("click", this.spawn);
        this.previousButton.removeEventListener("click", this.previous);
        this.actualButton.removeEventListener("click", this.actual);
        this.nextButton.removeEventListener("click", this.next);
        this.autoButton.removeEventListener("click", this.auto);
        this.removeButton.removeEventListener("click", this.remove);
        this.attached = false;
        return true;
    }
}
