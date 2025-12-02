import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { Snowfall } from '../features/advent/components/Snowfall';
import { NorthernLights } from '../features/advent/components/NorthernLights';
import { ButterflyCollection } from '../features/advent/components/ButterflyCollection';
import { FloatingFireflies } from '../features/advent/components/FloatingFireflies';

vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => ({
      play: vi.fn(),
    }),
  },
}));

describe('Visual Effects', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a field of snowflakes', () => {
    const { container } = render(<Snowfall />);
    expect(container.querySelector('.snowflake')).toBeInTheDocument();
  });

  it('renders the aurora curtain', () => {
    render(<NorthernLights />);
    expect(document.querySelector('.northern-lights')).toBeInTheDocument();
  });

  it('spawns butterflies over time', () => {
    vi.useFakeTimers();
    render(<ButterflyCollection onButterflyCaught={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(document.querySelector('.butterfly')).toBeInTheDocument();
  });

  it('renders floating fireflies', () => {
    render(<FloatingFireflies />);
    expect(document.querySelector('.firefly')).toBeInTheDocument();
  });
});
