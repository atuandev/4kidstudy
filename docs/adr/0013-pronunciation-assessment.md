# 0013. Pronunciation assessment

- Status: Accepted
- Date: 2026-11-21

## Decision

- The browser records with `MediaRecorder` and uploads the recording with
  the recorder's own MIME type (usually `audio/webm` or
  `audio/webm;codecs=opus`, falling back to `audio/webm`). It never converts
  in the browser.
- The API converts any input format to 16 kHz, 16-bit mono WAV with FFmpeg,
  the format the Azure Speech SDK expects. FFmpeg comes from
  `@ffmpeg-installer/ffmpeg`, so no system binary is needed.
- `POST /pronunciation/assess` returns the result straight away. Nothing is
  stored until the lesson is saved (ADR 0005).
- The API can answer HTTP 200 with `success: false` in the body, so the web
  client checks `payload.success` as well as the status.
- Thresholds: ADR 0006 for lessons, ADR 0010 for flashcards and sentences.
