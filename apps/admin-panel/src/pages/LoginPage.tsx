// apps/admin-panel/src/pages/LoginPage.tsx

import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Calls the new backend endpoint: /api/v1/auth/admin/login
      const { data } = await api.post('/auth/admin/login', values);
      
      // In a real system, you'd decode the token for user info, 
      // but for now, use a placeholder and rely on the successful token.
      login(data.access_token, { username: values.username, role: 'admin' });
      
      message.success('Welcome Admin, Authentication successful!');
      navigate('/dashboard');
    } catch (err) {
      // Error is handled and displayed by the api.ts interceptor
      console.error('Login attempt failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-gray-100" style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#1f1f1f'}}>
      <Card 
        title={<Title level={3} style={{textAlign:'center', color:'#fff'}}>Eatzy Admin Portal</Title>} 
        className="tw-shadow-2xl"
        style={{width:400, background: '#2c2c2c', borderColor: '#444' }}
        headStyle={{ borderBottom: 'none' }}
        bodyStyle={{ padding: '0 24px 24px 24px' }}
      >
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: 'Please enter your Admin ID' }]}>
            <Input prefix={<UserOutlined style={{color:'#1890ff'}} />} placeholder="Admin ID" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your Password' }]}>
            <Input.Password prefix={<LockOutlined style={{color:'#1890ff'}} />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" className="tw-mt-4">
              Secure Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}