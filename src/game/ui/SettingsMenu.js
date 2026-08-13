const TAB_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export class SettingsMenu {
    constructor({ root, trigger, documentTarget = globalThis.document } = {}) {
        if (!root || !trigger) throw new Error("SettingsMenu requires root and trigger elements");
        this.root = root;
        this.trigger = trigger;
        this.documentTarget = documentTarget;
        this.tabList = null;
        this.closeButton = null;
        this.tabs = new Map();
        this.activeTabId = null;
        this.previouslyFocused = null;
        this.attached = false;
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
        this.onTabKeyDown = (event) => {
            const currentId = event.target?.dataset?.settingsTab;
            if (!currentId || !this.tabs.has(currentId)) return;
            const ids = [...this.tabs.keys()];
            const currentIndex = ids.indexOf(currentId);
            let nextIndex = null;
            if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % ids.length;
            if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + ids.length) % ids.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End") nextIndex = ids.length - 1;
            if (nextIndex === null) return;
            event.preventDefault();
            this.activate(ids[nextIndex], { focus: true });
        };
    }

    registerTab({ id, label, panel }) {
        if (!this.attached) throw new Error("SettingsMenu must be attached before tabs are registered");
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
        this.tabs.set(id, { button, panel, activate });
        if (this.activeTabId === null) this.activate(id);
        return () => this.unregisterTab(id);
    }

    unregisterTab(id) {
        const tab = this.tabs.get(id);
        if (!tab) return false;
        tab.button.removeEventListener("click", tab.activate);
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

    activate(id, { focus = false } = {}) {
        if (!this.tabs.has(id)) return false;
        this.activeTabId = id;
        for (const [tabId, { button, panel }] of this.tabs) {
            const selected = tabId === id;
            button.setAttribute("aria-selected", selected ? "true" : "false");
            button.tabIndex = selected ? 0 : -1;
            panel.hidden = !selected;
        }
        if (focus) this.tabs.get(id).button.focus();
        return true;
    }

    attach() {
        if (this.attached) return false;
        this.tabList = this.root.querySelector("[data-settings-tabs]");
        this.closeButton = this.root.querySelector("[data-settings-close]");
        if (!this.tabList || !this.closeButton) throw new Error("SettingsMenu is missing dialog controls");
        this.trigger.addEventListener("click", this.onTrigger);
        this.closeButton.addEventListener("click", this.onClose);
        this.root.addEventListener("pointerdown", this.onBackdrop);
        this.documentTarget.addEventListener("keydown", this.onKeyDown, true);
        this.tabList.addEventListener("keydown", this.onTabKeyDown);
        for (const { button, activate } of this.tabs.values()) button.addEventListener("click", activate);
        this.attached = true;
        return true;
    }

    show() {
        this.previouslyFocused = this.documentTarget.activeElement;
        this.root.hidden = false;
        const activeTab = this.tabs.get(this.activeTabId)?.button;
        (activeTab ?? this.closeButton).focus();
    }

    hide() {
        if (this.root.hidden) return;
        this.root.hidden = true;
        this.previouslyFocused?.focus?.();
        this.previouslyFocused = null;
    }

    detach() {
        if (!this.attached) return false;
        this.hide();
        this.trigger.removeEventListener("click", this.onTrigger);
        this.closeButton.removeEventListener("click", this.onClose);
        this.root.removeEventListener("pointerdown", this.onBackdrop);
        this.documentTarget.removeEventListener("keydown", this.onKeyDown, true);
        this.tabList.removeEventListener("keydown", this.onTabKeyDown);
        for (const { button, activate } of this.tabs.values()) button.removeEventListener("click", activate);
        this.attached = false;
        return true;
    }

    release() {
        this.detach();
        for (const id of [...this.tabs.keys()]) this.unregisterTab(id);
    }
}
