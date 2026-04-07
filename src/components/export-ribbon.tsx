'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconFileExport, 
  IconFileTypePdf, 
  IconFileText, 
  IconChevronRight,
  IconLoader
} from '@tabler/icons-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Font injection ───────────────────────────────────────────────────────────
const FONT_LINK_ID = 'bookbuddy-export-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700' +
  '&family=Noto+Sans+Sinhala:wght@400;700' +
  '&family=Inter:wght@400;600;700&display=swap';

function injectFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = FONT_HREF;
  document.head.appendChild(link);
}

// ─── html2canvas helper ───────────────────────────────────────────────────────
async function captureElementToPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 400));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const MARGIN   = 36;
  const PW       = 595.28;
  const PH       = 841.89;
  const CONTENT_W = PW - MARGIN * 2;
  const CONTENT_H = PH - MARGIN * 2;

  const scale = CONTENT_W / canvas.width;
  const pagePixels = Math.floor(CONTENT_H / scale);

  const doc = new jsPDF('p', 'pt', 'a4');
  let srcY = 0;

  while (srcY < canvas.height) {
    if (srcY > 0) doc.addPage();

    const sliceH = Math.min(pagePixels, canvas.height - srcY);

    const slice = document.createElement('canvas');
    slice.width  = canvas.width;
    slice.height = sliceH;
    const ctx = slice.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    const imgData = slice.toDataURL('image/jpeg', 0.97);
    doc.addImage(imgData, 'JPEG', MARGIN, MARGIN, CONTENT_W, sliceH * scale);

    const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text(`${filename.replace('.pdf', '')}  |  Page ${pageNum}`, PW / 2, PH - 14, { align: 'center' });

    srcY += pagePixels;
  }

  doc.save(filename);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ExportRibbonProps {
  title: string;
  author?: string | null;
  vocab: any[];
  notes?: string | null;
  isChatOpen?: boolean;
}

export default function ExportRibbon({ title, author, vocab, notes, isChatOpen }: ExportRibbonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const springTransition = { type: 'spring' as const, damping: 25, stiffness: 200 };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hasNotes = notes && notes.trim().length > 0;

  // ── Translation → PDF ──────────────────────────────────────────────────────
  const exportTranslationsPDF = async () => {
    setIsExporting('pdf-trans');
    injectFonts();

    // ... internal PDF generation logic remains same ...
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 794px;
      background: #ffffff;
      font-family: 'Inter', sans-serif;
      color: #111827;
      padding: 48px 52px;
      box-sizing: border-box;
    `;

    wrapper.innerHTML = `
      <div style="margin-bottom:0;">
        <img src="/footer.png" crossorigin="anonymous" style="width:20%;height:auto;display:block;margin-bottom:18px;border-radius:6px;" />
        <div style="font-size:10px;color:#6b7280;line-height:1.7;margin-bottom:14px;">
          <span style="font-weight:600;color:#10175b;">Subject:</span> ${title}&nbsp;&nbsp;
          <span style="font-weight:600;color:#10175b;">Exported:</span> ${new Date().toLocaleDateString()}
        </div>
      </div>
      <div style="height:1.5px;background:#10175b;opacity:0.15;margin-bottom:18px;"></div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="background:#10175b;color:#fff;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;">Source Text</th>
            <th style="padding:10px 12px;text-align:left;font-weight:600;">Deciphered Text</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;width:52px;">Page</th>
          </tr>
        </thead>
        <tbody>
          ${vocab.map((item, i) => `
            <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f9fc'};">
              <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${item.originalText || ''}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;font-family:'Noto Sans Tamil','Noto Sans Sinhala','Inter',sans-serif;font-size:13px;color:#111827;">${item.translatedText || ''}</td>
              <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;">${item.pageNumber || '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:28px;font-size:8px;color:#9ca3af;text-align:center;">Generated by BookBuddy</div>
    `;

    document.body.appendChild(wrapper);
    try {
      await captureElementToPDF(wrapper, `${title.slice(0, 20)}_Translations.pdf`);
    } finally {
      document.body.removeChild(wrapper);
      setIsExporting(null);
    }
  };

  const exportNotesPDF = async () => {
    if (!hasNotes) return;
    setIsExporting('pdf-notes');
    injectFonts();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 794px;
      background: #ffffff;
      font-family: 'Inter', sans-serif;
      color: #111827;
      padding: 52px;
      box-sizing: border-box;
    `;

    wrapper.innerHTML = `
      <div style="margin-bottom:28px;">
        <div style="font-size:9px;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">BookBuddy · Reading Notes</div>
        <h1 style="font-size:30px;color:#10175b;margin:0 0 8px;font-family:Georgia,serif;">${title}</h1>
        <div style="font-size:12px;color:#6b7280;">by ${author || 'Unknown'} &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</div>
      </div>
      <div style="height:1.5px;background:#10175b;opacity:0.15;margin-bottom:28px;"></div>
      <div style="font-size:13px;line-height:1.9;color:#374151;font-family:'Noto Sans Tamil','Noto Sans Sinhala','Inter',sans-serif;white-space:pre-wrap;">${notes}</div>
    `;

    document.body.appendChild(wrapper);
    try {
      await captureElementToPDF(wrapper, `${title.slice(0, 20)}_Notes.pdf`);
    } finally {
      document.body.removeChild(wrapper);
      setIsExporting(null);
    }
  };

  // Close ribbon if chat opens
  useEffect(() => {
    if (isChatOpen) {
      setIsOpen(false);
    }
  }, [isChatOpen]);

  return (
    <div className="fixed right-0 top-44 z-40 flex items-center" ref={containerRef}>
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 144 : 48 }}
        transition={springTransition}
        className="flex items-center bg-[#10175b] shadow-2xl rounded-l-2xl overflow-hidden h-12"
      >
        {/* Leftmost Slot: Export Handle (Closed) / Close Arrow (Open) */}
        {/* Pinned to the left boundary, so it travels with the expanding/shrinking edge naturally */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 shrink-0 flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors outline-none"
          title={isOpen ? "Close" : "Export Archive"}
        >
          {isOpen ? <IconChevronRight size={22} strokeWidth={2.5} /> : <IconFileExport size={22} />}
        </button>

        <div className="w-[1px] h-6 bg-white/10 shrink-0" />

        {/* Middle Slot: PDF Translation */}
        <button
          onClick={exportTranslationsPDF}
          disabled={vocab.length === 0 || isExporting !== null}
          className="w-[47px] h-12 shrink-0 flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors disabled:opacity-30 outline-none"
          title="PDF Translation"
        >
          {isExporting === 'pdf-trans' ? (
            <IconLoader className="animate-spin w-5 h-5 shrink-0" />
          ) : (
            <IconFileTypePdf className="w-5 h-5 shrink-0" />
          )}
        </button>

        <div className="w-[1px] h-6 bg-white/10 shrink-0" />

        {/* Right Slot: PDF Notes */}
        <button
          onClick={exportNotesPDF}
          disabled={!hasNotes || isExporting !== null}
          className="w-[47px] h-12 shrink-0 flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors disabled:opacity-30 outline-none"
          title="PDF Notes"
        >
          {isExporting === 'pdf-notes' ? (
            <IconLoader className="animate-spin w-5 h-5 shrink-0" />
          ) : (
            <IconFileText className="w-5 h-5 shrink-0" />
          )}
        </button>
      </motion.div>
    </div>
  );
}
