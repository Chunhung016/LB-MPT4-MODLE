import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { CheckCircle2, FileSpreadsheet, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export const FullExamReview: React.FC = () => {
  // Q6 状态: 5本RM12.50 -> 8本多少钱？ (12.50 / 5 = 2.50, 2.50 * 8 = RM20.00)
  const [q6Ans, setQ6Ans] = useState<string>('');
  const [q6Check, setQ6Check] = useState<boolean | null>(null);

  // Q7 状态: 表1 星星贴纸。第1回合3颗=12张, 第2回合5颗=20张, 第3回合2颗=8张。总共10颗=40张。第2回合占比 20/40 = 50%
  const [q7Ans, setQ7Ans] = useState<string>('');
  const [q7Check, setQ7Check] = useState<boolean | null>(null);

  // Q8(a) 路线图:
  // (i) 图书馆到社区礼堂: 1.75 km
  // (ii) 总距离: 家->图书馆(2.6) + 图书馆->社区礼堂(1.75) + 社区礼堂->公园(1.2) + 公园->家(2.2) = 7.75 km
  const [q8aiAns, setQ8aiAns] = useState<string>('');
  const [q8aiiAns, setQ8aiiAns] = useState<string>('');
  const [q8aCheck, setQ8aCheck] = useState<boolean | null>(null);

  // Q8(b) 果汁分装: 8L 400mL / 4 = 2L 100mL (2100 mL)
  const [q8bAnsL, setQ8bAnsL] = useState<string>('');
  const [q8bAnsML, setQ8bAnsML] = useState<string>('');
  const [q8bCheck, setQ8bCheck] = useState<boolean | null>(null);

  // Q8(c) 葡萄汁百分比: 苹果24, 葡萄36, 橙60, 总和120。葡萄占比 36/120 = 30%
  const [q8cAns, setQ8cAns] = useState<string>('');
  const [q8cCheck, setQ8cCheck] = useState<boolean | null>(null);

  // Q8(d) 矿泉水比价 (买10瓶):
  // 阳光商店: 2瓶RM9.40 -> 10瓶 = 5组 × 9.40 = RM47.00
  // 成功商店: 5瓶RM22.50 -> 10瓶 = 2组 × 22.50 = RM45.00 (最便宜!)
  // 和平商店: 1瓶RM4.80 -> 10瓶 = 10 × 4.80 = RM48.00
  const [q8dStore, setQ8dStore] = useState<string>('');
  const [q8dCheck, setQ8dCheck] = useState<boolean | null>(null);

  // Q9(a) 嘉年华人数: 男生180, 女生 180 × (1/3) = 60, 总人数 = 180 + 60 = 240人
  const [q9aAns, setQ9aAns] = useState<string>('');
  const [q9aCheck, setQ9aCheck] = useState<boolean | null>(null);

  // Q9(b) 塑料瓶与铝罐质量差:
  // 塑料瓶: 俊杰(3kg 250g) + 美玲(2780g = 2kg 780g) = 6030g (6kg 30g)
  // 铝罐: 阿米尔(4kg 460g = 4460g)
  // 差值: 6030g - 4460g = 1570g (1 kg 570 g)
  const [q9bAnsKg, setQ9bAnsKg] = useState<string>('');
  const [q9bAnsG, setQ9bAnsG] = useState<string>('');
  const [q9bCheck, setQ9bCheck] = useState<boolean | null>(null);

  // Q9(c) 门票与找零: 科学馆RM12.00 + 天文馆RM18.50 + 创意工作坊RM9.80 = RM40.30。付RM50，找零 = RM9.70
  const [q9cAns, setQ9cAns] = useState<string>('');
  const [q9cCheck, setQ9cCheck] = useState<boolean | null>(null);

  // Q9(d) 条形统计图: 手工制作比智力游戏(75)少25人 -> 75 - 25 = 50人
  const [q9dAns, setQ9dAns] = useState<string>('');
  const [q9dCheck, setQ9dCheck] = useState<boolean | null>(null);

  return (
    <div id="full-exam-review-container" className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* 试卷综合训练介绍卡 */}
      <div className="bg-stone-900 text-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 text-amber-300 border border-stone-700 rounded-full text-xs font-bold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" /> SJKC 四年级数学模拟试卷 (055)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              完整试卷知识拓展与综合检测
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1">
              包含第 6 题至第 9 题（货币运算、比与比例、度量衡、统计图表等），随时检验数学综合运用能力！
            </p>
          </div>
        </div>
      </div>

      {/* 第 6 题：练习簿单价与比例 */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-extrabold text-stone-900">
            6. 图 4 显示 5 本练习簿的价格为 RM12.50。计算 8 本练习簿的价格。展示你的计算过程。<span className="font-mono text-stone-400 font-normal text-xs ml-1">[3 分]</span>
          </h3>
          <span className="text-xs px-2.5 py-0.5 bg-[#FEF3C7] text-amber-900 font-bold rounded-lg border border-[#FDE68A]">
            归一法应用
          </span>
        </div>

        <div className="p-4 bg-[#F8F6EB] rounded-xl border border-[#E5DFC9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-700 space-y-1 font-medium">
            <p>• 步骤 1：算 1 本的价格 = <code>RM12.50 ÷ 5 = RM2.50</code></p>
            <p>• 步骤 2：算 8 本的价格 = <code>8 × RM2.50 = RM20.00</code></p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-stone-800 font-mono">RM</span>
            <input
              type="text"
              placeholder="如 20 或 20.00"
              value={q6Ans}
              onChange={(e) => setQ6Ans(e.target.value)}
              className="w-28 px-3 py-1.5 text-xs font-bold border border-[#DDD7C0] rounded-lg bg-white outline-none focus:border-amber-500 text-stone-900"
            />
            <button
              onClick={() => {
                const val = q6Ans.trim();
                const ok = val === '20' || val === '20.00' || val === 'RM20' || val === 'RM20.00';
                setQ6Check(ok);
                if (ok) {
                  sound.playSuccess();
                  confetti({ particleCount: 30, spread: 50 });
                } else sound.playGentleError();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition border border-amber-700 shadow-xs"
            >
              检查
            </button>
          </div>
        </div>
        {q6Check !== null && (
          <div className={`text-xs p-2.5 rounded-lg font-bold ${q6Check ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
            {q6Check ? '🎉 完全正确！8 本练习簿的价格是 RM20.00。' : '❌ 提示：12.50 ÷ 5 = 2.50，2.50 × 8 = 20.00。'}
          </div>
        )}
      </div>

      {/* 第 7 题：星星贴纸百分比 */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-extrabold text-stone-900">
            7. 表 1 显示志伟在三个回合中所获得的星星贴纸数量（每个★代表 4 张贴纸）。计算第二回合的贴纸数量占三个回合总数量的百分比。<span className="font-mono text-stone-400 font-normal text-xs ml-1">[4 分]</span>
          </h3>
          <span className="text-xs px-2.5 py-0.5 bg-[#FEF3C7] text-amber-900 font-bold rounded-lg border border-[#FDE68A]">
            百分比与象形图
          </span>
        </div>

        {/* 象形统计表 */}
        <div className="border border-[#E5DFC9] rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#FAF8EE] border-b border-[#E5DFC9]">
              <tr>
                <th className="p-2.5 font-bold text-stone-800">回合</th>
                <th className="p-2.5 font-bold text-stone-800">获得星星 (★=4张)</th>
                <th className="p-2.5 font-bold text-stone-800">对应贴纸张数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEAD6]">
              <tr>
                <td className="p-2.5 font-semibold text-stone-700">第一回合</td>
                <td className="p-2.5 text-amber-600 font-bold">★★★ (3 颗)</td>
                <td className="p-2.5 text-stone-600">3 × 4 = 12 张</td>
              </tr>
              <tr className="bg-[#FEF3C7]/40">
                <td className="p-2.5 font-bold text-amber-900">第二回合</td>
                <td className="p-2.5 text-amber-600 font-bold">★★★★★ (5 颗)</td>
                <td className="p-2.5 font-bold text-amber-900">5 × 4 = 20 张</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-stone-700">第三回合</td>
                <td className="p-2.5 text-amber-600 font-bold">★★ (2 颗)</td>
                <td className="p-2.5 text-stone-600">2 × 4 = 8 张</td>
              </tr>
              <tr className="bg-[#FAF8EE] font-bold">
                <td className="p-2.5 text-stone-900">总数</td>
                <td className="p-2.5 text-stone-800">10 颗</td>
                <td className="p-2.5 text-stone-800">40 张</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 p-3 bg-[#F8F6EB] rounded-xl border border-[#E5DFC9]">
          <span className="text-xs font-bold text-stone-800">
            第二回合占比 = (20 ÷ 40) × 100% =
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="如 50 或 50%"
              value={q7Ans}
              onChange={(e) => setQ7Ans(e.target.value)}
              className="w-24 px-3 py-1.5 text-xs font-bold border border-[#DDD7C0] rounded-lg bg-white outline-none focus:border-amber-500 text-stone-900"
            />
            <span className="text-xs font-bold text-stone-800">%</span>
            <button
              onClick={() => {
                const val = q7Ans.trim().replace('%', '');
                const ok = val === '50';
                setQ7Check(ok);
                if (ok) {
                  sound.playSuccess();
                  confetti({ particleCount: 30, spread: 50 });
                } else sound.playGentleError();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition border border-amber-700 shadow-xs"
            >
              检查
            </button>
          </div>
        </div>
        {q7Check !== null && (
          <div className={`text-xs p-2.5 rounded-lg font-bold ${q7Check ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
            {q7Check ? '🎉 正确！第二回合贴纸数量占三个回合总数的 50%。' : '❌ 提示：5 / 10 或 20 / 40 换算为百分比等于 50%。'}
          </div>
        )}
      </div>

      {/* 第 8 题：综合应用大题 (路线、果汁容量、果汁百分比、矿泉水比价) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs space-y-6">
        <div className="border-b border-[#E8E4D0] pb-3">
          <span className="text-xs px-2.5 py-1 bg-[#FEF3C7] text-amber-900 font-bold rounded-lg border border-[#FDE68A]">
            第 8 题 · 社区义卖会与日常生活应用大题
          </span>
          <h3 className="text-base font-extrabold text-stone-900 mt-2">
            8(a) 图 5 路线图：家 ➔ 2.6 km ➔ 图书馆 ➔ 1.75 km ➔ 社区礼堂 ➔ 1.2 km ➔ 公园 ➔ 2.2 km ➔ 家
          </h3>
        </div>

        {/* 8(a) 路线距离 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9] space-y-2">
            <span className="font-bold text-stone-900 block">(i) 图书馆到社区礼堂的距离 <span className="font-mono text-stone-400 font-normal">[1 分]</span></span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="如 1.75"
                value={q8aiAns}
                onChange={(e) => setQ8aiAns(e.target.value)}
                className="w-24 p-1.5 border border-[#DDD7C0] rounded bg-white font-bold text-stone-900"
              />
              <span className="font-bold text-stone-700">km</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9] space-y-2">
            <span className="font-bold text-stone-900 block">(ii) 慧玲经过的总距离 (全路程相加) <span className="font-mono text-stone-400 font-normal">[3 分]</span></span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="如 7.75"
                value={q8aiiAns}
                onChange={(e) => setQ8aiiAns(e.target.value)}
                className="w-24 p-1.5 border border-[#DDD7C0] rounded bg-white font-bold text-stone-900"
              />
              <span className="font-bold text-stone-700">km</span>
              <button
                onClick={() => {
                  const ok1 = q8aiAns.trim() === '1.75';
                  const ok2 = q8aiiAns.trim() === '7.75';
                  setQ8aCheck(ok1 && ok2);
                  if (ok1 && ok2) sound.playSuccess();
                  else sound.playGentleError();
                }}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs transition border border-amber-700 shadow-xs"
              >
                验证
              </button>
            </div>
          </div>
        </div>
        {q8aCheck !== null && (
          <div className={`text-xs p-2.5 rounded-lg font-bold ${q8aCheck ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
            {q8aCheck ? '🎉 答案完全正确！(i) 1.75 km，(ii) 2.6 + 1.75 + 1.2 + 2.2 = 7.75 km。' : '❌ 提示：请核对两处数字，总距离需加总 4 段路程。'}
          </div>
        )}

        {/* 8(b) 果汁分装 8L 400mL / 4 */}
        <div className="p-4 bg-[#F8F6EB] rounded-xl border border-[#E5DFC9] space-y-2 text-xs">
          <div className="font-bold text-stone-900">
            8(b) 一个罐子装有 8 ℓ 400 mℓ 的果汁，平均装进 4 个容器，求每个容器里果汁体积。<span className="font-mono text-stone-400 font-normal">[3 分]</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="ℓ (升)"
              value={q8bAnsL}
              onChange={(e) => setQ8bAnsL(e.target.value)}
              className="w-20 p-1.5 border border-[#DDD7C0] rounded bg-white font-bold text-stone-900"
            />
            <span className="font-bold text-stone-700">ℓ</span>
            <input
              type="text"
              placeholder="mℓ (毫升)"
              value={q8bAnsML}
              onChange={(e) => setQ8bAnsML(e.target.value)}
              className="w-24 p-1.5 border border-[#DDD7C0] rounded bg-white font-bold text-stone-900"
            />
            <span className="font-bold text-stone-700">mℓ</span>
            <button
              onClick={() => {
                const ok = q8bAnsL.trim() === '2' && (q8bAnsML.trim() === '100' || q8bAnsML.trim() === '100ml');
                setQ8bCheck(ok);
                if (ok) sound.playSuccess();
                else sound.playGentleError();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs transition border border-amber-700 shadow-xs"
            >
              检查
            </button>
          </div>
          {q8bCheck !== null && (
            <div className={`text-xs p-2 rounded font-bold ${q8bCheck ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
              {q8bCheck ? '🎉 正确！8 ℓ ÷ 4 = 2 ℓ，400 mℓ ÷ 4 = 100 mℓ，即 2 ℓ 100 mℓ。' : '❌ 提示：8 ÷ 4 = 2 ℓ, 400 ÷ 4 = 100 mℓ。'}
            </div>
          )}
        </div>

        {/* 8(d) 矿泉水最优性价比购买决策 */}
        <div className="p-4 bg-[#FAF8EE] rounded-xl border border-[#E5DFC9] space-y-2 text-xs">
          <div className="font-bold text-stone-900">
            8(d) 慧玲要买 10 瓶矿泉水。阳光(2瓶RM9.40)、成功(5瓶RM22.50)、和平(1瓶RM4.80)。想节省开支应选哪间？<span className="font-mono text-stone-400 font-normal">[4 分]</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-stone-700 my-2">
            <div className="p-2 bg-white rounded border border-[#E5DFC9]">阳光：5×9.40 = <strong>RM47.00</strong></div>
            <div className="p-2 bg-[#E7F7F1] rounded border border-[#BCE7D6] text-teal-950 font-bold">成功：2×22.50 = <strong>RM45.00 (最省)</strong></div>
            <div className="p-2 bg-white rounded border border-[#E5DFC9]">和平：10×4.80 = <strong>RM48.00</strong></div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={q8dStore}
              onChange={(e) => setQ8dStore(e.target.value)}
              className="p-1.5 border border-[#DDD7C0] rounded bg-white font-bold text-stone-900"
            >
              <option value="">-- 选择最省钱的商店 --</option>
              <option value="阳光商店">阳光商店 (RM47.00)</option>
              <option value="成功商店">成功商店 (RM45.00)</option>
              <option value="和平商店">和平商店 (RM48.00)</option>
            </select>
            <button
              onClick={() => {
                const ok = q8dStore === '成功商店';
                setQ8dCheck(ok);
                if (ok) {
                  sound.playSuccess();
                  confetti({ particleCount: 40, spread: 60 });
                } else sound.playGentleError();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs transition border border-amber-700 shadow-xs"
            >
              提交决策
            </button>
          </div>
          {q8dCheck !== null && (
            <div className={`text-xs p-2 rounded font-bold ${q8dCheck ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-950' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
              {q8dCheck ? '🎉 决策非常明智！成功商店总花费只需 RM45.00，最节省开支。' : '❌ 提示：比较三间商店买 10 瓶的总价：47.00 vs 45.00 vs 48.00。'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
