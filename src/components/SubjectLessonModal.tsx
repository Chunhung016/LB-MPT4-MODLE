import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Volume2, 
  Star, 
  CheckCircle2, 
  BookMarked,
  Languages,
  GraduationCap,
  FlaskConical,
  Calculator,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { RegisteredModule, SubjectDefinition } from '../types';
import { playBubbleSound } from '../utils/audio';

interface SubjectLessonModalProps {
  module: RegisteredModule | null;
  subject: SubjectDefinition | null;
  onClose: () => void;
}

export default function SubjectLessonModal({
  module,
  subject,
  onClose,
}: SubjectLessonModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stars, setStars] = useState<number>(3);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  if (!module || !subject) return null;

  const renderSubjectIcon = () => {
    switch (subject.id) {
      case 'bm':
        return <BookMarked className="w-8 h-8 text-emerald-600" />;
      case 'english':
        return <Languages className="w-8 h-8 text-sky-600" />;
      case 'chinese':
        return <GraduationCap className="w-8 h-8 text-rose-600" />;
      case 'science':
        return <FlaskConical className="w-8 h-8 text-purple-600" />;
      case 'math':
        return <Calculator className="w-8 h-8 text-amber-600" />;
      default:
        return <Sparkles className="w-8 h-8 text-amber-500" />;
    }
  };

  const getSubjectLessons = () => {
    switch (subject.id) {
      case 'bm':
        return [
          {
            title: 'Suku Kata & Fonik Asas',
            desc: 'Mengenal huruf vokal (a, e, i, o, u) dan membina perkataan mudah.',
            badge: 'Pelajaran 1',
            prompt: 'Sebut bunyi huruf: "B - A = BA", "J - U = JU"',
          },
          {
            title: 'Kosa Kata Haiwan & Alam',
            desc: 'Mengecam nama rama-rama, lebah, dan burung di taman.',
            badge: 'Pelajaran 2',
            prompt: 'Lebah comel mencari madu di taman bunga.',
          },
        ];
      case 'english':
        return [
          {
            title: 'Phonics & Letter Sounds',
            desc: 'Master short vowels and consonant blends with playful bee audio.',
            badge: 'Lesson 1',
            prompt: 'Sound out: "B-E-E = Bee!", "S-U-N = Sun!"',
          },
          {
            title: 'Everyday Action Words',
            desc: 'Explore jump, fly, sing, and smile with interactive pictures.',
            badge: 'Lesson 2',
            prompt: 'Look at the happy bee flying in the sky.',
          },
        ];
      case 'chinese':
        return [
          {
            title: '基础笔画与常用汉字',
            desc: '学习横、竖、撇、捺，认读“日、月、水、火、木”。',
            badge: '第一课',
            prompt: '大声朗读：“小蜜蜂，嗡嗡嗡，飞到西，飞到东。”',
          },
          {
            title: '看图识字与生活会话',
            desc: '认识学校用具与礼貌用语（你好、谢谢、早安）。',
            badge: '第二课',
            prompt: '看图说一说：今天你学到了什么新汉字？',
          },
        ];
      case 'science':
        return [
          {
            title: '神奇的昆虫与蜜蜂世界',
            desc: '探索蜜蜂如何采蜜、蜂巢的六角形结构与植物传粉。',
            badge: 'Unit 1',
            prompt: 'Observe how honeybees collect nectar from colorful flowers.',
          },
          {
            title: '五官与感觉器官',
            desc: '了解眼睛看、耳朵听、鼻子闻、舌头尝与皮肤摸。',
            badge: 'Unit 2',
            prompt: 'What senses do we use when we taste sweet honey?',
          },
        ];
      case 'math':
        return [
          {
            title: '数字冒险与趣味计数 (1 - 20)',
            desc: '数一数蜂巢里有多少只小蜜蜂与甜甜的花蜜罐。',
            badge: 'Module A',
            prompt: '3 + 2 = 5 只蜜蜂在花丛中飞舞！',
          },
          {
            title: '几何形状与空间逻辑',
            desc: '认识圆形、三角形、正方形以及神奇的六边形蜂窝。',
            badge: 'Module B',
            prompt: 'Find all the hexagons and circles on the screen.',
          },
        ];
      default:
        return [
          {
            title: 'Interactive Learning',
            desc: 'Engaging child-centric exploratory curriculum.',
            badge: 'Lesson 1',
            prompt: 'Tap to begin learning.',
          },
        ];
    }
  };

  const lessons = getSubjectLessons();
  const activeLesson = lessons[currentStep] || lessons[0];

  const handleNextStep = () => {
    playBubbleSound();
    if (currentStep < lessons.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasCompleted(true);
      setStars((prev) => prev + 1);
    }
  };

  return (
    <div 
      id="subject-lesson-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <motion.div
        id="subject-lesson-modal"
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-2xl bg-[#FFFBEB] border-4 border-[#FEF3C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative text-slate-800"
      >
        {/* Header with subject's accent theme */}
        <div 
          className="px-6 py-5 flex items-center justify-between border-b"
          style={{
            backgroundColor: '#FEF3C7',
            borderColor: '#FDE68A',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs border-2 border-amber-200">
              {renderSubjectIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FBBF24] text-[#78350F]">
                  {module.name}
                </span>
                <span className="text-xs font-semibold text-amber-900/80">
                  {subject.secondaryName}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#78350F] font-['Fredoka',sans-serif] mt-0.5">
                {subject.name} {subject.secondaryName ? `(${subject.secondaryName})` : ''}
              </h2>
            </div>
          </div>

          <button
            id="close-subject-lesson-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-amber-100 text-slate-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {hasCompleted ? (
              <motion.div
                key="completion-view"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-6 text-center space-y-5 flex flex-col items-center justify-center"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_12px_30px_rgba(16,185,129,0.4)] border-4 border-white">
                  <CheckCircle2 className="w-14 h-14" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase">
                    Pelajaran Selesai / Lesson Completed!
                  </span>
                  <h3 className="text-2xl font-black text-[#78350F] font-['Fredoka',sans-serif] mt-2">
                    Tahniah! Syabas! 恭喜完成！
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md">
                    You have successfully completed this interactive lesson in {subject.name} ({subject.secondaryName}).
                  </p>
                </div>

                {/* Stars earned */}
                <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full border border-amber-300">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-[#78350F] ml-1">+{stars * 30 + 10} Honey Stars</span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      playBubbleSound();
                      setHasCompleted(false);
                      setCurrentStep(0);
                    }}
                    className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Ulang Semula / Replay
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full bg-[#FBBF24] hover:bg-amber-400 text-[#78350F] font-bold text-sm shadow-md cursor-pointer"
                  >
                    Kembali ke Subjek / Back to Subjects
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Lesson Banner Card */}
                <div className="p-5 rounded-2xl bg-white border-2 border-amber-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-[#78350F]">
                      {activeLesson.badge}
                    </span>
                    <span className="text-xs text-amber-800 font-semibold">
                      Step {currentStep + 1} of {lessons.length}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#78350F] font-['Fredoka',sans-serif]">
                    {activeLesson.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activeLesson.desc}
                  </p>
                </div>

                {/* Interactive Audio Prompt Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-dashed border-amber-300 flex flex-col items-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBBF24] flex items-center justify-center text-[#78350F] shadow-xs">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#78350F] font-['Fredoka',sans-serif]">
                    "{activeLesson.prompt}"
                  </div>
                  <span className="text-[11px] text-amber-800/80 font-medium">
                    Sebut dengan jelas bersama Cikgu Lebah 🐝
                  </span>
                </div>

                {/* Progress bar and Next button */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <div className="flex-1 bg-amber-200/60 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#FBBF24] h-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / lessons.length) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-full bg-[#FBBF24] hover:bg-amber-400 text-[#78350F] font-bold text-sm font-['Fredoka',sans-serif] tracking-wide shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>{currentStep === lessons.length - 1 ? 'SELESAIKAN / FINISH' : 'SETERUSNYA / NEXT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
