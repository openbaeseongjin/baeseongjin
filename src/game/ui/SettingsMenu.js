const TAB_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export class SettingsMenu {
    constructor({ root, trigger, documentTarget = globalThis.document } = {}) {
        if (!root || !trigger) throw new Error("SettingsMenu requires root and trigger elements");
        this.root = root;
        this.trigger = trigger;
        this.documentTarget = documentTarget;
        this.tabList = root.querySelector("[data-settings-tabs]");
        this.closeButton = root.querySelector("[data-settings-close]");
        this.tabs = new Map();
        this.activeTabId = null;
        this.previouslyFocused = null;
        this.onTrigger = () => this.show();
        this.onClose = () => this.hide();
        this.onBackdrop = (event) => {
            if (event.target === this.root) this.hide();
        };
        this.onKeyDown = (event) => {
            if (event.key !== "Escape" || this.root.hidden) return;
            event.preventDefault();
            this.hide();
        };
    }

    registerTab({ id, label, panel }) {
        if (!TAB_ID_PATTERN.test(id)) throw new Error(`settings tab id '${id}' is invalid`);
        if (typeof label !== "string" || !label.trim()) throw new Error("settings tab label is required");
        if (!panel) throw new Error(`settings tab '${id}' requires a panel`);
        if (this.tabs.has(id)) throw new Error(`settings tab '${id}' is already registered`);
        const button = this.documentTarget.createElement("button");
        button.type = "button";
        button.id = `settings-tab-${id}`;
        button.dataset.settingsTab = id;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", panel.id);
        button.textContent = label;
        const activate = () => this.activate(id);
        button.addEventListener("click", activate);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", button.id);
        this.tabList.append(button);
        this.tabs.set(id, { button, panel, release: () => button.removeEventListener("click", activate) });
        if (this.activeTabId === null) this.activate(id);
        return () => this.unregisterTab(id);
    }

    unregisterTab(id) {
        const tab = this.tabs.get(id);
        if (!tab) return false;
        tab.release();
        tab.button.remove();
        tab.panel.hidden = true;
        this.tabs.delete(id);
        if (this.activeTabId === id) {
            this.activeTabId = null;
            const nextId = this.tabs.keys().next().value;
            if (nextId) this.activate(nextId);
        }
        return true;
    }

    activate(id) {
        if (!this.tabs.has(id)) return false;
        this.activeTabId = id;
        for (const [tabId, { button, panel }] of this.tabs) {
            const selected = tabId === id;
            button.setAttribute("aria-selected", selected ? "true" : "false");
            button.tabIndex = selected ? 0 : -1;
            panel.hidden = !selected;
        }
        return true;
    }

    attach() {
        this.trigger.addEventListener("click", this.onTrigger);
        this.closeButton.addEventListener("click", this.onClose);
        this.root.addEventListener("pointerdown", this.onBackdrop);
        this.documentTarget.addEventListener("keydown", this.onKeyDown, true);
    }

    show() {
        this.previouslyFocused = this.documentTarget.activeElement;
        this.root.hidden = false;
        this.closeButton.focus();
    }

    hide() {
        if (this.root.hidden) return;
        this.root.hidden = true;
        this.previouslyFocused?.focus?.();
        this.previouslyFocused = null;
    }

    release() {
        this.hide();
        this.trigger.removeEventListener("click", this.onTrigger);
        this.closeButton.removeEventListener("click", this.onClose);
        this.root.removeEventListener("pointerdown", this.onBackdrop);
        this.documentTarget.removeEventListener("keydown", this.onKeyDown, true);
        for (const id of [...this.tabs.keys()]) this.unregisterTab(id);
    }
}
