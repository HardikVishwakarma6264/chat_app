import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, CheckCheck } from "lucide-react";

const VoiceMessage = ({ src, duration, isSender, time }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const loaded = () => {
      if (!duration) setAudioDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", loaded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", loaded);
    };
  }, [duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-xl w-[240px] h-[35px] ${
        isSender ? "bg-cyan-900 text-white" : "bg-[#202c33] text-gray-200"
      }`}
    >
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />

      {/* ▶️ Play / Pause */}
      <button
        onClick={togglePlay}
        className="p-1 bg-transparent text-green-400 hover:scale-110 transition"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* 🎵 Waveform (fake animated bars) */}
      <div className="flex items-end gap-[3px] mx-3 h-[18px] flex-1">
        {[
          6, 12, 8, 14, 10, 7, 11, 8, 14, 10, 7, 11, 6, 12, 8, 14, 10, 7, 10, 7,
          11, 8, 14, 10, 7,
        ].map((h, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-sm ${
              isPlaying ? "bg-green-400" : "bg-gray-500"
            }`}
            style={{
              height: `${h}px`,
              animation: isPlaying
                ? `waveBounce 1s ease-in-out ${i * 0.1}s infinite`
                : "none",
            }}
          ></div>
        ))}
      </div>

      {/* 🕒 Duration + Time */}
      <div className="flex flex-col items-end text-[16px] mt-1 leading-tight">
        <span>
          {formatTime(audioRef.current?.currentTime || audioDuration)}
        </span>
        <div className="flex items-center gap-1 text-gray-400">
          <span>{time}</span>
        </div>
      </div>

      {/* 🔹 Animation CSS */}
      <style>{`
        @keyframes waveBounce {
          0%,
          100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceMessage;
