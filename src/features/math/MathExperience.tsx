import React, { useState } from 'react';
import { QuestionId } from './types';
import { sound } from './utils/audio';
import { Question1CubeNet } from './components/Question1CubeNet';
import { Question2Marbles } from './components/Question2Marbles';
import { Question3Volume } from './components/Question3Volume';
import { Question4Fractions } from './components/Question4Fractions';
import { Question5Coordinates } from './components/Question5Coordinates';
import { Question6UnitaryMethod } from './components/Question6UnitaryMethod';
import { Question7PictogramPercentage } from './components/Question7PictogramPercentage';
import { Question8Comprehensive } from './components/Question8Comprehensive';
import { Question9Comprehensive } from './components/Question9Comprehensive';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

const QUESTIONS: { id: QuestionId; number: number; label: string }[] = [
  { id: 'q1', number: 1, label: '第 1 题 · 正方体展开图' },
  { id: 'q2', number: 2, label: '第 2 题 · 弹子分堆与乘法' },
  { id: 'q3', number: 3, label: '第 3 题 · 长方体体积与网格' },
  { id: 'q4', number: 4, label: '第 4 题 · 分数减法' },
  { id: 'q5', number: 5, label: '第 5 题 · 笛卡尔坐标平面' },
  { id: 'q6', number: 6, label: '第 6 题 · 单一值与比例计算' },
  { id: 'q7', number: 7, label: '第 7 题 · 象形统计图与百分比' },
  { id: 'q8', number: 8, label: '第 8 题 · 综合应用题（路线·容量·饼图·单价）' },
  { id: 'q9', number: 9, label: '第 9 题 · 综合探究题（比例·质量·找零·条形图）' },
];

const ORDERED_QUESTIONS: QuestionId[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];

interface MathExperienceProps {
  onExit: () => void;
}

export function MathExperience({ onExit }: MathExperienceProps) {
  const [currentTab, setCurrentTab] = useState<QuestionId>('q1');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.enabled = !next;
    if (!next) sound.playPop(520);
  };

  // 翻页控制 (上一题/下一题)
  const currentIndex = ORDERED_QUESTIONS.indexOf(currentTab);

  const handlePrev = () => {
    if (currentIndex > 0) {
      sound.playPop(480);
      setCurrentTab(ORDERED_QUESTIONS[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < ORDERED_QUESTIONS.length - 1) {
      sound.playPop(560);
      setCurrentTab(ORDERED_QUESTIONS[currentIndex + 1]);
    }
  };

  const handleSelectQuestion = (id: QuestionId) => {
    sound.playPop(520);
    setCurrentTab(id);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FDFCF0] flex flex-col text-stone-800 selection:bg-amber-200 selection:text-stone-900">
      {/* 顶部中央气泡题目选择栏 (Middle Top Bubble Selection) */}
      <div className="w-full pt-4 pb-2 px-4 flex flex-col items-center justify-center relative">
        {/* 返回科目按钮 */}
        <div className="w-full max-w-6xl flex items-center justify-start mb-3 px-2">
          <button
            id="math-experience-exit"
            type="button"
            onClick={() => {
              sound.playPop(480);
              onExit();
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-stone-300 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-black text-stone-800 shadow-xs hover:border-amber-500 hover:bg-[#F9F7EC] transition-transform active:scale-95"
            aria-label="返回科目选择"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回科目</span>
          </button>
        </div>

        <div className="inline-flex items-center gap-2 sm:gap-3 p-2 bg-[#FAF8EE] border-2 border-amber-200/90 rounded-full shadow-sm max-w-full overflow-x-auto">
          {/* 1 ~ 9 气泡选择器 */}
          <div className="flex items-center gap-2">
            {QUESTIONS.map((q) => {
              const isActive = currentTab === q.id;
              return (
                <button
                  key={q.id}
                  id={`bubble-q${q.number}-btn`}
                  onClick={() => handleSelectQuestion(q.id)}
                  title={q.label}
                  aria-label={q.label}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-amber-300 border-2 border-stone-900 shadow-md scale-110 ring-4 ring-amber-300/80'
                      : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-amber-500 hover:bg-[#F9F7EC] hover:text-stone-900 active:scale-95'
                  }`}
                >
                  {q.number}
                </button>
              );
            })}
          </div>

          {/* 细微分割线与静音开关 */}
          <div className="h-7 w-0.5 bg-amber-200 mx-1 shrink-0" />
          <button
            id="sound-toggle-btn"
            onClick={handleToggleMute}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-all active:scale-95 cursor-pointer shrink-0 ${
              isMuted
                ? 'bg-[#F4F0DE] text-stone-400 border-stone-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
            }`}
            title={isMuted ? '点击开启音效' : '点击静音'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-800" />}
          </button>
        </div>
      </div>

      {/* 主工作区 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-5 flex flex-col">
        {/* 动态题目组件渲染 */}
        <div className="flex-1">
          {currentTab === 'q1' && <Question1CubeNet />}
          {currentTab === 'q2' && <Question2Marbles />}
          {currentTab === 'q3' && <Question3Volume />}
          {currentTab === 'q4' && <Question4Fractions />}
          {currentTab === 'q5' && <Question5Coordinates />}
          {currentTab === 'q6' && <Question6UnitaryMethod />}
          {currentTab === 'q7' && <Question7PictogramPercentage />}
          {currentTab === 'q8' && <Question8Comprehensive />}
          {currentTab === 'q9' && <Question9Comprehensive />}
        </div>

        {/* 底部前后快捷切换导航栏 */}
        <div className="mt-8 pt-4 border-t-2 border-amber-200/60 flex items-center justify-between pb-8">
          <button
            id="prev-question-btn"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm sm:text-base font-black transition shadow-xs cursor-pointer ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-[#F4F0DE] text-stone-400 border border-stone-300'
                : 'bg-white hover:bg-[#F9F7EC] text-stone-800 border-2 border-stone-300 hover:border-amber-500 shadow-xs active:scale-95'
            }`}
          >
            <ChevronLeft className="w-5 h-5" /> 上一题
          </button>

          <div className="text-xs sm:text-sm font-black text-amber-950 bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-300 shadow-2xs">
            第 {currentIndex + 1} 题 / 共 {ORDERED_QUESTIONS.length} 题
          </div>

          <button
            id="next-question-btn"
            disabled={currentIndex === ORDERED_QUESTIONS.length - 1}
            onClick={handleNext}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm sm:text-base font-black transition shadow-xs cursor-pointer ${
              currentIndex === ORDERED_QUESTIONS.length - 1
                ? 'opacity-40 cursor-not-allowed bg-[#F4F0DE] text-stone-400 border border-stone-300'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-700 shadow-sm active:scale-95'
            }`}
          >
            下一题 <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
