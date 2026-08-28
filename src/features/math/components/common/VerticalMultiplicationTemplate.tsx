import React, { useState, useRef } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, Lightbulb, X } from 'lucide-react';

interface MultiplicationProps {
  title?: string;
  factor1: string; // e.g. "4.70" or "4.50"
  factor2: string; // e.g. "10" or "5"
  expectedProduct: string; // e.g. "47.00" or "45.00"
  unit?: string; // e.g. "RM"
  unitPosition?: 'left' | 'right';
  decimalPlaces?: number;
  onSolved?: (val: string) => void;
}

export const VerticalMultiplicationTemplate: React.FC<MultiplicationProps> = ({
  title = '直式乘法 (竖式计算)',
  factor1,
  factor2,
  expectedProduct,
  unit = '',
  decimalPlaces = 0,
  onSolved,
}) => {
  const hasDecimals = decimalPlaces > 0 || factor1.includes('.') || factor2.includes('.') || expectedProduct.includes('.');
  const effectiveDecPlaces = hasDecimals
    ? decimalPlaces > 0
      ? decimalPlaces
      : Math.max(
          factor1.split('.')[1]?.length || 0,
          factor2.split('.')[1]?.length || 0,
          expectedProduct.split('.')[1]?.length || 0
        )
    : 0;

  const maxIntDigits = Math.max(
    factor1.split('.')[0].length,
    factor2.split('.')[0].length,
    expectedProduct.split('.')[0].length
  );

  const maxLen = Math.max(factor1.length, factor2.length, expectedProduct.length);

  const padStr = (val: string) => {
    if (effectiveDecPlaces > 0) {
      const [intP = '0', decP = ''] = val.split('.');
      const pInt = intP.padStart(maxIntDigits, ' ');
      const pDec = decP.padEnd(effectiveDecPlaces, '0');
      return `${pInt}.${pDec}`;
    }
    return val.padStart(maxLen, ' ');
  };

  const paddedFactor1 = padStr(factor1);
  const paddedFactor2 = padStr(factor2);
  const paddedExpected = padStr(expectedProduct);
  const prodChars = paddedExpected.split('');

  const [userDigits, setUserDigits] = useState<string[]>(() =>
    prodChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : ''))
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const checkAnswer = (digits: string[]) => {
    const rawJoined = digits.join('');
    const cleanJoined = digits.filter((d) => d !== ' ').join('');
    const cleanExpected = expectedProduct.trim();

    if (rawJoined === paddedExpected || cleanJoined === cleanExpected) {
      if (!isSuccess) {
        setIsSuccess(true);
        sound.playSuccess();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onSolved) onSolved(expectedProduct);
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
        if (prodChars[prevIdx] !== '.' && prodChars[prevIdx] !== ' ') {
          inputRefs.current[prevIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && userDigits[index] === '' && index < userDigits.length - 1) {
      for (let nextIdx = index + 1; nextIdx < userDigits.length; nextIdx++) {
        if (prodChars[nextIdx] !== '.' && prodChars[nextIdx] !== ' ') {
          inputRefs.current[nextIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleFillHint = () => {
    sound.playPop(480);
    setUserDigits(prodChars);
    setIsSuccess(true);
    if (onSolved) onSolved(expectedProduct);
  };

  const handleReset = () => {
    sound.playPop(350);
    setUserDigits(prodChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : '')));
    setIsSuccess(false);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50/70 to-teal-50/50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300 shadow-md relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <X className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">
              {title}
            </h4>
            <p className="text-xs text-emerald-800 font-bold">
              数位严格对齐 · 各数位相乘 · 小数点位置保持对应
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFillHint}
            className="px-3 py-1.5 bg-emerald-200/80 hover:bg-emerald-300 text-emerald-950 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
            <span>提示</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 bg-white/80 hover:bg-white text-stone-600 rounded-xl border border-emerald-200 transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-emerald-200 shadow-inner flex flex-col items-center select-none overflow-x-auto">
        <div className="inline-flex flex-col items-stretch">
          {/* 被乘数 */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 sm:w-10 shrink-0" />
            {paddedFactor1.split('').map((char, idx) => {
              if (char === '.') {
                return (
                  <div key={`f1-dot-${idx}`} className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-stone-800">
                    .
                  </div>
                );
              }
              return (
                <div
                  key={`f1-${idx}`}
                  className={`w-10 sm:w-12 h-11 sm:h-12 rounded-xl shrink-0 flex items-center justify-center font-mono font-black text-xl sm:text-2xl transition ${
                    char !== ' ' ? 'bg-emerald-50/60 border border-emerald-200 text-stone-900 shadow-2xs' : 'bg-transparent'
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

          {/* 乘数 */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-emerald-600">
              ×
            </div>
            {paddedFactor2.split('').map((char, idx) => {
              if (char === '.') {
                return (
                  <div key={`f2-dot-${idx}`} className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-stone-800">
                    .
                  </div>
                );
              }
              return (
                <div
                  key={`f2-${idx}`}
                  className={`w-10 sm:w-12 h-11 sm:h-12 rounded-xl shrink-0 flex items-center justify-center font-mono font-black text-xl sm:text-2xl transition ${
                    char !== ' ' ? 'bg-emerald-50/60 border border-emerald-200 text-stone-900 shadow-2xs' : 'bg-transparent'
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
          <div className="my-2.5 h-1 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-500 rounded-full shadow-xs w-full" />

          {/* 乘积答案行 */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center font-mono font-black text-xl text-emerald-700">
              =
            </div>
            {prodChars.map((ch, idx) => {
              if (ch === '.') {
                return (
                  <div key={`prod-dot-${idx}`} className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-3xl text-emerald-800">
                    .
                  </div>
                );
              }
              if (ch === ' ') {
                return <div key={`prod-space-${idx}`} className="w-10 sm:w-12 shrink-0" />;
              }

              const isFilled = userDigits[idx] !== '' && userDigits[idx] !== ' ';
              const isDigitCorrect = userDigits[idx] === ch;

              return (
                <div key={`prod-ans-${idx}`} className="w-10 sm:w-12 shrink-0 relative flex items-center justify-center">
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
                          ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950'
                          : 'bg-rose-50 border-2 border-rose-400 text-rose-800'
                        : 'bg-white border-2 border-emerald-400 text-stone-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200'
                    }`}
                  />
                </div>
              );
            })}
            {unit && (
              <div className="w-10 sm:w-14 shrink-0 pl-1 font-mono font-black text-base sm:text-lg text-emerald-900 flex items-center">
                {unit}
              </div>
            )}
          </div>
        </div>

        {/* 底部验证状态 */}
        <div className="mt-4 pt-3 w-full border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs sm:text-sm font-bold text-stone-700">
            {isSuccess ? (
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                乘法计算正确：{factor1} × {factor2} = {expectedProduct} {unit}
              </span>
            ) : (
              <span className="text-stone-500">
                💡 从低位开始逐位相乘，计算完成后在方框中输入乘积数字。
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => checkAnswer(userDigits)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              isSuccess
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
