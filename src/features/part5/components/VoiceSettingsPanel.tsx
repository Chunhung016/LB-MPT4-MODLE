import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  Check,
  User,
  Gauge,
  Music,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useApp } from '../context/AppContext';

interface VoiceSettingsPanelProps {
  onClose?: () => void;
  compact?: boolean;
}

export const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  onClose,
  compact = false,
}) => {
  const { settings, updateSettings } = useApp();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [testText, setTestText] = useState('Hospital');
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'english'>('english');

  // Load available voices
  useEffect(() => {
    const fetchVoices = () => {
      const available = sound.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
      }
    };

    fetchVoices();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleVoiceChange = (voiceURI: string) => {
    updateSettings({ ttsVoiceURI: voiceURI });
    sound.setVoicePreferences({ voiceURI });
    sound.playPop();

    // Play short immediate preview of selected voice
    testVoice(voiceURI, settings.ttsRate, settings.ttsPitch, 'Hello');
  };

  const handleRateChange = (rate: number) => {
    updateSettings({ ttsRate: rate });
    sound.setVoicePreferences({ rate });
  };

  const handlePitchChange = (pitch: number) => {
    updateSettings({ ttsPitch: pitch });
    sound.setVoicePreferences({ pitch });
  };

  const testVoice = (
    voiceURI?: string,
    rate?: number,
    pitch?: number,
    textToSpeak?: string
  ) => {
    const text = textToSpeak || testText || 'Welcome to Spelling Bee practice!';
    setIsPlayingSample(true);

    sound.speakText(text, {
      voiceURI: voiceURI !== undefined ? voiceURI : settings.ttsVoiceURI,
      rate: rate !== undefined ? rate : settings.ttsRate,
      pitch: pitch !== undefined ? pitch : settings.ttsPitch,
      onEnd: () => setIsPlayingSample(false),
    });

    // Fallback timer in case onEnd does not trigger
    setTimeout(() => {
      setIsPlayingSample(false);
    }, 3500);
  };

  const handleResetDefaults = () => {
    sound.playPop();
    updateSettings({
      ttsVoiceURI: '',
      ttsRate: 0.9,
      ttsPitch: 1.05,
      ttsLang: 'en-US',
    });
    sound.setVoicePreferences({
      voiceURI: '',
      rate: 0.9,
      pitch: 1.05,
      lang: 'en-US',
    });
  };

  // Filter voices by selected tab
  const filteredVoices = voices.filter((v) => {
    if (voiceFilter === 'english') {
      return (
        v.lang.toLowerCase().startsWith('en') ||
        v.name.toLowerCase().includes('english')
      );
    }
    return true;
  });

  const getFlagOrTag = (lang: string) => {
    const l = lang.toLowerCase().replace('_', '-');
    if (l.includes('en-us')) return '🇺🇸 US';
    if (l.includes('en-gb') || l.includes('en-uk')) return '🇬🇧 UK';
    if (l.includes('en-au')) return '🇦🇺 AU';
    if (l.includes('en-ca')) return '🇨🇦 CA';
    if (l.includes('en-in')) return '🇮🇳 IN';
    if (l.includes('en-ie')) return '🇮🇪 IE';
    if (l.includes('en-nz')) return '🇳🇿 NZ';
    if (l.includes('en-za')) return '🇿🇦 ZA';
    if (l.startsWith('en')) return '🌐 English';
    return `🌐 ${lang}`;
  };

  // Find currently active voice name
  const currentVoiceObj = voices.find(
    (v) => v.voiceURI === settings.ttsVoiceURI || v.name === settings.ttsVoiceURI
  ) || sound.findVoice(settings.ttsVoiceURI, settings.ttsLang);

  return (
    <div className={`space-y-5 text-[#78350F] ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Overview Banner */}
      <div className="bg-[#FFFBEB] p-3.5 sm:p-4 rounded-2xl border-2 border-[#FDE68A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-[#78350F] flex items-center justify-center shadow-xs shrink-0">
            <Volume2 className="w-5 h-5 text-[#78350F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm uppercase">Active Voice:</span>
              <span className="px-2 py-0.5 bg-amber-200/80 rounded-md font-bold text-xs text-[#78350F] border border-amber-300">
                {currentVoiceObj ? currentVoiceObj.name : 'System Auto (English)'}
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#B45309] mt-0.5">
              Speed: {settings.ttsRate || 0.9}x • Pitch: {settings.ttsPitch || 1.05}x •{' '}
              {currentVoiceObj ? getFlagOrTag(currentVoiceObj.lang) : 'Auto'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => testVoice()}
          disabled={isPlayingSample}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 border-2 border-[#78350F] rounded-xl font-black text-xs text-[#78350F] flex items-center gap-1.5 shadow-[2px_2px_0px_#78350F] cursor-pointer transition-all active:scale-95 shrink-0"
          title="Test current read aloud settings"
        >
          <Play className={`w-3.5 h-3.5 fill-[#78350F] ${isPlayingSample ? 'animate-spin' : ''}`} />
          <span>{isPlayingSample ? 'Speaking...' : 'Test Voice 🔊'}</span>
        </button>
      </div>

      {/* 1. VOICE PICKER SELECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="block text-xs font-black uppercase tracking-wider text-[#78350F] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-700" />
            <span>Select Text-to-Speech Voice</span>
          </label>

          <div className="flex items-center gap-1 bg-amber-100 p-0.5 rounded-lg border border-amber-300 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setVoiceFilter('english')}
              className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                voiceFilter === 'english'
                  ? 'bg-[#F59E0B] text-white font-black shadow-xs'
                  : 'text-[#78350F] hover:bg-amber-200'
              }`}
            >
              English Only
            </button>
            <button
              type="button"
              onClick={() => setVoiceFilter('all')}
              className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                voiceFilter === 'all'
                  ? 'bg-[#F59E0B] text-white font-black shadow-xs'
                  : 'text-[#78350F] hover:bg-amber-200'
              }`}
            >
              All Voices ({voices.length})
            </button>
          </div>
        </div>

        {/* Voice Dropdown */}
        <div className="relative">
          <select
            value={settings.ttsVoiceURI || ''}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-xs sm:text-sm text-[#78350F] focus:ring-2 focus:ring-amber-400 focus:outline-hidden cursor-pointer shadow-2xs"
          >
            <option value="">
              ✨ System Default (Auto-detect clearest English Voice)
            </option>
            {filteredVoices.map((voice) => (
              <option key={voice.voiceURI || voice.name} value={voice.voiceURI || voice.name}>
                {getFlagOrTag(voice.lang)} - {voice.name} {voice.localService ? '(Device)' : '(Online)'}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Voice Cards / Grid of Top Recommended Voices */}
        {filteredVoices.length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] font-extrabold text-[#B45309] block mb-1.5">
              Quick Voice Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleVoiceChange('')}
                className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                  !settings.ttsVoiceURI
                    ? 'bg-[#F59E0B] text-white border-[#78350F] shadow-xs'
                    : 'bg-white text-[#78350F] border-amber-200 hover:border-[#78350F]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px] truncate">✨ Auto English</span>
                  {!settings.ttsVoiceURI && <Check className="w-3.5 h-3.5 shrink-0" />}
                </div>
                <span className={`text-[10px] ${!settings.ttsVoiceURI ? 'text-amber-100' : 'text-slate-500'}`}>
                  Smart System Selection
                </span>
              </button>

              {filteredVoices.slice(0, 8).map((v) => {
                const isSelected =
                  settings.ttsVoiceURI === v.voiceURI || settings.ttsVoiceURI === v.name;
                return (
                  <button
                    key={`quick-${v.voiceURI || v.name}`}
                    type="button"
                    onClick={() => handleVoiceChange(v.voiceURI || v.name)}
                    className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-[#F59E0B] text-white border-[#78350F] shadow-xs'
                        : 'bg-white text-[#78350F] border-amber-200 hover:border-[#78350F]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[11px] truncate">{v.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                    <span className={`text-[10px] ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                      {getFlagOrTag(v.lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. SPEED & PITCH CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Speed / Rate Slider & Presets */}
        <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border-2 border-[#FDE68A] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-[#78350F] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-700" />
              <span>Voice Speed (Rate)</span>
            </label>
            <span className="text-xs font-black bg-white px-2 py-0.5 rounded-md border border-amber-300">
              {settings.ttsRate || 0.9}x
            </span>
          </div>

          <input
            type="range"
            min="0.6"
            max="1.3"
            step="0.05"
            value={settings.ttsRate ?? 0.9}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="w-full accent-[#F59E0B] cursor-pointer"
          />

          <div className="flex items-center justify-between gap-1">
            {[
              { label: '0.7x Slow', val: 0.7 },
              { label: '0.85x Learner', val: 0.85 },
              { label: '0.9x Phonics', val: 0.9 },
              { label: '1.0x Normal', val: 1.0 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => {
                  handleRateChange(p.val);
                  sound.playPop();
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                  settings.ttsRate === p.val
                    ? 'bg-[#F59E0B] text-white border-[#78350F]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Slider & Presets */}
        <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border-2 border-[#FDE68A] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-[#78350F] flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-700" />
              <span>Voice Tone (Pitch)</span>
            </label>
            <span className="text-xs font-black bg-white px-2 py-0.5 rounded-md border border-amber-300">
              {settings.ttsPitch || 1.05}x
            </span>
          </div>

          <input
            type="range"
            min="0.75"
            max="1.35"
            step="0.05"
            value={settings.ttsPitch ?? 1.05}
            onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
            className="w-full accent-[#F59E0B] cursor-pointer"
          />

          <div className="flex items-center justify-between gap-1">
            {[
              { label: '0.85x Deeper', val: 0.85 },
              { label: '1.0x Normal', val: 1.0 },
              { label: '1.05x Friendly', val: 1.05 },
              { label: '1.2x Bright', val: 1.2 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => {
                  handlePitchChange(p.val);
                  sound.playPop();
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                  settings.ttsPitch === p.val
                    ? 'bg-[#F59E0B] text-white border-[#78350F]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TEST PHRASE & PREVIEW BAR */}
      <div className="bg-white p-3.5 rounded-2xl border-2 border-[#78350F] space-y-2 shadow-xs">
        <label className="block text-[11px] font-black uppercase text-[#78350F]">
          Test Pronunciation with Custom Word / Sentence:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type any word to test (e.g. Delicious, Hospital)..."
            className="flex-1 px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F]/40 focus:border-[#78350F] rounded-xl text-xs font-bold text-[#78350F]"
          />

          <button
            type="button"
            onClick={() => testVoice(undefined, undefined, undefined, testText)}
            disabled={isPlayingSample}
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] hover:text-white font-black text-xs rounded-xl border-2 border-[#78350F] flex items-center gap-1.5 shadow-[2px_2px_0px_#78350F] cursor-pointer transition-all shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Speak Now</span>
          </button>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-amber-200">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#78350F] font-black text-xs rounded-xl border border-[#78350F]/40 flex items-center gap-1.5 cursor-pointer"
          title="Reset read-aloud voice settings to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Voice to Defaults</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#F59E0B] text-[#78350F] font-black text-xs rounded-xl border-2 border-[#78350F] shadow-xs cursor-pointer"
          >
            Save & Done
          </button>
        )}
      </div>
    </div>
  );
};
