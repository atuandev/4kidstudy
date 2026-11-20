import { redirectToGrade } from "@/lib/redirect-to-grade";

interface PracticeRedirectPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Grade-less URL kept for old links: forwards to /grade/[grade]/practice.
 */
export default async function PracticeRedirectPage({ searchParams }: PracticeRedirectPageProps) {
  return redirectToGrade("practice", await searchParams);
}
