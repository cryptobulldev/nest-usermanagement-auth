## 🧱 NestJS SOLID Auth API

A clean, scalable NestJS backend implementing SOLID principles, JWT + Refresh Token Authentication, and full tooling for code quality and testing.

## 🚀 Features

✅ Clean Architecture (SOLID + Modular)
  - Repository interfaces decouple services from database implementation
  - Each module has single responsibility
  - Fully testable and maintainable

✅ Authentication System (JWT + Refresh)
  - Access (15 min) and Refresh (7 days) tokens
  - Password hashing via bcrypt through hash.util.ts
  - Secure refresh token persistence

✅ Tooling & Developer Experience
  - ESLint + Prettier + Husky + Lint-Staged
  - Jest for Unit and E2E testing
  - TypeScript strict mode
  - Centralized configuration via @nestjs/config

✅ Database Agnostic
  - Works with PostgreSQL or MongoDB
  - Swappable repository pattern

## 📁 Folder Structure

```
nestjs-solid-auth-demo/
├── jest.config.ts
├── package.json
├── test/
│   ├── jest-e2e.json
│   ├── app.e2e-spec.ts
│   └── auth.e2e-spec.ts
└── src/
    ├── app.module.ts
    ├── common/
    │   └── utils/
    │       └── hash.util.ts
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   ├── auth.service.spec.ts
    │   ├── auth.controller.ts
    │   └── interfaces/
    ├── users/
    │   ├── users.module.ts
    │   ├── users.service.ts
    │   ├── users.service.spec.ts
    │   ├── repositories/
    │   ├── dto/
    │   └── entities/
    └── main.ts
```

## ⚙️ Environment Setup

```bash

PORT=3000

# Database
DB_HOST=localhost
DB_PORT=27017
DB_USER=
DB_PASS=
DB_NAME=nestjs_solid_auth

# JWT
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=refreshsupersecret

```
If using PostgreSQL:

```bash

DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=nestjs_solid_auth

```

## 🧩 Installation

```bash

git clone https://github.com/<your-username>/nestjs-solid-auth-demo.git
cd nestjs-solid-auth-demo
npm install

```

## ▶️ Running the App

```bash

# Development
npm run start:dev

# Production
npm run build && npm run start:prod

```
Visit → http://localhost:3000


## 🔐 Auth Endpoints

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| `POST` | `/auth/register` | Register new user            |
| `POST` | `/auth/login`    | Login user and return tokens |
| `POST` | `/auth/refresh`  | Refresh tokens               |

Example – Register

```bash

POST /auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPass123",
  "name": "John Doe"
}

```

Example – Login Response

```bash

{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1..."
}

```

## 👤 User Management Endpoints

| Method   | Endpoint              | Description                                         |
| -------- | --------------------- | --------------------------------------------------- |
| `GET`    | `/users`              | Get all users *(admin only, optional)*              |
| `GET`    | `/users/:id`          | Get user by ID                                      |
| `GET`    | `/users/email/:email` | Find user by email                                  |
| `PATCH`  | `/users/:id`          | Update user details (rehashes password if provided) |
| `DELETE` | `/users/:id`          | Delete user (soft or hard delete)                   |


Example – Update User

```bash

PATCH /users/1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Updated Name",
  "password": "NewPassword123"
}

```

## 🧪 Testing

Unit Tests (inside modules)

```bash

src/auth/auth.service.spec.ts
src/users/users.service.spec.ts

```

E2E Tests

```bash

test/app.e2e-spec.ts
test/auth.e2e-spec.ts

```

Run:

```bash

npm run test       # Unit tests
npm run test:e2e   # E2E tests
npm run test:cov   # Coverage report

```

## 🧹 Code Quality & Tooling

Run Lint

```bash

npm run lint

```

Format Code

```bash

npm run format

```

Pre-commit Hook (Husky)
- Automatically runs ESLint + Prettier on staged files.

## 🧰 Tooling Stack

| Tool                    | Purpose                           |
| ----------------------- | --------------------------------- |
| **ESLint + Prettier**   | Code formatting & static analysis |
| **Husky + Lint-Staged** | Pre-commit quality enforcement    |
| **Jest + Supertest**    | Unit & integration testing        |
| **TypeORM / Mongoose**  | Database layer abstraction        |
| **@nestjs/config**      | Environment management            |
| **bcrypt**              | Password hashing                  |


## 🧱 Jest Configuration

- jest.config.ts

```ts

import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/main.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/$1' },
};

export default config;

```

- jest.config.ts

```ts

{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "../",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "testEnvironment": "node"
}

```

## 🧾 NPM Scripts

```json

"scripts": {
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "test": "jest --config jest.config.ts",
  "test:watch": "jest --watch --config jest.config.ts",
  "test:cov": "jest --coverage --config jest.config.ts",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "prepare": "husky"
}

```

## 🧩 Common Utilities

- src/common/utils/hash.util.ts

```ts

import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  plain: string,
  hashed: string,
): Promise<boolean> => bcrypt.compare(plain, hashed);

```

## ✅ Summary:

- This project gives you a production-ready NestJS boilerplate featuring:
- Clean modular structure (Auth + Users)
- SOLID-aligned architecture
- Secure JWT authentication
- Consistent testing and linting setup
- High scalability for enterprise APIs
