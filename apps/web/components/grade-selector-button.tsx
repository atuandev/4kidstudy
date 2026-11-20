"use client";

import { useParams, usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
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
 * Grade chips above every grade page (XP and streak live in the sidebar and phone header).
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
    <div className="mb-6 sm:mb-8">
      <nav aria-label="Chọn lớp">
        <ul className="grid grid-cols-5 gap-2 sm:flex">
          {availableGrades.map((grade) => {
            const isActive = selectedGrade === grade.value;
            return (
              <li key={grade.id}>
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleGradeClick(grade)}
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-chip border-2 border-b-4 px-1 text-sm font-black outline-none transition-colors duration-150 sm:px-4 sm:text-base",
                    "active:translate-y-0.5 active:border-b-2 focus-visible:ring-4 focus-visible:ring-sky/50",
                    isActive
                      ? "border-sky bg-sky-wash text-sky-ink"
                      : "border-edge bg-white text-ink hover:border-sky hover:bg-sky-wash hover:text-sky-ink",
                  )}
                >
                  {grade.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
