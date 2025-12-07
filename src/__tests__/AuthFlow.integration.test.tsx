import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AuthModal from '../components/AuthModal';
import { authService } from '../lib/auth';
import { analytics } from '../lib/analytics';

vi.mock('../lib/auth', () => {
  const signInWithEmail = vi.fn();
  const signInWithOAuth = vi.fn();
  return {
    authService: {
      signInWithEmail,
      signInWithOAuth
    },
    AuthUtils: {
      isValidBirthdate: vi.fn(() => ({ valid: true }))
    }
  };
});

vi.mock('../lib/analytics', () => ({
  analytics: {
    logLogin: vi.fn(),
    logSignup: vi.fn()
  }
}));

vi.mock('../components/TemplateSelector', () => ({
  __esModule: true,
  default: ({ onSelectTemplate }: { onSelectTemplate: (value: string) => void }) => (
    <button type="button" onClick={() => onSelectTemplate('snow-village')}>
      Choose Snow Template
    </button>
  )
}));

const originalFetch = global.fetch;
const mockSignInWithEmail = authService.signInWithEmail as unknown as ReturnType<typeof vi.fn>;

const changeFieldValue = (labelText: string, value: string) => {
  const label = screen.getByText(labelText, { selector: 'label' });
  const container = label.parentElement;
  const control = container?.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  if (!control) {
    throw new Error(`No form control found for label ${labelText}`);
  }
  fireEvent.change(control, { target: { value } });
};

describe('AuthModal integration flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ child: { id: 'child-1', name: 'Lyra' } })
      } as Response)
    ) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('completes the registration workflow and signs the user in', async () => {
    const onSuccess = vi.fn();
    render(<AuthModal isOpen onClose={vi.fn()} onSuccess={onSuccess} />);

    changeFieldValue('Full Name *', 'Parent One');
    changeFieldValue('Email *', 'parent@example.com');
    changeFieldValue('Password *', 'Secret123!');

    changeFieldValue("Child's Name *", 'Lyra');
    changeFieldValue('Birthdate *', '2018-12-01');
    changeFieldValue('Gender *', 'female');

    fireEvent.click(screen.getByRole('button', { name: /Choose Snow Template/i }));

    mockSignInWithEmail.mockResolvedValueOnce({ user: { id: 'parent-1' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/signup',
      expect.objectContaining({ method: 'POST' })
    ));

    await waitFor(() => expect(authService.signInWithEmail).toHaveBeenCalledWith('parent@example.com', 'Secret123!'));
    expect(analytics.logSignup).toHaveBeenCalledWith('email_magic_link');
    expect(onSuccess).toHaveBeenCalledWith({ id: 'parent-1' }, { id: 'child-1', name: 'Lyra' });
  });

  it('logs in an existing parent through the email flow', async () => {
    const onSuccess = vi.fn();
    render(<AuthModal isOpen onClose={vi.fn()} onSuccess={onSuccess} />);

    const toggleButton = screen.getAllByRole('button', { name: /^Sign in$/i })[0];
    fireEvent.click(toggleButton);

    changeFieldValue('Email', 'existing@example.com');
    changeFieldValue('Password', 'letMeIn!');

    mockSignInWithEmail.mockResolvedValueOnce({ user: { id: 'parent-existing' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(authService.signInWithEmail).toHaveBeenCalledWith('existing@example.com', 'letMeIn!'));
    expect(analytics.logLogin).toHaveBeenCalledWith('parent', 'email_magic_link');
  });
});
