import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Basket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    public exchangeId!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created: Date;

    @Column('text', {nullable: true})
    comment: string;
}
