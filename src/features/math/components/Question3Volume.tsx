import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, Box, Play, Pause, FastForward, X } from 'lucide-react';

export const Question3Volume: React.FC = () => {
  // 当前放置的小方块层数 (0: 空, 1: 32个底层, 2: 64个两层, 3: 96个全部填满)
  const [layersCount, setLayersCount] = useState<number>(0);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(false);
  const [animStep, setAnimStep] = useState<number>(0); // 细粒度动画步数 (0..96)

  // 候选数字卡片
  const VOLUME_CARDS = ['8', '4', '3', '32', '96', '24', '12', '16', '64'];

  // 学生作答卡槽状态
  const [slotLength, setSlotLength] = useState<string | null>(null);
  const [slotWidth, setSlotWidth] = useState<string | null>(null);
  const [slotHeight, setSlotHeight] = useState<string | null>(null);
  const [slotTotal, setSlotTotal] = useState<string | null>(null);

  const [checkResult, setCheckResult] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);

  // 拖拽放入处理
  const handleDragStart = (e: React.DragEvent, val: string) => {
    e.dataTransfer.setData('text/plain', val);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, slot: 'length' | 'width' | 'height' | 'total') => {
    e.preventDefault();
    const val = e.dataTransfer.getData('text/plain');
    if (val) {
      sound.playPop(580);
      if (slot === 'length') setSlotLength(val);
      else if (slot === 'width') setSlotWidth(val);
      else if (slot === 'height') setSlotHeight(val);
      else if (slot === 'total') setSlotTotal(val);
    }
  };

  // 点击卡片自动填充到下一个空槽位
  const handleCardClick = (val: string) => {
    sound.playPop(520);
    if (!slotLength) setSlotLength(val);
    else if (!slotWidth) setSlotWidth(val);
    else if (!slotHeight) setSlotHeight(val);
    else if (!slotTotal) setSlotTotal(val);
    else setSlotTotal(val);
  };

  // 移除槽位
  const handleRemoveSlot = (slot: 'length' | 'width' | 'height' | 'total', e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playPop(380);
    if (slot === 'length') setSlotLength(null);
    else if (slot === 'width') setSlotWidth(null);
    else if (slot === 'height') setSlotHeight(null);
    else if (slot === 'total') setSlotTotal(null);
  };

  // 尺寸常量
  const LENGTH = 8; // cm
  const WIDTH = 4;  // cm
  const HEIGHT = 3; // cm
  const LAYER_BLOCKS = LENGTH * WIDTH; // 32
  const TOTAL_BLOCKS = LENGTH * WIDTH * HEIGHT; // 96

  // 动画播放控制器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAnim) {
      timer = setInterval(() => {
        setAnimStep((prev) => {
          if (prev >= TOTAL_BLOCKS) {
            setIsPlayingAnim(false);
            sound.playSuccess();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            return TOTAL_BLOCKS;
          }
          const next = prev + 4;
          sound.playPop(300 + (next / TOTAL_BLOCKS) * 400);
          setLayersCount(Math.ceil(next / LAYER_BLOCKS));
          return next;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlayingAnim]);

  // 开始逐层演示动画
  const startFillAnimation = () => {
    setAnimStep(0);
    setLayersCount(1);
    setIsPlayingAnim(true);
    sound.playPop(500);
  };

  // 快捷设置层数
  const setExactLayer = (layer: number) => {
    setIsPlayingAnim(false);
    setLayersCount(layer);
    setAnimStep(layer * LAYER_BLOCKS);
    sound.playPop(400 + layer * 100);
  };

  // 检查学生答案
  const handleCheckAnswer = () => {
    // 验证数字：公式3个乘数包含 8, 4, 3，结果为 96
    const formulaFactors = [slotLength, slotWidth, slotHeight].filter(Boolean).map(Number).sort((a, b) => a - b);
    const hasFormulaOk = formulaFactors.length === 3 && formulaFactors[0] === 3 && formulaFactors[1] === 4 && formulaFactors[2] === 8;
    const hasTotalOk = slotTotal === '96';

    if (hasFormulaOk && hasTotalOk) {
      setCheckResult({
        checked: true,
        isCorrect: true,
        feedback: '🎉 太棒了！回答非常精准！长方体的体积 = 8 cm × 4 cm × 3 cm = 96 cm³。',
      });
      sound.playSuccess();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else if (hasTotalOk && !hasFormulaOk) {
      setCheckResult({
        checked: true,
        isCorrect: false,
        feedback: '💡 最终结果 96 正确，但前方的计算过程卡片（长 × 宽 × 高）尚未完全填对哦！',
      });
      sound.playGentleError();
    } else {
      setCheckResult({
        checked: true,
        isCorrect: false,
        feedback: '💡 提示：长方体体积 = 长 (8) × 宽 (4) × 高 (3) = 96 cm³。请将卡片拖入对应槽位！',
      });
      sound.playGentleError();
    }
  };

  // 重置本题
  const handleReset = () => {
    setLayersCount(0);
    setAnimStep(0);
    setIsPlayingAnim(false);
    setSlotLength(null);
    setSlotWidth(null);
    setSlotHeight(null);
    setSlotTotal(null);
    setCheckResult(null);
    setShowHint(false);
    sound.playPop(350);
  };

  // SVG 等轴测投影几何参数
  // 原点 (ox, oy), 轴向量: X轴(长 8格), Y轴(宽 4格), Z轴(高 3格)
  const originX = 170;
  const originY = 220;
  const dx = 28; // X 轴单位向量 (向右下: x + dx, y + dx*0.4)
  const dy = -16; // Y 轴单位向量 (向右上: x + dy*1.5, y + dy*0.8)
  const dz = -38; // Z 轴高度单位向量 (垂直向上: y + dz)

  // 投射 3D 坐标 (i: 0..7, j: 0..3, k: 0..2) 到 SVG 2D 坐标
  const projectPoint = (x: number, y: number, z: number) => {
    const px = originX + x * dx + y * 22;
    const py = originY + x * 9 - y * 13 + z * dz;
    return { x: px, y: py };
  };

  return (
    <div id="question-3-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* 题目头部 (对应试卷第 3 题) */}
      <div id="q3-header-card" className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] text-amber-900 rounded-full text-xs font-bold tracking-wide mb-2 border border-[#FDE68A]">
              <Box className="w-3.5 h-3.5 text-amber-700" /> 测量与几何 · 第 3 题
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
              3. 图 2 显示一个长方体。以 cm³ 为单位，计算长方体的体积。展示你的计算过程。
            </h2>
            <p className="mt-1 text-stone-600 text-sm font-medium">
              已知长方体尺寸：长 = 8 cm，宽 = 4 cm，高 = 3 cm。
              <span className="ml-2 text-xs text-stone-400 font-mono">[3 分]</span>
            </p>
          </div>

          <button
            id="q3-reset-btn"
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
        {/* 左侧：3D 半透明长方体与 1 cm³ 小方块填充 SVG 渲染器 */}
        <div className="lg:col-span-7 bg-stone-900 text-white rounded-2xl p-5 shadow-xs border border-stone-800 flex flex-col justify-between min-h-[460px] relative overflow-hidden">
          {/* 顶部状态与控制 */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur text-amber-200 border border-white/10">
                图 2 · 3D 长方体透视观察
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                当前小方块: {animStep > 0 ? animStep : layersCount * LAYER_BLOCKS} / 96 cm³
              </span>
            </div>

            <button
              onClick={() => setShowGridLines(!showGridLines)}
              className="text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-stone-200 transition border border-white/10"
            >
              {showGridLines ? '隐藏网格线' : '显示网格线'}
            </button>
          </div>

          {/* SVG 3D 长方体与单位小方块渲染 */}
          <div className="w-full flex-1 flex items-center justify-center relative py-2">
            <svg viewBox="0 0 540 330" className="w-full max-h-[300px] select-none">
              <defs>
                {/* 单位立方体顶面渐变 */}
                <linearGradient id="cube-top-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#fde047" />
                </linearGradient>
                {/* 单位立方体正面渐变 */}
                <linearGradient id="cube-front-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                {/* 单位立方体侧面渐变 */}
                <linearGradient id="cube-side-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                {/* 阴影效果 */}
                <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 外部半透明大长方体轮廓（长 8, 宽 4, 高 3） */}
              {/* 顶点计算 */}
              {(() => {
                const p000 = projectPoint(0, 0, 0);
                const p800 = projectPoint(8, 0, 0);
                const p840 = projectPoint(8, 4, 0);
                const p040 = projectPoint(0, 4, 0);

                const p003 = projectPoint(0, 0, 3);
                const p803 = projectPoint(8, 0, 3);
                const p843 = projectPoint(8, 4, 3);
                const p043 = projectPoint(0, 4, 3);

                return (
                  <g>
                    {/* 底面投影阴影 */}
                    <polygon
                      points={`${p000.x},${p000.y} ${p800.x},${p800.y} ${p840.x},${p840.y} ${p040.x},${p040.y}`}
                      fill="rgba(0, 0, 0, 0.4)"
                    />

                    {/* 后侧隐藏虚线 (0,4,0) 到 (0,0,0), (0,4,3), (8,4,0) */}
                    <line x1={p040.x} y1={p040.y} x2={p000.x} y2={p000.y} stroke="#78716c" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1={p040.x} y1={p040.y} x2={p043.x} y2={p043.y} stroke="#78716c" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1={p040.x} y1={p040.y} x2={p840.x} y2={p840.y} stroke="#78716c" strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* 渲染已放入的 1 cm³ 小方块 (按从后到前、从下到上的深度排序) */}
                    {(() => {
                      const cubes = [];
                      const totalToRender = animStep > 0 ? animStep : layersCount * LAYER_BLOCKS;

                      let count = 0;
                      for (let z = 0; z < HEIGHT; z++) {
                        for (let y = WIDTH - 1; y >= 0; y--) {
                          for (let x = 0; x < LENGTH; x++) {
                            if (count < totalToRender) {
                              const c0 = projectPoint(x, y, z);
                              const cx = projectPoint(x + 1, y, z);
                              const cy = projectPoint(x, y + 1, z);
                              const cxy = projectPoint(x + 1, y + 1, z);

                              const cz0 = projectPoint(x, y, z + 1);
                              const czx = projectPoint(x + 1, y, z + 1);
                              const czy = projectPoint(x, y + 1, z + 1);
                              const czxy = projectPoint(x + 1, y + 1, z + 1);

                              // 根据所在层区分柔和色系 (层1: 琥珀金, 层2: 翡翠绿, 层3: 晴空蓝)
                              const layerColors = [
                                { top: '#fed7aa', front: '#f97316', side: '#ea580c', stroke: '#c2410c' },
                                { top: '#a7f3d0', front: '#10b981', side: '#059669', stroke: '#047857' },
                                { top: '#bae6fd', front: '#0ea5e9', side: '#0284c7', stroke: '#0369a1' },
                              ];
                              const col = layerColors[z % 3];

                              cubes.push(
                                <g key={`cube-${x}-${y}-${z}`} className="transition-opacity duration-300">
                                  {/* 正面 */}
                                  <polygon
                                    points={`${c0.x},${c0.y} ${cx.x},${cx.y} ${czx.x},${czx.y} ${cz0.x},${cz0.y}`}
                                    fill={col.front}
                                    stroke={col.stroke}
                                    strokeWidth="0.8"
                                    opacity="0.95"
                                  />
                                  {/* 侧面 */}
                                  <polygon
                                    points={`${cx.x},${cx.y} ${cxy.x},${cxy.y} ${czxy.x},${czxy.y} ${czx.x},${czx.y}`}
                                    fill={col.side}
                                    stroke={col.stroke}
                                    strokeWidth="0.8"
                                    opacity="0.95"
                                  />
                                  {/* 顶面 */}
                                  <polygon
                                    points={`${cz0.x},${cz0.y} ${czx.x},${czx.y} ${czxy.x},${czxy.y} ${czy.x},${czy.y}`}
                                    fill={col.top}
                                    stroke={col.stroke}
                                    strokeWidth="0.8"
                                    opacity="0.98"
                                  />
                                </g>
                              );
                            }
                            count++;
                          }
                        }
                      }
                      return cubes;
                    })()}

                    {/* 外围半透明长方体框架 */}
                    {/* 底面前沿线 */}
                    <line x1={p000.x} y1={p000.y} x2={p800.x} y2={p800.y} stroke="#fbbf24" strokeWidth="2.5" />
                    <line x1={p800.x} y1={p800.y} x2={p840.x} y2={p840.y} stroke="#fbbf24" strokeWidth="2.5" />

                    {/* 四条立柱高 */}
                    <line x1={p000.x} y1={p000.y} x2={p003.x} y2={p003.y} stroke="#fbbf24" strokeWidth="2.5" />
                    <line x1={p800.x} y1={p800.y} x2={p803.x} y2={p803.y} stroke="#fbbf24" strokeWidth="2.5" />
                    <line x1={p840.x} y1={p840.y} x2={p843.x} y2={p843.y} stroke="#fbbf24" strokeWidth="2.5" />

                    {/* 顶面四条边 */}
                    <polygon
                      points={`${p003.x},${p003.y} ${p803.x},${p803.y} ${p843.x},${p843.y} ${p043.x},${p043.y}`}
                      fill="rgba(251, 191, 36, 0.12)"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                    />

                    {/* 标注尺寸：长 8 cm */}
                    <g>
                      <line
                        x1={p000.x - 5}
                        y1={p000.y + 14}
                        x2={p800.x + 5}
                        y2={p800.y + 14}
                        stroke="#facc15"
                        strokeWidth="2"
                      />
                      <rect
                        x={(p000.x + p800.x) / 2 - 32}
                        y={(p000.y + p800.y) / 2 + 18}
                        width="64"
                        height="20"
                        rx="4"
                        fill="#1c1917"
                        stroke="#facc15"
                        strokeWidth="1.5"
                      />
                      <text
                        x={(p000.x + p800.x) / 2}
                        y={(p000.y + p800.y) / 2 + 32}
                        textAnchor="middle"
                        fill="#facc15"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        长 8 cm
                      </text>
                    </g>

                    {/* 标注尺寸：宽 4 cm */}
                    <g>
                      <rect
                        x={(p800.x + p840.x) / 2 + 14}
                        y={(p800.y + p840.y) / 2 - 8}
                        width="60"
                        height="20"
                        rx="4"
                        fill="#1c1917"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                      />
                      <text
                        x={(p800.x + p840.x) / 2 + 44}
                        y={(p800.y + p840.y) / 2 + 6}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        宽 4 cm
                      </text>
                    </g>

                    {/* 标注尺寸：高 3 cm */}
                    <g>
                      <rect
                        x={p843.x + 14}
                        y={(p840.y + p843.y) / 2 - 10}
                        width="58"
                        height="20"
                        rx="4"
                        fill="#1c1917"
                        stroke="#fb7185"
                        strokeWidth="1.5"
                      />
                      <text
                        x={p843.x + 43}
                        y={(p840.y + p843.y) / 2 + 4}
                        textAnchor="middle"
                        fill="#fb7185"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        高 3 cm
                      </text>
                    </g>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* 互动控制面板：放入 1 cm³ 小方块 */}
          <div className="w-full bg-stone-800/80 backdrop-blur-md rounded-xl p-3.5 border border-stone-700 z-10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                填充 1 cm³ 小方块教学模拟：
              </span>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setExactLayer(0)}
                  className={`px-2 py-1 rounded font-medium transition ${layersCount === 0 ? 'bg-white text-stone-900 font-bold' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  清空
                </button>
                <button
                  onClick={() => setExactLayer(1)}
                  className={`px-2 py-1 rounded font-medium transition ${layersCount === 1 ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  第1层 (32块)
                </button>
                <button
                  onClick={() => setExactLayer(2)}
                  className={`px-2 py-1 rounded font-medium transition ${layersCount === 2 ? 'bg-emerald-400 text-stone-950 font-bold' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  第2层 (64块)
                </button>
                <button
                  onClick={() => setExactLayer(3)}
                  className={`px-2 py-1 rounded font-medium transition ${layersCount === 3 ? 'bg-sky-400 text-stone-950 font-bold' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  第3层 (96块)
                </button>
              </div>
            </div>

            {/* 一键播放放入动画按钮 */}
            <button
              id="q3-fill-cubes-btn"
              onClick={isPlayingAnim ? () => setIsPlayingAnim(false) : startFillAnimation}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-lg shadow-xs transition-all active:scale-[0.98] text-xs flex items-center justify-center gap-2"
            >
              {isPlayingAnim ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> 暂停动画
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> 放入 1 cm³ 小方块（逐层铺满长方体动画）
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧：计算过程书写与批改区 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 mb-3 flex items-center gap-2">
                📝 计算长方体体积
              </h3>

              {/* 拖拽与填空式算式卡槽 */}
              <div className="space-y-4">
                {/* 算式槽位区 */}
                <div className="bg-[#FAF8EE] rounded-xl p-4 border border-[#E5DFC9] space-y-3">
                  <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>📐 体积计算公式与代入：</span>
                    <span className="text-[11px] text-stone-400 font-normal">长 × 宽 × 高 = 体积</span>
                  </div>

                  {/* 算式槽位容器 */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-2 bg-white rounded-xl border border-[#DDD7C0]">
                    {/* 长槽位 */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'length')}
                      className={`min-w-[48px] h-11 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        slotLength
                          ? 'border-amber-400 bg-amber-50 shadow-2xs'
                          : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] hover:border-amber-400 hover:bg-[#FFFBEB]'
                      }`}
                      onClick={() => slotLength && handleRemoveSlot('length')}
                      title={slotLength ? '点击移除' : '拖入或点击下方卡片填入长 (8)'}
                    >
                      {slotLength ? (
                        <span className="font-mono font-extrabold text-sm text-amber-950 flex items-center gap-1">
                          {slotLength} <span className="text-[10px] text-amber-700">cm</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-bold">长?</span>
                      )}
                    </div>

                    <span className="text-stone-400 font-bold text-sm">×</span>

                    {/* 宽槽位 */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'width')}
                      className={`min-w-[48px] h-11 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        slotWidth
                          ? 'border-amber-400 bg-amber-50 shadow-2xs'
                          : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] hover:border-amber-400 hover:bg-[#FFFBEB]'
                      }`}
                      onClick={() => slotWidth && handleRemoveSlot('width')}
                      title={slotWidth ? '点击移除' : '拖入或点击下方卡片填入宽 (4)'}
                    >
                      {slotWidth ? (
                        <span className="font-mono font-extrabold text-sm text-amber-950 flex items-center gap-1">
                          {slotWidth} <span className="text-[10px] text-amber-700">cm</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-bold">宽?</span>
                      )}
                    </div>

                    <span className="text-stone-400 font-bold text-sm">×</span>

                    {/* 高槽位 */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'height')}
                      className={`min-w-[48px] h-11 px-2 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        slotHeight
                          ? 'border-amber-400 bg-amber-50 shadow-2xs'
                          : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] hover:border-amber-400 hover:bg-[#FFFBEB]'
                      }`}
                      onClick={() => slotHeight && handleRemoveSlot('height')}
                      title={slotHeight ? '点击移除' : '拖入或点击下方卡片填入高 (3)'}
                    >
                      {slotHeight ? (
                        <span className="font-mono font-extrabold text-sm text-amber-950 flex items-center gap-1">
                          {slotHeight} <span className="text-[10px] text-amber-700">cm</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-bold">高?</span>
                      )}
                    </div>

                    <span className="text-stone-700 font-bold text-base">=</span>

                    {/* 最终结果槽位 */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'total')}
                      className={`min-w-[56px] h-11 px-2.5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        slotTotal
                          ? 'border-emerald-500 bg-stone-900 text-white shadow-xs'
                          : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE] hover:border-amber-400 hover:bg-[#FFFBEB]'
                      }`}
                      onClick={() => slotTotal && handleRemoveSlot('total')}
                      title={slotTotal ? '点击移除' : '拖入或点击下方卡片填入体积结果 (96)'}
                    >
                      {slotTotal ? (
                        <span className="font-mono font-extrabold text-base text-amber-300">
                          {slotTotal}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-bold">体积?</span>
                      )}
                    </div>

                    <span className="text-stone-900 font-mono font-extrabold text-xs">cm³</span>
                  </div>
                </div>

                {/* 候选数字卡片池 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>🔢 拖拽或点击数字卡片填入上方槽位：</span>
                    {(slotLength || slotWidth || slotHeight || slotTotal) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSlotLength(null);
                          setSlotWidth(null);
                          setSlotHeight(null);
                          setSlotTotal(null);
                          sound.playPop(350);
                        }}
                        className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                      >
                        清空槽位
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9]">
                    {VOLUME_CARDS.map((num) => {
                      const isUsed =
                        slotLength === num || slotWidth === num || slotHeight === num || slotTotal === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          draggable
                          onDragStart={(e) => handleDragStart(e, num)}
                          onClick={() => handleCardClick(num)}
                          className={`min-w-[36px] h-9 px-2.5 text-xs font-mono font-extrabold rounded-lg border transition shadow-2xs cursor-grab active:cursor-grabbing active:scale-95 flex items-center justify-center ${
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
              </div>
            </div>

            {/* 校验反馈与提交 */}
            <div className="pt-4 border-t border-[#E8E4D0] mt-4 space-y-3">
              {checkResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    checkResult.isCorrect
                      ? 'bg-[#E7F7F1] border-[#BCE7D6] text-teal-950'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {checkResult.feedback}
                </div>
              )}

              <button
                id="q3-submit-btn"
                onClick={handleCheckAnswer}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 border border-amber-700"
              >
                <CheckCircle2 className="w-4 h-4" /> 检查计算过程与答案
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
