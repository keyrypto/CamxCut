import React, { useState, useEffect, useRef } from 'react';
import { Type, Sparkles, Zap, Palette, Wand2, SkipForward } from 'lucide-react';

interface TextEditorProps {
  onTextComplete: (text: string, style: TextStyle) => void;
  onBack: () => void;
}

export type TextStyle = 'comic' | 'neon' | 'retro';

interface StyleOption {
  id: TextStyle;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  bgGradient: string;
  borderColor: string;
}

function TextEditor({ onTextComplete, onBack }: TextEditorProps) {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<TextStyle>('neon');
  const [placeholder, setPlaceholder] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const styles: StyleOption[] = [
    { 
      id: 'comic', 
      name: 'Comic', 
      description: 'Bold & Fun',
      icon: <Sparkles className="w-5 h-5" />,
      gradient: 'from-blue-500 to-purple-600',
      glowColor: 'rgba(147, 51, 234, 0.4)',
      bgGradient: 'from-blue-500/10 via-purple-500/10 to-pink-500/10',
      borderColor: 'border-blue-400/50'
    },
    { 
      id: 'neon', 
      name: 'Neon', 
      description: 'Glowing Edge',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-green-400 to-emerald-500',
      glowColor: 'rgba(34, 197, 94, 0.4)',
      bgGradient: 'from-green-500/10 via-emerald-500/10 to-cyan-500/10',
      borderColor: 'border-green-400/50'
    },
    { 
      id: 'retro', 
      name: 'Retro', 
      description: 'Vintage Vibe',
      icon: <Palette className="w-5 h-5" />,
      gradient: 'from-yellow-400 to-pink-500',
      glowColor: 'rgba(236, 72, 153, 0.4)',
      bgGradient: 'from-yellow-500/10 via-pink-500/10 to-rose-500/10',
      borderColor: 'border-pink-400/50'
    },
  ];

  const templates = [
    'me , after entering DEFI',
    'me , when i saw solanam.com',
    'Me, when I got the bags',
    'Me, after selling my bags',
    'Me, when I got in early',
    'Me, before checking my portfolio',
    'Me, after buying the dip',
    'Me, when it finally pumps',
  ];

  // Animated placeholder effect
  useEffect(() => {
    const texts = ['me , after entering DEFI', 'me , when i saw solanam.com'];
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeText = () => {
      const currentText = texts[currentTextIndex];
      
      if (isDeleting) {
        setPlaceholder(currentText.substring(0, currentCharIndex - 1));
        currentCharIndex--;
        timeoutId = setTimeout(typeText, 50);
      } else {
        setPlaceholder(currentText.substring(0, currentCharIndex + 1));
        currentCharIndex++;
        timeoutId = setTimeout(typeText, 100);
      }

      if (!isDeleting && currentCharIndex === currentText.length) {
        timeoutId = setTimeout(() => {
          isDeleting = true;
          typeText();
        }, 2000);
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        timeoutId = setTimeout(typeText, 500);
      }
    };

    if (!text) {
      typeText();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text]);

  // Autocomplete suggestions
  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      const filtered = templates.filter(template =>
        template.toLowerCase().includes(value.toLowerCase()) &&
        template.toLowerCase() !== value.toLowerCase()
      );
      setSuggestions(filtered.slice(0, 3));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      onTextComplete(text.trim(), selectedStyle);
    }
  };

  const handleSkip = () => {
    onTextComplete('', selectedStyle);
  };

  const getPreviewStyle = () => {
    const baseClass = 'text-4xl font-black text-center leading-tight';
    switch (selectedStyle) {
      case 'comic':
        return `${baseClass} text-white` + ' [text-shadow:3px_3px_0px_rgba(0,0,0,1),6px_6px_0px_rgba(255,255,255,0.3)]';
      case 'neon':
        return `${baseClass} text-green-400` + ' [text-shadow:0_0_10px_rgba(34,197,94,1),0_0_20px_rgba(34,197,94,0.8),0_0_30px_rgba(34,197,94,0.6)]';
      case 'retro':
        return `${baseClass} text-yellow-300` + ' [text-shadow:2px_2px_0px_#FF00FF,4px_4px_0px_#00FFFF]';
      default:
        return baseClass;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 backdrop-blur-sm border border-primary-500/30 mb-4 shadow-lg shadow-primary-500/10">
          <Type className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3">
          Add Text Overlay
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-md mx-auto">
          Write your text and choose a style that matches your video
        </p>
      </div>

      {/* Text Style Selector */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-5 h-5 text-primary-500" />
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
              Text Style
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`group relative overflow-hidden py-4 sm:py-5 px-3 sm:px-4 rounded-xl transition-all duration-300 border-2 text-center ${
                  selectedStyle === style.id
                    ? `bg-gradient-to-br ${style.bgGradient} ${style.borderColor} shadow-lg shadow-${style.id === 'comic' ? 'blue' : style.id === 'neon' ? 'green' : 'pink'}-500/30 scale-105`
                    : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-102'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${selectedStyle === style.id ? 'opacity-20' : ''}`}></div>
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 transition-all duration-300 ${
                    selectedStyle === style.id
                      ? `bg-gradient-to-br ${style.gradient} text-white shadow-lg`
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
                  }`}>
                    {style.icon}
                  </div>
                  <p className={`font-bold text-sm sm:text-base mb-1 transition-colors ${
                    selectedStyle === style.id 
                      ? `text-transparent bg-clip-text bg-gradient-to-r ${style.gradient}` 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {style.name}
                  </p>
                  <p className={`text-xs transition-colors ${
                    selectedStyle === style.id 
                      ? 'text-gray-600 dark:text-gray-400' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {style.description}
                  </p>
                </div>
                {selectedStyle === style.id && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient} animate-pulse`}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Text Input */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5">
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide">
              <Type className="w-4 h-4 text-primary-500" />
              Enter Your Text
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={placeholder || "Me, when..."}
                className="w-full h-32 sm:h-36 px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 dark:focus:border-primary-500 resize-none text-base sm:text-lg transition-all duration-300 font-medium shadow-inner"
                maxLength={100}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {suggestions.map((suggestion: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-5 py-3.5 text-left text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm sm:text-base group"
                    >
                      <span className="font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                Format: Me, [before/when/after], ...
              </span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-16 sm:w-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ${
                  text.length > 90 ? 'bg-red-100 dark:bg-red-900/30' : ''
                }`}>
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      text.length > 90 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : text.length > 70
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-primary-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min((text.length / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-bold min-w-[3rem] text-right ${
                  text.length > 90 
                    ? 'text-red-500 dark:text-red-400' 
                    : text.length > 70
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {text.length}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Preview */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-black dark:via-gray-900 dark:to-black rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-black dark:via-gray-900 dark:to-black rounded-2xl p-6 sm:p-10 sm:min-h-56 border-2 border-gray-800/50 dark:border-gray-700/50 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
          <div className="w-full relative z-10">
            {text ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${styles.find(s => s.id === selectedStyle)?.bgGradient} backdrop-blur-sm text-white text-xs font-bold rounded-full border ${styles.find(s => s.id === selectedStyle)?.borderColor} shadow-lg`}>
                    <Wand2 className="w-3.5 h-3.5" />
                    {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style Preview
                  </span>
                </div>
                <div className="bg-black/60 dark:bg-black/80 rounded-2xl p-8 sm:p-12 backdrop-blur-md border border-white/10 shadow-2xl">
                  <p className={getPreviewStyle() + ' animate-in fade-in zoom-in-95 duration-700'}>
                    {text}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-in fade-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 mb-2">
                  <Type className="w-8 h-8 text-gray-500 dark:text-gray-600" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-base sm:text-lg font-medium">
                  Your text preview will appear here
                </p>
                <p className="text-gray-500 dark:text-gray-600 text-sm">
                  Start typing to see the magic ✨
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <button
          onClick={onBack}
          className="flex-1 group relative overflow-hidden px-6 sm:px-8 py-3.5 sm:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Back</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <button
          onClick={handleSkip}
          className="group relative overflow-hidden px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-xl hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <SkipForward className="w-4 h-4" />
            <span className="hidden sm:inline">Skip</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex-1 group relative overflow-hidden px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:shadow-none disabled:hover:scale-100"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Continue to Preview</span>
            <Zap className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {!text.trim() && (
            <div className="absolute inset-0 bg-gray-400/20 dark:bg-gray-600/20 backdrop-blur-[1px]"></div>
          )}
        </button>
      </div>
    </div>
  );
}

export default TextEditor;
