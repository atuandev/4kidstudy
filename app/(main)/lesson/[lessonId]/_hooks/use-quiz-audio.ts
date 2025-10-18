import { useAudio } from 'react-use';

export function useQuizAudio() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: '/correct.wav' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({ 
    src: '/incorrect.wav' 
  });
  const [finishAudio] = useAudio({ src: '/finish.mp3' });

  const playCorrect = () => {
    void correctControls.play();
  };

  const playIncorrect = () => {
    void incorrectControls.play();
  };

  return {
    correctAudio,
    incorrectAudio,
    finishAudio,
    playCorrect,
    playIncorrect,
  };
}

