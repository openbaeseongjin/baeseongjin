class Segment:
    def __init__(self, text):
        self.text = text


class WhisperModel:
    def __init__(self, model, device, compute_type, download_root):
        assert model == "tiny"
        assert device == "cpu"
        assert compute_type == "int8"
        assert download_root.endswith("model-cache")

    def transcribe(self, audio_path, language, task, vad_filter):
        assert audio_path.endswith(".wav")
        assert language == "ko"
        assert task == "transcribe"
        assert vad_filter is True
        return iter([Segment(" 로프 액션"), Segment(" 로그라이크 ")]), {"language": "ko"}
