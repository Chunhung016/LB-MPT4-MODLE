import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Loader2,
  BookOpen,
  Sparkles,
  Printer,
  X,
  ArrowLeft,
  Check,
  Type as TypeIcon,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type Phase = 'preset_selection' | 'setup_question' | 'grading' | 'result';

export interface ExamPreset {
  id: string;
  code: string;
  title: string;
  subject: string;
  languageBadge: string;
  badgeColor: string;
  defaultMarks: string;
  defaultCriteria: string;
  description: string;
}

export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'eng-p6',
    code: 'ENG - PART 6',
    title: 'ENG - PART 6',
    subject: 'English - Part 6 Essay',
    languageBadge: 'ENG',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultMarks: '15',
    description: 'Short Essay & Response (Content 5m + Language 10m). Target: 40-50 words.',
    defaultCriteria: `Detailed Marking Rubric for Part 6 (Total: 15 Marks):
• Content / Task Fulfilment (5m): Topic/hobby stated clearly, TWO distinct & logical reasons provided.
• Language / Accuracy (10m): Excellent grammar & vocabulary, flawless punctuation, word count strictly observed (40-50 words).
• Band A - Excellent (13-15m): 2 distinct reasons, flawless grammar, target word count.
• Band B - Good (9-12m): 2 reasons (1 minor clarity issue), good grammar.
• Band C - Satisfactory (5-8m): Only 1 reason or repetitive, noticeable errors.
• Band D/F - Weak (1-4m): Unclear choice, no valid reasons, multiple serious errors.`,
  },
  {
    id: 'bm-b',
    code: 'BM - BAHAGIAN B',
    title: 'BM - BAHAGIAN B',
    subject: 'Bahasa Melayu - Bahagian B',
    languageBadge: 'BM',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultMarks: '10',
    description: 'Guided Response & Short Writing based on visual stimulus.',
    defaultCriteria: 'Must include all key points from stimulus image. Clear paragraph structure, correct Malay grammar, good vocabulary, 50–80 words.',
  },
  {
    id: 'bm-c',
    code: 'BM - BAHAGIAN C',
    title: 'BM - BAHAGIAN C',
    subject: 'Bahasa Melayu - Bahagian C',
    languageBadge: 'BM',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultMarks: '15',
    description: 'Narrative & Descriptive Essay (Penulisan).',
    defaultCriteria: 'Complete narrative/descriptive essay based on stimulus or prompt. Excellent flow, rich idioms (peribahasa), logical introduction-body-conclusion structure, 80–120 words.',
  },
  {
    id: 'eng-p3',
    code: 'ENG - PART 3',
    title: 'ENG - PART 3',
    subject: 'English - Part 3',
    languageBadge: 'ENG',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultMarks: '20',
    description: 'Short Communicative Message (Email / Letter).',
    defaultCriteria: 'Response to email/letter prompt. Address all 3 bullet points, appropriate informal tone, correct formatting, accurate tenses & spelling, 60–80 words.',
  },
  {
    id: 'eng-p4',
    code: 'ENG - PART 4',
    title: 'ENG - PART 4',
    subject: 'English - Part 4',
    languageBadge: 'ENG',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultMarks: '20',
    description: 'Guided Writing (Article / Story Creation).',
    defaultCriteria: 'Guided article or story creation based on pictures/notes. Well-organized paragraphs, descriptive adjectives, correct punctuation, 100–120 words.',
  },
  {
    id: 'bc-gl',
    code: 'BC - 供料作文',
    title: 'BC - 供料作文',
    subject: 'Bahasa Cina - 供料作文',
    languageBadge: 'BC',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    defaultMarks: '10',
    description: 'Material-Based Guided Composition (供料作文).',
    defaultCriteria: 'Guided composition based on provided stimulus material. Must incorporate all key points, proper paragraphing, accurate Chinese grammar & punctuation, 50–80 words.',
  },
];

interface SetupData {
  preset: ExamPreset | null;
  questionImage: string | null;
  totalMarks: string;
  subjectLevel: string;
  keywords: string;
  teacherNotes: string;
}

interface ErrorCorrection {
  wrong_text: string;
  correct_text: string;
  type: string;
  explanation: string;
}

interface GradingResult {
  transcribed_text: string;
  word_count: number;
  word_count_status: string;
  content_score: string;
  language_score: string;
  score: string;
  band: string;
  percentage: number;
  grade_status: string;
  corrections: ErrorCorrection[];
  mark_breakdown: string;
  key_strengths?: string[];
  grammar_spelling_errors: string[];
  sentence_suggestions?: string[];
  improvement_suggestion: string;
}

const LOGO_URL = "https://i.postimg.cc/N0PJWrNc/image.png";

export default function AceBeeSnap() {
  const [phase, setPhase] = useState<Phase>('preset_selection');
  
  const [setupData, setSetupData] = useState<SetupData>({
    preset: null,
    questionImage: null,
    totalMarks: '15',
    subjectLevel: '',
    keywords: '',
    teacherNotes: '',
  });

  const [studentImage, setStudentImage] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle Preset Choice
  const handleSelectPreset = (preset: ExamPreset) => {
    setSetupData({
      preset,
      questionImage: null,
      totalMarks: preset.defaultMarks,
      subjectLevel: preset.subject,
      keywords: preset.defaultCriteria,
      teacherNotes: '',
    });
    setError(null);
    setPhase('setup_question');
  };

  // Image upload reader
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'question' | 'student'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'question') {
          setSetupData(prev => ({ ...prev, questionImage: reader.result as string }));
        } else {
          setStudentImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const proceedToGradingStep = () => {
    setError(null);
    setPhase('grading');
  };

  const gradeStudent = async () => {
    if (!studentImage) {
      setError('Please upload or snap a photo of the student\'s answer first.');
      return;
    }

    setIsGrading(true);
    setError(null);

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionImage: setupData.questionImage,
          studentImage,
          presetId: setupData.preset?.id,
          presetTitle: setupData.preset?.title || setupData.subjectLevel,
          totalMarks: setupData.totalMarks,
          subjectLevel: setupData.subjectLevel,
          keywords: setupData.keywords,
          teacherNotes: setupData.teacherNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze submission.');
      }

      setResult(data as GradingResult);
      setPhase('result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI Grading failed. Please verify the API key and try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const nextStudent = () => {
    setStudentImage(null);
    setResult(null);
    setError(null);
    setPhase('grading');
  };

  const resetAll = () => {
    setSetupData({
      preset: null,
      questionImage: null,
      totalMarks: '15',
      subjectLevel: '',
      keywords: '',
      teacherNotes: '',
    });
    setStudentImage(null);
    setResult(null);
    setError(null);
    setPhase('preset_selection');
  };

  // Helper to render inline highlighted text with red wrong words and green corrections
  const renderInlineAnnotatedText = (text: string, corrections: ErrorCorrection[]) => {
    if (!text) return null;
    if (!corrections || corrections.length === 0) {
      return <p className="text-slate-800 font-serif leading-relaxed text-base">{text}</p>;
    }

    // Replace occurrences with tagged elements
    let renderedParts: React.ReactNode[] = [];
    let remainingText = text;

    // Sort corrections by occurrence in text
    const foundIndices: { start: number; end: number; wrong: string; correct: string; type: string }[] = [];

    corrections.forEach(c => {
      if (c.wrong_text) {
        const idx = remainingText.toLowerCase().indexOf(c.wrong_text.toLowerCase());
        if (idx !== -1) {
          foundIndices.push({
            start: idx,
            end: idx + c.wrong_text.length,
            wrong: remainingText.substring(idx, idx + c.wrong_text.length),
            correct: c.correct_text,
            type: c.type,
          });
        }
      }
    });

    foundIndices.sort((a, b) => a.start - b.start);

    let lastIdx = 0;
    foundIndices.forEach((item, i) => {
      if (item.start >= lastIdx) {
        // Push preceding plain text
        renderedParts.push(text.substring(lastIdx, item.start));
        // Push red strike-through
        renderedParts.push(
          <span key={`wrong-${i}`} className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-bold line-through">
            {item.wrong}
          </span>
        );
        // Push green correction
        renderedParts.push(
          <span key={`correct-${i}`} className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold shadow-2xs">
            {item.correct}
          </span>
        );
        lastIdx = item.end;
      }
    });

    if (lastIdx < text.length) {
      renderedParts.push(text.substring(lastIdx));
    }

    return (
      <div className="text-slate-900 font-serif leading-relaxed text-base sm:text-lg bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 shadow-inner">
        {renderedParts.length > 0 ? renderedParts : text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center">
      {/* Top Banner Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            onClick={resetAll} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-500/10 border border-amber-300 flex items-center justify-center p-0.5 shadow-xs group-hover:scale-105 transition-transform">
              <img 
                src={LOGO_URL} 
                alt="ACEBEE Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                ACEBEE-AI-SNAP
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase !== 'preset_selection' && (
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Select New Option"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Change Option</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 py-6 flex-1 flex flex-col">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3 text-sm shadow-xs"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-semibold">Grading Notice</p>
                <p className="mt-0.5 text-rose-700">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: PRESET SELECTION INTERFACE */}
        {phase === 'preset_selection' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 flex-1 flex flex-col justify-center"
          >


            {/* Presets Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BookOpen size={16} className="text-amber-600" /> Available Exam Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXAM_PRESETS.map((preset) => (
                  <motion.div
                    key={preset.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      "bg-white border-2 hover:border-amber-500 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden",
                      preset.id === 'eng-p6' ? "border-amber-400 ring-2 ring-amber-400/30" : "border-slate-200"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-extrabold px-2.5 py-1 rounded-md border", preset.badgeColor)}>
                          {preset.languageBadge}
                        </span>
                        <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          {preset.defaultMarks} Marks
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                        {preset.title}
                        {preset.id === 'eng-p6' && (
                          <span className="bg-amber-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                      <span>Select & Load Rubric</span>
                      <ChevronRight size={16} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SETUP QUESTION & RUBRIC */}
        {phase === 'setup_question' && setupData.preset && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header / Back */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPhase('preset_selection')}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} /> Back to Preset Options
              </button>
              <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", setupData.preset.badgeColor)}>
                Active: {setupData.preset.code}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Auto-Loaded Rubric: {setupData.preset.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official grading parameters loaded automatically. You can customize settings or proceed.
                  </p>
                </div>
              </div>

              {/* Specific Question Prompt Notice for ENG - PART 6 */}
              {setupData.preset.id === 'eng-p6' && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                      <BookOpen size={16} className="text-amber-700" />
                      Official ENG - PART 6 Exam Question:
                    </span>
                    <span className="font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                      15 Marks | 40–50 Words
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-sm italic bg-white p-3 rounded-xl border border-amber-200">
                    "Your class is preparing a Hobby Showcase Wall. Which hobby would you like to learn? Give TWO reasons."
                  </p>

                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-[11px] pt-1">
                    <AlertCircle size={14} className="shrink-0 text-rose-600" />
                    <span>STRICT REQUIREMENT: Only submissions answering THIS Hobby Showcase question will be marked. Scanned answers to other questions will be ignored & marked off-topic.</span>
                  </div>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subject & Section Title
                  </label>
                  <input
                    type="text"
                    value={setupData.subjectLevel}
                    onChange={(e) => setSetupData({ ...setupData, subjectLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none text-sm font-semibold transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Total Section Marks
                  </label>
                  <input
                    type="text"
                    value={setupData.totalMarks}
                    onChange={(e) => setSetupData({ ...setupData, totalMarks: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none text-sm font-semibold transition-all"
                    placeholder="e.g. 15 or 20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Marking Rubric (Auto-Configured)
                </label>
                <textarea
                  value={setupData.keywords}
                  onChange={(e) => setSetupData({ ...setupData, keywords: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none text-sm font-mono transition-all leading-relaxed"
                  placeholder="Enter required keywords, maximum word count, key points..."
                />
              </div>

              {/* Question Image Upload (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Question Paper / Prompt Image (Recommended)</span>
                  <span className="text-slate-400 normal-case font-normal text-xs">Optional if prompt is standard</span>
                </label>

                <label className="block w-full min-h-[120px] border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'question')}
                  />
                  {setupData.questionImage ? (
                    <div className="relative w-full h-full min-h-[140px] flex items-center justify-center bg-slate-900">
                      <img
                        src={setupData.questionImage}
                        alt="Question Paper"
                        className="max-h-[180px] w-auto object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                        <Upload size={16} /> Click to change question image
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 group-hover:text-amber-600 transition-colors flex flex-col items-center">
                      <Camera size={28} className="mb-1" />
                      <span className="text-xs font-bold text-slate-700">Snap Photo or Upload Question Sheet</span>
                    </div>
                  )}
                </label>
              </div>

              <button
                onClick={proceedToGradingStep}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                Proceed to Grade Student Answer
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: UPLOAD STUDENT ANSWER & GRADE */}
        {phase === 'grading' && setupData.preset && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                    {setupData.preset.languageBadge}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{setupData.preset.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Rubric Target: {setupData.totalMarks} Marks | {setupData.subjectLevel}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPhase('setup_question')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  View / Edit Rubric
                </button>
              </div>

              {setupData.preset.id === 'eng-p6' && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                  <p className="font-extrabold text-amber-900 uppercase tracking-wider text-[11px]">
                    Target Prompt (ENG - PART 6):
                  </p>
                  <p className="text-slate-900 font-semibold italic text-xs">
                    "Your class is preparing a Hobby Showcase Wall. Which hobby would you like to learn? Give TWO reasons." (40-50 words, 1 paragraph)
                  </p>
                  <p className="text-[10px] text-rose-700 font-bold">
                    * Answers to any other questions will be ignored and awarded 0 marks.
                  </p>
                </div>
              )}
            </div>

            {/* Student Image Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900">Upload Student Answer Sheet</h3>
                <p className="text-xs text-slate-500">
                  Snap a photo of the handwritten essay or upload an image file. ACEBEE-AI-SNAP will digitize text and grade errors.
                </p>
              </div>

              <label className="block w-full min-h-[280px] max-h-[400px] border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-3xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group flex items-center justify-center shadow-inner">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'student')}
                />
                {studentImage ? (
                  <div className="relative w-full h-full min-h-[280px] flex items-center justify-center bg-slate-900">
                    <img
                      src={studentImage}
                      alt="Student Submission"
                      className="max-h-[360px] w-auto object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold gap-2">
                      <Camera size={20} /> Retake or Upload New Image
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 group-hover:text-amber-600 transition-colors flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors shadow-xs">
                      <Camera size={32} />
                    </div>
                    <span className="text-base font-extrabold text-slate-800">
                      Snap Photo or Select Answer Sheet
                    </span>
                    <span className="text-xs text-slate-400 mt-1 max-w-xs">
                      Supports handwritten papers, essays, and printed answer scripts.
                    </span>
                  </div>
                )}
              </label>

              <button
                onClick={gradeStudent}
                disabled={!studentImage || isGrading}
                className={cn(
                  "w-full font-extrabold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-base transition-all active:scale-[0.99] cursor-pointer",
                  !studentImage || isGrading
                    ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                    : "bg-slate-900 hover:bg-black text-white shadow-slate-400"
                )}
              >
                {isGrading ? (
                  <>
                    <Loader2 size={22} className="animate-spin text-amber-400" />
                    Transcribing Handwriting & Marking Rubric...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-amber-400" />
                    Digitize Text & Grade Submission
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: RESULT EVALUATION REPORT */}
        {phase === 'result' && result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Score Summary Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">
                  <CheckCircle2 size={14} /> Evaluation & Digitization Completed
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {setupData.preset?.title} Grade Report
                </h3>
                <p className="text-slate-500 text-xs font-medium">
                  Section: {setupData.subjectLevel} | Performance: {result.band || result.grade_status}
                </p>

                {/* Sub Scores Grid */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {result.content_score && (
                    <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                      Content / Task Fulfilment: <strong className="text-amber-700">{result.content_score}</strong>
                    </span>
                  )}
                  {result.language_score && (
                    <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                      Language / Accuracy: <strong className="text-amber-700">{result.language_score}</strong>
                    </span>
                  )}
                  {result.word_count_status && (
                    <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-lg border border-amber-200">
                      Word Count: {result.word_count_status}
                    </span>
                  )}
                </div>
              </div>

              {/* Final Score Display */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-w-[170px] border border-slate-800 shadow-md">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Total Score
                </span>
                <div className="text-4xl font-black text-amber-400 tracking-tight">
                  {result.score}
                </div>
                {result.band && (
                  <span className="mt-2 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-center">
                    {result.band}
                  </span>
                )}
              </div>
            </div>

            {/* DIGITIZED TRANSCRIPTION & INLINE RED/GREEN ERROR MARKINGS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TypeIcon size={18} className="text-amber-600" />
                  Digitized Text & Inline Red/Green Marking
                </h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {result.word_count ? `${result.word_count} Words Detected` : 'OCR Transcribed'}
                </span>
              </div>

              {/* Transcribed Text with Inline Highlights */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <span>Digitized Submission (Spelling/Grammar Errors Highlighted):</span>
                </p>

                {renderInlineAnnotatedText(result.transcribed_text, result.corrections)}
              </div>

              {/* Detailed Correction Table */}
              {result.corrections && result.corrections.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-rose-600" />
                    Spelling & Grammar Corrections List
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.corrections.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-rose-600 line-through bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {item.wrong_text}
                          </span>
                          <span className="text-slate-400 text-[10px]">➔</span>
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {item.correct_text}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium text-[11px]">
                          <strong className="text-slate-800">{item.type}:</strong> {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Breakdown Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mark Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 md:col-span-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <FileText size={16} className="text-amber-600" /> Rubric Allocation & Marking Justification
                </h4>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {result.mark_breakdown}
                </div>
              </div>

              {/* Key Strengths */}
              {result.key_strengths && result.key_strengths.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Key Strengths
                  </h4>
                  <ul className="text-xs text-emerald-900 space-y-1.5 list-disc list-inside font-medium">
                    {result.key_strengths.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sentence Structure / Vocabulary Suggestions */}
              {result.sentence_suggestions && result.sentence_suggestions.length > 0 && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                    <Sparkle size={16} className="text-blue-600" /> Sentence & Vocabulary Upgrades
                  </h4>
                  <ul className="text-xs text-blue-950 space-y-1.5 list-disc list-inside font-medium">
                    {result.sentence_suggestions.map((sugg, idx) => (
                      <li key={idx}>{sugg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Improvement Suggestion */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-2 md:col-span-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600" /> Teacher's Actionable Improvement Plan
                </h4>
                <p className="text-sm font-semibold text-amber-950 leading-relaxed">
                  {result.improvement_suggestion}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={nextStudent}
                className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                Grade Next Student
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer size={18} /> Print Grade Report
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
