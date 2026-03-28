import app from './app';
import { config } from './config';
import { prisma } from './config/database';
import { startInactivityChecker } from './jobs/inactivityChecker';

const PORT = config.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log('[server] Database connection established.');
    startInactivityChecker();
  } catch (err) {
    console.error('[server] Failed to connect to the database:', err);
    process.exit(1);
  }


  const server = app.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    server.close(() => {
      console.log('[server] Closed on SIGINT.');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    server.close(() => {
      console.log('[server] Closed on SIGTERM.');
      process.exit(0);
    });
  });
}

main();
