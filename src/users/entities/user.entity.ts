import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    //ObjectIdColumn,
    //ObjectId,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity({ name: 'users' })
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    // in case of mongodb, use the following code
    //@ObjectIdColumn()
    //id: ObjectId;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    name: string;
  
    @Column({ select: false })
    password: string;
  
    @Column({ nullable: true })
    refreshToken?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  