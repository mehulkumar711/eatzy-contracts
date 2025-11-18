import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return (
    <Layout style={{minHeight:'100vh'}}>
      <Sider theme="dark">
        <div style={{height:32, margin:16, background:'rgba(255,255,255,0.2)'}} />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={[{ key: '1', icon: <DashboardOutlined />, label: 'Dashboard' }]} />
      </Sider>
      <Layout>
        <Header style={{background:'#fff', padding:'0 24px', display:'flex', justifyContent:'flex-end', alignItems:'center'}}>
          <Button icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </Header>
        <Content style={{margin:'24px 16px', padding:24, background:'#fff'}}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}