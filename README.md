# E-commerce Admin CMS Backend

Backend API cho hệ thống quản lý Admin CMS cho các website bán hàng.

## 🚀 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL với Prisma ORM
- **Cache**: Redis
- **Storage**: Supabase Storage
- **Authentication**: JWT (không dùng Passport.js)
- **Documentation**: Swagger/OpenAPI
- **Architecture**: Modular + Event-Driven

## 📋 Features

- ✅ JWT Authentication & Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Dynamic Product Attributes với JSONB
- ✅ Event-Driven Architecture
- ✅ Rate Limiting
- ✅ Request Validation
- ✅ Swagger API Documentation
- ✅ Centralized Error Handling
- ✅ Winston Logger
- ✅ Redis Caching
- ✅ Supabase File Upload

## 📁 Project Structure

```
cms_BE/
├── src/
│   ├── config/           # Configuration files
│   ├── common/           # Shared utilities, guards, constants
│   ├── core/             # Core services (Prisma, Redis, Storage, Events)
│   ├── middleware/       # Express middlewares
│   ├── modules/          # Feature modules
│   │   └── auth/         # Authentication module
│   ├── app.ts            # Express app setup
│   └── main.ts           # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── package.json
```

## 🛠️ Installation

### Option 1: Docker (Recommended - Nhanh nhất)

#### 1. Clone repository

```bash
git clone <repo-url>
cd cms_BE
```

#### 2. Start PostgreSQL và Redis với Docker

```bash
# Start PostgreSQL và Redis
npm run docker:up

# Kiểm tra logs
npm run docker:logs
```

Docker sẽ tự động khởi chạy:

- **PostgreSQL**: `localhost:5432`
  - User: `postgres`
  - Password: `postgres123`
  - Database: `cms_db`
- **Redis**: `localhost:6379`
  - Password: `redis123`
- **pgAdmin** (Optional): `http://localhost:5050`
  - Email: `admin@admin.com`
  - Password: `admin123`
- **Redis Commander** (Optional): `http://localhost:8081`

#### 3. Install dependencies

```bash
npm install
```

#### 4. Setup environment

```bash
cp .env.example .env
```

File `.env` đã được cấu hình sẵn cho Docker. Chỉ cần cập nhật:

- `JWT_SECRET`, `JWT_REFRESH_SECRET`: JWT secrets (bắt buộc thay đổi)
- `SUPABASE_URL`, `SUPABASE_KEY`: Supabase credentials (nếu dùng file upload)

#### 5. Setup database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

#### 6. Start development server

```bash
npm run dev
```

### Option 2: Manual Setup (Không dùng Docker)

Nếu bạn muốn cài đặt PostgreSQL và Redis thủ công:

#### 1. Cài đặt PostgreSQL và Redis

- Tải và cài đặt PostgreSQL từ: https://www.postgresql.org/download/
- Tải và cài đặt Redis từ: https://redis.io/download/

#### 2. Clone và install

```bash
git clone <repo-url>
cd cms_BE
npm install
```

#### 3. Setup environment

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis configuration
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: JWT secrets
- `SUPABASE_URL`, `SUPABASE_KEY`: Supabase credentials

#### 4. Setup database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 🚀 Running the Application

### Development mode

```bash
npm run dev
```

### Production build

```bash
npm run build
npm start
```

### Docker commands

```bash
# Start PostgreSQL & Redis
npm run docker:up

# Stop containers
npm run docker:down

# View logs
npm run docker:logs

# Restart containers
npm run docker:restart

# Remove containers and volumes
npm run docker:clean

# Build and run full stack (với app)
npm run docker:build
npm run docker:full
```

### Database commands

```bash
# Open Prisma Studio
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

## 📚 API Documentation

Sau khi chạy server, truy cập Swagger documentation tại:

```
http://localhost:5000/api-docs
```

## 🔐 Default Credentials

Sau khi seed database, bạn có thể login với:

- **Email**: admin@example.com
- **Password**: Admin@123

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Đăng ký user mới
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Đăng xuất
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại
- `POST /api/v1/auth/change-password` - Đổi mật khẩu

### Health Check

- `GET /health` - Server health check

## 🏗️ Database Schema

### Key Models

- **Users & Roles**: Quản lý user và phân quyền
- **Categories**: Danh mục sản phẩm (hỗ trợ nested)
- **Products**: Sản phẩm với dynamic attributes (JSONB)
- **Product Variants**: Biến thể sản phẩm
- **Orders**: Đơn hàng
- **Customers**: Khách hàng
- **Inventory**: Quản lý tồn kho
- **Discounts**: Mã giảm giá
- **Media**: Quản lý file/media
- **Pages**: Content management
- **Settings**: Cấu hình hệ thống

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 📝 Next Steps

Các module cần triển khai tiếp theo:

1. ✅ Auth Module (Completed)
2. Users Module
3. Roles Module
4. Categories Module
5. Products Module
6. Orders Module
7. Customers Module
8. Inventory Module
9. Discounts Module
10. Media Module
11. Content Module
12. Settings Module
13. Analytics Module

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT
