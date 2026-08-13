import { AUDIO_GROUPS } from "./AudioManifest.js";

const DEFAULT_TIMEOUT_MS = 15000;

function setGain(parameter, value, context, transitionMs = 0) {
    const time = context.currentTime;
    parameter.cancelScheduledValues(time);
    parameter.setValueAtTime(parameter.value, time);
    if (transitionMs > 0) parameter.linearRampToValueAtTime(value, time + transitionMs / 1000);
    else parameter.setValueAtTime(value, time);
}

function setPan(parameter, value, context) {
    const time = context.currentTime;
    parameter.cancelScheduledValues(time);
    parameter.setValueAtTime(value, time);
}

function errorCode(error) {
    if (error?.name === "AbortError") return "timeout";
    return String(error?.code ?? error?.name ?? "load-failed").toLowerCase();
}

function durationMatches(actual, declared) {
    return Math.abs(actual - declared) <= Math.max(0.05, declared * 0.02);
}

export class BrowserAudioAdapter {
    constructor({
        context = null,
        AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext,
        AudioElementClass = globalThis.Audio,
        fetcher = globalThis.fetch,
        timeoutMs = DEFAULT_TIMEOUT_MS
    } = {}) {
        if (!context && typeof AudioContextClass !== "function") throw new Error("Web Audio is not supported");
        if (typeof AudioElementClass !== "function") throw new Error("HTML audio is not supported");
        if (typeof fetcher !== "function") throw new Error("audio adapter requires fetch");
        this.context = context ?? new AudioContextClass();
        this.AudioElementClass = AudioElementClass;
        this.fetcher = fetcher.bind(globalThis);
        this.timeoutMs = timeoutMs;
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.groups = Object.fromEntries(
            AUDIO_GROUPS.map((group) => {
                const node = this.context.createGain();
                node.connect(this.master);
                return [group, node];
            })
        );
        this.prepared = new Map();
        this.activeHandles = new Set();
        this.runtimeFailureListeners = new Set();
    }

    contextState() {
        return this.context.state;
    }

    async activate() {
        if (this.context.state !== "running") await this.context.resume();
    }

    setMasterGain(gain, transitionMs = 0) {
        setGain(this.master.gain, gain, this.context, transitionMs);
    }

    setGroupGain(group, gain, transitionMs = 0) {
        const node = this.groups[group];
        if (!node) throw new Error(`unknown audio group '${group}'`);
        setGain(node.gain, gain, this.context, transitionMs);
    }

    subscribeRuntimeFailures(listener) {
        if (typeof listener !== "function") throw new Error("runtime audio failure listener must be a function");
        this.runtimeFailureListeners.add(listener);
        return () => this.runtimeFailureListeners.delete(listener);
    }

    async prepare(definition, { onProgress = () => {} } = {}) {
        this.#clearPrepared();
        const clips = Object.values(definition.clips);
        const availableClipKeys = new Set();
        const failures = [];
        const diagnostics = [];
        let completed = 0;
        let requiredReady = 0;
        let optionalReady = 0;
        const requiredTotal = clips.filter(({ required }) => required).length;
        const optionalTotal = clips.length - requiredTotal;
        await Promise.all(
            clips.map(async (clip) => {
                try {
                    const prepared = await this.#prepareClip(clip);
                    this.prepared.set(clip.key, prepared);
                    availableClipKeys.add(clip.key);
                    if (clip.required) requiredReady += 1;
                    else optionalReady += 1;
                    diagnostics.push(
                        Object.freeze({
                            clipKey: clip.key,
                            required: clip.required,
                            status: "ready",
                            sourcePath: prepared.source.path,
                            mimeType: prepared.source.mimeType,
                            failureCode: null
                        })
                    );
                } catch (error) {
                    const failure = Object.freeze({
                        clipKey: clip.key,
                        required: clip.required,
                        status: "failed",
                        sourcePath: error.source?.path ?? null,
                        mimeType: error.source?.mimeType ?? null,
                        failureCode: errorCode(error)
                    });
                    failures.push(failure);
                    diagnostics.push(failure);
                } finally {
                    completed += 1;
                    onProgress(Object.freeze({ completed, total: clips.length }));
                }
            })
        );
        return Object.freeze({
            availableClipKeys,
            failures: Object.freeze(failures),
            clips: Object.freeze(diagnostics.sort((left, right) => left.clipKey.localeCompare(right.clipKey))),
            requiredReady,
            requiredTotal,
            optionalReady,
            optionalTotal
        });
    }

    playOneShot({ clipKey, group, gain, pitchRatio, pan, onEnded }) {
        const prepared = this.#requirePrepared(clipKey, "buffer");
        const source = this.context.createBufferSource();
        source.buffer = prepared.buffer;
        source.playbackRate.value = pitchRatio;
        const handle = this.#connectVoice({ source, group, gain, pan, onEnded });
        try {
            source.start();
        } catch (error) {
            handle.stop(0);
            throw error;
        }
        return handle;
    }

    playLoop({ clipKey, cueId, lifecycleKey, group, gain, pan, fadeInMs, onEnded = () => {} }) {
        const prepared = this.prepared.get(clipKey);
        if (!prepared) throw new Error(`audio clip '${clipKey}' is not prepared`);
        if (prepared.kind === "buffer") {
            const source = this.context.createBufferSource();
            source.buffer = prepared.buffer;
            source.loop = true;
            if (prepared.clip.loop) {
                source.loopStart = prepared.clip.loop.startSeconds;
                source.loopEnd = prepared.clip.loop.endSeconds;
            }
            const handle = this.#connectVoice({ source, group, gain, pan, fadeInMs, onEnded });
            try {
                source.start();
            } catch (error) {
                handle.stop(0);
                throw error;
            }
            return handle;
        }
        return this.#playStreamLoop(prepared, { cueId, lifecycleKey, group, gain, pan, fadeInMs, onEnded });
    }

    async suspend() {
        for (const prepared of this.prepared.values()) {
            if (prepared.kind !== "stream" || prepared.element.paused) continue;
            prepared.resumeAfterSuspend = true;
            prepared.element.pause();
        }
        if (this.context.state === "running") await this.context.suspend();
    }

    async resume() {
        if (this.context.state !== "running") await this.context.resume();
        const resumptions = [];
        for (const prepared of this.prepared.values()) {
            if (prepared.kind !== "stream" || !prepared.resumeAfterSuspend) continue;
            prepared.resumeAfterSuspend = false;
            resumptions.push(prepared.element.play());
        }
        await Promise.all(resumptions);
        return true;
    }

    release() {
        this.#clearPrepared();
        this.runtimeFailureListeners.clear();
        for (const group of Object.values(this.groups)) group.disconnect();
        this.master.disconnect();
        this.context.close?.();
    }

    #requirePrepared(clipKey, kind) {
        const prepared = this.prepared.get(clipKey);
        if (!prepared || prepared.kind !== kind) throw new Error(`audio clip '${clipKey}' is not a prepared ${kind}`);
        return prepared;
    }

    async #prepareClip(clip) {
        const attempts = [];
        for (const source of clip.sources) {
            try {
                if (clip.playback === "buffer") return await this.#prepareBuffer(clip, source);
                return await this.#prepareStream(clip, source);
            } catch (error) {
                error.source = source;
                attempts.push(error);
            }
        }
        const final = attempts.at(-1) ?? new Error("audio source list is empty");
        final.code = `all-sources-failed:${errorCode(final)}`;
        throw final;
    }

    async #prepareBuffer(clip, source) {
        const controller = new AbortController();
        let timeout = null;
        try {
            const preparation = (async () => {
                const response = await this.fetcher(source.url, { signal: controller.signal });
                if (!response?.ok) {
                    const error = new Error(`audio fetch failed (${response?.status ?? "network"})`);
                    error.code = "fetch-failed";
                    throw error;
                }
                return this.context.decodeAudioData(await response.arrayBuffer());
            })();
            const timedOut = new Promise((_, reject) => {
                timeout = setTimeout(() => {
                    controller.abort();
                    const error = new Error("buffer source readiness timed out");
                    error.code = "timeout";
                    reject(error);
                }, this.timeoutMs);
            });
            const buffer = await Promise.race([preparation, timedOut]);
            if (!buffer || !(buffer.duration > 0)) {
                const error = new Error("decoded audio buffer has no duration");
                error.code = "decode-empty";
                throw error;
            }
            if (!durationMatches(buffer.duration, clip.durationSeconds)) {
                const error = new Error("decoded audio duration does not match the manifest");
                error.code = "duration-mismatch";
                throw error;
            }
            const expectedChannels = clip.channels === "mono" ? 1 : 2;
            if (buffer.numberOfChannels !== expectedChannels) {
                const error = new Error("decoded audio channel count does not match the manifest");
                error.code = "channel-mismatch";
                throw error;
            }
            if (clip.loop && clip.loop.endSeconds > buffer.duration + 0.001) {
                const error = new Error("buffer loop end exceeds decoded duration");
                error.code = "loop-out-of-range";
                throw error;
            }
            return Object.freeze({ kind: "buffer", clip, source, buffer });
        } finally {
            clearTimeout(timeout);
        }
    }

    async #prepareStream(clip, source) {
        const element = new this.AudioElementClass();
        if (element.canPlayType?.(source.mimeType) === "") {
            const error = new Error(`media type '${source.mimeType}' is unsupported`);
            error.code = "mime-unsupported";
            throw error;
        }
        element.preload = "auto";
        element.src = source.url;
        try {
            await this.#waitForCanPlay(element);
            if (!(element.duration > 0)) {
                const error = new Error("stream metadata has no finite duration");
                error.code = "media-empty";
                throw error;
            }
            if (!durationMatches(element.duration, clip.durationSeconds)) {
                const error = new Error("stream duration does not match the manifest");
                error.code = "duration-mismatch";
                throw error;
            }
            if (clip.loop && clip.loop.endSeconds > element.duration + 0.001) {
                const error = new Error("stream loop end exceeds media duration");
                error.code = "loop-out-of-range";
                throw error;
            }
            const node = this.context.createMediaElementSource(element);
            return {
                kind: "stream",
                clip,
                source,
                element,
                node,
                activeHandle: null,
                resumeAfterSuspend: false
            };
        } catch (cause) {
            element.pause();
            element.removeAttribute?.("src");
            element.load?.();
            if (cause?.code) throw cause;
            const graphError = new Error("failed to connect media element to Web Audio", { cause });
            graphError.code = "graph-connect-failed";
            throw graphError;
        }
    }

    #clearPrepared() {
        for (const handle of [...this.activeHandles]) handle.stop(0);
        this.activeHandles.clear();
        for (const prepared of this.prepared.values()) {
            if (prepared.kind !== "stream") continue;
            prepared.element.pause();
            prepared.node.disconnect();
            prepared.element.removeAttribute?.("src");
            prepared.element.load?.();
        }
        this.prepared.clear();
    }

    #waitForCanPlay(element) {
        return new Promise((resolve, reject) => {
            let metadataReady = element.readyState >= 1;
            let canPlayReady = element.readyState >= 3;
            const cleanup = () => {
                clearTimeout(timer);
                element.removeEventListener("loadedmetadata", onMetadata);
                element.removeEventListener("canplay", onCanPlay);
                element.removeEventListener("error", onError);
            };
            const finish = () => {
                if (!metadataReady || !canPlayReady) return;
                cleanup();
                resolve();
            };
            const onMetadata = () => {
                metadataReady = true;
                finish();
            };
            const onCanPlay = () => {
                canPlayReady = true;
                finish();
            };
            const onError = () => {
                cleanup();
                const error = new Error("media element failed to load");
                error.code = "media-load-failed";
                reject(error);
            };
            const timer = setTimeout(() => {
                cleanup();
                const error = new Error("media element readiness timed out");
                error.code = "timeout";
                reject(error);
            }, this.timeoutMs);
            element.addEventListener("loadedmetadata", onMetadata);
            element.addEventListener("canplay", onCanPlay);
            element.addEventListener("error", onError);
            element.load();
            finish();
        });
    }

    #connectVoice({ source, group, gain, pan, fadeInMs = 0, onEnded = () => {} }) {
        const groupNode = this.groups[group];
        if (!groupNode) throw new Error(`unknown audio group '${group}'`);
        const gainNode = this.context.createGain();
        const panNode = this.context.createStereoPanner?.() ?? null;
        gainNode.gain.value = fadeInMs > 0 ? 0 : gain;
        if (panNode) panNode.pan.value = pan;
        source.connect(gainNode);
        if (panNode) {
            gainNode.connect(panNode);
            panNode.connect(groupNode);
        } else {
            gainNode.connect(groupNode);
        }
        if (fadeInMs > 0) setGain(gainNode.gain, gain, this.context, fadeInMs);
        let ended = false;
        let stopTimer = null;
        const cleanup = () => {
            if (ended) return;
            ended = true;
            clearTimeout(stopTimer);
            source.disconnect();
            gainNode.disconnect();
            panNode?.disconnect();
            this.activeHandles.delete(handle);
            onEnded();
        };
        const handle = Object.freeze({
            stop: (fadeMs = 0) => {
                if (ended) return;
                if (fadeMs > 0) {
                    setGain(gainNode.gain, 0, this.context, fadeMs);
                    stopTimer = setTimeout(() => {
                        try {
                            source.stop();
                        } catch {
                            // Cleanup below owns the terminal state even when the source never started.
                        } finally {
                            cleanup();
                        }
                    }, fadeMs);
                } else {
                    try {
                        source.stop();
                    } catch {
                        // Preserve the original playback error while releasing the graph.
                    } finally {
                        cleanup();
                    }
                }
            },
            setSpatial: ({ gain: nextGain, pan: nextPan }) => {
                setGain(gainNode.gain, nextGain, this.context, 30);
                if (panNode) setPan(panNode.pan, nextPan, this.context);
            }
        });
        source.addEventListener?.("ended", cleanup, { once: true });
        source.onended = cleanup;
        this.activeHandles.add(handle);
        return handle;
    }

    #playStreamLoop(prepared, { cueId, lifecycleKey, group, gain, pan, fadeInMs, onEnded }) {
        if (prepared.activeHandle) prepared.activeHandle.stop(0);
        const groupNode = this.groups[group];
        if (!groupNode) throw new Error(`unknown audio group '${group}'`);
        const gainNode = this.context.createGain();
        const panNode = this.context.createStereoPanner?.() ?? null;
        gainNode.gain.value = fadeInMs > 0 ? 0 : gain;
        if (panNode) panNode.pan.value = pan;
        prepared.node.connect(gainNode);
        if (panNode) {
            gainNode.connect(panNode);
            panNode.connect(groupNode);
        } else {
            gainNode.connect(groupNode);
        }
        if (fadeInMs > 0) setGain(gainNode.gain, gain, this.context, fadeInMs);
        const loop = prepared.clip.loop;
        const onTimeUpdate = () => {
            if (loop && prepared.element.currentTime >= loop.endSeconds)
                prepared.element.currentTime = loop.startSeconds;
        };
        prepared.element.loop = !loop;
        prepared.element.currentTime = loop?.startSeconds ?? 0;
        prepared.element.addEventListener("timeupdate", onTimeUpdate);
        let stopped = false;
        let stopTimer = null;
        const cleanup = () => {
            if (stopped) return;
            stopped = true;
            clearTimeout(stopTimer);
            prepared.element.pause();
            prepared.element.removeEventListener("timeupdate", onTimeUpdate);
            prepared.node.disconnect();
            gainNode.disconnect();
            panNode?.disconnect();
            prepared.activeHandle = null;
            this.activeHandles.delete(handle);
            onEnded();
        };
        const handle = Object.freeze({
            stop: (fadeMs = 0) => {
                if (stopped) return;
                if (fadeMs > 0) {
                    setGain(gainNode.gain, 0, this.context, fadeMs);
                    stopTimer = setTimeout(cleanup, fadeMs);
                } else cleanup();
            },
            setSpatial: ({ gain: nextGain, pan: nextPan }) => {
                setGain(gainNode.gain, nextGain, this.context, 30);
                if (panNode) setPan(panNode.pan, nextPan, this.context);
            }
        });
        prepared.activeHandle = handle;
        this.activeHandles.add(handle);
        const reportPlaybackFailure = (error) => {
            handle.stop(0);
            this.#reportRuntimeFailure({
                clipKey: prepared.clip.key,
                cueId,
                lifecycleKey,
                required: prepared.clip.required,
                failureCode: errorCode(error)
            });
        };
        try {
            Promise.resolve(prepared.element.play()).catch(reportPlaybackFailure);
        } catch (error) {
            reportPlaybackFailure(error);
            throw error;
        }
        return handle;
    }

    #reportRuntimeFailure(failure) {
        const record = Object.freeze(failure);
        for (const listener of this.runtimeFailureListeners) listener(record);
    }
}
