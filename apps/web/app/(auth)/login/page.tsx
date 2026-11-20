import { FormLogin } from "@/app/(auth)/_components/form-login";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirect = params.redirect || "/learn/units";

  return <FormLogin redirect={redirect} />;
}
