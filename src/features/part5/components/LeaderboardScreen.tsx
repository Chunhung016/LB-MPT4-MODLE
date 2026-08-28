import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Flame,
  Clock,
  RefreshCw,
  Award,
  Star,
  Play,
  User,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { fetchLeaderboard, LeaderboardEntry } from '../utils/leaderboardStore';
import { useParentAccount } from '../../../context/ParentAccountContext';

interface LeaderboardScreenProps {
  onBack: () => void;
  onPlayNow: () => void;
  highlightEntryId?: string | null;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  onBack,
  onPlayNow,
  highlightEntryId,
}) => {
  const { profile } = useParentAccount();
  const childName = profile?.childName || 'Learner';

  const [activeTab, setActiveTab] = useState<'all' | 'today'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async (tab: 'all' | 'today') => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(tab);
      setEntries(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  const handleTabChange = (tab: 'all' | 'today') => {
    sound.playPop();
    setActiveTab(tab);
  };

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

  // Helper for relative time string
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen select-none relative bg-[#FEF3C7] text-[#78350F] overflow-x-hidden">
      {/* SOFT HONEYCOMB PATTERN BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
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

      {/* Top Header Bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white/85 backdrop-blur-md border-b-3 border-[#FDE047] z-30 shadow-xs relative">
        <div className="flex items-center gap-3">
          <button
            id="btn-leaderboard-back"
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

          <span className="text-base sm:text-lg font-black text-[#78350F] uppercase tracking-tight ml-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>SPELLING BEE LEADERBOARD</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Child Name Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-100 rounded-full border border-amber-300 text-xs font-black text-[#78350F]">
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span>Child: <strong>{childName}</strong></span>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              loadData(activeTab);
            }}
            className="p-1.5 sm:p-2 bg-white rounded-full border-2 border-[#78350F] text-[#78350F] shadow-[1.5px_1.5px_0px_#78350F] transition-all hover:bg-[#FFFBEB] cursor-pointer active:scale-95"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 text-[#78350F] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Leaderboard Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center z-10 relative">
        {/* Title & Tab Switcher */}
        <div className="text-center mb-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100/90 rounded-full border-2 border-[#78350F] text-xs font-black text-[#78350F] shadow-xs mb-2"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>HALL OF FAME</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#78350F] tracking-tight uppercase drop-shadow-[2px_2px_0px_#F59E0B]">
            Spelling Bee Champions
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#92400E] mt-1 max-w-md mx-auto">
            Points are earned from mastered words, combo strikes, and speedy spelling!
          </p>

          {/* Time Tabs */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-5 py-2 rounded-full border-2 border-[#78350F] text-xs font-black transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-[#78350F] shadow-[2px_3px_0px_#78350F] scale-105'
                  : 'bg-white/80 text-[#78350F]/70 hover:bg-white'
              }`}
            >
              🏆 All-Time Champions
            </button>
            <button
              onClick={() => handleTabChange('today')}
              className={`px-5 py-2 rounded-full border-2 border-[#78350F] text-xs font-black transition-all cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-[#78350F] shadow-[2px_3px_0px_#78350F] scale-105'
                  : 'bg-white/80 text-[#78350F]/70 hover:bg-white'
              }`}
            >
              ⚡ Today's Stars
            </button>
          </div>
        </div>

        {/* TOP 3 PODIUM */}
        {entries.length > 0 && (
          <div className="w-full max-w-2xl mb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end justify-center pt-8">
              {/* 2nd Place (Silver) */}
              {top3[1] ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2 flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-slate-100 border-3 border-slate-400 flex items-center justify-center text-xl sm:text-2xl font-black shadow-md relative">
                      🥈
                      <span className="absolute -bottom-1 bg-slate-500 text-white text-[10px] font-black px-2 py-0.2 rounded-full border border-white">
                        #2
                      </span>
                    </div>
                    <span className="font-black text-xs sm:text-sm text-[#78350F] mt-2 text-center line-clamp-1 max-w-[90px]">
                      {top3[1].child_name}
                      {top3[1].child_name.toLowerCase() === childName.toLowerCase() && ' ⭐'}
                    </span>
                    <span className="text-[11px] font-black text-slate-600">
                      {top3[1].score.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-300 to-slate-100 rounded-t-2xl border-x-3 border-t-3 border-slate-400 flex flex-col items-center justify-center p-2 shadow-inner">
                    <span className="text-[10px] font-bold text-slate-600 uppercase text-center line-clamp-1">
                      {top3[1].theme_name}
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 mt-1">
                      {top3[1].mastered_count}/{top3[1].total_questions} Words
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div />
              )}

              {/* 1st Place (Gold Crown) */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="flex flex-col items-center z-10"
                >
                  <div className="relative mb-2 flex flex-col items-center">
                    <Crown className="w-6 h-6 text-amber-500 fill-amber-300 absolute -top-5 animate-bounce" />
                    <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-4 border-amber-500 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-lg relative">
                      🥇
                      <span className="absolute -bottom-1.5 bg-amber-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border-2 border-white">
                        #1
                      </span>
                    </div>
                    <span className="font-black text-sm sm:text-base text-[#78350F] mt-2 text-center line-clamp-1 max-w-[110px]">
                      {top3[0].child_name}
                      {top3[0].child_name.toLowerCase() === childName.toLowerCase() && ' ⭐'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-amber-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
                      {top3[0].score.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-300 via-yellow-200 to-amber-100 rounded-t-2xl border-x-4 border-t-4 border-amber-500 flex flex-col items-center justify-center p-2 shadow-inner">
                    <span className="text-[11px] font-black text-amber-900 uppercase text-center line-clamp-1">
                      {top3[0].theme_name}
                    </span>
                    <span className="text-[10px] font-black text-emerald-800 mt-1">
                      {top3[0].mastered_count}/{top3[0].total_questions} Mastered
                    </span>
                    {top3[0].max_streak >= 2 && (
                      <span className="text-[10px] font-black text-orange-600 flex items-center gap-0.5 mt-0.5">
                        <Flame className="w-3 h-3 fill-orange-500" />
                        {top3[0].max_streak}x Strike
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 3rd Place (Bronze) */}
              {top3[2] ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2 flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-amber-100 border-3 border-amber-700 flex items-center justify-center text-xl sm:text-2xl font-black shadow-md relative">
                      🥉
                      <span className="absolute -bottom-1 bg-amber-800 text-white text-[10px] font-black px-2 py-0.2 rounded-full border border-white">
                        #3
                      </span>
                    </div>
                    <span className="font-black text-xs sm:text-sm text-[#78350F] mt-2 text-center line-clamp-1 max-w-[90px]">
                      {top3[2].child_name}
                      {top3[2].child_name.toLowerCase() === childName.toLowerCase() && ' ⭐'}
                    </span>
                    <span className="text-[11px] font-black text-amber-900">
                      {top3[2].score.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl border-x-3 border-t-3 border-amber-700 flex flex-col items-center justify-center p-2 shadow-inner">
                    <span className="text-[10px] font-bold text-amber-900 uppercase text-center line-clamp-1">
                      {top3[2].theme_name}
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 mt-1">
                      {top3[2].mastered_count}/{top3[2].total_questions} Words
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}

        {/* FULL LEADERBOARD LIST */}
        <div className="w-full bg-white/95 rounded-3xl border-4 border-[#78350F] p-4 sm:p-6 shadow-[6px_8px_0px_#78350F] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#FEF3C7] text-xs font-black text-slate-500 uppercase tracking-wider">
            <span className="w-12 text-center">Rank</span>
            <span className="flex-1 text-left ml-2">Child / Theme</span>
            <span className="w-24 text-center hidden sm:inline">Stats</span>
            <span className="w-24 text-right">Points</span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-amber-600 animate-spin" />
              <span className="text-xs font-bold text-slate-500">Loading Leaderboard...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
              <Award className="w-10 h-10 text-amber-400" />
              <span className="text-sm font-black text-[#78350F]">No scores recorded yet!</span>
              <span className="text-xs font-bold text-slate-500">Be the first Spelling Bee Champion by playing a practice game.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {entries.map((item, index) => {
                const rank = index + 1;
                const isHighlight = item.id === highlightEntryId;
                const isCurrentChild = item.child_name.toLowerCase() === childName.toLowerCase();

                return (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                      isHighlight
                        ? 'bg-amber-200 border-amber-500 shadow-md scale-[1.01]'
                        : isCurrentChild
                        ? 'bg-amber-50 border-amber-300'
                        : rank <= 3
                        ? 'bg-yellow-50/70 border-yellow-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="w-12 flex items-center justify-center">
                      {rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-xs font-black text-slate-700 flex items-center justify-center">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Child Name & Details */}
                    <div className="flex-1 flex flex-col ml-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-sm text-[#78350F]">
                          {item.child_name}
                        </span>
                        {isCurrentChild && (
                          <span className="px-2 py-0.2 bg-[#FBBF24] text-[#78350F] rounded-full text-[10px] font-black border border-[#78350F]">
                            YOU
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          • {formatTimeAgo(item.created_at)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#B45309]">
                        {item.theme_name}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="w-24 hidden sm:flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-black text-emerald-700">
                        {item.mastered_count}/{item.total_questions} Words
                      </span>
                      {item.max_streak >= 2 ? (
                        <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-orange-500" />
                          {item.max_streak}x Streak
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.time_seconds}s
                        </span>
                      )}
                    </div>

                    {/* Score */}
                    <div className="w-24 text-right">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full border border-[#78350F] text-xs font-black text-[#78350F] shadow-2xs">
                        <Star className="w-3 h-3 fill-amber-600 text-amber-600" />
                        <span>{item.score.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="pt-3 border-t-2 border-[#FEF3C7] flex items-center justify-center">
            <button
              onClick={() => {
                sound.playStart();
                onPlayNow();
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-500 hover:to-yellow-400 border-3 border-[#78350F] rounded-2xl text-[#78350F] font-black text-sm shadow-[3px_3px_0px_#78350F] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-[#78350F]" />
              <span>Play Spelling Bee & Climb Ranks!</span>
            </button>
          </div>
        </div>
      </main>

      <div className="h-6" />
    </div>
  );
};
