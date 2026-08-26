import { inject, injectable } from 'inversify';
import { Result } from '@aquasystem/shared-kernel';
import { UserRepositoryPort } from '@aquasystem/domain';
import { Email } from '@aquasystem/domain';
import { VerifyCodeCommand } from '../../dto/auth.dto';
import { UseCase } from '../../ports/inbound/use-case.port';
import { TYPES } from '../../types';

@injectable()
export class VerifyCodeUseCase implements UseCase<VerifyCodeCommand, { valid: boolean; email: string }> {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort
  ) {}

  async execute(command: VerifyCodeCommand): Promise<Result<{ valid: boolean; email: string }>> {
    const emailResult = Email.create(command.email);
    if (!emailResult.ok) return Result.fail(emailResult.error);

    const user = await this.userRepo.findByEmail(emailResult.value);
    if (!user) {
      return Result.fail(new Error('User not found'));
    }

    // In production, verify against stored code in Redis
    // For now, accept any 6-digit code for demo
    const isValid = command.code.length === 6 && /^\d{6}$/.test(command.code);

    return Result.ok({ valid: isValid, email: user.email.value });
  }
}