import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  QrCode, 
  Lock
} from 'lucide-react';
import { RegisteredModule } from '../types';
import { playBubbleSound } from '../utils/audio';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isScannerEnabled: boolean;
  registeredModules: RegisteredModule[];
  onRegisterSuccess: (module: RegisteredModule) => void;
}

// Allowed QR codes mapping
export const KNOWN_MODULE_CODES: Record<string, { id: string; name: string; description: string }> = {
  'Lb_2026_MPT4_M1_': {
    id: 'mpt4_m1',
    name: 'Module 1',
    description: 'Little Bee Early Reading & Phonics Foundations @2026',
  },
  'Lb_2026_MPT4_M2_': {
    id: 'mpt4_m2',
    name: 'Module 2',
    description: 'Little Bee Numerical Adventures & Logic Thinking @2026',
  },
};

export default function QRScannerModal({
  isOpen,
  onClose,
  isScannerEnabled,
  registeredModules,
  onRegisterSuccess,
}: QRScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [successModule, setSuccessModule] = useState<RegisteredModule | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize camera when opened
  useEffect(() => {
    if (!isOpen || !isScannerEnabled) return;

    setSuccessModule(null);
    setErrorMessage(null);
    setIsScanning(true);
    setCameraError(null);

    let isMounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Camera API not accessible in this browser environment.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch(() => {
            // Autoplay catch
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Camera access restricted';
        setCameraError(msg);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, isScannerEnabled]);

  // Video scanning frame tick
  useEffect(() => {
    if (!isOpen || !isScanning || cameraError) return;

    function scanTick() {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvasRef.current = canvas;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qrCode && qrCode.data) {
            handleProcessScannedCode(qrCode.data.trim());
            return;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(scanTick);
    }

    animFrameRef.current = requestAnimationFrame(scanTick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, isScanning, cameraError, registeredModules]);

  const handleProcessScannedCode = (codeStr: string) => {
    // Check if code matches standard module prefixes or exact known codes
    let matchedKey: string | null = null;

    if (codeStr.startsWith('Lb_2026_MPT4_M1_')) {
      matchedKey = 'Lb_2026_MPT4_M1_';
    } else if (codeStr.startsWith('Lb_2026_MPT4_M2_')) {
      matchedKey = 'Lb_2026_MPT4_M2_';
    } else if (KNOWN_MODULE_CODES[codeStr]) {
      matchedKey = codeStr;
    }

    if (!matchedKey) {
      setErrorMessage(`Invalid QR code: "${codeStr.slice(0, 24)}...". Please scan a valid Little Bee MPT4 module card.`);
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const info = KNOWN_MODULE_CODES[matchedKey];

    // Check if already registered
    const already = registeredModules.some((m) => m.id === info.id || m.code === matchedKey);
    if (already) {
      setErrorMessage(`${info.name} is already registered on this device.`);
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    // Success registered!
    playBubbleSound();
    setIsScanning(false);
    const newModule: RegisteredModule = {
      id: info.id,
      code: matchedKey,
      name: info.name,
      description: info.description,
      registeredAt: Date.now(),
      enabled: true,
      totalLessons: 12,
    };

    setSuccessModule(newModule);
    onRegisterSuccess(newModule);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="qr-scanner-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <motion.div
        id="qr-scanner-modal"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-md bg-[#FFFBEB] border-4 border-[#FEF3C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative text-slate-800"
      >
        {/* Header */}
        <div className="bg-[#FEF3C7] px-6 py-4 flex items-center justify-between border-b border-[#FDE68A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FBBF24] flex items-center justify-center text-[#78350F] shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#78350F] font-['Fredoka',sans-serif] tracking-wide">
                QR CODE SCANNER
              </h2>
              <p className="text-[11px] text-amber-900/80 font-medium">
                Hold your Little Bee Module card in front of camera
              </p>
            </div>
          </div>

          <button
            id="close-qr-scanner-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-amber-100 text-slate-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center">
          {!isScannerEnabled ? (
            /* Locked state by Admin in Logic settings */
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-300 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-rose-950 font-['Fredoka',sans-serif]">
                QR SCANNER DISABLED
              </h3>
              <p className="text-xs text-rose-800/80 max-w-xs">
                QR registration has been disabled in Logic Settings. Press 'S' on your keyboard to unlock this feature.
              </p>
            </div>
          ) : successModule ? (
            /* Registration Success View */
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 text-center space-y-4 flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-4 border-white">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                  Registration Complete
                </span>
                <h3 className="text-2xl font-black text-emerald-950 font-['Fredoka',sans-serif] tracking-wide mt-1">
                  {successModule.name.toUpperCase()} REGISTERED SUCCESFULLY!
                </h3>
                <p className="text-xs text-emerald-800 max-w-sm">
                  {successModule.description}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  id="view-registered-modules-btn"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> View In Screen
                </button>
              </div>
            </motion.div>
          ) : (
            /* Live Camera / Scanner View */
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-slate-950 border-4 border-[#FBBF24] shadow-inner flex items-center justify-center">
                {cameraError ? (
                  <div className="p-4 text-center text-amber-200 text-xs space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-amber-400 opacity-60" />
                    <p className="font-semibold">{cameraError}</p>
                    <p className="text-[11px] text-slate-400">
                      Point a camera at your Little Bee QR card to scan.
                    </p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanner Target Box with Target Corner Graphics */}
                    <div className="absolute inset-8 pointer-events-none border-2 border-white/40 rounded-xl flex items-center justify-center">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#FBBF24] rounded-tl-md" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#FBBF24] rounded-tr-md" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#FBBF24] rounded-bl-md" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#FBBF24] rounded-br-md" />

                      {/* Laser scanning line */}
                      <motion.div
                        className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent shadow-[0_0_8px_#FBBF24]"
                        animate={{ y: [-60, 60, -60] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Error notification banner */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
