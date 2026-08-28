import React, { useState } from 'react';
import { Sparkles, RotateCcw, Leaf, Droplets, Wind } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface EquationItem {
  id: string;
  name: string;
  type: 'reactant' | 'product';
  color: string;
  iconType: string;
}

const EQUATION_ITEMS: EquationItem[] = [
  { id: 'water', name: '水', type: 'reactant', color: '#0284c7', iconType: 'Droplets' },
  { id: 'co2', name: '二氧化碳', type: 'reactant', color: '#475569', iconType: 'Wind' },
  { id: 'glucose', name: '葡萄糖', type: 'product', color: '#b45309', iconType: 'Leaf' },
  { id: 'oxygen', name: '氧气', type: 'product', color: '#15803d', iconType: 'Sparkles' },
];

interface PhotosynthesisLabProps {
  onComplete?: (score: number) => void;
}

export const PhotosynthesisLab: React.FC<PhotosynthesisLabProps> = ({ onComplete }) => {
  const [reactantSlots, setReactantSlots] = useState<(string | null)[]>([null, null]);
  const [productSlots, setProductSlots] = useState<(string | null)[]>([null, null]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleQuickPlace = (item: EquationItem) => {
    sounds.playPop();
    if (item.type === 'reactant') {
      const emptyIdx = reactantSlots.findIndex((s) => s === null);
      if (emptyIdx !== -1 && !reactantSlots.includes(item.id)) {
        const next = [...reactantSlots];
        next[emptyIdx] = item.id;
        setReactantSlots(next);
      }
    } else {
      const emptyIdx = productSlots.findIndex((s) => s === null);
      if (emptyIdx !== -1 && !productSlots.includes(item.id)) {
        const next = [...productSlots];
        next[emptyIdx] = item.id;
        setProductSlots(next);
      }
    }
  };

  const handleRemoveSlot = (slotType: 'reactant' | 'product', slotIndex: number) => {
    sounds.playPop();
    if (slotType === 'reactant') {
      const next = [...reactantSlots];
      next[slotIndex] = null;
      setReactantSlots(next);
    } else {
      const next = [...productSlots];
      next[slotIndex] = null;
      setProductSlots(next);
    }
  };

  const handleToggleCondition = (condId: string) => {
    sounds.playPop();
    if (selectedConditions.includes(condId)) {
      setSelectedConditions((prev) => prev.filter((id) => id !== condId));
    } else {
      if (selectedConditions.length < 2) {
        setSelectedConditions((prev) => [...prev, condId]);
      } else {
        sounds.playError();
      }
    }
  };

  const isReactantsCorrect = reactantSlots.includes('water') && reactantSlots.includes('co2');
  const isProductsCorrect = productSlots.includes('glucose') && productSlots.includes('oxygen');
  const isEquationFullyCorrect = isReactantsCorrect && isProductsCorrect;
  const isConditionsCorrect = selectedConditions.includes('opt1') && selectedConditions.includes('opt3') && selectedConditions.length === 2;
  const isAllValid = isEquationFullyCorrect && isConditionsCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (isAllValid) {
      sounds.playSuccess();
      onComplete?.(4);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setReactantSlots([null, null]);
    setProductSlots([null, null]);
    setSelectedConditions([]);
    setShowResult(false);
    sounds.playPop();
  };

  return (
    <div className="h-full flex flex-col justify-between gap-2 overflow-hidden" id="photosynthesis-lab-module">
      {/* Sub Header */}
      <div className="bg-white rounded-2xl px-4 py-2 border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
            乙组 · 第 2 题 [4分]
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-emerald-600" />
            植物光合作用方程式与温室对照
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            填补反应物与产物并判断必要条件
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer active:scale-95"
          id="reset-btn-mod2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>

      {/* Main 2-Column iPad View Workbench */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* Left Side: Equation Flow Board + Greenhouse Comparison */}
        <div className="md:col-span-7 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Question 2(a) Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 shrink-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black">1</span>
              2 (a). 填补植物光合作用完整方程式 [2分]
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              反应物 → 产物
            </span>
          </div>

          {/* Visual Formula Chain Board */}
          <div className="p-2.5 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-sky-50/70 rounded-xl border border-emerald-200 my-1">
            <div className="grid grid-cols-11 items-center gap-1 text-center font-black">
              {/* Reactant 1 */}
              <button
                onClick={() => reactantSlots[0] && handleRemoveSlot('reactant', 0)}
                className={`col-span-2 min-h-[48px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition cursor-pointer ${
                  reactantSlots[0]
                    ? 'border-emerald-500 bg-white shadow-2xs hover:border-rose-400'
                    : 'border-emerald-300 bg-white/70 hover:border-emerald-500'
                }`}
              >
                {reactantSlots[0] ? (
                  <span className="text-xs font-black text-emerald-800">
                    {EQUATION_ITEMS.find((i) => i.id === reactantSlots[0])?.name} ✕
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-bold">反应物 1</span>
                )}
              </button>

              <div className="col-span-1 text-xs text-emerald-700 font-black">+</div>

              {/* Reactant 2 */}
              <button
                onClick={() => reactantSlots[1] && handleRemoveSlot('reactant', 1)}
                className={`col-span-2 min-h-[48px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition cursor-pointer ${
                  reactantSlots[1]
                    ? 'border-emerald-500 bg-white shadow-2xs hover:border-rose-400'
                    : 'border-emerald-300 bg-white/70 hover:border-emerald-500'
                }`}
              >
                {reactantSlots[1] ? (
                  <span className="text-xs font-black text-emerald-800">
                    {EQUATION_ITEMS.find((i) => i.id === reactantSlots[1])?.name} ✕
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-bold">反应物 2</span>
                )}
              </button>

              {/* Conditions on Arrow */}
              <div className="col-span-1 flex flex-col items-center justify-center py-0.5">
                <span className="text-[8px] bg-amber-100 text-amber-900 px-1 rounded-full font-bold">阳光</span>
                <span className="text-xs font-black text-emerald-700">▶</span>
                <span className="text-[8px] bg-emerald-100 text-emerald-900 px-1 rounded-full font-bold">叶绿素</span>
              </div>

              {/* Product 1 */}
              <button
                onClick={() => productSlots[0] && handleRemoveSlot('product', 0)}
                className={`col-span-2 min-h-[48px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition cursor-pointer ${
                  productSlots[0]
                    ? 'border-emerald-500 bg-white shadow-2xs hover:border-rose-400'
                    : 'border-emerald-300 bg-white/70 hover:border-emerald-500'
                }`}
              >
                {productSlots[0] ? (
                  <span className="text-xs font-black text-amber-800">
                    {EQUATION_ITEMS.find((i) => i.id === productSlots[0])?.name} ✕
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 font-bold">产物 1</span>
                )}
              </button>

              <div className="col-span-1 text-xs text-emerald-700 font-black">+</div>

              {/* Product 2 */}
              <button
                onClick={() => productSlots[1] && handleRemoveSlot('product', 1)}
                className={`col-span-2 min-h-[48px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition cursor-pointer ${
                  productSlots[1]
                    ? 'border-emerald-500 bg-white shadow-2xs hover:border-rose-400'
                    : 'border-emerald-300 bg-white/70 hover:border-emerald-500'
                }`}
              >
                {productSlots[1] ? (
                  <span className="text-xs font-black text-emerald-800">
                    {EQUATION_ITEMS.find((i) => i.id === productSlots[1])?.name} ✕
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-bold">产物 2</span>
                )}
              </button>
            </div>
          </div>

          {/* Formula Items Tray */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 my-1">
            <div className="text-[11px] text-slate-600 mb-1 font-bold flex items-center justify-between">
              <span>待选物质：</span>
              <span className="text-[10px] text-slate-400">点击放入上方方框</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {EQUATION_ITEMS.map((item) => {
                const isUsed = reactantSlots.includes(item.id) || productSlots.includes(item.id);
                return (
                  <button
                    key={item.id}
                    disabled={isUsed}
                    onClick={() => !isUsed && handleQuickPlace(item)}
                    className={`p-1.5 rounded-xl border transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      isUsed
                        ? 'bg-slate-100 border-slate-200 opacity-40 cursor-default'
                        : 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-400 shadow-2xs'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.iconType === 'Droplets' && <Droplets className="w-3 h-3" />}
                      {item.iconType === 'Wind' && <Wind className="w-3 h-3" />}
                      {item.iconType === 'Leaf' && <Leaf className="w-3 h-3" />}
                      {item.iconType === 'Sparkles' && <Sparkles className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Greenhouse P vs Q Comparison */}
          <div className="rounded-xl border border-slate-200 p-2 bg-slate-50/50 mt-1">
            <div className="text-[11px] font-extrabold text-slate-700 mb-1">
              温室对照实验观察：
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Greenhouse P */}
              <div className="bg-amber-50/80 rounded-lg p-2 border border-amber-200 flex items-center gap-2">
                <svg viewBox="0 0 60 60" className="w-10 h-10 shrink-0">
                  <polygon points="18,50 42,50 39,32 21,32" fill="#ca8a04" stroke="#a16207" strokeWidth="1.5" />
                  <ellipse cx="30" cy="32" rx="10" ry="2" fill="#78350f" />
                  <path d="M 30 32 Q 32 20 42 22" fill="none" stroke="#a16207" strokeWidth="2" />
                  <path d="M 42 22 Q 48 26 45 30 Q 40 28 42 22 Z" fill="#eab308" />
                </svg>
                <div>
                  <div className="text-xs font-black text-amber-900">温室 P (缺水/无光)</div>
                  <div className="text-[10px] text-amber-700">植物泛黄枯萎</div>
                </div>
              </div>

              {/* Greenhouse Q */}
              <div className="bg-emerald-50/80 rounded-lg p-2 border border-emerald-200 flex items-center gap-2">
                <svg viewBox="0 0 60 60" className="w-10 h-10 shrink-0">
                  <circle cx="48" cy="12" r="6" fill="#fde047" opacity="0.8" />
                  <polygon points="18,50 42,50 39,32 21,32" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
                  <ellipse cx="30" cy="32" rx="10" ry="2" fill="#78350f" />
                  <path d="M 30 32 Q 30 18 30 14" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                  <path d="M 30 24 Q 15 20 18 14 Q 27 17 30 24 Z" fill="#22c55e" />
                  <path d="M 30 20 Q 45 16 42 10 Q 33 14 30 20 Z" fill="#16a34a" />
                </svg>
                <div>
                  <div className="text-xs font-black text-emerald-900">温室 Q (充足阳光+水分)</div>
                  <div className="text-[10px] text-emerald-700">植物翠绿茁壮</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Question 2(b) & Validation */}
        <div className="md:col-span-5 flex flex-col justify-between gap-2 overflow-hidden">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black">2</span>
                  2 (b). 勾选 2 个光合作用必要条件 [2分]
                </h3>
              </div>

              <p className="text-xs text-slate-600 font-medium my-2">
                根据温室实验，勾选植物进行光合作用必须具备的条件：
              </p>

              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'opt1', text: '植物需要吸收充足的水分', isCorrect: true },
                  { id: 'opt2', text: '植物必须置于完全黑暗无光的环境中', isCorrect: false },
                  { id: 'opt3', text: '叶片内的叶绿素能捕获太阳光能', isCorrect: true },
                  { id: 'opt4', text: '必须把植物放入无二氧化碳的容器中', isCorrect: false },
                ].map((opt) => {
                  const isSelected = selectedConditions.includes(opt.id);

                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleToggleCondition(opt.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[11px]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600"
                        />
                        {opt.text}
                      </span>

                      {showResult && (
                        <span className={`text-[10px] font-black ${opt.isCorrect === isSelected ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {opt.isCorrect ? '✓' : isSelected ? '✗' : ''}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Validation & Result */}
            <div className="space-y-1.5 pt-2">
              {showResult && (
                <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isAllValid ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>
                  {isAllValid ? '🎉 答案完全正确！(获得 4 分)' : '⚠️ 反应物为水与二氧化碳，产物为葡萄糖与氧气；条件勾选第 1 项与第 3 项。'}
                </div>
              )}

              <button
                onClick={handleValidate}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                id="validate-mod2-btn"
              >
                <Sparkles className="w-4 h-4" />
                提交核对答案 (4分)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
