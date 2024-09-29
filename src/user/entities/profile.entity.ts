import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true }) // Use the correct date type for DOB
  dob?: string;
  
  @OneToOne(() => User, (user) => user.profile) // Establishing a one-to-one relationship
  @JoinColumn() // Join with the User entity
  user: User;
}
