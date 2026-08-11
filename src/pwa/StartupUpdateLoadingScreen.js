export class StartupUpdateLoadingScreen {
    constructor(root) {
        if (!root) throw new Error("StartupUpdateLoadingScreen requires a root element");
        this.root = root;
    }

    show() {
        this.root.hidden = false;
        this.root.setAttribute("aria-busy", "true");
    }

    hide() {
        this.root.hidden = true;
        this.root.setAttribute("aria-busy", "false");
    }
}
