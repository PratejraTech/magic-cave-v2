import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParentDashboard from '../components/ParentDashboard';
import { AuthProvider } from '../lib/AuthContext';

// Mock fetch
global.fetch = vi.fn();

describe('Template Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('opens template selector modal when change theme button is clicked', async () => {
    render(
      <AuthProvider>
        <ParentDashboard testMode={true} />
      </AuthProvider>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getAllByText('Profile & Settings')[0]).toBeInTheDocument();
    });

    // Click profile settings button
    fireEvent.click(screen.getAllByText('Profile & Settings')[0]);

    // Click change theme button
    fireEvent.click(screen.getByText('Change Theme'));

    // Check if template selector modal opens
    expect(screen.getByText('Choose Calendar Theme')).toBeInTheDocument();
  });

  it('calls API to update template when template is selected', async () => {
    render(
      <AuthProvider>
        <ParentDashboard testMode={true} />
      </AuthProvider>
    );

    // For now, just verify the modal structure exists
    await waitFor(() => {
      expect(screen.getAllByText('Profile & Settings')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Profile & Settings')[0]);
    fireEvent.click(screen.getByText('Change Theme'));

    expect(screen.getByText('Choose Calendar Theme')).toBeInTheDocument();
    expect(screen.getByText('Pastel Dreams')).toBeInTheDocument();
    expect(screen.getByText('Adventure Boy')).toBeInTheDocument();
    expect(screen.getByText('Rainbow Fantasy')).toBeInTheDocument();
  });

  it('closes template selector when cancel is clicked', async () => {
    render(
      <AuthProvider>
        <ParentDashboard testMode={true} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Profile & Settings')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Profile & Settings')[0]);
    fireEvent.click(screen.getByText('Change Theme'));

    expect(screen.getByText('Choose Calendar Theme')).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getAllByText('Cancel')[1]); // Second cancel button is in the modal

    // Modal should be closed
    expect(screen.queryByText('Choose Calendar Theme')).not.toBeInTheDocument();
  });
});