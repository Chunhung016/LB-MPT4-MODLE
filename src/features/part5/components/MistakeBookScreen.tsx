import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  BookMarked,
  RotateCcw,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Search,
  Filter,
  Flame,
  Award,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { useApp } from '../context/AppContext';
import { MistakeRecord } from '../utils/mistakeStore';
import { ALL_THEMES } from '../data/allThemes';

interface MistakeBookScreenProps {
  onBack: () => void;
  onStartMistakePractice: (mistakeWordIndex?: number) => void;
}

export const MistakeBookScreen: React.FC<MistakeBookScreenProps> = ({
  onBack,
  onStartMistakePractice,
}) => {
  const {
    settings,
    updateSettings,
    mistakes,
    deleteMistake,
    clearMistakes,
    setActiveMistakeWordIndex,
    setIsPracticingMistakes,
  } = useApp();

  const [selectedThemeFilter, setSelectedThemeFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMistakeDetail, setSelectedMistakeDetail] = useState<MistakeRecord | null>(null);

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    updateSettings({ soundEnabled: !isMuted });
    if (!isMuted) {
      sound.playPop();
    }
  };

  // Filtered mistakes list
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((item) => {
      // Theme filter
      if (selectedThemeFilter !== 'all' && item.themeId !== selectedThemeFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'unmastered' && item.isMastered) return false;
      if (statusFilter === 'mastered' && !item.isMastered) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesWord = item.word.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTheme = item.themeName.toLowerCase().includes(q);
        const matchesChinese = item.chinese.includes(q);
        if (!matchesWord && !matchesDesc && !matchesTheme && !matchesChinese) return false;
      }

      return true;
    });
  }, [mistakes, selectedThemeFilter, statusFilter, searchQuery]);

  const unmasteredCount = mistakes.filter((m) => !m.isMastered).length;
  const masteredCount = mistakes.filter((m) => m.isMastered).length;

  const handlePracticeAll = () => {
    if (mistakes.length === 0) return;
    sound.playStart();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    setActiveMistakeWordIndex(0);
    setIsPracticingMistakes(true);
    onStartMistakePractice(0);
  };

  const handlePracticeSingleWord = (mistakeIndex: number) => {
    sound.playStart();
    setActiveMistakeWordIndex(mistakeIndex);
    setIsPracticingMistakes(true);
    onStartMistakePractice(mistakeIndex);
  };

  const handleSpeak = (text: string) => {
    sound.playPop();
    sound.speakWord(text);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen select-none relative bg-[#FEF3C7] text-[#78350F] overflow-x-hidden">
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

      {/* Top Navigation Bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white/85 backdrop-blur-md border-b-3 border-[#FDE047] z-30 shadow-xs relative">
        <div className="flex items-center gap-3">
          <button
            id="btn-mistake-book-back"
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            className="px-3.5 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] rounded-full border-2 border-[#78350F] text-[#78350F] font-black text-xs sm:text-sm shadow-[1.5px_1.5px_0px_#78350F] transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            title="Back to Mode Selection"
          >
            <ArrowLeft className="w-4 h-4 text-[#78350F]" />
            <span>Back</span>
          </button>

          <span className="text-base sm:text-lg font-black text-rose-800 uppercase tracking-tight ml-1 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-rose-600" />
            <span>MISTAKE BOOK • 错题集</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Practice All Button in header */}
          {mistakes.length > 0 && (
            <button
              id="btn-practice-all-mistakes"
              onClick={handlePracticeAll}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 rounded-full border-2 border-[#78350F] text-[#78350F] text-xs sm:text-sm font-black shadow-[2px_2px_0px_#78350F] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-[#78350F]" />
              <span className="hidden sm:inline">Practice Mistakes ({mistakes.length})</span>
              <span className="sm:hidden">Practice</span>
            </button>
          )}

          <button
            id="btn-sound-toggle-mistake-book"
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 z-10 relative">
        {/* Banner / Stat Overview */}
        <div className="w-full bg-white/90 rounded-3xl border-4 border-[#78350F] p-5 sm:p-6 shadow-[5px_6px_0px_#78350F] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-100 border-3 border-[#78350F] flex items-center justify-center text-3xl sm:text-4xl shadow-xs shrink-0">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300 uppercase">
                  Bag of Mistakes
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {mistakes.length} Recorded Words
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#78350F] uppercase mt-1">
                Your Personal Mistake Vault
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Words you missed or took too long to answer are safely stored here for targeted re-practice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 flex flex-col items-center min-w-[90px] shadow-2xs">
              <span className="text-xl sm:text-2xl font-black text-rose-700">
                {unmasteredCount}
              </span>
              <span className="text-[10px] font-black text-rose-800 uppercase">To Master</span>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 flex flex-col items-center min-w-[90px] shadow-2xs">
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {masteredCount}
              </span>
              <span className="text-[10px] font-black text-emerald-800 uppercase">Mastered</span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl border-3 border-[#78350F] p-3 sm:p-4 shadow-[3px_4px_0px_#78350F] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mistake word, clue, or theme..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border-2 border-[#78350F]/50 text-xs sm:text-sm font-bold text-[#78350F] placeholder:text-slate-400 focus:outline-hidden focus:border-[#78350F] focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {/* Theme Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl border-2 border-[#78350F]/50 px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-[#B45309]" />
              <select
                value={selectedThemeFilter}
                onChange={(e) => {
                  sound.playPop();
                  setSelectedThemeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                }}
                className="bg-transparent text-xs font-black text-[#78350F] focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Themes (1–10)</option>
                {ALL_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    Theme {t.id}: {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Toggle */}
            <div className="flex rounded-xl border-2 border-[#78350F]/50 overflow-hidden bg-amber-50">
              <button
                onClick={() => {
                  sound.playPop();
                  setStatusFilter('all');
                }}
                className={`px-2.5 py-1 text-xs font-black transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#78350F] text-white'
                    : 'text-[#78350F] hover:bg-amber-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setStatusFilter('unmastered');
                }}
                className={`px-2.5 py-1 text-xs font-black transition-colors ${
                  statusFilter === 'unmastered'
                    ? 'bg-rose-600 text-white'
                    : 'text-[#78350F] hover:bg-amber-100'
                }`}
              >
                Needs Review
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setStatusFilter('mastered');
                }}
                className={`px-2.5 py-1 text-xs font-black transition-colors ${
                  statusFilter === 'mastered'
                    ? 'bg-emerald-600 text-white'
                    : 'text-[#78350F] hover:bg-amber-100'
                }`}
              >
                Mastered
              </button>
            </div>

            {/* Clear all mistakes button if any exist */}
            {mistakes.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all mistake records?')) {
                    sound.playPop();
                    clearMistakes();
                  }
                }}
                className="p-2 bg-white hover:bg-rose-50 text-rose-700 rounded-xl border-2 border-rose-300 text-xs font-black shadow-2xs transition-colors cursor-pointer"
                title="Clear all mistake records"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mistakes Cards Grid or Empty State */}
        {filteredMistakes.length === 0 ? (
          <div className="bg-white/90 rounded-3xl border-4 border-[#78350F] p-8 sm:p-12 shadow-[5px_6px_0px_#78350F] flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 bg-amber-100 rounded-full border-3 border-[#78350F] flex items-center justify-center text-4xl shadow-xs">
              ✨
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#78350F] uppercase">
                {mistakes.length === 0
                  ? 'Bag of Mistakes Is Empty!'
                  : 'No Words Match Your Filters'}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1 max-w-md">
                {mistakes.length === 0
                  ? 'Great job! Whenever you miss a spelling or run out of thinking time during Theme Practice, the word will be automatically stored here for re-practice.'
                  : 'Try changing your search keywords or switching filters to view other mistake records.'}
              </p>
            </div>

            {mistakes.length === 0 && (
              <button
                onClick={() => {
                  sound.playStart();
                  onBack();
                }}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 rounded-2xl border-3 border-[#78350F] text-[#78350F] font-black text-sm shadow-[3px_3px_0px_#78350F] cursor-pointer transition-all active:scale-95"
              >
                Start Practice Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredMistakes.map((record, index) => {
              const isMastered = record.isMastered;

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className={`bg-white rounded-2xl border-3 border-[#78350F] p-4 sm:p-5 shadow-[4px_4px_0px_#78350F] flex flex-col justify-between gap-4 transition-all hover:shadow-[5px_6px_0px_#78350F] ${
                    isMastered ? 'bg-emerald-50/40 border-emerald-800' : ''
                  }`}
                >
                  {/* Card Header: Theme Badge & Date */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#B45309] bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#78350F]" />
                        <span>
                          Theme {record.themeId}: {record.themeName}
                        </span>
                      </span>
                    </div>

                    {isMastered ? (
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Mastered
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        {record.failReason === 'time_out' ? 'Time Out' : '1-Try Miss'}
                      </span>
                    )}
                  </div>

                  {/* Word Header with Audio & Chinese */}
                  <div className="flex items-center justify-between gap-3 border-b-2 border-amber-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-[#78350F] tracking-tight">
                          {record.word}
                        </h3>
                        <button
                          onClick={() => handleSpeak(record.word)}
                          className="p-1 bg-amber-100 hover:bg-amber-200 text-[#78350F] rounded-full border border-[#78350F]/30 cursor-pointer shadow-2xs"
                          title="Listen to word"
                        >
                          <Volume1 className="w-3.5 h-3.5 text-[#B45309]" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-amber-800">{record.chinese}</p>
                    </div>

                    {record.imageUrl && (
                      <img
                        src={record.imageUrl}
                        alt={record.word}
                        className="w-10 h-10 object-contain rounded-lg border border-amber-200 bg-amber-50 p-1 shrink-0"
                      />
                    )}
                  </div>

                  {/* Description Clue */}
                  <p className="text-xs font-semibold text-slate-700 italic line-clamp-2">
                    "{record.description}"
                  </p>

                  {/* Syllables / Phonics */}
                  <div className="flex flex-wrap gap-1">
                    {record.phonics.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[10px] font-black bg-amber-50 text-[#78350F] px-1.5 py-0.5 rounded-md border border-amber-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Record Metadata (Date and times practiced) */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {record.dateFormatted}
                    </span>
                    <span>
                      Practiced: <strong className="text-[#78350F]">{record.timesPracticed || 0}x</strong>
                    </span>
                  </div>

                  {/* Action Buttons: Practice Single / Delete */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handlePracticeSingleWord(index)}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 rounded-xl border-2 border-[#78350F] text-[#78350F] font-black text-xs shadow-[2px_2px_0px_#78350F] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Practice</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playPop();
                        deleteMistake(record.id);
                      }}
                      className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border-2 border-slate-300 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs"
                      title="Remove from Mistake Book"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <div className="h-6" />
    </div>
  );
};
