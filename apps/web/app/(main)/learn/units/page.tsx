import { redirectToGrade } from "@/lib/redirect-to-grade";

interface UnitsRedirectPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Grade-less URL kept for old links: forwards to /grade/[grade]/learn/units.
 */
export default async function UnitsRedirectPage({ searchParams }: UnitsRedirectPageProps) {
  return redirectToGrade("learn/units", await searchParams);
}
