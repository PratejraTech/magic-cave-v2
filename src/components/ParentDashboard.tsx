import React, { useState } from 'react';
import TileEditor from './TileEditor';
import TemplateMarketplace from './TemplateMarketplace';
import TemplateErrorBoundary from './TemplateErrorBoundary';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { CalendarTile, Parent } from '../types/calendar';
import { analytics } from '../lib/analytics';
import { applyTemplateStyling } from '../lib/templateStyling';
import { getTemplateDefinition } from '../data/templates';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Edit3,
  BarChart3,
  Settings,
  Gift,
  Image,
  Star
} from 'lucide-react';
import { Button } from './ui/WonderButton';
import { Sidebar, SidebarSection } from './ui/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardStat, CardStatLabel, CardStatValue } from './ui/card';

// Import system prompt templates
const SYSTEM_PROMPT_TEMPLATES = [
  {
    id: 'dad',
    name: 'Dad',
    description: 'Warm, steady, and protective father figure',
  },
  {
    id: 'mum',
    name: 'Mum',
    description: 'Nurturing, warm, and gentle mother figure',
  },
  {
    id: 'grandpa',
    name: 'Grandpa',
    description: 'Wise, storytelling grandfather figure',
  },
  {
    id: 'grandma',
    name: 'Grandma',
    description: 'Caring, baking grandmother figure',
  },
];

type ViewType = 'overview' | 'marketplace' | 'editor' | 'analytics' | 'settings';

interface ParentDashboardProps {
  testMode?: boolean;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ testMode = false }) => {
  const { userType, isAuthenticated, parent, child, logout, session } = useAuth();
  const { tiles, loading, error, updateTile, uploadMedia } = useCalendarData();
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    parentName: parent?.name || '',
    childName: child?.name || '',
    childBirthdate: child?.birthdate || '',
    childGender: child?.gender || 'unspecified',
    interests: child?.interests || {},
    notificationsEnabled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    systemPromptTemplate: 'dad', // Default to dad
  });

  // Only allow parents to access this dashboard (unless in test mode)
  if (!testMode && (!isAuthenticated || userType !== 'parent')) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Parents Only</CardTitle>
            <CardDescription>Sign in to craft magical surprises for your little ones.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              fullWidth
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = '/auth')}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-bg-muted border-t-primary-rose" />
            <p className="text-text-secondary">Loading your calendar...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Something Went Wrong</CardTitle>
            <CardDescription>Refresh and we'll try again.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-secondary">{error}</p>
            <Button
              fullWidth
              variant="primary"
              size="lg"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateTile = async (tileId: string, updates: Partial<CalendarTile>) => {
    try {
      await updateTile(tileId, updates);
    } catch (err) {
      console.error('Failed to update tile:', err);
      // TODO: Show error message to user
    }
  };

  const handleUploadMedia = async (tileId: string, file: File): Promise<string> => {
    try {
      return await uploadMedia(tileId, file);
    } catch (err) {
      console.error('Failed to upload media:', err);
      throw err;
    }
  };

  const handleExportPDF = async () => {
    try {
      // Get the API base URL
      const importMetaEnv = import.meta as { env?: { VITE_CHAT_API_URL?: string; CHAT_API_URL?: string; PROD?: boolean; VITE_SUPABASE_ANON_KEY?: string } };
      const API_BASE = importMetaEnv.env?.VITE_CHAT_API_URL || importMetaEnv.env?.CHAT_API_URL || (importMetaEnv.env?.PROD ? '' : 'https://toharper.dad');

      // Make request to export endpoint
      const response = await fetch(`${API_BASE}/api/export/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${importMetaEnv.env?.VITE_SUPABASE_ANON_KEY || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

       // Create download link
       const blob = await response.blob();
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'advent-calendar.html'; // For now, HTML download
       document.body.appendChild(a);
       a.click();
       window.URL.revokeObjectURL(url);
       document.body.removeChild(a);

       // Log PDF export event
       analytics.logPdfExport(tiles[0]?.calendar_id || '', tiles.length);

    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export calendar. Please try again.');
    }
  };

  // Sidebar navigation
  const sidebarSections: SidebarSection[] = [
    {
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard className="h-5 w-5" />,
          onClick: () => setCurrentView('overview')
        },
        {
          id: 'marketplace',
          label: 'Template Marketplace',
          icon: <ShoppingBag className="h-5 w-5" />,
          onClick: () => setCurrentView('marketplace'),
          featured: true
        },
        {
          id: 'editor',
          label: 'Calendar Editor',
          icon: <Edit3 className="h-5 w-5" />,
          onClick: () => setCurrentView('editor')
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: <BarChart3 className="h-5 w-5" />,
          onClick: () => setCurrentView('analytics')
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          onClick: () => setCurrentView('settings')
        }
      ]
    }
  ];

  // Render different views
  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView tiles={tiles} onNavigate={setCurrentView} />;

      case 'marketplace':
        return (
          <MarketplaceView
            currentTemplate={currentTemplate}
            onSelectTemplate={async (templateId: string) => {
              try {
                if (!session?.access_token) {
                  throw new Error('Not authenticated');
                }

                const response = await fetch('/api/calendar/template', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({ templateId }),
                });

                if (!response.ok) {
                  let errorMessage = `Failed to update template (${response.status})`;
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (parseError) {
                    console.error('Failed to parse error response JSON:', parseError);
                    errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`;
                  }
                  throw new Error(errorMessage);
                }

                // Log template change event
                analytics.logTemplateChange(templateId, currentTemplate || undefined);

                setCurrentTemplate(templateId);

                const templateDefinition = getTemplateDefinition(templateId);
                if (templateDefinition) {
                  applyTemplateStyling(templateDefinition.metadata, templateDefinition.id);
                }

                alert('Template applied successfully!');
              } catch (error) {
                console.error('Failed to update template:', error);
                alert('Failed to update calendar theme. Please try again.');
              }
            }}
          />
        );

      case 'editor':
        return (
          <EditorView
            tiles={tiles}
            onUpdateTile={handleUpdateTile}
            onUploadMedia={handleUploadMedia}
            childName={child?.name}
            childAge={child?.birthdate ? new Date().getFullYear() - new Date(child.birthdate).getFullYear() : 3}
            parentType={profileForm.systemPromptTemplate}
            childInterests={child?.interests}
          />
        );

      case 'analytics':
        return <AnalyticsView tiles={tiles} onExportPDF={handleExportPDF} />;

      case 'settings':
        return (
          <SettingsView
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            parent={parent}
            logout={logout}
          />
        );

      default:
        return <OverviewView tiles={tiles} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft flex">
      {/* Sidebar */}
      <Sidebar
        sections={sidebarSections}
        activeItemId={currentView}
        header={
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Parent Dashboard</h2>
            <p className="text-sm text-text-tertiary mt-1">
              Welcome, {parent?.name || 'Parent'}
            </p>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{ tiles: CalendarTile[]; onNavigate: (view: ViewType) => void }> = ({ tiles, onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display">Calendar Overview</h1>
        <p className="text-text-secondary mt-2">Manage your advent calendar and track progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="stats">
          <CardContent className="pt-6">
            <CardStat>
              <CardStatLabel>Total Tiles</CardStatLabel>
              <CardStatValue>{tiles.length}</CardStatValue>
            </CardStat>
          </CardContent>
        </Card>

        <Card variant="stats">
          <CardContent className="pt-6">
            <CardStat>
              <CardStatLabel>With Gifts</CardStatLabel>
              <CardStatValue>{tiles.filter(t => t.gift).length}</CardStatValue>
            </CardStat>
          </CardContent>
        </Card>

        <Card variant="stats">
          <CardContent className="pt-6">
            <CardStat>
              <CardStatLabel>Unlocked</CardStatLabel>
              <CardStatValue>{tiles.filter(t => t.gift_unlocked).length}</CardStatValue>
            </CardStat>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate('marketplace')}
            leftIcon={<ShoppingBag className="h-5 w-5" />}
          >
            Browse Templates
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate('editor')}
            leftIcon={<Edit3 className="h-5 w-5" />}
          >
            Edit Calendar
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate('analytics')}
            leftIcon={<BarChart3 className="h-5 w-5" />}
          >
            View Analytics
          </Button>
        </CardContent>
      </Card>

      {/* Calendar Preview Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Preview</CardTitle>
          <CardDescription>25 days of December magic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((day) => {
              const tile = tiles.find(t => t.day === day);
              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-xl border-2 border-bg-muted bg-white p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-rose transition-colors"
                >
                  <div className="text-xs font-medium text-text-tertiary">Day {day}</div>
                  {tile?.title && (
                    <div className="text-xs text-text-primary mt-1 truncate w-full" title={tile.title}>
                      {tile.title}
                    </div>
                  )}
                  <div className="flex gap-1 mt-2">
                    {tile?.media_url && <Image className="h-3 w-3 text-primary-rose" />}
                    {tile?.gift && <Gift className="h-3 w-3 text-primary-purple" />}
                    {tile?.gift_unlocked && <Star className="h-3 w-3 text-primary-peach" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Marketplace View Component
const MarketplaceView: React.FC<{ currentTemplate: string | null; onSelectTemplate: (id: string) => void }> = ({ currentTemplate, onSelectTemplate }) => {
  return (
    <TemplateErrorBoundary>
      <TemplateMarketplace
        currentTemplate={currentTemplate}
        onSelectTemplate={onSelectTemplate}
      />
    </TemplateErrorBoundary>
  );
};

// Editor View Component
const EditorView: React.FC<{
  tiles: CalendarTile[];
  onUpdateTile: (id: string, updates: Partial<CalendarTile>) => void;
  onUploadMedia: (id: string, file: File) => Promise<string>;
  childName?: string;
  childAge?: number;
  parentType?: string;
  childInterests?: Record<string, boolean>;
}> = ({ tiles, onUpdateTile, onUploadMedia, childName, childAge, parentType, childInterests }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display">Calendar Editor</h1>
        <p className="text-text-secondary mt-2">Customize each day with messages, photos, and gifts</p>
      </div>

      <TileEditor
        tiles={tiles}
        onUpdateTile={onUpdateTile}
        onUploadMedia={onUploadMedia}
        onClose={() => {}} // No close needed in inline view
        childName={childName}
        childAge={childAge}
        parentType={parentType}
        childInterests={childInterests}
      />
    </div>
  );
};

// Analytics View Component
const AnalyticsView: React.FC<{ tiles: CalendarTile[]; onExportPDF: () => void }> = ({ tiles, onExportPDF }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-display">Analytics</h1>
          <p className="text-text-secondary mt-2">Track engagement and calendar usage</p>
        </div>
        <Button variant="primary" onClick={onExportPDF}>
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="stats">
          <CardContent className="pt-6">
            <CardStat>
              <CardStatLabel>Gifts Unlocked</CardStatLabel>
              <CardStatValue>{tiles.filter(t => t.gift_unlocked).length}</CardStatValue>
            </CardStat>
          </CardContent>
        </Card>

        <Card variant="stats">
          <CardContent className="pt-6">
            <CardStat>
              <CardStatLabel>With Media</CardStatLabel>
              <CardStatValue>{tiles.filter(t => t.media_url).length}</CardStatValue>
            </CardStat>
          </CardContent>
        </Card>

        <Card variant="stats">
          <CardContent className="pt-6">
            <CardStat>
              <CardStatLabel>Child Notes</CardStatLabel>
              <CardStatValue>{tiles.filter(t => t.note_from_child).length}</CardStatValue>
            </CardStat>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-text-secondary">Detailed analytics dashboard coming soon!</p>
          <p className="text-sm text-text-tertiary mt-2">Track user engagement, tile interactions, and calendar usage.</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings View Component
interface ProfileFormData {
  parentName: string;
  childName: string;
  childBirthdate: string;
  childGender: 'male' | 'female' | 'other' | 'unspecified';
  interests: Record<string, boolean>;
  notificationsEnabled: boolean;
  timezone: string;
  systemPromptTemplate: string;
}

const SettingsView: React.FC<{
  profileForm: ProfileFormData;
  setProfileForm: (form: ProfileFormData) => void;
  parent: Parent | null;
  logout: () => void;
}> = ({ profileForm, setProfileForm, parent, logout }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display">Settings</h1>
        <p className="text-text-secondary mt-2">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your family details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Parent Name</label>
              <input
                type="text"
                value={profileForm.parentName}
                onChange={(e) => setProfileForm({ ...profileForm, parentName: e.target.value })}
                className="w-full px-4 py-2 border border-bg-muted rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-rose focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Child Name</label>
              <input
                type="text"
                value={profileForm.childName}
                onChange={(e) => setProfileForm({ ...profileForm, childName: e.target.value })}
                className="w-full px-4 py-2 border border-bg-muted rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-rose focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Birthdate</label>
              <input
                type="date"
                value={profileForm.childBirthdate}
                onChange={(e) => setProfileForm({ ...profileForm, childBirthdate: e.target.value })}
                className="w-full px-4 py-2 border border-bg-muted rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-rose focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Gender</label>
              <select
                value={profileForm.childGender}
                onChange={(e) => setProfileForm({ ...profileForm, childGender: e.target.value as 'male' | 'female' | 'other' | 'unspecified' })}
                className="w-full px-4 py-2 border border-bg-muted rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-rose focus:border-transparent"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="unspecified">Unspecified</option>
              </select>
            </div>

            <Button variant="primary" fullWidth>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Timezone</label>
              <select
                value={profileForm.timezone}
                onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-bg-muted rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-rose focus:border-transparent"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">AI Chat Personality</label>
              <select
                value={profileForm.systemPromptTemplate}
                onChange={(e) => setProfileForm({ ...profileForm, systemPromptTemplate: e.target.value })}
                className="w-full px-4 py-2 border border-bg-muted rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-rose focus:border-transparent"
              >
                {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                fullWidth
                variant="outline"
                onClick={() => (window.location.href = '/child/calendar')}
              >
                Switch to Child View
              </Button>
              <Button
                fullWidth
                variant="danger"
                onClick={async () => {
                  if (confirm('Are you sure you want to log out?')) {
                    await logout();
                    window.location.href = '/auth';
                  }
                }}
              >
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Child Login Credentials */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Child Login Credentials</CardTitle>
            <CardDescription>Share these credentials with your child</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-bg-soft rounded-lg">
              <div className="text-sm text-text-primary mb-2">
                <strong>Family Code:</strong> {parent?.family_uuid || 'Not available'}
              </div>
              <div className="text-sm text-text-primary">
                <strong>Password:</strong> Temporary password generated during signup
              </div>
            </div>
            <Button variant="outline">
              Regenerate Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
