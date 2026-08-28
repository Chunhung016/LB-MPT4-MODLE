import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, PieChart, Scissors, Undo2, X } from 'lucide-react';

interface SliceState {
  id: number;
  removed: boolean;
  color: string;
  label: string;
}

const PASTEL_PALETTE = [
  '#fed7aa', // 蜜桃橙
  '#fde68a', // 柠檬黄
  '#bbf7d0', // 薄荷绿
  '#a7f3d0', // 青翠绿
  '#bae6fd', // 晴空蓝
  '#c7d2fe', // 丁香紫
  '#ddd6fe', // 浅紫罗兰
  '#fbcfe8', // 樱花粉
];

export const Question4Fractions: React.FC = () => {
  // 是否已经切割成 8 等份 (初始为 1 个完整圆)
  const [isDivided, setIsDivided] = useState<boolean>(false);

  // 8 个扇形切片状态
  const [slices, setSlices] = useState<SliceState[]>(
    PASTEL_PALETTE.map((color, index) => ({
      id: index,
      removed: false,
      color,
      label: `第 ${index + 1} 份 (1/8)`,
    }))
  );

  // 候选数字卡片
  const FRACTION_CARDS = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // 学生拖拽卡槽状态: [ 分子 ] / [ 分母 ]
  const [numeratorSlot, setNumeratorSlot] = useState<string | null>(null);
  const [denominatorSlot, setDenominatorSlot] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{ checked: boolean; isCorrect: boolean } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // 拖拽放入处理
  const handleDragStart = (e: React.DragEvent, val: string) => {
    e.dataTransfer.setData('text/plain', val);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, slot: 'numerator' | 'denominator') => {
    e.preventDefault();
    const val = e.dataTransfer.getData('text/plain');
    if (val) {
      sound.playPop(580);
      if (slot === 'numerator') setNumeratorSlot(val);
      else setDenominatorSlot(val);
    }
  };

  // 点击卡片自动填充到下一个空槽位
  const handleCardClick = (val: string) => {
    sound.playPop(520);
    if (!numeratorSlot) setNumeratorSlot(val);
    else if (!denominatorSlot) setDenominatorSlot(val);
    else setNumeratorSlot(val);
  };

  // 移除槽位卡片
  const handleRemoveSlot = (slot: 'numerator' | 'denominator', e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playPop(380);
    if (slot === 'numerator') setNumeratorSlot(null);
    else setDenominatorSlot(null);
  };

  // 已减去的切片数量
  const removedCount = slices.filter((s) => s.removed).length;
  const remainingCount = 8 - removedCount;

  // 执行平均分成 8 份
  const handleDivide = () => {
    sound.playPop(520);
    setIsDivided(true);
  };

  // 点击某个切片进行“减去”或“还原”
  const toggleSlice = (index: number) => {
    if (!isDivided) return;

    sound.playMarble();
    setSlices((prev) => {
      const next = [...prev];
      const target = next[index];
      const willRemove = !target.removed;

      target.removed = willRemove;

      // 实时音效反馈
      if (willRemove) {
        sound.playPop(400 + index * 40);
      } else {
        sound.playPop(600 - index * 30);
      }

      // 如果正好减去 5 份，触发成就音效
      const newRemovedCount = next.filter((s) => s.removed).length;
      if (newRemovedCount === 5) {
        sound.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      return next;
    });
  };

  // 一键快速减去 5 份
  const autoSubtract5 = () => {
    if (!isDivided) setIsDivided(true);
    sound.playSuccess();
    setSlices((prev) =>
      prev.map((s, idx) => ({
        ...s,
        removed: idx < 5,
      }))
    );
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // 重置
  const handleReset = () => {
    setIsDivided(false);
    setSlices(
      PASTEL_PALETTE.map((color, index) => ({
        id: index,
        removed: false,
        color,
        label: `第 ${index + 1} 份 (1/8)`,
      }))
    );
    setNumeratorSlot(null);
    setDenominatorSlot(null);
    setCheckResult(null);
    setShowHint(false);
    sound.playPop(350);
  };

  // 提交并检查学生输入的分数
  const handleCheckAnswer = () => {
    const numOk = numeratorSlot === '3';
    const denOk = denominatorSlot === '8';
    const isOk = numOk && denOk;

    setCheckResult({ checked: true, isCorrect: isOk });

    if (isOk) {
      sound.playSuccess();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
    }
  };

  // SVG 扇形路径生成函数 (原点 150, 150, 半径 120, 角度 45度每份)
  const getSlicePath = (index: number, isExploded: boolean) => {
    const cx = 160;
    const cy = 160;
    const r = 125;
    const anglePerSlice = 360 / 8; // 45 度
    const startAngle = index * anglePerSlice - 90; // 从正上方 12 点钟开始
    const endAngle = (index + 1) * anglePerSlice - 90;

    // 偏移距离（如果被减去，则向外弹出）
    const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
    const explodeDist = isExploded ? 28 : 0;
    const ox = cx + Math.cos(midAngle) * explodeDist;
    const oy = cy + Math.sin(midAngle) * explodeDist;

    const x1 = ox + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = oy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = ox + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = oy + r * Math.sin((endAngle * Math.PI) / 180);

    return {
      path: `M ${ox} ${oy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`,
      midX: ox + (r * 0.65) * Math.cos(midAngle),
      midY: oy + (r * 0.65) * Math.sin(midAngle),
    };
  };

  return (
    <div id="question-4-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* 题目头部 (对应试卷第 4 题) */}
      <div id="q4-header-card" className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] text-amber-900 rounded-full text-xs font-bold tracking-wide mb-2 border border-[#FDE68A]">
              <PieChart className="w-3.5 h-3.5 text-amber-700" /> 分数与运算 · 第 4 题
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
                4. 计算：
              </h2>
              {/* 美观的分数排版 1 - 5/8 */}
              <div className="inline-flex items-center gap-2 text-2xl md:text-3xl font-extrabold font-serif text-stone-900 bg-[#F8F6EB] px-4 py-1.5 rounded-xl border border-[#E5DFC9]">
                <span>1</span>
                <span className="text-stone-400 font-sans font-normal text-xl">−</span>
                <div className="inline-flex flex-col items-center leading-none text-xl md:text-2xl">
                  <span className="border-b-2 border-stone-800 pb-0.5 px-1">5</span>
                  <span className="pt-0.5 px-1">8</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-stone-600 text-sm font-medium">
              先把整数 1 换算成假分数 8/8，再减去其中的 5 份。
              <span className="ml-2 text-xs text-stone-400 font-mono">[3 分]</span>
            </p>
          </div>

          <button
            id="q4-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 bg-[#F4F0DE] hover:bg-[#EAE4CE] border border-[#DDD7C0] rounded-xl transition-all active:scale-95"
            title="重置本题"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>
      </div>

      {/* 核心互动展示区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：SVG 分数圆盘切割与减去交互 */}
        <div className="lg:col-span-7 bg-[#F8F6EB] rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex flex-col justify-between items-center min-h-[460px]">
          {/* 状态栏 */}
          <div className="w-full flex items-center justify-between z-10">
            <span className="text-xs font-bold px-3 py-1 bg-white rounded-xl shadow-xs text-stone-800 border border-[#DDD7C0]">
              {isDivided ? `已分成 8 份 · 已减去 ${removedCount} 份 · 剩余 ${remainingCount} 份` : '完整圆（代表整数 1）'}
            </span>

            {isDivided && (
              <button
                onClick={autoSubtract5}
                className="text-xs px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs transition border border-amber-700"
              >
                ⚡ 一键减去 5 份
              </button>
            )}
          </div>

          {/* SVG 纯矢量分数圆盘 */}
          <div className="w-full flex-1 flex items-center justify-center my-2 relative">
            <svg viewBox="0 0 320 320" className="w-full max-w-[300px] select-none">
              <defs>
                <filter id="shadow-drop" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                </filter>
              </defs>

              {/* 外圈虚线参考环 */}
              <circle cx="160" cy="160" r="130" fill="none" stroke="#D5CEB5" strokeWidth="2" strokeDasharray="6 6" />

              {!isDivided ? (
                /* 阶段 1: 完整的 1 个圆 */
                <g className="cursor-pointer group" onClick={handleDivide} filter="url(#shadow-drop)">
                  <circle
                    cx="160"
                    cy="160"
                    r="120"
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="3"
                    className="transition-transform group-hover:scale-105 origin-center duration-300"
                  />
                  {/* 中间标注 1 */}
                  <circle cx="160" cy="160" r="32" fill="white" stroke="#D97706" strokeWidth="2" />
                  <text x="160" y="168" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#78350F">
                    1
                  </text>
                  <text x="160" y="215" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400E">
                    (一个完整单位)
                  </text>
                </g>
              ) : (
                /* 阶段 2: 切分成 8 个扇形 */
                <g filter="url(#shadow-drop)">
                  {slices.map((slice, idx) => {
                    const { path, midX, midY } = getSlicePath(idx, slice.removed);
                    return (
                      <g
                        key={slice.id}
                        id={`q4-slice-${idx}`}
                        onClick={() => toggleSlice(idx)}
                        className="cursor-pointer transition-all duration-300 group"
                      >
                        {/* 扇形体 */}
                        <path
                          d={path}
                          fill={slice.removed ? '#EFEAD6' : slice.color}
                          stroke={slice.removed ? '#C9C2A8' : '#78716C'}
                          strokeWidth={slice.removed ? '1.5' : '2'}
                          strokeDasharray={slice.removed ? '3 3' : 'none'}
                          opacity={slice.removed ? 0.45 : 1}
                          className="transition-all duration-300 group-hover:brightness-95"
                        />

                        {/* 扇形文字标记 1/8 */}
                        <text
                          x={midX}
                          y={midY + 4}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill={slice.removed ? '#A8A29E' : '#292524'}
                          className="select-none pointer-events-none"
                        >
                          {slice.removed ? '已减' : '1/8'}
                        </text>
                      </g>
                    );
                  })}

                  {/* 中心圆形圆心钮 */}
                  <circle cx="160" cy="160" r="14" fill="white" stroke="#78716C" strokeWidth="2" />
                  <circle cx="160" cy="160" r="4" fill="#78716C" />
                </g>
              )}
            </svg>
          </div>

          {/* 底部控制按钮与操作提示 */}
          <div className="w-full bg-white rounded-xl p-3.5 border border-[#E5DFC9] shadow-xs z-10">
            {!isDivided ? (
              <button
                id="q4-split-btn"
                onClick={handleDivide}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs transition-all active:scale-[0.98] text-xs flex items-center justify-center gap-2 border border-amber-700"
              >
                <Scissors className="w-4 h-4" /> 平均分成 8 份 (转化为 8/8)
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-stone-600 font-medium">
                  👉 提示：点击任意切片可<strong>减去</strong>或<strong>还原</strong>它！
                </span>
                <button
                  onClick={() => {
                    setSlices((prev) => prev.map((s) => ({ ...s, removed: false })));
                    sound.playPop(380);
                  }}
                  className="text-xs px-2.5 py-1 bg-[#F4F0DE] hover:bg-[#EAE4CE] text-stone-700 rounded-lg font-bold transition flex items-center gap-1 border border-[#DDD7C0]"
                >
                  <Undo2 className="w-3.5 h-3.5" /> 还原所有切片
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：实时动态等式与学生作答 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* 实时同步等式卡片 */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              🔄 实时算式动态更新
            </h3>

            {/* 动态公式展示器 */}
            <div className="p-4 bg-[#F8F6EB] rounded-2xl border border-[#E5DFC9] flex items-center justify-center gap-3 text-xl font-bold font-mono text-stone-800">
              {/* 8/8 */}
              <div className="flex flex-col items-center">
                <span className="border-b-2 border-stone-800 px-2">{isDivided ? '8' : '1'}</span>
                <span className="px-2">{isDivided ? '8' : '1'}</span>
              </div>

              <span className="text-rose-600 font-sans">−</span>

              {/* 减去的部分 (removed/8) */}
              <div className="flex flex-col items-center text-rose-700">
                <span className="border-b-2 border-rose-700 px-2">{isDivided ? removedCount : '0'}</span>
                <span className="px-2">{isDivided ? '8' : '1'}</span>
              </div>

              <span className="text-stone-400 font-sans">=</span>

              {/* 剩余的结果 (remaining/8) */}
              <div
                className={`flex flex-col items-center px-2.5 py-1 rounded-xl transition-all ${
                  removedCount === 5
                    ? 'bg-[#E7F7F1] text-teal-900 ring-2 ring-teal-400 scale-110'
                    : 'text-amber-800'
                }`}
              >
                <span className="border-b-2 border-current px-2">{isDivided ? remainingCount : '1'}</span>
                <span className="px-2">{isDivided ? '8' : '1'}</span>
              </div>
            </div>

            {/* 达成 5/8 时的庆祝标识 */}
            {removedCount === 5 && (
              <div className="p-3 bg-[#E7F7F1] border border-[#BCE7D6] rounded-xl text-teal-950 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                成功减去了 5 份！此时剩余 3 份，即 3/8！
              </div>
            )}
          </div>

          {/* 学生填空作答卡 */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-700 mb-2">
                ✍️ 填写最终计算结果：
              </h3>

              {/* 拖拽式分数卡槽 */}
              <div className="flex flex-col items-center justify-center gap-3 py-3 px-4 bg-[#F8F6EB] rounded-xl border border-[#E5DFC9]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold font-serif text-stone-800">1 − 5/8 = </span>
                  <div className="flex flex-col items-center gap-1.5">
                    {/* 分子槽位 */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'numerator')}
                      className={`w-16 h-10 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        numeratorSlot
                          ? 'border-amber-400 bg-white text-stone-900 shadow-2xs font-extrabold font-mono text-lg'
                          : 'border-dashed border-[#DDD7C0] bg-white/70 hover:border-amber-400 hover:bg-white text-stone-400 text-xs font-bold'
                      }`}
                      onClick={() => numeratorSlot && handleRemoveSlot('numerator')}
                      title={numeratorSlot ? '点击移除' : '拖入或点击下方卡片填入分子 (3)'}
                    >
                      {numeratorSlot || '分子?'}
                    </div>

                    {/* 分数线 */}
                    <div className="w-16 h-0.5 bg-stone-800 rounded-full"></div>

                    {/* 分母槽位 */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'denominator')}
                      className={`w-16 h-10 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        denominatorSlot
                          ? 'border-amber-400 bg-white text-stone-900 shadow-2xs font-extrabold font-mono text-lg'
                          : 'border-dashed border-[#DDD7C0] bg-white/70 hover:border-amber-400 hover:bg-white text-stone-400 text-xs font-bold'
                      }`}
                      onClick={() => denominatorSlot && handleRemoveSlot('denominator')}
                      title={denominatorSlot ? '点击移除' : '拖入或点击下方卡片填入分母 (8)'}
                    >
                      {denominatorSlot || '分母?'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 候选数字卡片池 */}
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                  <span>🔢 数字卡片（拖拽或点击填入）：</span>
                  {(numeratorSlot || denominatorSlot) && (
                    <button
                      type="button"
                      onClick={() => {
                        setNumeratorSlot(null);
                        setDenominatorSlot(null);
                        sound.playPop(350);
                      }}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                    >
                      清空
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9]">
                  {FRACTION_CARDS.map((num) => {
                    const isUsed = numeratorSlot === num || denominatorSlot === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        draggable
                        onDragStart={(e) => handleDragStart(e, num)}
                        onClick={() => handleCardClick(num)}
                        className={`w-8 h-8 text-xs font-mono font-extrabold rounded-lg border transition shadow-2xs cursor-grab active:cursor-grabbing active:scale-95 flex items-center justify-center ${
                          isUsed
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                            : 'bg-white text-stone-800 border-[#DDD7C0] hover:border-amber-400 hover:bg-[#FFFBEB]'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {checkResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold mt-3 ${
                    checkResult.isCorrect
                      ? 'bg-[#E7F7F1] border-[#BCE7D6] text-teal-950'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {checkResult.isCorrect ? '🎉 计算正确！' : '❌ 结果不正确，请观察左侧剩余的份数后重新尝试。'}
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="pt-3 border-t border-[#E8E4D0] mt-3 space-y-2">
              <button
                id="q4-submit-btn"
                onClick={handleCheckAnswer}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs flex items-center justify-center gap-2 border border-amber-700"
              >
                <CheckCircle2 className="w-4 h-4" /> 检查分数结果
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
