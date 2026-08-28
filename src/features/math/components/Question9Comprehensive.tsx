import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { VerticalAdditionTemplate } from './common/VerticalAdditionTemplate';
import { LongDivisionTemplate } from './common/LongDivisionTemplate';
import { VerticalSubtractionTemplate } from './common/VerticalSubtractionTemplate';
import {
  Users,
  Scale,
  Banknote,
  BarChart3,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Scissors,
  Link,
  Plus,
  Minus,
  ArrowRight,
  Calculator,
  Coins,
  DollarSign,
  Award
} from 'lucide-react';

export const Question9Comprehensive: React.FC = () => {
  // 当前子题目 Tab: '9a' | '9b' | '9c' | '9d'
  const [subTab, setSubTab] = useState<'9a' | '9b' | '9c' | '9d'>('9a');

  // ==========================================
  // 9(a) 比例与总数 (男女生数据条与 1/3)
  // ==========================================
  const [isBoysSplit, setIsBoysSplit] = useState<boolean>(false);
  const [isMerged, setIsMerged] = useState<boolean>(false);
  const [inputGirlsCount, setInputGirlsCount] = useState<string>(''); // 60
  const [inputTotalPeople, setInputTotalPeople] = useState<string>(''); // 240
  const [result9a, setResult9a] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  const handleSplitBoys = () => {
    sound.playPop(520);
    setIsBoysSplit(true);
    setInputGirlsCount('60');
  };

  const handleMergeAll = () => {
    if (!isBoysSplit) return;
    sound.playSuccess();
    setIsMerged(true);
    setInputTotalPeople('240');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleReset9a = () => {
    sound.playPop(350);
    setIsBoysSplit(false);
    setIsMerged(false);
    setInputGirlsCount('');
    setInputTotalPeople('');
    setResult9a(null);
  };

  const handleCheck9a = () => {
    const g = parseInt(inputGirlsCount, 10);
    const tot = parseInt(inputTotalPeople, 10);
    if (g === 60 && tot === 240) {
      sound.playSuccess();
      setResult9a({
        checked: true,
        isCorrect: true,
        feedback: '🎉 回答完全正确！女生人数为 180 ÷ 3 = 60 人；男女总人数为 180 + 60 = 240 人。',
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult9a({
        checked: true,
        isCorrect: false,
        feedback: '❌ 人数计算有误，女生占 1/3 (180 ÷ 3 = 60)，总人数为 180 + 60 = 240。',
      });
    }
  };

  // ==========================================
  // 9(b) 质量运算 (塑料瓶与铝罐称重及差值)
  // ==========================================
  const [inputPlasticTotal, setInputPlasticTotal] = useState<string>(''); // 6030
  const [inputDiffG, setInputDiffG] = useState<string>(''); // 1570
  const [result9b, setResult9b] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  const handleCheck9b = () => {
    const p = parseInt(inputPlasticTotal, 10);
    const d = parseInt(inputDiffG, 10);

    if (p === 6030 && d === 1570) {
      sound.playSuccess();
      setResult9b({
        checked: true,
        isCorrect: true,
        feedback: '🎉 质量运算完全正确！塑料瓶总重 6030 g (6 kg 30 g)，比铝罐 (4460 g) 多出 1570 g (1 kg 570 g)。',
      });
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult9b({
        checked: true,
        isCorrect: false,
        feedback: '❌ 计算有误，请在直式加法与减法模板中计算 3250 + 2780 = 6030 与 6030 - 4460 = 1570。',
      });
    }
  };

  const handleReset9b = () => {
    sound.playPop(350);
    setInputPlasticTotal('');
    setInputDiffG('');
    setResult9b(null);
  };

  // ==========================================
  // 9(c) 找零计算 (门票消费与 RM50 找零)
  // ==========================================
  const [inputTotalCost, setInputTotalCost] = useState<string>(''); // 40.30
  const [inputChangeAmount, setInputChangeAmount] = useState<string>(''); // 9.70
  const [pickedChange, setPickedChange] = useState<number[]>([]);
  const [result9c, setResult9c] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  const handleAddChange = (val: number) => {
    sound.playMarble();
    setPickedChange((prev) => [...prev, val]);
  };

  const handleClearPickedChange = () => {
    sound.playPop(350);
    setPickedChange([]);
  };

  const currentPickedTotal = pickedChange.reduce((a, b) => a + b, 0);

  const handleCheck9c = () => {
    const tot = parseFloat(inputTotalCost);
    const chg = parseFloat(inputChangeAmount);

    if ((tot === 40.3 || tot === 40.30) && (chg === 9.7 || chg === 9.70)) {
      sound.playSuccess();
      setResult9c({
        checked: true,
        isCorrect: true,
        feedback: '🎉 算式完全正确！总消费金额为 RM 40.30；使用 RM 50.00 付款需找回 RM 9.70。',
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult9c({
        checked: true,
        isCorrect: false,
        feedback: '❌ 金额计算有误，请在直式小数加法与减法模板中分别算出 RM 40.30 与找零 RM 9.70。',
      });
    }
  };

  const handleReset9c = () => {
    sound.playPop(350);
    setInputTotalCost('');
    setInputChangeAmount('');
    setPickedChange([]);
    setResult9c(null);
  };

  // ==========================================
  // 9(d) 拖拽条形统计图 (Interactive Bar Chart)
  // ==========================================
  const [craftVal, setCraftVal] = useState<number>(20); // 目标 50
  const [scienceVal, setScienceVal] = useState<number>(30); // 目标 80
  const [result9d, setResult9d] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleDragCraft = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const heightRatio = 1 - Math.max(0, Math.min(1, relativeY / rect.height));
    const rawVal = Math.round(heightRatio * 140);
    const snapped = Math.max(0, Math.min(140, Math.round(rawVal / 5) * 5));
    setCraftVal(snapped);
    sound.playMarble();
  };

  const handleDragScience = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const heightRatio = 1 - Math.max(0, Math.min(1, relativeY / rect.height));
    const rawVal = Math.round(heightRatio * 140);
    const snapped = Math.max(0, Math.min(140, Math.round(rawVal / 5) * 5));
    setScienceVal(snapped);
    sound.playMarble();
  };

  const handleCheck9d = () => {
    if (craftVal === 50 && scienceVal === 80) {
      sound.playSuccess();
      setResult9d({
        checked: true,
        isCorrect: true,
        feedback: '🎉 棒极了！条形统计图绘制完全正确：手工制作（比智力游戏少25人）= 50人；科学实验（比阅读少40人）= 80人。',
      });
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult9d({
        checked: true,
        isCorrect: false,
        feedback: `❌ 柱状图高度尚未对准：手工制作目标为 50人（当前 ${craftVal}人），科学实验目标为 80人（当前 ${scienceVal}人）。`,
      });
    }
  };

  const handleReset9d = () => {
    sound.playPop(350);
    setCraftVal(20);
    setScienceVal(30);
    setResult9d(null);
  };

  return (
    <div className="space-y-6 text-stone-800">
      {/* 题头介绍卡片 */}
      <div className="bg-gradient-to-r from-blue-100/90 via-indigo-50 to-blue-50 rounded-3xl p-6 border-3 border-blue-300 shadow-md relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1.5 bg-blue-600 text-white rounded-2xl text-sm sm:text-base font-black shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-200" />
              第 9 题
            </span>
            <span className="text-sm sm:text-base text-blue-950 font-black">
              综合探究题 · 比例 · 质量 · 找零 · 条形统计图
            </span>
          </div>
          <span className="text-xs sm:text-sm font-mono font-black text-blue-900 bg-white/90 px-3.5 py-1.5 rounded-xl border border-blue-300 shadow-2xs">
            ⭐ 共 4 小题 · 满分 8 分
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-blue-950 leading-tight">
          高年级数学探究建模：直式计算、环保质量与统计图拖拽
        </h2>
        <p className="text-sm sm:text-base text-blue-900 font-bold mt-1.5">
          在整齐的直式方格中填入各数位运算结果，动手拖拽条形统计图完成探索！
        </p>

        {/* 4 个子题目 Tab 切换器 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t-2 border-blue-200/80">
          {[
            { id: '9a', label: '9(a) 比例与总数', icon: Users, desc: '长除法与加法直式' },
            { id: '9b', label: '9(b) 质量运算', icon: Scale, desc: '直式加法与借位减法' },
            { id: '9c', label: '9(c) 找零计算', icon: Banknote, desc: '小数直式与收银' },
            { id: '9d', label: '9(d) 条形统计图', icon: BarChart3, desc: '拖拽柱体与减法' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSubTab(tab.id as '9a' | '9b' | '9c' | '9d');
                  sound.playPop(500);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-md ring-4 ring-blue-300/60 scale-[1.02]'
                    : 'bg-white/90 text-stone-700 border-blue-200 hover:bg-white hover:border-blue-400 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-300' : 'text-blue-600'}`} />
                  <span>{tab.label}</span>
                </div>
                <div className={`text-xs sm:text-sm mt-1 font-bold ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                  {tab.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9(a) 比例与总数 (数据条切分与直式) */}
      {/* ========================================================================= */}
      {subTab === '9a' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：数据长条模型 */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-blue-950 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    比例数据长条模型 (男生 180人，女生占 1/3)
                  </span>
                </div>

                <div className="bg-[#FAF8EE] p-5 rounded-2xl border-2 border-blue-100 space-y-5 shadow-inner">
                  {/* 男生数据条 */}
                  <div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-black text-blue-950 mb-1.5">
                      <span>👦 男生人数：180 人</span>
                      <span className="text-blue-600 font-mono">共 3 等份 (每份 60 人)</span>
                    </div>

                    <div className="h-14 bg-blue-500 rounded-2xl p-1.5 flex items-center justify-between shadow-xs transition-all">
                      {isBoysSplit ? (
                        <div className="grid grid-cols-3 gap-1.5 w-full h-full">
                          <div className="bg-blue-400/90 rounded-xl flex items-center justify-center text-white font-mono font-black text-sm sm:text-base border border-blue-300">
                            60
                          </div>
                          <div className="bg-blue-400/90 rounded-xl flex items-center justify-center text-white font-mono font-black text-sm sm:text-base border border-blue-300">
                            60
                          </div>
                          <div className="bg-blue-400/90 rounded-xl flex items-center justify-center text-white font-mono font-black text-sm sm:text-base border border-blue-300">
                            60
                          </div>
                        </div>
                      ) : (
                        <div className="w-full text-center text-white font-mono font-black text-base sm:text-lg">
                          180 人 (整体 1 条)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 女生数据条 */}
                  <div>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-black text-rose-950 mb-1.5">
                      <span>👧 女生人数：男生的 1/3 份</span>
                      <span className="text-rose-600 font-mono font-black">
                        {isBoysSplit ? '60 人' : '待求'}
                      </span>
                    </div>

                    <div className="h-14 bg-rose-50 rounded-2xl border-2 border-dashed border-rose-300 p-1.5 flex items-center shadow-xs">
                      {isBoysSplit && (
                        <div className="w-1/3 h-full bg-rose-500 rounded-xl flex items-center justify-center text-white font-mono font-black text-sm sm:text-base animate-pulse">
                          60 人 (1/3)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 切分与合并按钮 */}
              <div className="pt-3 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSplitBoys}
                    disabled={isBoysSplit}
                    className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                      isBoysSplit
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Scissors className="w-4 h-4" /> 1. 三等分男生条
                  </button>

                  <button
                    onClick={handleMergeAll}
                    disabled={!isBoysSplit || isMerged}
                    className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                      !isBoysSplit || isMerged
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Link className="w-4 h-4" /> 2. 合并求总人数
                  </button>
                </div>

                <button
                  onClick={handleReset9a}
                  className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 py-2 px-3 rounded-xl hover:bg-stone-100 transition"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 右侧：长除法与加法直式模板 */}
            <div className="lg:col-span-6 space-y-4">
              <LongDivisionTemplate
                title="第 1 步：女生人数 · 直式长除法"
                subtitle="180 人 ÷ 3 = 女生人数"
                divisor="3"
                dividend="180"
                quotient="60"
                unit="人"
                steps={[
                  { multiply: '18', subtractResult: '0' },
                  { multiply: '0', subtractResult: '0' },
                ]}
                onSolved={(val) => setInputGirlsCount(val)}
              />

              <VerticalAdditionTemplate
                title="第 2 步：男女总人数 · 直式加法"
                rows={['180', '60']}
                rowLabels={['男生人数', '女生人数']}
                expectedSum="240"
                unit="人"
                onSolved={(val) => {
                  setInputTotalPeople(val);
                  handleCheck9a();
                }}
              />

              {result9a && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                    result9a.isCorrect
                      ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                  }`}
                >
                  <span className="text-xl">{result9a.isCorrect ? '🎉' : '❌'}</span>
                  <div className="leading-relaxed">{result9a.feedback}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9(b) 质量运算 (直式加法与借位减法) */}
      {/* ========================================================================= */}
      {subTab === '9b' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：称重卡片 */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-blue-950 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-600" />
                    环保称重数据记录
                  </span>
                </div>

                <div className="space-y-3">
                  {/* 塑料瓶 */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-black text-emerald-950">
                      <span>🍾 塑料瓶分类组：</span>
                      <span className="font-mono">俊杰 + 美玲</span>
                    </div>
                    <div className="font-mono text-sm sm:text-base font-bold text-emerald-900 space-y-1">
                      <div>• 俊杰：3 kg 250 g = 3250 g</div>
                      <div>• 美玲：2780 g = 2 kg 780 g</div>
                      <div className="pt-1 font-black text-emerald-950 border-t border-emerald-200">
                        • 塑料瓶总质量：6030 g (6 kg 30 g)
                      </div>
                    </div>
                  </div>

                  {/* 铝罐 */}
                  <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-black text-amber-950">
                      <span>🥫 铝罐分类组：</span>
                      <span className="font-mono">阿米尔</span>
                    </div>
                    <div className="font-mono text-sm sm:text-base font-bold text-amber-900">
                      • 阿米尔：4 kg 460 g = 4460 g
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-bold">
                  单位换算：1 kg = 1000 g
                </span>
                <button
                  onClick={handleReset9b}
                  className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 py-2 px-3 rounded-xl hover:bg-stone-100 transition"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 右侧：两道整齐的直式模板（加法 + 借位减法） */}
            <div className="lg:col-span-7 space-y-4">
              <VerticalAdditionTemplate
                title="第 1 步：塑料瓶总重 · 直式加法 (3250 + 2780)"
                rows={['3250', '2780']}
                rowLabels={['俊杰', '美玲']}
                expectedSum="6030"
                unit="g"
                onSolved={(val) => setInputPlasticTotal(val)}
              />

              <VerticalSubtractionTemplate
                title="第 2 步：质量相差 · 直式借位减法 (6030 - 4460)"
                minuend="6030"
                subtrahend="4460"
                expectedDiff="1570"
                unit="g"
                onSolved={(val) => {
                  setInputDiffG(val);
                  handleCheck9b();
                }}
              />

              {result9b && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                    result9b.isCorrect
                      ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                  }`}
                >
                  <span className="text-xl">{result9b.isCorrect ? '🎉' : '❌'}</span>
                  <div className="leading-relaxed">{result9b.feedback}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9(c) 找零计算 (小数直式加法与减法) */}
      {/* ========================================================================= */}
      {subTab === '9c' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：门票与收银钱箱 */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-blue-950 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-blue-600" />
                    展馆门票价格表
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-stone-800">🔬 科学馆门票</span>
                    <span className="font-mono font-black text-blue-950">RM 12.00</span>
                  </div>
                  <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-stone-800">🪐 天文馆门票</span>
                    <span className="font-mono font-black text-indigo-950">RM 18.50</span>
                  </div>
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-stone-800">🎨 创意工作坊</span>
                    <span className="font-mono font-black text-amber-950">RM 9.80</span>
                  </div>
                </div>

                {/* 模拟找零钱币点击 */}
                <div className="mt-4 pt-3 border-t border-blue-100">
                  <div className="text-xs sm:text-sm font-black text-stone-800 mb-2 flex items-center justify-between">
                    <span>💵 模拟找零钱币箱：</span>
                    <span className="font-mono font-black text-emerald-800">
                      已选: RM {currentPickedTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'RM 5', val: 5 },
                      { label: 'RM 1', val: 1 },
                      { label: '50 sen', val: 0.5 },
                      { label: '20 sen', val: 0.2 },
                    ].map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddChange(c.val)}
                        className="py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 text-center"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleClearPickedChange}
                      className="text-xs font-bold text-stone-400 hover:text-stone-700"
                    >
                      清空挑选
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-bold">付款金额：RM 50.00</span>
                <button
                  onClick={handleReset9c}
                  className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 py-2 px-3 rounded-xl hover:bg-stone-100 transition"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 右侧：小数直式加法与减法 */}
            <div className="lg:col-span-7 space-y-4">
              <VerticalAdditionTemplate
                title="第 1 步：总消费 · 小数直式加法"
                rows={['12.00', '18.50', '9.80']}
                rowLabels={['科学馆', '天文馆', '工作坊']}
                expectedSum="40.30"
                unit="RM"
                decimalPlaces={2}
                onSolved={(val) => setInputTotalCost(val)}
              />

              <VerticalSubtractionTemplate
                title="第 2 步：找零金额 · 小数直式减法 (50.00 - 40.30)"
                minuend="50.00"
                subtrahend="40.30"
                expectedDiff="9.70"
                unit="RM"
                decimalPlaces={2}
                onSolved={(val) => {
                  setInputChangeAmount(val);
                  handleCheck9c();
                }}
              />

              {result9c && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                    result9c.isCorrect
                      ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                  }`}
                >
                  <span className="text-xl">{result9c.isCorrect ? '🎉' : '❌'}</span>
                  <div className="leading-relaxed">{result9c.feedback}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9(d) 拖拽条形统计图 (Interactive Bar Chart) */}
      {/* ========================================================================= */}
      {subTab === '9d' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：题目已知条件与竖式减法计算提示 */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-blue-950 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    各活动参与人数条件
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="text-xs sm:text-sm font-bold text-stone-800">📖 1. 阅读活动 (已知)</div>
                    <div className="font-mono font-black text-lg text-blue-950 mt-1">120 人</div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <div className="text-xs sm:text-sm font-bold text-stone-800">🧩 2. 智力游戏 (已知)</div>
                    <div className="font-mono font-black text-lg text-emerald-950 mt-1">75 人</div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-2xl border-2 border-purple-300">
                    <div className="text-xs sm:text-sm font-black text-purple-950">✂️ 3. 手工制作 (待绘制)</div>
                    <div className="text-xs text-purple-800 mt-1 font-mono">
                      条件：比智力游戏少 25 人 → <code>75 - 25 = 50 人</code>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300">
                    <div className="text-xs sm:text-sm font-black text-amber-950">🧪 4. 科学实验 (待绘制)</div>
                    <div className="text-xs text-amber-800 mt-1 font-mono">
                      条件：比阅读活动少 40 人 → <code>120 - 40 = 80 人</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100 flex items-center justify-between">
                <button
                  onClick={handleReset9d}
                  className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 py-2 px-3 rounded-xl hover:bg-stone-100 transition"
                >
                  重置统计图
                </button>
              </div>
            </div>

            {/* 右侧：交互式拖拽条形图 */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-blue-950">
                    📊 交互式条形统计图 (上下拖动黄色手柄调整高度)
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">刻度范围: 0 ~ 140 人</span>
                </div>

                {/* 柱状图画布容器 */}
                <div
                  ref={chartContainerRef}
                  className="relative h-72 bg-[#FAF8EE] rounded-2xl border-2 border-blue-100 p-4 flex items-end justify-around select-none shadow-inner"
                >
                  {/* 背景刻度横线 */}
                  <div className="absolute inset-x-4 inset-y-4 flex flex-col justify-between pointer-events-none opacity-30">
                    {[140, 120, 100, 80, 60, 40, 20, 0].map((tick) => (
                      <div key={tick} className="border-b border-stone-500 w-full flex items-center justify-start text-[10px] font-mono pl-1">
                        {tick}
                      </div>
                    ))}
                  </div>

                  {/* 柱 1: 阅读活动 (固定 120) */}
                  <div className="flex flex-col items-center z-10 w-16 sm:w-20">
                    <div className="font-mono font-black text-xs sm:text-sm text-blue-900 mb-1">120</div>
                    <div
                      style={{ height: `${(120 / 140) * 190}px` }}
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl shadow-xs"
                    />
                    <span className="text-[11px] sm:text-xs font-black text-stone-700 mt-2 text-center">
                      阅读活动
                    </span>
                  </div>

                  {/* 柱 2: 智力游戏 (固定 75) */}
                  <div className="flex flex-col items-center z-10 w-16 sm:w-20">
                    <div className="font-mono font-black text-xs sm:text-sm text-emerald-900 mb-1">75</div>
                    <div
                      style={{ height: `${(75 / 140) * 190}px` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl shadow-xs"
                    />
                    <span className="text-[11px] sm:text-xs font-black text-stone-700 mt-2 text-center">
                      智力游戏
                    </span>
                  </div>

                  {/* 柱 3: 手工制作 (拖拽调整 目标 50) */}
                  <div className="flex flex-col items-center z-10 w-16 sm:w-20">
                    <div className="font-mono font-black text-xs sm:text-sm text-purple-900 mb-1">
                      {craftVal} 人
                    </div>
                    <div
                      style={{ height: `${(craftVal / 140) * 190}px` }}
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-xl relative shadow-xs transition-all"
                    >
                      {/* 拖动手柄 */}
                      <div
                        onMouseDown={() => {
                          const onMove = (e: MouseEvent) => handleDragCraft(e as unknown as React.MouseEvent);
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                        onTouchMove={handleDragCraft}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-amber-400 border-2 border-amber-600 rounded-full flex items-center justify-center cursor-ns-resize shadow-md hover:scale-110 active:scale-95"
                      >
                        <div className="w-3 h-1 bg-amber-900 rounded-full" />
                      </div>
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-purple-950 mt-2 text-center">
                      ✂️ 手工 (拖拽)
                    </span>
                  </div>

                  {/* 柱 4: 科学实验 (拖拽调整 目标 80) */}
                  <div className="flex flex-col items-center z-10 w-16 sm:w-20">
                    <div className="font-mono font-black text-xs sm:text-sm text-amber-900 mb-1">
                      {scienceVal} 人
                    </div>
                    <div
                      style={{ height: `${(scienceVal / 140) * 190}px` }}
                      className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-xl relative shadow-xs transition-all"
                    >
                      {/* 拖动手柄 */}
                      <div
                        onMouseDown={() => {
                          const onMove = (e: MouseEvent) => handleDragScience(e as unknown as React.MouseEvent);
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                        onTouchMove={handleDragScience}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-amber-400 border-2 border-amber-600 rounded-full flex items-center justify-center cursor-ns-resize shadow-md hover:scale-110 active:scale-95"
                      >
                        <div className="w-3 h-1 bg-amber-900 rounded-full" />
                      </div>
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-amber-950 mt-2 text-center">
                      🧪 实验 (拖拽)
                    </span>
                  </div>
                </div>
              </div>

              {/* 答案校验 */}
              <div className="space-y-3 pt-3 border-t border-blue-100">
                <button
                  onClick={handleCheck9d}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" /> 校验条形统计图高度
                </button>

                {result9d && (
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                      result9d.isCorrect
                        ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                    }`}
                  >
                    <span className="text-xl">{result9d.isCorrect ? '🎉' : '❌'}</span>
                    <div className="leading-relaxed">{result9d.feedback}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
