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

  @Column({ type: 'date', nullable: true }) // Date of birth field
  dob?: string;

  @Column({ nullable: true }) // New column for user announcement
  announcement: string;

  @Column({ default: 'light' }) // New column for color preference (light by default)
  colorPreference: 'dark' | 'light'; 

  @Column({ nullable: true }) // New column for location
  location: string;

  @Column({ nullable: true }) // New column for nickname
  nickname: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn() // Join with the User entity
  user: User;
}
