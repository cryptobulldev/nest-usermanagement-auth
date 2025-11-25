import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { MongoRepository } from 'typeorm';
import { User } from '@domain/users/entities/user.entity';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
  //constructor(@InjectRepository(User) private readonly repo: MongoRepository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
    // in case of mongodb, use the following code
    //return this.repo.findOneBy({ _id: new ObjectId(id) });
  }

  async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await this.repo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { users, total };
    // in case of mongodb, use the following code
    //const skip = (page - 1) * limit;
    //const users = await this.repo.find({ skip, take: limit });
    //const total = await this.repo.count();
    //return { users, total };
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = this.repo.create(user);
    return this.repo.save(entity);
    // in case of mongodb, use the following code
    //return this.repo.save(entity);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
    // in case of mongodb, use the following code
    //await this.repo.update({ _id: new ObjectId(id) }, data);
    //return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
    // in case of mongodb, use the following code
    //await this.repo.delete({ _id: new ObjectId(id) });
  }
}
