const MODE_LABELS = Object.freeze({ single: "싱글 플레이", multiplayer: "멀티 플레이" });
const CHANNEL_PATTERN = /^\d{4}$/;

export class GameModeMenu {
    constructor(root) {
        if (!root) throw new Error("GameModeMenu requires a root element");
        this.root = root;
        this.status = root.querySelector("[data-mode-status]");
        this.modeActions = root.querySelector("[data-mode-actions]");
        this.channelPanel = root.querySelector("[data-channel-panel]");
        this.channelForm = root.querySelector("[data-channel-form]");
        this.channelInput = root.querySelector("[data-channel-input]");
        this.multiplayerButton = root.querySelector('[data-game-mode="multiplayer"]');
        this.multiplayerTooltip = root.querySelector("[data-multiplayer-tooltip]");
        this.controls = [...root.querySelectorAll("button, input")];
        this.busy = false;
        this.multiplayerAvailable = true;
    }

    choose() {
        this.root.hidden = false;
        this.modeActions.hidden = false;
        this.channelPanel.hidden = true;
        this.setBusy(false);
        return new Promise((resolve) => {
            const finish = (choice) => {
                cleanup();
                resolve(choice);
            };
            const single = () => finish({ mode: "single" });
            const multiplayer = () => {
                if (!this.multiplayerAvailable) return;
                this.modeActions.hidden = true;
                this.channelPanel.hidden = false;
                const rememberedChannel = this.channelInput.value.trim();
                this.setStatus(
                    CHANNEL_PATTERN.test(rememberedChannel)
                        ? `채널 ${rememberedChannel}에 다시 참가하거나 새 채널을 만드세요.`
                        : "새 채널을 만들거나 전달받은 4자리 번호를 입력하세요."
                );
                this.channelInput.focus();
            };
            const create = () => finish({ mode: "multiplayer", channelId: "new" });
            const join = (event) => {
                event.preventDefault();
                const channelId = this.channelInput.value.trim();
                if (!CHANNEL_PATTERN.test(channelId)) {
                    this.setStatus("채널 번호는 숫자 4자리입니다.", true);
                    return;
                }
                finish({ mode: "multiplayer", channelId });
            };
            const back = () => {
                this.channelPanel.hidden = true;
                this.modeActions.hidden = false;
                this.setStatus("플레이 방식을 선택하세요.");
            };
            const cleanup = () => {
                this.root.querySelector('[data-game-mode="single"]').removeEventListener("click", single);
                this.root.querySelector('[data-game-mode="multiplayer"]').removeEventListener("click", multiplayer);
                this.root.querySelector("[data-channel-create]").removeEventListener("click", create);
                this.root.querySelector("[data-channel-back]").removeEventListener("click", back);
                this.channelForm.removeEventListener("submit", join);
            };
            this.root.querySelector('[data-game-mode="single"]').addEventListener("click", single);
            this.root.querySelector('[data-game-mode="multiplayer"]').addEventListener("click", multiplayer);
            this.root.querySelector("[data-channel-create]").addEventListener("click", create);
            this.root.querySelector("[data-channel-back]").addEventListener("click", back);
            this.channelForm.addEventListener("submit", join);
        });
    }

    setBusy(busy, mode = null) {
        this.busy = Boolean(busy);
        this.controls.forEach((control) => (control.disabled = this.busy));
        if (busy && mode) this.setStatus(`${MODE_LABELS[mode]}에 연결하는 중…`);
    }

    setMultiplayerAvailable(available) {
        const next = Boolean(available);
        const changed = next !== this.multiplayerAvailable;
        this.multiplayerAvailable = next;
        this.multiplayerButton.disabled = this.busy;
        this.multiplayerButton.setAttribute("aria-disabled", String(!next));
        if (this.multiplayerTooltip) this.multiplayerTooltip.hidden = next;
        if (!next) {
            this.channelPanel.hidden = true;
            this.modeActions.hidden = false;
            this.setStatus("플레이 방식을 선택하세요.");
        } else if (changed && !this.root.hidden) {
            this.setStatus("플레이 방식을 선택하세요.");
        }
        return changed;
    }

    setStatus(message, error = false) {
        this.status.textContent = message;
        this.status.dataset.error = error ? "true" : "false";
    }

    rememberChannel(channelId) {
        if (!CHANNEL_PATTERN.test(channelId ?? "")) return false;
        this.channelInput.value = channelId;
        return true;
    }

    hide() {
        this.root.hidden = true;
    }
}
