import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserIp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('inet')
  ipAddress: string;
}
