import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.routes';
import reportsRouter from './routes/reports.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({
  origin: (origin, callback) => {
    // Permite: sem origin (Postman/curl), localhost Expo, IPs locais Expo Go
    if (
      !origin ||
      origin === 'http://localhost:19000' ||
      origin === 'http://localhost:19006' ||
      /^exp:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido para esta origem'));
    }
  },
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/v1/auth', authRouter);
app.use('/v1/reports', reportsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
