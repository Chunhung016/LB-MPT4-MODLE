import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// API: Programmatic local grader fallback (no Gemini AI needed)
app.post('/api/grade', (req, res) => {
  const { studentAnswer, maxMarks } = req.body;

  if (!studentAnswer || !studentAnswer.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Jawapan murid tidak boleh kosong.',
    });
  }

  const words = studentAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const isUnderLimit = wordCount <= 30;
  const lowerAnswer = studentAnswer.toLowerCase();
  let score = 0;
  let feedback = '';

  const hasEffort = /membantu|mengemas|kopi|sopan|nasihat|hormati/i.test(lowerAnswer);
  const hasReason = /supaya|kerana|sebab|agar/i.test(lowerAnswer);

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
    correctedVersion: 'Usaha yang boleh dicontohi ialah membantu mengemas rumah supaya dapat meringankan beban ibu bapa.',
  });
});

// Setup Vite or Static File Serving
async function setupServer() {
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

setupServer();

