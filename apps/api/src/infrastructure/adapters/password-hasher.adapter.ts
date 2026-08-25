import { injectable } from 'inversify';
import bcrypt from 'bcryptjs';
import { PasswordHasherPort } from '@aquasystem/application';

@injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
