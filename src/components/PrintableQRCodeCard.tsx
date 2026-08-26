import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, Copy, Check, QrCode } from 'lucide-react';

interface PrintableQRCodeCardProps {
  moduleNumber: 1 | 2;
  moduleName: string;
  moduleSubtitle: string;
  qrCodeText: string;
  themeColor: string;
  themeBg: string;
  themeBorder: string;
}

export async function printDualModuleSheet() {
  try {
    const [url1, url2] = await Promise.all([
      QRCode.toDataURL('Lb_2026_MPT4_M1_', {
        width: 600,
        margin: 2,
        color: { dark: '#1E293B', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      }),
      QRCode.toDataURL('Lb_2026_MPT4_M2_', {
        width: 600,
        margin: 2,
        color: { dark: '#1E293B', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      }),
    ]);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Little Bee MPT4 - Dual Module QR Print Sheet @2026</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
            
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: #ffffff;
              margin: 0;
              padding: 10px;
              color: #1e293b;
            }
            .header-banner {
              text-align: center;
              margin-bottom: 24px;
              border-bottom: 2px solid #fde68a;
              padding-bottom: 12px;
            }
            .header-title {
              font-family: 'Fredoka', sans-serif;
              font-size: 24px;
              font-weight: 700;
              color: #78350f;
              margin: 0;
            }
            .header-sub {
              font-size: 12px;
              color: #92400e;
              margin-top: 4px;
            }
            .cards-grid {
              display: flex;
              flex-direction: row;
              justify-content: center;
              gap: 24px;
              flex-wrap: wrap;
            }
            .card-wrapper {
              width: 310px;
              border: 3px dashed #f59e0b;
              border-radius: 20px;
              padding: 20px;
              text-align: center;
              background: #fffbeb;
              box-sizing: border-box;
              page-break-inside: avoid;
            }
            .header-tag {
              display: inline-block;
              background: #fbbf24;
              color: #78350f;
              font-family: 'Fredoka', sans-serif;
              font-weight: 700;
              font-size: 11px;
              padding: 4px 12px;
              border-radius: 9999px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
            }
            .title {
              font-family: 'Fredoka', sans-serif;
              font-size: 20px;
              font-weight: 700;
              color: #78350f;
              margin: 2px 0;
            }
            .subtitle {
              font-size: 10px;
              color: #92400e;
              margin-bottom: 14px;
            }
            .qr-container {
              background: #ffffff;
              padding: 10px;
              border-radius: 14px;
              border: 2px solid #fde68a;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .qr-img {
              width: 170px;
              height: 170px;
              display: block;
            }
            .code-text {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              font-weight: 700;
              background: #ffffff;
              border: 1px solid #fde68a;
              color: #78350f;
              padding: 4px 8px;
              border-radius: 8px;
              margin-top: 10px;
              display: inline-block;
            }
            .instructions {
              font-size: 10px;
              color: #78350f;
              margin-top: 10px;
              line-height: 1.4;
            }
            .cut-guide {
              margin-top: 14px;
              font-size: 9px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1 class="header-title">LITTLE BEE MPT4 MODULE SYSTEM @2026</h1>
            <div class="header-sub">Official Printable Module QR Codes for Physical Books & Cards</div>
          </div>
          <div class="cards-grid">
            <!-- Module 1 Card -->
            <div class="card-wrapper">
              <div class="header-tag">Little Bee MPT4 • Module 1</div>
              <div class="title">MODULE 1</div>
              <div class="subtitle">Early Reading & Phonics Foundations</div>
              
              <div class="qr-container">
                <img class="qr-img" src="${url1}" alt="Module 1 QR Code" />
              </div>
              
              <div>
                <div class="code-text">Lb_2026_MPT4_M1_</div>
              </div>
              
              <div class="instructions">
                Scan with Little Bee Camera on 2nd screen to register Module 1.
              </div>
              <div class="cut-guide">
                ✂ Cut along dotted line & paste to Module 1 Book
              </div>
            </div>

            <!-- Module 2 Card -->
            <div class="card-wrapper">
              <div class="header-tag">Little Bee MPT4 • Module 2</div>
              <div class="title">MODULE 2</div>
              <div class="subtitle">Numerical Adventures & Logic Thinking</div>
              
              <div class="qr-container">
                <img class="qr-img" src="${url2}" alt="Module 2 QR Code" />
              </div>
              
              <div>
                <div class="code-text">Lb_2026_MPT4_M2_</div>
              </div>
              
              <div class="instructions">
                Scan with Little Bee Camera on 2nd screen to register Module 2.
              </div>
              <div class="cut-guide">
                ✂ Cut along dotted line & paste to Module 2 Book
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (err) {
    console.error('Error printing dual sheet:', err);
  }
}

export default function PrintableQRCodeCard({
  moduleNumber,
  moduleName,
  moduleSubtitle,
  qrCodeText,
  themeColor,
  themeBg,
}: PrintableQRCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Generate crisp QR code on high-DPI canvas & dataUrl
    QRCode.toDataURL(
      qrCodeText,
      {
        width: 600,
        margin: 2,
        color: {
          dark: '#1E293B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );
  }, [qrCodeText]);

  const handleDownloadPNG = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `LittleBee_Module_${moduleNumber}_QR_${qrCodeText}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintCard = () => {
    if (!dataUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Module ${moduleNumber} QR - Little Bee MPT4 @2026</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
            
            @page {
              size: auto;
              margin: 15mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: #ffffff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              color: #1e293b;
            }
            .card-wrapper {
              width: 320px;
              border: 3px dashed #f59e0b;
              border-radius: 24px;
              padding: 24px;
              text-align: center;
              background: #fffbeb;
              box-sizing: border-box;
              page-break-inside: avoid;
            }
            .header-tag {
              display: inline-block;
              background: #fbbf24;
              color: #78350f;
              font-family: 'Fredoka', sans-serif;
              font-weight: 700;
              font-size: 12px;
              padding: 4px 12px;
              border-radius: 9999px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .title {
              font-family: 'Fredoka', sans-serif;
              font-size: 22px;
              font-weight: 700;
              color: #78350f;
              margin: 4px 0;
            }
            .subtitle {
              font-size: 11px;
              color: #92400e;
              margin-bottom: 16px;
            }
            .qr-container {
              background: #ffffff;
              padding: 12px;
              border-radius: 16px;
              border: 2px solid #fde68a;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .qr-img {
              width: 180px;
              height: 180px;
              display: block;
            }
            .code-text {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              font-weight: 700;
              background: #ffffff;
              border: 1px solid #fde68a;
              color: #78350f;
              padding: 4px 8px;
              border-radius: 8px;
              margin-top: 12px;
              display: inline-block;
            }
            .instructions {
              font-size: 10px;
              color: #78350f;
              margin-top: 12px;
              line-height: 1.4;
            }
            .cut-guide {
              margin-top: 16px;
              font-size: 9px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body {
                min-height: auto;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <div class="header-tag">Little Bee MPT4 • 2026</div>
            <div class="title">${moduleName}</div>
            <div class="subtitle">${moduleSubtitle}</div>
            
            <div class="qr-container">
              <img class="qr-img" src="${dataUrl}" alt="${moduleName} QR Code" />
            </div>
            
            <div>
              <div class="code-text">${qrCodeText}</div>
            </div>
            
            <div class="instructions">
              Scan with Little Bee MPT4 Camera on 2nd screen to unlock lessons.
            </div>
            <div class="cut-guide">
              ✂ Cut along dotted line & paste to ${moduleName} Book
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      id={`printable-qr-card-module-${moduleNumber}`}
      className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between space-y-4 text-slate-200"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase font-['Fredoka',sans-serif] tracking-wider"
              style={{ backgroundColor: themeBg, color: themeColor }}
            >
              MODULE {moduleNumber}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">PRINTABLE QR</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-['Fredoka',sans-serif] mt-1">
            {moduleName}
          </h3>
          <p className="text-xs text-slate-400">{moduleSubtitle}</p>
        </div>

        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[#FBBF24]">
          <QrCode className="w-4 h-4" />
        </div>
      </div>

      {/* QR Code Center Display */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/95 border-2 border-slate-200 text-center shadow-inner">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code for ${moduleName}`}
            className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg transition-transform hover:scale-105 duration-200"
          />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
            Generating QR...
          </div>
        )}

        {/* Code string pill */}
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-800">
          <code className="text-xs font-mono font-bold">{qrCodeText}</code>
          <button
            type="button"
            onClick={handleCopyCode}
            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Copy QR Code string"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Action Buttons: Download PNG & Print Ready Card */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          id={`download-qr-mod${moduleNumber}-btn`}
          type="button"
          onClick={handleDownloadPNG}
          className="py-2.5 px-3 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#78350F] font-bold text-xs font-['Fredoka',sans-serif] tracking-wide flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>DOWNLOAD PNG</span>
        </button>

        <button
          id={`print-qr-mod${moduleNumber}-btn`}
          type="button"
          onClick={handlePrintCard}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-bold text-xs font-['Fredoka',sans-serif] tracking-wide flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-amber-400" />
          <span>PRINT CARD</span>
        </button>
      </div>
    </div>
  );
}
