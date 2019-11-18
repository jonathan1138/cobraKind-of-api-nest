import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../shared/enums/role.enum';

@Entity()
export class UserRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ['admin', 'user'] })
    name: Role;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

    // @OneToOne(type => UserEntity, user => user.role)
    // user: UserEntity;
}
