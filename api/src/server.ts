import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// Listen for nodemon restart signal
process.once('SIGUSR2', () => {
  console.log("SIGUSR2 received. Closing server gracefully...");
  server.close(() => {
    console.log("Server closed, ready for restart");
    process.kill(process.pid, 'SIGUSR2');
  });
});