import React, { useState } from 'react';
import { Sparkles, RotateCcw, CheckCircle2, BookmarkCheck, Stamp, Sprout } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PlantCard {
  id: string;
  name: string;
  methodId: string;
  iconEmoji: string;
  hint: string;
}

interface MethodCard {
  id: string;
  name: string;
  desc: string;
}

const PLANTS: PlantCard[] = [
  { id: 'chili', name: '辣椒', methodId: 'seed', iconEmoji: '🌶️', hint: '果实内含多颗坚硬种子' },
  { id: 'snake_plant', name: '虎尾兰', methodId: 'leaf', iconEmoji: '🪴', hint: '叶片切段插入土壤生根' },
  { id: 'banana', name: '香蕉', methodId: 'sucker', iconEmoji: '🍌', hint: '母株基部长出新吸芽' },
  { id: 'potato', name: '马铃薯', methodId: 'underground_stem', iconEmoji: '🥔', hint: '块茎表面芽眼萌发成苗' },
];

const METHODS: MethodCard[] = [
  { id: 'seed', name: '种子', desc: '靠果实内的种子发芽繁衍' },
  { id: 'leaf', name: '叶子', desc: '靠叶片边沿或插叶发根生长' },
  { id: 'sucker', name: '吸芽', desc: '从母株根部生长出的幼苗' },
  { id: 'underground_stem', name: '地下茎', desc: '地下膨大的块茎或根状茎萌芽' },
];

interface PlantReproductionDetectiveProps {
  onComplete?: (score: number) => void;
}

export const PlantReproductionDetective: React.FC<PlantReproductionDetectiveProps> = ({ onComplete }) => {
  const [connections, setConnections] = useState<{ plantId: string; methodId: string }[]>([]);
  const [activePlantId, setActivePlantId] = useState<string | null>(null);

  const [activeStampTool, setActiveStampTool] = useState<'是' | '不是'>('是');
  const [stamps, setStamps] = useState<{ [key: string]: '是' | '不是' | null }>({
    q_d1: null,
    q_d2: null,
  });

  const [conclusionChoice, setConclusionChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handlePlantClick = (plantId: string) => {
    sounds.playPop();
    setActivePlantId(activePlantId === plantId ? null : plantId);
  };

  const handleMethodClick = (methodId: string) => {
    if (!activePlantId) return;
    sounds.playSnap();
    const filtered = connections.filter((c) => c.plantId !== activePlantId);
    setConnections([...filtered, { plantId: activePlantId, methodId }]);
    setActivePlantId(null);
  };

  const handleRemoveConnection = (plantId: string) => {
    sounds.playPop();
    setConnections(connections.filter((c) => c.plantId !== plantId));
  };

  const handleApplyStamp = (questionKey: 'q_d1' | 'q_d2') => {
    sounds.playStamp();
    setStamps((prev) => ({
      ...prev,
      [questionKey]: activeStampTool,
    }));
  };

  const isChiliCorrect = connections.some((c) => c.plantId === 'chili' && c.methodId === 'seed');
  const isSnakePlantCorrect = connections.some((c) => c.plantId === 'snake_plant' && c.methodId === 'leaf');
  const isBananaCorrect = connections.some((c) => c.plantId === 'banana' && c.methodId === 'sucker');
  const isPotatoCorrect = connections.some((c) => c.plantId === 'potato' && c.methodId === 'underground_stem');
  const isConnectionsAllCorrect =
    isChiliCorrect && isSnakePlantCorrect && isBananaCorrect && isPotatoCorrect && connections.length === 4;

  const isStamp1Correct = stamps.q_d1 === '不是';
  const isStamp2Correct = stamps.q_d2 === '是';
  const isStampsAllCorrect = isStamp1Correct && isStamp2Correct;
  const isConclusionCorrect = conclusionChoice === 'opt1';
  const isAllCompleted = isConnectionsAllCorrect && isStampsAllCorrect && isConclusionCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (isAllCompleted) {
      sounds.playSuccess();
      onComplete?.(6);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setConnections([]);
    setActivePlantId(null);
    setStamps({ q_d1: null, q_d2: null });
    setConclusionChoice(null);
    setShowResult(false);
    sounds.playPop();
  };

  return (
    <div className="h-full flex flex-col justify-between gap-2 overflow-hidden" id="plant-reproduction-module">
      {/* Sub Header */}
      <div className="bg-white rounded-2xl px-4 py-2 border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-xs font-black border border-orange-300">
            丙组 · 第 1 题 [6分]
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-orange-600" />
            植物繁殖方法配对与结论判定
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            点击植物与方法进行配对，使用印章与单选完成结论
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer active:scale-95"
          id="reset-btn-mod3"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>

      {/* Main 2-Column iPad View Workbench */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* Left Side: Plant & Method Match Line Board */}
        <div className="md:col-span-6 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 shrink-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[11px] font-black">1</span>
              1 (a). 植物与繁殖方法配对连线 [2分]
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
              已配对: {connections.length} / 4
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 my-1">
            {/* Plants */}
            <div className="space-y-1.5 flex flex-col justify-around">
              <div className="text-[11px] font-black text-slate-600">🌱 植物标本：</div>
              {PLANTS.map((plant) => {
                const isSelected = activePlantId === plant.id;
                const matchedConn = connections.find((c) => c.plantId === plant.id);
                const matchedMethod = matchedConn ? METHODS.find((m) => m.id === matchedConn.methodId) : null;

                return (
                  <button
                    key={plant.id}
                    onClick={() => handlePlantClick(plant.id)}
                    className={`w-full p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-400/50 shadow-xs'
                        : matchedConn
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{plant.iconEmoji}</span>
                      <div>
                        <div className="text-xs font-black text-slate-900">{plant.name}</div>
                        <div className="text-[9px] text-slate-400">{plant.hint}</div>
                      </div>
                    </div>

                    {matchedMethod && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveConnection(plant.id);
                        }}
                        className="text-[10px] font-black bg-white px-1.5 py-0.5 rounded-md border border-emerald-300 text-emerald-800"
                      >
                        {matchedMethod.name} ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Methods */}
            <div className="space-y-1.5 flex flex-col justify-around">
              <div className="text-[11px] font-black text-slate-600">🏷️ 繁殖方法：</div>
              {METHODS.map((method) => {
                const matchedConns = connections.filter((c) => c.methodId === method.id);

                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodClick(method.id)}
                    className={`w-full p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer active:scale-95 ${
                      matchedConns.length > 0
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                        : activePlantId
                        ? 'border-orange-400 bg-orange-50 animate-pulse'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {method.name}
                      </div>
                      <div className="text-[9px] text-slate-500">{method.desc}</div>
                    </div>

                    {matchedConns.length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Stamp Tool & 1(d) & 1(e) */}
        <div className="md:col-span-6 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 shrink-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[11px] font-black">2</span>
                1 (d) & 1 (e). 调查结论与印章判定 [4分]
              </h3>
            </div>

            {/* Stamp Toolbar */}
            <div className="p-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl flex items-center justify-between my-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-black">
                <Stamp className="w-4 h-4 text-yellow-300" />
                <span>印章工具：</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveStampTool('是');
                    sounds.playPop();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black border transition cursor-pointer active:scale-95 ${
                    activeStampTool === '是'
                      ? 'bg-yellow-400 text-yellow-950 border-yellow-200 shadow-xs'
                      : 'bg-red-700 text-rose-100 border-red-400'
                  }`}
                >
                  【是】
                </button>
                <button
                  onClick={() => {
                    setActiveStampTool('不是');
                    sounds.playPop();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black border transition cursor-pointer active:scale-95 ${
                    activeStampTool === '不是'
                      ? 'bg-yellow-400 text-yellow-950 border-yellow-200 shadow-xs'
                      : 'bg-red-700 text-rose-100 border-red-400'
                  }`}
                >
                  【不是】
                </button>
              </div>
            </div>

            {/* 1(d) Questions */}
            <div className="space-y-1.5 bg-orange-50/50 p-2 rounded-xl border border-orange-200 my-1">
              <div className="text-[11px] font-black text-orange-950">1 (d). 探究植物繁殖问题判定：</div>

              {/* (i) */}
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-800">
                  <strong>(i)</strong> 繁殖不同植物时，所使用的方法是不是一样的？
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApplyStamp('q_d1')}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-md text-[10px] font-extrabold cursor-pointer"
                  >
                    盖【{activeStampTool}】
                  </button>
                  {stamps.q_d1 && (
                    <span className="px-2 py-0.5 border-2 border-rose-600 text-rose-700 font-black text-xs bg-rose-50 rounded">
                      【{stamps.q_d1}】
                    </span>
                  )}
                </div>
              </div>

              {/* (ii) */}
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-800">
                  <strong>(ii)</strong> 用叶子、地下茎或吸芽繁殖时，是不是也能长出新植物？
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApplyStamp('q_d2')}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-md text-[10px] font-extrabold cursor-pointer"
                  >
                    盖【{activeStampTool}】
                  </button>
                  {stamps.q_d2 && (
                    <span className="px-2 py-0.5 border-2 border-rose-600 text-rose-700 font-black text-xs bg-rose-50 rounded">
                      【{stamps.q_d2}】
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 1(e) Radio Options */}
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-black text-slate-800">1 (e). 勾选正确结论：</div>
              <div className="space-y-1">
                {[
                  { id: 'opt1', text: '有些植物可以用不只一种方法繁殖', isCorrect: true },
                  { id: 'opt2', text: '所有植物都只能靠果实繁殖', isCorrect: false },
                  { id: 'opt3', text: '叶子、地下茎和吸芽都不能用来繁殖植物', isCorrect: false },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => {
                      sounds.playPop();
                      setConclusionChoice(opt.id);
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] transition cursor-pointer select-none ${
                      conclusionChoice === opt.id
                        ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="reproduction-conclusion"
                        checked={conclusionChoice === opt.id}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 text-orange-600"
                      />
                      {opt.text}
                    </span>
                    {showResult && opt.isCorrect && (
                      <span className="text-[10px] font-black text-emerald-700">✓ 正确</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Validation */}
          <div className="space-y-1.5 pt-1">
            {showResult && (
              <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isAllCompleted ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>
                {isAllCompleted
                  ? '🎉 探案完全正确！(获得满分 6 分)'
                  : '⚠️ 辣椒配种子、虎尾兰配叶子、香蕉配吸芽、马铃薯配地下茎；印章为(i)不是，(ii)是；结论选第 1 项。'}
              </div>
            )}

            <button
              onClick={handleValidate}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              id="validate-mod3-btn"
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
