import { AggregateRoot } from './base';
import { UserId } from '../value-objects/ids';
import { Email } from '../value-objects/email';
import { PasswordHash } from '../value-objects/password-hash';
import { PersonName } from '../value-objects/person-name';
import { UserRole } from '@aquasystem/shared-kernel';
import { Result, DomainError, BusinessRuleError } from '@aquasystem/shared-kernel';

interface UserProps {
  id: UserId;
  email: Email;
  passwordHash: PasswordHash;
  firstName: PersonName;
  lastName: PersonName;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export class User extends AggregateRoot<UserId> {
  private constructor(
    id: UserId,
    private readonly _email: Email,
    private _passwordHash: PasswordHash,
    private readonly _firstName: PersonName,
    private readonly _lastName: PersonName,
    private _role: UserRole,
    private _isActive: boolean,
    private _lastLoginAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(data: CreateUserData): Result<User, DomainError> {
    const emailResult = Email.create(data.email);
    if (!emailResult.ok) return Result.fail(emailResult.error);

    const passwordHashResult = PasswordHash.create(data.password);
    if (!passwordHashResult.ok) return Result.fail(passwordHashResult.error);

    const firstNameResult = PersonName.create(data.firstName);
    if (!firstNameResult.ok) return Result.fail(firstNameResult.error);

    const lastNameResult = PersonName.create(data.lastName);
    if (!lastNameResult.ok) return Result.fail(lastNameResult.error);

    const user = new User(
      UserId.generate(),
      emailResult.value,
      passwordHashResult.value,
      firstNameResult.value,
      lastNameResult.value,
      data.role || UserRole.OPERATOR,
      true,
      null,
      new Date(),
      new Date()
    );

    user.addDomainEvent(new UserRegisteredEvent(user.id, user.email, user.role));
    return Result.ok(user);
  }

  static reconstitute(props: UserProps): User {
    const user = new User(
      props.id,
      props.email,
      props.passwordHash,
      props.firstName,
      props.lastName,
      props.role,
      props.isActive,
      props.lastLoginAt,
      props.createdAt,
      props.updatedAt
    );
    return user;
  }

  get email(): Email {
    return this._email;
  }

  get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  get firstName(): PersonName {
    return this._firstName;
  }

  get lastName(): PersonName {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName.value} ${this._lastName.value}`;
  }

  get role(): UserRole {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  changePassword(newPasswordHash: PasswordHash): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  changeRole(newRole: UserRole, changedBy: UserId): Result<void, DomainError> {
    if (this._role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      return Result.fail(new BusinessRuleError('Cannot demote admin user'));
    }
    this._role = newRole;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserRoleChangedEvent(this.id, newRole, changedBy));
    return Result.ok(undefined);
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
    this.addDomainEvent(new UserLoggedInEvent(this.id));
  }

  canBeModifiedBy(userId: UserId): boolean {
    return this.id.equals(userId);
  }
}

export class UserRegisteredEvent implements DomainEvent {
  readonly eventType = 'UserRegistered';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly role: UserRole
  ) {
    this.occurredAt = new Date();
    this.aggregateId = userId.value;
  }
}

export class UserRoleChangedEvent implements DomainEvent {
  readonly eventType = 'UserRoleChanged';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    public readonly userId: UserId,
    public readonly newRole: UserRole,
    public readonly changedBy: UserId
  ) {
    this.occurredAt = new Date();
    this.aggregateId = userId.value;
  }
}

export class UserLoggedInEvent implements DomainEvent {
  readonly eventType = 'UserLoggedIn';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(public readonly userId: UserId) {
    this.occurredAt = new Date();
    this.aggregateId = userId.value;
  }
}