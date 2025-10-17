interface AudioControlProps {
  audioUrl: string;
  className?: string;
}

export function AudioControl({ audioUrl, className }: AudioControlProps) {
  return (
    <audio src={audioUrl} controls preload="metadata" className={className}>
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
