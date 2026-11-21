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
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
      setErrorMessage("");
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

  const analyzeRecording = useCallback(async () => {
    if (!recordedBlob || !targetText) {
      setErrorMessage("Không có bản ghi âm hoặc văn bản tham chiếu");
      return;
    }

    try {
      setRecordingState("analyzing");
      setErrorMessage("");
      setAnalysisProgress(0);

      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const response = await assessPronunciation(recordedBlob, targetText);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const score = response.overall || 0;
      const passed = score > 50;

      setAssessmentScore(score);
      setAssessmentPassed(passed);
      setRecordingState("completed");

      onAssessmentComplete?.(score, passed);
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
      setErrorMessage("Lỗi phân tích phát âm. Vui lòng thử lại.");
      setRecordingState("recorded");
    }
  }, [recordedBlob, targetText, onAssessmentComplete]);

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
    setErrorMessage("");
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

  useEffect(() => {
    if (
      prevResetTriggerRef.current !== undefined &&
      prevResetTriggerRef.current !== resetTrigger &&
      resetTrigger !== undefined
    ) {
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
