import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import LegacyAuthModal from '../components/LegacyAuthModal';
import { hashString, normalizeBirthdateInput } from '../lib/hashUtils';

// Mock cookieStorage functions before imports
vi.mock('../lib/cookieStorage', () => ({
  setSessionToken: vi.fn(),
  setStoredSessionId: vi.fn(),
  setHarperSession: vi.fn(),
  setGuestSession: vi.fn(),
}));

/**
 * Test suite for LegacyAuthModal authentication flow
 * Simulates the login process with "Grace Janin" and "09/08/2022"
 */
describe('LegacyAuthModal - Login Flow', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  // Mock fetch globally
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup(); // Clean up any previous renders
    vi.clearAllMocks();
    // Set up fetch mock using spyOn to ensure it works
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
    window.history.replaceState = vi.fn();
  });

  afterEach(() => {
    cleanup(); // Clean up after each test
    vi.restoreAllMocks();
  });

  it('should complete full login flow with Grace Janin and 09/08/2022', async () => {
    // Expected hash values
    const EXPECTED_CODE_HASH = '37d905efd806f04be408474870f53ad3'; // "grace janin"
    const EXPECTED_BIRTHDATE_HASH = 'bdb1a45151fd19ff9b7e765edd4280cd'; // "09/08/2022"

    // Mock successful authentication response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        sessionToken: 'test-session-token-123',
        sessionId: 'test-session-id-456',
        userType: 'harper',
      }),
    });

    // Render the modal
    render(
      <LegacyAuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Verify modal is visible
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter access code')).toBeInTheDocument();

    // Step 1: Enter access code "Grace Janin"
    const codeInput = screen.getByPlaceholderText('Enter access code');
    fireEvent.change(codeInput, { target: { value: 'Grace Janin' } });

    // Verify birthdate field appears (because code matches "grace janin")
    await waitFor(() => {
      expect(screen.getByPlaceholderText('DD/MM/YYYY')).toBeInTheDocument();
    });

    // Step 2: Enter birthdate "09/08/2022"
    const birthdateInput = screen.getByPlaceholderText('DD/MM/YYYY');
    fireEvent.change(birthdateInput, { target: { value: '09/08/2022' } });

    // Step 3: Submit the form
    const submitButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(submitButton);

    // Wait for the authentication to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify the API call was made with correct hashes
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[0]).toBe('/api/session-auth');
    expect(fetchCall[1].method).toBe('POST');
    expect(fetchCall[1].headers['Content-Type']).toBe('application/json');

    const requestBody = JSON.parse(fetchCall[1].body);
    
    // Verify code hash
    expect(requestBody.codeHash).toBe(EXPECTED_CODE_HASH);
    
    // Verify birthdate hash
    expect(requestBody.birthdateHash).toBe(EXPECTED_BIRTHDATE_HASH);

    // Verify success callback was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('child');
    }, { timeout: 3000 });

    // Verify modal was closed
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should normalize and hash birthdate correctly for various formats', async () => {
    const testCases = [
      { input: '09/08/2022', expected: '09/08/2022' },
      { input: '9/8/2022', expected: '09/08/2022' },
      { input: '08/09/2022', expected: '09/08/2022' }, // DD/MM/YYYY format
      { input: '8/9/2022', expected: '09/08/2022' },
      { input: '09-08-2022', expected: '09/08/2022' },
      { input: '9.8.2022', expected: '09/08/2022' },
    ];

    const EXPECTED_HASH = 'bdb1a45151fd19ff9b7e765edd4280cd';

    for (const testCase of testCases) {
      // Normalize the input
      const normalized = normalizeBirthdateInput(testCase.input);
      expect(normalized).toBe(testCase.expected);

      // Hash the normalized date
      const hash = await hashString(normalized);
      expect(hash).toBe(EXPECTED_HASH);
    }
  });

  it('should hash access code correctly', async () => {
    const codeInputs = ['Grace Janin', 'grace janin', 'GRACE JANIN', 'grace janin '];

    const EXPECTED_HASH = '37d905efd806f04be408474870f53ad3';

    for (const codeInput of codeInputs) {
      const hash = await hashString(codeInput);
      expect(hash).toBe(EXPECTED_HASH);
    }
  });

  it('should show error when birthdate is required but not provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        requiresBirthdate: true,
        message: 'Please provide birthdate',
      }),
    });

    render(
      <LegacyAuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Enter access code - use getAllByPlaceholderText and get the first one
    const codeInputs = screen.getAllByPlaceholderText('Enter access code');
    const codeInput = codeInputs[codeInputs.length - 1]; // Get the last one (most recent render)
    fireEvent.change(codeInput, { target: { value: 'Grace Janin' } });

    // Wait for birthdate field to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('DD/MM/YYYY')).toBeInTheDocument();
    });

    // Try to submit without birthdate - submit the form directly
    const form = screen.getByRole('button', { name: /continue/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      const submitButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(submitButton);
    }

    // Should show error - the component validates before API call
    // The error is set synchronously, so we can check immediately
    await waitFor(() => {
      expect(screen.getByText('Please enter your birthdate')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Should not call API
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle authentication failure gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid access code',
      }),
    });

    render(
      <LegacyAuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Enter incorrect access code - use getAllByPlaceholderText and get the first one
    const codeInputs = screen.getAllByPlaceholderText('Enter access code');
    const codeInput = codeInputs[codeInputs.length - 1]; // Get the last one (most recent render)
    fireEvent.change(codeInput, { target: { value: 'wrong code' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(submitButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Invalid access code|Authentication failed/)).toBeInTheDocument();
    });

    // Should not call success callback
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <LegacyAuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Enter access code - use getAllByPlaceholderText and get the first one
    const codeInputs = screen.getAllByPlaceholderText('Enter access code');
    const codeInput = codeInputs[codeInputs.length - 1]; // Get the last one (most recent render)
    fireEvent.change(codeInput, { target: { value: 'Grace Janin' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('DD/MM/YYYY')).toBeInTheDocument();
    });

    // Enter birthdate
    const birthdateInput = screen.getByPlaceholderText('DD/MM/YYYY');
    fireEvent.change(birthdateInput, { target: { value: '09/08/2022' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(submitButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong|Network error/)).toBeInTheDocument();
    });

    // Should not call success callback
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should only show birthdate field when access code matches "grace janin"', async () => {
    render(
      <LegacyAuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Initially, birthdate field should not be visible
    expect(screen.queryByPlaceholderText('DD/MM/YYYY')).not.toBeInTheDocument();

    // Enter a different code - use getAllByPlaceholderText and get the first one
    const codeInputs = screen.getAllByPlaceholderText('Enter access code');
    const codeInput = codeInputs[codeInputs.length - 1]; // Get the last one (most recent render)
    fireEvent.change(codeInput, { target: { value: 'guestmoir' } });

    // Birthdate field should still not be visible
    expect(screen.queryByPlaceholderText('DD/MM/YYYY')).not.toBeInTheDocument();

    // Enter "grace janin" (case insensitive)
    fireEvent.change(codeInput, { target: { value: 'Grace Janin' } });

    // Birthdate field should now be visible
    await waitFor(() => {
      expect(screen.getByPlaceholderText('DD/MM/YYYY')).toBeInTheDocument();
    });
  });
});

