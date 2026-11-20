import { FormRegister } from "@/app/(auth)/_components/form-register";
import { getGradeBySlug } from "@/types/grade";

interface RegisterPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** `?grade=3` (from the homepage grade picker) pre-selects that grade. */
export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { grade } = await searchParams;
  const defaultGrade = getGradeBySlug(typeof grade === "string" ? grade : undefined)?.value;
  return <FormRegister defaultGrade={defaultGrade} />;
}
