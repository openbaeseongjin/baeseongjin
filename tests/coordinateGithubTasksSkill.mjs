import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

export async function run() {
    const [skill, githubFlow, developmentRules, handoff, sourceAgent, cursorAgent, opencodeAgent] = await Promise.all([
        read("../.codex/skills/coordinate-github-tasks/SKILL.md"),
        read("../.codex/skills/github-task-flow/SKILL.md"),
        read("../docs/development-rules.md"),
        read("../SESSION-HANDOFF.md"),
        read("../.codex/skills/coordinate-github-tasks/agents/openai.yaml"),
        read("../.cursor/skills/coordinate-github-tasks/agents/openai.yaml"),
        read("../.opencode/skills/coordinate-github-tasks/agents/openai.yaml")
    ]);

    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(skill);
    assert.ok(frontmatter, "the coordination skill must have YAML frontmatter");
    assert.deepEqual(
        frontmatter[1].split(/\r?\n/).map((line) => line.split(":", 1)[0]),
        ["name", "description"],
        "skill frontmatter must contain only name and description"
    );

    assert.match(skill, /실제로 동시에 구현 소스를 수정/);
    assert.match(skill, /계획 전용 대화/);
    assert.match(skill, /완료된 대화.*메시지를 보내지/);
    assert.match(skill, /새 구현은 새 대화/);
    assert.doesNotMatch(skill, /phase: <planning/);
    assert.doesNotMatch(skill, /실제 diff·예정 파일/);
    assert.ok(skill.length < 7500, "the coordination skill must stay lightweight");

    assert.match(githubFlow, /실제로 동시에 구현 소스를 수정/);
    assert.doesNotMatch(githubFlow, /Issue 생성 뒤 전용 브랜치를 만들기 전에 .*coordinate-github-tasks/);
    assert.match(developmentRules, /계획 분배는 사용자가 소유/);
    assert.match(handoff, /완료된 대화를 재활성화하지 않/);

    assert.match(sourceAgent, /동시 소스 편집 대화의 실제 충돌만 최소 조정/);
    assert.match(sourceAgent, /\$coordinate-github-tasks/);
    assert.equal(cursorAgent, sourceAgent, "Cursor metadata must match the Codex source");
    assert.equal(opencodeAgent, sourceAgent, "OpenCode metadata must match the Codex source");
}
