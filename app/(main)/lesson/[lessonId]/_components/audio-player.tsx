export default function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  return (
    <audio
      key={audioUrl}
      controls
      className="w-full"
      preload="metadata"
      autoPlay
    >
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
