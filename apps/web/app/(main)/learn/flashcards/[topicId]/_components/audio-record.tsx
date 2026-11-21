"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { assessPronunciation } from "@/actions/pronunciation";
import { RecorderControls, type RecordingState } from "@/components/learn/recorder-controls";

interface AudioRecordProps {
  className?: string;
  onStopPropagation?: (event: React.MouseEvent) => void;
  resetTrigger?: string | number;
  targetText?: string;
  onAssessmentComplete?: (score: number, passed: boolean) => void;
}

export function AudioRecord({
  className,
  onStopPropagation,
  resetTrigger,
  targetText,
  onAssessmentComplete,
}: AudioRecordProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [assessmentPassed, setAssessmentPassed] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const chunksRef = useRef<Blob[]>([]);
  const prevResetTriggerRef = useRef<string | number | undefined>(undefined);

  const startRecording = useCallback(async () => {
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
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setRecordedBlob(blob);

        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        setRecordingState("recorded");

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setErrorMessage(null);
      setMediaRecorder(recorder);
      setRecordingState("recording");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setErrorMessage("Bé chưa bật được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  const resetRecording = useCallback(() => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordingState("idle");
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setMediaRecorder(null);
    setAssessmentScore(null);
    setAssessmentPassed(false);
    setAnalysisProgress(0);
    setErrorMessage(null);
  }, [recordedAudioUrl, recordingState]);

  const playRecordedAudio = useCallback(async () => {
    if (!recordedAudioUrl) return;

    try {
      const audio = new Audio(recordedAudioUrl);
      await audio.play();
    } catch (error) {
      console.error("Error playing recorded audio:", error);
    }
  }, [recordedAudioUrl]);

  const analyzeRecording = useCallback(async () => {
    if (!recordedBlob || !targetText) {
      setErrorMessage("Không có dữ liệu ghi âm hoặc văn bản tham chiếu");
      return;
    }

    setRecordingState("analyzing");
    setAnalysisProgress(0);
    setErrorMessage(null);

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
      console.log("Calling assessPronunciation with:", {
        blobSize: recordedBlob.size,
        blobType: recordedBlob.type,
        targetText,
      });

      const response = await assessPronunciation(recordedBlob, targetText);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (response.success && response.overall !== undefined) {
        const score = response.overall;
        const passed = score > 50;

        setAssessmentScore(score);
        setAssessmentPassed(passed);
        setRecordingState("completed");
        setErrorMessage(null);

        onAssessmentComplete?.(score, passed);
      } else {
        const errorMsg = response?.error || "Không thể phân tích phát âm. Vui lòng thử lại.";
        console.error("Error message:", errorMsg);
        setErrorMessage(errorMsg);
        setRecordingState("recorded");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Exception during pronunciation assessment:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi phân tích phát âm. Vui lòng thử lại.";
      setErrorMessage(errorMsg);
      setRecordingState("recorded");
    }
  }, [recordedBlob, targetText, onAssessmentComplete]);

  useEffect(() => {
    if (
      prevResetTriggerRef.current !== undefined &&
      prevResetTriggerRef.current !== resetTrigger &&
      resetTrigger !== undefined
    ) {
      console.log(
        "Resetting recording due to resetTrigger change:",
        prevResetTriggerRef.current,
        "->",
        resetTrigger,
      );
      resetRecording();
    }

    prevResetTriggerRef.current = resetTrigger;
  }, [resetTrigger, resetRecording]);

  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    onStopPropagation?.(e);
    action();
  };

  return (
    <RecorderControls
      className={className}
      state={recordingState}
      score={assessmentScore}
      passed={assessmentPassed}
      progress={analysisProgress}
      errorMessage={errorMessage}
      canAnalyze={Boolean(targetText)}
      onStart={(e) => handleClick(e, startRecording)}
      onStop={(e) => handleClick(e, stopRecording)}
      onPlayback={(e) => handleClick(e, playRecordedAudio)}
      onAnalyze={(e) => handleClick(e, analyzeRecording)}
      onReset={(e) => handleClick(e, resetRecording)}
      onSurfaceClick={(e) => onStopPropagation?.(e)}
    />
  );
}
