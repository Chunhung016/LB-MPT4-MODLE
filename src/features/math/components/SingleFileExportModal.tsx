import React, { useState } from 'react';
import { Copy, Check, Download, Code2, ExternalLink } from 'lucide-react';
import { sound } from '../utils/audio';

export const SingleFileExportModal: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  // 生成纯原生 Vanilla JS + CSS + SVG 的单文件 HTML 代码
  const singleFileSourceCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>小学数学互动学习组件套件 (Primary Math Interactive Lab)</title>
  <!-- 引入 Tailwind CSS 快速样式支持 -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- 引入 Canvas Confetti 庆祝特效 -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <style>
    /* 柔和糖果系配色与平滑过渡动画 */
    body {
      background-color: #f8fafc;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      color: #1e293b;
    }
    .candy-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 1.25rem;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .candy-card:hover {
      box-shadow: 0 10px 20px -4px rgba(0, 0, 0, 0.08);
    }
    /* 3D 折叠容器透视 */
    .preserve-3d {
      transform-style: preserve-3d;
    }
    /* 弹珠跳跃动画 */
    @keyframes marbleBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .marble-bounce {
      animation: marbleBounce 0.6s ease-in-out infinite alternate;
    }
  </style>
</head>
<body class="p-4 md:p-8 max-w-5xl mx-auto">

  <!-- 顶部标题 -->
  <header class="text-center mb-8">
    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">SJKC 四年级数学互动实验平台</span>
    <h1 class="text-3xl font-extrabold text-slate-800 mt-2">小学数学核心考点互动组件集</h1>
    <p class="text-slate-500 text-sm mt-1">涵盖立体折叠、乘法分组、长方体体积、分数减法与笛卡尔坐标系</p>
  </header>

  <!-- 导航切换栏 -->
  <div class="flex flex-wrap items-center justify-center gap-2 mb-8" id="navTabs">
    <button onclick="switchTab('q1')" id="btn-q1" class="tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-sm">1. 展开图与折叠</button>
    <button onclick="switchTab('q2')" id="btn-q2" class="tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">2. 分组与乘法</button>
    <button onclick="switchTab('q3')" id="btn-q3" class="tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">3. 长方体体积</button>
    <button onclick="switchTab('q4')" id="btn-q4" class="tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">4. 分数减法</button>
    <button onclick="switchTab('q5')" id="btn-q5" class="tab-btn px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">5. 笛卡尔坐标系</button>
  </div>

  <!-- ==================== 题目 1: 展开图折叠与面数 ==================== -->
  <section id="pane-q1" class="space-y-6">
    <div class="candy-card p-6 border-amber-200">
      <h2 class="text-xl font-bold text-slate-800">1. 图 1 显示一个立体的展开图。(a) 写出这个立体的名称。(b) 这个立体有多少个面?</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <!-- 3D 折叠舞台 -->
        <div class="bg-amber-50/50 rounded-xl p-4 flex flex-col items-center justify-between min-h-[380px] border border-amber-100">
          <div class="text-xs font-bold text-slate-600 w-full flex justify-between">
            <span>3D 实时折叠观察器</span>
            <span id="q1-marked-counter" class="text-indigo-600 font-mono">已标记: 0/6 面</span>
          </div>
          <!-- 3D 舞台 -->
          <div style="perspective: 900px;" class="w-full flex-1 flex items-center justify-center my-4">
            <div id="q1CubeStage" class="relative preserve-3d" style="width: 70px; height: 70px; transform: rotateX(-25deg) rotateY(35deg);">
              <!-- 展开图各面 (面2为基准) -->
              <div id="face2" onclick="markFace(2)" class="absolute inset-0 w-[70px] h-[70px] bg-sky-200 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer preserve-3d">
                2(正)
                <!-- 面1 (上) -->
                <div id="face1" onclick="markFace(1); event.stopPropagation();" class="absolute w-[70px] h-[70px] bg-amber-200 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer" style="top:-70px; transform-origin:bottom center;">1(顶)</div>
                <!-- 面5 (左) -->
                <div id="face5" onclick="markFace(5); event.stopPropagation();" class="absolute w-[70px] h-[70px] bg-emerald-200 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer" style="left:-70px; transform-origin:right center;">5(左)</div>
                <!-- 面6 (右) -->
                <div id="face6" onclick="markFace(6); event.stopPropagation();" class="absolute w-[70px] h-[70px] bg-pink-200 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer" style="right:-70px; transform-origin:left center;">6(右)</div>
                <!-- 面3 (下) -->
                <div id="face3" onclick="markFace(3); event.stopPropagation();" class="absolute w-[70px] h-[70px] bg-orange-200 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer preserve-3d" style="bottom:-70px; transform-origin:top center;">
                  3(底)
                  <!-- 面4 (底下的背) -->
                  <div id="face4" onclick="markFace(4); event.stopPropagation();" class="absolute w-[70px] h-[70px] bg-purple-200 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer" style="bottom:-70px; transform-origin:top center;">4(背)</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 滑块控制 -->
          <div class="w-full bg-white p-3 rounded-lg border border-slate-200">
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>折叠图形:</span>
              <span id="foldLabel" class="text-indigo-600 font-mono">0% (展开图)</span>
            </div>
            <input type="range" id="foldSlider" min="0" max="100" value="0" oninput="handleFold(this.value)" class="w-full h-2 bg-slate-200 rounded-lg cursor-pointer">
          </div>
        </div>
        <!-- 答题表单 -->
        <div class="space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">(a) 写出这个立体的名称：</label>
              <input type="text" id="q1-name-input" placeholder="如：正方体 / 立方体" class="w-full p-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">(b) 这个立体有多少个面？</label>
              <input type="number" id="q1-faces-input" placeholder="填入面数，如：6" class="w-full p-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400">
            </div>
          </div>
          <button onclick="checkQ1()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition">提交并验证答案</button>
          <div id="q1-feedback" class="hidden p-3 rounded-xl text-xs font-semibold"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- 核心交互脚本 -->
  <script>
    // 切换 Tab
    function switchTab(id) {
      document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-white', 'text-slate-700');
      });
      document.getElementById('pane-' + id).classList.remove('hidden');
      const curBtn = document.getElementById('btn-' + id);
      curBtn.classList.remove('bg-white', 'text-slate-700');
      curBtn.classList.add('bg-indigo-600', 'text-white');
    }

    // Q1 折叠逻辑
    let markedCount = 0;
    const markedMap = {};
    function markFace(faceNum) {
      if (!markedMap[faceNum]) {
        markedCount++;
        markedMap[faceNum] = markedCount;
        const el = document.getElementById('face' + faceNum);
        el.innerHTML += '<span class="absolute w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center">' + markedCount + '</span>';
        document.getElementById('q1-marked-counter').innerText = '已标记: ' + markedCount + '/6 面';
        if (markedCount === 6 && window.confetti) confetti();
      }
    }

    function handleFold(val) {
      const angle = (val / 100) * 90;
      document.getElementById('foldLabel').innerText = val == 0 ? '0% (平面展开图)' : (val == 100 ? '100% (已折叠成正方体)' : val + '%');
      document.getElementById('face1').style.transform = 'rotateX(' + angle + 'deg)';
      document.getElementById('face5').style.transform = 'rotateY(' + (-angle) + 'deg)';
      document.getElementById('face6').style.transform = 'rotateY(' + angle + 'deg)';
      document.getElementById('face3').style.transform = 'rotateX(' + (-angle) + 'deg)';
      document.getElementById('face4').style.transform = 'rotateX(' + (-angle) + 'deg)';
    }

    function checkQ1() {
      const name = document.getElementById('q1-name-input').value.trim();
      const faces = document.getElementById('q1-faces-input').value.trim();
      const fb = document.getElementById('q1-feedback');
      const isNameOk = name.includes('正方体') || name.includes('立方体') || name.toLowerCase().includes('cube');
      const isFacesOk = faces === '6' || faces === '六';
      fb.classList.remove('hidden');
      if (isNameOk && isFacesOk) {
        fb.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';
        fb.innerText = '🎉 太棒了！完全正确！正方体由 6 个相等的正方形面组成。';
        if (window.confetti) confetti();
      } else {
        fb.className = 'p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200';
        fb.innerText = '💡 提示：名称填「正方体」，面数填「6」。';
      }
    }
  </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(singleFileSourceCode);
    setCopied(true);
    sound.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([singleFileSourceCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'primary-math-interactive-suite.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playSuccess();
  };

  return (
    <div id="export-source-view" className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* 导出介绍卡 */}
      <div className="bg-stone-900 text-stone-50 rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 text-amber-300 rounded-full text-xs font-bold mb-2 border border-stone-700">
              <Code2 className="w-3.5 h-3.5" /> 独立单文件 (Single-File) 交付
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              单文件 HTML 源码一键导出
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1">
              符合开发规范要求：HTML + CSS + 原生 Vanilla JS + SVG 纯代码完整整合在一个独立文件中，可直接双击在任何离线浏览器中完美运行！
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-copy-btn"
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition border border-amber-700 shadow-xs active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制到剪贴板！' : '一键复制代码'}
            </button>

            <button
              id="export-download-btn"
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" /> 下载 .html 文件
            </button>
          </div>
        </div>
      </div>

      {/* 源码预览卡片 */}
      <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 bg-stone-900 border-b border-stone-800 text-xs text-stone-400">
          <span className="font-mono flex items-center gap-2 text-stone-300">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            primary-math-interactive-suite.html
          </span>
          <span className="text-stone-400 font-medium">纯原生无依赖 · 随时随地预览</span>
        </div>

        <pre className="p-4 text-xs font-mono text-amber-200/90 overflow-x-auto max-h-[480px] leading-relaxed select-all">
          <code>{singleFileSourceCode}</code>
        </pre>
      </div>
    </div>
  );
};
