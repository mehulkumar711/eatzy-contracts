import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import { usersApi } from '@/api/users';

export default function DashboardStats() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch real user count (limit 1 just to get metadata)
                const response = await usersApi.getAll({ limit: 1 });
                setUserCount(response.total);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                message.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Row gutter={16} className="tw-mb-6">
            <Col span={8}>
                <Card bordered={false} className="tw-shadow-sm">
                    <Statistic
                        title="Total Users"
                        value={userCount !== null ? userCount : '-'}
                        loading={loading}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card bordered={false} className="tw-shadow-sm">
                    <Statistic
                        title="Total Orders"
                        value={1234} // Mocked
                        prefix={<ShoppingOutlined />}
                        valueStyle={{ color: '#cf1322' }}
                        suffix={<span className="tw-text-xs tw-text-gray-400">(Mock)</span>}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card bordered={false} className="tw-shadow-sm">
                    <Statistic
                        title="Total Revenue"
                        value={98765} // Mocked
                        precision={2}
                        prefix={<DollarOutlined />}
                        suffix={<span className="tw-text-xs tw-text-gray-400">(Mock)</span>}
                    />
                </Card>
            </Col>
        </Row>
    );
}
