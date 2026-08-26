import { inject, injectable } from 'inversify';
import { Result } from '@aquasystem/shared-kernel';
import { UserRepositoryPort } from '@aquasystem/domain';
import { Email } from '@aquasystem/domain';
import { LoginCommand, LoginResult, UserDto } from '../../dto/auth.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { PasswordHasherPort, TokenGeneratorPort, EventBusPort } from '../../ports/outbound';
import { UserLoggedInEvent } from '@aquasystem/domain';

@injectable()
export class LoginUseCase implements UseCase<LoginCommand, LoginResult> {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.PasswordHasherPort) private readonly hasher: PasswordHasherPort,
    @inject(TYPES.TokenGeneratorPort) private readonly tokens: TokenGeneratorPort,
    @inject(TYPES.EventBusPort) private readonly eventBus: EventBusPort
  ) {}

  async execute(command: LoginCommand): Promise<Result<LoginResult>> {
    const emailResult = Email.create(command.email);
    if (!emailResult.ok) return Result.fail(emailResult.error);

    const user = await this.userRepo.findByEmail(emailResult.value);
    if (!user) {
      return Result.fail(new Error('Invalid credentials'));
    }

    const isValid = await this.hasher.verify(command.password, user.passwordHash.value);
    if (!isValid) {
      return Result.fail(new Error('Invalid credentials'));
    }

    if (!user.isActive) {
      return Result.fail(new Error('Account is deactivated'));
    }

    const accessToken = await this.tokens.generateAccessToken(user);
    const refreshToken = await this.tokens.generateRefreshToken(user);

    user.recordLogin();
    await this.userRepo.save(user);

    await this.eventBus.publish(new UserLoggedInEvent(user.id));

    return Result.ok({
      user: this.toDto(user),
      accessToken,
      refreshToken,
      expiresIn: 3600,
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
    };
  }
}