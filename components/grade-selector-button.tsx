"use client";

import { useTransition } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FlameIcon, GraduationCap, TrophyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { GRADE_VALUES, GRADES, Grade, GradeValue } from "@/types/grade";

const gradeOrderMap: Record<GradeValue, number> = {
  [GRADE_VALUES.GRADE_1]: 1,
  [GRADE_VALUES.GRADE_2]: 2,
  [GRADE_VALUES.GRADE_3]: 3,
  [GRADE_VALUES.GRADE_4]: 4,
  [GRADE_VALUES.GRADE_5]: 5,
};

const buildRouteWithGrade = (basePath: string, grade: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set("grade", grade);
  return `${basePath}?${searchParams.toString()}`;
};

/**
 * Renders grade selector buttons and displays the active user name.
 */
export function GradeSelectorButton() {
  const { profile } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedGrade = searchParams.get("grade");
  const [isPending, startTransition] = useTransition();
  const handleGradeClick = (grade: Grade) => {
    if (isPending || selectedGrade === grade.value) {
      return;
    }
    startTransition(() => {
      const targetUrl = buildRouteWithGrade(pathname, grade.value);
      router.replace(targetUrl);
      // Removed router.refresh() - Next.js handles this automatically on search param changes
    });
  };

  const userGradeValue = profile?.grade as GradeValue | undefined;
  const availableGrades = userGradeValue
    ? GRADES.filter(
        (grade) => gradeOrderMap[grade.value] <= gradeOrderMap[userGradeValue]
      )
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
                disabled={isPending}
                onClick={() => handleGradeClick(grade)}
              >
                {isPending && isActive ? "..." : grade.label}
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
