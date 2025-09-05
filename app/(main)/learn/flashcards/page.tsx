"use client";

import { useState } from "react";
import { Header } from "./_components/header";
import { GradeSelection } from "./_components/grade-selection";
import { TopicList } from "./_components/topic-list";
import { Topic } from "@/types";


export default function FlashcardsPage() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showGradeSelection, setShowGradeSelection] = useState(true);

  const handleGradeSelect = (grade: string, fetchedTopics: Topic[]) => {
    setSelectedGrade(grade);
    setTopics(fetchedTopics);
    setShowGradeSelection(false);
  };

  const handleBackToGrades = () => {
    setShowGradeSelection(true);
    setSelectedGrade(null);
    setTopics([]);
  };

  return (
    <div>
      <Header title="Học với Flashcard" />
      <div className="flex flex-col gap-6">
        {showGradeSelection ? (
          <GradeSelection onGradeSelect={handleGradeSelect} />
        ) : (
          selectedGrade && (
            <TopicList
              topics={topics}
              selectedGrade={selectedGrade}
              onBack={handleBackToGrades}
            />
          )
        )}
      </div>
    </div>
  );
}
