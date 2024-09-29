import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date;
  
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { eager: true }) // Eager loading to include profile with user
  profile: Profile; // Link to Profile entity
}
