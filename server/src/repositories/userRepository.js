const { randomUUID } = require('crypto');

const mapUserRow = (row) => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  createdAt: row.created_at
});

const createUserRepository = (database) => ({
  async findByEmail(email) {
    const result = await database.query(
      `
        SELECT id, email, password_hash, created_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  },

  async create({ email, passwordHash }) {
    try {
      const result = await database.query(
        `
          INSERT INTO users (id, email, password_hash)
          VALUES ($1, $2, $3)
          RETURNING id, email, password_hash, created_at
        `,
        [randomUUID(), email, passwordHash]
      );

      return mapUserRow(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        const duplicateError = new Error('Email is already registered');
        duplicateError.code = 'USER_EMAIL_EXISTS';
        throw duplicateError;
      }

      throw error;
    }
  }
});

module.exports = createUserRepository;
