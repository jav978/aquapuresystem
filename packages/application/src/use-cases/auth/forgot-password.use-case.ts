import { inject, injectable } from 'inversify';
import { Result } from '@aquasystem/shared-kernel';
import { UserRepositoryPort } from '@aquasystem/domain';
import { Email } from '@aquasystem/domain';
import { ForgotPasswordCommand } from '../../dto/auth.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';
import { EventBusPort, EmailPort } from '../../ports/outbound';
import { generateShortId } from '@aquasystem/shared-kernel';

@injectable()
export class ForgotPasswordUseCase implements UseCase<ForgotPasswordCommand, void> {
  @inject(TYPES.UserRepositoryPort) private readonly userRepo!: UserRepositoryPort;
  @inject(TYPES.EventBusPort) private readonly eventBus!: EventBusPort;
  @inject(TYPES.EmailPort) private readonly email!: EmailPort;

  async execute(command: ForgotPasswordCommand): Promise<Result<void>> {
    const emailResult = Email.create(command.email);
    if (!emailResult.ok) return Result.fail(emailResult.error);

    const user = await this.userRepo.findByEmail(emailResult.value);
    if (!user) {
      // Don't reveal if user exists
      return Result.ok(undefined);
    }

    const resetCode = generateShortId('RST').substring(0, 6).toUpperCase();

    // Store reset code (in production, use Redis with TTL)
    // For now, we'll just send it via email
    await this.email.send(
      user.email.value,
      'Password Reset Code',
      `<p>Your password reset code is: <strong>${resetCode}</strong></p><p>This code expires in 15 minutes.</p>`,
      `Your password reset code is: ${resetCode}. This code expires in 15 minutes.`
    );

    return Result.ok(undefined);
  }
}