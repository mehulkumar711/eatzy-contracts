import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', values);
      login(data.access_token, { username: 'Admin' });
      message.success('Welcome Admin');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900" style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#1f1f1f'}}>
      <Card title={<Typography.Title level={3} style={{textAlign:'center'}}>Eatzy Admin</Typography.Title>} style={{width:400}}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="Admin ID" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">Login</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}