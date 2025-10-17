'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useGradeStore } from '@/lib/store';
import { UnitCard } from '../units/_components/unit-card';

export default function SentencesPage() {
  const { selectedGrade, selectedGradeData, topics } = useGradeStore();

  return (
    <div>
      <div className='flex flex-col gap-6'>
        {!selectedGrade || !selectedGradeData ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <GraduationCap className='h-16 w-16 text-muted-foreground mb-4' />
            <h2 className='text-2xl font-bold mb-2'>Chưa chọn lớp học</h2>
            <p className='text-muted-foreground mb-4'>
              Vui lòng chọn lớp học từ thanh điều hướng để xem các chủ đề Sentence
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Link href='/learn'>
                <Button variant='ghost' size='sm' className='flex items-center gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              </Link>
              <div>
                <h2 className='text-2xl font-bold'>
                  Sentences - {topics.length} Units
                </h2>
              </div>
            </div>

            {topics.length === 0 ? (
              <Card>
                <CardContent className='py-8 text-center'>
                  <p className='text-muted-foreground'>
                    Không có unit nào cho lớp học này
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {topics.map((topic) => (
                  <UnitCard key={topic.id} topic={topic} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

