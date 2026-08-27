import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { useApp } from '../context/AppContext';
import { ALL_THEMES, ThemeInfo } from '../data/allThemes';

interface Screen2Props {
  onBack: () => void;
  onSelectTheme?: (themeId: number) => void;
}

/**
 * Curved Banner component that arches on top of the bubble with clean mathematical curvature (弧度).
 * Appears when hovered to show the full theme name clearly.
 */
const CurvedThemeBanner: React.FC<{
  theme: ThemeInfo;
  isTheme2?: boolean;
}> = ({ theme, isTheme2 }) => {
  const pathId = `curve-text-path-${theme.id}`;

  // Dynamically adjust font size for longer titles so they fit gracefully
  const titleLength = theme.name.length;
  let fontSize = '13px';
  let letterSpacing = '0.04em';

  if (titleLength > 20) {
    fontSize = '10.5px';
    letterSpacing = '0.01em';
  } else if (titleLength > 15) {
    fontSize = '11.5px';
    letterSpacing = '0.02em';
  } else if (titleLength > 12) {
    fontSize = '12px';
    letterSpacing = '0.03em';
  }

  return (
    <div className="w-[230px] sm:w-[250px] h-[95px] sm:h-[105px] pointer-events-none relative flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(120,53,15,0.25)]">
      <svg
        viewBox="0 0 240 100"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Centered Arc Path strictly inside the middle of the ribbon stroke for the text */}
          <path
            id={pathId}
            d="M 28,78 A 100,100 0 0,1 212,78"
            fill="none"
          />

          {/* Golden Yellow Gradient for Banner Ribbon */}
          <linearGradient id={`ribbon-grad-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF0" />
            <stop offset="35%" stopColor="#FEF08A" />
            <stop offset="70%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Highlight Gradient for Theme 2 */}
          <linearGradient id={`ribbon-grad-t2`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Arched Ribbon Body along the circular arc (弧度) */}
        {/* Outer Arc R=114, Inner Arc R=82, Ribbon with thick brown border */}
        <path
          d="M 18,74 A 114,114 0 0,1 222,74 A 16,16 0 0,1 198,90 A 82,82 0 0,0 42,90 A 16,16 0 0,1 18,74 Z"
          fill={isTheme2 ? 'url(#ribbon-grad-t2)' : `url(#ribbon-grad-${theme.id})`}
          stroke="#78350F"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Top Glossy Highlight along upper curvature */}
        <path
          d="M 28,67 A 108,108 0 0,1 212,67"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Curved Theme Name strictly centered on the textPath inside the ribbon */}
        <text className="select-none pointer-events-none" dominantBaseline="central">
          <textPath
            href={`#${pathId}`}
            startOffset="50%"
            textAnchor="middle"
            className="fill-[#78350F] font-black uppercase"
            style={{
              fontSize,
              fontWeight: 900,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing,
            }}
          >
            {theme.name}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export const Screen2: React.FC<Screen2Props> = ({ onBack, onSelectTheme }) => {
  const { settings, updateSettings, selectedThemeId, setSelectedThemeId } = useApp();

  // Track which bubble is currently hovered (banner only shows on hover!)
  const [hoveredThemeId, setHoveredThemeId] = useState<number | null>(null);

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    updateSettings({ soundEnabled: !isMuted });
    if (!isMuted) {
      sound.playPop();
    }
  };

  const handleBubbleClick = (theme: ThemeInfo) => {
    sound.playChime();
    setSelectedThemeId(theme.id);
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    if (onSelectTheme) {
      onSelectTheme(theme.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen select-none relative justify-between pb-8 bg-[#FFFDF7]">
      {/* SOFT HONEYCOMB PATTERN BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            linear-gradient(30deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(150deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(30deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(150deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(60deg, #FEF08A 25%, transparent 25.5%, transparent 75%, #FEF08A 75%, #FEF08A),
            linear-gradient(60deg, #FEF08A 25%, transparent 25.5%, transparent 75%, #FEF08A 75%, #FEF08A)
          `,
          backgroundSize: '80px 140px',
          backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
        }}
      />

      {/* Header Bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white/85 backdrop-blur-md border-b-3 border-[#FDE047] z-30 shadow-xs relative">
        <div className="flex items-center gap-3">
          <button
            id="btn-screen2-back"
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            className="px-3.5 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] rounded-full border-2 border-[#78350F] text-[#78350F] font-black text-xs sm:text-sm shadow-[1.5px_1.5px_0px_#78350F] transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            title="Back to Screen 1"
          >
            <ArrowLeft className="w-4 h-4 text-[#78350F]" />
            <span>Back</span>
          </button>

          <span className="text-base sm:text-lg font-black text-[#78350F] uppercase tracking-tight ml-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>SELECT SPELLING THEME</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-sound-toggle-screen2"
            onClick={handleToggleMute}
            className="p-1.5 sm:p-2 bg-white rounded-full border-2 border-[#78350F] text-[#78350F] shadow-[1.5px_1.5px_0px_#78350F] transition-all hover:bg-[#FFFBEB] cursor-pointer active:scale-95"
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {!settings.soundEnabled ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center gap-6 z-10 relative">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#78350F] uppercase tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Choose Your Practice Unit</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#92400E]">
            Hover over any circle to see the theme name, tap to start!
          </p>
        </div>

        {/* 10 2D WHITE CIRCLE BUBBLES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-14 sm:gap-y-16 gap-x-4 sm:gap-x-6 lg:gap-x-7 pt-12 pb-6 justify-items-center">
          {ALL_THEMES.map((theme) => {
            const isHovered = hoveredThemeId === theme.id;
            const isTheme2 = theme.id === 2;

            return (
              <div
                key={theme.id}
                className="relative flex flex-col items-center justify-center group overflow-visible"
                onMouseEnter={() => {
                  setHoveredThemeId(theme.id);
                  sound.playPop();
                }}
                onMouseLeave={() => setHoveredThemeId(null)}
                onTouchStart={() => setHoveredThemeId(theme.id)}
              >
                {/* POPPED-OUT CURVED THEME NAME BANNER (ONLY SHOWS ON HOVER!) */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      key={`banner-${theme.id}`}
                      initial={{ opacity: 0, y: 16, scale: 0.7 }}
                      animate={{ opacity: 1, y: -48, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.7 }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 24,
                        mass: 0.7,
                      }}
                      className="absolute -top-7 z-30 pointer-events-none flex flex-col items-center"
                    >
                      <CurvedThemeBanner theme={theme} isTheme2={isTheme2} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2D CLEAN WHITE BUBBLE WITH THICK BROWN BORDER */}
                <button
                  id={`bubble-theme-${theme.id}`}
                  onClick={() => handleBubbleClick(theme)}
                  className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white border-4 border-[#78350F] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_4px_0px_#78350F] overflow-hidden z-10 active:scale-95 hover:scale-105 ${
                    isHovered
                      ? 'ring-4 ring-amber-400 bg-amber-50/50 shadow-[0_6px_0px_#78350F]'
                      : ''
                  }`}
                >
                  {/* Clean 2D Inner Content: Big Number & Word Count */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-2 w-full select-none">
                    {/* Big Bold Brown Unit Number */}
                    <span className="text-5xl sm:text-6xl font-black text-[#78350F] tracking-tight leading-none">
                      {theme.id}
                    </span>

                    {/* Word Count Subtitle */}
                    <span className="text-xs sm:text-sm font-black text-[#78350F]/80 mt-2 tracking-tight">
                      {theme.words.length} words
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <div className="h-4" />
    </div>
  );
};
