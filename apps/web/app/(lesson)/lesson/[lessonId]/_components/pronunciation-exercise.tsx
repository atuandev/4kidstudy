"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowCounterClockwiseIcon, MicrophoneIcon, SquareIcon } from "@/components/icons";
import { useAudio } from "react-use";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ExerciseOption } from "@/types";
import AudioPlayer from "./audio-player";
import { AudioControl } from "@/components/audio-control";
import { assessPronunciation } from "@/actions/pronunciation";

type PronunciationExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  targetText?: string;
  audioUrl?: string;
  onStateChange?: (state: RecordingState, score?: PronunciationScore | null) => void;
};

type RecordingState = "idle" | "recording" | "recorded" | "analyzing" | "completed";

type PronunciationScore = {
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody?: number;
  overall: number;
};

export function PronunciationExercise({
  onSelect,
  disabled,
  targetText,
  audioUrl,
  onStateChange,
}: PronunciationExerciseProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  // Audio player for target pronunciation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audio, _, controls] = useAudio({ src: audioUrl || "" });

  const playTargetAudio = useCallback(() => {
    if (audioUrl) {
      void controls.play();
    }
  }, [controls, audioUrl]);

  const startRecording = useCallback(async () => {
    if (disabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Use the actual MediaRecorder mime type (typically "audio/webm" or "audio/webm;codecs=opus")
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);

        // Create URL for AudioPlayer component
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        setRecordingState("recorded");

        // Notify parent component of state change
        onStateChange?.("recorded", null);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setErrorMessage(null);
      setMediaRecorder(recorder);
      setRecordingState("recording");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setErrorMessage("Không mở được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.");
    }
  }, [disabled]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  // Clean up object URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const analyzeRecording = useCallback(async () => {
    if (!recordedBlob || !targetText) return;

    setRecordingState("analyzing");
    setAnalysisProgress(0);
    setErrorMessage(null);

    // Notify parent component of state change
    onStateChange?.("analyzing", null);

    // Simulate progress while API call is in progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10 + 5;
      });
    }, 200);

    try {
      // Call the backend API to assess pronunciation
      console.log("Calling assessPronunciation with:", {
        blobSize: recordedBlob.size,
        blobType: recordedBlob.type,
        targetText,
      });

      const response = await assessPronunciation(recordedBlob, targetText);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      console.log("Pronunciation assessment response:", response);

      if (response.success && response.overall !== undefined) {
        const assessmentScore: PronunciationScore = {
          accuracy: response.accuracy ?? 0,
          fluency: response.fluency ?? 0,
          completeness: response.completeness ?? 0,
          prosody: response.prosody,
          overall: response.overall,
        };

        setScore(assessmentScore);
        setRecordingState("completed");
        setErrorMessage(null);

        // Notify parent component of completion with score
        onStateChange?.("completed", assessmentScore);
      } else {
        // Handle error - log full response for debugging
        console.error(
          "Pronunciation assessment failed. Full response:",
          JSON.stringify(response, null, 2),
        );
        const errorMsg = response?.error || "Không thể phân tích phát âm. Vui lòng thử lại.";
        console.error("Error message:", errorMsg);
        setErrorMessage(errorMsg);
        setRecordingState("recorded");
        onStateChange?.("recorded", null);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Exception during pronunciation assessment:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi phân tích phát âm. Vui lòng thử lại.";
      setErrorMessage(errorMsg);
      setRecordingState("recorded");
      onStateChange?.("recorded", null);
    }
  }, [recordedBlob, targetText, onStateChange]);

  const resetRecording = useCallback(() => {
    // Clean up previous object URL
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordingState("idle");
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setScore(null);
    setAnalysisProgress(0);
    setMediaRecorder(null);
    setErrorMessage(null);

    // Notify parent component of state reset
    onStateChange?.("idle", null);
  }, [recordedAudioUrl, onStateChange]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Hidden audio element for useAudio hook */}
      {audio}

      {/* The word to say, with the model voice beside it */}
      <div className="flex items-center gap-4">
        <p className="text-4xl font-black tracking-[-0.01em] text-ink sm:text-5xl">{targetText}</p>
        {audioUrl && <AudioPlayer audioUrl={audioUrl} variant="button" />}
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="w-full max-w-md rounded-2xl bg-cherry-wash px-4 py-3 text-center text-base font-bold text-cherry-deep"
        >
          {errorMessage}
        </p>
      )}

      {(recordingState === "idle" || recordingState === "recording") && (
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={recordingState === "idle" ? startRecording : stopRecording}
            disabled={disabled}
            aria-label={recordingState === "idle" ? "Ghi âm" : "Dừng ghi âm"}
            className={cn(
              "relative flex size-24 items-center justify-center rounded-full bg-cherry text-white outline-none transition-[translate,box-shadow] duration-150",
              "shadow-[0_6px_0_#BE123C] hover:brightness-105 active:translate-y-1.5 active:shadow-[0_0_0_#BE123C]",
              "focus-visible:ring-4 focus-visible:ring-cherry/40 disabled:opacity-50",
            )}
          >
            {recordingState === "recording" && (
              <span
                className="absolute inset-0 rounded-full bg-cherry/40 motion-safe:animate-ping"
                aria-hidden="true"
              />
            )}
            {recordingState === "idle" ? (
              <MicrophoneIcon className="relative size-11" aria-hidden="true" />
            ) : (
              <SquareIcon weight="fill" className="relative size-9" aria-hidden="true" />
            )}
          </button>
          <p className="text-center" aria-live="polite">
            <span className="block text-lg font-black text-ink">
              {recordingState === "idle" ? "Bấm micro rồi đọc to" : "Đang ghi âm… bấm để dừng"}
            </span>
            <span className="block text-base font-extrabold text-sky-ink">
              {recordingState === "idle" ? "Tap the mic and say it." : "Recording… tap to stop."}
            </span>
          </p>
        </div>
      )}

      {recordingState === "recorded" && (
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <p className="text-2xl font-black text-forest">Đã ghi âm xong!</p>
          {recordedAudioUrl && <AudioControl audioUrl={recordedAudioUrl} className="w-full" />}
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button onClick={resetRecording} variant="default" size="lg" className="sm:flex-1">
              <ArrowCounterClockwiseIcon className="size-5" />
              Ghi âm lại
            </Button>
            <Button
              onClick={analyzeRecording}
              variant="primary"
              size="lg"
              className="sm:flex-[1.4]"
            >
              Chấm điểm phát âm
            </Button>
          </div>
        </div>
      )}

      {recordingState === "analyzing" && (
        <div className="flex w-full max-w-md flex-col items-center gap-3" aria-live="polite">
          <p className="text-lg font-black text-ink">Đang chấm điểm…</p>
          <Progress value={analysisProgress} className="w-full" />
          <p className="text-base text-ink-body">4KidStudy đang nghe lại giọng đọc của bé.</p>
        </div>
      )}

      {recordingState === "completed" && score && (
        <div className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-sheet sm:p-7">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-white text-white",
                scoreBand(score.overall).disc,
              )}
            >
              <span className="text-3xl font-black tabular-nums leading-none">{score.overall}</span>
            </span>
            <div>
              <p className="text-2xl font-black text-ink">{scoreBand(score.overall).vi}</p>
              <p className="text-base font-extrabold text-sky-ink">{scoreBand(score.overall).en}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-4">
            {[
              { label: "Chính xác", en: "Accuracy", value: score.accuracy },
              { label: "Trôi chảy", en: "Fluency", value: score.fluency },
              { label: "Đầy đủ", en: "Completeness", value: score.completeness },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-baseline justify-between text-base">
                  <dt className="font-extrabold text-ink">
                    {item.label} <span className="font-bold text-ink-meta">{item.en}</span>
                  </dt>
                  <dd className="font-black tabular-nums text-ink">{item.value}</dd>
                </div>
                <div className="mt-1.5 h-3.5 rounded-full bg-wash" aria-hidden="true">
                  <div
                    className={cn("h-full rounded-full", scoreBand(item.value).bar)}
                    style={{ width: `${Math.min(100, item.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-col items-stretch gap-3 border-t-2 border-wash pt-5 sm:flex-row sm:items-center">
            {recordedAudioUrl && (
              <AudioControl audioUrl={recordedAudioUrl} className="min-w-0 flex-1" />
            )}
            <Button onClick={resetRecording} variant="default">
              <ArrowCounterClockwiseIcon className="size-4" />
              Ghi âm lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Score bands: green is good, yellow is close, red needs another try. */
function scoreBand(value: number) {
  if (value >= 90)
    return { vi: "Xuất sắc!", en: "Excellent!", disc: "bg-leaf-deep", bar: "bg-leaf" };
  if (value >= 80) return { vi: "Tốt lắm!", en: "Good!", disc: "bg-leaf-deep", bar: "bg-leaf" };
  if (value >= 70) return { vi: "Khá rồi!", en: "Fair.", disc: "bg-sun text-ink", bar: "bg-sun" };
  return { vi: "Luyện thêm nhé", en: "Needs practice.", disc: "bg-cherry", bar: "bg-cherry" };
}
