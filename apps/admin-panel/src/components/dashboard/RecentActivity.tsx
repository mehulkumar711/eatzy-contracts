
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Activity {
    key: string;
    user: string;
    action: string;
    status: string;
    time: string;
}

const columns: ColumnsType<Activity> = [
    {
        title: 'User',
        dataIndex: 'user',
        key: 'user',
    },
    {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
    },
    {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        render: (_, { status }) => {
            let color = 'green';
            if (status === 'Pending') color = 'volcano';
            if (status === 'Failed') color = 'red';
            return (
                <Tag color={color} key={status}>
                    {status.toUpperCase()}
                </Tag>
            );
        },
    },
    {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        className: 'tw-text-gray-500',
    },
];

const data: Activity[] = [
    {
        key: '1',
        user: 'John Brown',
        action: 'Placed Order #1001',
        status: 'Completed',
        time: '2 mins ago',
    },
    {
        key: '2',
        user: 'Jim Green',
        action: 'Registered',
        status: 'Completed',
        time: '15 mins ago',
    },
    {
        key: '3',
        user: 'Joe Black',
        action: 'Payment Failed',
        status: 'Failed',
        time: '1 hour ago',
    },
];

export default function RecentActivity() {
    return (
        <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-sm">
            <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Recent Activity (Mock)</h3>
            <Table columns={columns} dataSource={data} pagination={false} />
        </div>
    );
}
