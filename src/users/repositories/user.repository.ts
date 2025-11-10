import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//import { MongoRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
  //constructor(@InjectRepository(User) private readonly repo: MongoRepository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
    // in case of mongodb, use the following code
    //return this.repo.findOneBy({ _id: new ObjectId(id) });
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = this.repo.create(user);
    return this.repo.save(entity);
    // in case of mongodb, use the following code
    //return this.repo.save(entity);
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
    // in case of mongodb, use the following code
    //await this.repo.update({ _id: new ObjectId(id) }, data);
    //return this.findById(id);
  }

  async saveRefreshToken(id: number, token: string): Promise<void> {
    await this.repo.update(id, { refreshToken: token });
    // in case of mongodb, use the following code
    //await this.repo.update({ _id: new ObjectId(id) }, { refreshToken: token });
  }
}
