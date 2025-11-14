"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, RotateCcw } from "lucide-react";
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
  onStateChange?: (
    state: RecordingState,
    score?: PronunciationScore | null
  ) => void;
};

type RecordingState =
  | "idle"
  | "recording"
  | "recorded"
  | "analyzing"
  | "completed";

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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
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
      setMediaRecorder(recorder);
      setRecordingState("recording");
    } catch (error) {
      console.error("Error accessing microphone:", error);
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
        console.error("Pronunciation assessment failed. Full response:", JSON.stringify(response, null, 2));
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
      const errorMsg = error instanceof Error 
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Hidden audio element for useAudio hook */}
      {audio}

      {/* Audio Controls */}
      {audioUrl && (
        <div className="space-y-2 pb-6">
          <p className="text-2xl font-bold text-neutral-800 lg:text-3xl">
            {targetText}
          </p>
          <AudioPlayer
            audioUrl={audioUrl}
            variant="button"
            className="flex items-center justify-center"
          />
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        {recordingState === "idle" && (
          <Button
            onClick={startRecording}
            className="flex items-center gap-2"
            variant="primary"
            disabled={disabled}
            size="lg"
          >
            <Mic className="h-5 w-5" />
            Ghi âm
          </Button>
        )}

        {recordingState === "recording" && (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
              <span className="font-medium">Đang ghi âm...</span>
            </div>
            <Button
              onClick={stopRecording}
              variant="secondaryOutline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Dừng ghi âm
            </Button>
          </div>
        )}

        {recordingState === "recorded" && (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-green-600 font-bold text-2xl">Đã ghi âm xong!</p>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
              </div>
            )}
            <div className="space-y-6">
              {recordedAudioUrl && <AudioControl audioUrl={recordedAudioUrl} />}
              <div className="flex gap-2">
                <Button
                  onClick={analyzeRecording}
                  className="flex items-center gap-2"
                  variant="primary"
                >
                  Phân tích phát âm với AI
                </Button>
                <Button
                  onClick={resetRecording}
                  variant="primaryOutline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ghi âm lại
                </Button>
              </div>
            </div>
          </div>
        )}

        {recordingState === "analyzing" && (
          <div className="flex flex-col items-center space-y-3 w-full max-w-md">
            <p className="font-medium text-blue-600">
              Đang phân tích phát âm...
            </p>
            <Progress value={analysisProgress} className="w-full" />
            <p className="text-neutral-500">
              Sử dụng AI để phân tích phát âm của bạn
            </p>
          </div>
        )}

        {recordingState === "completed" && score && (
          <div className="flex gap-8 space-y-4 w-full">
            <div className="flex flex-col items-center gap-3">
              {recordedAudioUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="font-bold text-lg text-neutral-600">
                    Ghi âm của bạn
                  </p>
                  <AudioControl audioUrl={recordedAudioUrl} />
                </div>
              )}
              <Button
                onClick={resetRecording}
                variant="primaryOutline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Ghi âm lại
              </Button>
            </div>

            <div className="w-full space-y-3">
              <h3 className="text-lg font-bold text-neutral-800">
                Kết quả phát âm
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Độ chính xác:</span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    getScoreColor(score.accuracy)
                  )}
                >
                  {score.accuracy}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tốc độ:</span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    getScoreColor(score.fluency)
                  )}
                >
                  {score.fluency}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Độ đầy đủ:</span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    getScoreColor(score.completeness)
                  )}
                >
                  {score.completeness}%
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Điểm tổng: </span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    getScoreColor(score.overall)
                  )}
                >
                  {score.overall}% - {getScoreLabel(score.overall)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
