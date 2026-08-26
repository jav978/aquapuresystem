import { inject, injectable } from 'inversify';
import { Result, PaginatedResult } from '@aquasystem/shared-kernel';
import { UserRepositoryPort } from '@aquasystem/domain';
import { InviteUserCommand, UpdateUserRoleCommand, DeactivateUserCommand, UserQuery, UserDto } from '../../dto/users.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { User, UserId } from '@aquasystem/domain';
import { UserRole } from '@aquasystem/shared-kernel';
import { Email } from '@aquasystem/domain';
import { PasswordHasherPort, TokenGeneratorPort, EventBusPort, EmailPort } from '../../ports/outbound';
import { UserRegisteredEvent, UserRoleChangedEvent } from '@aquasystem/domain';
import { PasswordHash, PersonName } from '@aquasystem/domain';

@injectable()
export class InviteUserUseCase implements UseCase<InviteUserCommand, UserDto> {
  @inject(TYPES.UserRepositoryPort) private readonly userRepo!: UserRepositoryPort;
  @inject(TYPES.PasswordHasherPort) private readonly hasher!: PasswordHasherPort;
  @inject(TYPES.TokenGeneratorPort) private readonly tokens!: TokenGeneratorPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;
  @inject(TYPES.EmailPort) private readonly email!: EmailPort;

  async execute(command: InviteUserCommand): Promise<Result<UserDto>> {
    const emailResult = Email.create(command.email);
    if (!emailResult.ok) return Result.fail(emailResult.error);

    const existingUser = await this.userRepo.findByEmail(emailResult.value);
    if (existingUser) {
      return Result.fail(new Error('User already exists'));
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await this.hasher.hash(tempPassword);
    const passwordHashResult = PasswordHash.create(hashedPassword);
    if (!passwordHashResult.ok) return Result.fail(passwordHashResult.error);

    const firstNameResult = PersonName.create(command.firstName);
    if (!firstNameResult.ok) return Result.fail(firstNameResult.error);

    const lastNameResult = PersonName.create(command.lastName);
    if (!lastNameResult.ok) return Result.fail(lastNameResult.error);

    const userResult = User.create({
      email: command.email,
      password: tempPassword,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
    });

    if (!userResult.ok) return Result.fail(userResult.error);

    const user = userResult.value;
    await this.userRepo.save(user);
    await this.eventBus.publish(new UserRegisteredEvent(user.id, user.email, user.role));

    // Send invitation email with temporary password
    await this.email.send(
      user.email.value,
      'Welcome to AquaSystem',
      `<p>Welcome! Your temporary password is: <strong>${tempPassword}</strong></p><p>Please log in and change your password immediately.</p>`,
      `Welcome! Your temporary password is: ${tempPassword}. Please log in and change your password immediately.`
    );

    return Result.ok(this.toDto(user));
  }

  private toDto(user: any): UserDto {
    return {
      id: user.id.value,
      email: user.email.value,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

@injectable()
export class UpdateUserRoleUseCase implements UseCase<UpdateUserRoleCommand, UserDto> {
  @inject(TYPES.UserRepositoryPort) private readonly userRepo!: UserRepositoryPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;

  async execute(command: UpdateUserRoleCommand): Promise<Result<UserDto>> {
    const userId = UserId.create(command.userId);
    const changedById = UserId.create(command.changedBy);

    const user = await this.userRepo.findById(userId);
    if (!user) {
      return Result.fail(new Error('User not found'));
    }

    const changedBy = await this.userRepo.findById(changedById);
    if (!changedBy) {
      return Result.fail(new Error('Changed by user not found'));
    }

    const result = user.changeRole(command.newRole, changedById);
    if (!result.ok) return Result.fail(result.error);

    await this.userRepo.save(user);
    await this.eventBus.publish(new UserRoleChangedEvent(user.id, command.newRole, changedById));

    return Result.ok(this.toDto(user));
  }

  private toDto(user: any): UserDto {
    return {
      id: user.id.value,
      email: user.email.value,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

@injectable()
export class DeactivateUserUseCase implements UseCase<DeactivateUserCommand, void> {
  @inject(TYPES.UserRepositoryPort) private readonly userRepo!: UserRepositoryPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;

  async execute(command: DeactivateUserCommand): Promise<Result<void>> {
    const userId = UserId.create(command.userId);
    const deactivatedById = UserId.create(command.deactivatedBy);

    const user = await this.userRepo.findById(userId);
    if (!user) {
      return Result.fail(new Error('User not found'));
    }

    const deactivatedBy = await this.userRepo.findById(deactivatedById);
    if (!deactivatedBy) {
      return Result.fail(new Error('Deactivated by user not found'));
    }

    // Prevent self-deactivation
    if (userId.equals(deactivatedById)) {
      return Result.fail(new Error('Cannot deactivate yourself'));
    }

    // Prevent deactivating admin users
    if (user.role === UserRole.ADMIN) {
      return Result.fail(new Error('Cannot deactivate admin user'));
    }

    user.deactivate();
    await this.userRepo.save(user);

    return Result.ok(undefined);
  }
}

@injectable()
export class ListUsersUseCase implements UseCase<UserQuery, PaginatedResult<UserDto>> {
  @inject(TYPES.UserRepositoryPort) private readonly userRepo!: UserRepositoryPort;

  async execute(query: UserQuery): Promise<Result<PaginatedResult<UserDto>>> {
    const result = await this.userRepo.findAll(query, {
      role: query.role,
      isActive: query.isActive,
      search: query.search,
    });

    return Result.ok({
      data: result.data.map(this.toDto),
      meta: result.meta,
    });
  }

  private toDto(user: any): UserDto {
    return {
      id: user.id.value,
      email: user.email.value,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}