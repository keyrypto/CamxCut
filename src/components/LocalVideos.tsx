import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Video,
  Play,
  Trash2,
  Loader2,
  HardDrive,
  Upload,
  Film,
  Plus,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { useRouter } from '../router';
import { listVideos, getVideo, saveVideo, deleteVideo, StoredVideoMeta } from '../utils/videoStorage';
import VideoPlayer from './VideoPlayer';

interface StoredVideo {
  id: string;
  name: string;
  size: number;
  type: string;
  duration: number;
  uploadedAt: number;
  url?: string;
}

interface LocalVideosProps {
  openedFile?: File | null;
  onFileProcessed?: () => void;
}

const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'video/x-msvideo',
  'video/3gpp',
  'video/x-flv',
  'video/x-ms-wmv',
  'video/mkv',
  'video/x-matroska',
];

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'qt', '3gp', 'flv', 'wmv', 'mkv', 'm4v', 'mpg', 'mpeg', 'ogv'];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function getFileExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function isVideoFile(file: File) {
  const ext = getFileExtension(file.name);
  return SUPPORTED_VIDEO_FORMATS.includes(file.type) || VIDEO_EXTENSIONS.includes(ext);
}

function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };
  });
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function VideoCard({
  video,
  onPlay,
  onDelete,
  deleting,
}: {
  video: StoredVideo;
  onPlay: (video: StoredVideo) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  deleting: boolean;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [loadingThumb, setLoadingThumb] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;

    const loadThumb = async () => {
      try {
        const stored = await getVideo(video.id);
        if (revoked || !stored) {
          setLoadingThumb(false);
          return;
        }
        objectUrl = URL.createObjectURL(stored.blob);
        setThumbUrl(objectUrl);
      } catch {
        // thumbnail optional
      } finally {
        if (!revoked) setLoadingThumb(false);
      }
    };

    loadThumb();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [video.id]);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => onPlay(video)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(video);
        }
      }}
      className="group relative bg-secondary/80 border border-theme rounded-2xl overflow-hidden shadow-theme-sm hover:shadow-theme-md hover:border-[var(--accent-main)]/40 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]"
    >
      <div className="relative aspect-video bg-black">
        {loadingThumb ? (
          <div className="absolute inset-0 flex items-center justify-center bg-tertiary/30">
            <Loader2 className="w-6 h-6 text-[var(--accent-main)] animate-spin" />
          </div>
        ) : thumbUrl ? (
          <video
            src={thumbUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-tertiary/20">
            <Video className="w-10 h-10 text-secondary opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--accent-main)] transition-all duration-300">
            <Play className="w-7 h-7 text-white ml-0.5" fill="white" />
          </div>
        </div>
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md font-mono">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-primary mb-1.5 truncate font-outfit text-sm sm:text-base">
          {video.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>{formatFileSize(video.size)}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(video.uploadedAt)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => onDelete(video.id, e)}
        disabled={deleting}
        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
        aria-label={`Delete ${video.name}`}
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function LocalVideos({ openedFile, onFileProcessed }: LocalVideosProps = {}) {
  const { navigate } = useRouter();
  const [videos, setVideos] = useState<StoredVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<StoredVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const trackUrl = useCallback((url: string) => {
    objectUrlsRef.current.add(url);
    return url;
  }, []);

  const revokeUrl = useCallback((url: string) => {
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      const storedVideos = await listVideos();
      setVideos(
        storedVideos.map((video: StoredVideoMeta) => ({
          id: video.id,
          name: video.name,
          size: video.size,
          type: video.type,
          duration: 0,
          uploadedAt: video.createdAt,
        }))
      );
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Could not load your saved videos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const importFile = useCallback(
    async (file: File, autoPlay = true) => {
      setError(null);

      if (!isVideoFile(file)) {
        setError('Please select a valid video file (MP4, WebM, MOV, MKV, etc.).');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File must be under 100 MB. Try compressing the video first.');
        return;
      }

      setImporting(true);
      try {
        const duration = await getVideoDurationFromFile(file);
        const meta = await saveVideo(file);
        const entry: StoredVideo = {
          id: meta.id,
          name: meta.name,
          size: meta.size,
          type: meta.type,
          duration,
          uploadedAt: meta.createdAt,
        };
        setVideos((prev) => [entry, ...prev.filter((v) => v.id !== meta.id)]);

        if (autoPlay) {
          const url = trackUrl(URL.createObjectURL(file));
          setSelectedVideo({ ...entry, url });
        }
      } catch (err) {
        console.error('Failed to import video:', err);
        setError('Failed to add video. Please try again.');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [trackUrl]
  );

  useEffect(() => {
    if (openedFile) {
      importFile(openedFile, true).finally(() => onFileProcessed?.());
    }
  }, [openedFile, onFileProcessed, importFile]);

  const handlePlay = async (video: StoredVideo) => {
    setError(null);
    try {
      const stored = await getVideo(video.id);
      if (!stored) {
        setError('Video not found. It may have been removed.');
        await loadVideos();
        return;
      }
      const url = trackUrl(URL.createObjectURL(stored.blob));
      setSelectedVideo({ ...video, url });
    } catch (err) {
      console.error('Failed to open video:', err);
      setError('Failed to open video. Please try again.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this video from your device?')) return;

    try {
      setDeletingId(id);
      await deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (selectedVideo?.id === id) {
        if (selectedVideo.url) revokeUrl(selectedVideo.url);
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
      setError('Failed to delete video. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importFile(file, true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) importFile(file, true);
  };

  const totalSize = videos.reduce((sum, v) => sum + v.size, 0);

  if (selectedVideo?.url) {
    return (
      <div className="min-h-screen py-4 pb-24">
        <div className="container-app mx-auto">
          <VideoPlayer
            videoUrl={selectedVideo.url}
            videoName={selectedVideo.name}
            onClose={() => {
              if (selectedVideo.url) revokeUrl(selectedVideo.url);
              setSelectedVideo(null);
            }}
            autoPlay
            className="w-full aspect-video rounded-2xl overflow-hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-28"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.ogg,.avi,.mov,.qt,.3gp,.flv,.wmv,.mkv,.m4v,.mpg,.mpeg"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden
      />

      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-theme bg-gradient-to-b from-secondary/80 to-transparent">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,var(--accent-main),transparent_60%)]" />
        <div className="container-app mx-auto py-8 sm:py-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-main)]/15 border border-[var(--accent-main)]/30">
                <HardDrive className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent-main)]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-primary font-outfit tracking-tight">
                  My Videos
                </h1>
                <p className="text-secondary text-sm sm:text-base mt-1 max-w-md">
                  Videos saved on your device for offline playback — or pick one from your files.
                </p>
                {!loading && videos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-secondary">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/60 border border-theme">
                      <FolderOpen className="w-3.5 h-3.5" />
                      {videos.length} video{videos.length !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/60 border border-theme">
                      {formatFileSize(totalSize)} total
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] font-semibold text-sm shadow-theme-md hover:opacity-95 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {importing ? 'Adding…' : 'Add from device'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/studio')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-tertiary border border-theme font-semibold text-sm text-primary transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]"
              >
                <Film className="w-4 h-4 text-[var(--accent-main)]" />
                Open Studio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app mx-auto py-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-primary"
          >
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-secondary hover:text-primary shrink-0"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {isDragging && (
          <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="mx-4 max-w-sm w-full rounded-2xl border-2 border-dashed border-[var(--accent-main)] bg-secondary/95 p-8 text-center shadow-theme-lg">
              <Upload className="w-10 h-10 text-[var(--accent-main)] mx-auto mb-3" />
              <p className="text-primary font-semibold font-outfit">Drop to add video</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[var(--accent-main)] animate-spin mb-4" />
            <p className="text-primary font-medium">Loading your videos…</p>
          </div>
        ) : videos.length === 0 ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            className="relative rounded-2xl border-2 border-dashed border-theme hover:border-[var(--accent-main)]/60 bg-secondary/50 p-10 sm:p-16 text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] group"
          >
            <div className="w-20 h-20 rounded-2xl bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
              <Upload className="w-9 h-9 text-[var(--accent-main)]" />
            </div>
            <h2 className="text-xl font-bold text-primary font-outfit mb-2">No videos yet</h2>
            <p className="text-secondary text-sm sm:text-base max-w-sm mx-auto mb-6">
              Tap to browse your device, drag and drop a file here, or create a clip in Studio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={importing}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] font-semibold shadow-theme-md hover:opacity-95 transition-all disabled:opacity-60"
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Select from device
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/studio');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tertiary border border-theme text-primary font-semibold hover:bg-secondary transition-all"
              >
                <Film className="w-4 h-4 text-[var(--accent-main)]" />
                Go to Studio
              </button>
            </div>
            <p className="text-xs text-tertiary mt-6">MP4, WebM, MOV, MKV · up to 100 MB</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={handlePlay}
                onDelete={handleDelete}
                deleting={deletingId === video.id}
              />
            ))}

            {/* Add more card */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="group flex flex-col items-center justify-center min-h-[200px] rounded-2xl border-2 border-dashed border-theme hover:border-[var(--accent-main)]/50 bg-secondary/30 hover:bg-secondary/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] disabled:opacity-60"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-main)]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {importing ? (
                  <Loader2 className="w-5 h-5 text-[var(--accent-main)] animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 text-[var(--accent-main)]" />
                )}
              </div>
              <span className="text-sm font-semibold text-primary font-outfit">
                {importing ? 'Adding…' : 'Add from device'}
              </span>
              <span className="text-xs text-secondary mt-1">Tap or drop a file</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
