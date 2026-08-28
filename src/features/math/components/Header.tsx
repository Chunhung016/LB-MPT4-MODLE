import React from 'react';
import { QuestionId } from '../types';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Sparkles, Box, Layers, Cuboid, PieChart, Compass, Calculator, Percent, MapPin, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentTab: QuestionId;
  onSelectTab: (tab: QuestionId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const TABS: { id: QuestionId; number: string; title: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'q1', number: '第1题', title: '展开图折叠', icon: Box, color: 'hover:bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'q2', number: '第2题', title: '分组与乘法', icon: Layers, color: 'hover:bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'q3', number: '第3题', title: '长方体体积', icon: Cuboid, color: 'hover:bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'q4', number: '第4题', title: '分数减法', icon: PieChart, color: 'hover:bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'q5', number: '第5题', title: '笛卡尔坐标', icon: Compass, color: 'hover:bg-violet-100 text-violet-900 border-violet-300' },
  { id: 'q6', number: '第6题', title: '单一值与比例', icon: Calculator, color: 'hover:bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'q7', number: '第7题', title: '象形图与百分比', icon: Percent, color: 'hover:bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'q8', number: '第8题', title: '综合应用题', icon: MapPin, color: 'hover:bg-orange-100 text-orange-900 border-orange-300' },
  { id: 'q9', number: '第9题', title: '综合探究题', icon: BarChart3, color: 'hover:bg-blue-100 text-blue-900 border-blue-300' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header id="main-header" className="w-full bg-[#FAF8EE]/95 backdrop-blur-md border-b border-[#E5DFC9] sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* 左侧：Logo 与教育品牌 */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xs border border-amber-600">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-stone-900 text-base sm:text-lg tracking-tight">
                小学数学互动学习乐园
              </h1>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-[#F2ECD8] text-amber-900 rounded-full border border-[#DFD7BE]">
                SJKC 四年级
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              直观动手操作 · 纯 SVG 矢量高清 · 启发式探究学习
            </p>
          </div>
        </div>

        {/* 右侧：音效切换与快捷工具 */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            id="sound-toggle-btn"
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
              isMuted
                ? 'bg-[#F4F0DE] text-stone-500 border-[#DDD7C0]'
                : 'bg-[#EBF7F2] text-teal-800 border-[#BCE4D7] shadow-xs'
            }`}
            title={isMuted ? '点击开启音效' : '点击静音'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600" />}
            <span>{isMuted ? '已静音' : '音效开启'}</span>
          </button>
        </div>
      </div>

      {/* 底部：题目选项卡切换 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => {
                  sound.playPop(520);
                  onSelectTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-sm scale-[1.01]'
                    : 'bg-white/80 text-stone-700 border-[#E5DFC9] hover:border-[#D5CEB5] hover:bg-[#F9F7EC]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                <span className="opacity-75 text-[11px] font-mono">{tab.number}</span>
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
