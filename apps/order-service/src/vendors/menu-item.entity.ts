import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('menu_items')
export class MenuItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index() // ⚡ Performance optimization
    @Column({ name: 'vendor_id' })
    vendorId: string;

    @Column()
    name: string;

    @Column({ type: 'int', name: 'price_paise' })
    pricePaise: number;

    @ManyToOne(() => Vendor, (vendor) => vendor.menuItems)
    @JoinColumn({ name: 'vendor_id' })
    vendor: Vendor;
}
