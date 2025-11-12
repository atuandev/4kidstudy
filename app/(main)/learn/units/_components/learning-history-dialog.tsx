"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { History, BookOpen, MessageSquare, Target, TrendingUp } from "lucide-react";
import { GradeValue } from "@/types/grade";

interface LearningHistoryStats {
  totalReviewed: number;
  totalMastered: number;
  masteryRate: number;
  flashcardStats: {
    total: number;
    mastered: number;
    masteryRate: number;
  };
  sentenceStats: {
    total: number;
    mastered: number;
    masteryRate: number;
  };
  topicCount: number;
}

interface LearningHistoryDialogProps {
  grade: GradeValue;
  onOpen?: () => Promise<LearningHistoryStats | null>;
}

export function LearningHistoryDialog({ grade, onOpen }: LearningHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LearningHistoryStats | null>(null);

  const handleOpen = async () => {
    setOpen(true);
    if (onOpen) {
      setLoading(true);
      try {
        const data = await onOpen();
        setStats(data);
      } catch (error) {
        console.error("Failed to load learning history:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getGradeName = (grade: GradeValue) => {
    const gradeMap: Record<GradeValue, string> = {
      GRADE_1: "Lớp 1",
      GRADE_2: "Lớp 2",
      GRADE_3: "Lớp 3",
      GRADE_4: "Lớp 4",
      GRADE_5: "Lớp 5",
    };
    return gradeMap[grade] || grade;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={handleOpen}>
          <History className="h-4 w-4 mr-2" />
          Lịch sử học
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Lịch sử học - {getGradeName(grade)}
          </DialogTitle>
          <DialogDescription>
            Thống kê tổng quan về quá trình học tập của bạn
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : !stats ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Không có dữ liệu thống kê
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Tổng quan</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.totalReviewed}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tổng số đã học
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.masteryRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tỷ lệ hoàn thành
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flashcard Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Flashcard</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.flashcardStats.total}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Đã học
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.flashcardStats.masteryRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tỷ lệ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sentence Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Câu học</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.sentenceStats.total}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Đã học
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.sentenceStats.masteryRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tỷ lệ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topic Count */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Chủ đề đã học</h3>
                      <p className="text-sm text-muted-foreground">
                        Số chủ đề bạn đã tương tác
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.topicCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
