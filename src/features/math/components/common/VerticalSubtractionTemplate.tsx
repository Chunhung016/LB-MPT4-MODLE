import React, { useState, useRef } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, Lightbulb, Minus } from 'lucide-react';

interface SubtractionProps {
  title?: string;
  minuend: string; // 被减数 e.g. "6030" or "50.00"
  subtrahend: string; // 减数 e.g. "4460" or "40.30"
  expectedDiff: string; // 差 e.g. "1570" or "9.70"
  unit?: string; // e.g. "g" or "RM" or "kg"
  unitPosition?: 'left' | 'right';
  decimalPlaces?: number;
  showBorrowRow?: boolean;
  onSolved?: (val: string) => void;
}

export const VerticalSubtractionTemplate: React.FC<SubtractionProps> = ({
  title = '直式减法 (退位与借位计算)',
  minuend,
  subtrahend,
  expectedDiff,
  unit = '',
  decimalPlaces = 0,
  showBorrowRow = true,
  onSolved,
}) => {
  const hasDecimals = decimalPlaces > 0 || minuend.includes('.') || subtrahend.includes('.') || expectedDiff.includes('.');
  const effectiveDecPlaces = hasDecimals
    ? decimalPlaces > 0
      ? decimalPlaces
      : Math.max(
          minuend.split('.')[1]?.length || 0,
          subtrahend.split('.')[1]?.length || 0,
          expectedDiff.split('.')[1]?.length || 0
        )
    : 0;

  const maxIntDigits = Math.max(
    minuend.split('.')[0].length,
    subtrahend.split('.')[0].length,
    expectedDiff.split('.')[0].length
  );

  const maxLen = Math.max(minuend.length, subtrahend.length, expectedDiff.length);

  const padStr = (val: string) => {
    if (effectiveDecPlaces > 0) {
      const [intP = '0', decP = ''] = val.split('.');
      const pInt = intP.padStart(maxIntDigits, ' ');
      const pDec = decP.padEnd(effectiveDecPlaces, '0');
      return `${pInt}.${pDec}`;
    }
    return val.padStart(maxLen, ' ');
  };

  const paddedMinuend = padStr(minuend);
  const paddedSubtrahend = padStr(subtrahend);
  const paddedExpected = padStr(expectedDiff);
  const diffChars = paddedExpected.split('');

  const [userDigits, setUserDigits] = useState<string[]>(() =>
    diffChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : ''))
  );
  const [borrows, setBorrows] = useState<string[]>(() =>
    new Array(diffChars.length).fill('')
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const checkAnswer = (digits: string[]) => {
    const rawJoined = digits.join('');
    const cleanJoined = digits.filter((d) => d !== ' ').join('');
    const cleanExpected = expectedDiff.trim();

    if (rawJoined === paddedExpected || cleanJoined === cleanExpected) {
      if (!isSuccess) {
        setIsSuccess(true);
        sound.playSuccess();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onSolved) onSolved(expectedDiff);
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

    if (cleanVal !== '' && index > 0) {
      for (let prevIdx = index - 1; prevIdx >= 0; prevIdx--) {
        if (diffChars[prevIdx] !== '.' && diffChars[prevIdx] !== ' ') {
          inputRefs.current[prevIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && userDigits[index] === '' && index < userDigits.length - 1) {
      for (let nextIdx = index + 1; nextIdx < userDigits.length; nextIdx++) {
        if (diffChars[nextIdx] !== '.' && diffChars[nextIdx] !== ' ') {
          inputRefs.current[nextIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleBorrowChange = (colIdx: number, val: string) => {
    const cleanVal = val.slice(-1);
    if (cleanVal !== '' && !/^[0-9]$/.test(cleanVal)) return;
    sound.playMarble();
    const next = [...borrows];
    next[colIdx] = cleanVal;
    setBorrows(next);
  };

  const handleFillHint = () => {
    sound.playPop(480);
    setUserDigits(diffChars);
    setIsSuccess(true);
    if (onSolved) onSolved(expectedDiff);
  };

  const handleReset = () => {
    sound.playPop(350);
    setUserDigits(diffChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : '')));
    setBorrows(new Array(diffChars.length).fill(''));
    setIsSuccess(false);
  };

  return (
    <div className="bg-gradient-to-b from-rose-50/70 to-red-50/50 rounded-3xl p-5 sm:p-6 border-2 border-rose-300 shadow-md relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <Minus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-rose-950 tracking-tight">
              {title}
            </h4>
            <p className="text-xs text-rose-800 font-bold">
              数位严格对齐 · 不够减时向前一位借 1 (化作 10)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFillHint}
            className="px-3 py-1.5 bg-rose-200/80 hover:bg-rose-300 text-rose-950 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Lightbulb className="w-3.5 h-3.5 text-rose-700" />
            <span>提示</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 bg-white/80 hover:bg-white text-stone-600 rounded-xl border border-rose-200 transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 竖式减法卡片 (严格列对齐) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-rose-200 shadow-inner flex flex-col items-center select-none overflow-x-auto">
        <div className="inline-flex flex-col items-stretch">
          {/* 借位退位标记行 (Borrow row) */}
          {showBorrowRow && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-8 sm:w-10 shrink-0" />
              {diffChars.map((ch, idx) => {
                if (ch === '.') return <div key={`borrow-dot-${idx}`} className="w-4 shrink-0" />;
                if (ch === ' ') return <div key={`borrow-space-${idx}`} className="w-10 sm:w-12 shrink-0" />;
                return (
                  <div key={`borrow-${idx}`} className="w-10 sm:w-12 shrink-0 flex items-center justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      placeholder="借"
                      value={borrows[idx] || ''}
                      onChange={(e) => handleBorrowChange(idx, e.target.value)}
                      className="w-6 h-6 rounded-full border border-rose-300 bg-rose-50 text-center text-xs font-black text-rose-800 focus:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-rose-300 placeholder:text-[10px] shadow-2xs"
                    />
                  </div>
                );
              })}
              {unit && <div className="w-10 sm:w-14 shrink-0" />}
            </div>
          )}

          {/* 被减数行 */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 sm:w-10 shrink-0" />
            {paddedMinuend.split('').map((char, idx) => {
              if (char === '.') {
                return (
                  <div key={`min-dot-${idx}`} className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-stone-800">
                    .
                  </div>
                );
              }
              return (
                <div
                  key={`min-${idx}`}
                  className={`w-10 sm:w-12 h-11 sm:h-12 rounded-xl shrink-0 flex items-center justify-center font-mono font-black text-xl sm:text-2xl transition ${
                    char !== ' ' ? 'bg-rose-50/60 border border-rose-200 text-stone-900 shadow-2xs' : 'bg-transparent'
                  }`}
                >
                  {char !== ' ' ? char : ''}
                </div>
              );
            })}
            {unit && (
              <div className="w-10 sm:w-14 shrink-0 pl-1 font-bold text-xs sm:text-sm text-stone-500 font-mono flex items-center">
                {unit}
              </div>
            )}
          </div>

          {/* 减数行 */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-rose-600">
              -
            </div>
            {paddedSubtrahend.split('').map((char, idx) => {
              if (char === '.') {
                return (
                  <div key={`sub-dot-${idx}`} className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-stone-800">
                    .
                  </div>
                );
              }
              return (
                <div
                  key={`sub-${idx}`}
                  className={`w-10 sm:w-12 h-11 sm:h-12 rounded-xl shrink-0 flex items-center justify-center font-mono font-black text-xl sm:text-2xl transition ${
                    char !== ' ' ? 'bg-rose-50/60 border border-rose-200 text-stone-900 shadow-2xs' : 'bg-transparent'
                  }`}
                >
                  {char !== ' ' ? char : ''}
                </div>
              );
            })}
            {unit && (
              <div className="w-10 sm:w-14 shrink-0 pl-1 font-bold text-xs sm:text-sm text-stone-500 font-mono flex items-center">
                {unit}
              </div>
            )}
          </div>

          {/* 分界线 */}
          <div className="my-2.5 h-1 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 rounded-full shadow-xs w-full" />

          {/* 差 答案行 */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center font-mono font-black text-xl text-rose-700">
              =
            </div>
            {diffChars.map((ch, idx) => {
              if (ch === '.') {
                return (
                  <div key={`diff-dot-${idx}`} className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-3xl text-rose-800">
                    .
                  </div>
                );
              }
              if (ch === ' ') {
                return <div key={`diff-space-${idx}`} className="w-10 sm:w-12 shrink-0" />;
              }

              const isFilled = userDigits[idx] !== '' && userDigits[idx] !== ' ';
              const isDigitCorrect = userDigits[idx] === ch;

              return (
                <div key={`diff-ans-${idx}`} className="w-10 sm:w-12 shrink-0 relative flex items-center justify-center">
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
                          ? 'bg-rose-100 border-2 border-rose-500 text-rose-950'
                          : 'bg-rose-50 border-2 border-rose-400 text-rose-800'
                        : 'bg-white border-2 border-rose-400 text-stone-900 focus:border-rose-600 focus:ring-4 focus:ring-rose-200'
                    }`}
                  />
                </div>
              );
            })}
            {unit && (
              <div className="w-10 sm:w-14 shrink-0 pl-1 font-mono font-black text-base sm:text-lg text-rose-900 flex items-center">
                {unit}
              </div>
            )}
          </div>
        </div>

        {/* 底部验证状态 */}
        <div className="mt-4 pt-3 w-full border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs sm:text-sm font-bold text-stone-700">
            {isSuccess ? (
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                减法计算正确：{minuend} - {subtrahend} = {expectedDiff} {unit}
              </span>
            ) : (
              <span className="text-stone-500">
                💡 从个位开始相减，若被减数小于减数，向高位借 1 当 10。
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => checkAnswer(userDigits)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              isSuccess
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
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
