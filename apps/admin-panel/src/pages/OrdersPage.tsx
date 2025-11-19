// apps/admin-panel/src/pages/OrdersPage.tsx
import { Table, Card, Tag, Select, Typography, Descriptions } from 'antd';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/api/orders';

const { Title } = Typography;
const { Option } = Select;

export default function OrdersPage() {
  const { data, isLoading, page, setPage, limit, setStatus } = useOrders();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'orange';
      case OrderStatus.PROCESSING: return 'blue';
      case OrderStatus.DELIVERED: return 'green';
      case OrderStatus.CANCELLED: return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <span className="text-xs text-gray-500 font-mono">{id}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount_paise',
      key: 'total_amount_paise',
      render: (paise: number) => (
        <span className="font-semibold">₹{(paise / 100).toFixed(2)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={3} style={{ marginBottom: 0 }}>Orders Overview</Title>
        <p className="text-gray-500">Real-time transaction monitoring</p>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="mb-4">
          <Select
            placeholder="Filter by Status"
            style={{ width: 200 }}
            allowClear
            onChange={(val) => setStatus(val)}
          >
            <Option value="PENDING">Pending</Option>
            <Option value="PROCESSING">Processing</Option>
            <Option value="DELIVERED">Delivered</Option>
            <Option value="CANCELLED">Cancelled</Option>
          </Select>
        </div>

        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total || 0,
            onChange: (p) => setPage(p),
          }}
          expandable={{
            expandedRowRender: (record: Order) => (
              <Descriptions size="small" column={2} bordered>
                <Descriptions.Item label="Customer ID">{record.user_id}</Descriptions.Item>
                <Descriptions.Item label="Vendor ID">{record.vendor_id}</Descriptions.Item>
              </Descriptions>
            ),
          }}
        />
      </Card>
    </div>
  );
}