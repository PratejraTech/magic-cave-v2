import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import LoadingSpinner from '../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');

    const spinnerElement = screen.getByTestId('loading-spinner');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass('animate-spin', 'rounded-full', 'border-2', 'h-8', 'w-8', 'border-blue-500');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinnerElement = screen.getByTestId('loading-spinner');
    expect(spinnerElement).toHaveClass('h-12', 'w-12');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="green" />);

    const spinnerElement = screen.getByTestId('loading-spinner');
    expect(spinnerElement).toHaveClass('border-green-500');
  });

  it('renders with message', () => {
    render(<LoadingSpinner message="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    const spinnerElement = screen.getByTestId('loading-spinner');
    expect(spinnerElement).toHaveAttribute('aria-hidden', 'true');

    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});