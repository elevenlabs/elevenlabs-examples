#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path
from textwrap import dedent

REPO_ROOT = Path(__file__).resolve().parents[4]
SUPPORTED_COMBOS = {
    ("text-to-speech", "typescript"),
    ("text-to-speech", "python"),
    ("speech-to-text", "typescript"),
    ("speech-to-text", "python"),
    ("speech-to-text", "nextjs"),
    ("music", "typescript"),
    ("agents", "nextjs"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scaffold a new prompt-driven ElevenLabs example."
    )
    parser.add_argument(
        "--path",
        required=True,
        help="Relative path like speech-to-text/python/my-example",
    )
    parser.add_argument("--title", required=True, help="README title")
    parser.add_argument("--summary", required=True, help="One-sentence README summary")
    parser.add_argument(
        "--with-assets",
        action="store_true",
        help="Create assets/ and include the asset copy step in setup.sh",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite scaffold files in an existing directory.",
    )
    return parser.parse_args()


def parse_example_path(path_text: str) -> tuple[str, str, str]:
    clean_path = path_text.strip().strip("/")
    parts = [part for part in clean_path.split("/") if part]
    if len(parts) != 3:
        raise SystemExit(
            "Example paths must look like <product>/<runtime>/<slug>, for example "
            "speech-to-text/python/my-example."
        )

    product, runtime, slug = parts
    if any(part in {".", ".."} for part in parts):
        raise SystemExit("Path segments cannot contain '.' or '..'.")

    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
        raise SystemExit("Slug must use lowercase letters, numbers, and hyphens only.")

    if (product, runtime) not in SUPPORTED_COMBOS:
        combos = ", ".join(
            f"{product_name}/{runtime_name}"
            for product_name, runtime_name in sorted(SUPPORTED_COMBOS)
        )
        raise SystemExit(
            f"Unsupported product/runtime '{product}/{runtime}'. "
            f"Supported combinations: {combos}."
        )

    return product, runtime, slug


def closest_reference(product: str, runtime: str) -> str:
    if product == "agents" and runtime == "nextjs":
        return "agents/nextjs/quickstart"
    if product == "speech-to-text" and runtime == "nextjs":
        return "speech-to-text/nextjs/realtime"
    return f"{product}/{runtime}/quickstart"


def build_prompt(product: str, runtime: str) -> str:
    if product == "text-to-speech" and runtime == "typescript":
        return dedent(
            """\
            Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

            ## `index.ts`

            Create a minimal script that generates an MP3 from text using ElevenLabs Text-to-Speech.

            - Load env vars from `.env`.
            - Read text from CLI args; fall back to a short default sentence.
            - Generate speech with `voiceId: "JBFqnCBsd6RMkjVDRZzb"` and `modelId: "eleven_multilingual_v2"`.
            - Write output audio to `output.mp3`.
            - Print success message with the output path.
            - Handle errors with a readable message.
            """
        )

    if product == "text-to-speech" and runtime == "python":
        return dedent(
            """\
            Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

            ## `main.py`

            Create a minimal script that generates an MP3 from text using ElevenLabs Text-to-Speech.

            - Import everything at the top. Call `load_dotenv()` after imports, then pass `api_key=os.environ["ELEVENLABS_API_KEY"]` explicitly to the `ElevenLabs` client.
            - Read text from CLI args; fall back to a short default sentence.
            - Generate speech with `voice_id="JBFqnCBsd6RMkjVDRZzb"` and `model_id="eleven_multilingual_v2"`.
            - Write output audio to `output.mp3`.
            - Print success message with the output path.
            - Handle errors with a readable message.
            """
        )

    if product == "speech-to-text" and runtime == "typescript":
        return dedent(
            """\
            Before writing any code, invoke the `/speech-to-text` skill to learn the correct ElevenLabs SDK patterns.

            ## `index.ts`

            Create a minimal script that transcribes audio with ElevenLabs Scribe v2.

            - Load env vars from `.env`.
            - Read first CLI arg as optional audio file path; default to `./audio.mp3`.
            - Use `ElevenLabsClient` and call Speech-to-Text with `modelId: "scribe_v2"`.
            - Print transcript text to stdout.
            - Handle errors with a readable message.
            """
        )

    if product == "speech-to-text" and runtime == "python":
        return dedent(
            """\
            Before writing any code, invoke the `/speech-to-text` skill to learn the correct ElevenLabs SDK patterns.

            ## `main.py`

            Create a minimal script that transcribes audio with ElevenLabs Scribe v2.

            - Import everything at the top. Call `load_dotenv()` after imports, then pass `api_key=os.environ["ELEVENLABS_API_KEY"]` explicitly to the `ElevenLabs` client.
            - Read first CLI arg as optional audio file path; default to `./audio.mp3`.
            - Use `ElevenLabs` client and call Speech-to-Text with `model_id="scribe_v2"`.
            - Print transcript text to stdout.
            - Handle errors with a readable message.
            """
        )

    if product == "speech-to-text" and runtime == "nextjs":
        return dedent(
            """\
            Before writing any code, invoke the `/speech-to-text` skill to learn the correct ElevenLabs SDK patterns.

            ## 1. `app/api/scribe-token/route.ts`

            Secure GET endpoint that returns a single-use realtime Scribe token.
            Never expose `ELEVENLABS_API_KEY` to the client.

            ## 2. `app/page.tsx`

            Realtime microphone transcription page.

            - Use the ElevenLabs React SDK's realtime scribe hook with VAD commit strategy.
            - Fetch a fresh token from the API route on each start (tokens are single-use).
            - Show a Start/Stop toggle, connection status, live waveform (use `LiveWaveform` from `components/ui`), partial transcript, and committed transcript history (newest first).
            - Keep committed history across stop/start; clear transient state on disconnect.
            - Handle connection errors gracefully and allow reconnect.
            """
        )

    if product == "music" and runtime == "typescript":
        return dedent(
            """\
            Before writing any code, invoke the `/music` skill to learn the correct ElevenLabs SDK patterns.

            ## `index.ts`

            Create a minimal script that generates music from a text prompt using the ElevenLabs JS SDK.

            - Load env vars from `.env`.
            - Read the music prompt from CLI args; fall back to `A chill lo-fi beat with jazzy piano chords`.
            - Use `ElevenLabsClient` and call `client.music.compose` with `musicLengthMs: 10000`.
            - Save the returned audio to `output.mp3` with `Readable.from(track)` and `pipeline`.
            - Print a success message with the output path.
            - Handle errors with a readable message.
            """
        )

    if product == "agents" and runtime == "nextjs":
        return dedent(
            """\
            Before writing any code, invoke the `/agents` skill to learn the correct ElevenLabs SDK patterns.

            ## 1. `package.json`

            - Add `@elevenlabs/react` and `elevenlabs` SDK dependencies.

            ## 2. `app/api/agent/route.ts`

            Secure route that creates or loads a voice agent. Never expose `ELEVENLABS_API_KEY` to the client.

            - `POST` creates a new voice agent with sensible defaults (name, system prompt, first message, TTS voice). Use the CLI `voice-only` template as reference for the agent shape.
            - `GET` loads an existing agent by `agentId`.
            - Configure as voice-first: real TTS voice and model, text-only disabled, widget text input disabled.
            - For English agents (`language: "en"`), use `tts.modelId: "eleven_flash_v2"`. Do not use `eleven_flash_v2_5` for English-only agents, or agent creation may fail validation.
            - Enable client events needed for transcript rendering and audio.
            - Return `{ agentId, agentName }`.

            ## 3. `app/api/conversation-token/route.ts`

            Secure GET endpoint that returns a fresh conversation token for a given `agentId`.
            Never expose `ELEVENLABS_API_KEY` to the client.

            ## 4. `app/page.tsx`

            Minimal Next.js voice agent page.

            - Use `@elevenlabs/react` and the `useConversation` hook.
            - Show a `Create Agent` button and an editable agent-id input. Auto-populate on create; allow pasting a different id to load it instead.
            - Start WebRTC sessions with a fresh token from `/api/conversation-token`. Request mic access before starting.
            - Show a Start/Stop toggle, connection status, and running conversation transcript (append messages, don't replace).
            - Handle errors gracefully and allow reconnect. Keep the UI simple and voice-first.
            """
        )

    raise SystemExit(f"Unsupported prompt scaffold for {product}/{runtime}.")


def join_blocks(*blocks: str) -> str:
    cleaned_blocks = [block.strip("\n") for block in blocks if block.strip("\n")]
    return "\n\n".join(cleaned_blocks) + "\n"


def build_readme(
    product: str,
    runtime: str,
    title: str,
    summary: str,
    with_assets: bool,
) -> str:
    title_block = f"# {title}\n\n{summary}"

    if product == "text-to-speech" and runtime == "typescript":
        return join_blocks(
            title_block,
            dedent(
                """\
                ## Setup

                1. Copy the environment file and add your API key:

                   ```bash
                   cp .env.example .env
                   ```

                   Then edit `.env` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

                2. Install dependencies:

                   ```bash
                   pnpm install
                   ```
                """
            ),
            dedent(
                """\
                ## Run

                ```bash
                pnpm run start "Hello from ElevenLabs"
                ```

                The generated audio is saved to `output.mp3`.
                """
            ),
        )

    if product == "text-to-speech" and runtime == "python":
        return join_blocks(
            title_block,
            dedent(
                """\
                ## Setup

                1. Copy the environment file and add your API key:

                   ```bash
                   cp .env.example .env
                   ```

                   Then edit `.env` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

                2. Create a virtual environment and install dependencies:

                   ```bash
                   python3 -m venv .venv
                   .venv/bin/pip install -r requirements.txt
                   ```
                """
            ),
            dedent(
                """\
                ## Run

                ```bash
                .venv/bin/python main.py "Hello from ElevenLabs"
                ```

                The generated audio is saved to `output.mp3`.
                """
            ),
        )

    if product == "speech-to-text" and runtime == "typescript":
        run_section = dedent(
            """\
            Transcribe a local file:

            ```bash
            pnpm run start ./audio.mp3
            ```
            """
        )
        if with_assets:
            run_section = dedent(
                """\
                Transcribe the bundled sample:

                ```bash
                pnpm run start
                ```

                Transcribe a local file:

                ```bash
                pnpm run start ./audio.mp3
                ```
                """
            )

        return join_blocks(
            title_block,
            dedent(
                """\
                ## Setup

                1. Copy the example env file and add your API key:

                   ```bash
                   cp .env.example .env
                   ```

                   Then edit `.env` and add your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

                2. Install dependencies:

                   ```bash
                   pnpm install
                   ```
                """
            ),
            "## Run\n\n" + run_section.strip(),
        )

    if product == "speech-to-text" and runtime == "python":
        run_section = dedent(
            """\
            Transcribe a local file:

            ```bash
            .venv/bin/python main.py ./audio.mp3
            ```
            """
        )
        if with_assets:
            run_section = dedent(
                """\
                Transcribe the bundled sample:

                ```bash
                .venv/bin/python main.py
                ```

                Transcribe a local file:

                ```bash
                .venv/bin/python main.py ./audio.mp3
                ```
                """
            )

        return join_blocks(
            title_block,
            dedent(
                """\
                ## Setup

                1. Copy the example env file and add your API key:

                   ```bash
                   cp .env.example .env
                   ```

                   Then edit `.env` and add your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

                2. Create a virtual environment and install dependencies:

                   ```bash
                   python3 -m venv .venv
                   .venv/bin/pip install -r requirements.txt
                   ```
                """
            ),
            "## Run\n\n" + run_section.strip(),
        )

    if product == "speech-to-text" and runtime == "nextjs":
        return join_blocks(
            title_block,
            dedent(
                """\
                ## Setup

                1. Copy the environment file and add your API key:

                   ```bash
                   cp .env.example .env
                   ```

                   Then edit `.env` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

                2. Install dependencies:

                   ```bash
                   pnpm install
                   ```
                """
            ),
            dedent(
                """\
                ## Run

                ```bash
                pnpm run dev
                ```

                Open [http://localhost:3000](http://localhost:3000) in your browser.
                """
            ),
            dedent(
                """\
                ## Usage

                - Click **Start** and allow microphone access when prompted.
                - Speak naturally. Partial text should appear while you talk and committed segments should remain in history.
                - Click **Stop** to end the session.
                """
            ),
        )

    if product == "music" and runtime == "typescript":
        return join_blocks(
            title_block,
            dedent(
                """\
                ## Setup

                1. Copy the environment file and add your API key:

                   ```bash
                   cp .env.example .env
                   ```

                   Then edit `.env` and paste your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

                2. Install dependencies:

                   ```bash
                   pnpm install
                   ```

                The Music API is currently available to paid ElevenLabs users.
                """
            ),
            dedent(
                """\
                ## Run

                ```bash
                pnpm run start "A chill lo-fi beat with jazzy piano chords"
                ```

                The generated track is saved to `output.mp3`.
                """
            ),
        )

    if product == "agents" and runtime == "nextjs":
        return join_blocks(
            title_block,
            dedent(
                """\
                ## Setup

                1. Copy the environment file and add your credentials:

                   ```bash
                   cp .env.example .env
                   ```

                   Then edit `.env` and set:
                   - `ELEVENLABS_API_KEY`

                2. Install dependencies:

                   ```bash
                   pnpm install
                   ```
                """
            ),
            dedent(
                """\
                ## Run

                ```bash
                pnpm run dev
                ```

                Open [http://localhost:3000](http://localhost:3000) in your browser.
                """
            ),
            dedent(
                """\
                ## Usage

                - Click **Create Agent** to create a voice-first agent and populate the agent id field.
                - Paste a different agent id when you want to load an existing agent instead.
                - Click **Start** and allow microphone access when prompted.
                - Speak naturally and watch the running conversation transcript update.
                - Click **Stop** to end the session.
                """
            ),
        )

    raise SystemExit(f"Unsupported README scaffold for {product}/{runtime}.")


def asset_block_lines() -> list[str]:
    return [
        "# Copy sample assets into example/",
        'if [ -d "$DIR/assets" ]; then',
        '  cp -a "$DIR/assets/." example/',
        "fi",
    ]


def lines_to_text(lines: list[str]) -> str:
    return "\n".join(lines) + "\n"


def build_setup(
    product: str,
    runtime: str,
    slug: str,
    with_assets: bool,
) -> str:
    if runtime == "typescript":
        lines = [
            "#!/usr/bin/env bash",
            "set -euo pipefail",
            "",
            'DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"',
            'REPO_ROOT="$(cd "$DIR/../../.." && pwd)"',
            'cd "$DIR"',
            "",
            "# Clean example/ but preserve node_modules for speed",
            "if [ -d example ]; then",
            "  find example -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +",
            "fi",
            "mkdir -p example",
            "",
            "# Copy shared template into example/",
            "rsync -a \\",
            "  --exclude node_modules \\",
            "  --exclude pnpm-lock.yaml --exclude package-lock.json \\",
            "  --exclude example \\",
            '  "$REPO_ROOT/templates/typescript/" example/',
            "",
            "# Copy project-specific README",
            "cp README.md example/README.md",
        ]
        if with_assets:
            lines.extend(["", *asset_block_lines()])
        lines.extend(
            [
                "",
                "# Setup env",
                'if [ -f "$DIR/.env" ]; then',
                '  cp "$DIR/.env" example/.env',
                "fi",
                "",
                "# Install dependencies",
                "cd example",
                "pnpm install --config.confirmModulesPurge=false",
            ]
        )
        return lines_to_text(lines)

    if runtime == "python":
        lines = [
            "#!/usr/bin/env bash",
            "set -euo pipefail",
            "",
            'DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"',
            'REPO_ROOT="$(cd "$DIR/../../.." && pwd)"',
            'cd "$DIR"',
            "",
            "# Clean example/ but preserve .venv for speed",
            "if [ -d example ]; then",
            "  find example -mindepth 1 -maxdepth 1 ! -name .venv -exec rm -rf {} +",
            "fi",
            "mkdir -p example",
            "",
            "# Copy shared template into example/",
            "rsync -a \\",
            "  --exclude .venv \\",
            "  --exclude example \\",
            '  "$REPO_ROOT/templates/python/" example/',
            "",
            "# Copy project-specific README",
            "cp README.md example/README.md",
        ]
        if with_assets:
            lines.extend(["", *asset_block_lines()])
        lines.extend(
            [
                "",
                "# Setup env",
                'if [ -f "$DIR/.env" ]; then',
                '  cp "$DIR/.env" example/.env',
                "fi",
                "",
                "# Install dependencies",
                "cd example",
                "python3 -m venv .venv",
                ".venv/bin/pip install --upgrade pip",
                ".venv/bin/pip install -r requirements.txt",
            ]
        )
        return lines_to_text(lines)

    if runtime == "nextjs":
        package_name = f"{product}-{slug}"
        node_lines = [
            "  const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));",
            f"  pkg.name = '{package_name}';",
            "  pkg.dependencies['@elevenlabs/react'] = '^' + process.env.REACT_VER;",
            "  pkg.dependencies['@elevenlabs/elevenlabs-js'] = '^' + process.env.ELEVENLABS_VER;",
        ]
        if product == "agents":
            node_lines.append("  delete pkg.dependencies['@elevenlabs/client'];")
        node_lines.append(
            "  require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\\n');"
        )
        lines = [
            "#!/usr/bin/env bash",
            "set -euo pipefail",
            "",
            'DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"',
            'REPO_ROOT="$(cd "$DIR/../../.." && pwd)"',
            'cd "$DIR"',
            "",
            "# Clean example/ but preserve node_modules for speed",
            "if [ -d example ]; then",
            "  find example -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .next -exec rm -rf {} +",
            "fi",
            "mkdir -p example",
            "",
            "# Copy shared template structure",
            "rsync -a \\",
            "  --exclude node_modules --exclude .next \\",
            "  --exclude pnpm-lock.yaml --exclude package-lock.json \\",
            "  --exclude example \\",
            '  "$REPO_ROOT/templates/nextjs/" example/',
            "",
            "# Copy project-specific README",
            "cp README.md example/README.md",
        ]
        if with_assets:
            lines.extend(["", *asset_block_lines()])
        lines.extend(
            [
                "",
                "# Add ElevenLabs dependencies",
                "cd example",
                "export REACT_VER=$(npm view @elevenlabs/react version)",
                "export ELEVENLABS_VER=$(npm view @elevenlabs/elevenlabs-js version)",
                'node -e "',
                *node_lines,
                '"',
            ]
        )
        if product == "speech-to-text":
            lines.extend(
                [
                    "",
                    "# Create API route directory",
                    "mkdir -p app/api/scribe-token",
                ]
            )
        if product == "agents":
            lines.extend(
                [
                    "",
                    "# Create API route directories",
                    "mkdir -p app/api/agent",
                    "mkdir -p app/api/conversation-token",
                ]
            )
        lines.extend(
            [
                "",
                "# Setup env",
                'if [ -f "$DIR/.env" ]; then',
                '  cp "$DIR/.env" .env.local',
                "fi",
                "",
                "# Install dependencies",
                "pnpm install --config.confirmModulesPurge=false",
            ]
        )
        return lines_to_text(lines)

    raise SystemExit(f"Unsupported setup scaffold for runtime '{runtime}'.")


def write_file(path: Path, content: str) -> None:
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def main() -> None:
    args = parse_args()
    product, runtime, slug = parse_example_path(args.path)

    target_dir = (REPO_ROOT / args.path.strip().strip("/")).resolve()
    if REPO_ROOT not in target_dir.parents:
        raise SystemExit("Target path must stay inside the repository root.")

    if target_dir.exists() and any(target_dir.iterdir()) and not args.force:
        raise SystemExit(
            f"Target directory '{args.path}' already exists and is not empty. "
            "Use --force to overwrite scaffold files."
        )

    target_dir.mkdir(parents=True, exist_ok=True)
    if args.with_assets:
        (target_dir / "assets").mkdir(exist_ok=True)

    prompt_path = target_dir / "PROMPT.md"
    readme_path = target_dir / "README.md"
    setup_path = target_dir / "setup.sh"

    write_file(prompt_path, build_prompt(product, runtime))
    write_file(
        readme_path,
        build_readme(
            product,
            runtime,
            args.title.strip(),
            args.summary.strip(),
            args.with_assets,
        ),
    )
    write_file(setup_path, build_setup(product, runtime, slug, args.with_assets))
    setup_path.chmod(0o755)

    reference = closest_reference(product, runtime)
    print(f"Scaffolded {args.path.strip().strip('/')}")
    print(f"Closest current reference: {reference}")
    print("Next: customize PROMPT.md and README.md for the requested example, then run the local setup script.")


if __name__ == "__main__":
    main()
