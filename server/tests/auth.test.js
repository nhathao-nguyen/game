const request = require('supertest');
const { createApp } = require('../src/createApp');

const createFakeUserRepository = () => {
  const usersByEmail = new Map();

  return {
    usersByEmail,
    async findByEmail(email) {
      return usersByEmail.get(email) || null;
    },
    async create({ email, passwordHash }) {
      if (usersByEmail.has(email)) {
        const error = new Error('Email is already registered');
        error.code = 'USER_EMAIL_EXISTS';
        throw error;
      }

      const user = {
        id: `user-${usersByEmail.size + 1}`,
        email,
        passwordHash,
        createdAt: new Date().toISOString()
      };

      usersByEmail.set(email, user);

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      };
    }
  };
};

describe('auth endpoints', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-with-enough-length';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.NODE_ENV = 'test';
  });

  test('POST /auth/register creates a user, hashes password, and returns a token', async () => {
    const userRepository = createFakeUserRepository();
    const app = createApp({ userRepository });

    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'Player@Example.com', password: 'password123' })
      .expect(201)
      .expect('Content-Type', /json/);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual({
      id: 'user-1',
      email: 'player@example.com'
    });
    expect(response.body.data.token).toEqual(expect.any(String));

    const storedUser = userRepository.usersByEmail.get('player@example.com');
    expect(storedUser.passwordHash).toEqual(expect.any(String));
    expect(storedUser.passwordHash).not.toBe('password123');
  });

  test('POST /auth/register rejects duplicate email addresses', async () => {
    const userRepository = createFakeUserRepository();
    const app = createApp({ userRepository });

    await request(app)
      .post('/auth/register')
      .send({ email: 'player@example.com', password: 'password123' })
      .expect(201);

    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'player@example.com', password: 'password123' })
      .expect(409);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        message: 'Email is already registered'
      }
    });
  });

  test('POST /auth/login returns a token for valid credentials', async () => {
    const userRepository = createFakeUserRepository();
    const app = createApp({ userRepository });

    await request(app)
      .post('/auth/register')
      .send({ email: 'player@example.com', password: 'password123' })
      .expect(201);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'player@example.com', password: 'password123' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual({
      id: 'user-1',
      email: 'player@example.com'
    });
    expect(response.body.data.token).toEqual(expect.any(String));
  });

  test('POST /auth/login rejects invalid credentials', async () => {
    const userRepository = createFakeUserRepository();
    const app = createApp({ userRepository });

    await request(app)
      .post('/auth/register')
      .send({ email: 'player@example.com', password: 'password123' })
      .expect(201);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'player@example.com', password: 'wrong-password' })
      .expect(401);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        message: 'Invalid email or password'
      }
    });
  });

  test('auth endpoints validate email and password input', async () => {
    const userRepository = createFakeUserRepository();
    const app = createApp({ userRepository });

    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        message: 'Email must be a valid email address'
      }
    });
  });
});
