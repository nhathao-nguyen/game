# Tu Tiên Backend — Auth API

Node.js + Express + PostgreSQL authentication backend.

## Cấu trúc project

```
backend/
├── src/
│   ├── config/env.js           # Đọc & validate biến môi trường
│   ├── db/
│   │   ├── database.js         # PostgreSQL pool
│   │   └── migrations.js       # Tạo bảng tự động khi khởi động
│   ├── repositories/
│   │   └── user.repository.js  # Data layer (SQL queries)
│   ├── services/
│   │   └── auth.service.js     # Business logic
│   ├── controllers/
│   │   └── auth.controller.js  # HTTP layer
│   ├── routes/
│   │   ├── index.js            # Root router
│   │   └── auth.routes.js      # /auth/* routes + validation
│   ├── middlewares/
│   │   └── errorHandler.js     # Global error handler
│   └── app.js                  # Express app factory
└── server.js                   # Entry point
```

## Chạy local

### 1. Cài đặt PostgreSQL

Cài [PostgreSQL](https://www.postgresql.org/download/) và tạo database:

```sql
CREATE DATABASE tutien_db;
```

### 2. Tạo file `.env`

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/tutien_db
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### 3. Cài dependencies & chạy

```bash
cd backend
npm install
npm run dev    # development (nodemon, auto-reload)
# hoặc
npm start      # production
```

Server tự động tạo bảng `users` khi khởi động.

## Endpoints

### GET /health
```bash
curl http://localhost:3000/health
```
```json
{ "success": true, "status": "ok", "timestamp": "...", "uptime": 5 }
```

### POST /auth/register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"nhathao","email":"nhathao@example.com","password":"Secret123"}'
```
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "token": "<JWT>",
    "user": { "id": 1, "username": "nhathao", "email": "nhathao@example.com", "created_at": "..." }
  }
}
```

### POST /auth/login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nhathao@example.com","password":"Secret123"}'
```
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "<JWT>",
    "user": { "id": 1, "username": "nhathao", "email": "nhathao@example.com" }
  }
}
```

## Deploy lên Render

1. Push code lên GitHub (đảm bảo `backend/` folder có trong repo)
2. Vào [render.com](https://render.com) → **New → Blueprint**
3. Chọn repo → Render sẽ đọc `render.yaml` tự động
4. Render sẽ:
   - Tạo free PostgreSQL database (`tutien-postgres`)
   - Tạo Web Service, inject `DATABASE_URL` và generate `JWT_SECRET`
   - Build & deploy tự động

> **Lưu ý**: Free PostgreSQL trên Render hết hạn sau **90 ngày** nếu không có activity.

## Biến môi trường trên Render

| Biến | Mô tả |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Auto-inject từ PostgreSQL service |
| `JWT_SECRET` | Auto-generated |
| `JWT_EXPIRES_IN` | `7d` |
| `BCRYPT_SALT_ROUNDS` | `10` |

## Sử dụng JWT trong React Native

```javascript
// Sau khi login, lưu token:
await AsyncStorage.setItem('token', data.token);

// Gọi API có bảo vệ:
const token = await AsyncStorage.getItem('token');
fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
});
```
