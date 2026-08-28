import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, Plus, Calculator, Divide, Layers, Lock, Unlock, ArrowRight } from 'lucide-react';

export const Question6UnitaryMethod: React.FC = () => {
  // 右侧已放置的练习簿数量 (0..8)
  const [rightBooksCount, setRightBooksCount] = useState<number>(0);

  // 答题候选卡片
  const PRICE_CARDS = ['2.50', '5', '8', '12.50', '20.00', '10.00', '15.00', '2.00'];

  // 卡槽状态: Step 1 (单价) 与 Step 2 (总价)
  const [slotStep1Total, setSlotStep1Total] = useState<string | null>(null); // '12.50'
  const [slotStep1Qty, setSlotStep1Qty] = useState<string | null>(null);     // '5'
  const [slotUnitPrice, setSlotUnitPrice] = useState<string | null>(null);   // '2.50'

  const [slotStep2Qty, setSlotStep2Qty] = useState<string | null>(null);     // '8'
  const [slotStep2UnitPrice, setSlotStep2UnitPrice] = useState<string | null>(null); // '2.50'
  const [slotFinalTotal, setSlotFinalTotal] = useState<string | null>(null); // '20.00'

  const [checkResult, setCheckResult] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  // 竖式演算展示切换 (Tab: 竖式除法 | 竖式乘法)
  const [mathWorkbenchTab, setMathWorkbenchTab] = useState<'division' | 'multiplication'>('division');
  const [divisionStep, setDivisionStep] = useState<number>(3); // 1..3 步进
  const [multiplicationStep, setMultiplicationStep] = useState<number>(3); // 1..3 步进

  // 状态检查：是否达成 Step 1（单价）或 Step 2（总价）的正确填空
  const isStep1Correct =
    (slotStep1Total === '12.50' && slotStep1Qty === '5' && (slotUnitPrice === '2.50' || slotUnitPrice === '2.5')) ||
    slotUnitPrice === '2.50';

  const isStep2Correct =
    (slotStep2Qty === '8' && (slotStep2UnitPrice === '2.50' || slotStep2UnitPrice === '2.5') && (slotFinalTotal === '20.00' || slotFinalTotal === '20')) ||
    slotFinalTotal === '20.00' || slotFinalTotal === '20';

  // 添加一本到右侧
  const handleAddOneBook = () => {
    if (rightBooksCount < 8) {
      sound.playPop(520 + rightBooksCount * 30);
      const nextCount = rightBooksCount + 1;
      setRightBooksCount(nextCount);
      if (nextCount === 8) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  // 填满8本
  const handleFillAllEight = () => {
    sound.playSuccess();
    setRightBooksCount(8);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // 清空右侧
  const handleClearRight = () => {
    sound.playPop(350);
    setRightBooksCount(0);
  };

  // 拖拽放入处理
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
    slotName: 's1_total' | 's1_qty' | 'unit_price' | 's2_qty' | 's2_unit' | 'final_total'
  ) => {
    e.preventDefault();
    const val = e.dataTransfer.getData('text/plain');
    if (val) {
      sound.playPop(580);
      if (slotName === 's1_total') setSlotStep1Total(val);
      else if (slotName === 's1_qty') setSlotStep1Qty(val);
      else if (slotName === 'unit_price') {
        setSlotUnitPrice(val);
        if (val === '2.50' || val === '2.5') {
          sound.playSuccess();
        }
      }
      else if (slotName === 's2_qty') setSlotStep2Qty(val);
      else if (slotName === 's2_unit') setSlotStep2UnitPrice(val);
      else if (slotName === 'final_total') {
        setSlotFinalTotal(val);
        if (val === '20.00' || val === '20') {
          sound.playSuccess();
        }
      }
    }
  };

  // 点击卡片填充到下一个空槽
  const handleCardClick = (val: string) => {
    sound.playPop(520);
    if (!slotStep1Total && val === '12.50') setSlotStep1Total(val);
    else if (!slotStep1Qty && val === '5') setSlotStep1Qty(val);
    else if (!slotUnitPrice && val === '2.50') {
      setSlotUnitPrice(val);
      sound.playSuccess();
    }
    else if (!slotStep2Qty && val === '8') setSlotStep2Qty(val);
    else if (!slotStep2UnitPrice && val === '2.50') setSlotStep2UnitPrice(val);
    else if (!slotFinalTotal && val === '20.00') {
      setSlotFinalTotal(val);
      sound.playSuccess();
    }
    else {
      // 循环填入未满的
      if (!slotStep1Total) setSlotStep1Total(val);
      else if (!slotStep1Qty) setSlotStep1Qty(val);
      else if (!slotUnitPrice) setSlotUnitPrice(val);
      else if (!slotStep2Qty) setSlotStep2Qty(val);
      else if (!slotStep2UnitPrice) setSlotStep2UnitPrice(val);
      else if (!slotFinalTotal) setSlotFinalTotal(val);
    }
  };

  // 移除指定卡槽
  const handleRemoveSlot = (
    slotName: 's1_total' | 's1_qty' | 'unit_price' | 's2_qty' | 's2_unit' | 'final_total',
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    sound.playPop(380);
    if (slotName === 's1_total') setSlotStep1Total(null);
    else if (slotName === 's1_qty') setSlotStep1Qty(null);
    else if (slotName === 'unit_price') setSlotUnitPrice(null);
    else if (slotName === 's2_qty') setSlotStep2Qty(null);
    else if (slotName === 's2_unit') setSlotStep2UnitPrice(null);
    else if (slotName === 'final_total') setSlotFinalTotal(null);
  };

  // 校验答案
  const handleCheckAnswer = () => {
    const s1Ok = slotUnitPrice === '2.50' || slotUnitPrice === '2.5';
    const s2Ok = slotFinalTotal === '20.00' || slotFinalTotal === '20';
    const s1EquOk = slotStep1Total === '12.50' && slotStep1Qty === '5';
    const s2EquOk = slotStep2Qty === '8' && (slotStep2UnitPrice === '2.50' || slotStep2UnitPrice === '2.5');

    if (s1Ok && s2Ok && s1EquOk && s2EquOk) {
      setCheckResult({
        checked: true,
        isCorrect: true,
        feedback: '🎉 回答完全正确！你成功运用归一法计算出 8 本练习簿的总价格为 RM20.00。',
      });
      sound.playSuccess();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else if (s1Ok && s2Ok) {
      setCheckResult({
        checked: true,
        isCorrect: true,
        feedback: '🎉 最终数值正确！请确保算式中的每项数据（12.50, 5, 8）都放置完整。',
      });
      sound.playSuccess();
    } else {
      setCheckResult({
        checked: true,
        isCorrect: false,
        feedback: '❌ 算式或结果有误，请利用上方操作与思考仔细验算。',
      });
      sound.playGentleError();
    }
  };

  // 重置
  const handleReset = () => {
    setRightBooksCount(0);
    setSlotStep1Total(null);
    setSlotStep1Qty(null);
    setSlotUnitPrice(null);
    setSlotStep2Qty(null);
    setSlotStep2UnitPrice(null);
    setSlotFinalTotal(null);
    setCheckResult(null);
    sound.playPop(350);
  };

  // 单书 SVG 渲染器
  const renderBookSvg = (index: number, isFilled: boolean, priceLabel?: string) => {
    const colors = [
      { cover: '#3B82F6', spine: '#1D4ED8', accent: '#93C5FD' }, // 蓝
      { cover: '#10B981', spine: '#047857', accent: '#6EE7B7' }, // 绿
      { cover: '#F59E0B', spine: '#B45309', accent: '#FDE68A' }, // 橙黄
      { cover: '#8B5CF6', spine: '#6D28D9', accent: '#C4B5FD' }, // 紫
      { cover: '#EC4899', spine: '#BE185D', accent: '#FBCFE8' }, // 粉
      { cover: '#06B6D4', spine: '#0E7490', accent: '#A5F3FC' }, // 青
      { cover: '#E11D48', spine: '#9F1239', accent: '#FECDD3' }, // 红
      { cover: '#84CC16', spine: '#4D7C0F', accent: '#D9F99D' }, // 柠檬绿
    ];
    const c = colors[index % colors.length];

    if (!isFilled) {
      // 半透明轮廓
      return (
        <svg viewBox="0 0 80 100" className="w-full h-full opacity-35 hover:opacity-50 transition">
          <rect
            x="8"
            y="6"
            width="64"
            height="86"
            rx="4"
            fill="#FAF8EE"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <line x1="20" y1="6" x2="20" y2="92" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="26" y1="30" x2="60" y2="30" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="26" y1="45" x2="55" y2="45" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="26" y1="60" x2="48" y2="60" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="40" y="55" fontSize="16" fill="#94A3B8" textAnchor="middle" fontWeight="bold">
            +
          </text>
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-sm select-none transition-all duration-300 hover:scale-105">
        {/* 练习簿阴影 */}
        <rect x="10" y="9" width="64" height="86" rx="4" fill="rgba(0,0,0,0.08)" />

        {/* 练习簿内页边缘 (立体厚度) */}
        <rect x="9" y="8" width="63" height="85" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="70" y1="12" x2="70" y2="90" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="71" y1="14" x2="71" y2="88" stroke="#E2E8F0" strokeWidth="1" />

        {/* 练习簿封面 */}
        <rect x="6" y="6" width="64" height="86" rx="4" fill={c.cover} />

        {/* 书脊装订带 */}
        <path d="M 6 6 L 16 6 L 16 92 L 6 92 Z" fill={c.spine} />
        {/* 书脊装订缝线 */}
        <line x1="11" y1="8" x2="11" y2="90" stroke={c.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />

        {/* 封面中央白色标签贴纸 */}
        <rect x="22" y="24" width="42" height="34" rx="3" fill="#FFFFFF" stroke={c.spine} strokeWidth="1" />
        {/* 标签标题文字 */}
        <text x="43" y="36" fontSize="7.5" fontWeight="bold" fill="#334155" textAnchor="middle" fontFamily="sans-serif">
          数学练习簿
        </text>
        {/* 标签装饰横线 */}
        <line x1="26" y1="41" x2="60" y2="41" stroke={c.accent} strokeWidth="1" />
        <line x1="26" y1="48" x2="52" y2="48" stroke="#E2E8F0" strokeWidth="1" />

        {/* 价格标签徽章 */}
        {priceLabel && (
          <g>
            <rect x="18" y="65" width="50" height="20" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="43" y="79" fontSize="10.5" fontWeight="bold" fill="#78350F" textAnchor="middle" fontFamily="monospace">
              {priceLabel}
            </text>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-5">
      {/* 题目说明卡片 */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-extrabold">
              第 6 题
            </span>
            <span className="text-xs text-stone-500 font-bold">归一法与比例计算</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-[#FEF3C7] px-2.5 py-1 rounded-md border border-[#FDE68A]">
            [2 分]
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug">
          图 4 显示 5 本相同的数学练习簿的总价格为 RM12.50。
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          计算 <strong className="text-amber-800 font-extrabold font-mono">8 本</strong> 相同练习簿的总价格。请自主将数字卡片拖入算式，正确填入后将解锁对应的标准数学竖式推导演练！
        </p>
      </div>

      {/* 探索展示区：左侧 5 本 与 右侧 8 本 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：图 4（5 本练习簿，总价 RM12.50） */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-stone-700 bg-[#FAF8EE] px-3 py-1 rounded-lg border border-[#E5DFC9]">
                图 4：5 本练习簿
              </span>
              <span className="text-xs font-mono font-extrabold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                总计 RM 12.50
              </span>
            </div>

            {/* 5 本书水平排列展示 */}
            <div className="grid grid-cols-5 gap-2 p-3 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9] min-h-[140px] items-center">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full aspect-[4/5] max-w-[70px]">
                    {renderBookSvg(idx, true)}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-stone-500 mt-1">第 {idx + 1} 本</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EBD8] text-xs text-stone-600 flex items-center justify-between">
            <span>5 本总额：<strong className="text-stone-900 font-mono">RM 12.50</strong></span>
            <span className="text-amber-700 font-medium">1 本 = RM12.50 ÷ 5</span>
          </div>
        </div>

        {/* 右侧：目标 8 本练习簿探索区 */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-stone-700 bg-[#FAF8EE] px-3 py-1 rounded-lg border border-[#E5DFC9]">
                目标探索：8 本练习簿
              </span>
              <span className="text-xs font-mono font-extrabold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                当前放置：{rightBooksCount} / 8 本
              </span>
            </div>

            {/* 8 本书网格排列展示 */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 p-3 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9] min-h-[140px] items-center">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                const isFilled = idx < rightBooksCount;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isFilled) {
                        setRightBooksCount(idx);
                        sound.playPop(400);
                      } else {
                        setRightBooksCount(idx + 1);
                        sound.playPop(520 + idx * 30);
                      }
                    }}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="w-full aspect-[4/5] max-w-[65px]">
                      {renderBookSvg(idx, isFilled)}
                    </div>
                    <span className={`text-[10px] font-mono font-bold mt-1 ${isFilled ? 'text-amber-800' : 'text-stone-400'}`}>
                      {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧交互操作按钮栏 */}
          <div className="mt-4 pt-3 border-t border-[#F0EBD8] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddOneBook}
                disabled={rightBooksCount >= 8}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs ${
                  rightBooksCount >= 8
                    ? 'bg-[#F4F0DE] text-stone-400 border border-[#DDD7C0] cursor-not-allowed'
                    : 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-amber-950 border border-[#FDE68A]'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                + 1 本
              </button>

              <button
                onClick={handleFillAllEight}
                className="py-2 px-3 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
              >
                一键铺满 8 本
              </button>
            </div>

            {rightBooksCount > 0 && (
              <button
                onClick={handleClearRight}
                className="text-xs text-stone-500 hover:text-stone-800 py-1.5 px-2.5 rounded-lg hover:bg-stone-100 transition"
              >
                清空
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 拖拽式答题与算式卡槽区 (前置：探索并填入算式) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5DFC9] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EBD8] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-bold">✍️</span>
            <h3 className="text-sm font-bold text-stone-900">算式填空：将数字卡片拖入或点击填入算式槽位</h3>
          </div>
          {(slotStep1Total || slotStep1Qty || slotUnitPrice || slotStep2Qty || slotStep2UnitPrice || slotFinalTotal) && (
            <button
              onClick={() => {
                setSlotStep1Total(null);
                setSlotStep1Qty(null);
                setSlotUnitPrice(null);
                setSlotStep2Qty(null);
                setSlotStep2UnitPrice(null);
                setSlotFinalTotal(null);
                sound.playPop(350);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              清空卡槽
            </button>
          )}
        </div>

        {/* 步骤 1 与 步骤 2 算式槽位 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 槽位: RM [12.50] ÷ [5] = RM [2.50] */}
          <div className={`p-4 rounded-xl border transition-all ${isStep1Correct ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#FAF8EE] border-[#E5DFC9]'} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">步骤一：求 1 本练习簿的价格</span>
              {isStep1Correct && (
                <span className="text-[10px] bg-emerald-100 text-teal-900 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-600" /> 除法竖式已解锁
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 bg-white rounded-lg border border-[#DDD7C0]">
              <span className="text-xs font-bold text-stone-700">RM</span>
              {/* 总金额槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 's1_total')}
                onClick={() => slotStep1Total && handleRemoveSlot('s1_total')}
                className={`min-w-[50px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotStep1Total
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入总金额"
              >
                {slotStep1Total || '总额?'}
              </div>

              <span className="text-stone-500 font-bold text-sm">÷</span>

              {/* 本数槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 's1_qty')}
                onClick={() => slotStep1Qty && handleRemoveSlot('s1_qty')}
                className={`min-w-[40px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotStep1Qty
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入本数"
              >
                {slotStep1Qty || '本数?'}
              </div>

              <span className="text-stone-700 font-bold text-sm">= RM</span>

              {/* 单价结果槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'unit_price')}
                onClick={() => slotUnitPrice && handleRemoveSlot('unit_price')}
                className={`min-w-[54px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotUnitPrice
                    ? isStep1Correct
                      ? 'border-emerald-500 bg-emerald-50 text-teal-950 font-mono font-extrabold text-sm'
                      : 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入单价"
              >
                {slotUnitPrice || '单价?'}
              </div>
            </div>
          </div>

          {/* Step 2 槽位: [8] × RM [2.50] = RM [20.00] */}
          <div className={`p-4 rounded-xl border transition-all ${isStep2Correct ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#FAF8EE] border-[#E5DFC9]'} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">步骤二：求 8 本练习簿的总价格</span>
              {isStep2Correct && (
                <span className="text-[10px] bg-emerald-100 text-teal-900 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-600" /> 乘法竖式已解锁
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 bg-white rounded-lg border border-[#DDD7C0]">
              {/* 8 本槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 's2_qty')}
                onClick={() => slotStep2Qty && handleRemoveSlot('s2_qty')}
                className={`min-w-[40px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotStep2Qty
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入 8"
              >
                {slotStep2Qty || '8?'}
              </div>

              <span className="text-stone-500 font-bold text-sm">× RM</span>

              {/* 单价槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 's2_unit')}
                onClick={() => slotStep2UnitPrice && handleRemoveSlot('s2_unit')}
                className={`min-w-[50px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotStep2UnitPrice
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入单价"
              >
                {slotStep2UnitPrice || '单价?'}
              </div>

              <span className="text-stone-700 font-bold text-sm">= RM</span>

              {/* 最终总价槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'final_total')}
                onClick={() => slotFinalTotal && handleRemoveSlot('final_total')}
                className={`min-w-[58px] h-10 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotFinalTotal
                    ? isStep2Correct
                      ? 'border-emerald-500 bg-stone-900 text-amber-300 font-mono font-extrabold text-sm shadow-xs'
                      : 'border-amber-400 bg-amber-50 text-amber-950 font-mono font-extrabold text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] text-stone-400 text-[11px] font-bold hover:border-amber-400'
                }`}
                title="拖入或填入总价"
              >
                {slotFinalTotal || '总价?'}
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
            {PRICE_CARDS.map((val) => {
              const isUsed =
                slotStep1Total === val ||
                slotStep1Qty === val ||
                slotUnitPrice === val ||
                slotStep2Qty === val ||
                slotStep2UnitPrice === val ||
                slotFinalTotal === val;

              return (
                <button
                  key={val}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, val)}
                  onClick={() => handleCardClick(val)}
                  className={`min-w-[44px] h-9 px-3 text-xs font-mono font-extrabold rounded-lg border transition shadow-2xs cursor-grab active:cursor-grabbing active:scale-95 flex items-center justify-center ${
                    isUsed
                      ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                      : 'bg-white text-stone-800 border-[#DDD7C0] hover:border-amber-400 hover:bg-[#FFFBEB]'
                  }`}
                >
                  {val.includes('.') ? `RM ${val}` : val}
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

      {/* 渐进式解锁：数学标准竖式计算推导板 (可视化仅在正确填入时解锁呈现) */}
      <div className="bg-stone-900 text-amber-100 rounded-2xl p-5 border border-stone-800 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">
              📐 标准数学竖式演算板 (Vertical Calculations)
            </h3>
          </div>

          {/* 切换除法与乘法竖式 */}
          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setMathWorkbenchTab('division');
                sound.playPop(480);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mathWorkbenchTab === 'division'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isStep1Correct ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-stone-500" />}
              步骤一：竖式除法 (12.50 ÷ 5)
            </button>
            <button
              onClick={() => {
                setMathWorkbenchTab('multiplication');
                sound.playPop(520);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mathWorkbenchTab === 'multiplication'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {isStep2Correct ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-stone-500" />}
              步骤二：竖式乘法 (2.50 × 8)
            </button>
          </div>
        </div>

        {/* 根据是否正确放置动态呈现 */}
        {mathWorkbenchTab === 'division' ? (
          !isStep1Correct ? (
            /* 未解锁步骤一的除法竖式状态 */
            <div className="p-8 bg-stone-950 rounded-xl border border-stone-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-amber-400 mb-1">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-300">
                请先在上方【步骤一】算式卡槽中填入正确的单价 (RM 2.50)
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                自主思考或通过模型探索单价后，系统将解锁标准的<strong className="text-amber-400">长除法（Long Division）竖式</strong>演算过程与落位法则！
              </p>
            </div>
          ) : (
            /* 步骤一解锁：除法竖式展示区 */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-fade-in">
              {/* 竖式除法板 */}
              <div className="md:col-span-6 bg-stone-950 p-4 rounded-xl border border-emerald-900/60 font-mono flex flex-col items-center justify-center shadow-inner">
                <div className="text-[11px] text-emerald-400 mb-2 font-sans font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已解锁：小数竖式除法演算（商的小数点与被除数对齐）
                </div>
                
                {/* 竖式除法数学结构 */}
                <div className="text-base sm:text-lg leading-relaxed tracking-wider text-amber-200">
                  <div className="flex justify-end pr-1 text-amber-400 font-bold">
                    <span>{divisionStep >= 1 ? '2.' : '  '}</span>
                    <span>{divisionStep >= 2 ? '5' : ' '}</span>
                    <span>{divisionStep >= 3 ? '0' : ' '}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-amber-300 font-bold mr-1">5</span>
                    <div className="border-t-2 border-l-2 border-amber-300/80 pl-2 rounded-tl-sm">
                      <span>1 2 . 5 0</span>
                    </div>
                  </div>
                  {divisionStep >= 1 && (
                    <>
                      <div className="text-right pr-6 text-stone-400 border-b border-stone-700">
                        - 1 0
                      </div>
                      <div className="text-right pr-6">
                        2 . 5
                      </div>
                    </>
                  )}
                  {divisionStep >= 2 && (
                    <>
                      <div className="text-right pr-3 text-stone-400 border-b border-stone-700">
                        - 2 . 5
                      </div>
                      <div className="text-right pr-3">
                        0 0
                      </div>
                    </>
                  )}
                  {divisionStep >= 3 && (
                    <div className="text-right pr-1 text-emerald-400 font-bold border-b-2 border-double border-emerald-400">
                      0
                    </div>
                  )}
                </div>
              </div>

              {/* 步进解析与控制 */}
              <div className="md:col-span-6 space-y-3 font-sans">
                <div className="text-xs text-stone-300 space-y-1.5 leading-relaxed bg-stone-800/60 p-3.5 rounded-xl border border-stone-700/60">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Divide className="w-3.5 h-3.5" /> 竖式除法步骤：
                  </div>
                  <p>1. 12 除以 5 商 <strong>2</strong>，余 <strong>2</strong>；商的小数点与被除数小数点对齐。</p>
                  <p>2. 落下十分位上的 5，组成 25，25 除以 5 商 <strong>5</strong>。</p>
                  <p>3. 落下百分位上的 0，商 <strong>0</strong>，整除无余数，求得单价为 <strong>RM 2.50</strong>。</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDivisionStep((prev) => (prev > 1 ? prev - 1 : 3));
                      sound.playPop(420);
                    }}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => {
                      setDivisionStep((prev) => (prev < 3 ? prev + 1 : 1));
                      sound.playPop(520);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    下一步演算
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          !isStep2Correct ? (
            /* 未解锁步骤二的乘法竖式状态 */
            <div className="p-8 bg-stone-950 rounded-xl border border-stone-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-amber-400 mb-1">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-stone-300">
                请先在上方【步骤二】算式卡槽中填入正确的总价 (RM 20.00)
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                完成总价计算后，系统将解锁标准的<strong className="text-amber-400">小数竖式乘法（Vertical Multiplication）</strong>推导演练！
              </p>
            </div>
          ) : (
            /* 步骤二解锁：乘法竖式展示区 */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-fade-in">
              {/* 竖式乘法板 */}
              <div className="md:col-span-6 bg-stone-950 p-4 rounded-xl border border-emerald-900/60 font-mono flex flex-col items-center justify-center shadow-inner">
                <div className="text-[11px] text-emerald-400 mb-2 font-sans font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已解锁：小数竖式乘法（末位对齐，积点出两位小数）
                </div>
                
                {/* 竖式乘法数学结构 */}
                <div className="text-base sm:text-lg leading-relaxed tracking-wider text-amber-200 text-right pr-6">
                  <div>2 . 5 0</div>
                  <div className="flex items-center justify-end gap-2 border-b-2 border-amber-300/80 pb-0.5">
                    <span className="text-amber-400 font-bold">×</span>
                    <span>8</span>
                  </div>
                  <div className="text-amber-400 font-extrabold text-xl pt-1 border-b-2 border-double border-amber-400">
                    {multiplicationStep >= 3 ? '2 0 . 0 0' : multiplicationStep === 2 ? '2 0 . 0 _' : '2 _ . _ _'}
                  </div>
                </div>
              </div>

              {/* 乘法步进解析与控制 */}
              <div className="md:col-span-6 space-y-3 font-sans">
                <div className="text-xs text-stone-300 space-y-1.5 leading-relaxed bg-stone-800/60 p-3.5 rounded-xl border border-stone-700/60">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> 竖式乘法步骤：
                  </div>
                  <p>1. 末位对齐：先按整数乘法计算 <code>250 × 8 = 2000</code>。</p>
                  <p>2. 因数 <code>2.50</code> 中共有 <strong>两位小数</strong>。</p>
                  <p>3. 从积的右边起数出两位，点上小数点，得到最终总价为 <strong>RM 20.00</strong>。</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMultiplicationStep((prev) => (prev > 1 ? prev - 1 : 3));
                      sound.playPop(420);
                    }}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => {
                      setMultiplicationStep((prev) => (prev < 3 ? prev + 1 : 1));
                      sound.playPop(520);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    下一步演算
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
