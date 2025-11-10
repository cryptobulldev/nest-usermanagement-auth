# 🚀 NestJS Modular Application

A **senior-level NestJS application** built with **TypeScript** and **TypeORM**, designed using **Clean Architecture** and implementing **SOLID principles**.  
It demonstrates enterprise-grade engineering practices — modular boundaries, dependency injection, layered architecture, and comprehensive testing — making it scalable, maintainable, and production-ready.


## 🏗️ Architecture Overview

This project follows **Clean Architecture** principles and enforces **SOLID** design through:

- **Modular organization:** Each feature (`auth`, `users`, etc.) encapsulates its own controllers, services, and DTOs.  
- **Dependency Injection:** Business logic depends on abstractions via NestJS’s `@Injectable()` and `@InjectRepository()`.  
- **Repository pattern:** TypeORM repositories isolate persistence logic from domain logic.  
- **Separation of concerns:** Controllers handle transport logic; services contain business logic; entities define persistence.  
- **Extensibility:** New modules or features can be added without modifying existing ones.

Together, these ensure a **highly testable, extensible, and maintainable** codebase suitable for large-scale systems.


### 📂 Folder Structure

```text
src/
 ├── app.module.ts
 ├── main.ts
 ├── common/                     # shared interceptors, guards, pipes, filters
 ├── database/
 │   ├── entities/               # TypeORM entities
 │   │   ├── user.entity.ts
 │   │   └── ...
 │   ├── migrations/             # DB migrations
 │   └── ormconfig.ts            # TypeORM config
 ├── auth/
 │   ├── auth.controller.ts
 │   ├── auth.service.ts
 │   ├── auth.module.ts
 │   ├── dto/
 │   └── auth.service.spec.ts     # Unit tests for AuthService
 ├── users/
 │   ├── users.controller.ts
 │   ├── users.service.ts
 │   ├── users.module.ts
 │   ├── dto/
 │   ├── entities/
 │   │   └── user.entity.ts
 │   └── users.service.spec.ts    # Unit tests for UsersService
test/
 ├── app.e2e-spec.ts              # E2E tests for app bootstrap
 └── auth.e2e-spec.ts             # E2E tests for /auth routes

 ```

 ## ⚡ Key Highlights

✅ Clean & SOLID Architecture

Clear separation between controllers, services, and repositories.

✅ TypeORM Integration

Entity management, migrations, and repository abstraction with dependency injection.

✅ Dependency Injection

Loosely coupled design through NestJS providers and @InjectRepository() usage.

✅ Testing-first Approach

Includes both unit and E2E tests for key modules (auth, users).

✅ Configurable Environments

Supports .env, .env.test, .env.prod for environment-specific configuration.

✅ Production-Ready Tooling

Pre-configured ESLint, Prettier, and Jest to enforce quality and consistency.

✅ Scalable Design

Modular monolith architecture that can evolve into microservices easily.

## ⚙️ Installation

```bash
npm install
cp .env.example .env
```

- Update your .env file with valid credentials:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nestjs_app
JWT_SECRET=supersecretkey
PORT=3000
```

## 🗃️ Database Setup (TypeORM)

```bash
# Generate migration from entity changes
npm run typeorm migration:generate -- -n InitSchema

# Run migrations
npm run typeorm migration:run
```

- Example configuration (app.module.ts):

```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  autoLoadEntities: true,
  synchronize: false, // keep false in production
});

```

## ▶️ Running the Application

```bash
npm run start:dev
```

Default: http://localhost:3000

## 🧪 Testing

### 🧩 Unit Tests

```bash
npm run test
```

- auth.service.spec.ts — tests authentication logic (register/login/JWT).
- users.service.spec.ts — tests CRUD operations and validation.


### 🌐 End-to-End Tests

```bash
npm run test:e2e
```

- app.e2e-spec.ts — checks app bootstrap and routes.
- auth.e2e-spec.ts — validates auth endpoints and flow.

### 📊 Coverage
```bash
npm run test:cov
```
Generates report in /coverage.

## 🧰 Tooling & Code Quality

| Tool                    | Purpose                          |
| ----------------------- | -------------------------------- |
| **ESLint**              | Linting and code consistency     |
| **Prettier**            | Code formatting                  |
| **Husky + lint-staged** | Pre-commit checks                |
| **Jest**                | Unit + integration testing       |
| **Supertest**           | E2E HTTP testing                 |
| **TypeORM**             | ORM for PostgreSQL and other DBs |
| **TypeScript**          | Static typing and modern tooling |

```bash
npm run lint
```

## 📖 Scripts Summary

Command	Description
| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run start:dev`  | Run in development mode      |
| `npm run start:prod` | Run compiled build           |
| `npm run build`      | Compile TypeScript           |
| `npm run test`       | Run unit tests               |
| `npm run test:e2e`   | Run end-to-end tests         |
| `npm run test:cov`   | Generate coverage report     |
| `npm run lint`       | Run linter                   |
| `npm run typeorm`    | Execute TypeORM CLI commands |


## 🧩 Future Enhancements
✅ Add caching layer (Redis)
✅ Integrate Swagger for REST API docs
✅ Implement role-based access control (RBAC)
✅ Add CI/CD pipelines
✅ Integrate centralized logging (Winston / Pino)


## 🧭 Design Philosophy

This project serves as a real-world reference for senior NestJS + TypeORM backend architecture:
- Business logic isolated from transport and persistence layers
- Repository pattern ensures testability and decoupling
- Modular structure supports continuous scaling
- Implements SOLID and Clean Architecture principles across all modules