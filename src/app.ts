import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from './config/swagger.config';
import envConfig from './config/env.config';
import { loggerMiddleware } from './middleware/logger.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import {
  sanitizeInput,
  preventNoSQLInjection,
  detectSQLInjection,
} from './middleware/sanitization.middleware';
import { errorHandler } from './common/utils/errors';
import prismaService from './core/database/prisma.service';
import redisService from './core/redis/redis.service';
import logger from './common/utils/logger';

// Import routes
import apiRoutes from './routes';

class App {
  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = envConfig.get('PORT');

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());
    // CORS
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
      })
    );

    // Compression
    this.app.use(compression());

    // Cookie parser
    this.app.use(cookieParser());

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Security: Input sanitization (XSS, SQL, NoSQL injection prevention)
    this.app.use(sanitizeInput);
    this.app.use(preventNoSQLInjection);
    this.app.use(detectSQLInjection);

    // Strip empty query params
    this.app.use((req, _res, next) => {
      if (req.query) {
        Object.keys(req.query).forEach((key) => {
          if (req.query[key] === '') {
            delete req.query[key];
          }
        });
      }
      next();
    });

    // Logger
    this.app.use(loggerMiddleware);

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', async (_req, res) => {
      const healthStatus: any = {
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        services: {
          server: {
            status: 'healthy',
            uptime: process.uptime(),
          },
          database: {
            status: 'unknown',
            message: '',
          },
          redis: {
            status: 'unknown',
            message: '',
          },
        },
      };

      // Check PostgreSQL database
      try {
        await prismaService.$queryRaw`SELECT 1`;
        healthStatus.services.database.status = 'healthy';
        healthStatus.services.database.message = 'Database connection is active';
      } catch (error: any) {
        healthStatus.success = false;
        healthStatus.services.database.status = 'unhealthy';
        healthStatus.services.database.message = error.message || 'Database connection failed';
      }

      // Check Redis
      try {
        const redisClient = redisService.getClient();
        const isRedisConnected = redisClient.isOpen && redisClient.isReady;

        if (isRedisConnected) {
          // Try to ping Redis
          await redisClient.ping();
          healthStatus.services.redis.status = 'healthy';
          healthStatus.services.redis.message = 'Redis connection is active';
        } else {
          healthStatus.services.redis.status = 'disconnected';
          healthStatus.services.redis.message = 'Redis is not connected (running without cache)';
        }
      } catch (error: any) {
        healthStatus.services.redis.status = 'unhealthy';
        healthStatus.services.redis.message = error.message || 'Redis connection failed';
      }

      // Set HTTP status code based on overall health
      const statusCode = healthStatus.success ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    });

    // API routes (all routes are now managed in src/routes/)
    this.app.use('/api', apiRoutes);

    // 404 handler
    this.app.use('*', (_req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async connectDatabase(): Promise<void> {
    try {
      await prismaService.onModuleInit();
      await prismaService.enableShutdownHooks();
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      process.exit(1);
    }
  }

  private async connectRedis(): Promise<void> {
    // Redis service now handles its own connection errors and will fallback gracefully
    await redisService.connect();
  }

  public async listen(): Promise<void> {
    // Connect to database and redis
    await this.connectDatabase();
    await this.connectRedis();

    const server = this.app.listen(this.port, () => {
      logger.info(`✅ Server is running on port ${this.port}`);
      logger.info(`📚 API Docs available at http://localhost:${this.port}/api-docs`);
      logger.info(`🌍 Environment: ${envConfig.get('NODE_ENV')}`);
      logger.info(`🎯 Ready to accept connections`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async (err) => {
        if (err) {
          logger.error('Error closing server:', err);
        } else {
          logger.info('✅ Server closed');
        }

        try {
          // Close database connections
          logger.info('Closing database connections...');
          await prismaService.onModuleDestroy();

          // Close Redis connections
          logger.info('Closing Redis connections...');
          await redisService.disconnect();

          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

export default App;
