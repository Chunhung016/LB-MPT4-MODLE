import { lazy, Suspense, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  BookMarked, 
  Languages, 
  GraduationCap, 
  FlaskConical, 
  Calculator 
} from 'lucide-react';
import { RegisteredModule, SubjectDefinition } from '../types';
import { SUBJECTS } from '../data/subjects';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import { playBubbleSound } from '../utils/audio';
import SubjectLessonModal from './SubjectLessonModal';
import EnglishPartsModal from './EnglishPartsModal';
import ChinesePartsModal from './ChinesePartsModal';
import { useDeviceAccess } from '../hooks/useDeviceAccess';

const EnglishPart3Experience = lazy(() =>
  import('../features/english-part3/EnglishPart3Experience').then((module) => ({
    default: module.EnglishPart3Experience,
  })),
);

const EnglishPart4Experience = lazy(() =>
  import('../features/english-part4/EnglishPart4Experience').then((module) => ({
    default: module.EnglishPart4Experience,
  })),
);

const EnglishPart5Experience = lazy(() =>
  import('../features/english-part5/EnglishPart5Experience').then((module) => ({
    default: module.EnglishPart5Experience,
  })),
);

const SpellingBeeExperience = lazy(() =>
  import('../features/part5/Part5Experience').then((module) => ({
    default: module.SpellingBeeExperience,
  })),
);

const ChinesePartBExperience = lazy(() =>
  import('../features/chinese-part-b/ChinesePartBExperience').then((module) => ({
    default: module.ChinesePartBExperience,
  })),
);

type EnglishExperience = 'part3' | 'part4' | 'part5' | 'spelling-bee' | null;
type ChineseExperience = 'part-b' | null;

interface SubjectSelectionScreenProps {
  module: RegisteredModule;
  onBackToModules: () => void;
}

export default function SubjectSelectionScreen({
  module,
  onBackToModules,
}: SubjectSelectionScreenProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectDefinition | null>(null);
  const [activeEnglishExperience, setActiveEnglishExperience] = useState<EnglishExperience>(null);
  const [activeChineseExperience, setActiveChineseExperience] = useState<ChineseExperience>(null);
  const [chineseLessonOpen, setChineseLessonOpen] = useState<boolean>(false);
  const deviceAccess = useDeviceAccess();

  const openEnglishExperience = (experience: Exclude<EnglishExperience, null>) => {
    setSelectedSubject(null);
    setActiveEnglishExperience(experience);
  };

  const closeEnglishExperience = () => {
    setActiveEnglishExperience(null);
    setSelectedSubject(SUBJECTS.find((subject) => subject.id === 'english') ?? null);
  };

  const openChinesePartB = () => {
    setSelectedSubject(null);
    setActiveChineseExperience('part-b');
  };

  const closeChineseExperience = () => {
    setActiveChineseExperience(null);
    setSelectedSubject(SUBJECTS.find((subject) => subject.id === 'chinese') ?? null);
  };

  const handleSubjectClick = (subj: SubjectDefinition) => {
    playBubbleSound();
    setChineseLessonOpen(false);
    setSelectedSubject(subj);
  };

  const getSubjectIcon = (iconName: string, accentColor: string) => {
    switch (iconName) {
      case 'BookMarked':
        return <BookMarked className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: accentColor }} />;
      case 'Languages':
        return <Languages className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: accentColor }} />;
      case 'GraduationCap':
        return <GraduationCap className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: accentColor }} />;
      case 'FlaskConical':
        return <FlaskConical className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: accentColor }} />;
      case 'Calculator':
        return <Calculator className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: accentColor }} />;
      default:
        return <Sparkles className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: accentColor }} />;
    }
  };

  return (
    <main 
      id="subject-selection-view"
      className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden bg-[#FFFBEB]"
    >
      {/* Peaceful theme background */}
      <PeacefulBeeBackground />

      {/* Top Navigation Bar */}
      <div className="w-full flex items-center justify-between z-20">
        {/* Back Button to Modules */}
        <button
          id="back-to-modules-btn"
          onClick={() => {
            playBubbleSound();
            onBackToModules();
          }}
          className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/90 hover:bg-white border-2 border-[#FEF3C7] shadow-sm text-[#78350F] font-bold text-xs sm:text-sm font-['Fredoka',sans-serif] transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>BACK TO MODULES</span>
        </button>

        {/* Current Active Module Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FBBF24] border-2 border-[#FEF3C7] shadow-sm text-[#78350F] font-bold text-xs sm:text-sm font-['Fredoka',sans-serif] tracking-wide uppercase">
          <Sparkles className="w-4 h-4" />
          <span>{module.name}</span>
        </div>
      </div>

      {/* Centerpiece: 5 Difference Colour Subject Bubbles */}
      <div 
        id="subject-bubbles-center"
        className="my-auto w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center z-10 py-6 sm:py-8 space-y-8 sm:space-y-10"
      >
        {/* 5 Distinct Color Subject Bubbly Buttons aligned neatly in centre horizontally */}
        <div 
          id="subjects-grid"
          className="flex flex-row flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 w-full max-w-5xl"
        >
          {SUBJECTS.map((subj, idx) => (
            <motion.div
              key={subj.id}
              id={`subject-item-${subj.id}`}
              initial={{ scale: 0, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                damping: 14,
                stiffness: 220,
                delay: idx * 0.08,
              }}
              className="flex flex-col items-center justify-center group"
            >
              {/* Distinctive Coloured Bubbly Bubble Button */}
              <motion.button
                id={`bubble-subject-${subj.id}`}
                onClick={() => handleSubjectClick(subj)}
                whileHover={{ scale: 1.1, y: -6 }}
                whileTap={{ scale: 0.94 }}
                className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-38 lg:h-38 rounded-full bg-white border-[8px] sm:border-[10px] md:border-[12px] shadow-xl transition-all duration-300 cursor-pointer focus:outline-hidden focus-visible:ring-4"
                style={{
                  borderColor: subj.accentColor + '30', // soft colored bubble rim
                  boxShadow: `0 18px 45px ${subj.shadowColor}, inset 0 2px 8px rgba(255,255,255,0.9)`,
                }}
                aria-label={`Open ${subj.name} (${subj.secondaryName})`}
              >
                {/* Vibrant Inner Color Tint with Gloss */}
                <div 
                  className="absolute inset-0 rounded-full scale-90 opacity-20 group-hover:scale-100 group-hover:opacity-35 transition-all duration-300 pointer-events-none"
                  style={{
                    backgroundColor: subj.accentColor,
                  }}
                />

                {/* Glassy top-left bubble highlight */}
                <div className="absolute top-2 left-2.5 w-9 h-4.5 rounded-full bg-gradient-to-b from-white/95 to-transparent rotate-[-28deg] pointer-events-none" />

                {/* Floating Bottom Light Ring */}
                <div 
                  className="absolute bottom-1.5 inset-x-4 h-2 rounded-full opacity-40 blur-xs pointer-events-none"
                  style={{ backgroundColor: subj.accentColor }}
                />

                {/* Subject Vector Icon */}
                <div className="relative z-10 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                  {getSubjectIcon(subj.iconName, subj.accentColor)}
                </div>

                {/* Sparkling Color Indicator Badge */}
                <div 
                  className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: subj.accentColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </motion.button>

              {/* Subject Name Label Under the Bubbly Button */}
              <div className="mt-3.5 flex flex-col items-center text-center">
                <span 
                  id={`subject-name-${subj.id}`}
                  className="text-base sm:text-lg md:text-xl font-black font-['Fredoka',sans-serif] tracking-wide drop-shadow-xs"
                  style={{ color: '#78350F' }}
                >
                  {subj.name}
                </span>
                {subj.secondaryName && (
                  <span 
                    className="text-[11px] sm:text-xs font-bold mt-0.5 px-2 py-0.5 rounded-full border"
                    style={{
                      color: subj.accentColor,
                      borderColor: subj.accentColor + '40',
                      backgroundColor: subj.accentColor + '15',
                    }}
                  >
                    {subj.secondaryName}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Accents */}
      <div className="w-full flex items-center justify-between z-10 text-[11px] text-amber-900/60 font-semibold px-2">
        <span>LITTLE BEE MPT4 • 5 SUBJECT INTERACTIVE PORTAL @2026</span>
        <div className="flex space-x-2 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" title="国语 (Bahasa Melayu)" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" title="英语 (English)" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" title="华语" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" title="科学 (Science)" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" title="数学 (Mathematics)" />
        </div>
      </div>

      {/* Subject Lesson Interactive Modal */}
      {selectedSubject?.id === 'english' ? (
        <EnglishPartsModal
          module={module}
          onClose={() => setSelectedSubject(null)}
          onOpenPart3={() => openEnglishExperience('part3')}
          onOpenPart4={() => openEnglishExperience('part4')}
          onOpenPart5={() => openEnglishExperience('part5')}
          onOpenSpellingBee={() => openEnglishExperience('spelling-bee')}
          spellingBeeEnabled={deviceAccess.spellingBeeEnabled}
          activationCode={deviceAccess.activationCode}
          accessLoading={deviceAccess.loading}
          accessError={deviceAccess.error}
          onRefreshAccess={deviceAccess.refresh}
        />
      ) : selectedSubject?.id === 'chinese' && !chineseLessonOpen ? (
        <ChinesePartsModal
          module={module}
          onClose={() => setSelectedSubject(null)}
          onOpenPartA={() => setChineseLessonOpen(true)}
          onOpenPartB={openChinesePartB}
          activationCode={deviceAccess.activationCode}
          accessLoading={deviceAccess.loading}
          accessError={deviceAccess.error}
          onRefreshAccess={deviceAccess.refresh}
        />
      ) : selectedSubject?.id === 'chinese' && chineseLessonOpen ? (
        <SubjectLessonModal
          module={module}
          subject={selectedSubject}
          onClose={() => setChineseLessonOpen(false)}
          sectionLabel="甲组"
        />
      ) : selectedSubject ? (
        <SubjectLessonModal
          module={module}
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
        />
      ) : null}

      {activeEnglishExperience ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#FFFBEB]">
              <div className="flex flex-col items-center gap-3 text-[#78350F]">
                <div className="h-14 w-14 animate-bounce rounded-full border-[8px] border-sky-100 bg-white shadow-lg" />
                <span className="font-['Fredoka',sans-serif] text-sm font-black tracking-wide">
                  LOADING ENGLISH PART…
                </span>
              </div>
            </div>
          }
        >
          {activeEnglishExperience === 'part3' ? (
            <EnglishPart3Experience onExit={closeEnglishExperience} />
          ) : activeEnglishExperience === 'part4' ? (
            <EnglishPart4Experience onExit={closeEnglishExperience} />
          ) : activeEnglishExperience === 'part5' ? (
            <EnglishPart5Experience onExit={closeEnglishExperience} />
          ) : (
            <SpellingBeeExperience onExit={closeEnglishExperience} />
          )}
        </Suspense>
      ) : null}

      {activeChineseExperience ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#FFFBEB]">
              <div className="flex flex-col items-center gap-3 text-[#78350F]">
                <div className="h-14 w-14 animate-bounce rounded-full border-[8px] border-rose-100 bg-white shadow-lg" />
                <span className="font-['Fredoka',sans-serif] text-sm font-black tracking-wide">
                  正在加载华语乙组…
                </span>
              </div>
            </div>
          }
        >
          <ChinesePartBExperience onExit={closeChineseExperience} />
        </Suspense>
      ) : null}
    </main>
  );
}
