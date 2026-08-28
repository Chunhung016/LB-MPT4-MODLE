import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { VerticalAdditionTemplate } from './common/VerticalAdditionTemplate';
import { LongDivisionTemplate } from './common/LongDivisionTemplate';
import { VerticalMultiplicationTemplate } from './common/VerticalMultiplicationTemplate';
import {
  MapPin,
  Navigation,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Plus,
  Minus,
  ShoppingCart,
  PieChart as PieIcon,
  Droplets,
  ArrowRight,
  Calculator,
  Percent,
  Layers,
  HelpCircle,
  Award,
  ChevronRight,
  Divide,
  Coins,
  Store
} from 'lucide-react';

export const Question8Comprehensive: React.FC = () => {
  // 当前子题目 Tab: '8a' | '8b' | '8c' | '8d'
  const [subTab, setSubTab] = useState<'8a' | '8b' | '8c' | '8d'>('8a');

  // ==========================================
  // 8(a) 路线距离交互状态
  // ==========================================
  type MapNode = 'hall' | 'park' | 'home' | 'lib';
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: 在礼堂, 1: 到达公园, 2: 回到家
  const [visitedNodes, setVisitedNodes] = useState<MapNode[]>(['hall']);
  const [inputDist1, setInputDist1] = useState<string>(''); // 1.2
  const [inputDist2, setInputDist2] = useState<string>(''); // 2.2
  const [inputTotalDist, setInputTotalDist] = useState<string>(''); // 3.4
  const [result8a, setResult8a] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  // 8(a) 角色移动
  const handleMoveTo = (node: MapNode) => {
    sound.playPop(520);
    if (currentStep === 0 && node === 'park') {
      setCurrentStep(1);
      setVisitedNodes(['hall', 'park']);
      setInputDist1('1.2');
    } else if (currentStep === 1 && node === 'home') {
      setCurrentStep(2);
      setVisitedNodes(['hall', 'park', 'home']);
      setInputDist2('2.2');
      setInputTotalDist('3.4');
      sound.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleReset8a = () => {
    sound.playPop(350);
    setCurrentStep(0);
    setVisitedNodes(['hall']);
    setInputDist1('');
    setInputDist2('');
    setInputTotalDist('');
    setResult8a(null);
  };

  const handleCheck8a = () => {
    const tot = parseFloat(inputTotalDist);
    if (tot === 3.4 || currentStep === 2) {
      sound.playSuccess();
      setResult8a({
        checked: true,
        isCorrect: true,
        feedback: '🎉 路线推导完全正确！礼堂到公园 1.2 km，公园到家 2.2 km，总行程为 1.2 + 2.2 = 3.4 km。',
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult8a({
        checked: true,
        isCorrect: false,
        feedback: '❌ 路线数值有误，请参考地图上标记的路段距离，并在直式方格中完成加法计算（1.2 + 2.2 = 3.4）。',
      });
    }
  };

  // ==========================================
  // 8(b) 容量分配交互状态
  // ==========================================
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [pouredProgress, setPouredProgress] = useState<number>(0); // 0..1
  const [inputLitre, setInputLitre] = useState<string>(''); // 2
  const [inputMl, setInputMl] = useState<string>(''); // 100
  const [activeDivisionTab, setActiveDivisionTab] = useState<'litre' | 'ml'>('litre');
  const [result8b, setResult8b] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  const handleStartPour = () => {
    if (isPouring) return;
    setIsPouring(true);
    sound.playPop(480);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      if (progress >= 1) {
        progress = 1;
        clearInterval(interval);
        setIsPouring(false);
        setPouredProgress(1);
        setInputLitre('2');
        setInputMl('100');
        sound.playSuccess();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        setPouredProgress(progress);
        sound.playMarble();
      }
    }, 60);
  };

  const handleReset8b = () => {
    sound.playPop(350);
    setIsPouring(false);
    setPouredProgress(0);
    setInputLitre('');
    setInputMl('');
    setResult8b(null);
  };

  const handleCheck8b = () => {
    const l = parseInt(inputLitre, 10);
    const ml = parseInt(inputMl, 10);
    if (l === 2 && ml === 100) {
      sound.playSuccess();
      setResult8b({
        checked: true,
        isCorrect: true,
        feedback: '🎉 答案完全正确！8 ℓ 400 ml ÷ 4 = (8 ℓ ÷ 4) + (400 ml ÷ 4) = 2 ℓ 100 ml。',
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult8b({
        checked: true,
        isCorrect: false,
        feedback: '❌ 容量计算有误，请在直式长除法模板中分别算出升数 (8 ÷ 4) 与毫升数 (400 ÷ 4)。',
      });
    }
  };

  // ==========================================
  // 8(c) 百分比计算交互状态
  // ==========================================
  const [selectedJuice, setSelectedJuice] = useState<'apple' | 'grape' | 'orange' | null>(null);
  const [inputTotalCups, setInputTotalCups] = useState<string>(''); // 120
  const [inputGrapePercent, setInputGrapePercent] = useState<string>(''); // 30
  const [result8c, setResult8c] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  const handleSelectJuice = (type: 'apple' | 'grape' | 'orange') => {
    setSelectedJuice(type);
    if (type === 'grape') {
      sound.playSuccess();
    } else {
      sound.playPop(520);
    }
  };

  const handleCheck8c = () => {
    const tot = parseInt(inputTotalCups, 10);
    const pct = parseInt(inputGrapePercent, 10);
    if (tot === 120 && pct === 30) {
      sound.playSuccess();
      setResult8c({
        checked: true,
        isCorrect: true,
        feedback: '🎉 恭喜！三款果汁总数为 120 杯；葡萄汁所占百分比为 (36 ÷ 120) × 100% = 30%。',
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult8c({
        checked: true,
        isCorrect: false,
        feedback: '❌ 计算有误，请先在直式加法中完成 24 + 36 + 60 = 120，再求百分比。',
      });
    }
  };

  const handleReset8c = () => {
    sound.playPop(350);
    setSelectedJuice(null);
    setInputTotalCups('');
    setInputGrapePercent('');
    setResult8c(null);
  };

  // ==========================================
  // 8(d) 单价比较与购物车仿真
  // ==========================================
  const [cartItems, setCartItems] = useState<{ store: 'sun' | 'success' | 'peace'; bundles: number }[]>([]);
  const [chosenBestStore, setChosenBestStore] = useState<string>(''); // 'success'
  const [activeShopDivision, setActiveShopDivision] = useState<'sun' | 'success'>('success');
  const [result8d, setResult8d] = useState<{ checked: boolean; isCorrect: boolean; feedback: string } | null>(null);

  const currentTotalBottles = cartItems.reduce((acc, item) => {
    if (item.store === 'sun') return acc + item.bundles * 2;
    if (item.store === 'success') return acc + item.bundles * 5;
    if (item.store === 'peace') return acc + item.bundles * 1;
    return acc;
  }, 0);

  const currentCartCost = cartItems.reduce((acc, item) => {
    if (item.store === 'sun') return acc + item.bundles * 9.40;
    if (item.store === 'success') return acc + item.bundles * 22.50;
    if (item.store === 'peace') return acc + item.bundles * 4.80;
    return acc;
  }, 0);

  const handleAddBundle = (store: 'sun' | 'success' | 'peace') => {
    sound.playPop(550);
    setCartItems((prev) => {
      const existing = prev.find((x) => x.store === store);
      if (existing) {
        return prev.map((x) => (x.store === store ? { ...x, bundles: x.bundles + 1 } : x));
      }
      return [...prev, { store, bundles: 1 }];
    });
  };

  const handleClearCart = () => {
    sound.playPop(350);
    setCartItems([]);
  };

  const handleFillTargetWith = (store: 'sun' | 'success' | 'peace') => {
    sound.playSuccess();
    if (store === 'sun') {
      setCartItems([{ store: 'sun', bundles: 5 }]);
    } else if (store === 'success') {
      setCartItems([{ store: 'success', bundles: 2 }]);
    } else if (store === 'peace') {
      setCartItems([{ store: 'peace', bundles: 10 }]);
    }
  };

  const handleCheck8d = () => {
    if (chosenBestStore === 'success') {
      sound.playSuccess();
      setResult8d({
        checked: true,
        isCorrect: true,
        feedback: '🎉 答对了！成功商店每瓶仅需 RM 4.50（购买 10 瓶只需 RM 45.00），是三间商店中最省钱的购买方案！',
      });
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
      setResult8d({
        checked: true,
        isCorrect: false,
        feedback: '❌ 方案不是最省钱的，请对比长除法单价：阳光 RM 4.70、成功 RM 4.50、和平 RM 4.80。',
      });
    }
  };

  return (
    <div className="space-y-6 text-stone-800">
      {/* 题头介绍卡片 - 魔法儿童友好大字体风格 */}
      <div className="bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-50 rounded-3xl p-6 border-3 border-amber-300 shadow-md relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1.5 bg-amber-500 text-white rounded-2xl text-sm sm:text-base font-black shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-200" />
              第 8 题
            </span>
            <span className="text-sm sm:text-base text-amber-950 font-black">
              生活综合应用题 · 路线 · 容量 · 饼图 · 单价
            </span>
          </div>
          <span className="text-xs sm:text-sm font-mono font-black text-amber-900 bg-white/90 px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
            ⭐ 共 4 小题 · 满分 8 分
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-amber-950 leading-tight">
          生活中的数学探究：标准直式运算与度量衡决策
        </h2>
        <p className="text-sm sm:text-base text-amber-900 font-bold mt-1.5">
          点击下方 4 个子任务，在整齐的直式方格纸（竖式）中填入答案，动手滑动体验数学魔法！
        </p>

        {/* 4 个子题目 Tab 切换器 (大按钮友好触控) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t-2 border-amber-200/80">
          {[
            { id: '8a', label: '8(a) 路线距离', icon: Navigation, desc: '直式小数加法' },
            { id: '8b', label: '8(b) 容量分配', icon: Droplets, desc: '直式长除法均分' },
            { id: '8c', label: '8(c) 百分比计算', icon: PieIcon, desc: '连加直式与百分比' },
            { id: '8d', label: '8(d) 单价比较', icon: ShoppingCart, desc: '长除法与乘法直式' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSubTab(tab.id as '8a' | '8b' | '8c' | '8d');
                  sound.playPop(500);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-md ring-4 ring-amber-300/60 scale-[1.02]'
                    : 'bg-white/90 text-stone-700 border-amber-200 hover:bg-white hover:border-amber-400 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-300' : 'text-amber-600'}`} />
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
      {/* 8(a) 路线距离与直式加法 */}
      {/* ========================================================================= */}
      {subTab === '8a' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：2D 互动探索地图 */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-amber-950 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-amber-600" />
                    路线互动地图 (点击建筑物前进)
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-900 bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-xl">
                    当前：{currentStep === 0 ? '社区礼堂' : currentStep === 1 ? '公园 🌳' : '已到达家 🏡'}
                  </span>
                </div>

                {/* SVG 矢量地图 */}
                <div className="relative bg-[#F9F7E8] rounded-2xl border-2 border-amber-200 p-2 overflow-hidden aspect-[16/10] shadow-inner">
                  <svg viewBox="0 0 500 320" className="w-full h-full select-none">
                    <rect x="0" y="0" width="500" height="320" fill="#F4EED8" rx="12" />
                    <circle cx="380" cy="180" r="65" fill="#E2EDD2" opacity="0.8" />
                    <circle cx="100" cy="80" r="50" fill="#E2EDD2" opacity="0.8" />

                    {/* 路线 1: 礼堂 (80, 220) -> 公园 (380, 220) 1.2 km */}
                    <line
                      x1="80"
                      y1="220"
                      x2="380"
                      y2="220"
                      stroke={currentStep >= 1 ? '#F59E0B' : '#CBD5E1'}
                      strokeWidth={currentStep >= 1 ? '7' : '4'}
                      strokeDasharray={currentStep >= 1 ? 'none' : '6 4'}
                    />
                    {/* 路线 2: 公园 (380, 220) -> 家 (240, 70) 2.2 km */}
                    <line
                      x1="380"
                      y1="220"
                      x2="240"
                      y2="70"
                      stroke={currentStep >= 2 ? '#F59E0B' : '#CBD5E1'}
                      strokeWidth={currentStep >= 2 ? '7' : '4'}
                      strokeDasharray={currentStep >= 2 ? 'none' : '6 4'}
                    />
                    <line x1="240" y1="70" x2="80" y2="70" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="4 4" />
                    <line x1="80" y1="70" x2="80" y2="220" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="4 4" />

                    {/* 路牌标签 */}
                    <g transform="translate(230, 235)">
                      <rect x="-40" y="-14" width="80" height="28" rx="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
                      <text x="0" y="5" fontSize="13" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="monospace">
                        1.2 km
                      </text>
                    </g>

                    <g transform="translate(325, 135)">
                      <rect x="-40" y="-14" width="80" height="28" rx="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
                      <text x="0" y="5" fontSize="13" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="monospace">
                        2.2 km
                      </text>
                    </g>

                    {/* 建筑 1: 礼堂 */}
                    <g
                      onClick={() => handleMoveTo('hall')}
                      className="cursor-pointer transition-transform hover:scale-110"
                      transform="translate(80, 220)"
                    >
                      <circle r="30" fill={visitedNodes.includes('hall') ? '#FEF3C7' : '#FFFFFF'} stroke="#D97706" strokeWidth="3" />
                      <text x="0" y="8" fontSize="22" textAnchor="middle">🏛️</text>
                      <text x="0" y="44" fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">
                        社区礼堂 (起点)
                      </text>
                    </g>

                    {/* 建筑 2: 公园 */}
                    <g
                      onClick={() => handleMoveTo('park')}
                      className="cursor-pointer transition-transform hover:scale-110"
                      transform="translate(380, 220)"
                    >
                      <circle r="30" fill={visitedNodes.includes('park') ? '#D1FAE5' : '#FFFFFF'} stroke="#059669" strokeWidth="3" />
                      <text x="0" y="8" fontSize="22" textAnchor="middle">🌳</text>
                      <text x="0" y="44" fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">
                        公园 (中途)
                      </text>
                    </g>

                    {/* 建筑 3: 家 */}
                    <g
                      onClick={() => handleMoveTo('home')}
                      className="cursor-pointer transition-transform hover:scale-110"
                      transform="translate(240, 70)"
                    >
                      <circle r="30" fill={visitedNodes.includes('home') ? '#FEE2E2' : '#FFFFFF'} stroke="#DC2626" strokeWidth="3" />
                      <text x="0" y="8" fontSize="22" textAnchor="middle">🏡</text>
                      <text x="0" y="44" fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">
                        家 (终点)
                      </text>
                    </g>

                    {/* 角色小人 */}
                    <g
                      transform={`translate(${
                        currentStep === 0 ? 80 : currentStep === 1 ? 380 : 240
                      }, ${currentStep === 0 ? 190 : currentStep === 1 ? 190 : 40})`}
                      className="transition-all duration-700 ease-out"
                    >
                      <circle r="16" fill="#1E293B" stroke="#FDE68A" strokeWidth="2.5" />
                      <text x="0" y="5" fontSize="14" textAnchor="middle" fill="#FFFFFF">
                        🚴
                      </text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* 底部导航提示 */}
              <div className="pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs sm:text-sm font-bold text-amber-950">
                  {currentStep === 0 && '👉 点击地图上的【公园 🌳】出发骑行！'}
                  {currentStep === 1 && '👉 点击地图上的【家 🏡】返回终点！'}
                  {currentStep === 2 && '🎉 路线已完成！请在右侧完成直式加法！'}
                </div>

                <div className="flex items-center gap-2">
                  {currentStep < 2 && (
                    <button
                      onClick={() => handleMoveTo(currentStep === 0 ? 'park' : 'home')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>前往下一站</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleReset8a}
                    className="px-3 py-2 text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition"
                  >
                    重置
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：整齐的直式加法方格模板 */}
            <div className="lg:col-span-6 space-y-4">
              <VerticalAdditionTemplate
                title="8(a) 行程总距离 · 直式加法"
                rows={['1.2', '2.2']}
                rowLabels={['礼堂→公园', '公园→家']}
                expectedSum="3.4"
                unit="km"
                decimalPlaces={1}
                onSolved={(val) => {
                  setInputTotalDist(val);
                  handleCheck8a();
                }}
              />

              {result8a && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                    result8a.isCorrect
                      ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                  }`}
                >
                  <span className="text-xl">{result8a.isCorrect ? '🎉' : '❌'}</span>
                  <div className="leading-relaxed">{result8a.feedback}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8(b) 容量分配与直式长除法 */}
      {/* ========================================================================= */}
      {subTab === '8b' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：果汁均分注水展示器 */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-amber-950 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-amber-600" />
                    果汁大罐均分分配器
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
                    总容量: 8 ℓ 400 ml
                  </span>
                </div>

                {/* 动态注水容器 */}
                <div className="bg-[#FAF8EE] p-5 rounded-2xl border-2 border-amber-200 space-y-6 shadow-inner">
                  {/* 大果汁总罐 */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs sm:text-sm font-black text-stone-800 mb-1.5 flex items-center gap-1.5">
                      <span>🥤 大果汁总罐</span>
                      <span className="font-mono text-amber-800 font-black">(8 ℓ 400 ml)</span>
                    </div>

                    <div className="relative w-40 h-32 bg-white border-3 border-stone-500 rounded-t-2xl rounded-b-lg overflow-hidden shadow-inner flex flex-col justify-end">
                      <div
                        style={{ height: `${(1 - pouredProgress) * 100}%` }}
                        className="w-full bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 transition-all duration-300 relative"
                      >
                        <div className="absolute top-0 left-0 right-0 h-2 bg-amber-200/90 animate-pulse"></div>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-50 font-mono text-[10px] font-bold">
                        <div className="border-b border-stone-600 w-6">8L</div>
                        <div className="border-b border-stone-600 w-4">6L</div>
                        <div className="border-b border-stone-600 w-6">4L</div>
                        <div className="border-b border-stone-600 w-4">2L</div>
                      </div>
                    </div>

                    {isPouring && (
                      <div className="flex justify-center gap-8 mt-1.5 animate-pulse">
                        <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                        <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                        <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                        <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* 4 个透明杯子 */}
                  <div className="grid grid-cols-4 gap-3 pt-3 border-t-2 border-amber-200">
                    {[1, 2, 3, 4].map((cupIdx) => (
                      <div key={cupIdx} className="flex flex-col items-center">
                        <div className="relative w-16 sm:w-20 h-24 bg-white border-2 border-stone-400 rounded-b-xl overflow-hidden shadow-xs flex flex-col justify-end">
                          <div
                            style={{ height: `${pouredProgress * 80}%` }}
                            className="w-full bg-gradient-to-t from-amber-500 to-amber-300 transition-all duration-300 relative"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-100"></div>
                          </div>
                          <div className="absolute right-0 top-2 bottom-2 flex flex-col justify-between pr-1 pointer-events-none opacity-40 font-mono text-[8px]">
                            <div className="w-2.5 border-t border-stone-600"></div>
                            <div className="w-3.5 border-t border-stone-600"></div>
                            <div className="w-2.5 border-t border-stone-600"></div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-stone-700 mt-1.5">
                          杯子 {cupIdx}
                        </span>
                        <span className="text-xs font-mono font-black text-amber-900">
                          {pouredProgress === 1 ? '2 ℓ 100 ml' : '0 ml'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 动画操作条 */}
              <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-3">
                <button
                  onClick={handleStartPour}
                  disabled={isPouring || pouredProgress === 1}
                  className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                    pouredProgress === 1
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <Droplets className="w-4 h-4" />
                  {isPouring ? '果汁均分流动中...' : pouredProgress === 1 ? '已均分完成' : '点击平分倒入 4 个杯子'}
                </button>

                <button
                  onClick={handleReset8b}
                  className="text-xs sm:text-sm font-bold text-stone-500 hover:text-stone-800 py-2 px-3 rounded-xl hover:bg-stone-100 transition"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 右侧：直式长除法方格模板 */}
            <div className="lg:col-span-6 space-y-4">
              {/* 子选项卡：升与毫升的长除法 */}
              <div className="flex items-center gap-2 bg-indigo-100/60 p-1.5 rounded-2xl border border-indigo-200">
                <button
                  onClick={() => setActiveDivisionTab('litre')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                    activeDivisionTab === 'litre'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-900 hover:bg-indigo-200/60'
                  }`}
                >
                  第 1 步：升部分 (8 ℓ ÷ 4)
                </button>
                <button
                  onClick={() => setActiveDivisionTab('ml')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                    activeDivisionTab === 'ml'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-900 hover:bg-indigo-200/60'
                  }`}
                >
                  第 2 步：毫升部分 (400 ml ÷ 4)
                </button>
              </div>

              {activeDivisionTab === 'litre' ? (
                <LongDivisionTemplate
                  title="8(b) 升部分长除法"
                  subtitle="将 8 升果汁平均分成 4 份"
                  divisor="4"
                  dividend="8"
                  quotient="2"
                  unit="ℓ"
                  steps={[{ multiply: '8', subtractResult: '0' }]}
                  onSolved={(val) => {
                    setInputLitre(val);
                  }}
                />
              ) : (
                <LongDivisionTemplate
                  title="8(b) 毫升部分长除法"
                  subtitle="将 400 毫升果汁平均分成 4 份"
                  divisor="4"
                  dividend="400"
                  quotient="100"
                  unit="ml"
                  steps={[
                    { multiply: '4', subtractResult: '00' },
                    { multiply: '0', subtractResult: '0' },
                  ]}
                  onSolved={(val) => {
                    setInputMl(val);
                  }}
                />
              )}

              {/* 答案汇总与检查 */}
              <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm space-y-3">
                <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center justify-between">
                  <span>每个杯子的最终容量：</span>
                  <span className="font-mono text-base font-black text-indigo-900">
                    {inputLitre || '?'} ℓ {inputMl || '?'} ml
                  </span>
                </div>

                <button
                  onClick={handleCheck8b}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" /> 检查每个杯子的容量
                </button>

                {result8b && (
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                      result8b.isCorrect
                        ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                    }`}
                  >
                    <span className="text-xl">{result8b.isCorrect ? '🎉' : '❌'}</span>
                    <div className="leading-relaxed">{result8b.feedback}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8(c) 百分比计算与直式三数连加 */}
      {/* ========================================================================= */}
      {subTab === '8c' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：数据表格与动态 SVG 饼图 */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-black text-amber-950 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <PieIcon className="w-4 h-4 text-purple-600" />
                    果汁销量统计与动态饼图
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-xl">
                    点击扇形高亮
                  </span>
                </div>

                {/* 上部数据卡片表 */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div
                    onClick={() => handleSelectJuice('apple')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 text-center cursor-pointer transition ${
                      selectedJuice === 'apple'
                        ? 'bg-rose-100 border-rose-400 ring-4 ring-rose-300'
                        : 'bg-[#FAF8EE] border-amber-200 hover:border-rose-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold text-stone-700">🍎 苹果汁</div>
                    <div className="text-lg sm:text-xl font-mono font-black text-rose-700 mt-1">24 杯</div>
                    <div className="text-xs text-stone-500 font-bold">20%</div>
                  </div>

                  <div
                    onClick={() => handleSelectJuice('grape')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 text-center cursor-pointer transition ${
                      selectedJuice === 'grape'
                        ? 'bg-purple-100 border-purple-500 ring-4 ring-purple-300 shadow-xs'
                        : 'bg-purple-50 border-purple-300 hover:border-purple-500'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-black text-purple-950 flex items-center justify-center gap-1">
                      <span>🍇 葡萄汁</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-black text-purple-800 mt-1">36 杯</div>
                    <div className="text-xs font-black text-purple-600">待求%</div>
                  </div>

                  <div
                    onClick={() => handleSelectJuice('orange')}
                    className={`p-3 sm:p-4 rounded-2xl border-2 text-center cursor-pointer transition ${
                      selectedJuice === 'orange'
                        ? 'bg-amber-100 border-amber-400 ring-4 ring-amber-300'
                        : 'bg-[#FAF8EE] border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold text-stone-700">🍊 橙汁</div>
                    <div className="text-lg sm:text-xl font-mono font-black text-amber-800 mt-1">60 杯</div>
                    <div className="text-xs text-stone-500 font-bold">50%</div>
                  </div>
                </div>

                {/* SVG 动态饼状图 */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-5 bg-[#FAF8EE] rounded-2xl border-2 border-amber-200 shadow-inner">
                  <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-sm select-none">
                    {/* 橙汁 50% */}
                    <path
                      d="M 100 100 L 180 100 A 80 80 0 0 1 20 100 Z"
                      fill="#F59E0B"
                      opacity={selectedJuice === 'orange' ? '1' : '0.85'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => handleSelectJuice('orange')}
                    />
                    {/* 葡萄汁 30% */}
                    <path
                      d="M 100 100 L 20 100 A 80 80 0 0 1 75.3 23.8 Z"
                      fill="#9333EA"
                      opacity={selectedJuice === 'grape' ? '1' : '0.85'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => handleSelectJuice('grape')}
                    />
                    {/* 苹果汁 20% */}
                    <path
                      d="M 100 100 L 75.3 23.8 A 80 80 0 0 1 180 100 Z"
                      fill="#EF4444"
                      opacity={selectedJuice === 'apple' ? '1' : '0.85'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => handleSelectJuice('apple')}
                    />
                    <circle cx="100" cy="100" r="32" fill="#FFFFFF" />
                    <text x="100" y="105" fontSize="12" fontWeight="900" fill="#334155" textAnchor="middle">
                      {selectedJuice === 'grape' ? '30%' : selectedJuice === 'orange' ? '50%' : selectedJuice === 'apple' ? '20%' : '100%'}
                    </text>
                  </svg>

                  <div className="space-y-2 text-xs sm:text-sm font-black text-stone-700">
                    <div onClick={() => handleSelectJuice('orange')} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                      <span>橙汁: 60 杯 (50%)</span>
                    </div>
                    <div onClick={() => handleSelectJuice('grape')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 text-purple-900 bg-purple-100 px-2.5 py-1 rounded-xl">
                      <span className="w-3.5 h-3.5 rounded-full bg-purple-600"></span>
                      <span>🍇 葡萄汁: 36 杯 (待求%)</span>
                    </div>
                    <div onClick={() => handleSelectJuice('apple')} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500"></span>
                      <span>苹果汁: 24 杯 (20%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：两步计算（第1步直式三数连加 + 第2步百分比） */}
            <div className="lg:col-span-6 space-y-4">
              {/* 第 1 步：直式三数连加 */}
              <VerticalAdditionTemplate
                title="第 1 步：总杯数 · 直式加法 (24 + 36 + 60)"
                rows={['24', '36', '60']}
                rowLabels={['苹果汁', '葡萄汁', '橙汁']}
                expectedSum="120"
                unit="杯"
                onSolved={(val) => {
                  setInputTotalCups(val);
                }}
              />

              {/* 第 2 步：百分比算式 */}
              <div className="bg-gradient-to-b from-purple-50/80 to-purple-100/50 rounded-3xl p-5 sm:p-6 border-2 border-purple-300 shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Percent className="w-4 h-4 text-purple-100" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-purple-950">
                      第 2 步：计算葡萄汁所占百分比 (%)
                    </h4>
                    <p className="text-xs text-purple-800 font-bold">
                      公式：(葡萄汁杯数 ÷ 总杯数) × 100%
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-purple-200 flex flex-wrap items-center justify-center gap-3 font-mono font-black text-base sm:text-lg">
                  <div className="flex flex-col items-center">
                    <span className="text-purple-900">36 (葡萄汁)</span>
                    <div className="w-24 h-1 bg-purple-400 my-0.5 rounded-full"></div>
                    <span className="text-purple-900">{inputTotalCups || '120'} (总杯数)</span>
                  </div>

                  <span className="text-purple-800 font-black text-xl">× 100% = </span>

                  <input
                    type="number"
                    value={inputGrapePercent}
                    onChange={(e) => setInputGrapePercent(e.target.value)}
                    placeholder="?"
                    className="w-20 h-12 rounded-xl text-center font-mono font-black text-2xl bg-purple-50 border-2 border-purple-500 text-purple-950 focus:outline-none focus:ring-4 focus:ring-purple-300"
                  />
                  <span className="text-2xl font-black text-purple-950">%</span>
                </div>

                <button
                  onClick={handleCheck8c}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" /> 验证葡萄汁百分比
                </button>

                {result8c && (
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                      result8c.isCorrect
                        ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                    }`}
                  >
                    <span className="text-xl">{result8c.isCorrect ? '🎉' : '❌'}</span>
                    <div className="leading-relaxed">{result8c.feedback}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8(d) 单价比较、长除法与购物车 */}
      {/* ========================================================================= */}
      {subTab === '8d' && (
        <div className="space-y-6 animate-fade-in">
          {/* 三家商店优惠卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. 阳光商店 */}
            <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-xl">
                    ☀️ 阳光商店
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">2 瓶装优惠</span>
                </div>
                <div className="text-2xl font-black text-stone-900 font-mono">
                  RM 9.40 <span className="text-xs font-sans text-stone-500 font-bold">/ 2 瓶</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-600 mt-1 font-mono font-bold">
                  单价：<code>RM 9.40 ÷ 2 = RM 4.70</code>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-amber-100">
                <button
                  onClick={() => handleAddBundle('sun')}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" /> 加入 1 组 (2 瓶)
                </button>
                <button
                  onClick={() => handleFillTargetWith('sun')}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-black transition"
                >
                  购买 10 瓶方案 (5 组 = RM 47.00)
                </button>
              </div>
            </div>

            {/* 2. 成功商店 (最优) */}
            <div className="bg-amber-50/70 rounded-3xl p-5 border-3 border-amber-400 shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden ring-4 ring-amber-200/50">
              <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-bl-xl shadow-xs">
                🔥 热门特惠
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-black text-amber-950 bg-amber-200 px-3 py-1 rounded-xl">
                    🌟 成功商店
                  </span>
                  <span className="text-xs font-mono font-black text-amber-800">5 瓶大包装</span>
                </div>
                <div className="text-2xl font-black text-amber-950 font-mono">
                  RM 22.50 <span className="text-xs font-sans text-amber-800 font-bold">/ 5 瓶</span>
                </div>
                <div className="text-xs sm:text-sm text-amber-900 mt-1 font-mono font-black">
                  单价：<code>RM 22.50 ÷ 5 = RM 4.50</code>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-amber-200">
                <button
                  onClick={() => handleAddBundle('success')}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> 加入 1 组 (5 瓶)
                </button>
                <button
                  onClick={() => handleFillTargetWith('success')}
                  className="w-full py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-xl text-xs font-black transition"
                >
                  购买 10 瓶方案 (2 组 = RM 45.00)
                </button>
              </div>
            </div>

            {/* 3. 和平商店 */}
            <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-black text-stone-800 bg-stone-100 px-3 py-1 rounded-xl">
                    🕊️ 和平商店
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500">单瓶零买</span>
                </div>
                <div className="text-2xl font-black text-stone-900 font-mono">
                  RM 4.80 <span className="text-xs font-sans text-stone-500 font-bold">/ 1 瓶</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-600 mt-1 font-mono font-bold">
                  单价：<code>RM 4.80 / 瓶</code>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-amber-100">
                <button
                  onClick={() => handleAddBundle('peace')}
                  className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" /> 加入 1 瓶 (RM 4.80)
                </button>
                <button
                  onClick={() => handleFillTargetWith('peace')}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-black transition"
                >
                  购买 10 瓶方案 (10 瓶 = RM 48.00)
                </button>
              </div>
            </div>
          </div>

          {/* 直式长除法与乘法比较区 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-amber-100/70 p-1.5 rounded-2xl border border-amber-200">
                <button
                  onClick={() => setActiveShopDivision('success')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                    activeShopDivision === 'success'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-900 hover:bg-amber-200/60'
                  }`}
                >
                  成功商店单价长除法 (22.50 ÷ 5)
                </button>
                <button
                  onClick={() => setActiveShopDivision('sun')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
                    activeShopDivision === 'sun'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-900 hover:bg-amber-200/60'
                  }`}
                >
                  阳光商店单价长除法 (9.40 ÷ 2)
                </button>
              </div>

              {activeShopDivision === 'success' ? (
                <LongDivisionTemplate
                  title="成功商店单价 · 直式长除法"
                  subtitle="RM 22.50 ÷ 5 瓶 = 每瓶单价"
                  divisor="5"
                  dividend="22.50"
                  quotient="4.50"
                  unit="RM"
                  steps={[
                    { multiply: '20', subtractResult: '2.5' },
                    { multiply: '2.5', subtractResult: '0' },
                  ]}
                />
              ) : (
                <LongDivisionTemplate
                  title="阳光商店单价 · 直式长除法"
                  subtitle="RM 9.40 ÷ 2 瓶 = 每瓶单价"
                  divisor="2"
                  dividend="9.40"
                  quotient="4.70"
                  unit="RM"
                  steps={[
                    { multiply: '8', subtractResult: '1.4' },
                    { multiply: '1.4', subtractResult: '0' },
                  ]}
                />
              )}
            </div>

            {/* 10 瓶总价直式乘法 */}
            <div className="space-y-4">
              <VerticalMultiplicationTemplate
                title="成功商店 10 瓶总价 · 直式乘法"
                factor1="4.50"
                factor2="10"
                expectedProduct="45.00"
                unit="RM"
                decimalPlaces={2}
              />

              {/* 最佳方案选择与结算 */}
              <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm space-y-3">
                <div className="text-xs sm:text-sm font-black text-stone-800">
                  请选择 10 瓶果汁最划算的购买方案：
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sun', name: '阳光商店 (RM 47.00)' },
                    { id: 'success', name: '🌟 成功商店 (RM 45.00)' },
                    { id: 'peace', name: '和平商店 (RM 48.00)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setChosenBestStore(s.id);
                        sound.playPop(520);
                      }}
                      className={`p-2.5 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                        chosenBestStore === s.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCheck8d}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" /> 验证最省钱购买方案
                </button>

                {result8d && (
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                      result8d.isCorrect
                        ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-2 border-rose-300 text-rose-800'
                    }`}
                  >
                    <span className="text-xl">{result8d.isCorrect ? '🎉' : '❌'}</span>
                    <div className="leading-relaxed">{result8d.feedback}</div>
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
