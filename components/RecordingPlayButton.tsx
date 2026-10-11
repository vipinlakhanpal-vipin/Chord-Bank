"use client";

import { useRef, useState } from "react";

// Compact play/pause toggle for a song tile — sits in the exact spot the old
// playable-in-6-chords tick/+N badge used to, for a song you've uploaded your
// own recording of (see components/SongForm.tsx). One <audio> element per
// button, created lazily on first tap so nothing loads until you actually
// want to hear it.
export default function RecordingPlayButton({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) {
      const audio = new Audio(url);
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audioRef.current = audio;
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Pause your recording" : "Play your recording"}
      title={playing ? "Pause your recording" : "Play your recording"}
      className={`text-[10px] sm:text-[9px] px-1.5 py-0.5 rounded-full text-white font-medium shadow-sm bg-gradient-to-br ${
        playing ? "from-violet-500 to-purple-700" : "from-emerald-500 to-green-600"
      }`}
    >
      {playing ? "❚❚" : "▶"}
    </button>
  );
}
