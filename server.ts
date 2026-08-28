import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let ai: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// Unified API grader
app.post('/api/grade', async (req, res) => {
  const { studentAnswer, maxMarks, questionText, passageParagraphs } = req.body;

  if (!studentAnswer || !studentAnswer.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Jawapan murid tidak boleh kosong.',
    });
  }

  // Calculate local fallback values first
  const words = studentAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const isUnderLimit = wordCount <= 30;
  const lowerAnswer = studentAnswer.toLowerCase();
  
  let score = 0;
  let feedback = '';
  let correctedVersion = 'Usaha yang boleh dicontohi ialah membantu mengemas rumah supaya dapat meringankan beban ibu bapa.';

  // Attempt to use Gemini if API key is provided
  const aiClient = getGeminiAI();
  if (aiClient) {
    try {
      const prompt = `
Anda adalah seorang guru pakar Bahasa Melayu Sekolah Rendah (SJKC/SK). Tugas anda adalah menilai jawapan murid bagi soalan pemahaman atau penulisan ringkas (Bahagian B).

MAKLUMAT SOALAN:
- Perenggan Rujukan: ${JSON.stringify(passageParagraphs)}
- Teks Soalan: ${questionText}
- Had Perkataan: Maksimum 30 patah perkataan.
- Markah Maksimum: ${maxMarks || 5}
- Jawapan Murid: "${studentAnswer}"

KRITERIA PENILAIAN BAHASA MELAYU BAHAGIAN B (Ulasan Ringkas / Pemahaman):
1. Mengandungi usaha/isi yang betul dan relevan dengan petikan/soalan.
2. Mengandungi sebab/alasan/huraian yang logik (menggunakan kata hubung seperti 'supaya', 'kerana', 'agar', dll).
3. Tatabahasa yang betul dan ayat yang lengkap (bukan sekadar frasa).
4. Mematuhi had perkataan (maksimum 30 perkataan). Jika melebihi 30 perkataan, markah harus ditolak.

Sila berikan maklum balas dalam format JSON berikut sahaja:
{
  "score": <nilai_integer_antara_0_hingga_maxMarks>,
  "feedback": "<maklum balas membina dalam Bahasa Melayu>",
  "correctedVersion": "<versi jawapan yang dimurnikan tatabahasanya dan huraiannya dalam had 30 perkataan>"
}
`;
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({
          success: true,
          score: Math.min(parsed.score ?? 0, maxMarks || 5),
          feedback: parsed.feedback || '',
          wordCount,
          correctedVersion: parsed.correctedVersion || studentAnswer,
        });
      }
    } catch (err) {
      console.error('Gemini grading failed, falling back to local grading:', err);
    }
  }

  // --- PROGRAMMATIC LOCAL FALLBACK GRADER ---
  const hasEffort = /membantu|mengemas|kopi|sopan|nasihat|hormati|jaga|sayang|patuh|dengar|rajin/i.test(lowerAnswer);
  const hasReason = /supaya|kerana|sebab|agar|untuk|bagi|demi/i.test(lowerAnswer);

  if (hasEffort) score += 2;
  if (hasReason) score += 2;
  if (isUnderLimit && (hasEffort || hasReason)) score += 1;

  if (wordCount > 30) {
    feedback = 'Jawapan anda melebihi had 30 patah perkataan. Sila ringkaskan jawapan anda.';
    score = Math.max(1, score - 2);
  } else if (score === 5) {
    feedback = 'Cemerlang! Jawapan anda lengkap mengandungi usaha, sebab, dan mematuhi had perkataan.';
  } else {
    feedback = 'Jawapan yang baik, tetapi pastikan anda menyatakan usaha yang jelas (seperti membantu mengemas rumah atau bercakap sopan) berserta sebabnya dalam lingkungan 30 perkataan.';
  }

  return res.json({
    success: true,
    score,
    feedback,
    wordCount,
    correctedVersion,
  });
});

// Setup Vite Dev Server / Static Asset Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
