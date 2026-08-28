import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, Compass, MapPin, Footprints, MousePointerClick, X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const Question5Coordinates: React.FC = () => {
  // P 点初始位置 (2, 4)
  const POINT_P: Point = { x: 2, y: 4 };
  // Q 点目标位置 (5, 2)
  const TARGET_Q: Point = { x: 5, y: 2 };

  // Task A: 用户在网格上点击放置的 Q 点位置
  const [placedQ, setPlacedQ] = useState<Point | null>(null);
  const [qErrorClick, setQErrorClick] = useState<Point | null>(null);

  // 候选数字卡片
  const COORD_CARDS = ['0', '1', '2', '3', '4', '5', '6', '7'];

  // Task B: 用户拖拽的 P 点坐标 [px, py]
  const [slotPx, setSlotPx] = useState<string | null>(null);
  const [slotPy, setSlotPy] = useState<string | null>(null);
  const [pResult, setPResult] = useState<{ checked: boolean; isCorrect: boolean } | null>(null);

  // Task C: 路径探索模式 (从 P 移动到 Q)
  const [walkerPos, setWalkerPos] = useState<Point>({ x: 2, y: 4 });
  const [isPathCompleted, setIsPathCompleted] = useState<boolean>(false);
  const [slotUnits, setSlotUnits] = useState<string | null>(null);
  const [unitCheckResult, setUnitCheckResult] = useState<{ checked: boolean; isCorrect: boolean } | null>(null);

  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C'>('A');
  const [showHint, setShowHint] = useState<boolean>(false);

  // 拖拽处理
  const handleDragStart = (e: React.DragEvent, val: string) => {
    e.dataTransfer.setData('text/plain', val);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, slot: 'px' | 'py' | 'units') => {
    e.preventDefault();
    const val = e.dataTransfer.getData('text/plain');
    if (val) {
      sound.playPop(580);
      if (slot === 'px') setSlotPx(val);
      else if (slot === 'py') setSlotPy(val);
      else if (slot === 'units') setSlotUnits(val);
    }
  };

  const handleRemoveSlot = (slot: 'px' | 'py' | 'units', e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playPop(380);
    if (slot === 'px') setSlotPx(null);
    else if (slot === 'py') setSlotPy(null);
    else if (slot === 'units') setSlotUnits(null);
  };

  const handleCardClick = (val: string, targetType?: 'B' | 'C') => {
    sound.playPop(520);
    const target = targetType || activeTab;
    if (target === 'B') {
      if (!slotPx) setSlotPx(val);
      else if (!slotPy) setSlotPy(val);
      else setSlotPx(val);
    } else if (target === 'C') {
      setSlotUnits(val);
    } else {
      // 默认填入空的卡槽
      if (!slotPx) {
        setSlotPx(val);
        setActiveTab('B');
      } else if (!slotPy) {
        setSlotPy(val);
        setActiveTab('B');
      } else {
        setSlotUnits(val);
        setActiveTab('C');
      }
    }
  };

  // 坐标系常数 (SVG 画布尺寸 360 x 360, 边距 45, 网格刻度 0..6)
  const SVG_SIZE = 360;
  const MARGIN = 50;
  const GRID_SIZE = 6;
  const CELL_SIZE = (SVG_SIZE - MARGIN * 2) / GRID_SIZE; // 43.33px

  // 笛卡尔坐标 (x: 0..6, y: 0..6) 转换为 SVG 坐标 (X 向右, Y 向上需反转)
  const toSvgCoords = (gx: number, gy: number) => {
    return {
      cx: MARGIN + gx * CELL_SIZE,
      cy: SVG_SIZE - MARGIN - gy * CELL_SIZE,
    };
  };

  // SVG 坐标反向推导出最近的整数网格点
  const fromSvgCoords = (svgX: number, svgY: number): Point => {
    const gx = Math.round((svgX - MARGIN) / CELL_SIZE);
    const gy = Math.round((SVG_SIZE - MARGIN - svgY) / CELL_SIZE);
    return {
      x: Math.max(0, Math.min(GRID_SIZE, gx)),
      y: Math.max(0, Math.min(GRID_SIZE, gy)),
    };
  };

  // 点击网格交叉点 (用于 Task A 标示 Q 点)
  const handleGridClick = (gx: number, gy: number) => {
    if (activeTab === 'A') {
      if (gx === TARGET_Q.x && gy === TARGET_Q.y) {
        // 正确标示 Q(5, 2)
        setPlacedQ({ x: 5, y: 2 });
        setQErrorClick(null);
        sound.playSuccess();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        // 错误点击
        setQErrorClick({ x: gx, y: gy });
        sound.playGentleError();
      }
    }
  };

  // 校验 Task B: P点坐标 (2, 4)
  const handleCheckPCoords = () => {
    const xOk = slotPx === '2';
    const yOk = slotPy === '4';
    const isOk = xOk && yOk;

    setPResult({ checked: true, isCorrect: isOk });
    if (isOk) {
      sound.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
    }
  };

  // 路径移动：从 P (2,4) 先水平向右到 (5,4)，再垂直向下到 (5,2)
  const handleStepHorizontal = () => {
    sound.playPop(480);
    if (walkerPos.x < 5 && walkerPos.y === 4) {
      setWalkerPos((prev) => ({ ...prev, x: prev.x + 1 }));
    }
  };

  const handleStepVertical = () => {
    sound.playPop(560);
    if (walkerPos.x === 5 && walkerPos.y > 2) {
      const nextY = walkerPos.y - 1;
      setWalkerPos((prev) => ({ ...prev, y: nextY }));
      if (nextY === 2) {
        setIsPathCompleted(true);
        sound.playSuccess();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  // 一键自动走完全程
  const autoWalkPath = () => {
    setWalkerPos({ x: 2, y: 4 });
    setIsPathCompleted(false);

    const steps: Point[] = [
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 5, y: 3 },
      { x: 5, y: 2 },
    ];

    steps.forEach((st, idx) => {
      setTimeout(() => {
        setWalkerPos(st);
        sound.playPop(450 + idx * 60);
        if (idx === steps.length - 1) {
          setIsPathCompleted(true);
          sound.playSuccess();
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }
      }, (idx + 1) * 350);
    });
  };

  // 校验 Task C 填写的移动单位数量
  const handleCheckUnitCount = () => {
    const isOk = slotUnits === '5';
    setUnitCheckResult({ checked: true, isCorrect: isOk });
    if (isOk) {
      sound.playSuccess();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
    }
  };

  // 计算当前已走过的单位
  const horizontalUnits = Math.max(0, walkerPos.x - POINT_P.x);
  const verticalUnits = walkerPos.x === 5 ? Math.max(0, POINT_P.y - walkerPos.y) : 0;
  const totalWalkedUnits = horizontalUnits + verticalUnits;

  // 重置
  const handleReset = () => {
    setPlacedQ(null);
    setQErrorClick(null);
    setSlotPx(null);
    setSlotPy(null);
    setPResult(null);
    setWalkerPos({ x: 2, y: 4 });
    setIsPathCompleted(false);
    setSlotUnits(null);
    setUnitCheckResult(null);
    setShowHint(false);
    sound.playPop(350);
  };

  return (
    <div id="question-5-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* 题目头部 (对应试卷第 5 题) */}
      <div id="q5-header-card" className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] text-amber-900 rounded-full text-xs font-bold tracking-wide mb-2 border border-[#FDE68A]">
              <Compass className="w-3.5 h-3.5 text-amber-700" /> 坐标与空间 · 第 5 题
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
              5. 图 3 显示在笛卡尔平面的 P 点。
            </h2>
            <div className="mt-2 text-stone-600 space-y-1 font-medium text-sm md:text-base">
              <p className="flex items-center gap-1.5">
                <span className="text-amber-800 font-bold">(a)</span> 在图 3 里标示出 Q 点 (5, 2)。
                <span className="text-xs text-stone-400 font-mono">[1 分]</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-amber-800 font-bold">(b)</span> 写出 P 点的坐标。
                <span className="text-xs text-stone-400 font-mono">[1 分]</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-amber-800 font-bold">(c)</span> 从 P 点先水平移动，再垂直移动到 Q 点，共移动多少个单位？
                <span className="text-xs text-stone-400 font-mono">[2 分]</span>
              </p>
            </div>
          </div>

          <button
            id="q5-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 bg-[#F4F0DE] hover:bg-[#EAE4CE] border border-[#DDD7C0] rounded-xl transition-all active:scale-95"
            title="重置本题"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>
      </div>

      {/* 核心互动工作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：笛卡尔坐标系 SVG 渲染与互动网格 */}
        <div className="lg:col-span-7 bg-[#F8F6EB] rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex flex-col justify-between items-center min-h-[460px]">
          {/* 顶部任务导航切换 */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-[#DDD7C0]">
              <button
                onClick={() => setActiveTab('A')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === 'A' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-[#F4F0DE]'
                }`}
              >
                任务 (a) 标示 Q 点
              </button>
              <button
                onClick={() => setActiveTab('B')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === 'B' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-[#F4F0DE]'
                }`}
              >
                任务 (b) 读 P 坐标
              </button>
              <button
                onClick={() => setActiveTab('C')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === 'C' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-[#F4F0DE]'
                }`}
              >
                任务 (c) 路径导航
              </button>
            </div>

            <span className="text-[11px] font-mono font-bold text-amber-900 bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-lg">
              {activeTab === 'A' && (placedQ ? '✅ Q点已正确标示' : '👆 请点击网格标出 Q(5,2)')}
              {activeTab === 'B' && '👀 观察 P 点对应 x 与 y'}
              {activeTab === 'C' && `🚶 步数: ${totalWalkedUnits}/5 单位`}
            </span>
          </div>

          {/* 笛卡尔坐标系 SVG (6x6 网格) */}
          <div className="w-full flex-1 flex items-center justify-center relative py-1">
            <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[340px] select-none">
              <defs>
                {/* 坐标轴箭头标 */}
                <marker id="axis-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#292524" />
                </marker>
              </defs>

              {/* 背景浅色方格 */}
              {Array.from({ length: GRID_SIZE }).map((_, r) =>
                Array.from({ length: GRID_SIZE }).map((_, c) => {
                  const p = toSvgCoords(c, r + 1);
                  return (
                    <rect
                      key={`bg-cell-${r}-${c}`}
                      x={p.cx}
                      y={p.cy}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={(r + c) % 2 === 0 ? '#FFFFFF' : '#FAF8EE'}
                      stroke="#E5DFC9"
                      strokeWidth="1"
                    />
                  );
                })
              )}

              {/* X 轴 (水平) */}
              <line
                x1={MARGIN}
                y1={SVG_SIZE - MARGIN}
                x2={SVG_SIZE - MARGIN + 26}
                y2={SVG_SIZE - MARGIN}
                stroke="#292524"
                strokeWidth="2.5"
                markerEnd="url(#axis-arrow)"
              />
              <text x={SVG_SIZE - MARGIN + 28} y={SVG_SIZE - MARGIN + 4} fontSize="13" fontWeight="bold" fill="#1C1917">
                x
              </text>

              {/* Y 轴 (垂直) */}
              <line
                x1={MARGIN}
                y1={SVG_SIZE - MARGIN}
                x2={MARGIN}
                y2={MARGIN - 26}
                stroke="#292524"
                strokeWidth="2.5"
                markerEnd="url(#axis-arrow)"
              />
              <text x={MARGIN - 4} y={MARGIN - 28} textAnchor="end" fontSize="13" fontWeight="bold" fill="#1C1917">
                y
              </text>

              {/* 原点 0 标签 */}
              <text x={MARGIN - 10} y={SVG_SIZE - MARGIN + 16} fontSize="12" fontWeight="bold" fill="#78716C" textAnchor="middle">
                0
              </text>

              {/* X 轴刻度 1..6 */}
              {Array.from({ length: GRID_SIZE }).map((_, i) => {
                const val = i + 1;
                const p = toSvgCoords(val, 0);
                return (
                  <g key={`x-tick-${val}`}>
                    <line x1={p.cx} y1={p.cy} x2={p.cx} y2={p.cy + 5} stroke="#292524" strokeWidth="2" />
                    <text x={p.cx} y={p.cy + 18} fontSize="12" fontWeight="bold" fill="#44403C" textAnchor="middle">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Y 轴刻度 1..6 */}
              {Array.from({ length: GRID_SIZE }).map((_, i) => {
                const val = i + 1;
                const p = toSvgCoords(0, val);
                return (
                  <g key={`y-tick-${val}`}>
                    <line x1={p.cx} y1={p.cy} x2={p.cx - 5} y2={p.cy} stroke="#292524" strokeWidth="2" />
                    <text x={p.cx - 12} y={p.cy + 4} fontSize="12" fontWeight="bold" fill="#44403C" textAnchor="middle">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* 可点击交互的交叉点热区 (仅在任务 A 下高亮可选) */}
              {Array.from({ length: GRID_SIZE + 1 }).map((_, gx) =>
                Array.from({ length: GRID_SIZE + 1 }).map((_, gy) => {
                  const p = toSvgCoords(gx, gy);
                  return (
                    <circle
                      key={`hitpoint-${gx}-${gy}`}
                      cx={p.cx}
                      cy={p.cy}
                      r={activeTab === 'A' ? 10 : 4}
                      fill={activeTab === 'A' ? 'transparent' : '#A8A29E'}
                      stroke={activeTab === 'A' ? 'rgba(217, 119, 6, 0.25)' : 'none'}
                      strokeWidth={1}
                      className={activeTab === 'A' ? 'cursor-pointer hover:fill-amber-300/50' : ''}
                      onClick={() => handleGridClick(gx, gy)}
                    />
                  );
                })
              )}

              {/* 任务 C: 规划的移动路径轨迹 */}
              {/* 水平路径 (2,4) -> (5,4) */}
              <line
                x1={toSvgCoords(2, 4).cx}
                y1={toSvgCoords(2, 4).cy}
                x2={toSvgCoords(Math.min(5, walkerPos.x), 4).cx}
                y2={toSvgCoords(Math.min(5, walkerPos.x), 4).cy}
                stroke="#0284C7"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* 垂直路径 (5,4) -> (5,2) */}
              {walkerPos.x >= 5 && (
                <line
                  x1={toSvgCoords(5, 4).cx}
                  y1={toSvgCoords(5, 4).cy}
                  x2={toSvgCoords(5, walkerPos.y).cx}
                  y2={toSvgCoords(5, walkerPos.y).cy}
                  stroke="#D97706"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}

              {/* 标示 P 点 (2, 4) */}
              {(() => {
                const pSvg = toSvgCoords(POINT_P.x, POINT_P.y);
                return (
                  <g>
                    {/* 辅助对齐虚线 */}
                    <line x1={pSvg.cx} y1={pSvg.cy} x2={pSvg.cx} y2={SVG_SIZE - MARGIN} stroke="#78716C" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={pSvg.cx} y1={pSvg.cy} x2={MARGIN} y2={pSvg.cy} stroke="#78716C" strokeWidth="1" strokeDasharray="3 3" />

                    <circle cx={pSvg.cx} cy={pSvg.cy} r="7" fill="#1C1917" stroke="#FFFFFF" strokeWidth="2" />
                    <rect x={pSvg.cx + 8} y={pSvg.cy - 20} width="22" height="18" rx="4" fill="#1C1917" />
                    <text x={pSvg.cx + 19} y={pSvg.cy - 7} fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">
                      P
                    </text>
                  </g>
                );
              })()}

              {/* 标示 Q 点 (5, 2) —— 用户点击或已固定 */}
              {placedQ && (() => {
                const qSvg = toSvgCoords(TARGET_Q.x, TARGET_Q.y);
                return (
                  <g className="animate-fadeIn">
                    {/* 辅助对齐虚线 */}
                    <line x1={qSvg.cx} y1={qSvg.cy} x2={qSvg.cx} y2={SVG_SIZE - MARGIN} stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={qSvg.cx} y1={qSvg.cy} x2={MARGIN} y2={qSvg.cy} stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />

                    <circle cx={qSvg.cx} cy={qSvg.cy} r="12" fill="rgba(217, 119, 6, 0.2)" className="animate-ping" />
                    <circle cx={qSvg.cx} cy={qSvg.cy} r="7" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
                    <rect x={qSvg.cx + 8} y={qSvg.cy - 20} width="52" height="18" rx="4" fill="#D97706" />
                    <text x={qSvg.cx + 34} y={qSvg.cy - 7} fontSize="11" fontWeight="bold" fill="white" textAnchor="middle">
                      Q (5,2)
                    </text>
                  </g>
                );
              })()}

              {/* 错误点击时的抖动提示标记 */}
              {qErrorClick && (() => {
                const errSvg = toSvgCoords(qErrorClick.x, qErrorClick.y);
                return (
                  <g className="animate-bounce">
                    <circle cx={errSvg.cx} cy={errSvg.cy} r="6" fill="#EF4444" />
                    <text x={errSvg.cx} y={errSvg.cy - 10} fontSize="10" fontWeight="bold" fill="#EF4444" textAnchor="middle">
                      ({qErrorClick.x}, {qErrorClick.y}) ❌
                    </text>
                  </g>
                );
              })()}

              {/* 任务 C: 漫游小角色头像 (当前位置) */}
              {activeTab === 'C' && (() => {
                const walkerSvg = toSvgCoords(walkerPos.x, walkerPos.y);
                return (
                  <g className="transition-all duration-300">
                    <circle cx={walkerSvg.cx} cy={walkerSvg.cy} r="14" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={walkerSvg.cx} y={walkerSvg.cy + 4} fontSize="13" textAnchor="middle">
                      🎒
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* 任务 C 专属的步进移动控制器 */}
          {activeTab === 'C' && (
            <div className="w-full bg-white rounded-xl p-3 border border-[#E5DFC9] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1 text-amber-900">
                  <Footprints className="w-3.5 h-3.5 text-amber-700" /> 路径导航控制台
                </span>
                <span className="font-mono text-xs text-amber-900 bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded">
                  当前位置: ({walkerPos.x}, {walkerPos.y})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  id="q5-step-horizontal-btn"
                  disabled={walkerPos.x >= 5}
                  onClick={handleStepHorizontal}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 border ${
                    walkerPos.x < 5
                      ? 'bg-stone-900 text-white shadow-xs hover:bg-stone-800 border-stone-900'
                      : 'bg-[#F4F0DE] text-stone-400 border-[#E5DFC9] cursor-not-allowed'
                  }`}
                >
                  向右水平移动 (+1)
                </button>

                <button
                  id="q5-step-vertical-btn"
                  disabled={walkerPos.x < 5 || walkerPos.y <= 2}
                  onClick={handleStepVertical}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 border ${
                    walkerPos.x >= 5 && walkerPos.y > 2
                      ? 'bg-amber-600 text-white shadow-xs hover:bg-amber-700 border-amber-700'
                      : 'bg-[#F4F0DE] text-stone-400 border-[#E5DFC9] cursor-not-allowed'
                  }`}
                >
                  向下垂直移动 (+1)
                </button>

                <button
                  id="q5-auto-walk-btn"
                  onClick={autoWalkPath}
                  className="py-2 px-2 text-xs font-bold bg-[#FAF8EE] hover:bg-[#F4F0DE] text-stone-800 border border-[#DDD7C0] rounded-lg transition flex items-center justify-center gap-1"
                >
                  ⚡ 一键走完全程
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：三道子题目互动答题区 */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* 候选数字卡片池 (可拖拽或点击填入) */}
          <div className="bg-[#FAF8EE] p-3 rounded-2xl border border-[#E5DFC9] space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span>🔢 数字卡片（拖拽或点击填入下方答案）：</span>
              {(slotPx || slotPy || slotUnits) && (
                <button
                  type="button"
                  onClick={() => {
                    setSlotPx(null);
                    setSlotPy(null);
                    setSlotUnits(null);
                    sound.playPop(350);
                  }}
                  className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                >
                  清空所有
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {COORD_CARDS.map((num) => {
                const isUsed = slotPx === num || slotPy === num || slotUnits === num;
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

          {/* 子任务 (a) 标示 Q 点卡片 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'A' ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-200' : 'bg-white/80 border-[#E5DFC9]'
            }`}
            onClick={() => setActiveTab('A')}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-900 px-2 py-0.5 bg-[#FEF3C7] rounded-md border border-[#FDE68A]">
                (a) 标示出 Q 点 (5, 2)
              </span>
              <span className="text-xs text-stone-400 font-mono">[1 分]</span>
            </div>
            <p className="text-xs text-stone-600 mb-2">
              在左侧网格中找到 x 轴为 5、y 轴为 2 的交叉点并点击。
            </p>
            {placedQ ? (
              <div className="text-xs font-bold text-teal-950 bg-[#E7F7F1] border border-[#BCE7D6] p-2 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                已成功标示 Q 点坐标 (5, 2)！
              </div>
            ) : (
              <div className="text-xs text-stone-500 bg-[#FAF8EE] border border-[#E5DFC9] p-2 rounded-lg flex items-center gap-1.5">
                <MousePointerClick className="w-4 h-4 text-amber-600" />
                等待你在网格上点击标出...
              </div>
            )}
          </div>

          {/* 子任务 (b) 写出 P 点坐标卡片 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'B' ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-200' : 'bg-white/80 border-[#E5DFC9]'
            }`}
            onClick={() => setActiveTab('B')}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-900 px-2 py-0.5 bg-[#FEF3C7] rounded-md border border-[#FDE68A]">
                (b) 写出 P 点的坐标
              </span>
              <span className="text-xs text-stone-400 font-mono">[1 分]</span>
            </div>

            {/* 拖拽式坐标卡槽 */}
            <div className="flex items-center gap-2 my-2 bg-[#FAF8EE] p-2 rounded-xl border border-[#E5DFC9]">
              <span className="text-sm font-extrabold text-stone-800">P (</span>
              
              {/* x 槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'px')}
                onClick={() => slotPx && handleRemoveSlot('px')}
                className={`w-11 h-9 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotPx
                    ? 'border-amber-400 bg-white text-stone-900 shadow-2xs font-extrabold font-mono text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-white/70 hover:border-amber-400 text-stone-400 text-xs font-bold'
                }`}
                title={slotPx ? '点击移除' : '拖入或点击卡片填入 x 坐标 (2)'}
              >
                {slotPx || 'x?'}
              </div>

              <span className="text-sm font-extrabold text-stone-800">,</span>

              {/* y 槽位 */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'py')}
                onClick={() => slotPy && handleRemoveSlot('py')}
                className={`w-11 h-9 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotPy
                    ? 'border-amber-400 bg-white text-stone-900 shadow-2xs font-extrabold font-mono text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-white/70 hover:border-amber-400 text-stone-400 text-xs font-bold'
                }`}
                title={slotPy ? '点击移除' : '拖入或点击卡片填入 y 坐标 (4)'}
              >
                {slotPy || 'y?'}
              </div>

              <span className="text-sm font-extrabold text-stone-800">)</span>

              <button
                id="q5-check-p-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckPCoords();
                }}
                className="ml-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition border border-amber-700 shadow-2xs"
              >
                检查
              </button>
            </div>

            {pResult && (
              <div
                className={`text-xs p-2 rounded-lg font-bold ${
                  pResult.isCorrect ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950' : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {pResult.isCorrect ? '🎉 坐标填写正确！' : '❌ 坐标不正确，请观察网格坐标轴后重新尝试。'}
              </div>
            )}
          </div>

          {/* 子任务 (c) 移动单位总数卡片 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'C' ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-200' : 'bg-white/80 border-[#E5DFC9]'
            }`}
            onClick={() => setActiveTab('C')}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-900 px-2 py-0.5 bg-[#FEF3C7] rounded-md border border-[#FDE68A]">
                (c) 先水平再垂直移动到 Q 点单位数
              </span>
              <span className="text-xs text-stone-400 font-mono">[2 分]</span>
            </div>

            <p className="text-xs text-stone-600 mb-2">
              计算从 P 点移动到 Q 点所走过的水平单位数与垂直单位数之和。
            </p>

            {/* 拖拽式单位数卡槽 */}
            <div className="flex items-center gap-2 bg-[#FAF8EE] p-2 rounded-xl border border-[#E5DFC9]">
              <span className="text-xs font-bold text-stone-700">总共移动了：</span>
              
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'units')}
                onClick={() => slotUnits && handleRemoveSlot('units')}
                className={`w-12 h-9 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  slotUnits
                    ? 'border-amber-400 bg-white text-stone-900 shadow-2xs font-extrabold font-mono text-sm'
                    : 'border-dashed border-[#DDD7C0] bg-white/70 hover:border-amber-400 text-stone-400 text-xs font-bold'
                }`}
                title={slotUnits ? '点击移除' : '拖入或点击卡片填入总步数'}
              >
                {slotUnits || '几?'}
              </div>

              <span className="text-xs font-bold text-stone-700">个单位</span>

              <button
                id="q5-check-units-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckUnitCount();
                }}
                className="ml-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition border border-amber-700 shadow-2xs"
              >
                检查单位数
              </button>
            </div>

            {unitCheckResult && (
              <div
                className={`text-xs p-2 rounded-lg font-bold mt-2 ${
                  unitCheckResult.isCorrect ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950' : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {unitCheckResult.isCorrect ? '🎉 计算正确！' : '❌ 单位总数不正确，可在左侧路径导航控制台走走看。'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
