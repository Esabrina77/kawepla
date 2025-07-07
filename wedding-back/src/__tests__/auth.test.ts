import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Créer un utilisateur de test
    const hashedPassword = await hashPassword('testpassword123');
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'COUPLE'
      }
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123',
          firstName: 'New',
          lastName: 'User'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('newuser@example.com');
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'anotherpassword123',
          firstName: 'Another',
          lastName: 'User'
        });

      expect(res.status).toBe(400);
    });
  });
}); 