import { canonicalizeBossStageSpec } from "./BossStageSpec.js";
import { validateBossStageSpec } from "./BossStageSpecValidator.js";
import { format } from "prettier";

export async function bossStageGeneratedModule(spec, { exportName = "BOSS_01_STAGE_SPEC" } = {}) {
    const validation = validateBossStageSpec(spec);
    if (!validation.valid) throw new Error(`boss-stage-spec-invalid:${validation.issues[0]?.code ?? "unknown"}`);
    const serialized = JSON.stringify(canonicalizeBossStageSpec(spec), null, 4);
    return format(
        `import { freezeBossStageValue } from "../BossStageSpec.js";\n\nexport const ${exportName} = freezeBossStageValue(${serialized});\n`,
        {
            parser: "babel",
            tabWidth: 4,
            useTabs: false,
            printWidth: 120,
            semi: true,
            singleQuote: false,
            trailingComma: "none",
            bracketSpacing: true,
            arrowParens: "always",
            endOfLine: "crlf"
        }
    );
}
