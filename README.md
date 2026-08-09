# Baeseongjin Hackathon Repository

This repository is a secure, lightweight starting point for rapid hackathon development. Project source code and runtime-specific setup instructions can be added without changing the repository safeguards established here.

## Repository safeguards

- Changes to `main` are intended to arrive through pull requests.
- CI checks repository hygiene before merge.
- GitHub Pages publishes the static site in `docs/`.
- Secret scanning, push protection, Dependabot alerts, and security updates are enabled at the repository level.
- Destructive operations and license selection require an explicit maintainer decision.

## AI operating instructions

Production instruction sets are versioned in:

- `.github/system_prompts/chatgpt_custom_instructions.md`
- `.github/system_prompts/codex_system_prompt.md`

Repository-wide agent rules are in `AGENTS.md`. The Google Workspace logging design is documented in the prompts, but it remains inactive until maintainers provide approved Google credentials plus the target Sheet and Drive folder identifiers.

## Development

1. Create a short-lived branch from `main`.
2. Add the project runtime and its tests.
3. Update CI with the project-specific test command.
4. Open a pull request and wait for required checks.

No license has been selected. Do not assume reuse rights until maintainers add one deliberately.

## Discord meeting minutes bot

The isolated service in `services/meeting-bot/` records slash-command-controlled Discord meetings, transcribes voice with speaker attribution, generates guarded structured minutes, posts them to Discord, and writes approved meeting artifacts back to this repository. It does not start meetings on a schedule and it never promotes ambiguous ideas into `DECISIONS.md` or `TASKS.md`.

See `services/meeting-bot/README.md` for Discord Developer Portal setup, least-privilege OpenAI and GitHub configuration, local execution, Docker deployment, privacy requirements, and current DAVE voice-receive limitations.
