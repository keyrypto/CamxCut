import { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import VideoTrimmer from './VideoTrimmer';
import TextEditor, { TextStyle } from './TextEditor';
import VideoPreview from './VideoPreview'; 
import StudioBottomNavigation from './StudioBottomNavigation';
import { VideoData } from '../App';
import { useSettings, QualityPreference, SizePreference, FormatPreference } from '../contexts/SettingsContext';
import SEO from './SEO';
import JSONLD from './JSONLD';
import { Settings, ChevronDown, ChevronUp, Film, Monitor } from 'lucide-react';

type StepType = 'upload' | 'trim' | 'text' | 'preview';

// Helper function to detect video format from file
const detectFormat = (file: File): FormatPreference => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (extension === 'webm') return 'webm';
  if (extension === 'mov' || extension === 'qt') return 'mov';
  return 'mp4'; // Default to mp4
};

// Helper function to detect resolution from video dimensions
const detectResolution = (width: number, height: number): SizePreference => {
  const maxDimension = Math.max(width, height);
  if (maxDimension >= 2160) return '4k';
  if (maxDimension >= 1080) return '1080p';
  if (maxDimension >= 720) return '720p';
  return '480p';
};

// Helper function to estimate quality from file size and resolution
const estimateQuality = (fileSize: number, width: number, height: number): QualityPreference => {
  const pixels = width * height;
  const bitsPerPixel = (fileSize * 8) / pixels;
  
  if (bitsPerPixel > 0.5) return 'ultra';
  if (bitsPerPixel > 0.3) return 'high';
  if (bitsPerPixel > 0.15) return 'medium';
  return 'low';
};

export default function Studio() {
  const { settings, updateSettings } = useSettings();
  const [currentStep, setCurrentStep] = useState<StepType>('upload');
  const [showSettings, setShowSettings] = useState(false);
  const [videoData, setVideoData] = useState<VideoData>({
    url: '',
    duration: 0,
    startTime: 0,
    endTime: 0,
  });
  const [text, setText] = useState('');
  const [textStyle, setTextStyle] = useState<TextStyle>('neon');
  const [includeText, setIncludeText] = useState(true);

  // Get default end time based on duration preference
  const getDefaultEndTime = (duration: number) => {
    if (settings.duration === 'long') {
      return Math.min(30, duration); // Default to 30 seconds for long form
    } else {
      return Math.min(6, duration); // Default to 6 seconds for short form
    }
  };

  // Check for imported video data from VideoPlayer
  useEffect(() => {
    const importedData = sessionStorage.getItem('importedVideoData');
    if (importedData) {
      try {
        const videoData = JSON.parse(importedData);
        if (videoData.url) {
          const videoDuration = videoData.duration || 0;
          const defaultEndTime = settings.duration === 'long' 
            ? Math.min(30, videoDuration)
            : Math.min(6, videoDuration);
          
          // Detect video properties from URL
          const url = videoData.url;
          const video = document.createElement('video');
          video.src = url;
          
          video.onloadedmetadata = () => {
            const width = video.videoWidth;
            const height = video.videoHeight;
            
            // Detect resolution from video dimensions
            const detectedResolution = detectResolution(width, height);
            
            // Try to detect format from URL
            let detectedFormat: FormatPreference = 'mp4'; // Default
            try {
              const urlObj = new URL(url);
              const pathname = urlObj.pathname.toLowerCase();
              if (pathname.includes('.webm')) detectedFormat = 'webm';
              else if (pathname.includes('.mov')) detectedFormat = 'mov';
            } catch {
              // If URL parsing fails, default to mp4
            }
            
            // Estimate quality (without file size, use resolution as proxy)
            let detectedQuality: QualityPreference = 'high';
            if (detectedResolution === '4k') detectedQuality = 'ultra';
            else if (detectedResolution === '1080p') detectedQuality = 'high';
            else if (detectedResolution === '720p') detectedQuality = 'medium';
            else detectedQuality = 'low';
            
            // Update settings to match input file
            updateSettings({
              format: detectedFormat,
              size: detectedResolution,
              quality: detectedQuality,
            });
          };
          
          setVideoData({
            url: videoData.url,
            duration: videoDuration,
            startTime: 0,
            endTime: defaultEndTime,
          });
          setCurrentStep('trim');
          // Clear the imported data so it doesn't reload on next visit
          sessionStorage.removeItem('importedVideoData');
        }
      } catch (error) {
        console.error('Error parsing imported video data:', error);
        sessionStorage.removeItem('importedVideoData');
      }
    }
  }, [settings.duration, updateSettings]);

  const handleVideoUpload = (file: File, url: string, duration: number) => {
    // Detect video properties and set default settings to match input
    const video = document.createElement('video');
    video.src = url;
    
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      // Detect and set format, resolution, and quality to match input
      const detectedFormat = detectFormat(file);
      const detectedResolution = detectResolution(width, height);
      const detectedQuality = estimateQuality(file.size, width, height);
      
      // Update settings to match input file
      updateSettings({
        format: detectedFormat,
        size: detectedResolution,
        quality: detectedQuality,
      });
      
      setVideoData({
        file,
        url,
        duration,
        startTime: 0,
        endTime: getDefaultEndTime(duration),
      });
      setCurrentStep('trim');
    };
    
    video.onerror = () => {
      // Fallback if metadata loading fails
      setVideoData({
        file,
        url,
        duration,
        startTime: 0,
        endTime: getDefaultEndTime(duration),
      });
      setCurrentStep('trim');
    };
  };

  const handleTrimComplete = (startTime: number, endTime: number) => {
    setVideoData((prev: VideoData) => ({ ...prev, startTime, endTime }));
    // Skip text step if user doesn't want to include text
    if (includeText) {
      setCurrentStep('text');
    } else {
      setText(''); // Clear text if skipping
      setCurrentStep('preview');
    }
  };

  const handleTextComplete = (finalText: string, style: TextStyle) => {
    setText(finalText);
    setTextStyle(style);
    setCurrentStep('preview');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setVideoData({ url: '', duration: 0, startTime: 0, endTime: 0 });
    setText('');
    setTextStyle('neon');
    setIncludeText(true);
  };
 

  const handleStepBack = () => {
    if (currentStep === 'preview') {
      if (includeText) {
        setCurrentStep('text');
      } else {
        setCurrentStep('trim');
      }
    } else if (currentStep === 'text') {
      setCurrentStep('trim');
    } else if (currentStep === 'trim') {
      setCurrentStep('upload');
    }
  };

  const handleStepForward = () => {
    if (currentStep === 'upload' && videoData.url) {
      setCurrentStep('trim');
    } else if (currentStep === 'trim' && videoData.url && videoData.startTime !== videoData.endTime) {
      if (includeText) {
        setCurrentStep('text');
      } else {
        setText(''); // Clear text if skipping
        setCurrentStep('preview');
      }
    } else if (currentStep === 'text' && text) {
      setCurrentStep('preview');
    }
  };

  const canGoBack = currentStep !== 'upload';
  const canGoForward = Boolean(
    (currentStep === 'upload' && videoData.url) ||
    (currentStep === 'trim' && videoData.url && videoData.startTime !== videoData.endTime) ||
    (currentStep === 'text' && (text || !includeText))
  );

  return (
    <>
      <SEO
        title="Video Studio - Create & Edit Viral Clips | CamCut"
        description="Create stunning video clips with custom text overlays. Upload your own video, trim, add text styles, and export in seconds."
        keywords="video studio, video editor, video trimmer, text overlay, video creation, clip editor, camcut studio"
        url="https://camcut.fun/studio"
      />
      <JSONLD
        type="WebApplication"
        data={{
          name: 'CamCut Video Studio',
          applicationCategory: 'MultimediaApplication',
          featureList: [
            'Video upload',
            'Precise video trimming',
            'Text overlay with 6+ styles',
            'Real-time preview',
            'Instant export',
          ],
        }}
      />
      <div className="relative flex flex-col h-full bg-secondary/40 overflow-hidden">
         

        {/* Settings Section */}
        <div className="border-b border-theme bg-primary/50 ">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between max-w-4xl mx-auto hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[var(--accent-main)]" />
              <span className="text-sm font-semibold text-primary">Settings</span>
            </div>
            {showSettings ? (
              <ChevronUp className="w-4 h-4 text-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-secondary" />
            )}
          </button>

          {showSettings && (
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-theme bg-primary">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Text Overlay Option */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Film className="w-4 h-4 text-[var(--accent-main)]" />
                    <h3 className="text-sm font-semibold text-primary">Text Overlay</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIncludeText(true)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        includeText
                          ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                          : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary">Include Text</span>
                        {includeText && (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary">Add text overlay</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncludeText(false)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        !includeText
                          ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                          : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary">No Text</span>
                        {!includeText && (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary">Skip text step</p>
                    </button>
                  </div>
                </div>

                {/* Studio Preferences */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Film className="w-4 h-4 text-[var(--accent-main)]" />
                    <h3 className="text-sm font-semibold text-primary">Duration Preference</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateSettings({ duration: 'short' })}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        settings.duration === 'short'
                          ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                          : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary">Short Form</span>
                        {settings.duration === 'short' && (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary">3-6 seconds</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ duration: 'long' })}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        settings.duration === 'long'
                          ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                          : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary">Long Form</span>
                        {settings.duration === 'long' && (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary">30+ seconds</p>
                    </button>
                  </div>
                </div>

                {/* Output Configuration */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Monitor className="w-4 h-4 text-[var(--accent-main)]" />
                    <h3 className="text-sm font-semibold text-primary">Output Configuration</h3>
                  </div>
                  
                  {/* Quality */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-secondary mb-2">Quality</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['low', 'medium', 'high', 'ultra'] as QualityPreference[]).map((quality) => (
                        <button
                          key={quality}
                          type="button"
                          onClick={() => updateSettings({ quality })}
                          className={`text-xs p-2 rounded-lg border transition-all ${
                            settings.quality === quality
                              ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 font-semibold text-primary'
                              : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 text-secondary'
                          }`}
                        >
                          {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-secondary mb-2">Resolution</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['480p', '720p', '1080p', '4k'] as SizePreference[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateSettings({ size })}
                          className={`text-xs p-2 rounded-lg border transition-all ${
                            settings.size === size
                              ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 font-semibold text-primary'
                              : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 text-secondary'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">Output Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['mp4', 'webm', 'mov'] as FormatPreference[]).map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => updateSettings({ format })}
                          className={`text-xs p-2 rounded-lg border transition-all uppercase ${
                            settings.format === format
                              ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 font-semibold text-primary'
                              : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 text-secondary'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="animate-fade-in">
            {/* ——— Step 1: Upload ——— */}
            {currentStep === 'upload' && (
              <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 1 of 4</span>
                  <h2 className="text-xl font-bold text-primary font-outfit mt-1">Upload your video</h2>
                </div>
                <VideoUpload onVideoUpload={handleVideoUpload} />
              </section>
            )}

            {/* ——— Step 2: Trim ——— */}
            {currentStep === 'trim' && (
              <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 2 of 4</span>
                  <h2 className="text-xl font-bold text-primary font-outfit mt-1">Trim your clip</h2>
                  <p className="text-secondary text-sm mt-1">
                    {settings.duration === 'short' 
                      ? 'Choose 3–6 seconds for the best viral clip length.'
                      : 'Choose your preferred length for long-form content (30+ seconds recommended).'}
                  </p>
                </div>
                <VideoTrimmer
                  videoData={videoData}
                  onTrimComplete={handleTrimComplete}
                  onBack={() => setCurrentStep('upload')}
                />
              </section>
            )}

            {/* ——— Step 3: Text ——— */}
            {currentStep === 'text' && includeText && (
              <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 3 of 4</span>
                  <h2 className="text-xl font-bold text-primary font-outfit mt-1">Add text overlay</h2>
                  <p className="text-secondary text-sm mt-1">Type your caption and pick a style. You can preview in the next step.</p>
                </div>
                <TextEditor
                  onTextComplete={handleTextComplete}
                  onBack={() => setCurrentStep('trim')}
                />
              </section>
            )}

            {/* ——— Step 4: Preview ——— */}
            {currentStep === 'preview' && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 4 of 4</span>
                    <h2 className="text-xl font-bold text-primary font-outfit mt-1">Preview & export</h2>
                    <p className="text-secondary text-sm mt-1">Review your clip, then download or share.</p>
                  </div>
                  <VideoPreview
                    videoData={videoData}
                    text={text}
                    textStyle={textStyle}
                    onBack={() => setCurrentStep('text')}
                    onEdit={() => setCurrentStep('text')}
                    includeText={includeText}
                  />
                </div>
              </section>
            )}
            </div>
          </div>
        </div>

        <StudioBottomNavigation
          currentStep={currentStep}
          videoData={videoData}
          text={text}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onReset={handleReset}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
      </div>
    </>
  );
}
