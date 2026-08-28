import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, LoaderCircle, QrCode, X } from 'lucide-react';

interface ActivationQrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onCode: (code: string) => void;
}

export default function ActivationQrScannerModal({ open, onClose, onCode }: ActivationQrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setError(null);
    setReady(false);

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 540 } },
        });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (cameraError) {
        setError(cameraError instanceof Error ? cameraError.message : 'Camera access is unavailable.');
      }
    };

    void start();
    return () => {
      mounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !ready || error) return;

    const scan = () => {
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current ?? document.createElement('canvas');
        canvasRef.current = canvas;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'attemptBoth' });
          const value = result?.data.trim();
          if (value?.startsWith('LB-ACT:BEE-')) {
            onCode(value.slice('LB-ACT:'.length));
            return;
          }
        }
      }
      animationRef.current = requestAnimationFrame(scan);
    };

    animationRef.current = requestAnimationFrame(scan);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [error, onCode, open, ready]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border-4 border-amber-200 bg-[#FFFBEB] shadow-2xl">
        <header className="flex items-center justify-between bg-amber-100 px-5 py-4">
          <div className="flex items-center gap-2 font-['Fredoka',sans-serif] text-lg font-black text-[#78350F]"><QrCode className="h-5 w-5" /> Scan parent activation QR</div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white hover:bg-amber-50" aria-label="Close QR scanner"><X className="h-4 w-4" /></button>
        </header>
        <div className="p-5">
          {error ? <div className="rounded-2xl bg-rose-50 p-5 text-center text-sm font-semibold text-rose-700">{error}<p className="mt-2 text-xs font-normal">You can type the BEE code in the dashboard instead.</p></div> : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              {!ready ? <div className="absolute inset-0 flex items-center justify-center text-white"><LoaderCircle className="h-8 w-8 animate-spin" /></div> : null}
              <div className="pointer-events-none absolute inset-10 rounded-2xl border-4 border-dashed border-amber-300" />
            </div>
          )}
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-slate-500"><Camera className="h-4 w-4" /> Hold the parent’s QR code inside the frame.</p>
        </div>
      </div>
    </div>
  );
}
