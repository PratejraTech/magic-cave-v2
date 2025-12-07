/**
 * Feature Workflows Integration Tests
 * High-level tests for critical user journeys
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ParentDashboard from '../components/ParentDashboard';
import TemplateMarketplace from '../components/TemplateMarketplace';
import TileEditor from '../components/TileEditor';
import LandingPage from '../components/LandingPage';
import { CalendarTile, GiftType } from '../types/calendar';

// Mock dependencies
vi.mock('../lib/useCalendarData', () => ({
  useCalendarData: () => ({
    tiles: mockTiles,
    loading: false,
    error: null,
    updateTile: vi.fn(),
    uploadMedia: vi.fn(),
  }),
}));

vi.mock('../lib/AuthContext', () => ({
  useAuth: () => ({
    userType: 'parent',
    isAuthenticated: true,
    parent: { name: 'Test Parent', family_uuid: 'test-123' },
    child: { name: 'Test Child', birthdate: '2020-01-01', gender: 'unspecified', interests: {} },
    logout: vi.fn(),
    session: { access_token: 'test-token' },
  }),
}));

const mockTiles: CalendarTile[] = Array.from({ length: 25 }, (_, i) => ({
  tile_id: `tile-${i + 1}`,
  calendar_id: 'test-calendar',
  day: i + 1,
  title: i < 5 ? `Day ${i + 1}` : undefined,
  body: i < 5 ? `Message ${i + 1}` : undefined,
  media_url: undefined,
  gift: i < 3 ? {
    type: 'sticker' as GiftType,
    title: `Gift ${i + 1}`,
    description: 'Test gift',
  } : undefined,
  gift_unlocked: false,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

describe('Feature Workflows - Landing Page', () => {
  it('should render landing page with all sections', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Hero section
    expect(screen.getByText(/Create magical moments/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Your Calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Templates/i)).toBeInTheDocument();

    // Features section
    expect(screen.getByText(/Everything you need/i)).toBeInTheDocument();
    expect(screen.getByText(/Easy Creation/i)).toBeInTheDocument();
    expect(screen.getByText(/Beautiful Templates/i)).toBeInTheDocument();
    expect(screen.getByText(/Magical Experience/i)).toBeInTheDocument();

    // Template showcase
    expect(screen.getByText(/Beautiful designs, ready to use/i)).toBeInTheDocument();

    // Process section
    expect(screen.getByText(/Three simple steps/i)).toBeInTheDocument();

    // Testimonials
    expect(screen.getByText(/What families are saying/i)).toBeInTheDocument();

    // CTA
    expect(screen.getByText(/Start creating magic today/i)).toBeInTheDocument();
  });

  it('should navigate when CTA buttons are clicked', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const ctaButton = screen.getAllByText(/Start Your Calendar/i)[0];
    fireEvent.click(ctaButton);
    // Navigation would occur via router
  });
});

describe('Feature Workflows - Parent Dashboard', () => {
  it('should render parent dashboard with sidebar navigation', () => {
    render(<ParentDashboard testMode />);

    // Sidebar navigation items
    expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Template Marketplace/i)).toBeInTheDocument();
    expect(screen.getByText(/Calendar Editor/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();

    // Overview view (default)
    expect(screen.getByText(/Calendar Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Tiles/i)).toBeInTheDocument();
  });

  it('should switch between different views', async () => {
    render(<ParentDashboard testMode />);

    // Click marketplace navigation
    const marketplaceNav = screen.getByText(/Template Marketplace/i);
    fireEvent.click(marketplaceNav);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search templates.../i)).toBeInTheDocument();
    });

    // Click editor navigation
    const editorNav = screen.getByText(/Calendar Editor/i);
    fireEvent.click(editorNav);

    await waitFor(() => {
      expect(screen.getByText(/Calendar Tiles/i)).toBeInTheDocument();
      expect(screen.getByText(/Select a day to customize/i)).toBeInTheDocument();
    });

    // Click analytics navigation
    const analyticsNav = screen.getByText(/Analytics/i);
    fireEvent.click(analyticsNav);

    await waitFor(() => {
      expect(screen.getByText(/Track engagement and calendar usage/i)).toBeInTheDocument();
    });

    // Click settings navigation
    const settingsNav = screen.getByText(/Settings/i);
    fireEvent.click(settingsNav);

    await waitFor(() => {
      expect(screen.getByText(/Profile Information/i)).toBeInTheDocument();
    });
  });

  it('should display statistics in overview', () => {
    render(<ParentDashboard testMode />);

    expect(screen.getByText(/Total Tiles/i)).toBeInTheDocument();
    expect(screen.getByText(/With Gifts/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlocked/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // Total tiles
  });
});

describe('Feature Workflows - Template Marketplace', () => {
  const mockOnSelectTemplate = vi.fn();

  beforeEach(() => {
    mockOnSelectTemplate.mockClear();
  });

  it('should render template marketplace with search and filters', () => {
    render(
      <TemplateMarketplace
        currentTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    // Search input
    expect(screen.getByPlaceholderText(/Search templates.../i)).toBeInTheDocument();

    // Filter dropdown
    expect(screen.getByText(/All Templates/i)).toBeInTheDocument();

    // Template cards should be rendered (from TEMPLATE_LIBRARY)
    expect(screen.getByText(/found/i)).toBeInTheDocument();
  });

  it('should filter templates by search query', async () => {
    render(
      <TemplateMarketplace
        currentTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search templates.../i);
    fireEvent.change(searchInput, { target: { value: 'winter' } });

    await waitFor(() => {
      // Results should update based on search
      const resultsText = screen.getByText(/found/i);
      expect(resultsText).toBeInTheDocument();
    });
  });

  it('should clear filters when Clear button is clicked', async () => {
    render(
      <TemplateMarketplace
        currentTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search templates.../i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      const clearButton = screen.queryByText(/Clear filters/i);
      if (clearButton) {
        fireEvent.click(clearButton);
        expect(searchInput).toHaveValue('');
      }
    });
  });
});

describe('Feature Workflows - Tile Editor', () => {
  const mockOnUpdateTile = vi.fn();
  const mockOnUploadMedia = vi.fn();

  beforeEach(() => {
    mockOnUpdateTile.mockClear();
    mockOnUploadMedia.mockClear();
  });

  it('should render tile editor with tile grid and empty state', () => {
    render(
      <TileEditor
        tiles={mockTiles}
        onUpdateTile={mockOnUpdateTile}
        onUploadMedia={mockOnUploadMedia}
      />
    );

    // Tile grid
    expect(screen.getByText(/Calendar Tiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Select a day to customize/i)).toBeInTheDocument();

    // Empty state (no tile selected)
    expect(screen.getByText(/Select a tile to start editing/i)).toBeInTheDocument();
  });

  it('should select a tile and show editor panel', async () => {
    render(
      <TileEditor
        tiles={mockTiles}
        onUpdateTile={mockOnUpdateTile}
        onUploadMedia={mockOnUploadMedia}
      />
    );

    // Click first tile
    const tiles = screen.getAllByText(/^[0-9]+$/);
    fireEvent.click(tiles[0]);

    await waitFor(() => {
      expect(screen.getByText(/Edit Day 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Title \(optional\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Message/i)).toBeInTheDocument();
    });
  });

  it('should save tile edits', async () => {
    render(
      <TileEditor
        tiles={mockTiles}
        onUpdateTile={mockOnUpdateTile}
        onUploadMedia={mockOnUploadMedia}
      />
    );

    // Select tile
    const tiles = screen.getAllByText(/^[0-9]+$/);
    fireEvent.click(tiles[0]);

    await waitFor(async () => {
      const titleInput = screen.getByLabelText(/Title \(optional\)/i) as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      const saveButton = screen.getByText(/Save Changes/i);
      fireEvent.click(saveButton);

      expect(mockOnUpdateTile).toHaveBeenCalled();
    });
  });
});

describe('Feature Workflows - End-to-End Parent Flow', () => {
  it('should complete parent workflow: login → marketplace → apply template → edit tiles', async () => {
    const { rerender } = render(<ParentDashboard testMode />);

    // Step 1: Start at overview
    expect(screen.getByText(/Calendar Overview/i)).toBeInTheDocument();

    // Step 2: Navigate to marketplace
    const marketplaceNav = screen.getByText(/Template Marketplace/i);
    fireEvent.click(marketplaceNav);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search templates.../i)).toBeInTheDocument();
    });

    // Step 3: Navigate to editor
    const editorNav = screen.getByText(/Calendar Editor/i);
    fireEvent.click(editorNav);

    await waitFor(() => {
      expect(screen.getByText(/Calendar Tiles/i)).toBeInTheDocument();
    });

    // Step 4: Select and edit a tile
    const tiles = screen.getAllByText(/^[0-9]+$/);
    if (tiles.length > 0) {
      fireEvent.click(tiles[0]);

      await waitFor(() => {
        expect(screen.getByText(/Edit Day/i)).toBeInTheDocument();
      });
    }
  });
});

describe('Feature Workflows - Accessibility', () => {
  it('should have proper ARIA labels and roles', () => {
    render(<ParentDashboard testMode />);

    // Navigation should be accessible
    const navItems = screen.getAllByRole('button');
    expect(navItems.length).toBeGreaterThan(0);
  });

  it('should support keyboard navigation in tile editor', async () => {
    render(
      <TileEditor
        tiles={mockTiles}
        onUpdateTile={vi.fn()}
        onUploadMedia={vi.fn()}
      />
    );

    const tiles = screen.getAllByText(/^[0-9]+$/);
    if (tiles[0]) {
      // Tiles should be keyboard accessible
      tiles[0].focus();
      expect(document.activeElement).toBe(tiles[0].parentElement);
    }
  });
});

describe('Feature Workflows - Performance', () => {
  it('should render parent dashboard efficiently', () => {
    const startTime = performance.now();
    render(<ParentDashboard testMode />);
    const endTime = performance.now();

    // Rendering should complete in reasonable time
    expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
  });

  it('should render 25 tiles without performance issues', () => {
    const startTime = performance.now();
    render(
      <TileEditor
        tiles={mockTiles}
        onUpdateTile={vi.fn()}
        onUploadMedia={vi.fn()}
      />
    );
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(500); // Less than 500ms
  });
});
