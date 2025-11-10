import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  let testUserId: number;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await userRepository.delete({});
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.delete({});
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
          expect(res.body).not.toHaveProperty('password');
          testUserId = res.body.id;
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('GET /users/:id', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = userRepository.create({
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
      });
      const savedUser = await userRepository.save(user);
      testUserId = savedUser.id;
    });

    it('should get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testUserId);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/99999')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('User not found');
        });
    });

    it('should fail with invalid id format', () => {
      return request(app.getHttpServer()).get('/users/invalid').expect(400);
    });
  });

  describe('PUT /users/:id', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = userRepository.create({
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
      });
      const savedUser = await userRepository.save(user);
      testUserId = savedUser.id;
    });

    it('should update user name', () => {
      const updateData = {
        name: 'Updated Name',
      };

      return request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('should update user password', async () => {
      const updateData = {
        password: 'newPassword123',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).not.toHaveProperty('password');

      // Verify password was actually updated by trying to login
      const user = await userRepository.findOne({
        where: { id: testUserId },
      });
      expect(user).toBeDefined();
      if (user) {
        const isValid = await bcrypt.compare(updateData.password, user.password);
        expect(isValid).toBe(true);
      }
    });

    it('should update both name and password', () => {
      const updateData = {
        name: 'Updated Name',
        password: 'newPassword123',
      };

      return request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .send({
          password: 'short',
        })
        .expect(400);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/99999')
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });

    it('should fail with invalid id format', () => {
      return request(app.getHttpServer())
        .put('/users/invalid')
        .send({
          name: 'Updated Name',
        })
        .expect(400);
    });
  });
});
