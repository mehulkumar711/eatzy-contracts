// apps/admin-panel/src/pages/UsersManagementPage.tsx
import { Table, Card, Tag, Input, Select, Typography } from 'antd';
import { useUsers } from '@/hooks/useUsers';
import { SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export default function UsersManagementPage() {
  const { data, isLoading, params, setParams } = useUsers();

  // Columns Configuration
  const columns = [
    {
      title: 'ID / Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium">{text || record.phone || 'N/A'}</div>
          <div className="text-xs text-gray-400">{record.id}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color = role === 'admin' ? 'red' : role === 'vendor' ? 'blue' : 'green';
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>User Management</Title>
          <p className="text-gray-500">Manage Admins, Vendors, and Customers</p>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm">
        {/* Filters */}
        <div className="mb-4 flex gap-4 flex-wrap">
          <Input
            placeholder="Search by username..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            allowClear
            onPressEnter={(e) => setParams({ ...params, search: e.currentTarget.value, page: 1 })}
          />
          <Select
            placeholder="Filter by Role"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setParams({ ...params, role: value, page: 1 })}
          >
            <Option value="admin">Admin</Option>
            <Option value="vendor">Vendor</Option>
            <Option value="customer">Customer</Option>
          </Select>
        </div>

        {/* Data Table */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          pagination={{
            current: params.page,
            pageSize: params.limit,
            total: data?.total || 0,
            onChange: (page, limit) => setParams({ ...params, page, limit }),
          }}
        />
      </Card>
    </div>
  );
}