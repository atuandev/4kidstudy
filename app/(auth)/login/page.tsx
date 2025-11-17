import { Suspense } from 'react';
import { FormLogin } from '@/app/(auth)/_components/form-login';

const LoginFallback = () => (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="size-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <FormLogin />
    </Suspense>
  );
}
