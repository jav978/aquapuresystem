import { ServiceInterface } from '@feathersjs/feathers';
import { BadRequest, NotFound, GeneralError } from '@feathersjs/errors';
import { PrismaService } from '@aquasystem/infrastructure';
import bcrypt from 'bcryptjs';
import { container } from '../../config/di.container';
import { logger } from '@aquasystem/infrastructure';

export class UsersService implements ServiceInterface<any, any> {
  id: string = 'id';
  private prisma: PrismaService;

  constructor() {
    this.prisma = container.get<PrismaService>('PrismaService');
  }

  private sanitizeUser(user: any) {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return {
      ...safeUser,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    };
  }

  async find(params?: any): Promise<any> {
    try {
      const page = Math.max(1, Number(params?.query?.$page || params?.query?.page || 1));
      const limit = Math.min(100, Math.max(1, Number(params?.query?.$limit || params?.query?.limit || 50)));
      const skip = (page - 1) * limit;

      const where: any = {};
      const role = params?.query?.role;
      if (role && role !== 'ALL') {
        where.role = role;
      }

      if (params?.query?.isActive !== undefined) {
        where.isActive = params.query.isActive === true || params.query.isActive === 'true';
      }

      const search = params?.query?.search || params?.query?.q;
      if (search && typeof search === 'string' && search.trim().length > 0) {
        const searchTerm = search.trim();
        where.OR = [
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        total,
        limit,
        skip,
        data: users.map((u) => this.sanitizeUser(u)),
      };
    } catch (err: any) {
      logger.error({ err, params }, 'Error en UsersService.find');
      throw new GeneralError(err.message || 'Error al consultar usuarios');
    }
  }

  async get(id: string, params?: any): Promise<any> {
    try {
      if (id === 'me') {
        if (params?.user) {
          return this.sanitizeUser(params.user);
        }
        throw new BadRequest('No autenticado');
      }

      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFound(`Usuario con ID ${id} no encontrado`);
      }

      return this.sanitizeUser(user);
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, id }, 'Error en UsersService.get');
      throw new GeneralError(err.message || 'Error al obtener usuario');
    }
  }

  async create(data: any, params?: any): Promise<any> {
    try {
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        throw new BadRequest('Todos los campos obligatorios deben ser completados');
      }

      const normalizedEmail = data.email.toLowerCase().trim();
      const existing = await this.prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });

      if (existing) {
        throw new BadRequest('Ya existe un usuario con este correo electrónico');
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      const role = data.role || 'OPERATOR';
      const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;

      const newUser = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role,
          isActive,
        },
      });

      logger.info({ userId: newUser.id, email: newUser.email, role: newUser.role }, 'Nuevo usuario creado');
      return this.sanitizeUser(newUser);
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, data }, 'Error en UsersService.create');
      throw new GeneralError(err.message || 'Error al crear el usuario');
    }
  }

  async patch(id: string, data: any, params?: any): Promise<any> {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFound(`Usuario con ID ${id} no encontrado`);
      }

      const updateData: any = {};
      if (data.firstName !== undefined) updateData.firstName = String(data.firstName).trim();
      if (data.lastName !== undefined) updateData.lastName = String(data.lastName).trim();
      if (data.role !== undefined) updateData.role = data.role;
      if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

      if (data.email) {
        const normalizedEmail = data.email.toLowerCase().trim();
        if (normalizedEmail !== existing.email.toLowerCase()) {
          const emailExists = await this.prisma.user.findFirst({
            where: {
              email: { equals: normalizedEmail, mode: 'insensitive' },
              id: { not: id },
            },
          });
          if (emailExists) {
            throw new BadRequest('Ya existe otro usuario registrado con este correo electrónico');
          }
          updateData.email = normalizedEmail;
        }
      }

      if (data.password && String(data.password).trim().length > 0) {
        updateData.passwordHash = await bcrypt.hash(String(data.password).trim(), 12);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      logger.info({ userId: id }, 'Usuario actualizado');
      return this.sanitizeUser(updatedUser);
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, id, data }, 'Error en UsersService.patch');
      throw new GeneralError(err.message || 'Error al actualizar usuario');
    }
  }

  async remove(id: string, params?: any): Promise<any> {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFound(`Usuario con ID ${id} no encontrado`);
      }

      // Prevent deleting the last active admin if desirable
      if (existing.email === 'admin@aquasystem.com' || existing.email === 'admin@aquapure.com') {
        const adminCount = await this.prisma.user.count({
          where: { role: 'ADMIN', isActive: true },
        });
        if (adminCount <= 1) {
          throw new BadRequest('No se puede eliminar el último administrador principal del sistema');
        }
      }

      const deleted = await this.prisma.user.delete({
        where: { id },
      });

      logger.info({ userId: id }, 'Usuario eliminado');
      return this.sanitizeUser(deleted);
    } catch (err: any) {
      if (err.className) throw err;
      logger.error({ err, id }, 'Error en UsersService.remove');
      throw new GeneralError(err.message || 'Error al eliminar usuario');
    }
  }
}