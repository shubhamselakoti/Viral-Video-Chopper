import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';
import clipRouter from './routes/clip.js';
import uploadClipRouter from './routes/upload-clip.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Large body limit for JSON; multipart handled by multer in route
app.use(express.json({ limit: '10mb' }));

app.use('/api', analyzeRouter);
app.use('/api', clipRouter);
app.use('/api', uploadClipRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`✂️  VVC API on :${PORT}`));
