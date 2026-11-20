"use client";

import { FlameIcon, GraduationCap, TrophyIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import {
  buildGradePath,
  Grade,
  GRADE_VALUES,
  GRADES,
  GradeValue,
  getGradeBySlug,
  getGradeSlug,
} from "@/types/grade";

const gradeOrderMap: Record<GradeValue, number> = {
  [GRADE_VALUES.GRADE_1]: 1,
  [GRADE_VALUES.GRADE_2]: 2,
  [GRADE_VALUES.GRADE_3]: 3,
  [GRADE_VALUES.GRADE_4]: 4,
  [GRADE_VALUES.GRADE_5]: 5,
};

/**
 * Renders grade selector buttons and displays the active user name.
 */
export function GradeSelectorButton() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ grade?: string }>();
  const { profile } = useProfile();
  const selectedGrade = getGradeBySlug(params.grade)?.value;

  const handleGradeClick = (grade: Grade) => {
    if (selectedGrade === grade.value) {
      return;
    }
    // On a /grade/[grade]/... page, swap only the grade segment so the
    // student stays in the same section. Elsewhere, open that grade's units.
    const nextPath = params.grade
      ? pathname.replace(`/grade/${params.grade}`, `/grade/${getGradeSlug(grade.value)}`)
      : buildGradePath(grade.value, "learn/units");
    router.push(nextPath);
  };

  const userGradeValue = profile?.grade as GradeValue | undefined;
  const availableGrades = userGradeValue
    ? GRADES.filter((grade) => gradeOrderMap[grade.value] <= gradeOrderMap[userGradeValue])
    : GRADES;

  return (
    <div className="mx-6 flex items-center justify-between gap-2 pb-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-8 text-muted-foreground" />
        <div className="flex gap-1">
          {availableGrades.map((grade) => {
            const isActive = selectedGrade === grade.value;
            return (
              <Button
                key={grade.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => handleGradeClick(grade)}
              >
                {grade.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <TrophyIcon className="size-5 text-yellow-600" />
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {profile?.xp.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FlameIcon className="size-5 text-orange-600" />
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {profile?.streakDays}
          </span>
        </div>
        <Link href="/profile" className="flex items-center gap-2">
          <span className="text-lg font-bold">Hello, {profile?.name}</span>
        </Link>
      </div>
    </div>
  );
}
