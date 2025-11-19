// apps/admin-panel/src/layouts/AppLayout.tsx

import { Layout, Menu, Button, Space, Typography } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardOutlined, LogoutOutlined, UserOutlined, ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/users', icon: <UserOutlined />, label: 'Users' },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
    { key: '/vendors', icon: <ShopOutlined />, label: 'Vendors' },
  ];

  return (
    <Layout className="tw-min-h-screen">
      <Sider theme="dark">
        <div className="tw-h-8 tw-m-4 tw-flex tw-items-center tw-justify-center">
          <Text className="tw-text-white tw-text-xl tw-font-extrabold">
            EATZY <span className="tw-text-blue-500 tw-font-light">ADM</span>
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={menuItems}
          onSelect={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="tw-bg-white tw-px-6 tw-flex tw-justify-end tw-items-center" style={{ padding: 0 }}>
          <Space>
            <Text strong>Welcome, {user?.username || 'Admin'}</Text>
            <Button
              icon={<LogoutOutlined />}
              type="text"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content className="tw-m-6 tw-p-6 tw-bg-white tw-min-h-0">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}