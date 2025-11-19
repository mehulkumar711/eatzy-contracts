import { render, screen } from '@testing-library/react';
import VendorsPage from './VendorsPage';
import { vi } from 'vitest';
import { useQuery } from '@tanstack/react-query';

// Mock useQuery
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
}));

describe('VendorsPage', () => {
    it('renders loading state', () => {
        (useQuery as any).mockReturnValue({ isLoading: true, data: undefined, error: undefined });
        render(<VendorsPage />);
        // Ant Design table has built-in loading state
        expect(document.querySelector('.ant-table')).toBeTruthy();
    });

    it('renders error state', () => {
        (useQuery as any).mockReturnValue({ error: new Error('Failed'), isLoading: false, data: undefined });
        render(<VendorsPage />);
        expect(screen.getByText('Failed to Load Vendors')).toBeTruthy();
    });

    it('renders vendor list', () => {
        (useQuery as any).mockReturnValue({
            data: [{ id: '1', name: 'Test Vendor', menuItemCount: 5, createdAt: new Date().toISOString() }],
            isLoading: false,
            error: undefined
        });
        render(<VendorsPage />);
        expect(screen.getByText('Test Vendor')).toBeTruthy();
    });
});
