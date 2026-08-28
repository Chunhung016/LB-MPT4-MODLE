import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { formatImgurUrl } from '../utils/imgur';
import { sound } from '../utils/audio';

interface VerbExploreScreenProps {
  onNext: () => void;
  onBack?: () => void;
}

interface VerbItem {
  id: number;
  imageUrl: string;
  verb: string;
}

const VERB_ITEMS: VerbItem[] = [
  {
    id: 1,
    imageUrl: 'https://imgur.com/B5Vrqn9',
    verb: 'Membalut luka',
  },
  {
    id: 2,
    imageUrl: 'https://imgur.com/NnBx76Y',
    verb: 'Mencatat',
  },
  {
    id: 3,
    imageUrl: 'https://imgur.com/qECny1f',
    verb: 'Lari berganti-ganti 4x100m',
  },
  {
    id: 4,
    imageUrl: 'https://imgur.com/GTpqmxF',
    verb: 'Lompat jauh',
  },
  {
    id: 5,
    imageUrl: 'https://imgur.com/PvbbVpL',
    verb: 'Bersorak sorai',
  },
  {
    id: 6,
    imageUrl: 'https://imgur.com/2MCBHww',
    verb: 'Menghidangkan',
  },
];

export const VerbExploreScreen: React.FC<VerbExploreScreenProps> = ({ onNext }) => {
  const [pressedVerbs, setPressedVerbs] = useState<number[]>([]);

  const handleVerbPress = (item: VerbItem) => {
    sound.playPop();
    sound.playChime();
    if (!pressedVerbs.includes(item.id)) {
      const updated = [...pressedVerbs, item.id];
      setPressedVerbs(updated);
      if (updated.length === VERB_ITEMS.length) {
        setTimeout(() => {
          sound.playCelebration();
        }, 200);
      }
    }
  };

  const allPressed = pressedVerbs.length === VERB_ITEMS.length;

  return (
    <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 gap-6 py-6 select-none">
      {/* Title & Progress Tracker */}
      <div className="bg-white/80 rounded-2xl border-4 border-[#F59E0B] p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl border-2 border-[#F59E0B] flex items-center justify-center shrink-0">
            <span className="text-xl font-black">🏃</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-[#78350F] leading-tight">
              Meneroka Kata Kerja Tindakan
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#B45309] mt-1">
              Klik setiap gambar di bawah untuk mendedahkan Kata Kerja Hari Sukan!
            </p>
          </div>
        </div>

        {/* Realtime progress bubble */}
        <div className="px-4 py-2 bg-[#FEF3C7] rounded-full border-2 border-[#F59E0B] text-[#78350F] font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs">
          <span>Diteroka:</span>
          <span className="bg-[#78350F] text-white px-3 py-0.5 rounded-full font-black">
            {pressedVerbs.length} / {VERB_ITEMS.length}
          </span>
        </div>
      </div>

      {/* Bento Grid of 6 Action Verb Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {VERB_ITEMS.map((item) => {
          const isPressed = pressedVerbs.includes(item.id);

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVerbPress(item)}
              className={`bg-white rounded-3xl border-4 p-3 flex flex-col items-center justify-between text-center transition-all cursor-pointer relative shadow-md overflow-hidden ${
                isPressed
                  ? 'border-[#10B981] shadow-[5px_5px_0px_#A7F3D0]'
                  : 'border-[#78350F] shadow-[5px_5px_0px_#78350F] hover:shadow-[7px_7px_0px_#78350F]'
              }`}
            >
              {/* Image Container */}
              <div className="w-full aspect-video bg-[#FFFBEB] rounded-2xl overflow-hidden border-2 border-[#78350F] relative flex items-center justify-center mb-3">
                <img
                  src={formatImgurUrl(item.imageUrl)}
                  alt={item.verb}
                  className="w-full h-full object-contain p-2 pt-4"
                  referrerPolicy="no-referrer"
                />
                
                {/* Done/Explored indicator */}
                {isPressed && (
                  <div className="absolute top-2 right-2 bg-[#10B981] text-white p-1 rounded-full border border-white shadow-md z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Action Verb Pop Out Area */}
              <div className="w-full min-h-[50px] flex flex-col justify-center items-center px-1">
                <AnimatePresence mode="wait">
                  {isPressed ? (
                    <motion.div
                      key="verb-text"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#E0F2FE] text-[#0369A1] px-5 py-2 rounded-full border-2 border-[#0284C7] shadow-xs">
                        <span className="font-black text-sm sm:text-base tracking-wide uppercase">
                          {item.verb}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="verb-prompt"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-1 py-1"
                    >
                      <span className="bg-[#FEF3C7] text-[#B45309] border-2 border-dashed border-[#F59E0B] px-4 py-1 rounded-full text-xs font-black animate-pulse uppercase tracking-wider">
                        Klik Untuk Teroka 👆
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Conditional Action Button Area */}
      <div className="min-h-[80px] flex items-center justify-center mt-2">
        <AnimatePresence>
          {allPressed ? (
            <motion.button
              key="start-btn"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              onClick={() => {
                sound.playPop();
                onNext();
              }}
              className="group inline-flex items-center gap-3 bg-[#10B981] hover:bg-[#059669] text-white text-lg sm:text-2xl font-black px-12 sm:px-20 py-4 sm:py-5 rounded-3xl border-4 border-[#065F46] shadow-[6px_6px_0px_#065F46] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#065F46] transition-all cursor-pointer uppercase tracking-tight"
            >
              <span>Mula Susun Karangan ➔</span>
              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
            </motion.button>
          ) : (
            <motion.p
              key="prompt-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm sm:text-base font-black text-[#78350F] bg-white/70 border-3 border-dashed border-[#F59E0B] rounded-2xl px-6 py-3 shadow-inner"
            >
              💡 Sila teroka dan klik kesemua <span className="text-[#10B981]">{VERB_ITEMS.length} gambar</span> di atas terlebih dahulu untuk memulakan cabaran susun karangan!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
