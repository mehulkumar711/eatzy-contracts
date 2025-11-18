import { useRouteError, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';

export default function RouteErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  console.error('Route Error:', error);

  return (
    <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
      <Result
        status="error"
        title="Application Error"
        subTitle={error.message || 'Something went wrong.'}
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        }
      />
    </div>
  );
}   