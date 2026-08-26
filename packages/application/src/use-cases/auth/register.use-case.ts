import { inject, injectable } from 'inversify';
import { Result } from '@aquasystem/shared-kernel';
import { UserRepositoryPort } from '@aquasystem/domain';
import { Email } from '@aquasystem/domain';
import { User, UserRegisteredEvent } from '@aquasystem/domain';
import { RegisterCommand, UserDto } from '../../dto/auth.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { PasswordHasherPort, TokenGeneratorPort, EventBusPort, EmailPort } from '../../ports/outbound';

@injectable()
export class RegisterUseCase implements UseCase<RegisterCommand, UserDto> {
  @inject(TYPES.UserRepositoryPort) private readonly userRepo!: UserRepositoryPort;
  @inject(TYPES.PasswordHasherPort) private readonly hasher!: PasswordHasherPort;
  @inject(TYPES.TokenGeneratorPort) private readonly tokens!: TokenGeneratorPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;
  @inject(TYPES.EmailPort) private readonly email!: EmailPort;

  async execute(command: RegisterCommand): Promise<Result<UserDto>> {
    const emailResult = Email.create(command.email);
    if (!emailResult.ok) return Result.fail(emailResult.error);

    const existingUser = await this.userRepo.findByEmail(emailResult.value);
    if (existingUser) {
      return Result.fail(new Error('User already exists'));
    }

    const hashedPassword = await this.hasher.hash(command.password);
    const passwordHashResult = await import('@aquasystem/domain').then(m => m.PasswordHash.create(hashedPassword));
    if (!passwordHashResult.ok) return Result.fail(passwordHashResult.error);

    const userResult = User.create({
      email: command.email,
      password: hashedPassword,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
    });

    if (!userResult.ok) return Result.fail(userResult.error);

    const user = userResult.value;
    await this.userRepo.save(user);

    await this.eventBus.publish(new UserRegisteredEvent(user.id, user.email, user.role));

    // Send welcome email
    await this.email.sendTemplate(user.email.value, 'welcome', {
      firstName: user.firstName.value,
    });

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
    };
  }
}