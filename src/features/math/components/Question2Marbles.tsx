import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, Layers, GripHorizontal } from 'lucide-react';

interface MarbleBox {
  id: number;
  boxLit: boolean;
  marblesLit: [boolean, boolean, boolean];
}

const AVAILABLE_CARDS = [6, 3, 18, 2, 9, 12];

export const Question2Marbles: React.FC = () => {
  // 6 个方框及其内部 3 粒弹珠的点亮状态 (默认全不点亮: default no light up)
  const [boxes, setBoxes] = useState<MarbleBox[]>([
    { id: 1, boxLit: false, marblesLit: [false, false, false] },
    { id: 2, boxLit: false, marblesLit: [false, false, false] },
    { id: 3, boxLit: false, marblesLit: [false, false, false] },
    { id: 4, boxLit: false, marblesLit: [false, false, false] },
    { id: 5, boxLit: false, marblesLit: [false, false, false] },
    { id: 6, boxLit: false, marblesLit: [false, false, false] },
  ]);

  // 三个填空框中的数字状态 [slot1, slot2, slot3] -> [组数, 每组数量, 总数]
  const [slot1, setSlot1] = useState<number | null>(null);
  const [slot2, setSlot2] = useState<number | null>(null);
  const [slot3, setSlot3] = useState<number | null>(null);

  // 选中的手牌（支持点击放入，也支持拖拽）
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 点击方框切换方框点亮状态
  const toggleBox = (boxIndex: number) => {
    sound.playMarble();
    setBoxes((prev) => {
      const next = [...prev];
      const current = next[boxIndex];
      const newBoxLit = !current.boxLit;
      next[boxIndex] = {
        ...current,
        boxLit: newBoxLit,
        // 如果点亮方框但弹珠还全灭，保持弹珠状态；如果熄灭方框，可保持或同步
        marblesLit: newBoxLit ? current.marblesLit : [false, false, false],
      };
      return next;
    });
  };

  // 点击单颗弹珠切换点亮状态
  const toggleMarble = (boxIndex: number, marbleIndex: 0 | 1 | 2, e: React.MouseEvent) => {
    e.stopPropagation(); // 避免触发外层方框点击
    sound.playMarble();
    setBoxes((prev) => {
      const next = [...prev];
      const current = next[boxIndex];
      const nextMarbles = [...current.marblesLit] as [boolean, boolean, boolean];
      nextMarbles[marbleIndex] = !nextMarbles[marbleIndex];
      // 如果点击弹珠，自动确保该方框也被点亮
      next[boxIndex] = {
        ...current,
        boxLit: true,
        marblesLit: nextMarbles,
      };
      return next;
    });
  };

  // 一键点亮所有方框
  const lightUpAllBoxes = () => {
    sound.playPop(520);
    setBoxes((prev) => prev.map((b) => ({ ...b, boxLit: true })));
  };

  // 一键点亮全部 18 粒弹珠
  const lightUpAllMarbles = () => {
    sound.playPop(640);
    setBoxes((prev) =>
      prev.map((b) => ({
        ...b,
        boxLit: true,
        marblesLit: [true, true, true],
      }))
    );
  };

  // 全部熄灭 (重置为默认状态)
  const turnOffAll = () => {
    sound.playPop(340);
    setBoxes((prev) =>
      prev.map((b) => ({
        ...b,
        boxLit: false,
        marblesLit: [false, false, false],
      }))
    );
  };

  // 放入卡片到槽位
  const placeCardInSlot = (slotIndex: 1 | 2 | 3, value: number) => {
    sound.playPop(520);
    setValidationError(null);
    if (slotIndex === 1) setSlot1(value);
    if (slotIndex === 2) setSlot2(value);
    if (slotIndex === 3) setSlot3(value);
    setSelectedCard(null);
  };

  // 清除某个槽位
  const clearSlot = (slotIndex: 1 | 2 | 3) => {
    sound.playPop(380);
    if (slotIndex === 1) setSlot1(null);
    if (slotIndex === 2) setSlot2(null);
    if (slotIndex === 3) setSlot3(null);
    setIsCompleted(false);
    setValidationError(null);
  };

  // 检查算式
  const handleCheck = () => {
    if (slot1 === null || slot2 === null || slot3 === null) {
      setValidationError('请将所有三个方框填满数字卡片哦！');
      sound.playGentleError();
      return;
    }

    // 题目规范：第一个框为 6 (组数)，第二个框为 3 (每组数量)，第三个框为 18 (总数)
    if (slot1 === 6 && slot2 === 3 && slot3 === 18) {
      setIsCompleted(true);
      setValidationError(null);
      sound.playSuccess();
      lightUpAllMarbles();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#facc15'],
      });
    } else {
      setIsCompleted(false);
      sound.playGentleError();
      if (slot1 !== 6) {
        setValidationError('第 1 个框填的是「组数」（一共有几个框呢？）');
      } else if (slot2 !== 3) {
        setValidationError('第 2 个框填的是「每组数量」（每个框里有几粒弹珠？）');
      } else if (slot3 !== 18) {
        setValidationError('第 3 个框填的是「总数」（6 × 3 等于多少呢？）');
      }
    }
  };

  // 重置
  const handleReset = () => {
    setSlot1(null);
    setSlot2(null);
    setSlot3(null);
    setSelectedCard(null);
    setIsCompleted(false);
    setValidationError(null);
    setShowHint(false);
    turnOffAll();
  };

  // HTML5 拖拽事件支持
  const handleDragStart = (e: React.DragEvent, num: number) => {
    e.dataTransfer.setData('text/plain', String(num));
  };

  const handleDrop = (e: React.DragEvent, slotIndex: 1 | 2 | 3) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      placeCardInSlot(slotIndex, Number(data));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const activeLitBoxesCount = boxes.filter((b) => b.boxLit).length;
  const totalLitMarblesCount = boxes.reduce(
    (acc, b) => acc + b.marblesLit.filter(Boolean).length,
    0
  );

  return (
    <div id="question-2-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* 题目头部 (对应试卷第 2 题) */}
      <div id="q2-header-card" className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] text-amber-900 rounded-full text-xs font-bold tracking-wide mb-2 border border-[#FDE68A]">
              <Layers className="w-3.5 h-3.5 text-amber-700" /> 数与运算 · 第 2 题
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
              2. 完成算式。
            </h2>
            <p className="mt-1 text-stone-600 text-sm font-medium">
              观察图中的弹珠分组，在下方算式中填入正确的数字卡片：[ 组数 ] × [ 每组数量 ] = [ 总数 ]。
              <span className="ml-2 text-xs text-stone-400 font-mono">[2 分]</span>
            </p>
          </div>

          <button
            id="q2-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 bg-[#F4F0DE] hover:bg-[#EAE4CE] border border-[#DDD7C0] rounded-xl transition-all active:scale-95"
            title="重置本题"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>
      </div>

      {/* 弹珠展示区 (一排共 6 个方框，每框 3 粒精致 SVG 玻璃弹珠) */}
      <div className="bg-[#F8F6EB] rounded-2xl p-5 sm:p-6 border border-[#E5DFC9] shadow-xs flex flex-col items-center">
        {/* 顶部操作与状态栏 */}
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="text-xs font-bold text-stone-700 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DDD7C0] rounded-lg">
              <span className={`w-2.5 h-2.5 rounded-full ${activeLitBoxesCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'}`}></span>
              点亮方框: <strong className="text-stone-900">{activeLitBoxesCount}/6 组</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DDD7C0] rounded-lg">
              <span className={`w-2.5 h-2.5 rounded-full ${totalLitMarblesCount > 0 ? 'bg-teal-500 animate-pulse' : 'bg-stone-300'}`}></span>
              点亮弹珠: <strong className="text-stone-900">{totalLitMarblesCount}/18 粒</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={lightUpAllBoxes}
              className="text-xs font-bold text-stone-700 bg-white hover:bg-[#F4F0DE] px-2.5 py-1.5 rounded-xl border border-[#DDD7C0] transition shadow-xs cursor-pointer active:scale-95"
              title="一键点亮 6 个方框"
            >
              点亮 6 组方框
            </button>
            <button
              onClick={lightUpAllMarbles}
              className="text-xs font-bold text-amber-900 bg-[#FEF3C7] hover:bg-[#FDE68A] px-2.5 py-1.5 rounded-xl border border-[#FDE68A] transition shadow-xs cursor-pointer active:scale-95"
              title="一键点亮全部 18 粒弹珠"
            >
              点亮全部 18 粒弹珠
            </button>
            <button
              onClick={turnOffAll}
              className="text-xs font-bold text-stone-600 bg-[#FAF8EE] hover:bg-[#EFEAD6] px-2.5 py-1.5 rounded-xl border border-[#DDD7C0] transition shadow-xs cursor-pointer active:scale-95"
              title="熄灭所有方框与弹珠"
            >
              全部熄灭
            </button>
          </div>
        </div>

        {/* 6 个方框网格 (响应式排列：手机端 3x2，电脑端 6 列并排) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 my-2">
          {boxes.map((box, boxIdx) => {
            const isBoxLit = box.boxLit;
            const litMarblesInBox = box.marblesLit.filter(Boolean).length;

            return (
              <div
                key={box.id}
                id={`q2-marble-box-${box.id}`}
                onClick={() => toggleBox(boxIdx)}
                className={`relative aspect-square rounded-2xl p-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-between select-none ${
                  isBoxLit
                    ? 'bg-white border-2 border-amber-500 shadow-xs ring-4 ring-amber-100/80 scale-100'
                    : 'bg-[#FAF8EE]/80 border-2 border-dashed border-[#DDD7C0] hover:border-amber-400 hover:bg-[#FDFCF5] opacity-75 scale-98'
                }`}
                title={`第 ${box.id} 组 (点击切换方框点亮；点击框内弹珠点亮单粒)`}
              >
                {/* 组号标签 */}
                <div className="w-full flex items-center justify-between px-1">
                  <div
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                      isBoxLit
                        ? 'bg-[#FEF3C7] text-amber-900 border border-[#FDE68A]'
                        : 'bg-[#EAE4CE] text-stone-600'
                    }`}
                  >
                    第 {box.id} 组
                  </div>

                  <span className="text-[10px] font-mono font-bold text-stone-400">
                    {litMarblesInBox}/3
                  </span>
                </div>

                {/* SVG 绘制 3 粒弹珠 (品字形排列) */}
                <svg
                  viewBox="0 0 100 100"
                  className={`w-full h-full max-w-[86px] max-h-[86px] transition-transform duration-500 ${
                    isCompleted ? 'animate-bounce' : ''
                  }`}
                >
                  <defs>
                    {/* 点亮时的彩色玻璃质感渐变 */}
                    {/* 弹珠 1 渐变 (清新青绿翡翠) */}
                    <radialGradient id={`marble-grad-lit-1-${box.id}`} cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#d1fae5" />
                      <stop offset="40%" stopColor="#34d399" />
                      <stop offset="90%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </radialGradient>
                    {/* 弹珠 2 渐变 (天蓝蓝宝) */}
                    <radialGradient id={`marble-grad-lit-2-${box.id}`} cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#e0f2fe" />
                      <stop offset="40%" stopColor="#38bdf8" />
                      <stop offset="90%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </radialGradient>
                    {/* 弹珠 3 渐变 (蜜桃红宝) */}
                    <radialGradient id={`marble-grad-lit-3-${box.id}`} cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ffe4e6" />
                      <stop offset="40%" stopColor="#fb7185" />
                      <stop offset="90%" stopColor="#e11d48" />
                      <stop offset="100%" stopColor="#be123c" />
                    </radialGradient>

                    {/* 未点亮时的素雅磨砂玻璃渐变 */}
                    <radialGradient id={`marble-grad-unlit-${box.id}`} cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#f5f4ef" />
                      <stop offset="50%" stopColor="#e5e0d0" />
                      <stop offset="100%" stopColor="#cdc6b0" />
                    </radialGradient>
                  </defs>

                  {/* 弹珠投影 */}
                  <ellipse
                    cx="32"
                    cy="46"
                    rx="13"
                    ry="4"
                    fill={box.marblesLit[0] ? 'rgba(5,150,105,0.25)' : 'rgba(0,0,0,0.06)'}
                  />
                  <ellipse
                    cx="68"
                    cy="46"
                    rx="13"
                    ry="4"
                    fill={box.marblesLit[1] ? 'rgba(2,132,199,0.25)' : 'rgba(0,0,0,0.06)'}
                  />
                  <ellipse
                    cx="50"
                    cy="82"
                    rx="14"
                    ry="4.5"
                    fill={box.marblesLit[2] ? 'rgba(225,29,72,0.25)' : 'rgba(0,0,0,0.06)'}
                  />

                  {/* 弹珠 1 (左上) */}
                  <g
                    onClick={(e) => toggleMarble(boxIdx, 0, e)}
                    className="cursor-pointer transition-all duration-300 hover:scale-115 origin-[32px_36px]"
                  >
                    <circle
                      cx="32"
                      cy="36"
                      r="16"
                      fill={box.marblesLit[0] ? `url(#marble-grad-lit-1-${box.id})` : `url(#marble-grad-unlit-${box.id})`}
                      stroke={box.marblesLit[0] ? '#065f46' : '#a8a29e'}
                      strokeWidth={box.marblesLit[0] ? '1.5' : '1.2'}
                      strokeDasharray={box.marblesLit[0] ? 'none' : '3,2'}
                    />
                    {box.marblesLit[0] ? (
                      <>
                        <path d="M 22 36 Q 32 26 42 36 Q 32 46 22 36" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
                        <circle cx="27" cy="30" r="3.5" fill="white" opacity="0.85" />
                        <circle cx="34" cy="27" r="1.5" fill="white" opacity="0.6" />
                      </>
                    ) : (
                      <>
                        <circle cx="28" cy="31" r="2" fill="white" opacity="0.4" />
                        <text x="32" y="40" fontSize="10" fill="#78716c" textAnchor="middle" fontWeight="bold">?</text>
                      </>
                    )}
                  </g>

                  {/* 弹珠 2 (右上) */}
                  <g
                    onClick={(e) => toggleMarble(boxIdx, 1, e)}
                    className="cursor-pointer transition-all duration-300 hover:scale-115 origin-[68px_36px]"
                  >
                    <circle
                      cx="68"
                      cy="36"
                      r="16"
                      fill={box.marblesLit[1] ? `url(#marble-grad-lit-2-${box.id})` : `url(#marble-grad-unlit-${box.id})`}
                      stroke={box.marblesLit[1] ? '#075985' : '#a8a29e'}
                      strokeWidth={box.marblesLit[1] ? '1.5' : '1.2'}
                      strokeDasharray={box.marblesLit[1] ? 'none' : '3,2'}
                    />
                    {box.marblesLit[1] ? (
                      <>
                        <path d="M 58 36 Q 68 26 78 36 Q 68 46 58 36" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
                        <circle cx="63" cy="30" r="3.5" fill="white" opacity="0.85" />
                        <circle cx="70" cy="27" r="1.5" fill="white" opacity="0.6" />
                      </>
                    ) : (
                      <>
                        <circle cx="64" cy="31" r="2" fill="white" opacity="0.4" />
                        <text x="68" y="40" fontSize="10" fill="#78716c" textAnchor="middle" fontWeight="bold">?</text>
                      </>
                    )}
                  </g>

                  {/* 弹珠 3 (中下) */}
                  <g
                    onClick={(e) => toggleMarble(boxIdx, 2, e)}
                    className="cursor-pointer transition-all duration-300 hover:scale-115 origin-[50px_70px]"
                  >
                    <circle
                      cx="50"
                      cy="70"
                      r="17"
                      fill={box.marblesLit[2] ? `url(#marble-grad-lit-3-${box.id})` : `url(#marble-grad-unlit-${box.id})`}
                      stroke={box.marblesLit[2] ? '#9f1239' : '#a8a29e'}
                      strokeWidth={box.marblesLit[2] ? '1.5' : '1.2'}
                      strokeDasharray={box.marblesLit[2] ? 'none' : '3,2'}
                    />
                    {box.marblesLit[2] ? (
                      <>
                        <path d="M 39 70 Q 50 58 61 70 Q 50 82 39 70" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
                        <circle cx="44" cy="63" r="4" fill="white" opacity="0.85" />
                        <circle cx="53" cy="59" r="2" fill="white" opacity="0.6" />
                      </>
                    ) : (
                      <>
                        <circle cx="46" cy="65" r="2.5" fill="white" opacity="0.4" />
                        <text x="50" y="74" fontSize="11" fill="#78716c" textAnchor="middle" fontWeight="bold">?</text>
                      </>
                    )}
                  </g>
                </svg>

                {/* 底部交互指引与状态 */}
                <div className="text-[10px] font-bold text-center -mt-0.5">
                  {isBoxLit ? (
                    <span className="text-amber-800 font-semibold">
                      {litMarblesInBox === 3 ? '✨ 3 粒全亮' : `${litMarblesInBox} 粒点亮`}
                    </span>
                  ) : (
                    <span className="text-stone-400 font-normal">点击点亮框</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 提示文案与教学引导 */}
        <div className="w-full mt-3 p-3 bg-white rounded-xl border border-[#E5DFC9] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-bold">💡 互动探索：</span>
            <span>
              先点击方框点亮 <strong>6 个组</strong>，再点击方框内的弹珠点亮 <strong>每组 3 粒</strong>！
            </span>
          </div>
          <div className="text-stone-500 font-mono text-[11px]">
            {activeLitBoxesCount} 组 × {activeLitBoxesCount > 0 ? '3 粒' : '0 粒'} = {activeLitBoxesCount * 3} 粒
          </div>
        </div>
      </div>

      {/* 算式填空与卡片拖拽互动区 */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E4D0] pb-3">
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            🧩 拖拽或点击数字卡片填入算式
          </h3>
          <span className="text-xs text-stone-400">
            点击卡片再点击空格，或者直接拖拽到空格中
          </span>
        </div>

        {/* 算式主体卡槽: [ slot1 ] × [ slot2 ] = [ slot3 ] */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-4 bg-[#F8F6EB] rounded-2xl border border-[#E5DFC9]">
          {/* 槽位 1: 组数 (6) */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-bold text-stone-600">组数 (框的数量)</span>
            <div
              id="q2-slot-1"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 1)}
              onClick={() => {
                if (selectedCard !== null) placeCardInSlot(1, selectedCard);
                else if (slot1 !== null) clearSlot(1);
              }}
              className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold cursor-pointer transition-all border-2 ${
                slot1 !== null
                  ? isCompleted
                    ? 'bg-[#E7F7F1] border-teal-500 text-teal-900 shadow-xs ring-4 ring-teal-100'
                    : 'bg-[#FEF3C7] border-amber-500 text-amber-950 shadow-xs'
                  : 'bg-white border-dashed border-[#DDD7C0] hover:border-amber-400 text-stone-300 hover:bg-amber-50/40'
              }`}
            >
              {slot1 !== null ? (
                <>
                  <span>{slot1}</span>
                  <span className="text-[10px] font-sans font-normal text-stone-400 -mt-1">点击清除</span>
                </>
              ) : (
                <span className="text-xs font-sans text-stone-400 font-normal">拖入此处</span>
              )}
            </div>
          </div>

          {/* 乘号 × */}
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-700 pt-5">×</div>

          {/* 槽位 2: 每组数量 (3) */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-bold text-stone-600">每组数量 (每框弹珠)</span>
            <div
              id="q2-slot-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 2)}
              onClick={() => {
                if (selectedCard !== null) placeCardInSlot(2, selectedCard);
                else if (slot2 !== null) clearSlot(2);
              }}
              className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold cursor-pointer transition-all border-2 ${
                slot2 !== null
                  ? isCompleted
                    ? 'bg-[#E7F7F1] border-teal-500 text-teal-900 shadow-xs ring-4 ring-teal-100'
                    : 'bg-[#FEF3C7] border-amber-500 text-amber-950 shadow-xs'
                  : 'bg-white border-dashed border-[#DDD7C0] hover:border-amber-400 text-stone-300 hover:bg-amber-50/40'
              }`}
            >
              {slot2 !== null ? (
                <>
                  <span>{slot2}</span>
                  <span className="text-[10px] font-sans font-normal text-stone-400 -mt-1">点击清除</span>
                </>
              ) : (
                <span className="text-xs font-sans text-stone-400 font-normal">拖入此处</span>
              )}
            </div>
          </div>

          {/* 等号 = */}
          <div className="text-3xl sm:text-4xl font-extrabold text-stone-400 pt-5">=</div>

          {/* 槽位 3: 总数 (18) */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-bold text-stone-600">总数 (弹珠总和)</span>
            <div
              id="q2-slot-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 3)}
              onClick={() => {
                if (selectedCard !== null) placeCardInSlot(3, selectedCard);
                else if (slot3 !== null) clearSlot(3);
              }}
              className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold cursor-pointer transition-all border-2 ${
                slot3 !== null
                  ? isCompleted
                    ? 'bg-[#E7F7F1] border-teal-500 text-teal-900 shadow-xs ring-4 ring-teal-100'
                    : 'bg-[#FEF3C7] border-amber-500 text-amber-950 shadow-xs'
                  : 'bg-white border-dashed border-[#DDD7C0] hover:border-amber-400 text-stone-300 hover:bg-amber-50/40'
              }`}
            >
              {slot3 !== null ? (
                <>
                  <span>{slot3}</span>
                  <span className="text-[10px] font-sans font-normal text-stone-400 -mt-1">点击清除</span>
                </>
              ) : (
                <span className="text-xs font-sans text-stone-400 font-normal">拖入此处</span>
              )}
            </div>
          </div>
        </div>

        {/* 候选卡片托盘 */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-stone-700 flex items-center gap-1">
            <GripHorizontal className="w-3.5 h-3.5" /> 备选数字卡片（拖拽或选中后填入）：
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {AVAILABLE_CARDS.map((num) => {
              const isSelected = selectedCard === num;
              return (
                <div
                  key={num}
                  id={`q2-card-${num}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, num)}
                  onClick={() => {
                    sound.playPop(480);
                    setSelectedCard(isSelected ? null : num);
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-mono text-xl sm:text-2xl font-extrabold flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-all shadow-xs ${
                    isSelected
                      ? 'bg-stone-900 text-amber-300 shadow-sm ring-4 ring-amber-200 scale-105 -translate-y-1'
                      : 'bg-white text-stone-800 border-2 border-[#DDD7C0] hover:border-amber-400 hover:bg-[#F9F7EC] hover:-translate-y-0.5'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>

        {/* 错误或成功提示 */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            ⚠️ {validationError}
          </div>
        )}

        {isCompleted && (
          <div className="p-4 bg-[#E7F7F1] border-2 border-[#BCE7D6] rounded-xl text-teal-950 text-sm font-bold flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
              <span>太棒了！算式完全正确：6 × 3 = 18！弹珠们高兴得跳起来啦！</span>
            </div>
            <span className="text-xs bg-teal-200/80 px-2.5 py-1 rounded-full text-teal-900 font-bold">
              得分：[2/2 分]
            </span>
          </div>
        )}

        {/* 检查提交按钮 */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="q2-submit-btn"
            onClick={handleCheck}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 border border-amber-700"
          >
            <CheckCircle2 className="w-4 h-4" /> 检查算式
          </button>
        </div>
      </div>
    </div>
  );
};
