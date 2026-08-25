import { injectable } from 'inversify';
import fs from 'fs';
import path from 'path';
import { StoragePort } from '@aquasystem/application';
import { Result } from '@aquasystem/shared-kernel';

@injectable()
export class LocalStorageAdapter implements StoragePort {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(key: string, data: Buffer, _contentType: string): Promise<Result<string>> {
    try {
      const filePath = path.join(this.baseDir, key);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, data);
      return Result.ok(`/uploads/${key}`);
    } catch (err: any) {
      return Result.fail(new Error(err.message || 'File upload failed'));
    }
  }

  async download(key: string): Promise<Result<Buffer>> {
    try {
      const filePath = path.join(this.baseDir, key);
      if (!fs.existsSync(filePath)) {
        return Result.fail(new Error('File not found'));
      }
      const data = fs.readFileSync(filePath);
      return Result.ok(data);
    } catch (err: any) {
      return Result.fail(new Error(err.message || 'File download failed'));
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      const filePath = path.join(this.baseDir, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return Result.ok(undefined);
    } catch (err: any) {
      return Result.fail(new Error(err.message || 'File deletion failed'));
    }
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}
