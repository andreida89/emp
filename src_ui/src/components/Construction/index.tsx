import React, { useState, useEffect, useRef } from 'react';

/**
 * Componenta Construction pentru Empire Romania Roleplay - BETA.
 * Optimizată pentru RAGEMP CEF (Autoplay forțat, afișaj timp/volum și progres).
 */
const Icons = {
  ExternalLink: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
  ),
  Play: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M8 5v14l11-7z"/></svg>
  ),
  Pause: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
  )
};

export default function Construction() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.05); // Volum inițial mic (5%)
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

const formatTime = (seconds?: number) => {
  if (seconds == null || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      // În RAGEMP CEF, autoplay-ul pornește fără gestul utilizatorului dacă audio-ul este configurat astfel
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback în caz de restricție neașteptată
        setIsPlaying(false);
      });
    }
  }, []);

const togglePlay = () => {
  const audio = audioRef.current;
  if (!audio) return;

  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }

  setIsPlaying(!isPlaying);
};

const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newVolume = parseFloat(e.target.value);
  setVolume(newVolume);

  const audio = audioRef.current;
  if (audio) {
    audio.volume = newVolume;
  }
};

const handleTimeUpdate = () => {
  const audio = audioRef.current;
  if (!audio) return;

  const current = audio.currentTime;
  const dur = audio.duration;

  if (dur) {
    setProgress((current / dur) * 100);
    setCurrentTime(formatTime(current));
    setDuration(formatTime(dur));
  }
};

const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const audio = audioRef.current;
  if (!audio) return;

  const newTime = (parseFloat(e.target.value) / 100) * audio.duration;
  audio.currentTime = newTime;

  setProgress(parseFloat(e.target.value));
};

  return (
    <div className="er-beta-wrapper">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap'); .er-beta-wrapper { margin: 0; padding: 0; width: 100vw; height: 100vh; background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Inter', sans-serif; user-select: none; overflow: hidden; } .er-beta-card { background: #0d0d0d; border: 1px solid rgba(241, 196, 15, 0.15); border-radius: 1.5vw; padding: 5vw; width: 70vw; max-width: 1100px; text-align: center; box-shadow: 0 5vw 15vw rgba(0, 0, 0, 0.9); position: relative; overflow: hidden; } .er-beta-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #f1c40f, transparent); opacity: 0.5; } .er-beta-bg-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-5deg); font-size: 15vw; font-weight: 900; font-style: italic; opacity: 0.02; pointer-events: none; letter-spacing: -0.5vw; white-space: nowrap; z-index: 0; } .er-beta-title { font-size: 3.2vw; font-weight: 900; color: #fff; font-style: italic; letter-spacing: -0.1vw; margin: 0 0 2.5vw 0; text-transform: uppercase; position: relative; z-index: 1; } .er-beta-title span { color: #f1c40f; } .er-beta-content { font-size: 1.35vw; line-height: 1.6; color: #a0a0a0; margin: 0 auto 3vw auto; max-width: 90%; font-weight: 300; position: relative; z-index: 1; } .er-beta-content b { color: #f1c40f; font-weight: 700; } .er-beta-discord-box { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1vw; padding: 2vw; margin-bottom: 3vw; position: relative; z-index: 1; } .er-beta-discord-label { display: block; font-size: 0.9vw; color: #666; margin-bottom: 1vw; text-transform: uppercase; letter-spacing: 0.1vw; } .er-beta-link { display: inline-flex; align-items: center; gap: 1vw; color: #f1c40f; text-decoration: none; font-size: 2vw; font-weight: 700; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .er-beta-link:hover { color: #fff; transform: scale(1.02); } .er-beta-audio-player { position: absolute; bottom: 2vw; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 1vw; background: rgba(0, 0, 0, 0.6); padding: 0.8vw 1.5vw; border-radius: 2vw; border: 1px solid rgba(241, 196, 15, 0.2); z-index: 5; backdrop-filter: blur(10px); } .er-beta-audio-btn { background: none; border: none; color: #f1c40f; cursor: pointer; display: flex; align-items: center; padding: 0; transition: 0.2s; } .er-beta-audio-btn:hover { transform: scale(1.1); color: #fff; } .er-beta-slider { -webkit-appearance: none; height: 0.2vw; background: rgba(255, 255, 255, 0.1); border-radius: 1vw; outline: none; cursor: pointer; } .er-beta-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 0.7vw; height: 0.7vw; background: #f1c40f; border-radius: 50%; cursor: pointer; transition: 0.2s; } .er-beta-progress { width: 10vw; } .er-beta-volume { width: 4vw; } .er-beta-time-info, .er-beta-vol-info { font-size: 0.7vw; color: #f1c40f; font-weight: 700; min-width: 2.5vw; white-space: nowrap; font-variant-numeric: tabular-nums; } @media (max-width: 768px) { .er-beta-card { width: 90vw; padding: 8vw; } .er-beta-title { font-size: 6vw; } .er-beta-content { font-size: 3.5vw; } .er-beta-audio-player { width: 85%; gap: 2vw; padding: 2vw; } .er-beta-progress { flex: 1; } .er-beta-time-info, .er-beta-vol-info { font-size: 2.5vw; } }`}</style>

      <div className="er-beta-card">
        <div className="er-beta-bg-text">EMPIRE</div>

        <h1 className="er-beta-title">EMPIRE ROMANIA <span>ROLEPLAY</span> - BETA</h1>

        <p className="er-beta-content">
          Salut! Vezi această pagină deoarece nu ești înregistrat ca <b>BETA TESTER</b> în comunitatea <b>EMPIRE ROMANIA ROLEPLAY</b>.
          <br /><br />
          Pentru a aplica la programul de testare și a primi acces prioritar la server, te rugăm să te alături comunității noastre pe Discord, unde vei putea aplica pentru programul de testare <b>BETA</b>.
        </p>

        <div className="er-beta-discord-box">
          <span className="er-beta-discord-label">Alătură-te acum și depune aplicația</span>
          <a 
            href="https://discord.gg/empirero" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="er-beta-link"
          >
            DISCORD.GG/EMPIRERO
            <Icons.ExternalLink size={24} />
          </a>
        </div>

        <audio 
          ref={audioRef} 
          src="https://empirerp.eu/song.mp3" 
          onTimeUpdate={handleTimeUpdate}
          autoPlay
          loop 
        />
        
        <div className="er-beta-audio-player">
          <button className="er-beta-audio-btn" onClick={togglePlay}>
            {isPlaying ? <Icons.Pause size={18} /> : <Icons.Play size={18} />}
          </button>
          
          <span className="er-beta-time-info">{currentTime} / {duration}</span>

          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.1" 
            value={progress} 
            onChange={handleProgressChange} 
            className="er-beta-slider er-beta-progress"
          />

          <span className="er-beta-vol-info">{Math.round(volume * 100)}%</span>

          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
            className="er-beta-slider er-beta-volume"
          />
        </div>
      </div>
    </div>
  );
}