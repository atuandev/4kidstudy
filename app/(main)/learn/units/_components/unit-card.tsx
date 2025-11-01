'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Topic } from '@/types';
import Image from 'next/image';
import { LibraryIcon, LibrarySquareIcon } from 'lucide-react';
import { TypographyLarge } from '@/components/typography';
import { useEffect, useState } from 'react';
import { getTopicProgress } from '@/actions/learning-progress';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UnitCardProps {
  topic: Topic;
}

export function UnitCard({ topic }: UnitCardProps) {
  const router = useRouter();
  const [flashcardProgress, setFlashcardProgress] = useState<number>(0);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'flashcard' | 'sentence'>('flashcard');
  const [lastFlashcardIndex, setLastFlashcardIndex] = useState<number>(0);
  const [lastSentenceIndex, setLastSentenceIndex] = useState<number>(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await getTopicProgress(topic.id);
        setFlashcardProgress(progress.flashcardProgress);
        setSentenceProgress(progress.sentenceProgress);
        setLastFlashcardIndex(progress.lastReviewedFlashcardIndex || 0);
        setLastSentenceIndex(progress.lastReviewedSentenceIndex || 0);
      } catch (error) {
        console.error('Failed to fetch topic progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [topic.id]);

  const handleCardClick = (type: 'flashcard' | 'sentence') => {
    const progress = type === 'flashcard' ? flashcardProgress : sentenceProgress;
    
    if (progress > 0) {
      setDialogType(type);
      setShowDialog(true);
    } else {
      // Navigate directly if no progress
      navigateToContent(type, false);
    }
  };

  const navigateToContent = (type: 'flashcard' | 'sentence', continueFromLast: boolean) => {
    const basePath = type === 'flashcard' ? '/learn/flashcards' : '/learn/sentences';
    const lastIndex = type === 'flashcard' ? lastFlashcardIndex : lastSentenceIndex;
    const url = continueFromLast && lastIndex > 0
      ? `${basePath}/${topic.id}?index=${lastIndex}`
      : `${basePath}/${topic.id}`;
    
    router.push(url);
    setShowDialog(false);
  };

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
          <Button 
            size='lg' 
            variant='primary' 
            className='w-full relative'
            onClick={() => handleCardClick('flashcard')}
          >
            <LibraryIcon className='h-4 w-4' />
            <TypographyLarge className='text-primary-foreground'>
              Thẻ từ vựng
            </TypographyLarge>
            {!loading && flashcardProgress > 0 && (
              <span className='ml-auto text-xs bg-white/20 px-2 py-1 rounded-full'>
                {flashcardProgress}%
              </span>
            )}
          </Button>
          
          <Button 
            size='lg' 
            variant='secondary' 
            className='w-full relative'
            onClick={() => handleCardClick('sentence')}
          >
            <LibrarySquareIcon className='h-4 w-4' />
            <TypographyLarge className='text-primary-foreground'>
              Thẻ câu
            </TypographyLarge>
            {!loading && sentenceProgress > 0 && (
              <span className='ml-auto text-xs bg-white/20 px-2 py-1 rounded-full'>
                {sentenceProgress}%
              </span>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Dialog for continue or restart */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiếp tục học hay học lại?</DialogTitle>
            <DialogDescription>
              Bạn đã học {dialogType === 'flashcard' ? flashcardProgress : sentenceProgress}% 
              của {dialogType === 'flashcard' ? 'thẻ từ vựng' : 'thẻ câu'} này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex gap-2 sm:gap-0'>
            <Button
              variant='secondaryOutline'
              onClick={() => navigateToContent(dialogType, false)}
            >
              Học lại từ đầu
            </Button>
            <Button
              variant='primary'
              onClick={() => navigateToContent(dialogType, true)}
            >
              Tiếp tục học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

