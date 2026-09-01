export default function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={`${title} — YouTube`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
