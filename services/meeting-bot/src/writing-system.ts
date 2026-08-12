const unsupportedWritingSystem = /\p{Script=Han}|[^\P{L}\p{Script=Latin}\p{Script=Hangul}]/u;

export function usesKoreanOrEnglishWritingSystems(value: string): boolean {
    return !unsupportedWritingSystem.test(value.normalize("NFKC"));
}
