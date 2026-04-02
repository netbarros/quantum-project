import app from './app';
import { config } from './config';
import { prisma } from './config/database';
import { startInactivityChecker } from './jobs/inactivityChecker';
import { logger } from './lib/logger';

const PORT = config.PORT;

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connection established');
    startInactivityChecker();
  } catch (err) {
    logger.error({ err }, 'Failed to connect to the database');
    process.exit(1);
  }


  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server running');
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    server.close(() => {
      logger.info('Closed on SIGINT');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    server.close(() => {
      logger.info('Closed on SIGTERM');
      process.exit(0);
    });
  });
}

main();
