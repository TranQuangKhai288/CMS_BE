// Test setup file
// Runs before all tests

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/cms_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '1'; // Use different DB for tests
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Mock external services
jest.mock('@core/redis/redis.service', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    getJSON: jest.fn(),
    setJSON: jest.fn(),
    exists: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));

jest.mock('@core/email/email.service', () => ({
  __esModule: true,
  default: {
    send: jest.fn(() => Promise.resolve(true)),
    sendWelcomeEmail: jest.fn(() => Promise.resolve(true)),
    sendPasswordResetEmail: jest.fn(() => Promise.resolve(true)),
    sendOrderConfirmation: jest.fn(() => Promise.resolve(true)),
    verify: jest.fn(() => Promise.resolve(true)),
  },
}));

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
