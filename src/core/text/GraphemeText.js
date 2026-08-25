const graphemeSegmenter =
    typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

export function graphemes(text) {
    const normalized = String(text);
    if (!graphemeSegmenter) return Array.from(normalized);
    return Array.from(graphemeSegmenter.segment(normalized), ({ segment }) => segment);
}

export function graphemeLength(text) {
    return graphemes(text).length;
}

export function truncateGraphemes(text, maximum) {
    if (!Number.isSafeInteger(maximum) || maximum < 0) throw new Error("maximum must be a non-negative safe integer");
    return graphemes(text).slice(0, maximum).join("");
}
