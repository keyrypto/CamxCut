import { ChevronLeft, ChevronRight, RotateCcw, Upload, Scissors, Type, Eye, Check, ChevronDown, ChevronUp } from 'lucide-react';  
import { VideoData } from '../App';
import { useEffect, useRef, useState } from 'react';

type StepType = 'upload' | 'trim' | 'text' | 'preview';

interface StudioBottomNavigationProps {
  currentStep: StepType;
  videoData: VideoData;
  text: string;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

interface StepInfo {
  name: string;
  icon: typeof Upload;
  shortName: string;
}

export default function StudioBottomNavigation({
  currentStep,
  onStepBack,
  onStepForward,
  onReset,
  canGoBack,
  canGoForward,
}: StudioBottomNavigationProps) {
  const stepOrder: StepType[] = ['upload', 'trim', 'text', 'preview'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);

  const stepInfo: Record<StepType, StepInfo> = {
    upload: { name: 'Upload', icon: Upload, shortName: 'Upload' },
    trim: { name: 'Trim', icon: Scissors, shortName: 'Trim' },
    text: { name: 'Add Text', icon: Type, shortName: 'Text' },
    preview: { name: 'Preview', icon: Eye, shortName: 'Preview' },
  };

  const progressPercentage = ((currentStepIndex + 1) / stepOrder.length) * 100;

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progressPercentage}%`;
    }
  }, [progressPercentage]);

  const getStepName = (step: StepType): string => stepInfo[step].name;

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          aria-label="Studio navigation"
          role="navigation"
        >
          <div className="relative mx-2 mb-2">
            <div className="relative backdrop-blur-xl rounded-2xl border border-[var(--accent-main)]/30 shadow-theme-lg overflow-hidden bg-[var(--bg-primary)]/95">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-secondary)]">
                <div
                  ref={progressRef}
                  className="h-full bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-main)]/80 transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                  aria-hidden
                />
              </div>

              {/* Step Indicators - Accordion */}
              <div
                className={`
                  overflow-hidden transition-all duration-500 ease-in-out
                  ${isStepsExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center justify-between gap-1">
                    {stepOrder.map((step, index) => {
                      const info = stepInfo[step];
                      const Icon = info.icon;
                      const isActive = step === currentStep;
                      const isCompleted = index < currentStepIndex;

                      return (
                        <div
                          key={step}
                          className="flex-1 flex flex-col items-center gap-1.5"
                          aria-hidden
                        >
                          <div
                            className={`
                              relative flex items-center justify-center w-8 h-8 rounded-full
                              transition-all duration-300 ease-out
                              ${isActive
                                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] scale-110 shadow-md shadow-[var(--accent-main)]/30'
                                : isCompleted
                                ? 'bg-[var(--accent-main)]/20 text-[var(--accent-main)] scale-100'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] scale-100'
                              }
                            `}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4" strokeWidth={2.5} />
                            ) : (
                              <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                            )}
                          </div>
                          <span
                            className={`
                              text-[10px] font-medium text-center leading-tight
                              transition-colors duration-300
                              ${isActive
                                ? 'text-[var(--accent-main)] font-semibold'
                                : isCompleted
                                ? 'text-[var(--text-secondary)]'
                                : 'text-[var(--text-tertiary)]'
                              }
                            `}
                          >
                            {info.shortName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="relative flex items-center justify-between px-3 pb-3 gap-2">
                {/* Back button */}
                <button
                  type="button"
                  onClick={onStepBack}
                  disabled={!canGoBack}
                  className={`
                    group flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl
                    transition-all duration-300 ease-out
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                    ${canGoBack
                      ? 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] active:scale-[0.95] shadow-sm hover:shadow-md'
                      : 'bg-[var(--bg-secondary)]/50 text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                    }
                  `}
                  aria-label="Previous step"
                >
                  <ChevronLeft className={`w-4 h-4 transition-transform ${canGoBack ? 'group-hover:-translate-x-0.5' : ''}`} />
                  <span className="text-xs font-semibold hidden sm:inline">Back</span>
                </button>

                {/* Current step name - Clickable to toggle accordion */}
                <button
                  type="button"
                  onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                  className="flex-1 flex items-center justify-center min-w-0 px-2 py-2 rounded-lg hover:bg-[var(--bg-secondary)]/50 transition-colors duration-200 group"
                  aria-label={isStepsExpanded ? 'Hide steps' : 'Show steps'}
                  aria-expanded={isStepsExpanded}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = stepInfo[currentStep].icon;
                      return (
                        <Icon className="w-4 h-4 text-[var(--accent-main)] flex-shrink-0" />
                      );
                    })()}
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {getStepName(currentStep)}
                    </span>
                    {isStepsExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-main)] transition-colors" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-main)] transition-colors" />
                    )}
                  </div>
                </button>

                {/* Forward/Reset button */}
                {currentStep === 'preview' ? (
                  <button
                    type="button"
                    onClick={onReset}
                    className="group flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-main)]/90 text-[var(--accent-contrast)] hover:shadow-lg hover:shadow-[var(--accent-main)]/30 active:scale-[0.95] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
                    aria-label="Create new clip"
                  >
                    <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    <span className="text-xs font-semibold hidden sm:inline">New</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onStepForward}
                    disabled={!canGoForward}
                    className={`
                      group flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl
                      transition-all duration-300 ease-out
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                      ${canGoForward
                        ? 'bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-main)]/90 text-[var(--accent-contrast)] hover:shadow-lg hover:shadow-[var(--accent-main)]/30 active:scale-[0.95]'
                        : 'bg-[var(--bg-secondary)]/50 text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                      }
                    `}
                    aria-label="Next step"
                  >
                    <span className="text-xs font-semibold hidden sm:inline">Next</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${canGoForward ? 'group-hover:translate-x-0.5' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            <div
              className="h-[env(safe-area-inset-bottom)] min-h-[8px]"
              aria-hidden
            />
          </div>
        </nav>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          aria-label="Studio navigation"
          role="navigation"
        >
          <div className="max-w-3xl mx-auto px-4 pb-4">
            <div className="relative bg-[var(--bg-primary)]/95 backdrop-blur-xl rounded-2xl border border-[var(--accent-main)]/20 shadow-theme-lg overflow-hidden">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--bg-secondary)]">
                <div
                  ref={progressRef}
                  className="h-full bg-gradient-to-r from-[var(--accent-main)] via-[var(--accent-main)]/90 to-[var(--accent-main)]/80 transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                  aria-hidden
                />
              </div>

              {/* Step Indicators - Accordion */}
              <div
                className={`
                  overflow-hidden transition-all duration-500 ease-in-out
                  ${isStepsExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    {stepOrder.map((step, index) => {
                      const info = stepInfo[step];
                      const Icon = info.icon;
                      const isActive = step === currentStep;
                      const isCompleted = index < currentStepIndex;

                      return (
                        <div
                          key={step}
                          className="flex-1 flex flex-col items-center gap-2 relative"
                          aria-hidden
                        >
                          {/* Connector Line */}
                          {index < stepOrder.length - 1 && (
                            <div
                              className={`
                                absolute top-5 left-[60%] right-[-40%] h-0.5
                                transition-all duration-500 ease-out
                                ${isCompleted
                                  ? 'bg-[var(--accent-main)]'
                                  : 'bg-[var(--bg-secondary)]'
                                }
                              `}
                            />
                          )}

                          {/* Step Circle */}
                          <div
                            className={`
                              relative flex items-center justify-center w-10 h-10 rounded-full
                              transition-all duration-300 ease-out z-10
                              ${isActive
                                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] scale-110 shadow-lg shadow-[var(--accent-main)]/40 ring-2 ring-[var(--accent-main)]/30'
                                : isCompleted
                                ? 'bg-[var(--accent-main)]/20 text-[var(--accent-main)] scale-100 hover:scale-105'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] scale-100'
                              }
                            `}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5" strokeWidth={2.5} />
                            ) : (
                              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                            )}
                          </div>

                          {/* Step Label */}
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`
                                text-xs font-semibold
                                transition-colors duration-300
                                ${isActive
                                  ? 'text-[var(--accent-main)]'
                                  : isCompleted
                                  ? 'text-[var(--text-primary)]'
                                  : 'text-[var(--text-tertiary)]'
                                }
                              `}
                            >
                              {info.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                                Step {index + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="relative flex items-center justify-between px-6 pb-4 gap-4">
                {/* Back button */}
                <button
                  type="button"
                  onClick={onStepBack}
                  disabled={!canGoBack}
                  className={`
                    group flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                    transition-all duration-300 ease-out
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                    ${canGoBack
                      ? 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] active:scale-[0.97] shadow-sm hover:shadow-md border border-[var(--border-color)]'
                      : 'bg-[var(--bg-secondary)]/50 text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                    }
                  `}
                  aria-label="Previous step"
                >
                  <ChevronLeft className={`w-4 h-4 transition-transform ${canGoBack ? 'group-hover:-translate-x-1' : ''}`} />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                {/* Current step info - Clickable to toggle accordion */}
                <button
                  type="button"
                  onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                  className="flex-1 flex items-center justify-center gap-3 px-4 py-2 rounded-xl hover:bg-[var(--bg-secondary)]/30 transition-all duration-200 group"
                  aria-label={isStepsExpanded ? 'Hide steps' : 'Show steps'}
                  aria-expanded={isStepsExpanded}
                >
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] group-hover:border-[var(--accent-main)]/30 transition-colors">
                    {(() => {
                      const Icon = stepInfo[currentStep].icon;
                      return (
                        <Icon className="w-5 h-5 text-[var(--accent-main)]" />
                      );
                    })()}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {getStepName(currentStep)}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Step {currentStepIndex + 1} of {stepOrder.length}
                      </span>
                    </div>
                    {isStepsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-main)] transition-colors ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-main)] transition-colors ml-1" />
                    )}
                  </div>
                </button>

                {/* Forward/Reset button */}
                {currentStep === 'preview' ? (
                  <button
                    type="button"
                    onClick={onReset}
                    className="group flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-main)]/90 text-[var(--accent-contrast)] hover:shadow-xl hover:shadow-[var(--accent-main)]/40 active:scale-[0.97] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
                    aria-label="Create new clip"
                  >
                    <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                    <span className="text-sm font-semibold">New Clip</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onStepForward}
                    disabled={!canGoForward}
                    className={`
                      group flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                      transition-all duration-300 ease-out
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                      ${canGoForward
                        ? 'bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-main)]/90 text-[var(--accent-contrast)] hover:shadow-xl hover:shadow-[var(--accent-main)]/40 active:scale-[0.97]'
                        : 'bg-[var(--bg-secondary)]/50 text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                      }
                    `}
                    aria-label="Next step"
                  >
                    <span className="text-sm font-semibold">Next</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${canGoForward ? 'group-hover:translate-x-1' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

