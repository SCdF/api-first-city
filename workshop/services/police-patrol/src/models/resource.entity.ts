import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PolicePatrol } from '../generated/types.gen';

@Entity('police-patrol')
export class PolicePatrolEntity implements Omit<PolicePatrol, 'createdAt' | 'updatedAt'> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  caseId?: string;

  @Column()
  location!: string;

  @Column()
  startedAt!: Date;

  @Column({ nullable: true })
  endedAt?: Date;

  @Column()
  patrolType!: 'car' | 'foot' | 'bike' | 'horse';

  @Column({ nullable: true })
  callType?: string;

  /**
   * Timestamp of when the resource was created.
   * Automatically managed by TypeORM.
   *
   * @type {Date}
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  /**
   * Timestamp of when the resource was last updated.
   * Automatically managed by TypeORM.
   *
   * @type {Date}
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
