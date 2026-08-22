export class HelpDialog {
    constructor({ root, trigger }) {
        if (!root || !trigger) throw new Error("HelpDialog requires root and trigger elements");
        this.root = root;
        this.trigger = trigger;
        this.closeButton = root.querySelector("[data-help-close]");
        if (!this.closeButton) throw new Error("HelpDialog requires a close button");
        this.backgroundDialog = trigger.closest('[role="dialog"]');
        this.previousFocus = null;
        this.onOpen = () => this.show();
        this.onClose = () => this.hide();
        this.onBackdrop = (event) => {
            if (event.target === this.root) this.hide();
        };
        this.onKeydown = (event) => {
            if (event.key === "Escape") this.hide();
        };
    }

    attach() {
        this.trigger.addEventListener("click", this.onOpen);
        this.closeButton.addEventListener("click", this.onClose);
        this.root.addEventListener("click", this.onBackdrop);
        this.root.addEventListener("keydown", this.onKeydown);
    }

    detach() {
        this.trigger.removeEventListener("click", this.onOpen);
        this.closeButton.removeEventListener("click", this.onClose);
        this.root.removeEventListener("click", this.onBackdrop);
        this.root.removeEventListener("keydown", this.onKeydown);
    }

    show() {
        if (!this.root.hidden) return;
        this.previousFocus = this.root.ownerDocument.activeElement;
        if (this.backgroundDialog) this.backgroundDialog.inert = true;
        this.root.hidden = false;
        this.closeButton.focus();
    }

    hide() {
        if (this.root.hidden) return;
        this.root.hidden = true;
        if (this.backgroundDialog) this.backgroundDialog.inert = false;
        this.previousFocus?.focus?.();
        this.previousFocus = null;
    }
}
