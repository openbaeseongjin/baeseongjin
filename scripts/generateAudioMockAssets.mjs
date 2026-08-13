import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SAMPLE_RATE = 48000;

function clampSample(value) {
    return Math.max(-1, Math.min(1, value));
}

function envelope(time, duration, attack = 0.01, release = 0.05) {
    return Math.min(1, time / attack, (duration - time) / release);
}

function writeWave(relativePath, { duration, channels, sample }) {
    const frameCount = Math.round(duration * SAMPLE_RATE);
    const bytesPerSample = 2;
    const dataSize = frameCount * channels * bytesPerSample;
    const output = Buffer.alloc(44 + dataSize);
    output.write("RIFF", 0, "ascii");
    output.writeUInt32LE(36 + dataSize, 4);
    output.write("WAVE", 8, "ascii");
    output.write("fmt ", 12, "ascii");
    output.writeUInt32LE(16, 16);
    output.writeUInt16LE(1, 20);
    output.writeUInt16LE(channels, 22);
    output.writeUInt32LE(SAMPLE_RATE, 24);
    output.writeUInt32LE(SAMPLE_RATE * channels * bytesPerSample, 28);
    output.writeUInt16LE(channels * bytesPerSample, 32);
    output.writeUInt16LE(16, 34);
    output.write("data", 36, "ascii");
    output.writeUInt32LE(dataSize, 40);
    let offset = 44;
    for (let frame = 0; frame < frameCount; frame += 1) {
        const time = frame / SAMPLE_RATE;
        for (let channel = 0; channel < channels; channel += 1) {
            output.writeInt16LE(Math.round(clampSample(sample(time, channel, duration)) * 32767), offset);
            offset += bytesPerSample;
        }
    }
    const path = resolve(ROOT, relativePath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, output);
}

function sine(frequency, time, phase = 0) {
    return Math.sin(Math.PI * 2 * frequency * time + phase);
}

const definitions = [
    {
        path: "assets/runtime/audio/ui/default-mock/confirm.wav",
        duration: 0.12,
        channels: 1,
        sample: (time, _channel, duration) =>
            0.22 * envelope(time, duration, 0.006, 0.04) * (sine(660, time) + sine(990, time) * 0.35)
    },
    {
        path: "assets/runtime/audio/gameplay/default-mock/rope-attach.wav",
        duration: 0.18,
        channels: 1,
        sample: (time, _channel, duration) => {
            const frequency = 190 + 720 * (time / duration);
            return 0.3 * envelope(time, duration, 0.004, 0.06) * sine(frequency, time);
        }
    },
    {
        path: "assets/runtime/audio/gameplay/default-mock/weapon-fire-a.wav",
        duration: 0.1,
        channels: 1,
        sample: (time, _channel, duration) =>
            0.32 * envelope(time, duration, 0.002, 0.06) * (sine(170, time) + sine(510, time) * 0.35)
    },
    {
        path: "assets/runtime/audio/gameplay/default-mock/weapon-fire-b.wav",
        duration: 0.1,
        channels: 1,
        sample: (time, _channel, duration) =>
            0.3 * envelope(time, duration, 0.002, 0.055) * (sine(184, time) + sine(552, time) * 0.32)
    },
    {
        path: "assets/runtime/audio/gameplay/default-mock/player-hit.wav",
        duration: 0.22,
        channels: 1,
        sample: (time, _channel, duration) =>
            0.34 * envelope(time, duration, 0.003, 0.12) * (sine(82, time) + sine(123, time) * 0.55)
    },
    {
        path: "assets/runtime/audio/gameplay/default-mock/checkpoint-reached.wav",
        duration: 0.42,
        channels: 1,
        sample: (time, _channel, duration) => {
            const frequency = time < 0.14 ? 440 : time < 0.28 ? 554.37 : 659.25;
            return 0.2 * envelope(time, duration, 0.01, 0.08) * sine(frequency, time);
        }
    },
    {
        path: "assets/runtime/audio/ambience/default-mock/altitude-wind.wav",
        duration: 2,
        channels: 2,
        sample: (time, channel) => {
            const phase = channel === 0 ? 0 : Math.PI * 0.45;
            return 0.08 * (sine(73, time, phase) * 0.45 + sine(149, time, -phase) * 0.25 + sine(7, time) * 0.3);
        }
    },
    {
        path: "assets/runtime/audio/bgm/default-mock/climb.wav",
        duration: 3,
        channels: 2,
        sample: (time, channel) => {
            const phase = channel === 0 ? 0 : Math.PI * 0.08;
            return 0.085 * (sine(110, time, phase) + sine(165, time, -phase) * 0.55 + sine(220, time) * 0.25);
        }
    },
    {
        path: "assets/runtime/audio/bgm/default-mock/run-complete.wav",
        duration: 2,
        channels: 2,
        sample: (time, channel) => {
            const phase = channel === 0 ? 0 : Math.PI * 0.1;
            return 0.09 * (sine(130.81, time, phase) + sine(196, time, -phase) * 0.52 + sine(261.63, time) * 0.28);
        }
    }
];

for (const definition of definitions) writeWave(definition.path, definition);
console.log(`Generated ${definitions.length} deterministic mock WAV files at ${SAMPLE_RATE}Hz.`);
