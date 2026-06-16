import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Scissors,
  Smartphone,
  Monitor,
  PictureInPicture2,
  Repeat,
  Loader2,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useRouter } from '../router';

type ViewOrientation = 'landscape' | 'portrait';

interface VideoPlayerProps {
  videoUrl: string;
  videoName?: string;
  onClose?: () => void;
  autoPlay?: boolean;
  className?: string;
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SEEK_STEP = 10;
const DOUBLE_TAP_MS = 300;

async function lockScreenOrientation(mode: ViewOrientation) {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: 'portrait-primary' | 'landscape') => Promise<void>;
    unlock?: () => void;
  };
  if (!orientation?.lock) return;

  try {
    await orientation.lock(mode === 'portrait' ? 'portrait-primary' : 'landscape');
  } catch {
    /* orientation lock not supported or denied */
  }
}

function unlockScreenOrientation() {
  const orientation = screen.orientation as ScreenOrientation & { unlock?: () => void };
  orientation?.unlock?.();
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({
  videoUrl,
  videoName,
  onClose,
  autoPlay = false,
  className = '',
}: VideoPlayerProps) {
  const { navigate } = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [viewOrientation, setViewOrientation] = useState<ViewOrientation>('landscape');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [skipIndicator, setSkipIndicator] = useState<{ side: 'left' | 'right'; seconds: number } | null>(null);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const bufferProgress = duration > 0 ? Math.min(100, Math.max(0, (buffered / duration) * 100)) : 0;

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        setShowControls(false);
      }
    }, 3500);
  }, []);

  const showSkipFeedback = useCallback((side: 'left' | 'right', seconds: number) => {
    setSkipIndicator({ side, seconds });
    setTimeout(() => setSkipIndicator(null), 700);
  }, []);

  const seekBy = useCallback(
    (seconds: number, showFeedback = false) => {
      const video = videoRef.current;
      if (!video) return;

      const safeDuration = Number.isFinite(video.duration) ? video.duration : Infinity;
      const newTime = Math.min(Math.max(0, video.currentTime + seconds), safeDuration);
      video.currentTime = newTime;
      setCurrentTime(newTime);

      if (showFeedback) {
        showSkipFeedback(seconds < 0 ? 'left' : 'right', Math.abs(seconds));
      }
      resetControlsTimeout();
    },
    [resetControlsTimeout, showSkipFeedback]
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    const shouldMute = newVolume === 0;
    video.muted = shouldMute;
    setVolume(newVolume);
    setIsMuted(shouldMute);
    resetControlsTimeout();
  };

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        await lockScreenOrientation(viewOrientation);
      } else {
        unlockScreenOrientation();
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error(err);
    }
    resetControlsTimeout();
  }, [viewOrientation, resetControlsTimeout]);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error(err);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.loop = !video.loop;
    setIsLooping(video.loop);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleViewOrientation = useCallback(() => {
    setViewOrientation((prev) => (prev === 'landscape' ? 'portrait' : 'landscape'));
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const setRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    resetControlsTimeout();
  };

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = currentIndex === -1 ? 3 : (currentIndex + 1) % PLAYBACK_RATES.length;
    setRate(PLAYBACK_RATES[nextIndex]);
  };

  const handleImportToStudio = () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const videoData = {
      url: videoUrl,
      duration: duration || video.duration || 0,
      startTime: 0,
      endTime: 0,
      name: videoName || 'Imported Video',
    };

    sessionStorage.setItem('importedVideoData', JSON.stringify(videoData));
    navigate('/studio');
  };

  const handleVideoAreaInteraction = (clientX: number, rect: DOMRect) => {
    const now = Date.now();
    const relativeX = (clientX - rect.left) / rect.width;
    const lastTap = lastTapRef.current;

    if (lastTap && now - lastTap.time < DOUBLE_TAP_MS) {
      if (relativeX < 0.35) {
        seekBy(-SEEK_STEP, true);
      } else if (relativeX > 0.65) {
        seekBy(SEEK_STEP, true);
      } else {
        togglePlay();
      }
      lastTapRef.current = null;
      return;
    }

    lastTapRef.current = { time: now, x: clientX };

    setTimeout(() => {
      if (lastTapRef.current?.time === now) {
        togglePlay();
        lastTapRef.current = null;
      }
    }, DOUBLE_TAP_MS);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!containerRef.current || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const rect = containerRef.current.getBoundingClientRect();
    handleVideoAreaInteraction(touch.clientX, rect);
    resetControlsTimeout();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      toggleFullscreen();
      return;
    }
    togglePlay();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seekBy(-5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        seekBy(5);
        break;
      case 'j':
        e.preventDefault();
        seekBy(-SEEK_STEP);
        break;
      case 'l':
        e.preventDefault();
        seekBy(SEEK_STEP);
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'p':
        e.preventDefault();
        togglePiP();
        break;
      case 'r':
        e.preventDefault();
        toggleViewOrientation();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const updateBuffer = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnterPiP = () => setIsInPiP(true);
    const handleLeavePiP = () => setIsInPiP(false);

    video.volume = volume;
    video.playbackRate = playbackRate;
    video.loop = isLooping;

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('progress', updateBuffer);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    setIsPiPSupported(document.pictureInPictureEnabled && 'requestPictureInPicture' in video);

    if (autoPlay) {
      video.play().catch(console.error);
    }

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('progress', updateBuffer);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [autoPlay, videoUrl, volume, playbackRate, isLooping]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) unlockScreenOrientation();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, resetControlsTimeout]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setShowSpeedMenu(false);
      setShowVolumeSlider(false);
    };
    if (showSpeedMenu || showVolumeSlider) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [showSpeedMenu, showVolumeSlider]);

  const containerAspect =
    viewOrientation === 'portrait'
      ? 'aspect-[9/16] max-h-[min(85dvh,720px)] w-full max-w-[min(100%,400px)] mx-auto'
      : 'aspect-video w-full';

  const controlBtnClass =
    'flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] min-w-[var(--touch-min)] min-h-[var(--touch-min)] touch-manipulation';

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 select-none ${containerAspect} ${className.replace(/aspect-\S+/g, '').trim()}`}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying) {
          setTimeout(() => setShowControls(false), 2000);
        }
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={videoName || 'Video player'}
      role="application"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        playsInline
        preload="metadata"
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
      />

      {/* Loading spinner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none"
          >
            <Loader2 className="w-10 h-10 text-white animate-spin" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double-tap skip feedback */}
      <AnimatePresence>
        {skipIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none ${
              skipIndicator.side === 'left' ? 'left-[15%]' : 'right-[15%]'
            }`}
          >
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-md">
              {skipIndicator.side === 'left' ? (
                <RotateCcw className="w-8 h-8 text-white" />
              ) : (
                <RotateCw className="w-8 h-8 text-white" />
              )}
              <span className="text-white text-sm font-semibold">{skipIndicator.seconds}s</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!showControls}
      >
        {/* Top gradient + bar */}
        <div className="bg-gradient-to-b from-black/80 via-black/30 to-transparent pt-[max(0.75rem,var(--safe-top))] px-3 sm:px-4 pb-8">
          <div className="flex items-center gap-2">
            {videoName && (
              <h3 className="text-white font-semibold text-sm sm:text-base truncate flex-1 min-w-0 drop-shadow-md">
                {videoName}
              </h3>
            )}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleViewOrientation();
                }}
                className={controlBtnClass}
                aria-label={
                  viewOrientation === 'landscape'
                    ? 'Switch to portrait view'
                    : 'Switch to landscape view'
                }
                title={viewOrientation === 'landscape' ? 'Portrait mode' : 'Landscape mode'}
              >
                {viewOrientation === 'landscape' ? (
                  <Smartphone className="w-5 h-5 text-white" />
                ) : (
                  <Monitor className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImportToStudio();
                }}
                className={controlBtnClass}
                aria-label="Import to Studio to trim"
                title="Import to Studio"
              >
                <Scissors className="w-5 h-5 text-white" />
              </button>
              {onClose && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className={controlBtnClass}
                  aria-label="Close player"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center play/pause — visible when paused */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="pointer-events-auto flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--accent-main)]/90 hover:bg-[var(--accent-main)] shadow-lg shadow-[var(--accent-main)]/30 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Play"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls */}
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 sm:px-4 pt-10 pb-[max(0.75rem,var(--safe-bottom))] space-y-2 sm:space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2 group/progress">
            <span className="text-white/90 text-[11px] sm:text-xs font-mono tabular-nums min-w-[38px] sm:min-w-[45px]">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 h-6 flex items-center cursor-pointer touch-manipulation">
              {/* Buffer track */}
              <div className="absolute inset-x-0 h-1 sm:h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-white/25 rounded-full transition-all duration-300"
                  style={{ width: `${bufferProgress}%` }}
                />
              </div>
              {/* Progress track */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={duration ? currentTime : 0}
                onChange={handleSeek}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full h-1 sm:h-1.5 rounded-full appearance-none cursor-pointer bg-transparent z-10
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-main)]
                  [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:transition-transform group-hover/progress:[&::-webkit-slider-thumb]:scale-125
                  [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-[var(--accent-main)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                style={{
                  background: `linear-gradient(to right, var(--accent-main) 0%, var(--accent-main) ${progress}%, transparent ${progress}%, transparent 100%)`,
                }}
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
              />
            </div>
            <span className="text-white/90 text-[11px] sm:text-xs font-mono tabular-nums min-w-[38px] sm:min-w-[45px] text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className={controlBtnClass}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" fill="white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  seekBy(-SEEK_STEP);
                }}
                className={`${controlBtnClass} hidden sm:flex`}
                aria-label={`Rewind ${SEEK_STEP} seconds`}
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  seekBy(SEEK_STEP);
                }}
                className={`${controlBtnClass} hidden sm:flex`}
                aria-label={`Forward ${SEEK_STEP} seconds`}
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>

              {/* Volume */}
              <div className="relative flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      setShowVolumeSlider((v) => !v);
                    } else {
                      toggleMute();
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className={controlBtnClass}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <div className="hidden sm:flex items-center w-20 opacity-100 ml-1 overflow-hidden transition-all duration-200">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[var(--accent-main)]"
                    aria-label="Volume"
                  />
                </div>
                {showVolumeSlider && (
                  <div
                    className="sm:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-black/80 backdrop-blur-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[var(--accent-main)]"
                      aria-label="Volume"
                    />
                  </div>
                )}
              </div>

              {/* Playback speed */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      setShowSpeedMenu((v) => !v);
                    } else {
                      cyclePlaybackRate();
                    }
                  }}
                  className={`${controlBtnClass} px-3 min-w-0`}
                  aria-label="Playback speed"
                  aria-haspopup="listbox"
                >
                  <span className="text-xs sm:text-sm text-white font-semibold tabular-nums">
                    {playbackRate}x
                  </span>
                </button>
                {showSpeedMenu && (
                  <div
                    className="absolute bottom-full left-0 mb-2 py-1 rounded-xl bg-black/90 backdrop-blur-md border border-white/10 shadow-xl min-w-[72px] z-40"
                    onClick={(e) => e.stopPropagation()}
                    role="listbox"
                    aria-label="Playback speed options"
                  >
                    {PLAYBACK_RATES.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setRate(rate)}
                        className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                          rate === playbackRate
                            ? 'text-[var(--accent-main)] font-semibold bg-white/10'
                            : 'text-white hover:bg-white/10'
                        }`}
                        role="option"
                        aria-selected={rate === playbackRate}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLoop();
                }}
                className={`${controlBtnClass} ${isLooping ? 'bg-[var(--accent-main)]/40 ring-1 ring-[var(--accent-main)]' : ''}`}
                aria-label={isLooping ? 'Disable loop' : 'Enable loop'}
                aria-pressed={isLooping}
              >
                <Repeat className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {isPiPSupported && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePiP();
                  }}
                  className={`${controlBtnClass} hidden sm:flex ${isInPiP ? 'bg-[var(--accent-main)]/40' : ''}`}
                  aria-label={isInPiP ? 'Exit picture-in-picture' : 'Picture-in-picture'}
                >
                  <PictureInPicture2 className="w-5 h-5 text-white" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className={controlBtnClass}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile hint — fades after first interaction */}
      <div
        className={`absolute bottom-20 left-0 right-0 text-center pointer-events-none transition-opacity duration-500 sm:hidden ${
          showControls && !isPlaying ? 'opacity-60' : 'opacity-0'
        }`}
      >
        <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
          Double-tap sides to skip · Tap center to play
        </span>
      </div>
    </div>
  );
}
