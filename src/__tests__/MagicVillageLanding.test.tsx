import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';

const ROUTES = ['Experience', 'Templates', 'Gifts', 'Contact'];

const calendarRoutes = ['Start Calendar', 'Send Storybook Invite'] as const;

let originalLocation: Location;
const hrefSpy = vi.fn();
let scrollSpy: ReturnType<typeof vi.spyOn> | null = null;
const originalScrollIntoView = Element.prototype.scrollIntoView ?? null;

class MockIntersectionObserver {
  readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    return this;
  }
  unobserve() {
    return this;
  }
  disconnect() {
    return this;
  }
}

describe('MagicVillageLanding', () => {
  beforeAll(() => {
    originalLocation = window.location;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    if (!Element.prototype.scrollIntoView) {
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: () => {}
      });
    }
  });

  afterAll(() => {
    // @ts-expect-error reassigning for tests
    window.location = originalLocation;
    if (originalScrollIntoView) {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    } else {
      delete (Element.prototype as any).scrollIntoView;
    }
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    hrefSpy.mockReset();
    let hrefValue = 'http://localhost/';

    // @ts-expect-error redefine for test spying
    delete window.location;
    // @ts-expect-error define minimal Location subset for test
    window.location = {
      ...originalLocation,
      get href() {
        return hrefValue;
      },
      set href(value: string) {
        hrefValue = value;
        hrefSpy(value);
      }
    };

    scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  });

  afterEach(() => {
    scrollSpy?.mockRestore();
    scrollSpy = null;
  });

  it('renders all major sections with accessible labels', () => {
    render(<App />);

    ROUTES.forEach(route => {
      expect(screen.getByLabelText(`${route} section`)).toBeInTheDocument();
    });

    expect(screen.getByText('Magic Cave Calendars orchestrates AI wonder for every December dawn.')).toBeInTheDocument();
    expect(screen.getByText('AI style conductor for snowy cottages and neon ports alike.')).toBeInTheDocument();
  });

  it('routes every major CTA button to the calendar workflow', () => {
    render(<App />);

    calendarRoutes.forEach(label => {
      const link =
        screen.getAllByRole('link', { name: new RegExp(label, 'i') })[0] ??
        screen.getAllByRole('button', { name: new RegExp(label, 'i') })[0];
      link.addEventListener(
        'click',
        event => {
          event.preventDefault();
        },
        { once: true }
      );
      fireEvent.click(link);
    });

    expect(hrefSpy).toHaveBeenCalledTimes(calendarRoutes.length);
    calendarRoutes.forEach(() => {
      expect(hrefSpy).toHaveBeenCalledWith('/auth');
    });
  });

  it('allows navigation between feature sections through the header controls', () => {
    render(<App />);

    const navButtons = screen.getAllByRole('button');
    const templatesNavButton = navButtons.find(btn => btn.textContent?.trim() === 'Templates') as HTMLButtonElement;
    const giftsNavButton = navButtons.find(btn => btn.textContent?.trim() === 'Gifts') as HTMLButtonElement;

    fireEvent.click(templatesNavButton);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(templatesNavButton.querySelector('span')).not.toBeNull();

    fireEvent.click(giftsNavButton);
    expect(giftsNavButton.querySelector('span')).not.toBeNull();

    const giftsSection = screen.getAllByLabelText('Gifts section')[0];
    expect(giftsSection).toBeInTheDocument();
    expect(within(giftsSection).getByText('Quantum gift vault for experiences, downloads, and cozy notes.')).toBeInTheDocument();
  });
});
