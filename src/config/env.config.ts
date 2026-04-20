import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface EnvConfig {
  // App
  NODE_ENV: string;
  PORT: number;
  API_PREFIX: string;

  // Database
  DATABASE_URL: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Supabase
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SUPABASE_STORAGE_BUCKET: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // CORS
  CORS_ORIGIN: string;

  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;

  // Upload
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string;

  // Pagination
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;

  // Logging
  LOG_LEVEL: string;
}

class EnvConfigService {
  private config: EnvConfig;

  constructor() {
    this.config = {
      // App
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: parseInt(process.env.PORT || '5000'),
      API_PREFIX: process.env.API_PREFIX || '/api/v1',

      // Database
      DATABASE_URL: process.env.DATABASE_URL || '',

      // Redis
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_DB: parseInt(process.env.REDIS_DB || '0'),

      // JWT
      JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-this',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this',
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

      // Supabase
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_KEY: process.env.SUPABASE_KEY || '',
      SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'cms-uploads',

      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

      // CORS
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

      // Email
      SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
      SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
      SMTP_SECURE: process.env.SMTP_SECURE === 'true',
      SMTP_USER: process.env.SMTP_USER || '',
      SMTP_PASS: process.env.SMTP_PASS || '',
      EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@example.com',

      // Upload
      MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
      ALLOWED_FILE_TYPES:
        process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif',

      // Pagination
      DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '20'),
      MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100'),

      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    };

    this.validate();
  }

  private validate() {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

    for (const key of required) {
      if (!this.config[key as keyof EnvConfig]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  getAll(): EnvConfig {
    return { ...this.config };
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}

export default new EnvConfigService();
