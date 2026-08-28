import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, Star, Percent, Calculator, Divide, Layers, Grid, Lock, Unlock } from 'lucide-react';

interface StarItem {
  id: string;
  round: 1 | 2 | 3;
  index: number;
  expanded: boolean; // 是否已点击展开为 4 张贴纸
}

export const Question7PictogramPercentage: React.FC = () => {
  // 3 个回合的星星初始状态 (第一回合 3 颗，第二回合 5 颗，第三回合 2 颗，共 10 颗星)
  const initialStars: StarItem[] = [
    // 回合 1 (3 颗)
    { id: 'r1-1', round: 1, index: 1, expanded: false },
    { id: 'r1-2', round: 1, index: 2, expanded: false },
    { id: 'r1-3', round: 1, index: 3, expanded: false },
    // 回合 2 (5 颗)
    { id: 'r2-1', round: 2, index: 1, expanded: false },
    { id: 'r2-2', round: 2, index: 2, expanded: false },
    { id: 'r2-3', round: 2, index: 3, expanded: false },
    { id: 'r2-4', round: 2, index: 4, expanded: false },
    { id: 'r2-5', round: 2, index: 5, expanded: false },
    // 回合 3 (2 颗)
    { id: 'r3-1', round: 3, index: 1, expanded: false },
    { id: 'r3-2', round: 3, index: 2, expanded: false },
  ];

  const [stars, setStars] = useState<StarItem[]>(initialStars);

  // 数学计算工作台模式: 'fraction' (约分化简) | 'grid100' (百格图) | 'division' (竖式除法)
  const [mathTab, setMathTab] = useState<'fraction' | 'grid100' | 'division'>('fraction');
  const [divisionStep, setDivisionStep] = useState<number>(3); // 1..3

  // 答题候选卡片池
  const STAT_CARDS = ['4', '5', '10', '20', '40', '50', '25', '100', '1', '2'];

  // 卡槽状态
  const [slotR2Stars, setSlotR2Stars] = useState<string | null>(null);     // '5'
  const [slotMultiplier, setSlotMultiplier] = useState<string | null>(null); // '4'
  const [slotR2Stickers, setSlotR2Stickers] = useState<string | null>(null); // '20'

  const [slotTotalStars, setSlotTotalStars] = useState<string | null>(null); // '10'
  const [slotTotalStickers, setSlotTotalStickers] = useState<string | null>(null); // '40'

  const [slotNumerator, setSlotNumerator] = useState<string | null>(null);     // '20' 或 '1'
  const [slotDenominator, setSlotDenominator] = useState<string | null>(null); // '40' 或 '2'
  const [slotPercentAns, setSlotPercentAns] = useState<string | null>(null);   // '50'

  const [checkResult, setCheckResult] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  // 学习进展检测：是否填对了百分比结果
  const isPercentSolved =
    slotPercentAns === '50' || slotPercentAns === '50%';

  const isFractionFilled =
    (slotNumerator === '20' && slotDenominator === '40') ||
    (slotNumerator === '1' && slotDenominator === '2');

  const isStep1Done = slotR2Stickers === '20' || (slotR2Stars === '5' && slotMultiplier === '4');
  const isStep2Done = slotTotalStickers === '40' || slotTotalStars === '10';

  // 点击单个星星展开/收起为 4 张贴纸
  const toggleStar = (id: string) => {
    setStars((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextExpanded = !s.expanded;
          if (nextExpanded) {
            sound.playPop(520 + s.index * 40);
          } else {
            sound.playPop(380);
          }
          return { ...s, expanded: nextExpanded };
        }
        return s;
      })
    );
  };

  // 一键展开全部星星
  const expandAllStars = () => {
    sound.playSuccess();
    setStars((prev) => prev.map((s) => ({ ...s, expanded: true })));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // 收起全部星星
  const collapseAllStars = () => {
    sound.playPop(350);
    setStars((prev) => prev.map((s) => ({ ...s, expanded: false })));
  };

  // 拖拽处理
  const handleDragStart = (e: React.DragEvent, val: string) => {
    e.dataTransfer.setData('text/plain', val);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (
    e: React.DragEvent,
    slotName: 'r2_stars' | 'multiplier' | 'r2_stickers' | 'total_stars' | 'total_stickers' | 'num' | 'den' | 'percent'
  ) => {
    e.preventDefault();
    const val = e.dataTransfer.getData('text/plain');
    if (val) {
      sound.playPop(580);
      if (slotName === 'r2_stars') setSlotR2Stars(val);
      else if (slotName === 'multiplier') setSlotMultiplier(val);
      else if (slotName === 'r2_stickers') setSlotR2Stickers(val);
      else if (slotName === 'total_stars') setSlotTotalStars(val);
      else if (slotName === 'total_stickers') setSlotTotalStickers(val);
      else if (slotName === 'num') setSlotNumerator(val);
      else if (slotName === 'den') setSlotDenominator(val);
      else if (slotName === 'percent') {
        setSlotPercentAns(val);
        if (val === '50') sound.playSuccess();
      }
    }
  };

  const handleRemoveSlot = (
    slotName: 'r2_stars' | 'multiplier' | 'r2_stickers' | 'total_stars' | 'total_stickers' | 'num' | 'den' | 'percent',
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    sound.playPop(380);
    if (slotName === 'r2_stars') setSlotR2Stars(null);
    else if (slotName === 'multiplier') setSlotMultiplier(null);
    else if (slotName === 'r2_stickers') setSlotR2Stickers(null);
    else if (slotName === 'total_stars') setSlotTotalStars(null);
    else if (slotName === 'total_stickers') setSlotTotalStickers(null);
    else if (slotName === 'num') setSlotNumerator(null);
    else if (slotName === 'den') setSlotDenominator(null);
    else if (slotName === 'percent') setSlotPercentAns(null);
  };

  // 点击卡片智能填入槽位
  const handleCardClick = (val: string) => {
    sound.playPop(520);
    if (!slotR2Stars && val === '5') setSlotR2Stars(val);
    else if (!slotMultiplier && val === '4') setSlotMultiplier(val);
    else if (!slotR2Stickers && val === '20') setSlotR2Stickers(val);
    else if (!slotTotalStars && val === '10') setSlotTotalStars(val);
    else if (!slotTotalStickers && val === '40') setSlotTotalStickers(val);
    else if (!slotNumerator && (val === '20' || val === '1')) setSlotNumerator(val);
    else if (!slotDenominator && (val === '40' || val === '2')) setSlotDenominator(val);
    else if (!slotPercentAns && val === '50') {
      setSlotPercentAns(val);
      sound.playSuccess();
    }
    else {
      // 依序填入未满的
      if (!slotR2Stars) setSlotR2Stars(val);
      else if (!slotMultiplier) setSlotMultiplier(val);
      else if (!slotR2Stickers) setSlotR2Stickers(val);
      else if (!slotTotalStars) setSlotTotalStars(val);
      else if (!slotTotalStickers) setSlotTotalStickers(val);
      else if (!slotNumerator) setSlotNumerator(val);
      else if (!slotDenominator) setSlotDenominator(val);
      else if (!slotPercentAns) {
        setSlotPercentAns(val);
        if (val === '50') sound.playSuccess();
      }
    }
  };

  // 校验答案
  const handleCheckAnswer = () => {
    const r2Ok = slotR2Stickers === '20' || (slotR2Stars === '5' && slotMultiplier === '4');
    const totalOk = slotTotalStickers === '40' || slotTotalStars === '10';
    const fracOk = (slotNumerator === '20' && slotDenominator === '40') || (slotNumerator === '1' && slotDenominator === '2');
    const percentOk = slotPercentAns === '50' || slotPercentAns === '50%';

    if (percentOk && (r2Ok || totalOk || fracOk)) {
      setCheckResult({
        checked: true,
        isCorrect: true,
        feedback: '🎉 回答完全正确！第二回合有 20 张贴纸，占总数 40 张的 50%。下方已解锁完整的数学转化过程！',
      });
      sound.playSuccess();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      setCheckResult({
        checked: true,
        isCorrect: false,
        feedback: '❌ 答案或算式有误，请利用左侧象形图探索数量关系并尝试计算。',
      });
      sound.playGentleError();
    }
  };

  // 重置
  const handleReset = () => {
    setStars(initialStars);
    setSlotR2Stars(null);
    setSlotMultiplier(null);
    setSlotR2Stickers(null);
    setSlotTotalStars(null);
    setSlotTotalStickers(null);
    setSlotNumerator(null);
    setSlotDenominator(null);
    setSlotPercentAns(null);
    setCheckResult(null);
    sound.playPop(350);
  };

  // 渲染单个星星（或展开的 4 张贴纸）
  const renderStarCell = (star: StarItem) => {
    if (star.expanded) {
      // 展开为 4 张微缩贴纸
      return (
        <div
          onClick={() => toggleStar(star.id)}
          className="w-14 h-14 p-1 bg-amber-50 border-2 border-amber-300 rounded-xl grid grid-cols-2 gap-1 cursor-pointer transition transform hover:scale-105 shadow-2xs animate-fade-in"
          title="点击收回为 1 颗星"
        >
          {[0, 1, 2, 3].map((sIdx) => (
            <div
              key={sIdx}
              className="w-full h-full bg-amber-400 rounded-md flex items-center justify-center text-[10px] text-amber-950 font-bold shadow-2xs"
            >
              🏷️
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        onClick={() => toggleStar(star.id)}
        className={`w-14 h-14 rounded-xl flex items-center justify-center cursor-pointer transition transform hover:scale-110 shadow-xs ${
          star.round === 2
            ? 'bg-amber-100/90 border-2 border-amber-400 text-amber-500 hover:bg-amber-200'
            : 'bg-stone-50 border-2 border-stone-200 text-stone-400 hover:bg-stone-100'
        }`}
        title="点击展开为 4 张贴纸"
      >
        <Star className={`w-8 h-8 fill-current ${star.round === 2 ? 'text-amber-500 animate-pulse' : 'text-stone-400'}`} />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* 题目说明卡片 */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-extrabold">
              第 7 题
            </span>
            <span className="text-xs text-stone-500 font-bold">象形统计图与百分比 (Pictogram & Percentage)</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-[#FEF3C7] px-2.5 py-1 rounded-md border border-[#FDE68A]">
            [2 分]
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug">
          图 5 显示三个回合中获得的贴纸数量象形统计图。
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          根据图 5，计算 <strong className="text-amber-800 font-extrabold">第二回合</strong> 的贴纸数量占 <strong className="text-amber-800 font-extrabold">三回合总贴纸数量</strong> 的百分比（$\%$）。正确填入百分比结果将解锁数学推导工作台！
        </p>
      </div>

      {/* 探索展示区：左侧象形统计图与互动贴纸矩阵 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：图 5 象形统计图 */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold text-stone-700 bg-[#FAF8EE] px-3 py-1 rounded-lg border border-[#E5DFC9]">
                图 5：各回合贴纸象形统计图
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAllStars}
                  className="text-xs font-bold text-amber-900 bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] px-2.5 py-1 rounded-lg transition"
                >
                  ✨ 展开所有星星
                </button>
                <button
                  onClick={collapseAllStars}
                  className="text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition"
                >
                  收起
                </button>
              </div>
            </div>

            {/* 象形统计图三行展示 */}
            <div className="space-y-3 bg-[#FAF8EE] p-4 rounded-xl border border-[#E5DFC9]">
              {/* 第一回合 (3 颗星) */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#DDD7C0]">
                <div className="w-20 text-xs font-bold text-stone-700">第一回合</div>
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {stars
                    .filter((s) => s.round === 1)
                    .map((s) => (
                      <React.Fragment key={s.id}>{renderStarCell(s)}</React.Fragment>
                    ))}
                </div>
                <div className="text-xs font-mono font-bold text-stone-500">
                  3 颗星
                </div>
              </div>

              {/* 第二回合 (5 颗星 - 重点关注) */}
              <div className="flex items-center gap-3 bg-amber-50/70 p-2.5 rounded-xl border-2 border-amber-300 shadow-2xs">
                <div className="w-20 text-xs font-extrabold text-amber-950 flex items-center gap-1">
                  <span>第二回合</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                </div>
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {stars
                    .filter((s) => s.round === 2)
                    .map((s) => (
                      <React.Fragment key={s.id}>{renderStarCell(s)}</React.Fragment>
                    ))}
                </div>
                <div className="text-xs font-mono font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  5 颗星
                </div>
              </div>

              {/* 第三回合 (2 颗星) */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#DDD7C0]">
                <div className="w-20 text-xs font-bold text-stone-700">第三回合</div>
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {stars
                    .filter((s) => s.round === 3)
                    .map((s) => (
                      <React.Fragment key={s.id}>{renderStarCell(s)}</React.Fragment>
                    ))}
                </div>
                <div className="text-xs font-mono font-bold text-stone-500">
                  2 颗星
                </div>
              </div>
            </div>
          </div>

          {/* 图例说明栏 */}
          <div className="mt-4 pt-3 border-t border-[#F0EBD8] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="font-bold text-amber-950">图例：1 颗星星（★）代表 4 张贴纸</span>
            </div>

            <span className="text-stone-500">
              三回合共有 10 颗星
            </span>
          </div>
        </div>

        {/* 右侧：贴纸总数与回合比例矩阵 */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-stone-700 bg-[#FAF8EE] px-3 py-1 rounded-lg border border-[#E5DFC9]">
                📊 贴纸数据分布矩阵
              </span>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                第二回合占 5 颗
              </span>
            </div>

            {/* 10 颗星星的比例分布条形图 */}
            <div className="space-y-3 p-3 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9]">
              <div className="text-xs font-bold text-stone-700 flex justify-between">
                <span>总星星数量分布（共 10 颗）：</span>
                <span className="font-mono text-amber-800 font-extrabold">第二回合: 5 颗</span>
              </div>

              {/* 10 个方格条 */}
              <div className="grid grid-cols-10 gap-1 h-8">
                {[...Array(3)].map((_, i) => (
                  <div key={`r1-${i}`} className="bg-stone-300 rounded-md flex items-center justify-center text-[10px] font-bold text-stone-700" title="第一回合">
                    1
                  </div>
                ))}
                {[...Array(5)].map((_, i) => (
                  <div key={`r2-${i}`} className="bg-amber-400 border border-amber-500 rounded-md flex items-center justify-center text-[10px] font-extrabold text-amber-950 shadow-2xs" title="第二回合">
                    2
                  </div>
                ))}
                {[...Array(2)].map((_, i) => (
                  <div key={`r3-${i}`} className="bg-stone-300 rounded-md flex items-center justify-center text-[10px] font-bold text-stone-700" title="第三回合">
                    3
                  </div>
                ))}
              </div>

              {/* 思考引导卡片 */}
              <div className="bg-white border border-[#DDD7C0] p-3 rounded-lg text-xs text-stone-600 space-y-1">
                <div className="font-bold text-stone-800">💡 观察与发现：</div>
                <div>• 第二回合占了 10 颗星中的 <strong>5 颗</strong>。</div>
                <div>• 探索其在总数中所占的比值与百分比（$\%$）。</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EBD8] text-xs text-stone-600 flex items-center justify-between">
            <span>点击左侧星星展开贴纸，自主验证张数。</span>
          </div>
        </div>
      </div>

      {/* 拖拽式答题与算式卡槽区 (自主答题区) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5DFC9] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EBD8] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-bold">✍️</span>
            <h3 className="text-sm font-bold text-stone-900">算式填空：将数字卡片拖入或点击填入算式槽位</h3>
          </div>
          {(slotR2Stars || slotMultiplier || slotR2Stickers || slotTotalStars || slotTotalStickers || slotNumerator || slotDenominator || slotPercentAns) && (
            <button
              onClick={() => {
                setSlotR2Stars(null);
                setSlotMultiplier(null);
                setSlotR2Stickers(null);
                setSlotTotalStars(null);
                setSlotTotalStickers(null);
                setSlotNumerator(null);
                setSlotDenominator(null);
                setSlotPercentAns(null);
                sound.playPop(350);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              清空卡槽
            </button>
          )}
        </div>

        {/* 三个步骤的算式槽位 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: 第二回合贴纸数 [5] × [4] = [20] */}
          <div className={`p-4 rounded-xl border transition-all ${isStep1Done ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#FAF8EE] border-[#E5DFC9]'} space-y-2`}>
            <span className="text-xs font-bold text-amber-900">步骤一：求第二回合贴纸数</span>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 bg-white rounded-lg border border-[#DDD7C0]">
              {/* 第二回合星星数槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'r2_stars')}
                onClick={() => slotR2Stars && handleRemoveSlot('r2_stars')}
                className={`min-w-[36px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotR2Stars
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入星星数"
              >
                {slotR2Stars || '星?'}
              </div>

              <span className="text-stone-500 font-bold text-sm">×</span>

              {/* 每星张数槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'multiplier')}
                onClick={() => slotMultiplier && handleRemoveSlot('multiplier')}
                className={`min-w-[36px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotMultiplier
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入每星张数"
              >
                {slotMultiplier || '4?'}
              </div>

              <span className="text-stone-700 font-bold text-sm">=</span>

              {/* 第二回合贴纸结果 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'r2_stickers')}
                onClick={() => slotR2Stickers && handleRemoveSlot('r2_stickers')}
                className={`min-w-[44px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotR2Stickers
                    ? 'border-amber-500 bg-amber-100 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入张数"
              >
                {slotR2Stickers || '张数?'}
              </div>
            </div>
          </div>

          {/* Step 2: 总贴纸数 [10] × 4 = [40] */}
          <div className={`p-4 rounded-xl border transition-all ${isStep2Done ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#FAF8EE] border-[#E5DFC9]'} space-y-2`}>
            <span className="text-xs font-bold text-amber-900">步骤二：求三回合总贴纸数</span>

            <div className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 bg-white rounded-lg border border-[#DDD7C0]">
              {/* 总星星数槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'total_stars')}
                onClick={() => slotTotalStars && handleRemoveSlot('total_stars')}
                className={`min-w-[36px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotTotalStars
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入总星数"
              >
                {slotTotalStars || '总星?'}
              </div>

              <span className="text-stone-500 font-bold text-sm">× 4 =</span>

              {/* 总贴纸数槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'total_stickers')}
                onClick={() => slotTotalStickers && handleRemoveSlot('total_stickers')}
                className={`min-w-[44px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotTotalStickers
                    ? 'border-amber-500 bg-amber-100 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入总张数"
              >
                {slotTotalStickers || '总张?'}
              </div>
            </div>
          </div>

          {/* Step 3: 百分比计算 ([20] / [40]) × 100% = [50] % */}
          <div className={`p-4 rounded-xl border transition-all ${isPercentSolved ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#FAF8EE] border-[#E5DFC9]'} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">步骤三：求第二回合百分比</span>
              {isPercentSolved && (
                <span className="text-[10px] bg-emerald-100 text-teal-900 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-600" /> 已解锁推导板
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 py-1.5 bg-white rounded-lg border border-[#DDD7C0]">
              <span className="text-stone-500 font-bold text-xs">(</span>
              {/* 分数：分子与分母 */}
              <div className="flex flex-col items-center">
                {/* 分子槽位 */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'num')}
                  onClick={() => slotNumerator && handleRemoveSlot('num')}
                  className={`min-w-[34px] h-7 px-1.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                    slotNumerator
                      ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-xs'
                      : 'border-dashed border-[#DDD7C0] text-stone-400 text-[10px]'
                  }`}
                  title="分子"
                >
                  {slotNumerator || '子?'}
                </div>
                <div className="w-10 h-0.5 bg-stone-700 my-0.5"></div>
                {/* 分母槽位 */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'den')}
                  onClick={() => slotDenominator && handleRemoveSlot('den')}
                  className={`min-w-[34px] h-7 px-1.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                    slotDenominator
                      ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-xs'
                      : 'border-dashed border-[#DDD7C0] text-stone-400 text-[10px]'
                  }`}
                  title="分母"
                >
                  {slotDenominator || '母?'}
                </div>
              </div>

              <span className="text-stone-500 font-bold text-xs">) × 100% =</span>

              {/* 最终百分比槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'percent')}
                onClick={() => slotPercentAns && handleRemoveSlot('percent')}
                className={`min-w-[48px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotPercentAns
                    ? isPercentSolved
                      ? 'border-emerald-500 bg-stone-900 text-amber-300 font-mono font-extrabold text-sm shadow-xs'
                      : 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="最终百分比"
              >
                {slotPercentAns ? `${slotPercentAns}%` : '结果?'}
              </div>
            </div>
          </div>
        </div>

        {/* 候选数字卡片池 */}
        <div className="space-y-1.5 pt-2">
          <div className="text-xs font-bold text-stone-600">
            🔢 数字候选卡片（拖拽或点击填入）：
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9]">
            {STAT_CARDS.map((val) => {
              const isUsed =
                slotR2Stars === val ||
                slotMultiplier === val ||
                slotR2Stickers === val ||
                slotTotalStars === val ||
                slotTotalStickers === val ||
                slotNumerator === val ||
                slotDenominator === val ||
                slotPercentAns === val;

              return (
                <button
                  key={val}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, val)}
                  onClick={() => handleCardClick(val)}
                  className={`min-w-[40px] h-9 px-2.5 text-xs font-mono font-extrabold rounded-lg border transition shadow-2xs cursor-grab active:cursor-grabbing active:scale-95 flex items-center justify-center ${
                    isUsed
                      ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                      : 'bg-white text-stone-800 border-[#DDD7C0] hover:border-amber-400 hover:bg-[#FFFBEB]'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>

        {/* 操作按钮栏与提示 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0EBD8]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckAnswer}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 border border-amber-700"
            >
              <CheckCircle2 className="w-4 h-4" /> 检查答案
            </button>

            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 bg-white hover:bg-[#FAF8EE] text-stone-700 rounded-xl text-xs font-bold transition border border-[#DDD7C0] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 重置
            </button>
          </div>
        </div>

        {/* 答案校验反馈信息 */}
        {checkResult && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
              checkResult.isCorrect
                ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <span className="text-base">{checkResult.isCorrect ? '🎉' : '❌'}</span>
            <div className="leading-relaxed">{checkResult.feedback}</div>
          </div>
        )}
      </div>

      {/* 渐进式解锁：数学百分比探究与推导工作台 (仅在答对百分比或完成填空时解锁) */}
      <div className="bg-stone-900 text-amber-100 rounded-2xl p-5 border border-stone-800 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">
              📐 数学百分比转化与深度推导演练板
            </h3>
          </div>

          {/* 切换三种正规数学方法 */}
          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setMathTab('fraction');
                sound.playPop(480);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                mathTab === 'fraction'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isPercentSolved ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-stone-500" />}
              方法一：约分与百分配
            </button>
            <button
              onClick={() => {
                setMathTab('grid100');
                sound.playPop(500);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                mathTab === 'grid100'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isPercentSolved ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-stone-500" />}
              方法二：百格图直观对应
            </button>
            <button
              onClick={() => {
                setMathTab('division');
                sound.playPop(520);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                mathTab === 'division'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isPercentSolved ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-stone-500" />}
              方法三：竖式除法化百分比
            </button>
          </div>
        </div>

        {/* 锁定提示 或 对应方法的详细数学板书 */}
        {!isPercentSolved ? (
          <div className="p-8 bg-stone-950 rounded-xl border border-stone-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-amber-400 mb-1">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-300">
              请先在上方算式卡槽中填入正确的百分比结果 (50%)
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              自主探究并填入答案后，系统将解锁<strong className="text-amber-400">约分化简、百格图直观模型、竖式除法化百分比</strong>等三大正规数学推导工作台！
            </p>
          </div>
        ) : (
          <div className="p-4 bg-stone-950 rounded-xl border border-emerald-900/60 animate-fade-in shadow-inner">
            <div className="text-[11px] text-emerald-400 mb-3 font-sans font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 已解锁：标准数学百分比转化与多维度推导过程
            </div>

            {mathTab === 'fraction' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* 分数约分数学公式 */}
                <div className="flex flex-col items-center justify-center p-4 bg-stone-900/90 rounded-xl border border-stone-800 font-mono">
                  <div className="text-xs text-amber-400/80 mb-3 font-sans font-bold">
                    标准分数约分与百分比转化步骤：
                  </div>
                  
                  <div className="flex items-center gap-3 text-base sm:text-lg text-amber-200">
                    {/* 原分数 20/40 */}
                    <div className="flex flex-col items-center">
                      <span>20</span>
                      <div className="w-8 h-0.5 bg-amber-400"></div>
                      <span>40</span>
                    </div>

                    <span className="text-stone-400 text-sm">=</span>

                    {/* 约分除以 20 */}
                    <div className="flex flex-col items-center text-sm">
                      <span className="text-amber-300">20 ÷ 20</span>
                      <div className="w-16 h-0.5 bg-amber-400"></div>
                      <span className="text-amber-300">40 ÷ 20</span>
                    </div>

                    <span className="text-stone-400 text-sm">=</span>

                    {/* 最简分数 1/2 */}
                    <div className="flex flex-col items-center font-bold text-amber-400">
                      <span>1</span>
                      <div className="w-6 h-0.5 bg-amber-400"></div>
                      <span>2</span>
                    </div>

                    <span className="text-stone-400 text-sm">× 100% =</span>

                    {/* 最终 50% */}
                    <span className="text-xl font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/50">
                      50%
                    </span>
                  </div>
                </div>

                {/* 文字说明 */}
                <div className="space-y-2 text-xs text-stone-300 leading-relaxed font-sans">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" /> 约分与百分比法则：
                  </div>
                  <p>1. <strong>列出数量比</strong>：第二回合数量作分子，总数量作分母，写出分数 <code>20 / 40</code>。</p>
                  <p>2. <strong>分子分母同时约分</strong>：分子与分母同除以最大公因数 20，化为最简分数 <code>1 / 2</code>。</p>
                  <p>3. <strong>乘 100%</strong>：最简分数 <code>1/2 × 100% = 50%</code>。</p>
                </div>
              </div>
            )}

            {mathTab === 'grid100' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* 100 格网格图 (50 格金色点亮) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-stone-900/90 rounded-xl border border-stone-800">
                  <div className="text-[11px] text-amber-400/80 mb-2 font-sans font-bold">
                    百格图：100 格中有 50 格被覆盖 (50/100 = 50%)
                  </div>
                  <div className="grid grid-cols-10 gap-0.5 w-44 h-44 bg-stone-950 p-1 rounded-lg border border-stone-700">
                    {[...Array(100)].map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[1px] transition-colors ${
                          i < 50 ? 'bg-amber-400 shadow-2xs' : 'bg-stone-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* 百分格图解析 */}
                <div className="md:col-span-7 space-y-2 text-xs text-stone-300 leading-relaxed font-sans">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5" /> 百格图概念直观理解：
                  </div>
                  <p>• 百分数（$\%$）表示「每一百份中有多少份」。</p>
                  <p>• <code>20 / 40</code> 相当于「每 40 张中有 20 张」，占比恰好是<strong>一半 (1/2)</strong>。</p>
                  <p>• 对应到 100 格中就是 <strong>50 格</strong>，即 <code>50 / 100 = 50%</code>。</p>
                </div>
              </div>
            )}

            {mathTab === 'division' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* 竖式除法板 20 ÷ 40 = 0.50 */}
                <div className="p-4 bg-stone-900/90 rounded-xl border border-stone-800 font-mono flex flex-col items-center justify-center">
                  <div className="text-[11px] text-amber-400/80 mb-2 font-sans font-bold">
                    竖式除法：分子 ÷ 分母 = 小数 $\to$ 百分数
                  </div>
                  
                  <div className="text-base sm:text-lg leading-relaxed tracking-wider text-amber-200">
                    <div className="flex justify-end pr-1 text-amber-400 font-bold">
                      <span>{divisionStep >= 1 ? '0.' : '  '}</span>
                      <span>{divisionStep >= 2 ? '5' : ' '}</span>
                      <span>{divisionStep >= 3 ? '0' : ' '}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-amber-300 font-bold mr-1">40</span>
                      <div className="border-t-2 border-l-2 border-amber-300/80 pl-2 rounded-tl-sm">
                        <span>2 0 . 0 0</span>
                      </div>
                    </div>
                    {divisionStep >= 2 && (
                      <>
                        <div className="text-right pr-4 text-stone-400 border-b border-stone-700">
                          - 2 0 . 0
                        </div>
                        <div className="text-right pr-4 text-emerald-400 font-bold border-b-2 border-double border-emerald-400">
                          0
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-amber-300 font-bold mt-2 font-mono">
                    0.50 = 50%
                  </div>
                </div>

                {/* 竖式步骤 */}
                <div className="space-y-2 text-xs text-stone-300 leading-relaxed font-sans">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Divide className="w-3.5 h-3.5" /> 竖式除法计算步骤：
                  </div>
                  <p>1. 20 不够被 40 除，商的个位写 <strong>0</strong> 并点上小数点。</p>
                  <p>2. 被除数末尾添 0 变为 200，<code>200 ÷ 40 = 5</code>，写在十分位。</p>
                  <p>3. 得到小数 <code>0.5</code>（即 <code>0.50</code>），转化为百分数为 <strong>50%</strong>。</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
