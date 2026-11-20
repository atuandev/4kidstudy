"use client";

import { useState } from "react";
import { Upload, FileUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { importExercisesFromCsv } from "@/actions/exercise";

interface ImportCsvDialogProps {
  lessonId: number;
  lessonTitle: string;
}

export function ImportCsvDialog({ lessonId, lessonTitle }: ImportCsvDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exercisesFile, setExercisesFile] = useState<File | null>(null);
  const [optionsFile, setOptionsFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exercisesFile && !optionsFile) {
      toast.error("Vui lòng chọn ít nhất một file CSV");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("lessonId", lessonId.toString());

      if (exercisesFile) {
        formData.append("exercisesFile", exercisesFile);
      }

      if (optionsFile) {
        formData.append("optionsFile", optionsFile);
      }

      const result = await importExercisesFromCsv(formData);

      toast.success(
        `Đã import ${result.exercisesCreated} bài tập và ${result.optionsCreated} lựa chọn`,
      );

      setIsOpen(false);
      setExercisesFile(null);
      setOptionsFile(null);

      // Reload the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Import failed:", error);
      toast.error(error instanceof Error ? error.message : "Không thể import file CSV");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Import bài tập từ CSV</DialogTitle>
            <DialogDescription>
              Import bài tập và lựa chọn cho bài &quot;{lessonTitle}&quot; từ file CSV
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exercisesFile">
                File bài tập (Exercise.csv)
                <span className="text-xs text-muted-foreground ml-2">(không bắt buộc)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="exercisesFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setExercisesFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                />
                {exercisesFile && <FileUp className="h-4 w-4 text-green-600" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Columns: type, order, prompt, imageUrl, audioUrl, targetText, hintEn, hintVi,
                points, difficulty
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="optionsFile">
                File lựa chọn (ExerciseOptions.csv)
                <span className="text-xs text-muted-foreground ml-2">(không bắt buộc)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="optionsFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setOptionsFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                />
                {optionsFile && <FileUp className="h-4 w-4 text-green-600" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Columns: exerciseId, text, imageUrl, audioUrl, isCorrect, order, matchKey
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondaryOutline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || (!exercisesFile && !optionsFile)}
            >
              {isLoading ? "Đang import..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
