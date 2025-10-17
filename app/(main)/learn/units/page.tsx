'use client';

import { UnitList } from './_components/unit-list';
import { GraduationCap } from 'lucide-react';
import { useGradeStore } from '@/lib/store';

export default function UnitsPage() {
  const { selectedGrade, selectedGradeData, topics } = useGradeStore();

  return (
    <div>
      <div className='flex flex-col gap-6'>
        {!selectedGrade || !selectedGradeData ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <GraduationCap className='h-16 w-16 text-muted-foreground mb-4' />
            <h2 className='text-2xl font-bold mb-2'>Chưa chọn lớp học</h2>
            <p className='text-muted-foreground mb-4'>
              Vui lòng chọn lớp học từ thanh điều hướng để xem các units
            </p>
          </div>
        ) : (
          <UnitList topics={topics} />
        )}
      </div>
    </div>
  );
}

