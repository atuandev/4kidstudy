import { GradeLevel } from "@4kidstudy/contracts";

/**
 * Grade interface representing a grade level
 */
export interface Grade {
  id: string;
  value: GradeValue;
  label: string;
  description: string;
}

/**
 * Grade values enum for type safety
 */
export const GRADE_VALUES = GradeLevel;

export type GradeValue = GradeLevel;

/**
 * Grade mapping for display labels
 */
export const GRADE_LABELS: Record<GradeValue, string> = {
  [GRADE_VALUES.GRADE_1]: "Lớp 1",
  [GRADE_VALUES.GRADE_2]: "Lớp 2",
  [GRADE_VALUES.GRADE_3]: "Lớp 3",
  [GRADE_VALUES.GRADE_4]: "Lớp 4",
  [GRADE_VALUES.GRADE_5]: "Lớp 5",
};

/**
 * Predefined grade data
 */
export const GRADES: Grade[] = [
  {
    id: "grade-1",
    value: GRADE_VALUES.GRADE_1,
    label: GRADE_LABELS[GRADE_VALUES.GRADE_1],
    description: "Kiến thức cơ bản cho học sinh lớp 1",
  },
  {
    id: "grade-2",
    value: GRADE_VALUES.GRADE_2,
    label: GRADE_LABELS[GRADE_VALUES.GRADE_2],
    description: "Kiến thức nâng cao cho học sinh lớp 2",
  },
  {
    id: "grade-3",
    value: GRADE_VALUES.GRADE_3,
    label: GRADE_LABELS[GRADE_VALUES.GRADE_3],
    description: "Kiến thức trung bình cho học sinh lớp 3",
  },
  {
    id: "grade-4",
    value: GRADE_VALUES.GRADE_4,
    label: GRADE_LABELS[GRADE_VALUES.GRADE_4],
    description: "Kiến thức nâng cao cho học sinh lớp 4",
  },
  {
    id: "grade-5",
    value: GRADE_VALUES.GRADE_5,
    label: GRADE_LABELS[GRADE_VALUES.GRADE_5],
    description: "Kiến thức chuyên sâu cho học sinh lớp 5",
  },
];

/**
 * Sections that live under `/grade/[grade]/...`.
 */
export type GradeSection = "practice" | "learn/units";

/**
 * URL slug for a grade: `GRADE_3` -> `"3"`.
 */
export const getGradeSlug = (value: GradeValue): string => value.replace("GRADE_", "");

/**
 * Resolves a `/grade/[grade]` slug back to its grade, or `undefined` when the slug is not a known grade.
 */
export const getGradeBySlug = (slug: string | undefined): Grade | undefined =>
  slug ? GRADES.find((grade) => getGradeSlug(grade.value) === slug) : undefined;

/**
 * Builds the grade-scoped URL for a section, e.g. `/grade/1/practice`.
 */
export const buildGradePath = (value: GradeValue, section: GradeSection): string =>
  `/grade/${getGradeSlug(value)}/${section}`;

/**
 * Like `buildGradePath`, but accepts an unchecked grade (for example an optional `topic.grade`).
 * Unknown grades fall back to the grade-less URL, which redirects to the student's own grade.
 */
export const buildGradeHref = (value: string | null | undefined, section: GradeSection): string =>
  GRADES.some((grade) => grade.value === value)
    ? buildGradePath(value as GradeValue, section)
    : `/${section}`;
