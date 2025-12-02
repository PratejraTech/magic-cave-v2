import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import Modal from '../components/Modal';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

describe('Modal', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal
        isOpen={false}
        onClose={vi.fn()}
        title="Test Title"
        text="Test text"
        photo="/test.jpg"
      />
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        text="Test text"
        photo="/test.jpg"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    // Check that the text content is present (split into spans)
    expect(screen.getByText((_content, element) => {
      return element?.textContent === 'Test text';
    })).toBeInTheDocument();
    expect(screen.getByAltText('Memory')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Test Title"
        text="Test text"
        photo="/test.jpg"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Test Title"
        text="Test text"
        photo="/test.jpg"
      />
    );

    // Click on the backdrop (the outer div)
    const backdrop = screen.getByText('Test Title').parentElement?.parentElement;
    fireEvent.click(backdrop!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Test Title"
        text="Test text"
        photo="/test.jpg"
      />
    );

    // Click on the modal content (should not close)
    fireEvent.click(screen.getByText('Test Title'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays the correct image', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        text="Test text"
        photo="/custom-image.jpg"
      />
    );

    const image = screen.getByAltText('Memory');
    expect(image).toHaveAttribute('src', '/custom-image.jpg');
  });

  it('has proper accessibility structure', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        text="Test text"
        photo="/test.jpg"
      />
    );

    // Check that the modal has a heading
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();

    // Check that the close button is accessible
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
  });
});