import { PARTY_CHAT_MAX_GRAPHEMES } from "../network/PartyChatMessage.js";
import { truncateGraphemes } from "../../core/text/GraphemeText.js";

function isEditableTarget(target) {
    return Boolean(target?.closest?.("input, textarea, select, button, [contenteditable='true'], [role='dialog']"));
}

export class MultiplayerChatPanel {
    constructor({
        root,
        onSubmit,
        onActiveChange = () => {},
        activationTarget = globalThis.window,
        returnFocus = null
    }) {
        if (!root) throw new Error("MultiplayerChatPanel requires a root element");
        if (typeof onSubmit !== "function") throw new Error("MultiplayerChatPanel requires onSubmit");
        this.root = root;
        this.form = root.querySelector("[data-party-chat-form]");
        this.input = root.querySelector("[data-party-chat-input]");
        if (!this.form || !this.input) throw new Error("MultiplayerChatPanel is missing form controls");
        this.onSubmit = onSubmit;
        this.onActiveChange = onActiveChange;
        this.activationTarget = activationTarget;
        this.returnFocus = returnFocus;
        this.attached = false;
        this.composing = false;
        this.onActivationKeyDown = (event) => {
            if (event.key !== "Enter" || event.isComposing || event.defaultPrevented || !this.root.hidden) return;
            if (isEditableTarget(event.target)) return;
            event.preventDefault();
            this.open();
        };
        this.onInputKeyDown = (event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
                event.preventDefault();
                this.close();
                return;
            }
            if (event.key === "Enter" && !event.isComposing) {
                event.preventDefault();
                this.submit();
            }
        };
        this.onInput = () => {
            const normalized = truncateGraphemes(this.input.value, PARTY_CHAT_MAX_GRAPHEMES);
            if (normalized !== this.input.value) this.input.value = normalized;
        };
        this.onCompositionStart = () => (this.composing = true);
        this.onCompositionEnd = () => (this.composing = false);
        this.onFormSubmit = (event) => {
            event.preventDefault();
            this.submit();
        };
    }

    attach() {
        if (this.attached) return false;
        this.activationTarget.addEventListener("keydown", this.onActivationKeyDown);
        this.input.addEventListener("keydown", this.onInputKeyDown);
        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("compositionstart", this.onCompositionStart);
        this.input.addEventListener("compositionend", this.onCompositionEnd);
        this.form.addEventListener("submit", this.onFormSubmit);
        this.attached = true;
        return true;
    }

    detach() {
        if (!this.attached) return false;
        this.close({ restoreFocus: false });
        this.activationTarget.removeEventListener("keydown", this.onActivationKeyDown);
        this.input.removeEventListener("keydown", this.onInputKeyDown);
        this.input.removeEventListener("input", this.onInput);
        this.input.removeEventListener("compositionstart", this.onCompositionStart);
        this.input.removeEventListener("compositionend", this.onCompositionEnd);
        this.form.removeEventListener("submit", this.onFormSubmit);
        this.attached = false;
        return true;
    }

    open() {
        if (!this.root.hidden) return false;
        this.input.value = "";
        this.root.hidden = false;
        this.onActiveChange(true);
        this.input.focus();
        return true;
    }

    submit() {
        if (this.composing) return false;
        const text = this.input.value.trim();
        if (!text || this.onSubmit(text) !== true) return false;
        this.close();
        return true;
    }

    close({ restoreFocus = true } = {}) {
        if (this.root.hidden) return false;
        this.input.value = "";
        this.composing = false;
        this.root.hidden = true;
        this.onActiveChange(false);
        if (restoreFocus) this.returnFocus?.focus?.();
        return true;
    }
}
