import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { NotAuthenticated } from '@feathersjs/errors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

class CustomLocalStrategy extends LocalStrategy {
  async findEntity(email: string, params: any) {
    if (!email) {
      throw new NotAuthenticated('El correo electrónico es requerido');
    }
    const prisma: PrismaClient = this.app?.get('prisma');
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { email: email },
        ],
      },
    });

    if (!user || !user.isActive) {
      throw new NotAuthenticated('Credenciales incorrectas');
    }

    return user;
  }

  async comparePassword(entity: any, password: string) {
    if (!entity.passwordHash) {
      throw new NotAuthenticated('Credenciales incorrectas');
    }
    const isValid = await bcrypt.compare(password, entity.passwordHash);
    if (!isValid) {
      throw new NotAuthenticated('Credenciales incorrectas');
    }
    return entity;
  }

  async getEntity(result: any, params: any) {
    const { passwordHash, ...userWithoutPassword } = result;
    return userWithoutPassword;
  }
}

class CustomJWTStrategy extends JWTStrategy {
  async getEntity(id: string, params: any) {
    const prisma: PrismaClient = this.app?.get('prisma');
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user || !user.isActive) {
      throw new NotAuthenticated('Token inválido o usuario inactivo');
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authentication = (app: any) => {
  const authService = new AuthenticationService(app);

  authService.register('jwt', new CustomJWTStrategy());
  authService.register('local', new CustomLocalStrategy());

  app.use('authentication', authService);
};