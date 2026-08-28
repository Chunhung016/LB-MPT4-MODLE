import React, { useState } from 'react';
import { Sparkles, RotateCcw, FlaskConical, Beaker, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface BeakerItem {
  id: string;
  name: string;
  type: 'acid' | 'neutral' | 'alkali';
  liquidColor: string;
  redTestResult: 'red' | 'blue';
  blueTestResult: 'red' | 'blue';
  isRedTested: boolean;
  isBlueTested: boolean;
}

const INITIAL_BEAKERS: BeakerItem[] = [
  { id: 'lemon', name: '烧杯 A: 柠檬汁', type: 'acid', liquidColor: '#facc15', redTestResult: 'red', blueTestResult: 'red', isRedTested: false, isBlueTested: false },
  { id: 'water', name: '烧杯 B: 蒸馏水', type: 'neutral', liquidColor: '#38bdf8', redTestResult: 'red', blueTestResult: 'blue', isRedTested: false, isBlueTested: false },
  { id: 'soap', name: '烧杯 C: 肥皂水', type: 'alkali', liquidColor: '#c084fc', redTestResult: 'blue', blueTestResult: 'blue', isRedTested: false, isBlueTested: false },
  { id: 'soda', name: '烧杯 D: 汽水', type: 'acid', liquidColor: '#fb923c', redTestResult: 'red', blueTestResult: 'red', isRedTested: false, isBlueTested: false },
];

interface LitmusPaperLabProps {
  onComplete?: (score: number) => void;
}

export const LitmusPaperLab: React.FC<LitmusPaperLabProps> = ({ onComplete }) => {
  const [beakers, setBeakers] = useState<BeakerItem[]>(INITIAL_BEAKERS);
  const [heldPaper, setHeldPaper] = useState<'red' | 'blue' | null>(null);
  const [activeDippingBeakerId, setActiveDippingBeakerId] = useState<string | null>(null);
  const [dippedPaperColor, setDippedPaperColor] = useState<'red' | 'blue'>('red');

  const [trayPlacements, setTrayPlacements] = useState<{
    acid: string[];
    neutral: string[];
    alkali: string[];
  }>({
    acid: [],
    neutral: [],
    alkali: [],
  });

  const [checkedOptions, setCheckedOptions] = useState<{ [key: string]: boolean }>({
    opt1: false,
    opt2: false,
    opt3: false,
    opt4: false,
  });

  const [showResult, setShowResult] = useState(false);

  const handlePullPaper = (color: 'red' | 'blue') => {
    setHeldPaper(color);
    sounds.playPop();
  };

  const handleDipIntoBeaker = (beaker: BeakerItem) => {
    if (!heldPaper) return;

    sounds.playLiquidDip();
    setActiveDippingBeakerId(beaker.id);
    const resultingColor = heldPaper === 'red' ? beaker.redTestResult : beaker.blueTestResult;
    setDippedPaperColor(resultingColor);

    setBeakers((prev) =>
      prev.map((b) => {
        if (b.id === beaker.id) {
          return {
            ...b,
            isRedTested: heldPaper === 'red' ? true : b.isRedTested,
            isBlueTested: heldPaper === 'blue' ? true : b.isBlueTested,
          };
        }
        return b;
      })
    );

    setTimeout(() => {
      setActiveDippingBeakerId(null);
    }, 1000);
  };

  const handlePlaceBeakerInTray = (beakerId: string, targetTray: 'acid' | 'neutral' | 'alkali') => {
    sounds.playSnap();
    setTrayPlacements((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((t) => {
        next[t as 'acid' | 'neutral' | 'alkali'] = next[t as 'acid' | 'neutral' | 'alkali'].filter((id) => id !== beakerId);
      });
      next[targetTray] = [...next[targetTray], beakerId];
      return next;
    });
  };

  const handleRemoveFromTray = (beakerId: string) => {
    sounds.playPop();
    setTrayPlacements((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((t) => {
        next[t as 'acid' | 'neutral' | 'alkali'] = next[t as 'acid' | 'neutral' | 'alkali'].filter((id) => id !== beakerId);
      });
      return next;
    });
  };

  const toggleOption = (key: string) => {
    sounds.playPop();
    setCheckedOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isAcidTrayCorrect =
    trayPlacements.acid.includes('lemon') &&
    trayPlacements.acid.includes('soda') &&
    trayPlacements.acid.length === 2;
  const isNeutralTrayCorrect =
    trayPlacements.neutral.includes('water') &&
    trayPlacements.neutral.length === 1;
  const isAlkaliTrayCorrect =
    trayPlacements.alkali.includes('soap') &&
    trayPlacements.alkali.length === 1;

  const isAllTraysCorrect = isAcidTrayCorrect && isNeutralTrayCorrect && isAlkaliTrayCorrect;
  const isCheckboxesCorrect = checkedOptions.opt1 && checkedOptions.opt2 && !checkedOptions.opt3 && !checkedOptions.opt4;
  const isFullyCompleted = isAllTraysCorrect && isCheckboxesCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (isFullyCompleted) {
      sounds.playSuccess();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onComplete?.(6);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setBeakers(INITIAL_BEAKERS);
    setHeldPaper(null);
    setActiveDippingBeakerId(null);
    setTrayPlacements({ acid: [], neutral: [], alkali: [] });
    setCheckedOptions({ opt1: false, opt2: false, opt3: false, opt4: false });
    setShowResult(false);
    sounds.playPop();
  };

  return (
    <div className="h-full flex flex-col justify-between gap-2 overflow-hidden" id="litmus-paper-lab-module">
      {/* Sub Header */}
      <div className="bg-white rounded-2xl px-4 py-2 border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black border border-indigo-300">
            丙组 · 第 2 题 [6分]
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            石蕊试纸变色实验与酸碱分类
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            抽红蓝试纸浸液检测，将烧杯分类并勾选规律
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer active:scale-95"
          id="reset-btn-mod4"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>

      {/* Main 2-Column iPad View Workbench */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* Left Side: Beakers Experiment + Sorting Trays */}
        <div className="md:col-span-8 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Paper Dispenser Bar */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Beaker className="w-4 h-4 text-indigo-600" />
              <span>检测操作台：</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-bold">试纸工具：</span>
              <button
                onClick={() => handlePullPaper('red')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                  heldPaper === 'red'
                    ? 'bg-rose-500 text-white ring-2 ring-rose-400 shadow-xs'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                <span className="w-2 h-3 bg-rose-500 rounded-xs" />
                红试纸
              </button>
              <button
                onClick={() => handlePullPaper('blue')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                  heldPaper === 'blue'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-xs'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                <span className="w-2 h-3 bg-blue-600 rounded-xs" />
                蓝试纸
              </button>
            </div>
          </div>

          {/* 4 Beakers Grid */}
          <div className="grid grid-cols-4 gap-2 my-1">
            {beakers.map((beaker) => {
              const isDipping = activeDippingBeakerId === beaker.id;

              return (
                <div
                  key={beaker.id}
                  onClick={() => heldPaper && handleDipIntoBeaker(beaker)}
                  className={`bg-slate-50 rounded-xl p-2 border transition flex flex-col items-center justify-between text-center select-none ${
                    heldPaper
                      ? 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 hover:scale-102 ring-1 ring-indigo-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-black text-slate-900">{beaker.name.split(':')[1]}</div>

                  {/* SVG Beaker */}
                  <div className="relative w-16 h-20 my-1 flex items-center justify-center">
                    <svg viewBox="0 0 100 130" className="w-full h-full">
                      {/* Glass Body */}
                      <path
                        d="M 20 15 L 20 115 Q 20 125 30 125 L 70 125 Q 80 125 80 15 L 85 15 L 85 10 L 15 10 L 15 15 Z"
                        fill="rgba(255,255,255,0.7)"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      />
                      {/* Liquid */}
                      <path
                        d="M 22 55 Q 50 50 78 55 L 78 115 Q 78 123 70 123 L 30 123 Q 22 123 22 115 Z"
                        fill={beaker.liquidColor}
                        fillOpacity="0.8"
                      />
                      {/* Scale Lines */}
                      <line x1="22" y1="60" x2="32" y2="60" stroke="#64748b" strokeWidth="1.5" />
                      <line x1="22" y1="90" x2="32" y2="90" stroke="#64748b" strokeWidth="1.5" />

                      {/* Dipping Paper */}
                      {isDipping && heldPaper && (
                        <g>
                          <rect x="44" y="15" width="12" height="50" fill={heldPaper === 'red' ? '#ef4444' : '#3b82f6'} />
                          <rect x="44" y="65" width="12" height="30" fill={dippedPaperColor === 'red' ? '#ef4444' : '#3b82f6'} />
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Test Results Summary */}
                  <div className="w-full space-y-0.5 text-[9px] font-bold">
                    <div className="flex justify-between px-1 py-0.5 bg-white rounded border border-slate-200">
                      <span>红:</span>
                      <span className={beaker.isRedTested ? (beaker.redTestResult === 'blue' ? 'text-blue-600 font-black' : 'text-rose-600 font-black') : 'text-slate-400'}>
                        {beaker.isRedTested ? (beaker.redTestResult === 'blue' ? '变蓝' : '不变') : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between px-1 py-0.5 bg-white rounded border border-slate-200">
                      <span>蓝:</span>
                      <span className={beaker.isBlueTested ? (beaker.blueTestResult === 'red' ? 'text-rose-600 font-black' : 'text-blue-600 font-black') : 'text-slate-400'}>
                        {beaker.isBlueTested ? (beaker.blueTestResult === 'red' ? '变红' : '不变') : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Tray Buttons */}
                  <div className="w-full mt-1.5 pt-1 border-t border-slate-200 flex justify-between gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceBeakerInTray(beaker.id, 'acid');
                      }}
                      className="px-1 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-black border border-rose-300"
                    >
                      酸
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceBeakerInTray(beaker.id, 'neutral');
                      }}
                      className="px-1 py-0.5 rounded bg-slate-200 text-slate-800 text-[9px] font-black border border-slate-300"
                    >
                      中
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceBeakerInTray(beaker.id, 'alkali');
                      }}
                      className="px-1 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-black border border-blue-300"
                    >
                      碱
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3 Sorting Trays */}
          <div className="pt-1">
            <div className="text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>性质分类托盘 (点击烧杯下方按钮归类)：</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Acid */}
              <div className="bg-rose-50 border-2 border-dashed border-rose-300 rounded-xl p-2 min-h-[64px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-black text-rose-900">
                  <span>酸性托盘</span>
                  <span className="text-[9px] bg-rose-200 px-1 rounded text-rose-800 font-bold">蓝变红</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {trayPlacements.acid.map((id) => (
                    <button
                      key={id}
                      onClick={() => handleRemoveFromTray(id)}
                      className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black shadow-2xs cursor-pointer"
                    >
                      {beakers.find((b) => b.id === id)?.name.split(':')[1]} ✕
                    </button>
                  ))}
                  {trayPlacements.acid.length === 0 && <span className="text-[10px] text-rose-400">待放入</span>}
                </div>
              </div>

              {/* Neutral */}
              <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-2 min-h-[64px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-800">
                  <span>中性托盘</span>
                  <span className="text-[9px] bg-slate-200 px-1 rounded text-slate-700 font-bold">不变色</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {trayPlacements.neutral.map((id) => (
                    <button
                      key={id}
                      onClick={() => handleRemoveFromTray(id)}
                      className="px-2 py-0.5 rounded bg-slate-600 text-white text-[10px] font-black shadow-2xs cursor-pointer"
                    >
                      {beakers.find((b) => b.id === id)?.name.split(':')[1]} ✕
                    </button>
                  ))}
                  {trayPlacements.neutral.length === 0 && <span className="text-[10px] text-slate-400">待放入</span>}
                </div>
              </div>

              {/* Alkali */}
              <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-2 min-h-[64px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-black text-blue-900">
                  <span>碱性托盘</span>
                  <span className="text-[9px] bg-blue-200 px-1 rounded text-blue-800 font-bold">红变蓝</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {trayPlacements.alkali.map((id) => (
                    <button
                      key={id}
                      onClick={() => handleRemoveFromTray(id)}
                      className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black shadow-2xs cursor-pointer"
                    >
                      {beakers.find((b) => b.id === id)?.name.split(':')[1]} ✕
                    </button>
                  ))}
                  {trayPlacements.alkali.length === 0 && <span className="text-[10px] text-blue-400">待放入</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Question 2(b) Checkboxes & Validation */}
        <div className="md:col-span-4 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 shrink-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-black">2</span>
                2 (b). 石蕊试纸变色规律 [2分]
              </h3>
            </div>

            <p className="text-xs text-slate-600 font-medium my-2">
              观察实验变色结果，勾选 2 个正确说明：
            </p>

            <div className="space-y-1.5 text-xs">
              {[
                { id: 'opt1', text: '蓝色石蕊试纸遇酸性物质会变红色', isCorrect: true },
                { id: 'opt2', text: '红色石蕊试纸遇碱性物质会变蓝色', isCorrect: true },
                { id: 'opt3', text: '中性物质会使两种试纸都变色', isCorrect: false },
                { id: 'opt4', text: '酸性物质会使红色石蕊试纸变蓝', isCorrect: false },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                    checkedOptions[opt.id]
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2 text-[11px]">
                    <input
                      type="checkbox"
                      checked={checkedOptions[opt.id]}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 rounded text-indigo-600 accent-indigo-600"
                    />
                    {opt.text}
                  </span>

                  {showResult && (
                    <span className={`text-[10px] font-black ${opt.isCorrect === checkedOptions[opt.id] ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {opt.isCorrect ? '✓' : checkedOptions[opt.id] ? '✗' : ''}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Validation */}
          <div className="space-y-1.5 pt-2">
            {showResult && (
              <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isFullyCompleted ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>
                {isFullyCompleted
                  ? '🎉 实验完全正确！(获得 6 分)'
                  : '⚠️ 酸性托盘：柠檬汁、汽水；中性：蒸馏水；碱性：肥皂水；规律勾选第 1 项与第 2 项。'}
              </div>
            )}

            <button
              onClick={handleValidate}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              id="validate-mod4-btn"
            >
              <Sparkles className="w-4 h-4" />
              提交核对答案 (6分)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
