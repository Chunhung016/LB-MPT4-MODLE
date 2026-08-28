import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, HelpCircle, Eye, Box, X } from 'lucide-react';

interface FaceData {
  id: number;
  label: string;
  defaultColor: string;
  name: string;
}

const FACES_CONFIG: FaceData[] = [
  { id: 1, label: '顶部面', defaultColor: '#FDE68A', name: '上底面 (Top)' },       // Row 1
  { id: 2, label: '正面', defaultColor: '#BAE6FD', name: '正面 (Front / 基底)' },    // Row 2 center
  { id: 3, label: '底部面', defaultColor: '#FED7AA', name: '下底面 (Bottom)' },    // Row 3
  { id: 4, label: '背面', defaultColor: '#DDD6FE', name: '背面 (Back)' },          // Row 4
  { id: 5, label: '左侧面', defaultColor: '#BBF7D0', name: '左侧面 (Left)' },       // Left of Row 2
  { id: 6, label: '右侧面', defaultColor: '#FBCFE8', name: '右侧面 (Right)' },      // Right of Row 2
];

export const Question1CubeNet: React.FC = () => {
  // 折叠进度 (0 到 100)
  const [foldProgress, setFoldProgress] = useState<number>(0);
  // 已标记面序号映射: { [faceId]: number }
  const [markedFaces, setMarkedFaces] = useState<{ [faceId: number]: number }>({});
  // 3D 视角旋转角度
  const [rotX, setRotX] = useState<number>(-22);
  const [rotY, setRotY] = useState<number>(32);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isDragging3D, setIsDragging3D] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({ x: 0, y: 0, rotX: 0, rotY: 0 });

  // 候选卡片数据源
  const NAME_CARDS = ['正方体', '长方体', '圆柱体', '三棱锥'];
  const FACES_CARDS = ['4', '5', '6', '8', '12'];

  // 学生作答卡槽状态 (支持拖拽 & 点击放入)
  const [nameSlot, setNameSlot] = useState<string | null>(null);
  const [facesSlot, setFacesSlot] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{ checked: boolean; nameOk: boolean; facesOk: boolean } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // 拖拽放入处理函数
  const handleDragStart = (e: React.DragEvent, cardType: 'name' | 'faces', val: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardType, val }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, targetSlot: 'name' | 'faces') => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      const data = JSON.parse(dataStr);
      if (data && data.val) {
        sound.playPop(580);
        if (targetSlot === 'name') {
          setNameSlot(data.val);
        } else {
          setFacesSlot(data.val);
        }
      }
    } catch {
      // ignore
    }
  };

  // 点击卡片直接填入对应槽位
  const handleNameCardClick = (val: string) => {
    sound.playPop(520);
    setNameSlot(val);
  };

  const handleFacesCardClick = (val: string) => {
    sound.playPop(540);
    setFacesSlot(val);
  };

  // 移除卡片
  const handleRemoveSlot = (slotType: 'name' | 'faces', e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playPop(380);
    if (slotType === 'name') setNameSlot(null);
    else setFacesSlot(null);
  };

  // 自动旋转计时器
  useEffect(() => {
    let animId: number;
    if (isAutoRotate) {
      const animate = () => {
        setRotY((prev) => (prev + 0.5) % 360);
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotate]);

  // 点击标记某个面
  const handleFaceClick = (faceId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playPop(520);

    setMarkedFaces((prev) => {
      const current = prev[faceId];
      if (current !== undefined) {
        // 如果已标记，点击可取消
        const updated = { ...prev };
        delete updated[faceId];
        return updated;
      } else {
        // 找到当前未使用的最小序号 1..6
        const usedNumbers = Object.values(prev);
        let nextNum = 1;
        while (usedNumbers.includes(nextNum) && nextNum <= 6) {
          nextNum++;
        }
        if (nextNum <= 6) {
          const updated = { ...prev, [faceId]: nextNum };
          if (Object.keys(updated).length === 6) {
            sound.playSuccess();
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
          }
          return updated;
        }
        return prev;
      }
    });
  };

  // 3D 舞台拖拽旋转视角
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging3D(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, rotX, rotY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging3D) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setRotX(Math.max(-80, Math.min(80, dragStartRef.current.rotX - dy * 0.5)));
    setRotY((dragStartRef.current.rotY + dx * 0.5) % 360);
  };

  const handleMouseUp = () => {
    setIsDragging3D(false);
  };

  // 触摸支持
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging3D(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        rotX,
        rotY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging3D || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setRotX(Math.max(-80, Math.min(80, dragStartRef.current.rotX - dy * 0.5)));
    setRotY((dragStartRef.current.rotY + dx * 0.5) % 360);
  };

  // 检查答案
  const handleCheckAnswer = () => {
    const nameVal = nameSlot?.trim() || '';
    const facesVal = facesSlot?.trim() || '';

    const validNames = ['正方体', '立方体', '正六面体', 'cube'];
    const nameOk = validNames.some((v) => nameVal.includes(v));
    const facesOk = facesVal === '6' || facesVal === '六';

    setCheckResult({ checked: true, nameOk, facesOk });

    if (nameOk && facesOk) {
      sound.playSuccess();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      sound.playGentleError();
    }
  };

  // 重置作答
  const handleReset = () => {
    setFoldProgress(0);
    setMarkedFaces({});
    setNameSlot(null);
    setFacesSlot(null);
    setCheckResult(null);
    setShowHint(false);
    setRotX(-22);
    setRotY(32);
    sound.playPop(350);
  };

  // 折叠角度计算 (进度 0 -> 100 对应 0deg -> 90deg)
  const angle = (foldProgress / 100) * 90;
  const markedCount = Object.keys(markedFaces).length;

  return (
    <div id="question-1-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* 题目头部 (对应试卷第 1 题) */}
      <div id="q1-header-card" className="bg-white rounded-2xl p-6 border border-[#E5DFC9] shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] text-amber-900 rounded-full text-xs font-bold tracking-wide mb-2 border border-[#FDE68A]">
              <Box className="w-3.5 h-3.5 text-amber-700" /> 空间与几何 · 第 1 题
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
              1. 图 1 显示一个立体的展开图。
            </h2>
            <div className="mt-2 text-stone-600 space-y-1 font-medium text-sm md:text-base">
              <p className="flex items-center gap-1.5">
                <span className="text-amber-700 font-bold">(a)</span> 写出这个立体的名称。
                <span className="text-xs text-stone-400 font-mono">[1 分]</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-amber-700 font-bold">(b)</span> 这个立体有多少个面？
                <span className="text-xs text-stone-400 font-mono">[1 分]</span>
              </p>
            </div>
          </div>

          <button
            id="q1-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 bg-[#F4F0DE] hover:bg-[#EAE4CE] border border-[#DDD7C0] rounded-xl transition-all active:scale-95"
            title="重置本题"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>
      </div>

      {/* 核心互动工作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧/上方：3D 折叠与 SVG 观察视窗 */}
        <div className="lg:col-span-7 bg-[#F8F6EB] rounded-2xl p-5 border border-[#E5DFC9] flex flex-col items-center justify-between min-h-[440px] relative overflow-hidden shadow-xs">
          {/* 顶部控制栏 */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-white rounded-lg shadow-xs text-stone-700 border border-[#E5DFC9]">
                图 1 · 立体展开与折叠观察台
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-[#E7F7F1] text-teal-900 rounded-lg border border-[#BCE7D6]">
                已点数面: {markedCount}/6
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  isAutoRotate
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-stone-700 border-[#DDD7C0] hover:bg-[#F4F0DE]'
                }`}
              >
                {isAutoRotate ? '停止旋转' : '自动旋转'}
              </button>
              <button
                onClick={() => {
                  setRotX(-22);
                  setRotY(32);
                }}
                className="text-xs px-2 py-1 bg-white text-stone-700 border border-[#DDD7C0] rounded-lg hover:bg-[#F4F0DE] font-medium"
                title="复位观察角度"
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />视角复位
              </button>
            </div>
          </div>

          {/* 3D 舞台区域 (支持触摸/鼠标拖拽旋转视角) */}
          <div
            id="q1-3d-stage"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing select-none relative my-2"
            style={{ perspective: '1100px' }}
          >
            {/* 提示小浮标 */}
            <div className="absolute top-2 left-2 text-[11px] text-stone-500 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg border border-[#E5DFC9] pointer-events-none">
              👆 拖拽空白区域可 360° 旋转观察 · 点击各面可标记序号
            </div>

            {/* 3D 展开图 / 立体骨架 */}
            <div
              className="relative transition-transform duration-75"
              style={{
                width: '80px',
                height: '80px',
                transformStyle: 'preserve-3d',
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              }}
            >
              {/* 【基准面 2 (正面 / 中心面)】 */}
              <div
                id="q1-face-2"
                onClick={(e) => handleFaceClick(2, e)}
                className="absolute inset-0 w-20 h-20 rounded-md border-2 border-stone-800 cursor-pointer flex flex-col items-center justify-center transition-shadow hover:ring-2 hover:ring-amber-400"
                style={{
                  backgroundColor: FACES_CONFIG[1].defaultColor,
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(0px)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                }}
              >
                <span className="text-xs font-bold text-stone-800 select-none">2 (正面)</span>
                {markedFaces[2] && (
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {markedFaces[2]}
                  </span>
                )}

                {/* 【顶部面 1】：挂接在面 2 的上边，绕 top 向上折叠 -angle 度 */}
                <div
                  id="q1-face-1"
                  onClick={(e) => handleFaceClick(1, e)}
                  className="absolute w-20 h-20 rounded-md border-2 border-stone-800 cursor-pointer flex flex-col items-center justify-center hover:ring-2 hover:ring-amber-400"
                  style={{
                    backgroundColor: FACES_CONFIG[0].defaultColor,
                    top: '-80px',
                    left: '0px',
                    transformOrigin: 'bottom center',
                    transform: `rotateX(${angle}deg)`,
                  }}
                >
                  <span className="text-xs font-bold text-stone-800 select-none">1 (顶部)</span>
                  {markedFaces[1] && (
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {markedFaces[1]}
                    </span>
                  )}
                </div>

                {/* 【左侧面 5】：挂接在面 2 的左边，绕 right 往内折叠 +angle 度 */}
                <div
                  id="q1-face-5"
                  onClick={(e) => handleFaceClick(5, e)}
                  className="absolute w-20 h-20 rounded-md border-2 border-stone-800 cursor-pointer flex flex-col items-center justify-center hover:ring-2 hover:ring-amber-400"
                  style={{
                    backgroundColor: FACES_CONFIG[4].defaultColor,
                    top: '0px',
                    left: '-80px',
                    transformOrigin: 'right center',
                    transform: `rotateY(${-angle}deg)`,
                  }}
                >
                  <span className="text-xs font-bold text-stone-800 select-none">5 (左面)</span>
                  {markedFaces[5] && (
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {markedFaces[5]}
                    </span>
                  )}
                </div>

                {/* 【右侧面 6】：挂接在面 2 的右边，绕 left 往内折叠 -angle 度 */}
                <div
                  id="q1-face-6"
                  onClick={(e) => handleFaceClick(6, e)}
                  className="absolute w-20 h-20 rounded-md border-2 border-stone-800 cursor-pointer flex flex-col items-center justify-center hover:ring-2 hover:ring-amber-400"
                  style={{
                    backgroundColor: FACES_CONFIG[5].defaultColor,
                    top: '0px',
                    right: '-80px',
                    transformOrigin: 'left center',
                    transform: `rotateY(${angle}deg)`,
                  }}
                >
                  <span className="text-xs font-bold text-stone-800 select-none">6 (右面)</span>
                  {markedFaces[6] && (
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {markedFaces[6]}
                    </span>
                  )}
                </div>

                {/* 【底部面 3】：挂接在面 2 的下边，绕 top 往内折叠 -angle 度 */}
                <div
                  id="q1-face-3"
                  onClick={(e) => handleFaceClick(3, e)}
                  className="absolute w-20 h-20 rounded-md border-2 border-stone-800 cursor-pointer flex flex-col items-center justify-center hover:ring-2 hover:ring-amber-400"
                  style={{
                    backgroundColor: FACES_CONFIG[2].defaultColor,
                    bottom: '-80px',
                    left: '0px',
                    transformOrigin: 'top center',
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${-angle}deg)`,
                  }}
                >
                  <span className="text-xs font-bold text-stone-800 select-none">3 (底面)</span>
                  {markedFaces[3] && (
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {markedFaces[3]}
                    </span>
                  )}

                  {/* 【背面 4】：挂接在面 3 的下边，再继续折叠 -angle 度封顶成背面 */}
                  <div
                    id="q1-face-4"
                    onClick={(e) => handleFaceClick(4, e)}
                    className="absolute w-20 h-20 rounded-md border-2 border-stone-800 cursor-pointer flex flex-col items-center justify-center hover:ring-2 hover:ring-amber-400"
                    style={{
                      backgroundColor: FACES_CONFIG[3].defaultColor,
                      bottom: '-80px',
                      left: '0px',
                      transformOrigin: 'top center',
                      transform: `rotateX(${-angle}deg)`,
                    }}
                  >
                    <span className="text-xs font-bold text-stone-800 select-none">4 (背面)</span>
                    {markedFaces[4] && (
                      <span className="mt-0.5 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {markedFaces[4]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部折叠滑块控制器 */}
          <div className="w-full bg-white rounded-xl p-3.5 border border-[#E5DFC9] shadow-xs z-10">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                折叠图形进度:
              </span>
              <span className="font-mono text-amber-800 bg-[#FEF3C7] px-2.5 py-0.5 rounded border border-[#FDE68A]">
                {foldProgress === 0 ? '平面展开图 (2D Net)' : foldProgress === 100 ? '已完全折叠成正方体 (3D Cube)' : `折叠中: ${foldProgress}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFoldProgress(0)}
                className="text-xs px-2.5 py-1 bg-[#F4F0DE] hover:bg-[#EAE4CE] text-stone-700 rounded-lg font-bold transition border border-[#DDD7C0]"
              >
                展开 (2D)
              </button>

              <input
                id="q1-fold-slider"
                type="range"
                min="0"
                max="100"
                value={foldProgress}
                onChange={(e) => setFoldProgress(Number(e.target.value))}
                className="flex-1 h-2.5 bg-[#E8E4D0] rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <button
                onClick={() => setFoldProgress(100)}
                className="text-xs px-2.5 py-1 bg-[#FEF3C7] hover:bg-[#FDE68A] text-amber-900 rounded-lg font-bold transition border border-[#FDE68A]"
              >
                折叠成体 (3D)
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：学生互动答题卡与教学解析 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5DFC9] shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 mb-3 flex items-center gap-2">
                ✍️ 学生作答区
              </h3>

              {/* 小提示卡片 */}
              <div className="bg-[#FAF8EE] rounded-xl p-3.5 border border-[#E5DFC9] text-xs text-stone-700 mb-4 leading-relaxed">
                💡 <strong>学习小帮手：</strong>
                拖动左侧滑块可以将展开图折叠成立体！点击展开图或立体的每一个面，数字标签会帮你记录数过的面数哦！
              </div>

              {/* 答题表单 (支持拖拽放入与点击候选卡片) */}
              <div className="space-y-4">
                {/* 题目 a */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-stone-800">
                      (a) 写出这个立体的名称：
                    </label>
                    <span className="text-xs text-stone-400 font-mono">[1 分]</span>
                  </div>

                  {/* 题目 a 目标槽位 */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'name')}
                    className={`min-h-[52px] rounded-xl border-2 p-2 flex items-center justify-between transition-all ${
                      checkResult
                        ? checkResult.nameOk
                          ? 'border-emerald-500 bg-[#E7F7F1]'
                          : 'border-rose-400 bg-rose-50/70'
                        : nameSlot
                        ? 'border-amber-400 bg-[#FEFDF9] shadow-xs'
                        : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE]/70 hover:border-amber-400 hover:bg-[#FDFCF5]'
                    }`}
                  >
                    {nameSlot ? (
                      <div className="w-full flex items-center justify-between px-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-stone-950 font-extrabold text-sm rounded-lg shadow-xs">
                          {nameSlot}
                        </span>
                        <div className="flex items-center gap-2">
                          {checkResult?.nameOk && (
                            <CheckCircle2 className="w-5 h-5 text-teal-600" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSlot('name', e)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 transition"
                            title="移除此卡片"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 font-medium px-3 flex items-center gap-1.5">
                        <span>📥 拖拽或点击下方名称卡片放入此处</span>
                      </span>
                    )}
                  </div>

                  {/* 名称候选卡片池 */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-stone-500">名称卡片：</span>
                    {NAME_CARDS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'name', name)}
                        onClick={() => handleNameCardClick(name)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition shadow-2xs cursor-grab active:cursor-grabbing active:scale-95 ${
                          nameSlot === name
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                            : 'bg-white text-stone-700 border-[#DDD7C0] hover:border-amber-400 hover:bg-[#FFFBEB]'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>

                  {checkResult && !checkResult.nameOk && (
                    <p className="text-xs text-rose-700 font-medium">提示：6个面都是相同正方形的立体叫做「正方体」或「立方体」。</p>
                  )}
                </div>

                {/* 题目 b */}
                <div className="space-y-2 pt-2 border-t border-[#F0EBD8]">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-stone-800">
                      (b) 这个立体有多少个面？
                    </label>
                    <span className="text-xs text-stone-400 font-mono">[1 分]</span>
                  </div>

                  {/* 题目 b 目标槽位 */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'faces')}
                    className={`min-h-[52px] rounded-xl border-2 p-2 flex items-center justify-between transition-all ${
                      checkResult
                        ? checkResult.facesOk
                          ? 'border-emerald-500 bg-[#E7F7F1]'
                          : 'border-rose-400 bg-rose-50/70'
                        : facesSlot
                        ? 'border-amber-400 bg-[#FEFDF9] shadow-xs'
                        : 'border-dashed border-[#DDD7C0] bg-[#FAF8EE]/70 hover:border-amber-400 hover:bg-[#FDFCF5]'
                    }`}
                  >
                    {facesSlot ? (
                      <div className="w-full flex items-center justify-between px-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white font-mono font-extrabold text-sm rounded-lg shadow-xs">
                          {facesSlot} 个面
                        </span>
                        <div className="flex items-center gap-2">
                          {checkResult?.facesOk && (
                            <CheckCircle2 className="w-5 h-5 text-teal-600" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSlot('faces', e)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 transition"
                            title="移除此卡片"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 font-medium px-3 flex items-center gap-1.5">
                        <span>📥 拖拽或点击下方数字卡片放入此处</span>
                      </span>
                    )}
                  </div>

                  {/* 面数候选卡片池 */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-stone-500">面数卡片：</span>
                    {FACES_CARDS.map((num) => (
                      <button
                        key={num}
                        type="button"
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'faces', num)}
                        onClick={() => handleFacesCardClick(num)}
                        className={`w-9 h-8 text-xs font-mono font-bold rounded-lg border transition shadow-2xs cursor-grab active:cursor-grabbing active:scale-95 flex items-center justify-center ${
                          facesSlot === num
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                            : 'bg-white text-stone-700 border-[#DDD7C0] hover:border-amber-400 hover:bg-[#FFFBEB]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {checkResult && !checkResult.facesOk && (
                    <p className="text-xs text-rose-700 font-medium">请再仔细数一数展开图中的面数。</p>
                  )}
                </div>
              </div>
            </div>

            {/* 提交按钮与反馈 */}
            <div className="pt-4 border-t border-[#E8E4D0] mt-4 space-y-3">
              <button
                id="q1-submit-btn"
                onClick={handleCheckAnswer}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 border border-amber-700"
              >
                <CheckCircle2 className="w-4 h-4" /> 检查答案
              </button>

              {checkResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    checkResult.nameOk && checkResult.facesOk
                      ? 'bg-[#E7F7F1] border border-[#BCE7D6] text-teal-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {checkResult.nameOk && checkResult.facesOk
                    ? '🎉 回答正确！'
                    : '❌ 答案不正确，请观察 3D 模拟并调整卡片。'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
