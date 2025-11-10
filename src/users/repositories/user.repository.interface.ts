import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User | null>;
  saveRefreshToken(id: number, token: string): Promise<void>;
}
