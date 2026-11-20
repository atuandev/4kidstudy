import { redirect } from "next/navigation";

import { getProfile } from "@/actions/user/profile";
import {
  buildGradePath,
  GRADE_VALUES,
  GRADES,
  type GradeSection,
  type GradeValue,
} from "@/types/grade";

type SearchParams = Record<string, string | string[] | undefined>;

const isGradeValue = (value: unknown): value is GradeValue =>
  GRADES.some((grade) => grade.value === value);

/**
 * Sends a grade-less URL (`/practice`, `/learn/units`) to its `/grade/[grade]/...` page.
 * Picks the grade from the legacy `?grade=GRADE_N` param, then the student's profile, then grade 1.
 */
export async function redirectToGrade(
  section: GradeSection,
  searchParams: SearchParams,
): Promise<never> {
  const legacyGrade = searchParams.grade;
  if (isGradeValue(legacyGrade)) {
    redirect(buildGradePath(legacyGrade, section));
  }

  let grade: GradeValue = GRADE_VALUES.GRADE_1;
  try {
    const profile = await getProfile();
    if (isGradeValue(profile.grade)) {
      grade = profile.grade;
    }
  } catch {
    // Not signed in or the API failed: fall back to grade 1.
  }
  redirect(buildGradePath(grade, section));
}
