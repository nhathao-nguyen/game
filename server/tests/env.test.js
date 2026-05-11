const originalEnv = process.env;

const loadConfig = (overrides = {}, removedKeys = []) => {
  jest.resetModules();
  process.env = { ...originalEnv, ...overrides };

  removedKeys.forEach((key) => {
    delete process.env[key];
  });

  return require('../src/config/env');
};

describe('environment config', () => {
  afterAll(() => {
    process.env = originalEnv;
  });

  test('production validation rejects missing required variables', () => {
    const config = loadConfig(
      {
        NODE_ENV: 'production'
      },
      ['PORT', 'DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN']
    );

    expect(() => config.validateRuntimeConfig()).toThrow(
      'Missing required environment variables: PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN'
    );
  });

  test('production validation accepts required variables', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      DATABASE_URL: 'postgres://user:pass@example.com:5432/app',
      JWT_SECRET: 'production-secret-with-enough-length',
      CORS_ORIGIN: 'https://example.com'
    });

    expect(config.port).toBe(8080);
    expect(config.databaseUrl).toBe('postgres://user:pass@example.com:5432/app');
    expect(config.jwtSecret).toBe('production-secret-with-enough-length');
    expect(config.corsOrigin).toEqual(['https://example.com']);
    expect(() => config.validateRuntimeConfig()).not.toThrow();
  });

  test('development keeps local defaults for non-secret runtime values', () => {
    const config = loadConfig(
      {
        NODE_ENV: 'development'
      },
      ['PORT', 'DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN']
    );

    expect(config.port).toBe(3000);
    expect(config.apiPrefix).toBe('/api/v1');
    expect(() => config.validateRuntimeConfig()).not.toThrow();
  });
});
