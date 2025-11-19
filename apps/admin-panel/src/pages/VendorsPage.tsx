import { useState } from 'react';
import { Table, Card, Typography, Button, Drawer, List, Result, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { vendorsApi, Vendor, MenuItem } from '@/api/vendors';
import { ShopOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function VendorsPage() {
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    const { data: vendors, isLoading, error } = useQuery({
        queryKey: ['vendors'],
        queryFn: vendorsApi.getAll,
    });

    const { data: menu, isLoading: loadingMenu } = useQuery({
        queryKey: ['menu', selectedVendor?.id],
        queryFn: () => vendorsApi.getMenu(selectedVendor!.id),
        enabled: !!selectedVendor,
    });

    // 🛡️ Error State Handling
    if (error) {
        return (
            <div className="p-6">
                <Result
                    status="error"
                    title="Failed to Load Vendors"
                    subTitle="System encountered an error fetching vendor data."
                    extra={<Button onClick={() => window.location.reload()}>Retry</Button>}
                />
            </div>
        );
    }

    const columns = [
        {
            title: 'Vendor Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Menu Items',
            dataIndex: 'menuItemCount',
            key: 'menuItemCount',
            render: (count: number) => <Tag color="blue">{count || 0} Items</Tag>,
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Vendor) => (
                <Button size="small" onClick={() => setSelectedVendor(record)}>View Menu</Button>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <Title level={3} style={{ marginBottom: 0 }}>Vendor Inventory</Title>
                    <p className="text-gray-500">Manage Restaurants and Menus</p>
                </div>
                {/* 🛡️ Disable incomplete feature */}
                <Button disabled type="primary" icon={<PlusOutlined />}>Add Vendor (Coming Soon)</Button>
            </div>

            <Card bordered={false} className="shadow-sm">
                <Table
                    dataSource={vendors || []}
                    columns={columns}
                    rowKey="id"
                    loading={isLoading}
                />
            </Card>

            {/* Menu Drawer */}
            <Drawer
                title={selectedVendor?.name ? `Menu: ${selectedVendor.name}` : 'Restaurant Menu'}
                placement="right"
                onClose={() => setSelectedVendor(null)}
                open={!!selectedVendor}
                width={400}
            >
                <List
                    loading={loadingMenu}
                    itemLayout="horizontal"
                    dataSource={menu || []}
                    renderItem={(item: MenuItem) => (
                        <List.Item actions={[<a key="edit">Edit</a>]}>
                            <List.Item.Meta
                                avatar={<ShopOutlined className="text-xl text-gray-400" />}
                                title={item.name}
                                description={<span className="font-bold text-green-600">₹{(item.pricePaise / 100).toFixed(2)}</span>}
                            />
                        </List.Item>
                    )}
                />
                <Button block type="dashed" icon={<PlusOutlined />} className="mt-4">
                    Add Menu Item
                </Button>
            </Drawer>
        </div>
    );
}
