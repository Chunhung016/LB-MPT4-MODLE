import React, { useState, useRef } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, Lightbulb, Divide } from 'lucide-react';

interface LongDivisionStep {
  multiply: string; // value to subtract (e.g. "8" or "18")
  subtractResult: string; // remainder/brought down (e.g. "0" or "00")
}

interface LongDivisionProps {
  title?: string;
  subtitle?: string;
  divisor: string; // e.g. "4" or "5" or "3"
  dividend: string; // e.g. "8", "400", "9.40", "22.50", "180"
  quotient: string; // expected answer, e.g. "2", "100", "4.70", "4.50", "60"
  unit?: string; // e.g. "ℓ", "ml", "RM", "人"
  steps?: LongDivisionStep[]; // intermediate subtraction steps
  onSolved?: (val: string) => void;
}

export const LongDivisionTemplate: React.FC<LongDivisionProps> = ({
  title = '直式长除法 (竖式除法)',
  subtitle = '在长除法上方方格填入商数，数位对应被除数',
  divisor,
  dividend,
  quotient,
  unit = '',
  steps,
  onSolved,
}) => {
  // 对齐商与被除数的长度
  const maxLen = Math.max(dividend.length, quotient.length);
  const paddedDividend = dividend.padStart(maxLen, ' ');
  const paddedQuotient = quotient.padStart(maxLen, ' ');
  const quotientChars = paddedQuotient.split('');

  const [userQuotient, setUserQuotient] = useState<string[]>(() =>
    quotientChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : ''))
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showSteps] = useState<boolean>(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const checkAnswer = (digits: string[]) => {
    const rawJoined = digits.join('');
    const cleanJoined = digits.filter((d) => d !== ' ').join('');
    const cleanExpected = quotient.trim();

    if (rawJoined === paddedQuotient || cleanJoined === cleanExpected) {
      if (!isSuccess) {
        setIsSuccess(true);
        sound.playSuccess();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onSolved) onSolved(quotient);
      }
    } else {
      setIsSuccess(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.slice(-1);
    if (cleanVal !== '' && !/^[0-9]$/.test(cleanVal)) return;

    sound.playPop(520 + index * 40);
    const next = [...userQuotient];
    next[index] = cleanVal;
    setUserQuotient(next);
    checkAnswer(next);

    // 自动跳到下一个非空格子
    if (cleanVal !== '' && index < quotientChars.length - 1) {
      for (let nextIdx = index + 1; nextIdx < quotientChars.length; nextIdx++) {
        if (quotientChars[nextIdx] !== '.' && quotientChars[nextIdx] !== ' ') {
          inputRefs.current[nextIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && userQuotient[index] === '' && index > 0) {
      for (let prevIdx = index - 1; prevIdx >= 0; prevIdx--) {
        if (quotientChars[prevIdx] !== '.' && quotientChars[prevIdx] !== ' ') {
          inputRefs.current[prevIdx]?.focus();
          break;
        }
      }
    }
  };

  const handleFillHint = () => {
    sound.playPop(480);
    setUserQuotient(quotientChars);
    setIsSuccess(true);
    if (onSolved) onSolved(quotient);
  };

  const handleReset = () => {
    sound.playPop(350);
    setUserQuotient(quotientChars.map((ch) => (ch === '.' ? '.' : ch === ' ' ? ' ' : '')));
    setIsSuccess(false);
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/70 to-blue-50/50 rounded-3xl p-5 sm:p-6 border-2 border-indigo-200 shadow-md relative overflow-hidden">
      {/* 顶部标题 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xs">
            <Divide className="w-4 h-4 text-indigo-100" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-indigo-950 tracking-tight">
              {title}
            </h4>
            <p className="text-xs text-indigo-800 font-bold">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFillHint}
            className="px-3 py-1.5 bg-indigo-200/80 hover:bg-indigo-300 text-indigo-950 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="一键填入答案"
          >
            <Lightbulb className="w-3.5 h-3.5 text-indigo-700" />
            <span>提示</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 bg-white/80 hover:bg-white text-stone-600 rounded-xl border border-indigo-200 transition cursor-pointer active:scale-95"
            title="清空"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 直式长除法标准卡片 (数位精准对齐) */}
      <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-inner flex flex-col items-center select-none overflow-x-auto">
        <div className="inline-flex flex-col items-start">
          {/* 上方商数填空行 (Quotient Answer Boxes) */}
          <div className="flex items-center gap-1.5 mb-1.5 pl-10 sm:pl-12">
            {quotientChars.map((ch, idx) => {
              if (ch === '.') {
                return (
                  <div
                    key={`q-dot-${idx}`}
                    className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-indigo-900"
                  >
                    .
                  </div>
                );
              }

              if (ch === ' ') {
                return <div key={`q-space-${idx}`} className="w-10 sm:w-12 shrink-0" />;
              }

              const isFilled = userQuotient[idx] !== '' && userQuotient[idx] !== ' ';
              const isDigitCorrect = userQuotient[idx] === ch;

              return (
                <div key={`q-box-${idx}`} className="w-10 sm:w-12 shrink-0 relative flex items-center justify-center">
                  <input
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={userQuotient[idx] === ' ' ? '' : userQuotient[idx]}
                    placeholder="?"
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-10 sm:w-12 h-11 sm:h-12 rounded-xl text-center font-mono font-black text-xl sm:text-2xl transition-all shadow-xs focus:outline-none focus:scale-105 ${
                      isSuccess
                        ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300'
                        : isFilled
                        ? isDigitCorrect
                          ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-950'
                          : 'bg-rose-50 border-2 border-rose-400 text-rose-800'
                        : 'bg-white border-2 border-indigo-400 text-stone-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200'
                    }`}
                  />
                </div>
              );
            })}
            {unit && (
              <span className="w-10 sm:w-14 shrink-0 pl-1 font-mono font-black text-base sm:text-lg text-indigo-900 flex items-center">
                {unit}
              </span>
            )}
          </div>

          {/* 长除法主体：除数 + 弧线水平横线 + 被除数 */}
          <div className="flex items-center">
            {/* 除数 (Divisor) */}
            <div className="w-10 sm:w-12 shrink-0 pr-2 text-right font-mono font-black text-2xl sm:text-3xl text-indigo-900 flex items-center justify-end">
              {divisor}
            </div>

            {/* 长除法框架：左侧弧形角，上方粗实线 */}
            <div className="border-t-4 border-l-4 border-indigo-800 rounded-tl-xl pl-2 pr-3 py-1 bg-indigo-50/40 flex items-center gap-1.5">
              {/* 被除数 (Dividend Digits) */}
              {paddedDividend.split('').map((char, cIdx) => {
                if (char === '.') {
                  return (
                    <div key={`d-dot-${cIdx}`} className="w-4 shrink-0 flex items-center justify-center font-mono font-black text-2xl text-stone-800">
                      .
                    </div>
                  );
                }
                return (
                  <div
                    key={`d-cell-${cIdx}`}
                    className="w-10 sm:w-12 h-10 sm:h-11 shrink-0 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl text-stone-900"
                  >
                    {char !== ' ' ? char : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 下方计算步骤与余数 (Division Subtraction Steps) */}
          {steps && steps.length > 0 && showSteps && (
            <div className="ml-10 sm:ml-12 mt-2 space-y-2 border-t border-dashed border-indigo-200 pt-2 font-mono text-sm sm:text-base">
              {steps.map((st, sIdx) => (
                <div key={`step-${sIdx}`} className="space-y-1">
                  <div className="flex items-center text-stone-700">
                    <span className="w-6 text-indigo-600 font-bold">-</span>
                    <span className="font-bold tracking-widest">{st.multiply}</span>
                  </div>
                  <div className="h-0.5 bg-indigo-300 w-24 my-1" />
                  <div className="flex items-center text-emerald-800 font-extrabold pl-6 tracking-widest">
                    <span>{st.subtractResult}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部验证状态 */}
        <div className="mt-4 pt-3 w-full border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs sm:text-sm font-bold text-stone-700">
            {isSuccess ? (
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                算式成立：{dividend} ÷ {divisor} = {quotient} {unit}
              </span>
            ) : (
              <span className="text-stone-500">
                💡 在上方方框中填入除法运算结果，每一位对应被除数的数位。
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => checkAnswer(userQuotient)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              isSuccess
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
