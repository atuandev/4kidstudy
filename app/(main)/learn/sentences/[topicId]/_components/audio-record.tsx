"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, AudioLines, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type RecordingState = "idle" | "recording" | "recorded";

interface AudioRecordProps {
  className?: string;
  onStopPropagation?: (event: React.MouseEvent) => void;
  resetTrigger?: string | number; // Used to trigger reset from parent
}

export function AudioRecord({ className, onStopPropagation, resetTrigger }: AudioRecordProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  
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
    <div className={cn("flex items-center gap-2", className)}>
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
        <div className="flex items-center gap-2">
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
        </div>
      )}
    </div>
  );
}