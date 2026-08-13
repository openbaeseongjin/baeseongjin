import { readFileSync, realpathSync, statSync } from "node:fs";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createAudioPackDefinition } from "../src/audio/AudioCatalog.js";
import { createAudioPackageDefinitionFromManifest } from "../src/audio/AudioManifest.js";
import { createAudioPackFromManifest } from "../src/audio/AudioPack.js";

function readJson(path, label) {
    try {
        return JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
        throw new Error(`Failed to read ${label} '${path}': ${error.message}`);
    }
}

function assertInsideDirectory(root, path, label) {
    const child = relative(root, path);
    if (!child || child.startsWith("..") || isAbsolute(child)) {
        throw new Error(`${label} '${path}' must stay inside '${root}'`);
    }
}

function readWaveInfo(path) {
    const data = readFileSync(path);
    if (data.length < 44 || data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WAVE") {
        throw new Error(`Audio source '${path}' is not a valid RIFF/WAVE file`);
    }
    let offset = 12;
    let format = null;
    let dataBytes = null;
    while (offset + 8 <= data.length) {
        const id = data.toString("ascii", offset, offset + 4);
        const size = data.readUInt32LE(offset + 4);
        const start = offset + 8;
        if (start + size > data.length) throw new Error(`Audio source '${path}' has a truncated '${id}' chunk`);
        if (id === "fmt " && size >= 16) {
            format = Object.freeze({
                encoding: data.readUInt16LE(start),
                channels: data.readUInt16LE(start + 2),
                sampleRate: data.readUInt32LE(start + 4),
                byteRate: data.readUInt32LE(start + 8),
                blockAlign: data.readUInt16LE(start + 12),
                bitsPerSample: data.readUInt16LE(start + 14)
            });
        }
        if (id === "data") dataBytes = size;
        offset = start + size + (size % 2);
    }
    if (!format || dataBytes === null || format.byteRate <= 0) {
        throw new Error(`Audio source '${path}' requires valid fmt and data chunks`);
    }
    if (format.encoding !== 1 && format.encoding !== 3) {
        throw new Error(`Audio source '${path}' uses unsupported WAVE encoding ${format.encoding}`);
    }
    const allowedDepths = format.encoding === 1 ? new Set([8, 16, 24, 32]) : new Set([32, 64]);
    if (!allowedDepths.has(format.bitsPerSample)) {
        throw new Error(`Audio source '${path}' uses unsupported ${format.bitsPerSample}-bit samples`);
    }
    const expectedBlockAlign = (format.channels * format.bitsPerSample) / 8;
    if (format.blockAlign !== expectedBlockAlign || format.byteRate !== format.sampleRate * expectedBlockAlign) {
        throw new Error(`Audio source '${path}' has inconsistent WAVE rate or block alignment`);
    }
    return Object.freeze({ ...format, durationSeconds: dataBytes / format.byteRate, bytes: data.length });
}

function assertCompressedAudioSignature(path, mimeType) {
    const data = readFileSync(path);
    const valid =
        (mimeType === "audio/ogg" && data.toString("ascii", 0, 4) === "OggS") ||
        (mimeType === "audio/webm" && data.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) ||
        (mimeType === "audio/mpeg" &&
            (data.toString("ascii", 0, 3) === "ID3" || (data[0] === 0xff && (data[1] & 0xe0) === 0xe0)));
    if (!valid) throw new Error(`Audio source '${path}' content does not match '${mimeType}'`);
}

function validateSource(packageRoot, realPackageRoot, clip, source) {
    const sourcePath = resolve(packageRoot, source.path);
    assertInsideDirectory(packageRoot, sourcePath, "Audio source");
    const realSourcePath = realpathSync(sourcePath);
    assertInsideDirectory(realPackageRoot, realSourcePath, "Audio source");
    const sourceStat = statSync(realSourcePath);
    if (!sourceStat.isFile() || sourceStat.size === 0) {
        throw new Error(`Audio source '${realSourcePath}' must be a non-empty file`);
    }
    const extension = extname(realSourcePath).toLowerCase();
    const expectedExtension = {
        "audio/wav": ".wav",
        "audio/ogg": ".ogg",
        "audio/mpeg": ".mp3",
        "audio/webm": ".webm"
    }[source.mimeType];
    if (extension !== expectedExtension) {
        throw new Error(`Audio source '${source.path}' extension does not match '${source.mimeType}'`);
    }
    if (source.mimeType !== "audio/wav") {
        assertCompressedAudioSignature(realSourcePath, source.mimeType);
        return Object.freeze({ durationSeconds: null, bytes: sourceStat.size });
    }
    const info = readWaveInfo(realSourcePath);
    if (info.sampleRate !== 48000)
        throw new Error(`Audio source '${source.path}' must use 48000 Hz; found ${info.sampleRate}`);
    const expectedChannels = clip.channels === "mono" ? 1 : 2;
    if (info.channels !== expectedChannels) {
        throw new Error(
            `Audio source '${source.path}' must have ${expectedChannels} channel(s); found ${info.channels}`
        );
    }
    if (info.durationSeconds <= 0) throw new Error(`Audio source '${source.path}' must have positive duration`);
    if (Math.abs(info.durationSeconds - clip.durationSeconds) > 0.005) {
        throw new Error(
            `Audio source '${source.path}' duration ${info.durationSeconds.toFixed(3)}s does not match ${clip.durationSeconds}s`
        );
    }
    if (clip.loop && clip.loop.endSeconds > info.durationSeconds + 0.001) {
        throw new Error(`Audio source '${source.path}' loop end exceeds duration ${info.durationSeconds.toFixed(3)}s`);
    }
    return info;
}

export function validateAudioPackageDirectory(directory) {
    const root = resolve(directory);
    if (!statSync(root).isDirectory()) throw new Error(`Audio asset path '${root}' must be a directory`);
    const manifestPath = resolve(root, "audio-manifest.json");
    const manifest = readJson(manifestPath, "audio manifest");
    const definition = createAudioPackageDefinitionFromManifest(manifest, {
        baseUrl: pathToFileURL(manifestPath).href
    });
    const realRoot = realpathSync(root);
    let sourceCount = 0;
    let totalBytes = 0;
    for (const clip of Object.values(definition.clips)) {
        for (const source of clip.sources) {
            const info = validateSource(root, realRoot, clip, source);
            sourceCount += 1;
            totalBytes += info.bytes;
        }
    }
    return Object.freeze({
        id: definition.id,
        category: definition.category,
        directory: root,
        definition,
        clipCount: Object.keys(definition.clips).length,
        cueCount: Object.keys(definition.cues).length,
        sourceCount,
        totalBytes
    });
}

export function validateAudioPackDirectory(directory) {
    const root = resolve(directory);
    if (!statSync(root).isDirectory()) throw new Error(`Audio pack path '${root}' must be a directory`);
    const manifestPath = resolve(root, "audio-pack.json");
    const pack = createAudioPackFromManifest(readJson(manifestPath, "audio pack"));
    const runtimeRoot = resolve(root, "..", "..");
    const packages = {};
    const results = [];
    for (const reference of pack.packages) {
        const result = validateAudioPackageDirectory(resolve(runtimeRoot, reference.category, reference.assetId));
        packages[reference.category] = result.definition;
        results.push(result);
    }
    const definition = createAudioPackDefinition(pack, packages);
    return Object.freeze({
        id: definition.id,
        directory: root,
        packageCount: results.length,
        clipCount: Object.keys(definition.clips).length,
        cueCount: Object.keys(definition.cues).length,
        sourceCount: results.reduce((sum, result) => sum + result.sourceCount, 0),
        totalBytes: results.reduce((sum, result) => sum + result.totalBytes, 0)
    });
}

function runCli() {
    const directories = process.argv.slice(2);
    if (directories.length > 1) throw new Error("Usage: npm run validate:audio-assets -- <pack-or-package-directory>");
    const directory = directories[0] ?? "assets/runtime/audio/packs/default-mock";
    const result = statSync(resolve(directory, "audio-pack.json"), { throwIfNoEntry: false })
        ? validateAudioPackDirectory(directory)
        : validateAudioPackageDirectory(directory);
    console.log(
        `Audio assets valid: ${result.id} (${result.packageCount ?? 1} packages, ${result.clipCount} clips, ${result.cueCount} cues, ${result.sourceCount} sources)`
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    try {
        runCli();
    } catch (error) {
        console.error(`Audio asset validation failed: ${error.message}`);
        process.exitCode = 1;
    }
}
