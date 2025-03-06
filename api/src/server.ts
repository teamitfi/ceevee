import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});