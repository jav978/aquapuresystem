import { inject, injectable } from 'inversify';
import { Result } from '@aquasystem/shared-kernel';
import { UserRepositoryPort } from '@aquasystem/domain';
import { Email } from '@aquasystem/domain';
import { ResetPasswordCommand } from '../../dto/auth.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { PasswordHasherPort, EventBusPort } from '../../ports/outbound';
import { PasswordHash } from '@aquasystem/domain';

@injectable()
export class ResetPasswordUseCase implements UseCase<ResetPasswordCommand, void> {
  @inject(TYPES.UserRepositoryPort) private readonly userRepo!: UserRepositoryPort;
  @inject(TYPES.PasswordHasherPort) private readonly hasher!: PasswordHasherPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;

  async execute(command: ResetPasswordCommand): Promise<Result<void>> {
    const emailResult = Email.create(command.email);
    if (!emailResult.ok) return Result.fail(emailResult.error);

    const user = await this.userRepo.findByEmail(emailResult.value);
    if (!user) {
      return Result.fail(new Error('User not found'));
    }

    // In production, verify reset code from Redis
    // For now, accept any 6-digit code
    if (command.code.length !== 6 || !/^\d{6}$/.test(command.code)) {
      return Result.fail(new Error('Invalid reset code'));
    }

    const hashedPassword = await this.hasher.hash(command.newPassword);
    const passwordHashResult = PasswordHash.create(hashedPassword);
    if (!passwordHashResult.ok) return Result.fail(passwordHashResult.error);

    user.changePassword(passwordHashResult.value);
    await this.userRepo.save(user);

    // Invalidate all refresh tokens for this user (in production)
    
    return Result.ok(undefined);
  }
}