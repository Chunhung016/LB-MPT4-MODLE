import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export interface FairyDustAnimationProps {
  startPos: { x: number; y: number } | null;
  targetPos: { x: number; y: number } | null;
  getTargetPos?: () => { x: number; y: number } | null;
  onComplete: () => void;
}

interface MagicMote {
  tOffset: number;
  speed: number;
  size: number;
  color: string;
  swirlFreq: number;
  swirlAmp: number;
  swirlPhase: number;
  driftX: number;
  driftY: number;
  spinSpeed: number;
  twinkleFreq: number;
  shape: 'star4' | 'star5' | 'sparkle' | 'diamond' | 'orb';
}

interface ArrivalBurstParticle {
  angle: number;
  speed: number;
  size: number;
  color: string;
  shape: 'star4' | 'star5' | 'sparkle' | 'diamond' | 'orb';
  spin: number;
}

export const FairyDustEffect: React.FC<FairyDustAnimationProps> = ({
  startPos,
  targetPos,
  getTargetPos,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beeContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!startPos || !targetPos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use standard 1x viewport scaling for zero lag and minimal GPU memory
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Vibrant luminous fairy stardust colors
    const colors = [
      '#FFFFFF',
      '#FEF08A',
      '#FDE047',
      '#F59E0B',
      '#FBBF24',
      '#38BDF8',
      '#F472B6',
      '#34D399',
      '#FB923C',
    ];

    const shapes: ('star4' | 'star5' | 'sparkle' | 'diamond' | 'orb')[] = [
      'star4',
      'star5',
      'sparkle',
      'diamond',
      'orb',
    ];

    // 45 well-distributed motes with silky organic flow and zero overhead
    const moteCount = 45;
    const motes: MagicMote[] = Array.from({ length: moteCount }, (_, i) => {
      const col = colors[i % colors.length];
      const isLinger = i > 32;

      return {
        tOffset: (i / moteCount) * (isLinger ? 0.95 : 0.75) + (Math.random() - 0.5) * 0.06,
        speed: isLinger ? 0.82 + Math.random() * 0.18 : 0.94 + Math.random() * 0.15,
        size: isLinger ? 6 + Math.random() * 8 : 8 + Math.random() * 12,
        color: col,
        swirlFreq: (i % 2 === 0 ? 1 : -1) * (2.2 + Math.random() * 2.5),
        swirlAmp: 14 + Math.random() * 22,
        swirlPhase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 35,
        driftY: (Math.random() - 0.5) * 35,
        spinSpeed: (Math.random() - 0.5) * 450,
        twinkleFreq: 14 + Math.random() * 16,
        shape: shapes[i % shapes.length],
      };
    });

    // 20 energetic arrival burst particles
    const burstCount = 20;
    const burstParticles: ArrivalBurstParticle[] = Array.from({ length: burstCount }, (_, i) => {
      return {
        angle: (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2,
        speed: 45 + Math.random() * 95,
        size: 8 + Math.random() * 14,
        color: colors[i % colors.length],
        shape: shapes[i % shapes.length],
        spin: (Math.random() - 0.5) * 600,
      };
    });

    let liveTgt = targetPos;
    let animFrame: number;
    const startTime = performance.now();
    const duration = 1500; // 1.5s total animation

    // 30 FPS frame throttling governor (33.3ms per frame)
    const TARGET_FPS = 30;
    const frameInterval = 1000 / TARGET_FPS;
    let lastRenderTime = 0;

    // Smooth quadratic ease for fluid motion
    const smoothEase = (t: number) => {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };

    const getBezier = (rawT: number, currentTarget: { x: number; y: number }) => {
      const t = Math.max(0, Math.min(1, rawT));
      const dx = currentTarget.x - startPos.x;
      const dy = currentTarget.y - startPos.y;

      const cp1 = {
        x: startPos.x + dx * 0.22 - (dy > 0 ? 80 : -80),
        y: startPos.y + dy * 0.38 - 70,
      };
      const cp2 = {
        x: startPos.x + dx * 0.78 + (dy > 0 ? 70 : -70),
        y: currentTarget.y + (dy > 0 ? -55 : 55),
      };

      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * startPos.x + 3 * uu * t * cp1.x + 3 * u * tt * cp2.x + ttt * currentTarget.x;
      const y = uuu * startPos.y + 3 * uu * t * cp1.y + 3 * u * tt * cp2.y + ttt * currentTarget.y;
      return { x, y };
    };

    // Fast, lightweight geometry renderers (no expensive shadowBlur)
    const drawStar4 = (context: CanvasRenderingContext2D, size: number) => {
      const s = size * 0.5;
      const inner = s * 0.25;
      context.beginPath();
      context.moveTo(0, -s);
      context.lineTo(inner, -inner);
      context.lineTo(s, 0);
      context.lineTo(inner, inner);
      context.lineTo(0, s);
      context.lineTo(-inner, inner);
      context.lineTo(-s, 0);
      context.lineTo(-inner, -inner);
      context.closePath();
      context.fill();
    };

    const drawStar5 = (context: CanvasRenderingContext2D, size: number) => {
      const s = size * 0.5;
      const inner = s * 0.4;
      context.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        if (i === 0) context.moveTo(Math.cos(outerAngle) * s, Math.sin(outerAngle) * s);
        else context.lineTo(Math.cos(outerAngle) * s, Math.sin(outerAngle) * s);
        context.lineTo(Math.cos(innerAngle) * inner, Math.sin(innerAngle) * inner);
      }
      context.closePath();
      context.fill();
    };

    const drawSparkle = (context: CanvasRenderingContext2D, size: number) => {
      const s = size * 0.5;
      context.beginPath();
      context.moveTo(0, -s);
      context.quadraticCurveTo(0, 0, s, 0);
      context.quadraticCurveTo(0, 0, 0, s);
      context.quadraticCurveTo(0, 0, -s, 0);
      context.quadraticCurveTo(0, 0, 0, -s);
      context.closePath();
      context.fill();
    };

    const drawDiamond = (context: CanvasRenderingContext2D, size: number) => {
      const s = size * 0.45;
      context.beginPath();
      context.moveTo(0, -s);
      context.lineTo(s, 0);
      context.lineTo(0, s);
      context.lineTo(-s, 0);
      context.closePath();
      context.fill();
    };

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progressLinear = Math.min(1, elapsed / duration);

      // Enforce locked 30 FPS interval to eliminate CPU lag and battery drain
      if (now - lastRenderTime < frameInterval && progressLinear < 1) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = now;

      const easedProgress = smoothEase(progressLinear);

      // Track target coordinate dynamically
      if (getTargetPos) {
        const live = getTargetPos();
        if (live) liveTgt = live;
      }
      const activeTgt = liveTgt || targetPos;

      ctx.clearRect(0, 0, width, height);

      // 1. Lightweight ribbon trail along path
      if (easedProgress > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const trailSegments = 24;
        const startT = Math.max(0, easedProgress - 0.35);
        const endT = easedProgress;

        ctx.beginPath();
        for (let i = 0; i <= trailSegments; i++) {
          const stepT = startT + ((endT - startT) * i) / trailSegments;
          const pos = getBezier(stepT, activeTgt);
          if (i === 0) ctx.moveTo(pos.x, pos.y);
          else ctx.lineTo(pos.x, pos.y);
        }

        // Inner glowing core line
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Ambient glow line
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.stroke();
        ctx.restore();
      }

      // 2. Render sparkling motes with additive light blending
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (const mote of motes) {
        const particleTime = easedProgress * mote.speed - mote.tOffset;
        if (particleTime <= 0 || particleTime >= 1) continue;

        const basePos = getBezier(particleTime, activeTgt);
        const swirlAngle = particleTime * Math.PI * mote.swirlFreq + mote.swirlPhase;
        const x =
          basePos.x +
          Math.sin(swirlAngle) * mote.swirlAmp +
          mote.driftX * Math.sin(particleTime * Math.PI);
        const y =
          basePos.y +
          Math.cos(swirlAngle) * (mote.swirlAmp * 0.7) +
          mote.driftY * Math.sin(particleTime * Math.PI);

        const envelope = Math.sin(particleTime * Math.PI);
        const twinkle = 0.7 + 0.3 * Math.sin(particleTime * mote.twinkleFreq);
        const alpha = Math.min(1, envelope * 1.3) * twinkle;
        const currentSize = mote.size * envelope;

        if (alpha <= 0 || currentSize <= 0) continue;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((mote.spinSpeed * particleTime * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = mote.color;

        if (mote.shape === 'star4') {
          drawStar4(ctx, currentSize);
        } else if (mote.shape === 'star5') {
          drawStar5(ctx, currentSize);
        } else if (mote.shape === 'sparkle') {
          drawSparkle(ctx, currentSize);
        } else if (mote.shape === 'diamond') {
          drawDiamond(ctx, currentSize);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, currentSize * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
      ctx.restore();

      // 3. Leading Bee position via hardware translate3d
      if (beeContainerRef.current) {
        if (progressLinear < 0.98) {
          beeContainerRef.current.style.display = 'block';
          const lead = getBezier(easedProgress, activeTgt);
          const next = getBezier(Math.min(1, easedProgress + 0.02), activeTgt);
          const angle = (Math.atan2(next.y - lead.y, next.x - lead.x) * 180) / Math.PI;
          const tilt = Math.max(-25, Math.min(25, angle * 0.35));

          beeContainerRef.current.style.transform = `translate3d(${lead.x}px, ${lead.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
        } else {
          beeContainerRef.current.style.display = 'none';
        }
      }

      // 4. Arrival Sparkle Burst over target word
      if (easedProgress >= 0.72) {
        const burstProgress = Math.min(1, (easedProgress - 0.72) / 0.28);
        const shockAlpha = (1 - burstProgress) * 0.95;
        const shockRadius = 12 + burstProgress * 55;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(activeTgt.x, activeTgt.y);

        // Concentric shockwave rings
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2.5 * (1 - burstProgress);
        ctx.globalAlpha = shockAlpha;
        ctx.beginPath();
        ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Radial burst stars
        for (const pt of burstParticles) {
          const dist = pt.speed * burstProgress;
          const px = Math.cos(pt.angle) * dist;
          const py = Math.sin(pt.angle) * dist + burstProgress * burstProgress * 15;
          const pAlpha = (1 - burstProgress) * 0.95;
          const pSize = pt.size * (1 - burstProgress * 0.4);

          if (pAlpha <= 0 || pSize <= 0) continue;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate((pt.spin * burstProgress * Math.PI) / 180);
          ctx.globalAlpha = pAlpha;
          ctx.fillStyle = pt.color;

          if (pt.shape === 'star4') {
            drawStar4(ctx, pSize);
          } else if (pt.shape === 'sparkle') {
            drawSparkle(ctx, pSize);
          } else if (pt.shape === 'diamond') {
            drawDiamond(ctx, pSize);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, pSize * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        ctx.restore();
      }

      if (progressLinear < 1) {
        animFrame = requestAnimationFrame(render);
      } else {
        onComplete();
      }
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [startPos, targetPos, getTargetPos, onComplete]);

  if (!startPos || !targetPos) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 1. Hardware-Accelerated 60-120FPS Canvas for Smooth Particle Physics & Additive Light */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* 2. Leading Fairy Bee with Aura (Positioned directly via GPU translate3d) */}
      <div
        ref={beeContainerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          display: 'none',
          willChange: 'transform',
        }}
        className="pointer-events-none"
      >
        {/* Outer Pulsing Golden Plasma Halos */}
        <div className="absolute -inset-12 bg-radial from-amber-400/70 via-yellow-300/30 to-transparent rounded-full blur-2xl animate-pulse" />
        <div className="absolute -inset-7 bg-radial from-white/90 via-amber-200/50 to-transparent rounded-full blur-lg" />

        {/* Rotating Golden Celestial Starburst */}
        <div className="absolute -inset-5 flex items-center justify-center animate-spin pointer-events-none opacity-85">
          <svg viewBox="0 0 100 100" className="w-18 h-18 fill-amber-300 drop-shadow-[0_0_12px_#F59E0B]">
            <polygon points="50,5 55,40 90,45 60,60 70,95 50,70 30,95 40,60 10,45 45,40" />
          </svg>
        </div>

        {/* Floating Bee Avatar with Dynamic Flight Aura & Fairy Sparkles */}
        <div className="relative bg-white/95 p-2.5 rounded-full border-3 border-[#78350F] shadow-[0_0_25px_#F59E0B] flex items-center justify-center scale-115">
          <span className="text-2xl sm:text-3xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">🐝</span>

          {/* Orbiting Mini Sparkles */}
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin drop-shadow-[0_0_6px_#F59E0B]" />
          </div>
          <div className="absolute -bottom-1 -left-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse drop-shadow-[0_0_6px_#F59E0B]" />
          </div>
        </div>
      </div>
    </div>
  );
};


