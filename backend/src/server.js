import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

const PORT = process.env.PORT || 4000;
const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

createApp().listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
