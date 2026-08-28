import React, { useState } from 'react';
import { Orbit, Leaf, FileSearch, FlaskConical, Volume2, VolumeX, Award, Sparkles, Star } from 'lucide-react';
import { ModuleId, ModuleMeta } from '../types';
import { sounds } from '../utils/audio';

export const MODULE_LIST: ModuleMeta[] = [
  {
    id: 'module1',
    promptNum: 1,
    title: '太阳系竞速赛',
    subTitle: '行星距离与公转',
    sourceExam: 'Bahagian B 题1',
    iconName: 'Orbit',
    badge: '4分',
    points: 4,
  },
  {
    id: 'module2',
    promptNum: 2,
    title: '光合作用实验室',
    subTitle: '方程式拼图与温室',
    sourceExam: 'Bahagian B 题2',
    iconName: 'Leaf',
    badge: '4分',
    points: 4,
  },
  {
    id: 'module3',
    promptNum: 3,
    title: '植物繁衍之谜',
    subTitle: '探案连线与盖章',
    sourceExam: 'Bahagian C 题1',
    iconName: 'FileSearch',
    badge: '6分',
    points: 6,
  },
  {
    id: 'module4',
    promptNum: 4,
    title: '神奇试纸实验室',
    subTitle: '石蕊变色与托盘',
    sourceExam: 'Bahagian C 题2',
    iconName: 'FlaskConical',
    badge: '6分',
    points: 6,
  },
];

interface NavbarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  scores: { [key in ModuleId]?: number };
}

export const Navbar: React.FC<NavbarProps> = ({ activeModule, onSelectModule, scores }) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleMute = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      sounds.playPop();
    }
  };

  const totalEarnedPoints = (Object.values(scores) as (number | undefined)[]).reduce<number>(
    (sum, val) => sum + (val || 0),
    0
  );
  const totalMaxPoints = 20;

  // Kid-friendly module badge themes
  const getModuleColor = (id: ModuleId, isActive: boolean) => {
    switch (id) {
      case 'module1':
        return isActive
          ? 'bg-amber-500 text-white shadow-amber-200'
          : 'bg-amber-100 text-amber-700';
      case 'module2':
        return isActive
          ? 'bg-emerald-500 text-white shadow-emerald-200'
          : 'bg-emerald-100 text-emerald-700';
      case 'module3':
        return isActive
          ? 'bg-orange-500 text-white shadow-orange-200'
          : 'bg-orange-100 text-orange-700';
      case 'module4':
        return isActive
          ? 'bg-indigo-500 text-white shadow-indigo-200'
          : 'bg-indigo-100 text-indigo-700';
    }
  };

  return (
    <header className="bg-white/85 border-b border-slate-200/90 sticky top-0 z-50 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-300/40">
              🔬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  UASA 小学科学 <span className="text-amber-600">互动探案实验室</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600" /> KSSR Semakan
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block font-medium">
                五年级/六年级 科学 UASA 考卷 4 大核心实验
              </p>
            </div>
          </div>

          {/* Right Action Tools: Score & Sound Toggle */}
          <div className="flex items-center gap-3">
            {/* Real-time Explorer Score Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-3.5 py-1.5 rounded-2xl border border-amber-200 text-xs text-slate-700 shadow-xs">
              <Award className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
              <div>
                <span className="font-semibold text-slate-600">探究得分: </span>
                <span className="font-mono font-black text-amber-600 text-sm">{totalEarnedPoints}</span>
                <span className="text-[10px] text-slate-400 font-semibold">/{totalMaxPoints}</span>
              </div>
            </div>

            {/* Mute Toggle Button */}
            <button
              onClick={handleToggleMute}
              aria-label="Toggle Sound"
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition border border-slate-200/80 shadow-xs cursor-pointer active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Module Switcher Tabs Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {MODULE_LIST.map((mod) => {
            const isActive = activeModule === mod.id;
            const earned = scores[mod.id] || 0;
            const iconBg = getModuleColor(mod.id, isActive);

            return (
              <button
                key={mod.id}
                onClick={() => {
                  sounds.playPop();
                  onSelectModule(mod.id);
                }}
                className={`px-3.5 py-2 rounded-2xl text-left transition-all shrink-0 flex items-center gap-2.5 border cursor-pointer select-none ${
                  isActive
                    ? 'bg-white border-amber-400 text-slate-900 shadow-md shadow-amber-100 ring-2 ring-amber-400/30 scale-[1.02]'
                    : 'bg-white/70 hover:bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:shadow-xs'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors shadow-xs ${iconBg}`}>
                  {mod.id === 'module1' && <Orbit className="w-4 h-4" />}
                  {mod.id === 'module2' && <Leaf className="w-4 h-4" />}
                  {mod.id === 'module3' && <FileSearch className="w-4 h-4" />}
                  {mod.id === 'module4' && <FlaskConical className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold whitespace-nowrap">{mod.title}</span>
                    {earned > 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                        +{earned}分
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap font-medium">
                    <span>{mod.sourceExam}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
