'use client';

import { useTransition } from 'react';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { GRADES, Grade } from '@/types/grade';

const buildRouteWithGrade = (basePath: string, grade: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set('grade', grade);
  return `${basePath}?${searchParams.toString()}`;
};

/**
 * Renders grade selector buttons and displays the active user name.
 */
export function GradeSelectorButton() {
  const { profile } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedGrade = searchParams.get('grade');
  const [isPending, startTransition] = useTransition();
  const handleGradeClick = (grade: Grade) => {
    if (isPending || selectedGrade === grade.value) {
      return;
    }
    startTransition(() => {
      const targetUrl = buildRouteWithGrade(pathname, grade.value);
      router.replace(targetUrl);
      router.refresh();
    });
  };
  return (
    <div className='mx-6 flex items-center justify-between gap-2 pb-4'>
      <div className='flex items-center gap-2'>
        <GraduationCap className='size-8 text-muted-foreground' />
        <div className='flex gap-1'>
          {GRADES.map((grade) => {
            const isActive = selectedGrade === grade.value;
            return (
              <Button
                key={grade.id}
                variant={isActive ? 'default' : 'ghost'}
                disabled={isPending}
                onClick={() => handleGradeClick(grade)}
              >
                {isPending && isActive ? '...' : grade.label}
              </Button>
            );
          })}
        </div>
      </div>
      <Link href='/profile' className='flex items-center gap-2'>
        <span className='text-lg font-bold'>Hello, {profile?.name}</span>
      </Link>
    </div>
  );
}
