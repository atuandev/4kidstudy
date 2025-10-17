import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Topic } from '@/types';
import Image from 'next/image';
import { LibraryIcon, LibrarySquareIcon } from 'lucide-react';
import { TypographyLarge } from '@/components/typography';

interface UnitCardProps {
  topic: Topic;
}

export function UnitCard({ topic }: UnitCardProps) {
  return (
    <Card className='transition-all hover:shadow-md hover:bg-muted/50'>
      <CardHeader>
        {topic.coverImage ? (
          <div className='relative w-full h-48 rounded-lg overflow-hidden'>
            <Image
              src={topic.coverImage}
              alt={topic.title || `Topic cover image`}
              fill
              className='object-cover'
            />
          </div>
        ) : (
          <div className='w-full h-32 rounded-lg bg-muted flex items-center justify-center'>
            <span className='text-muted-foreground text-sm'>Không có ảnh</span>
          </div>
        )}
      </CardHeader>
      <CardContent className='pt-0'>
        <CardTitle className='text-xl font-bold'>{topic.title}</CardTitle>
        <p className='text-muted-foreground mb-4 line-clamp-3'>
          {topic?.description}
        </p>
        <div className='flex flex-col gap-2'>
          <Link href={`/learn/flashcards/${topic.id}`}>
            <Button size='lg' variant='primary' className='w-full'>
              <LibraryIcon className='h-4 w-4' />
              <TypographyLarge className='text-primary-foreground'>Thẻ từ vựng</TypographyLarge>
            </Button>
          </Link>
          <Link href={`/learn/sentences/${topic.id}`}>
            <Button size='lg' variant='secondary' className='w-full'>
              <LibrarySquareIcon className='h-4 w-4' />
              <TypographyLarge className='text-primary-foreground'>Thẻ câu</TypographyLarge>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

