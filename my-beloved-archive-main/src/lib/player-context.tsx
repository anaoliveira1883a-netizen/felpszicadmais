import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Item } from "./archive";

export type PlayerState = {
  currentTrack: Item | null;
  isPlaying: boolean;
  progress: number; // 0..100
  currentTime: number;
  duration: number;
  rpm: 33 | 45;
  volume: number;
  isTurntableOpen: boolean;
  playTrack: (item: Item) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  seek: (percent: number) => void;
  setRpm: (rpm: 33 | 45) => void;
  setVolume: (v: number) => void;
  openTurntable: () => void;
  closeTurntable: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

// Gentle synthesized nostalgic vinyl drone / chime generator using Web Audio API
class VintageSynthAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private oscs: OscillatorNode[] = [];
  private intervalId: number | null = null;

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  startCrackle() {
    if (!this.ctx || !this.masterGain) return;
    try {
      // Create subtle vinyl hiss / crackle buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // sporadic tiny crackles
        if (Math.random() < 0.002) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        } else {
          data[i] = (Math.random() * 2 - 1) * 0.015;
        }
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      noise.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start();
      this.noiseNode = noise;

      // Play soothing warm pentatonic chord progression
      const chords = [
        [261.63, 329.63, 392.0, 523.25], // C maj
        [220.0, 261.63, 329.63, 440.0],  // A min
        [174.61, 220.0, 261.63, 349.23], // F maj
        [196.0, 246.94, 293.66, 392.0],  // G maj
      ];
      let step = 0;

      const playChord = () => {
        if (!this.ctx || !this.masterGain) return;
        this.stopOscs();
        const chord = chords[step % chords.length]!;
        step++;
        chord.forEach((freq) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.012, this.ctx.currentTime);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();
          this.oscs.push(osc);
        });
      };

      playChord();
      this.intervalId = window.setInterval(playChord, 4000);
    } catch (err) {
      console.warn("Web Audio crackle fallback error:", err);
    }
  }

  stopOscs() {
    this.oscs.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {
        // ignore
      }
    });
    this.oscs = [];
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.stopOscs();
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Item | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // default 3:00 for vinyl feel
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [volume, setVolumeState] = useState(0.8);
  const [isTurntableOpen, setIsTurntableOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<VintageSynthAudio | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    synthRef.current = new VintageSynthAudio();
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      synthRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Simulated playback timer for tracks that use the vintage synthesizer
  useEffect(() => {
    if (isPlaying && (!currentTrack?.audioUrl || !audioRef.current?.src)) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            setIsPlaying(false);
            synthRef.current?.stop();
            return 0;
          }
          setProgress((next / duration) * 100);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTrack, duration]);

  const playTrack = useCallback((item: Item) => {
    setCurrentTrack(item);
    setIsPlaying(true);
    setCurrentTime(0);
    setProgress(0);

    if (item.audioUrl && audioRef.current) {
      synthRef.current?.stop();
      audioRef.current.src = item.audioUrl;
      audioRef.current.volume = volume;
      audioRef.current.play().catch((e) => {
        console.warn("Direct audio play prevented, falling back to synth:", e);
        synthRef.current?.init();
        synthRef.current?.startCrackle();
      });
    } else {
      if (audioRef.current) audioRef.current.pause();
      synthRef.current?.init();
      synthRef.current?.startCrackle();
    }
  }, [volume]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    synthRef.current?.stop();
  }, []);

  const resumeTrack = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying(true);
    if (currentTrack.audioUrl && audioRef.current?.src) {
      audioRef.current.play().catch(() => {});
    } else {
      synthRef.current?.init();
      synthRef.current?.startCrackle();
    }
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const seek = useCallback((percent: number) => {
    const target = (percent / 100) * duration;
    setCurrentTime(target);
    setProgress(percent);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = target;
    }
  }, [duration]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  const openTurntable = useCallback(() => setIsTurntableOpen(true), []);
  const closeTurntable = useCallback(() => setIsTurntableOpen(false), []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        rpm,
        volume,
        isTurntableOpen,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        seek,
        setRpm,
        setVolume,
        openTurntable,
        closeTurntable,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return ctx;
}
