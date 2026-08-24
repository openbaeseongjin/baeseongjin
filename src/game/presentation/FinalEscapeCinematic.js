const VIDEO_SRC = "/assets/runtime/cinematics/final-escape/one_rope_final_escape_original_image_16x9.mp4";
const GIF_SRC = "/assets/runtime/cinematics/final-escape/one_rope_final_escape_with_english_credits_preview.gif";

export class FinalEscapeCinematic {
    constructor(canvas) {
        this.started = false;
        this.host = globalThis.document?.createElement("div") ?? null;
        if (!this.host) return;
        Object.assign(this.host.style, {
            position: "fixed",
            inset: "0",
            display: "none",
            zIndex: "100",
            background: "#000"
        });
        this.video = globalThis.document.createElement("video");
        Object.assign(this.video, { src: VIDEO_SRC, muted: true, playsInline: true });
        Object.assign(this.video.style, { width: "100%", height: "100%", objectFit: "contain" });
        this.fallback = globalThis.document.createElement("img");
        Object.assign(this.fallback, { src: GIF_SRC, alt: "ONE ROPE final escape credits", hidden: true });
        Object.assign(this.fallback.style, { width: "100%", height: "100%", objectFit: "contain" });
        this.video.addEventListener("ended", () => this.hide());
        this.video.addEventListener("error", () => this.showFallback());
        this.host.append(this.video, this.fallback);
        canvas?.ownerDocument?.body?.append(this.host);
    }
    sync(runState) {
        if (runState === "completed" && !this.started && this.host) {
            this.started = true;
            this.host.style.display = "block";
            this.video.play().catch(() => this.showFallback());
        }
    }
    showFallback() {
        this.video.hidden = true;
        this.fallback.hidden = false;
    }
    hide() {
        this.host.style.display = "none";
    }
    dispose() {
        this.video?.pause();
        this.host?.remove();
    }
}
