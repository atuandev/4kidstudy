"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, AudioLines, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { assessPronunciation, PronunciationAssessmentResponse } from "@/actions/pronunciation";
import { Progress } from "@/components/ui/progress";

type RecordingState = "idle" | "recording" | "recorded" | "analyzing" | "completed";

interface AudioRecordProps {
  className?: string;
  onStopPropagation?: (event: React.MouseEvent) => void;
  resetTrigger?: string | number; // Used to trigger reset from parent
  targetText?: string; // Reference text for pronunciation assessment
  onAssessmentComplete?: (score: number, passed: boolean) => void; // Callback when assessment completes
}

export function AudioRecord({ className, onStopPropagation, resetTrigger, targetText, onAssessmentComplete }: AudioRecordProps) {
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

        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        setRecordingState("recorded");
        console.log("Recording completed, state set to 'recorded'");

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

    // Simulate progress
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

      console.log("Pronunciation assessment response:", response);

      if (response.success && response.overall !== undefined) {
        const score = response.overall;
        const passed = score > 50;
        
        setAssessmentScore(score);
        setAssessmentPassed(passed);
        setRecordingState("completed");
        setErrorMessage(null);

        // Notify parent component
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
      const errorMsg = error instanceof Error 
        ? error.message 
        : "Đã xảy ra lỗi khi phân tích phát âm. Vui lòng thử lại.";
      setErrorMessage(errorMsg);
      setRecordingState("recorded");
    }
  }, [recordedBlob, targetText, onAssessmentComplete]);

  // Reset recording when resetTrigger changes (e.g., flashcard changes)
  useEffect(() => {
    // Only reset if we have a previous resetTrigger value and it's different
    // This prevents reset on initial mount
    if (prevResetTriggerRef.current !== undefined && 
        prevResetTriggerRef.current !== resetTrigger && 
        resetTrigger !== undefined) {
      console.log("Resetting recording due to resetTrigger change:", prevResetTriggerRef.current, "->", resetTrigger);
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

  console.log("AudioRecord render, recordingState:", recordingState, "recordedAudioUrl:", !!recordedAudioUrl);
  
  return (
    <div className={cn("flex items-center justify-center gap-2 min-h-[44px]", className)}>
      {/* Recording Controls */}
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
            variant="primary"
            className="text-xs px-3 py-1 h-9"
            onClick={(e) => handleClick(e, analyzeRecording)}
            disabled={!targetText}
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
            <p className="text-xs text-red-600 font-medium max-w-[150px]">{errorMessage}</p>
          )}
        </>
      )}

      {recordingState === "analyzing" && (
        <div className="flex items-center gap-3 min-w-[250px]" onClick={(e) => onStopPropagation?.(e)}>
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <Progress value={analysisProgress} className="h-2" />
          </div>
          <p className="text-xs text-blue-600 font-medium whitespace-nowrap">Đang phân tích...</p>
        </div>
      )}

      {recordingState === "completed" && assessmentScore !== null && (
        <>
          <div className={cn(
            "text-xl font-bold min-w-[60px] text-center",
            assessmentPassed ? "text-green-600" : "text-red-600"
          )}>
            {assessmentScore}%
          </div>
          <p className={cn(
            "text-xs font-medium whitespace-nowrap",
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
            <AudioLines className="w-5 h-5 text-green-700" />
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