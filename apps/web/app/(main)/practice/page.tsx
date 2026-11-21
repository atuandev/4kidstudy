import { redirectToGrade } from "@/lib/redirect-to-grade";

interface PracticeRedirectPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PracticeRedirectPage({ searchParams }: PracticeRedirectPageProps) {
  return redirectToGrade("practice", await searchParams);
}
