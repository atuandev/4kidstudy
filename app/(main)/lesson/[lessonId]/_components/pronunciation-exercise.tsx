"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, RotateCcw } from "lucide-react";
import { useAudio } from "react-use";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ExerciseOption } from "@/types";
import AudioPlayer from "./audio-player";

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
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
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

  const analyzeRecording = useCallback(() => {
    if (!recordedBlob) return;

    setRecordingState("analyzing");
    setAnalysisProgress(0);
    
    // Notify parent component of state change
    onStateChange?.("analyzing", null);

    // Simulate AI analysis with progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);

          // Simulate AI scoring (in real implementation, this would call an API)
          setTimeout(() => {
            const mockScore: PronunciationScore = {
              accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
              fluency: Math.floor(Math.random() * 25) + 75, // 75-100%
              completeness: Math.floor(Math.random() * 20) + 80, // 80-100%
              overall: 0,
            };

            // Calculate overall score
            mockScore.overall = Math.round(
              mockScore.accuracy * 0.4 +
                mockScore.fluency * 0.3 +
                mockScore.completeness * 0.3
            );

            setScore(mockScore);
            setRecordingState("completed");
            
            // Notify parent component of completion with score
            onStateChange?.("completed", mockScore);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);
  }, [recordedBlob, onSelect, onStateChange]);

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
        <div className="flex flex-col items-center space-y-2">
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
            Start Recording
          </Button>
        )}

        {recordingState === "recording" && (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
              <span className="font-medium">Recording...</span>
            </div>
            <Button
              onClick={stopRecording}
              variant="secondaryOutline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          </div>
        )}

        {recordingState === "recorded" && (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-green-600 font-medium">Recording completed!</p>
            <div className="flex flex-col items-center gap-3">
              {recordedAudioUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm font-medium text-neutral-600">
                    Your recording:
                  </p>
                  <AudioPlayer
                    audioUrl={recordedAudioUrl}
                    variant="button"
                    className="flex items-center justify-center"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={analyzeRecording}
                  className="flex items-center gap-2"
                  variant="primary"
                >
                  Analyze Pronunciation
                </Button>
                <Button
                  onClick={resetRecording}
                  variant="primaryOutline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Record Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {recordingState === "analyzing" && (
          <div className="flex flex-col items-center space-y-3 w-full max-w-md">
            <p className="font-medium text-blue-600">
              Analyzing pronunciation...
            </p>
            <Progress value={analysisProgress} className="w-full" />
            <p className="text-sm text-neutral-500">
              Using AI to analyze your pronunciation
            </p>
          </div>
        )}

        {recordingState === "completed" && score && (
          <div className="flex gap-8 space-y-4 w-full max-w-md">
            <div className="flex flex-col items-center gap-3">
              {recordedAudioUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm font-medium text-neutral-600">
                    Your recording:
                  </p>
                  <AudioPlayer
                    audioUrl={recordedAudioUrl}
                    variant="button"
                    className="flex items-center justify-center"
                  />
                </div>
              )}
              <Button
                onClick={resetRecording}
                variant="secondaryOutline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>

            <div className="w-full space-y-3">
              <h3 className="text-lg font-bold text-neutral-800">
                Pronunciation Results
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Accuracy:</span>
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
                <span className="text-sm font-medium">Fluency:</span>
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
                <span className="text-sm font-medium">Completeness:</span>
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
                <span className="font-bold">Overall Score:</span>
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
