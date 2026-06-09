import { FastifyInstance } from 'fastify';
import { prisma } from '@mangatracker/database';
import bcrypt from 'bcryptjs';
import { authenticate } from '../lib/auth-middleware.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const { email, password, name } = request.body as any;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return { error: { code: 'EMAIL_TAKEN', message: 'Email já cadastrado' } };
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    const token = app.jwt.sign({ id: user.id, email: user.email });

    return {
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      },
    };
  });

  app.post('/login', async (request) => {
    const { email, password } = request.body as any;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha inválidos' } };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha inválidos' } };
    }

    const token = app.jwt.sign({ id: user.id, email: user.email });

    return {
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      },
    };
  });

  app.get('/me', { preHandler: [authenticate] }, async (request: any) => {
    const { id } = request.user;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });

    if (!user) {
      return { error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' } };
    }

    return { data: user };
  });
}
