import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Orbit,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Move,
  X,
  Play,
  Pause,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PlanetInfo {
  id: 'P' | 'Q' | 'R' | 'S';
  nameZh: string;
  distanceMillionKm: number;
  color: string;
  radius: number;
  orbitIndex: number;
  realPlanet: string;
  orbitalPeriod: string;
}

const PLANETS: PlanetInfo[] = [
  { id: 'P', nameZh: '行星 P', distanceMillionKm: 58, color: '#94a3b8', radius: 14, orbitIndex: 0, realPlanet: '水星', orbitalPeriod: '88天' },
  { id: 'R', nameZh: '行星 R', distanceMillionKm: 150, color: '#0ea5e9', radius: 17, orbitIndex: 1, realPlanet: '地球', orbitalPeriod: '365天' },
  { id: 'Q', nameZh: '行星 Q', distanceMillionKm: 778, color: '#f97316', radius: 24, orbitIndex: 2, realPlanet: '木星', orbitalPeriod: '约12年' },
  { id: 'S', nameZh: '行星 S', distanceMillionKm: 4495, color: '#6366f1', radius: 20, orbitIndex: 3, realPlanet: '海王星', orbitalPeriod: '约165年' },
];

const ORBIT_RADII = [70, 115, 165, 225];
const ORBIT_SPEEDS = [5, 10, 20, 38];

interface SolarSystemRaceProps {
  onComplete?: (score: number) => void;
}

export const SolarSystemRace: React.FC<SolarSystemRaceProps> = ({ onComplete }) => {
  const [snappedOrbits, setSnappedOrbits] = useState<(string | null)[]>([null, null, null, null]);
  const [arrangedOrder, setArrangedOrder] = useState<(string | null)[]>([null, null, null, null]);

  // Zoom & Pan state for inline orbit canvas
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Full-screen enlargement modal state
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false);
  const [modalZoom, setModalZoom] = useState<number>(1.2);
  const [modalPan, setModalPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isModalDragging, setIsModalDragging] = useState<boolean>(false);
  const modalDragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const modalPanStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAnimationPaused, setIsAnimationPaused] = useState<boolean>(false);

  // Drag-and-drop planet dragging state
  const [draggedPlanetId, setDraggedPlanetId] = useState<string | null>(null);

  const [checkedOptions, setCheckedOptions] = useState<{ [key: string]: boolean }>({
    opt1: false,
    opt2: false,
    opt3: false,
    opt4: false,
  });

  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Inline Canvas Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan & pinch zoom handler
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / touchStartDistRef.current;
      const nextZoom = Math.min(Math.max(touchStartZoomRef.current * factor, 0.7), 3.0);
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.7), 3.0));
  };

  const handleZoomIn = () => {
    sounds.playPop();
    setZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    sounds.playPop();
    setZoom((prev) => Math.max(prev - 0.25, 0.7));
  };

  const handleResetView = () => {
    sounds.playPop();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Modal Pan Handlers
  const handleModalMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsModalDragging(true);
    modalDragStartRef.current = { x: e.clientX, y: e.clientY };
    modalPanStartRef.current = { ...modalPan };
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isModalDragging) return;
    const dx = e.clientX - modalDragStartRef.current.x;
    const dy = e.clientY - modalDragStartRef.current.y;
    setModalPan({
      x: modalPanStartRef.current.x + dx,
      y: modalPanStartRef.current.y + dy,
    });
  };

  const handleModalMouseUp = () => {
    setIsModalDragging(false);
  };

  const isRowHighlighted = (planet: 'X' | 'Y' | 'Z') => {
    if (hoveredOption === 'opt3' || checkedOptions.opt3) return planet === 'X' || planet === 'Z';
    if (hoveredOption === 'opt1' || checkedOptions.opt1) return planet === 'X';
    if (hoveredOption === 'opt2' || checkedOptions.opt2) return planet === 'Z';
    return false;
  };

  const handlePlacePlanet = (planet: PlanetInfo) => {
    sounds.playPop();
    const emptyIndex = arrangedOrder.findIndex((s) => s === null);
    if (emptyIndex !== -1 && !arrangedOrder.includes(planet.id)) {
      const nextArr = [...arrangedOrder];
      nextArr[emptyIndex] = planet.id;
      setArrangedOrder(nextArr);

      if (planet.orbitIndex === emptyIndex) {
        const nextOrbits = [...snappedOrbits];
        nextOrbits[emptyIndex] = planet.id;
        setSnappedOrbits(nextOrbits);
      }
    }
  };

  // Drag and Drop support onto specific slots
  const handleDropOnSlot = (slotIndex: number) => {
    if (!draggedPlanetId) return;
    sounds.playSnap();
    const planet = PLANETS.find((p) => p.id === draggedPlanetId);
    if (!planet) return;

    // Remove if already in another slot
    const nextArr = arrangedOrder.map((id, idx) => (id === draggedPlanetId && idx !== slotIndex ? null : id));
    nextArr[slotIndex] = planet.id;
    setArrangedOrder(nextArr);

    // Sync snapped orbit
    const nextOrbits = [...snappedOrbits];
    if (planet.orbitIndex === slotIndex) {
      nextOrbits[slotIndex] = planet.id;
    } else {
      nextOrbits[planet.orbitIndex] = null;
    }
    setSnappedOrbits(nextOrbits);
    setDraggedPlanetId(null);
  };

  const handleRemoveFromOrder = (index: number) => {
    const removedPlanet = arrangedOrder[index];
    const next = [...arrangedOrder];
    next[index] = null;
    setArrangedOrder(next);
    sounds.playPop();

    if (removedPlanet) {
      const nextOrbits = [...snappedOrbits];
      for (let i = 0; i < nextOrbits.length; i++) {
        if (nextOrbits[i] === removedPlanet) nextOrbits[i] = null;
      }
      setSnappedOrbits(nextOrbits);
    }
  };

  const toggleOption = (key: string) => {
    sounds.playPop();
    setCheckedOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isOrderCorrect = arrangedOrder[0] === 'P' && arrangedOrder[1] === 'R' && arrangedOrder[2] === 'Q' && arrangedOrder[3] === 'S';
  const isOptionsCorrect = checkedOptions.opt1 && !checkedOptions.opt2 && checkedOptions.opt3 && !checkedOptions.opt4;
  const allCompleted = isOrderCorrect && isOptionsCorrect;

  const handleValidate = () => {
    setShowResult(true);
    if (allCompleted) {
      sounds.playSuccess();
      onComplete?.(4);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    setSnappedOrbits([null, null, null, null]);
    setArrangedOrder([null, null, null, null]);
    setCheckedOptions({ opt1: false, opt2: false, opt3: false, opt4: false });
    setShowResult(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    sounds.playPop();
  };

  // Reusable SVG Solar System Diagram
  const renderSolarSystemSvg = (isModalView = false) => (
    <svg
      viewBox="0 0 520 520"
      className="w-full h-full select-none"
      style={{
        transform: `translate(${isModalView ? modalPan.x : pan.x}px, ${isModalView ? modalPan.y : pan.y}px) scale(${isModalView ? modalZoom : zoom})`,
        transformOrigin: '260px 260px',
        transition: isDragging || isModalDragging ? 'none' : 'transform 0.15s ease-out',
      }}
    >
      <defs>
        <radialGradient id="sun-core-kid" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Distant Stars */}
      <circle cx="90" cy="70" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="410" cy="80" r="2" fill="#fef08a" opacity="0.9" />
      <circle cx="440" cy="380" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="150" cy="440" r="2" fill="#bae6fd" opacity="0.9" />
      <circle cx="240" cy="180" r="1.5" fill="#ffffff" opacity="0.7" />
      <circle cx="310" cy="120" r="1.2" fill="#ffffff" opacity="0.6" />
      <circle cx="470" cy="220" r="1.8" fill="#fde047" opacity="0.8" />

      {/* Sun */}
      <circle cx="40" cy="260" r="60" fill="#ea580c" opacity="0.25" className="animate-pulse" filter="url(#glow)" />
      <circle cx="40" cy="260" r="32" fill="url(#sun-core-kid)" stroke="#ffffff" strokeWidth="2" />
      <text x="40" y="264" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="900" pointerEvents="none">
        太阳
      </text>

      {/* 4 Orbits */}
      {ORBIT_RADII.map((radius, idx) => {
        const isOccupied = snappedOrbits[idx] !== null;

        return (
          <g key={`orbit-${idx}`}>
            {/* Orbit Arc */}
            <path
              d={`M 40 ${260 - radius} A ${radius} ${radius} 0 0 1 40 ${260 + radius}`}
              fill="none"
              stroke={isOccupied ? '#38bdf8' : 'rgba(255,255,255,0.25)'}
              strokeWidth={isOccupied ? '2.5' : '1.5'}
              strokeDasharray={isOccupied ? 'none' : '4 4'}
            />

            {/* Orbit Distance Tag */}
            <rect
              x={40 + radius - 26}
              y="249"
              width="52"
              height="20"
              rx="10"
              fill="rgba(15, 23, 42, 0.9)"
              stroke={isOccupied ? '#38bdf8' : 'rgba(255,255,255,0.3)'}
              strokeWidth="1.2"
            />
            <text
              x={40 + radius}
              y="263"
              textAnchor="middle"
              fill={isOccupied ? '#38bdf8' : '#e2e8f0'}
              fontSize="9.5"
              fontWeight="800"
              fontFamily="monospace"
            >
              {idx === 0 ? '58百万' : idx === 1 ? '150百万' : idx === 2 ? '778百万' : '4495百万'}
            </text>

            {/* Orbiting Planet Animation */}
            {snappedOrbits[idx] && (
              <g
                style={{
                  transformOrigin: '40px 260px',
                  animation: isAnimationPaused
                    ? 'none'
                    : `orbit-cw ${ORBIT_SPEEDS[idx]}s linear infinite`,
                }}
              >
                {(() => {
                  const p = PLANETS.find((item) => item.id === snappedOrbits[idx])!;
                  return (
                    <g transform={`translate(${40 + radius}, 260)`}>
                      {/* Glow behind planet */}
                      <circle cx="0" cy="0" r={p.radius + 3} fill={p.color} opacity="0.3" filter="url(#glow)" />
                      <circle cx="0" cy="0" r={p.radius} fill={p.color} stroke="#ffffff" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">
                        {p.id}
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );

  return (
    <div className="h-full flex flex-col justify-between gap-2 overflow-hidden" id="solar-system-race-module">
      {/* Sub Header Title Bar */}
      <div className="bg-white rounded-2xl px-4 py-2 border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
            乙组 · 第 1 题 [4分]
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
            <Orbit className="w-4 h-4 text-amber-600" />
            太阳系行星公转与距离探索
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            可按住拖拽/滚轮缩放画布，点击或拖动行星到轨道完成排序
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer active:scale-95"
          id="reset-btn-mod1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>

      {/* Main 2-Column iPad View Workbench */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* Left Side: Space Simulation + Planet Shelf */}
        <div className="md:col-span-6 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Orbit Canvas with Drag & Zoom */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`relative flex-1 w-full rounded-xl bg-gradient-to-b from-indigo-950 via-slate-900 to-sky-950 border border-indigo-200/30 overflow-hidden flex items-center justify-center min-h-0 select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* SVG Orbit Graphic */}
            {renderSolarSystemSvg(false)}

            {/* Floating Zoom & Control Toolbar */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-md">
              <button
                onClick={handleZoomIn}
                className="p-1 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="放大 (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="缩小 (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-300 px-1">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleResetView}
                className="p-1 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="复位视角"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sounds.playPop();
                  setIsEnlarged(true);
                }}
                className="p-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition cursor-pointer flex items-center gap-1 px-1.5 text-[10px]"
                title="全屏放大查看"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>放大查看</span>
              </button>
            </div>

            {/* Drag & Pan Helper Hint */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-700/80 text-[10px] font-bold text-slate-300 pointer-events-none">
              <Move className="w-3 h-3 text-amber-400" />
              <span>按住鼠标可拖动画布 · 滚轮缩放</span>
            </div>
          </div>

          {/* Planet Tray (Clickable & Draggable) */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 shrink-0">
            <span className="text-[11px] font-black text-slate-600 whitespace-nowrap">发射行星：</span>
            <div className="grid grid-cols-4 gap-1.5 flex-1">
              {PLANETS.map((planet) => {
                const isPlaced = arrangedOrder.includes(planet.id);
                return (
                  <button
                    key={planet.id}
                    disabled={isPlaced}
                    draggable={!isPlaced}
                    onDragStart={() => setDraggedPlanetId(planet.id)}
                    onClick={() => handlePlacePlanet(planet)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      isPlaced
                        ? 'bg-slate-100 border-slate-200 opacity-40 cursor-default'
                        : 'bg-amber-50/70 hover:bg-amber-100 border-amber-300 text-slate-800 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-black text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: planet.color }} />
                      <span>{planet.nameZh}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{planet.distanceMillionKm}百万公里</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Questions 1(a) & 1(b) */}
        <div className="md:col-span-6 flex flex-col justify-between gap-2 overflow-hidden">
          {/* Question 1(a) */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-black">1</span>
                1 (a). 按离太阳平均距离由近至远排列 [2分]
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                最近 → 最远
              </span>
            </div>

            {/* Table 1 */}
            <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-1 px-2 text-left border-r border-slate-200 text-slate-600 text-[11px]">行星</th>
                    <th className="py-1 px-2 border-r border-slate-200 font-black text-slate-800">P</th>
                    <th className="py-1 px-2 border-r border-slate-200 font-black text-orange-600">Q</th>
                    <th className="py-1 px-2 border-r border-slate-200 font-black text-sky-600">R</th>
                    <th className="py-1 px-2 font-black text-indigo-600">S</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-1 px-2 text-left text-[11px] font-bold text-slate-600 border-r border-slate-200">平均距离 (百万公里)</td>
                    <td className="py-1 px-2 font-mono font-extrabold text-slate-900 border-r border-slate-200">58</td>
                    <td className="py-1 px-2 font-mono font-extrabold text-slate-900 border-r border-slate-200">778</td>
                    <td className="py-1 px-2 font-mono font-extrabold text-slate-900 border-r border-slate-200">150</td>
                    <td className="py-1 px-2 font-mono font-extrabold text-slate-900">4495</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ordering Sequence Slots (Supports Drop & Click) */}
            <div className="flex items-center justify-between gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
              {[0, 1, 2, 3].map((slotIdx) => {
                const planetId = arrangedOrder[slotIdx];
                const planet = PLANETS.find((p) => p.id === planetId);

                return (
                  <React.Fragment key={`slot-${slotIdx}`}>
                    <button
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropOnSlot(slotIdx)}
                      onClick={() => planetId && handleRemoveFromOrder(slotIdx)}
                      className={`flex-1 py-1 px-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition cursor-pointer min-h-[46px] ${
                        planet
                          ? 'border-amber-500 bg-amber-50 shadow-2xs hover:border-rose-400'
                          : 'border-slate-300 bg-white hover:border-amber-400'
                      }`}
                    >
                      {planet ? (
                        <>
                          <span className="text-xs font-black text-amber-800">{planet.nameZh}</span>
                          <span className="text-[9px] text-slate-500 font-bold">{planet.distanceMillionKm}百万公里 ✕</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">第 {slotIdx + 1} 位 (拖入/点击)</span>
                      )}
                    </button>

                    {slotIdx < 3 && <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Question 1(b) */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-black">2</span>
                1 (b). 观察表 2 数据并勾选 2 个正确说明 [2分]
              </h3>
            </div>

            {/* Table 2 */}
            <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-1 px-2 text-left border-r border-slate-200 text-slate-600 text-[11px]">行星</th>
                    <th className="py-1 px-2 border-r border-slate-200 text-slate-600 text-[11px]">与太阳距离 (百万公里)</th>
                    <th className="py-1 px-2 text-slate-600 text-[11px]">公转一周所需时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                  <tr className={isRowHighlighted('X') ? 'bg-amber-100 font-bold' : ''}>
                    <td className="py-1 px-2 text-left font-bold text-slate-800 border-r border-slate-200">X (水星)</td>
                    <td className="py-1 px-2 font-mono border-r border-slate-200">58</td>
                    <td className="py-1 px-2 font-bold text-emerald-700">88 天</td>
                  </tr>
                  <tr className={isRowHighlighted('Y') ? 'bg-amber-100 font-bold' : ''}>
                    <td className="py-1 px-2 text-left font-bold text-slate-800 border-r border-slate-200">Y (地球)</td>
                    <td className="py-1 px-2 font-mono border-r border-slate-200">150</td>
                    <td className="py-1 px-2 font-bold text-emerald-700">365 天</td>
                  </tr>
                  <tr className={isRowHighlighted('Z') ? 'bg-amber-100 font-bold' : ''}>
                    <td className="py-1 px-2 text-left font-bold text-slate-800 border-r border-slate-200">Z (木星)</td>
                    <td className="py-1 px-2 font-mono border-r border-slate-200">778</td>
                    <td className="py-1 px-2 font-bold text-emerald-700">约 12 年</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Statement Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'opt1', text: '行星 X 离太阳最近。', isCorrect: true },
                { id: 'opt2', text: '行星 Z 的公转轨道最短。', isCorrect: false },
                { id: 'opt3', text: '行星离太阳越远，公转一周所需时间越长。', isCorrect: true },
                { id: 'opt4', text: '行星 Y 的表面温度一定比 X 高。', isCorrect: false },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onMouseEnter={() => setHoveredOption(opt.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => toggleOption(opt.id)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                    checkedOptions[opt.id]
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <input
                      type="checkbox"
                      checked={checkedOptions[opt.id]}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500"
                    />
                    {opt.text}
                  </span>
                  {showResult && (
                    <span className={`text-[10px] font-black ${opt.isCorrect === checkedOptions[opt.id] ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {opt.isCorrect ? '✓' : checkedOptions[opt.id] ? '✗' : ''}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Validation Button and Result Banner */}
          <div className="space-y-1.5">
            {showResult && (
              <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${allCompleted ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>
                {allCompleted ? '🎉 答案完全正确！(获得 4 分)' : '⚠️ 顺序为：P → R → Q → S；说明勾选第 1 项与第 3 项。'}
              </div>
            )}

            <button
              onClick={handleValidate}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              id="validate-mod1-btn"
            >
              <Sparkles className="w-4 h-4" />
              提交核对答案 (4分)
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Enlargement Modal (全屏大图模式) */}
      {isEnlarged && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-fade-in">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5">
                <Orbit className="w-4 h-4" />
                太阳系公转轨道全景大图
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline font-medium">
                支持鼠标拖拽平移、滚轮缩放、双指缩放查看每一个行星轨道与公转轨迹
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAnimationPaused(!isAnimationPaused)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                {isAnimationPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                {isAnimationPaused ? '继续公转' : '暂停公转'}
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  setIsEnlarged(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                关闭放大
              </button>
            </div>
          </div>

          {/* Modal Interactive SVG Viewport */}
          <div
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.15 : 0.15;
              setModalZoom((prev) => Math.min(Math.max(prev + delta, 0.6), 4.0));
            }}
            className={`flex-1 w-full my-3 rounded-2xl bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative select-none ${
              isModalDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {renderSolarSystemSvg(true)}

            {/* Modal Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl">
              <button
                onClick={() => setModalZoom((prev) => Math.min(prev + 0.3, 4.0))}
                className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="放大"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setModalZoom((prev) => Math.max(prev - 0.3, 0.6))}
                className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="缩小"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-200 px-2">
                {Math.round(modalZoom * 100)}%
              </span>
              <button
                onClick={() => {
                  setModalZoom(1.2);
                  setModalPan({ x: 0, y: 0 });
                }}
                className="p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                title="复位"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Planets Quick Legend */}
            <div className="absolute bottom-4 left-4 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 pointer-events-none">
              {PLANETS.map((p) => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="text-[10px]">
                    <div className="text-white font-black">{p.nameZh} ({p.realPlanet})</div>
                    <div className="text-slate-400 font-mono">{p.distanceMillionKm}百万km · {p.orbitalPeriod}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

