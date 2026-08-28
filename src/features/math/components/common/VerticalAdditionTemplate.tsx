import React, { useState, useRef } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, RotateCcw, Lightbulb } from 'lucide-react';

export interface VerticalAdditionRow {
  label?: string; // e.g. "礼堂→公园"
  text: string;  // e.g. "1.2" or "24" or "3250"
}

interface VerticalAdditionProps {
  title?: string;
  rows: string[]; // e.g. ["1.2", "2.2"] or ["24", "36", "60"] or ["3250", "2780"]
  rowLabels?: string[];
  unit?: string; // e.g. "km" or "杯" or "g" or "RM"
  unitPosition?: 'left' | 'right';
  expectedSum: string; // e.g. "3.4" or "120" or "6030"
  decimalPlaces?: number; // e.g. 1 for 1.2+2.2
  onSolved?: (val: string) => void;
  showCarries?: boolean;
  carriesExpected?: Record<number, string>; // colIndex -> expected carry digit
}

export const VerticalAdditionTemplate: React.FC<VerticalAdditionProps> = ({
  title = '直式加法 (竖式计算)',
  rows,
  rowLabels,
  unit = '',
  expectedSum,
  decimalPlaces = 0,
  onSolved,
  showCarries = true,
}) => {
  // 检查是否有小数
  const hasDecimals = decimalPlaces > 0 || rows.some((r) => r.includes('.')) || expectedSum.includes('.');
  const effectiveDecPlaces = hasDecimals
    ? decimalPlaces > 0
      ? decimalPlaces
      : Math.max(...rows.concat(expectedSum).map((r) => r.split('.')[1]?.length || 0))
    : 0;

  const maxIntDigits = Math.max(
    ...rows.concat(expectedSum).map((r) => r.split('.')[0].length)
  );

  const maxLen = Math.max(...rows.map((r) => r.length), expectedSum.length);

  // 格式化每一行，确保靠右对齐（按小数点或个位）
  const padRow = (val: string) => {
    if (effectiveDecPlaces > 0) {
      const [intPart = '0', decPart = ''] = val.split('.');
      const paddedInt = intPart.padStart(maxIntDigits, ' ');
      const paddedDec = decPart.padEnd(effectiveDecPlaces, '0');
      return `${paddedInt}.${paddedDec}`;
    }
    return val.padStart(maxLen, ' ');
  };

  const paddedRows = rows.map(padRow);
  const paddedExpected = padRow(expectedSum);
  const sumChars = paddedExpected.split('');

  const [userDigits, setUserDigits] = useState<string[]>(() =>
    sumChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : ''))
  );
  const [carries, setCarries] = useState<string[]>(() =>
    new Array(sumChars.length).fill('')
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const hasLabels = Boolean(rowLabels && rowLabels.length > 0);

  const checkAnswer = (digits: string[]) => {
    const rawJoined = digits.join('');
    const cleanJoined = digits.filter((d) => d !== ' ').join('');
    const cleanExpected = expectedSum.trim();

    if (rawJoined === paddedExpected || cleanJoined === cleanExpected) {
      if (!isSuccess) {
        setIsSuccess(true);
        sound.playSuccess();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onSolved) onSolved(expectedSum);
      }
    } else {
      setIsSuccess(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.slice(-1);
    if (cleanVal !== '' && !/^[0-9]$/.test(cleanVal)) return;

    sound.playPop(520 + index * 40);
    const next = [...userDigits];
    next[index] = cleanVal;
    setUserDigits(next);
    checkAnswer(next);

    // 自动跳到前一个格子 (从右向左计算)
    if (cleanVal !== '' && index > 0) {
      for (let prevIdx = index - 1; prevIdx >= 0; prevIdx--) {
        if (sumChars[prevIdx] !== '.' && sumChars[prevIdx] !== ' ') {
          inputRefs.current[prevIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && userDigits[index] === '' && index < userDigits.length - 1) {
      // 往右回退
      for (let nextIdx = index + 1; nextIdx < userDigits.length; nextIdx++) {
        if (sumChars[nextIdx] !== '.' && sumChars[nextIdx] !== ' ') {
          inputRefs.current[nextIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleCarryChange = (colIdx: number, val: string) => {
    const cleanVal = val.slice(-1);
    if (cleanVal !== '' && !/^[0-9]$/.test(cleanVal)) return;
    sound.playMarble();
    const next = [...carries];
    next[colIdx] = cleanVal;
    setCarries(next);
  };

  const handleFillHint = () => {
    sound.playPop(480);
    setUserDigits(sumChars);
    setIsSuccess(true);
    if (onSolved) onSolved(expectedSum);
  };

  const handleReset = () => {
    sound.playPop(350);
    setUserDigits(sumChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : '')));
    setCarries(new Array(sumChars.length).fill(''));
    setIsSuccess(false);
  };

  return (
    <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/50 rounded-3xl p-5 sm:p-6 border-2 border-amber-300/80 shadow-md relative overflow-hidden">
      {/* 顶部标题与魔法闪光标 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-950" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
              {title}
            </h4>
            <p className="text-xs text-amber-800 font-bold">
              数位严格对齐 · 从个位起从右向左加 · 满十进一
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFillHint}
            className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="查看引导答案"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
            <span>提示</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 bg-white/80 hover:bg-white text-stone-600 rounded-xl border border-amber-200 transition cursor-pointer active:scale-95"
            title="清空重填"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 竖式主卡片 (网格严格列对齐) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-amber-200/90 shadow-inner flex flex-col items-center select-none overflow-x-auto">
        <div className="inline-flex flex-col items-stretch">
          {/* 进位辅助行 (Carries Row) */}
          {showCarries && (
            <div className="flex items-center gap-1.5 mb-1.5">
              {/* 运算符占位 */}
              <div className="w-8 sm:w-10 shrink-0" />

              {/* 每个数位上的进位圆圈 */}
              {sumChars.map((ch, idx) => {
                if (ch === '.') {
                  return <div key={`carry-dot-${idx}`} className="w-4 shrink-0" />;
                }
                if (ch === ' ') {
                  return <div key={`carry-space-${idx}`} className="w-10 sm:w-12 shrink-0" />;
                }
                return (
                  <div key={`carry-${idx}`} className="w-10 sm:w-12 shrink-0 flex items-center justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      placeholder="进"
                      value={carries[idx] || ''}
                      onChange={(e) => handleCarryChange(idx, e.target.value)}
                      className="w-6 h-6 rounded-full border border-amber-300 bg-amber-50/90 text-center text-xs font-black text-amber-900 focus:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-amber-400 placeholder:text-[10px] shadow-2xs"
                    />
                  </div>
                );
              })}

              {/* 单位占位 */}
              {unit && <div className="w-10 sm:w-14 shrink-0" />}
              {/* 标签占位 */}
              {hasLabels && <div className="w-24 sm:w-32 shrink-0" />}
            </div>
          )}

          {/* 加数行 (Operands Rows) */}
          <div className="space-y-1.5">
            {paddedRows.map((paddedStr, rowIdx) => {
              const isLastRow = rowIdx === paddedRows.length - 1;
              const label = rowLabels ? rowLabels[rowIdx] : undefined;

              return (
                <div key={`row-${rowIdx}`} className="flex items-center gap-1.5">
                  {/* 最前方的加号（仅在最后一行加数显示） */}
                  <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-amber-600">
                    {isLastRow ? '+' : ''}
                  </div>

                  {/* 字符网格 */}
                  {paddedStr.split('').map((char, cIdx) => {
                    if (char === '.') {
                      return (
                        <div
                          key={`dot-${rowIdx}-${cIdx}`}
                          className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-stone-800"
                        >
                          .
                        </div>
                      );
                    }
                    return (
                      <div
                        key={`cell-${rowIdx}-${cIdx}`}
                        className={`w-10 sm:w-12 h-11 sm:h-12 rounded-xl shrink-0 flex items-center justify-center font-mono font-black text-xl sm:text-2xl transition ${
                          char !== ' '
                            ? 'bg-amber-50/70 border border-amber-200/90 text-stone-900 shadow-2xs'
                            : 'bg-transparent'
                        }`}
                      >
                        {char !== ' ' ? char : ''}
                      </div>
                    );
                  })}

                  {/* 右侧单位 */}
                  {unit && (
                    <div className="w-10 sm:w-14 shrink-0 pl-1 font-bold text-xs sm:text-sm text-stone-500 font-mono flex items-center">
                      {unit}
                    </div>
                  )}

                  {/* 右侧文字标注 */}
                  {hasLabels && (
                    <div className="w-24 sm:w-32 shrink-0 pl-2 text-xs font-bold text-stone-500 truncate flex items-center">
                      {label ? `(${label})` : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 粗横算式分割线 */}
          <div className="my-2.5 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 rounded-full shadow-xs w-full" />

          {/* 答案填写行 (User Answer Input Boxes) */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center font-mono font-black text-xl text-amber-700">
              =
            </div>

            {sumChars.map((ch, idx) => {
              if (ch === '.') {
                return (
                  <div
                    key={`ans-dot-${idx}`}
                    className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-3xl text-amber-800"
                  >
                    .
                  </div>
                );
              }

              if (ch === ' ') {
                return <div key={`ans-space-${idx}`} className="w-10 sm:w-12 shrink-0" />;
              }

              const isFilled = userDigits[idx] !== '' && userDigits[idx] !== ' ';
              const isDigitCorrect = userDigits[idx] === ch;

              return (
                <div key={`ans-${idx}`} className="w-10 sm:w-12 shrink-0 relative flex items-center justify-center">
                  <input
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={userDigits[idx] === ' ' ? '' : userDigits[idx]}
                    placeholder="?"
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-10 sm:w-12 h-11 sm:h-12 rounded-xl text-center font-mono font-black text-xl sm:text-2xl transition-all shadow-sm focus:outline-none focus:scale-105 ${
                      isSuccess
                        ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300'
                        : isFilled
                        ? isDigitCorrect
                          ? 'bg-amber-100 border-2 border-amber-500 text-amber-950'
                          : 'bg-rose-50 border-2 border-rose-400 text-rose-800'
                        : 'bg-white border-2 border-amber-400 text-stone-900 focus:border-amber-600 focus:ring-4 focus:ring-amber-200'
                    }`}
                  />
                </div>
              );
            })}

            {/* 右侧单位 */}
            {unit && (
              <div className="w-10 sm:w-14 shrink-0 pl-1 font-mono font-black text-base sm:text-lg text-amber-900 flex items-center">
                {unit}
              </div>
            )}

            {/* 标签列占位 */}
            {hasLabels && <div className="w-24 sm:w-32 shrink-0" />}
          </div>
        </div>

        {/* 底部即时判定与一键提交 */}
        <div className="mt-5 pt-3 w-full border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs sm:text-sm font-bold text-stone-700">
            {isSuccess ? (
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                算式正确达成！加法总数 = {expectedSum} {unit}
              </span>
            ) : (
              <span className="text-stone-500">
                💡 请在每一列对应的方格中输入计算得到的数字
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => checkAnswer(userDigits)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              isSuccess
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-amber-500 hover:bg-amber-600 text-amber-950'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSuccess ? '已达成' : '检查答案'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
