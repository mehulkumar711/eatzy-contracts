import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity('vendors')
export class Vendor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ default: true })
    is_active: boolean;

    @OneToMany(() => MenuItem, (item) => item.vendor)
    menuItems: MenuItem[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
