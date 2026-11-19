"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, AudioLines, RotateCcw, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { assessPronunciation } from "@/actions/pronunciation";

type RecordingState = "idle" | "recording" | "recorded" | "analyzing" | "completed";

interface AudioRecordProps {
  className?: string;
  onStopPropagation?: (event: React.MouseEvent) => void;
  resetTrigger?: string | number;
  targetText?: string; // Text to assess pronunciation against
  onAssessmentComplete?: (score: number, passed: boolean) => void;
}

export function AudioRecord({ 
  className, 
  onStopPropagation, 
  resetTrigger,
  targetText,
  onAssessmentComplete 
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

        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        setRecordingState("recorded");
        // console.log("Recording completed, state set to 'recorded'");

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingState("recording");
      console.log("Recording started, state set to 'recording'");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("stopRecording called, mediaRecorder state:", mediaRecorder?.state);
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      console.log("MediaRecorder.stop() called");
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      // Call pronunciation assessment API
      const response = await assessPronunciation(recordedBlob, targetText);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const score = response.overall || 0;
      const passed = score > 50;
      
      setAssessmentScore(score);
      setAssessmentPassed(passed);
      setRecordingState("completed");
      
      // Notify parent component
      onAssessmentComplete?.(score, passed);
      
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
      setErrorMessage("Lỗi phân tích phát âm. Vui lòng thử lại.");
      setRecordingState("recorded");
    }
  }, [recordedBlob, targetText, onAssessmentComplete]);

  const resetRecording = useCallback(() => {
    console.log("resetRecording called, current state:", recordingState);
    // Clean up previous object URL
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

  // Reset recording when resetTrigger changes (e.g., flashcard changes)
  useEffect(() => {
    // Only reset if we have a previous resetTrigger value and it's different
    // This prevents reset on initial mount
    if (prevResetTriggerRef.current !== undefined && 
        prevResetTriggerRef.current !== resetTrigger && 
        resetTrigger !== undefined) {
      // console.log("Resetting recording due to resetTrigger change:", prevResetTriggerRef.current, "->", resetTrigger);
      resetRecording();
    }
    
    prevResetTriggerRef.current = resetTrigger;
  }, [resetTrigger, resetRecording]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up recorded audio URL
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    onStopPropagation?.(e);
    action();
  };

  // console.log("AudioRecord render, recordingState:", recordingState, "recordedAudioUrl:", !!recordedAudioUrl);
  
  return (
    <div className={cn("flex items-center justify-center gap-2 min-h-[44px]", className)}>
      {recordingState === "idle" && (
        <Button
          size="sm"
          variant="ghost"
          className="p-2 rounded-full hover:bg-gray-200 bg-gray-100"
          onClick={(e) => handleClick(e, startRecording)}
        >
          <Mic className="w-6 h-6 text-gray-600" />
        </Button>
      )}

      {recordingState === "recording" && (
        <Button
          size="sm"
          variant="ghost"
          className="p-2 rounded-full hover:bg-red-400 bg-red-300 animate-pulse"
          onClick={(e) => handleClick(e, stopRecording)}
        >
          <Square className="w-6 h-6 text-red-700" />
        </Button>
      )}

      {recordingState === "recorded" && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="p-2 rounded-full hover:bg-green-300 bg-green-200"
            onClick={(e) => handleClick(e, playRecordedAudio)}
          >
            <AudioLines className="w-6 h-6 text-green-700" />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="px-3 py-1"
            onClick={(e) => handleClick(e, analyzeRecording)}
          >
            Phân tích
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-2 rounded-full hover:bg-gray-200 bg-gray-100"
            onClick={(e) => handleClick(e, resetRecording)}
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </Button>
          {errorMessage && (
            <p className="text-xs text-red-600">{errorMessage}</p>
          )}
        </>
      )}

      {recordingState === "analyzing" && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <Progress value={analysisProgress} className="w-32" />
          <p className="text-sm text-gray-600">Đang phân tích...</p>
        </div>
      )}

      {recordingState === "completed" && (
        <>
          <div className="text-xl font-bold">
            {assessmentScore?.toFixed(0)}%
          </div>
          <p className={cn(
            "text-sm font-medium",
            assessmentPassed ? "text-green-600" : "text-red-600"
          )}>
            {assessmentPassed ? "✓ Đạt" : "✗ Chưa đạt"}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="p-2 rounded-full hover:bg-green-300 bg-green-200"
            onClick={(e) => handleClick(e, playRecordedAudio)}
          >
            <AudioLines className="w-6 h-6 text-green-700" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-2 rounded-full hover:bg-gray-200 bg-gray-100"
            onClick={(e) => handleClick(e, resetRecording)}
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </Button>
        </>
      )}
      
    </div>
  );
}