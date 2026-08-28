import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Volume2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Eye,
  Settings2,
  Info,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRESET_BOX_PICTURES, DEFAULT_OVERLAY_IMAGE } from '../utils/defaultSettings';
import { sound } from '../utils/audio';
import { formatImgurUrl } from '../utils/imgur';

export const AdminDashboard: React.FC = () => {
  const {
    settings,
    activeBoxScreen,
    updateSettings,
    resetSettings,
    importSettingsJSON,
    exportSettingsJSON,
    isAdminOpen,
    setIsAdminOpen,
    adminTab,
    setAdminTab,
    updateHotspotPoint,
    addHotspotPoint,
    removeHotspotPoint,
    setCurrentScreen,
    // Box Screens CRUD
    activeBoxScreenIndex,
    setActiveBoxScreenIndex,
    addBoxScreen,
    duplicateBoxScreen,
    removeBoxScreen,
    updateBoxScreen,
    setBoxCountForScreen,
    updatePuzzlePieceForScreen,
    addPuzzlePieceForScreen,
    removePuzzlePieceForScreen,
    addCandidateBlankWordForScreen,
    removeCandidateBlankWordForScreen,
  } = useApp();

  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [newBlankWord, setNewBlankWord] = useState('');

  if (!isAdminOpen) return null;

  const currentScreenId = activeBoxScreen.id;
  const currentBoxCount = activeBoxScreen.boxCount;
  const currentPieces = activeBoxScreen.puzzlePieces.slice(0, currentBoxCount);

  const handleCopyExport = () => {
    const json = exportSettingsJSON();
    navigator.clipboard.writeText(json);
    setCopySuccess(true);
    sound.playPop();
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleApplyImport = () => {
    setJsonError(null);
    if (!jsonInput.trim()) {
      setJsonError('Sila tampal teks JSON konfigurasi.');
      return;
    }
    const success = importSettingsJSON(jsonInput);
    if (success) {
      setJsonInput('');
      setJsonError(null);
    } else {
      setJsonError('Format JSON tidak sah. Sila periksa semula.');
    }
  };

  const handleAddBlankWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBlankWord.trim()) {
      addCandidateBlankWordForScreen(currentScreenId, newBlankWord);
      setNewBlankWord('');
      sound.playPop();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl border-4 border-[#78350F] shadow-[10px_10px_0px_#F59E0B] w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-[#78350F]"
        >
          {/* Top Header Bar */}
          <div className="h-16 px-4 sm:px-6 bg-[#FEF3C7] border-b-4 border-[#F59E0B] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B] rounded-2xl flex items-center justify-center border-2 border-[#78350F] shadow-xs">
                <Sliders className="w-5 h-5 text-[#78350F]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-[#78350F] flex items-center gap-2">
                  <span>Pusat Kawalan & Tetapan Admin</span>
                  <span className="text-xs bg-[#78350F] text-[#FDE68A] px-2 py-0.5 rounded-full font-mono">
                    [G]
                  </span>
                </h2>
                <p className="text-[11px] font-bold text-[#B45309] hidden sm:block">
                  Ubah suai paparan kotak, gambar, ayat karangan dan segala kawalan sistem secara langsung.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-close-admin"
                onClick={() => {
                  sound.playPop();
                  setIsAdminOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 border-2 border-[#78350F] text-[#78350F] hover:text-rose-600 flex items-center justify-center shadow-[2px_2px_0px_#78350F] transition cursor-pointer"
                title="Tutup Panel Admin"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <div className="bg-[#FFFBEB] px-4 sm:px-6 py-2 border-b-2 border-[#FDE68A] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <button
              onClick={() => {
                setAdminTab('boxes');
                sound.playPop();
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                adminTab === 'boxes'
                  ? 'bg-[#78350F] text-white shadow-[2px_2px_0px_#F59E0B]'
                  : 'bg-white text-[#78350F] hover:bg-[#FEF3C7] border border-[#F59E0B]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              <span>Paparan Kotak ({settings.boxScreens.length} Aktiviti)</span>
            </button>

            <button
              onClick={() => {
                setAdminTab('toggles');
                sound.playPop();
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                adminTab === 'toggles'
                  ? 'bg-[#78350F] text-white shadow-[2px_2px_0px_#F59E0B]'
                  : 'bg-white text-[#78350F] hover:bg-[#FEF3C7] border border-[#F59E0B]'
              }`}
            >
              <Settings2 className="w-4 h-4 text-[#F59E0B]" />
              <span>Kawalan & Togel Sistem</span>
            </button>

            <button
              onClick={() => {
                setAdminTab('info');
                sound.playPop();
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                adminTab === 'info'
                  ? 'bg-[#78350F] text-white shadow-[2px_2px_0px_#F59E0B]'
                  : 'bg-white text-[#78350F] hover:bg-[#FEF3C7] border border-[#F59E0B]'
              }`}
            >
              <Info className="w-4 h-4 text-[#F59E0B]" />
              <span>Maklumat & Panduan</span>
            </button>

            <button
              onClick={() => {
                setAdminTab('data');
                sound.playPop();
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                adminTab === 'data'
                  ? 'bg-[#78350F] text-white shadow-[2px_2px_0px_#F59E0B]'
                  : 'bg-white text-[#78350F] hover:bg-[#FEF3C7] border border-[#F59E0B]'
              }`}
            >
              <Save className="w-4 h-4 text-[#F59E0B]" />
              <span>Simpan & Eksport</span>
            </button>
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-left">
            {/* =========================================================================
                TAB 1: MULTIPLE BOX SCREENS (NEXT SCREEN / BOX SCREEN CRUD & EDITING)
                ========================================================================= */}
            {adminTab === 'boxes' && (
              <div className="space-y-6">
                {/* 1. Multiple Box Screens Bar */}
                <div className="bg-[#FEF3C7] p-4 rounded-2xl border-2 border-[#F59E0B] shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-[#78350F] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#B45309]" />
                        Senarai Paparan Kotak (Aktiviti Susun Gambar & Ayat)
                      </h3>
                      <p className="text-xs text-[#B45309] font-bold">
                        Anda boleh menambah seberapa banyak paparan aktiviti susun gambar yang diingini.
                      </p>
                    </div>

                    <button
                      id="btn-add-new-box-screen"
                      onClick={() => {
                        addBoxScreen();
                      }}
                      className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs sm:text-sm rounded-xl border-2 border-[#065F46] shadow-[2px_2px_0px_#065F46] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Paparan Kotak Baru</span>
                    </button>
                  </div>

                  {/* Horizontal Stage Selector Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {settings.boxScreens.map((screen, sIdx) => {
                      const isActive = sIdx === activeBoxScreenIndex;
                      return (
                        <button
                          key={screen.id}
                          onClick={() => {
                            setActiveBoxScreenIndex(sIdx);
                            sound.playPop();
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 border-2 flex items-center gap-2 ${
                            isActive
                              ? 'bg-[#78350F] text-white border-[#78350F] shadow-[3px_3px_0px_#F59E0B]'
                              : 'bg-white text-[#78350F] border-[#F59E0B] hover:bg-[#FDE68A]'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#78350F] text-[10px] font-black flex items-center justify-center">
                            {sIdx + 1}
                          </span>
                          <span className="max-w-[140px] truncate">{screen.title}</span>
                          <span className="text-[10px] opacity-75 font-mono">
                            ({screen.boxCount} kotak)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Active Box Screen Configuration Header */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#FDE68A] pb-3">
                    <div className="flex-1 min-w-[240px]">
                      <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                        Tajuk Paparan / Aktiviti Semasa:
                      </label>
                      <input
                        type="text"
                        value={activeBoxScreen.title}
                        onChange={(e) =>
                          updateBoxScreen(currentScreenId, { title: e.target.value })
                        }
                        placeholder="Contoh: Aktiviti 1: Permulaan Gotong-Royong"
                        className="w-full border-2 border-[#78350F] rounded-xl px-3 py-1.5 text-sm font-black text-[#78350F] bg-[#FEF3C7]/40 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateBoxScreen(currentScreenId)}
                        className="px-3 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#78350F] text-xs font-black rounded-xl border border-[#78350F] flex items-center gap-1 cursor-pointer"
                        title="Salin paparan aktiviti ini"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplikasi</span>
                      </button>

                      {settings.boxScreens.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Adakah anda pasti mahu memadam "${activeBoxScreen.title}"?`)) {
                              removeBoxScreen(currentScreenId);
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-xl border border-rose-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Padam Paparan</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setCurrentScreen('puzzle');
                          setIsAdminOpen(false);
                          sound.playPop();
                        }}
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black rounded-xl border border-[#065F46] flex items-center gap-1 cursor-pointer"
                        title="Uji Mainkan Paparan Ini Sekarang"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Uji Paparan Ini</span>
                      </button>
                    </div>
                  </div>

                  {/* Box Count Selector for this Screen */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-black text-[#78350F] block">
                        Bilangan Kotak untuk Paparan Ini:
                      </span>
                      <span className="text-[11px] text-[#B45309] font-bold">
                        Pilih berapa kotak urutan gambar (2 hingga 6 kotak):
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {[2, 3, 4, 5, 6].map((count) => (
                        <button
                          key={count}
                          onClick={() => {
                            setBoxCountForScreen(currentScreenId, count);
                            sound.playPop();
                          }}
                          className={`w-9 h-9 rounded-xl font-black text-sm transition cursor-pointer border-2 ${
                            currentBoxCount === count
                              ? 'bg-[#F59E0B] text-[#78350F] border-[#78350F] shadow-[2px_2px_0px_#78350F] scale-105'
                              : 'bg-white text-[#78350F] border-[#F59E0B] hover:bg-[#FEF3C7]'
                          }`}
                        >
                          {count}
                        </button>
                      ))}

                      {currentBoxCount < 6 && (
                        <button
                          onClick={() => {
                            addPuzzlePieceForScreen(currentScreenId);
                            sound.playPop();
                          }}
                          className="px-3 py-1.5 bg-[#10B981] text-white rounded-xl text-xs font-black border border-[#065F46] hover:bg-[#059669] flex items-center gap-1 cursor-pointer ml-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Kotak
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Individual Boxes / Pictures / Sentences Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#78350F] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Senarai {currentBoxCount} Kotak & Gambar ({activeBoxScreen.title})
                    </span>
                    <span className="text-xs font-bold text-[#78350F]">
                      Tetapkan gambar dan ayat yang dipadankan dengan setiap kotak.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentPieces.map((piece, pIdx) => {
                      const boxNum = pIdx + 1;
                      return (
                        <div
                          key={piece.id}
                          className="bg-white rounded-2xl border-3 border-[#78350F] p-4 shadow-[4px_4px_0px_#FDE68A] flex flex-col justify-between gap-3 relative"
                        >
                          {/* Box Header Badge */}
                          <div className="flex items-center justify-between border-b border-[#FDE68A] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-[#F59E0B] text-[#78350F] font-black text-xs flex items-center justify-center border border-[#78350F]">
                                #{boxNum}
                              </span>
                              <span className="font-black text-xs sm:text-sm text-[#78350F] uppercase">
                                Kotak {boxNum} (Padanan: Kotak Sasaran {piece.targetBox})
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => sound.speak(piece.sentence)}
                                className="p-1 bg-[#FEF3C7] text-[#78350F] rounded-lg border border-[#F59E0F] hover:bg-[#FDE68A] cursor-pointer"
                                title="Dengar sebutan ayat"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>

                              {currentBoxCount > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePuzzlePieceForScreen(currentScreenId, piece.id)
                                  }
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                                  title="Padam kotak ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {/* 1:1 Aspect Ratio Thumbnail */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-xl border-2 border-[#78350F] bg-[#FEF3C7]/40 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                              <img
                                src={formatImgurUrl(piece.imageUrl)}
                                alt={piece.altText}
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Image Controls & Presets */}
                            <div className="flex-1 space-y-2">
                              <div>
                                <label className="block text-[10px] font-black text-[#78350F] uppercase">
                                  Pautan Gambar (Image URL):
                                </label>
                                <input
                                  type="text"
                                  value={piece.imageUrl}
                                  onChange={(e) =>
                                    updatePuzzlePieceForScreen(currentScreenId, piece.id, {
                                      imageUrl: e.target.value,
                                    })
                                  }
                                  placeholder="https://i.postimg.cc/..."
                                  className="w-full border border-[#78350F] rounded-lg px-2 py-1 text-xs font-mono text-[#78350F] bg-[#FFFBEB] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                                />
                              </div>

                              {/* Preset Quick Buttons */}
                              <div>
                                <span className="block text-[10px] font-black text-[#B45309] mb-0.5">
                                  Pilih Gambar Contoh:
                                </span>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {PRESET_BOX_PICTURES.map((preset, prIdx) => (
                                    <button
                                      key={prIdx}
                                      type="button"
                                      onClick={() =>
                                        updatePuzzlePieceForScreen(currentScreenId, piece.id, {
                                          imageUrl: preset.url,
                                        })
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${
                                        piece.imageUrl === preset.url
                                          ? 'bg-[#F59E0B] text-[#78350F] border-[#78350F] font-black'
                                          : 'bg-white text-[#78350F] border-slate-300 hover:bg-[#FEF3C7]'
                                      }`}
                                    >
                                      G{prIdx + 1}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Label & Target Box */}
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-black text-[#78350F] uppercase">
                                    Label Gambar:
                                  </label>
                                  <input
                                    type="text"
                                    value={piece.caption}
                                    onChange={(e) =>
                                      updatePuzzlePieceForScreen(currentScreenId, piece.id, {
                                        caption: e.target.value,
                                      })
                                    }
                                    className="w-full border border-[#78350F] rounded-lg px-2 py-0.5 text-xs font-bold text-[#78350F]"
                                  />
                                </div>
                                <div className="w-20">
                                  <label className="block text-[10px] font-black text-[#78350F] uppercase">
                                    Kotak #:
                                  </label>
                                  <select
                                    value={piece.targetBox}
                                    onChange={(e) =>
                                      updatePuzzlePieceForScreen(currentScreenId, piece.id, {
                                        targetBox: parseInt(e.target.value, 10),
                                      })
                                    }
                                    className="w-full border border-[#78350F] rounded-lg px-1.5 py-0.5 text-xs font-bold text-[#78350F] bg-white"
                                  >
                                    {Array.from({ length: currentBoxCount }, (_, i) => i + 1).map(
                                      (n) => (
                                        <option key={n} value={n}>
                                          #{n}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Sentence / Text Area for this Picture */}
                          <div className="mt-1">
                            <label className="block text-xs font-black text-[#78350F] mb-1 flex items-center justify-between">
                              <span>Ayat / Teks Karangan Gambar #{boxNum}:</span>
                              <span className="text-[10px] text-[#B45309] font-normal">
                                Ayat ini akan dipaparkan semasa gambar diletakkan
                              </span>
                            </label>
                            <textarea
                              rows={2}
                              value={piece.sentence}
                              onChange={(e) =>
                                updatePuzzlePieceForScreen(currentScreenId, piece.id, {
                                  sentence: e.target.value,
                                })
                              }
                              placeholder={`Ayat untuk gambar ${boxNum}...`}
                              className="w-full border-2 border-[#78350F] rounded-xl p-2 text-xs sm:text-sm font-bold text-[#78350F] bg-[#FFFBEB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Live Combined Essay Preview & Fill In Blanks Manager */}
                <div className="bg-[#78350F] text-white p-4 sm:p-6 rounded-2xl border-4 border-[#451A03] shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F59E0B]/30 pb-2">
                    <span className="text-[#FDE68A] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FDE68A]" />
                      Pratonton Karangan Penuh (Aktiviti: {activeBoxScreen.title})
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const fullText = currentPieces
                          .map((p) => p.sentence)
                          .filter(Boolean)
                          .join(' ');
                        sound.speak(fullText);
                      }}
                      className="flex items-center gap-1 bg-[#F59E0B] text-[#78350F] px-3 py-1 rounded-full text-xs font-black hover:bg-[#D97706] cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Uji Bacaan Karangan</span>
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-amber-50 leading-relaxed bg-[#451A03]/60 p-3 rounded-xl border border-[#F59E0B]/30">
                    {currentPieces.map((p) => p.sentence).filter(Boolean).join(' ') || (
                      <span className="text-[#FDE68A]/50 italic">
                        Tiada ayat dimasukkan lagi. Masukkan ayat pada setiap kotak di atas.
                      </span>
                    )}
                  </p>

                  {/* Candidate Blank Words Manager for this Screen */}
                  <div className="pt-2 border-t border-[#F59E0B]/30">
                    <span className="text-xs font-black text-[#FDE68A] block mb-1">
                      Kata Kunci Cabaran Isi Tempat Kosong (Candidate Blank Words):
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {activeBoxScreen.candidateBlankWords.map((word) => (
                        <span
                          key={word}
                          className="bg-[#F59E0B] text-[#78350F] font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white"
                        >
                          <span>{word}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeCandidateBlankWordForScreen(currentScreenId, word)
                            }
                            className="hover:text-rose-900 ml-1 font-black cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddBlankWord} className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        value={newBlankWord}
                        onChange={(e) => setNewBlankWord(e.target.value)}
                        placeholder="Tambah kata kunci (contoh: gotong-royong)..."
                        className="flex-1 bg-white text-[#78350F] border border-white rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      />
                      <button
                        type="submit"
                        className="bg-[#F59E0B] text-[#78350F] px-3 py-1 rounded-lg text-xs font-black hover:bg-[#D97706] border border-[#78350F] cursor-pointer"
                      >
                        + Tambah
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 2: TITIK SUASANA (HOTSPOTS)
                ========================================================================= */}
            {adminTab === 'hotspots' && (
              <div className="space-y-6">
                {/* Scene Image Configuration */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#B45309]" />
                    Gambar Latar Suasana Sekolah (Scene Background Image)
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.sceneImageUrl}
                      onChange={(e) => updateSettings({ sceneImageUrl: e.target.value })}
                      placeholder="https://i.postimg.cc/257sSw2J/1.png"
                      className="flex-1 border-2 border-[#78350F] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#78350F]"
                    />
                    <button
                      onClick={() =>
                        updateSettings({ sceneImageUrl: 'https://i.postimg.cc/257sSw2J/1.png' })
                      }
                      className="px-3 py-2 bg-[#FEF3C7] text-[#78350F] font-black text-xs rounded-xl border border-[#F59E0B] hover:bg-[#FDE68A]"
                    >
                      Asal (Default)
                    </button>
                  </div>
                </div>

                {/* Hotspots List Manager */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#78350F] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Senarai Titik Suasana ({settings.hotspots.length} Titik)
                    </span>
                    <button
                      onClick={() => {
                        addHotspotPoint({ x: 50, y: 50 });
                        sound.playPop();
                      }}
                      className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs rounded-xl border border-[#065F46] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Titik Suasana
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.hotspots.map((point, index) => (
                      <div
                        key={point.id}
                        className="bg-white rounded-2xl border-3 border-[#78350F] p-4 shadow-[4px_4px_0px_#FDE68A] space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#FDE68A] pb-2">
                          <span className="font-black text-xs text-[#78350F] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#78350F] text-[10px] font-black flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span>{point.title}</span>
                          </span>
                          <button
                            onClick={() => removeHotspotPoint(point.id)}
                            className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-black text-[#78350F] uppercase">
                              Kata Kerja (Action Word):
                            </label>
                            <input
                              type="text"
                              value={point.actionWord || ''}
                              onChange={(e) =>
                                updateHotspotPoint(point.id, { actionWord: e.target.value })
                              }
                              placeholder="Contoh: Mengecat"
                              className="w-full border border-[#78350F] rounded-lg px-2 py-1 text-xs font-bold text-[#78350F] bg-[#FEF3C7]/40"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-[#78350F] uppercase">
                              Tajuk Aktiviti:
                            </label>
                            <input
                              type="text"
                              value={point.title}
                              onChange={(e) =>
                                updateHotspotPoint(point.id, { title: e.target.value })
                              }
                              className="w-full border border-[#78350F] rounded-lg px-2 py-1 text-xs font-bold text-[#78350F]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-[#78350F] uppercase">
                              Pautan Gambar Lapisan Transparent:
                            </label>
                            <input
                              type="text"
                              value={point.imageUrl || ''}
                              onChange={(e) =>
                                updateHotspotPoint(point.id, { imageUrl: e.target.value })
                              }
                              placeholder={DEFAULT_OVERLAY_IMAGE}
                              className="w-full border border-[#78350F] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#78350F]"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-black text-[#78350F]">
                                Kedudukan X: {point.x}%
                              </label>
                              <input
                                type="range"
                                min={5}
                                max={95}
                                value={point.x}
                                onChange={(e) =>
                                  updateHotspotPoint(point.id, {
                                    x: parseInt(e.target.value, 10),
                                  })
                                }
                                className="w-full accent-[#F59E0B]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-[#78350F]">
                                Kedudukan Y: {point.y}%
                              </label>
                              <input
                                type="range"
                                min={5}
                                max={95}
                                value={point.y}
                                onChange={(e) =>
                                  updateHotspotPoint(point.id, {
                                    y: parseInt(e.target.value, 10),
                                  })
                                }
                                className="w-full accent-[#F59E0B]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-[#78350F]">
                                Lebar: {point.width || 20}%
                              </label>
                              <input
                                type="range"
                                min={10}
                                max={60}
                                value={point.width || 20}
                                onChange={(e) =>
                                  updateHotspotPoint(point.id, {
                                    width: parseInt(e.target.value, 10),
                                  })
                                }
                                className="w-full accent-[#F59E0B]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: SYSTEM TOGGLES & FLOW CONTROLS
                ========================================================================= */}
            {adminTab === 'toggles' && (
              <div className="space-y-6">
                {/* 1. Gameplay & Flow Toggles */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2 border-b border-[#FDE68A] pb-2">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    Aliran Permainan & Susun Gambar (Game Flow)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Rawakkan Susunan Gambar Awal
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Gambar akan dirombak secara rawak semasa permainan bermula.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.shufflePieces}
                        onChange={(e) => updateSettings({ shufflePieces: e.target.checked })}
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Mod Cabaran Isi Tempat Kosong
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Buka soalan tempat kosong selepas gambar selesai disusun.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableFillInBlanks}
                        onChange={(e) =>
                          updateSettings({ enableFillInBlanks: e.target.checked })
                        }
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Kesan Letupan Confetti 🎉
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Tembak confetti apabila pelajar berjaya menyusun atau menjawab.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableConfetti}
                        onChange={(e) => updateSettings({ enableConfetti: e.target.checked })}
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Audio & Speech (TTS) Toggles */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2 border-b border-[#FDE68A] pb-2">
                    <Volume2 className="w-4 h-4 text-[#F59E0B]" />
                    Audio, Kesan Bunyi & Suara Guru (TTS Voice)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Kesan Bunyi Utama (Master Sound)
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Aktifkan keseluruhan kesan bunyi sistem.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Bunyi Dengkung Lebah 🐝
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Bunyi dengkung lebah semasa klik atau aksi.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.beeBuzzEnabled}
                        onChange={(e) => updateSettings({ beeBuzzEnabled: e.target.checked })}
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Baca Ayat Secara Automatik Semasa Letak Gambar
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Sistem akan menyebut ayat apabila gambar masuk ke kotak betul.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableTTSOnPlacement}
                        onChange={(e) =>
                          updateSettings({ enableTTSOnPlacement: e.target.checked })
                        }
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Sebutan Suara Kata Kerja Titik Suasana
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Sebut kata kerja secara automatik semasa klik titik pada gambar.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.speakHotspotActionOnClick}
                        onChange={(e) =>
                          updateSettings({ speakHotspotActionOnClick: e.target.checked })
                        }
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Speech Rate Slider */}
                  <div className="p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] space-y-1">
                    <div className="flex justify-between items-center text-xs font-black text-[#78350F]">
                      <span>Kelajuan Sebutan Suara (TTS Speech Rate):</span>
                      <span className="bg-[#78350F] text-white px-2 py-0.5 rounded text-xs font-mono">
                        {settings.ttsRate.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.6}
                      max={1.4}
                      step={0.1}
                      value={settings.ttsRate}
                      onChange={(e) =>
                        updateSettings({ ttsRate: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#F59E0B]"
                    />
                  </div>
                </div>

                {/* 3. Visual & Background Toggles */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2 border-b border-[#FDE68A] pb-2">
                    <Layers className="w-4 h-4 text-[#F59E0B]" />
                    Visual, Maskot & Corak Latar Belakang
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Papar Maskot Lebah Comel 🐝
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Tunjukkan animasi lebah di muka depan dan semasa permainan.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showMascot}
                        onChange={(e) => updateSettings({ showMascot: e.target.checked })}
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Corak Geometri Honeycomb di Latar Belakang
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Garis grid heksagon sarang lebah yang elegan.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showHoneycombGrid}
                        onChange={(e) =>
                          updateSettings({ showHoneycombGrid: e.target.checked })
                        }
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Heksagon Terapung (Floating Hexagons)
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Animasi heksagon terapung lembut di penjuru skrin.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showFloatingHexagons}
                        onChange={(e) =>
                          updateSettings({ showFloatingHexagons: e.target.checked })
                        }
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#F59E0B] cursor-pointer">
                      <div>
                        <span className="font-black text-xs text-[#78350F] block">
                          Lencana Kata Kerja Terapung (Action Badges)
                        </span>
                        <span className="text-[11px] text-[#B45309]">
                          Papar badge kata kerja timbul selepas titik diklik.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showHotspotActionBadges}
                        onChange={(e) =>
                          updateSettings({ showHotspotActionBadges: e.target.checked })
                        }
                        className="w-5 h-5 accent-[#78350F] rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: APP INFO & GUIDE TEXTS
                ========================================================================= */}
            {adminTab === 'info' && (
              <div className="space-y-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2 border-b border-[#FDE68A] pb-2">
                    <Info className="w-4 h-4 text-[#F59E0B]" />
                    Tajuk & Maklumat Modul Aplikasi
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-[#78350F] mb-1">
                        Nama Aplikasi (App Name):
                      </label>
                      <input
                        type="text"
                        value={settings.appName}
                        onChange={(e) => updateSettings({ appName: e.target.value })}
                        className="w-full border-2 border-[#78350F] rounded-xl px-3 py-2 text-sm font-black text-[#78350F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#78350F] mb-1">
                        Lencana Modul (Badge e.g. Bahagian D):
                      </label>
                      <input
                        type="text"
                        value={settings.moduleBadge}
                        onChange={(e) => updateSettings({ moduleBadge: e.target.value })}
                        className="w-full border-2 border-[#78350F] rounded-xl px-3 py-2 text-sm font-black text-[#78350F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] mb-1">
                      Pautan Gambar Besar Muka Depan (Scene Image URL):
                    </label>
                    <input
                      type="text"
                      value={settings.sceneImageUrl}
                      onChange={(e) => updateSettings({ sceneImageUrl: e.target.value })}
                      className="w-full border-2 border-[#78350F] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] mb-1">
                      Penerangan / Subtajuk (Subtitle):
                    </label>
                    <textarea
                      rows={2}
                      value={settings.appSubtitle}
                      onChange={(e) => updateSettings({ appSubtitle: e.target.value })}
                      className="w-full border-2 border-[#78350F] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] mb-1">
                      Ucapan Maskot Lebah (Greeting):
                    </label>
                    <input
                      type="text"
                      value={settings.mascotGreeting}
                      onChange={(e) => updateSettings({ mascotGreeting: e.target.value })}
                      className="w-full border-2 border-[#78350F] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#78350F]"
                    />
                  </div>
                </div>

                {/* 3 Step Guides */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2 border-b border-[#FDE68A] pb-2">
                    <HelpCircle className="w-4 h-4 text-[#F59E0B]" />
                    Teks Panduan 3 Langkah Murid
                  </h3>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] mb-1">
                      Langkah 1:
                    </label>
                    <input
                      type="text"
                      value={settings.guideStep1}
                      onChange={(e) => updateSettings({ guideStep1: e.target.value })}
                      className="w-full border-2 border-[#78350F] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] mb-1">
                      Langkah 2:
                    </label>
                    <input
                      type="text"
                      value={settings.guideStep2}
                      onChange={(e) => updateSettings({ guideStep2: e.target.value })}
                      className="w-full border-2 border-[#78350F] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] mb-1">
                      Langkah 3:
                    </label>
                    <input
                      type="text"
                      value={settings.guideStep3}
                      onChange={(e) => updateSettings({ guideStep3: e.target.value })}
                      className="w-full border-2 border-[#78350F] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-[#78350F]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 5: SAVE, EXPORT, IMPORT & RESET
                ========================================================================= */}
            {adminTab === 'data' && (
              <div className="space-y-6">
                {/* Live Screen Switcher */}
                <div className="bg-[#FEF3C7] p-4 rounded-2xl border-2 border-[#F59E0B] space-y-2">
                  <span className="font-black text-xs text-[#78350F] block">
                    Peralihan Skrin Pantas (Test Live Screens):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setCurrentScreen('hotspots');
                        setIsAdminOpen(false);
                        sound.playPop();
                      }}
                      className="px-3 py-1.5 bg-white text-[#78350F] rounded-xl border border-[#78350F] text-xs font-black hover:bg-[#FDE68A] cursor-pointer"
                    >
                      Pergi ke Gambar Besar Muka Depan
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScreen('verbs');
                        setIsAdminOpen(false);
                        sound.playPop();
                      }}
                      className="px-3 py-1.5 bg-white text-[#78350F] rounded-xl border border-[#78350F] text-xs font-black hover:bg-[#FDE68A] cursor-pointer"
                    >
                      Pergi ke Modul Kata Kerja
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScreen('puzzle');
                        setIsAdminOpen(false);
                        sound.playPop();
                      }}
                      className="px-3 py-1.5 bg-white text-[#78350F] rounded-xl border border-[#78350F] text-xs font-black hover:bg-[#FDE68A] cursor-pointer"
                    >
                      Pergi ke Susun Kotak ({activeBoxScreen.title})
                    </button>
                  </div>
                </div>

                {/* Export / Backup JSON */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2">
                        <Download className="w-4 h-4 text-[#F59E0B]" />
                        Eksport / Sandaran Konfigurasi (JSON)
                      </h3>
                      <p className="text-xs text-[#B45309] font-bold">
                        Salin kod konfigurasi ini untuk disimpan atau dipindahkan ke peranti lain.
                      </p>
                    </div>

                    <button
                      onClick={handleCopyExport}
                      className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] font-black text-xs sm:text-sm rounded-xl border-2 border-[#78350F] shadow-[2px_2px_0px_#78350F] flex items-center gap-1.5 cursor-pointer"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#065F46]" />
                          <span>Berjaya Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin ke Papan Klip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Import JSON */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-[#78350F] shadow-sm space-y-3">
                  <h3 className="font-black text-sm text-[#78350F] uppercase flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#F59E0B]" />
                    Import Konfigurasi (JSON)
                  </h3>
                  <textarea
                    rows={4}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Tampal teks konfigurasi JSON di sini..."
                    className="w-full border-2 border-[#78350F] rounded-xl p-3 text-xs font-mono text-[#78350F] bg-[#FFFBEB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />

                  {jsonError && (
                    <p className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-300 p-2 rounded-lg">
                      {jsonError}
                    </p>
                  )}

                  <button
                    onClick={handleApplyImport}
                    className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs sm:text-sm rounded-xl border-2 border-[#065F46] shadow-[2px_2px_0px_#065F46] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Gunakan Konfigurasi Ini</span>
                  </button>
                </div>

                {/* Factory Reset */}
                <div className="bg-rose-50 p-4 sm:p-5 rounded-2xl border-2 border-rose-300 space-y-3">
                  <h3 className="font-black text-sm text-rose-700 uppercase flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    Tetapkan Semula ke Pilihan Asal (Factory Reset)
                  </h3>
                  <p className="text-xs font-bold text-rose-600">
                    Tindakan ini akan memulihkan semua paparan kotak, gambar, dan tetapan ke tetapan asal kilang.
                  </p>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Adakah anda pasti mahu menetapkan semula semua data ke tetapan asal?'
                        )
                      ) {
                        resetSettings();
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl border border-rose-800 shadow-[2px_2px_0px_#881337] cursor-pointer"
                  >
                    Set Semula ke Pilihan Asal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save & Close Bar */}
          <div className="h-14 bg-[#FEF3C7] border-t-2 border-[#F59E0B] px-4 sm:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-[#78350F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <span>Semua perubahan disimpan secara automatik dalam pelayar ini.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playPop();
                  setIsAdminOpen(false);
                }}
                className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] font-black text-xs sm:text-sm rounded-xl border-2 border-[#78350F] shadow-[2px_2px_0px_#78350F] cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
