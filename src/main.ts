import 'dotenv/config';
import './moduleAlias';
import App from './app';
import logger from './common/utils/logger';

const startServer = async () => {
  try {
    logger.info('🚀 Starting cms Backend...');
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔧 Node Version: ${process.version}`);

    const app = new App();
    await app.listen();
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
