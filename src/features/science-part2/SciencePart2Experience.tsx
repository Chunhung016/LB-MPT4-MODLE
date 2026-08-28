import React, { useState } from 'react';
import { ModuleId } from './types';
import { SolarSystemRace } from './components/modules/SolarSystemRace';
import { PhotosynthesisLab } from './components/modules/PhotosynthesisLab';
import { PlantReproductionDetective } from './components/modules/PlantReproductionDetective';
import { LitmusPaperLab } from './components/modules/LitmusPaperLab';
import { Volume2, VolumeX, Star, ArrowLeft } from 'lucide-react';
import { sounds } from './utils/audio';

interface BubbleModule {
  id: ModuleId;
  name: string;
  shortName: string;
  iconEmoji: string;
  points: number;
  badge: string;
}

const MODULE_BUBBLES: BubbleModule[] = [
  { id: 'module1', name: '太阳系公转', shortName: '太阳系', iconEmoji: '🪐', points: 4, badge: '乙组 1' },
  { id: 'module2', name: '光合作用', shortName: '光合作用', iconEmoji: '🌿', points: 4, badge: '乙组 2' },
  { id: 'module3', name: '植物繁殖', shortName: '植物繁殖', iconEmoji: '🌱', points: 6, badge: '丙组 1' },
  { id: 'module4', name: '石蕊试纸', shortName: '石蕊试纸', iconEmoji: '🧪', points: 6, badge: '丙组 2' },
];

interface SciencePart2ExperienceProps {
  onExit: () => void;
}

export function SciencePart2Experience({ onExit }: SciencePart2ExperienceProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>('module1');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [scores, setScores] = useState<{ [key in ModuleId]?: number }>({
    module1: 0,
    module2: 0,
    module3: 0,
    module4: 0,
  });

  const handleScoreUpdate = (modId: ModuleId, earnedPoints: number) => {
    setScores((prev) => ({
      ...prev,
      [modId]: Math.max(prev[modId] || 0, earnedPoints),
    }));
  };

  const totalEarnedPoints = (Object.values(scores) as (number | undefined)[]).reduce<number>(
    (sum, val) => sum + (val || 0),
    0
  );

  const toggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsAudioMuted(nextMuted);
    if (!nextMuted) sounds.playPop();
  };

  return (
    <div className="fixed inset-0 z-[70] h-screen w-screen overflow-hidden bg-gradient-to-br from-purple-50/90 via-sky-50/70 to-indigo-50/80 text-slate-800 font-sans flex flex-col select-none">
      {/* Top Center Bubble Navigation Bar */}
      <header className="shrink-0 pt-3 pb-2.5 px-3 sm:px-6 flex items-center justify-between gap-2 z-30">
        {/* Left Side: Exit button + App Badge */}
        <div className="flex items-center gap-3">
          <button
            id="science-part2-exit"
            type="button"
            onClick={() => {
              sounds.playPop();
              onExit();
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-purple-800 bg-white/95 px-3 py-1.5 text-xs font-black text-purple-900 shadow-[2px_2px_0_rgba(107,33,168,1)] transition-transform active:translate-y-0.5 sm:px-4"
            aria-label="返回学科选择"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回学科</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
            <span className="text-base">🔬</span>
            <span className="text-xs font-black text-slate-800 tracking-tight">科学探案馆</span>
          </div>
        </div>

        {/* Center: Bubble Navigation Pills */}
        <nav className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full border border-slate-200 shadow-sm max-w-full overflow-x-auto no-scrollbar">
          {MODULE_BUBBLES.map((bubble) => {
            const isActive = activeModule === bubble.id;
            const earned = scores[bubble.id] || 0;
            const isFinished = earned >= bubble.points;

            return (
              <button
                key={bubble.id}
                onClick={() => {
                  sounds.playPop();
                  setActiveModule(bubble.id);
                }}
                className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm ring-2 ring-purple-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/70'
                }`}
                id={`bubble-nav-${bubble.id}`}
              >
                <span className="text-sm">{bubble.iconEmoji}</span>
                <span className="tracking-tight">{bubble.name}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-purple-800/60 text-purple-100'
                      : isFinished
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {isFinished ? '✓' : `${bubble.points}分`}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Sound Toggle & Score Stars */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer active:scale-95 border ${
              isAudioMuted
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-white border-slate-200 text-purple-600 shadow-xs hover:bg-purple-50'
            }`}
            title={isAudioMuted ? '开启音效' : '静音'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-xs text-xs font-black">
            <Star className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
            <span>{totalEarnedPoints} / 20</span>
          </div>
        </div>
      </header>

      {/* Main Single-Screen iPad Canvas (Fitted Without Scrolling) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-4 pb-4 overflow-hidden flex flex-col justify-stretch">
        <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
          {activeModule === 'module1' && (
            <SolarSystemRace onComplete={(pts) => handleScoreUpdate('module1', pts)} />
          )}

          {activeModule === 'module2' && (
            <PhotosynthesisLab onComplete={(pts) => handleScoreUpdate('module2', pts)} />
          )}

          {activeModule === 'module3' && (
            <PlantReproductionDetective onComplete={(pts) => handleScoreUpdate('module3', pts)} />
          )}

          {activeModule === 'module4' && (
            <LitmusPaperLab onComplete={(pts) => handleScoreUpdate('module4', pts)} />
          )}
        </div>
      </main>
    </div>
  );
}
