const MODE_LABELS = Object.freeze({ single: "싱글 플레이", multiplayer: "멀티 플레이" });

export class GameModeMenu {
    constructor(root) {
        if (!root) throw new Error("GameModeMenu requires a root element");
        this.root = root;
        this.status = root.querySelector("[data-mode-status]");
        this.buttons = [...root.querySelectorAll("[data-game-mode]")];
    }

    choose() {
        this.root.hidden = false;
        this.setBusy(false);
        return new Promise((resolve) => {
            const select = (event) => {
                const mode = event.currentTarget.dataset.gameMode;
                this.buttons.forEach((button) => button.removeEventListener("click", select));
                resolve(mode);
            };
            this.buttons.forEach((button) => button.addEventListener("click", select));
        });
    }

    setBusy(busy, mode = null) {
        this.buttons.forEach((button) => (button.disabled = busy));
        if (busy && mode) this.setStatus(`${MODE_LABELS[mode]}에 연결하는 중…`);
    }

    setStatus(message, error = false) {
        this.status.textContent = message;
        this.status.dataset.error = error ? "true" : "false";
    }

    hide() {
        this.root.hidden = true;
    }
}
