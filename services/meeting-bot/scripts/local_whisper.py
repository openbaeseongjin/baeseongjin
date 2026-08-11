import argparse
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel


def parse_args():
    parser = argparse.ArgumentParser(description="Transcribe one WAV file locally.")
    parser.add_argument("--model", default="tiny")
    parser.add_argument("--cache-dir", required=True)
    parser.add_argument("--language", default="ko")
    parser.add_argument("audio_paths", nargs="+")
    return parser.parse_args()


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args()
    cache_dir = Path(args.cache_dir).resolve()
    cache_dir.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(
        args.model,
        device="cpu",
        compute_type="int8",
        download_root=str(cache_dir),
    )
    results = []
    for audio_path in args.audio_paths:
        try:
            segments, _ = model.transcribe(
                audio_path,
                language=args.language,
                task="transcribe",
                vad_filter=True,
            )
            text = " ".join(
                segment.text.strip() for segment in segments if segment.text.strip()
            )
            results.append({"text": text})
        except Exception as error:
            results.append({"error": f"{type(error).__name__}: {str(error)[:500]}"})
    print(json.dumps({"results": results}, ensure_ascii=False))


if __name__ == "__main__":
    main()
