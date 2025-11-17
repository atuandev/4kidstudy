import { FormRegister } from '@/app/(auth)/_components/form-register'
import { Suspense } from 'react';

const RegisterFallback = () => (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="size-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <FormRegister />
    </Suspense>
  );
}
