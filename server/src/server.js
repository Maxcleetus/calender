import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
if (!process.env.MONGO_URI) {
  dotenv.config({ path: '.env.example' });
}

const app = express();

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'priest-booking-api' });
});

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI. Add it to server/.env or server/.env.example');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Keep API available even if DB is temporarily unavailable.
connectDB(process.env.MONGO_URI).then((connected) => {
  if (!connected) {
    console.log('Retrying MongoDB connection in 10 seconds...');
    const retryTimer = setInterval(async () => {
      const ok = await connectDB(process.env.MONGO_URI);
      if (ok) {
        console.log('MongoDB reconnected');
        clearInterval(retryTimer);
      }
    }, 10000);
  }
});
