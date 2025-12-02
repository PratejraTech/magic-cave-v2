import React, { useState } from 'react';
import TileEditor from './TileEditor';
import TemplateSelector from './TemplateSelector';
import TemplateErrorBoundary from './TemplateErrorBoundary';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { CalendarTile } from '../types/calendar';
import { analytics } from '../lib/analytics';
import { applyTemplateStyling } from '../lib/templateStyling';
import { DEFAULT_TEMPLATES } from '../types/calendar';

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

const AVAILABLE_TEMPLATES = [
  {
    id: DEFAULT_TEMPLATES.PASTEL_DREAMS,
    name: 'Pastel Dreams',
    description: 'Soft pastel colors with dreamy illustrations perfect for little dreamers',
    metadata: {
      colors: { primary: '#FFB3BA', secondary: '#BAFFC9', accent: '#BAE1FF' },
      fonts: { heading: 'Comic Sans MS', body: 'Arial' },
      icons: ['butterfly', 'star', 'heart'],
      layout: 'rounded_tiles' as const
    }
  },
  {
    id: DEFAULT_TEMPLATES.ADVENTURE_THEME,
    name: 'Adventure Boy',
    description: 'Bold colors with adventure-themed graphics for brave explorers',
    metadata: {
      colors: { primary: '#FF6B35', secondary: '#F7931E', accent: '#FFD23F' },
      fonts: { heading: 'Impact', body: 'Verdana' },
      icons: ['mountain', 'compass', 'telescope'],
      layout: 'square_tiles' as const
    }
  },
  {
    id: DEFAULT_TEMPLATES.CELEBRATION_THEME,
    name: 'Rainbow Fantasy',
    description: 'Bright rainbow colors with magical elements and unicorns',
    metadata: {
      colors: { primary: '#FF0080', secondary: '#8000FF', accent: '#00FF80' },
      fonts: { heading: 'Fantasy', body: 'Georgia' },
      icons: ['unicorn', 'rainbow', 'castle'],
      layout: 'hexagon_tiles' as const
    }
  }
];

interface ParentDashboardProps {
  testMode?: boolean;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ testMode = false }) => {
  const { userType, isAuthenticated, parent, child, logout, session } = useAuth();
  const { tiles, loading, error, updateTile, uploadMedia } = useCalendarData();
  const [showTileEditor, setShowTileEditor] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to parents.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
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
      const API_BASE = (import.meta as any).env?.VITE_CHAT_API_URL || (import.meta as any).env?.CHAT_API_URL || ((import.meta as any).env?.PROD ? '' : 'https://toharper.dad');

      // Make request to export endpoint
      const response = await fetch(`${API_BASE}/api/export/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Customize your child's advent calendar with messages, photos, and gifts.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Calendar Overview</h2>
             <div className="flex gap-2">
               <button
                 onClick={() => setShowProfileSettings(true)}
                 className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                 aria-label="Profile and settings"
               >
                 Profile & Settings
               </button>
               <button
                 onClick={() => setShowTileEditor(true)}
                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                 aria-label="Edit calendar tiles"
               >
                 Edit Tiles
               </button>
               <button
                 onClick={() => setShowAnalytics(true)}
                 className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm sm:text-base"
                 aria-label="View analytics"
               >
                 Analytics
               </button>
               <button
                 onClick={handleExportPDF}
                 className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                 aria-label="Export calendar as PDF"
               >
                 Export PDF
               </button>
             </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {Array.from({ length: 25 }, (_, i) => i + 1).map(day => {
              const tile = tiles.find(t => t.day === day);
              return (
                <div
                  key={day}
                  className="aspect-square border-2 border-gray-200 rounded-lg p-1 sm:p-2 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                  role="button"
                  tabIndex={0}
                  aria-label={`Day ${day} tile${tile?.title ? `: ${tile.title}` : ''}`}
                >
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mb-1">Day {day}</div>
                  {tile?.title && (
                    <div className="text-xs text-gray-600 text-center mb-1 truncate w-full leading-tight">
                      {tile.title}
                    </div>
                  )}
                  {tile?.media_url && (
                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-200 rounded flex items-center justify-center mb-1 text-xs sm:text-sm">
                      📷
                    </div>
                  )}
                  {tile?.gift && (
                    <div className="text-xs text-purple-600" aria-label="Has gift">🎁</div>
                  )}
                  {tile?.gift_unlocked && (
                    <div className="text-xs text-green-600 mt-1" aria-label="Gift unlocked">✅</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{tiles.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Tiles</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {tiles.filter(t => t.gift).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Tiles with Gifts</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {tiles.filter(t => t.gift_unlocked).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Unlocked Gifts</div>
            </div>
          </div>
        </div>
      </div>

      {showTileEditor && (
        <TileEditor
          tiles={tiles}
          onUpdateTile={handleUpdateTile}
          onUploadMedia={handleUploadMedia}
          onClose={() => setShowTileEditor(false)}
        />
      )}

      {showProfileSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Profile & Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={profileForm.parentName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, parentName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
                  <input
                    type="text"
                    value={profileForm.childName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, childName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
                  <input
                    type="date"
                    value={profileForm.childBirthdate}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, childBirthdate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={profileForm.childGender}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, childGender: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="unspecified">Unspecified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={profileForm.timezone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileForm.notificationsEnabled}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable daily notifications</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Receive daily reminders when new tiles are available</p>

                    {/* Notification Permission Status */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Browser Permission:</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          typeof Notification !== 'undefined' && Notification.permission === 'granted'
                            ? 'bg-green-100 text-green-800'
                            : typeof Notification !== 'undefined' && Notification.permission === 'denied'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {typeof Notification !== 'undefined'
                            ? Notification.permission === 'granted' ? 'Granted' :
                              Notification.permission === 'denied' ? 'Denied' : 'Not requested'
                            : 'Not supported'
                          }
                        </span>
                      </div>

                      {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
                        <button
                          onClick={async () => {
                            try {
                              const permission = await Notification.requestPermission();
                              if (permission === 'granted') {
                                alert('Notification permission granted! You will now receive daily tile notifications.');
                                // The AuthContext will automatically register the FCM token
                              } else {
                                alert('Notification permission denied. You can enable it later in your browser settings.');
                              }
                            } catch (error) {
                              console.error('Error requesting notification permission:', error);
                              alert('Failed to request notification permission. Please try again.');
                            }
                          }}
                          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          Request Notification Permission
                        </button>
                      )}

                      {typeof Notification !== 'undefined' && Notification.permission === 'granted' && (
                        <p className="text-xs text-green-600 mt-2">
                          ✅ Notifications are enabled. You'll receive daily reminders for new tiles.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Child Login Credentials</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Family Code:</strong> {parent?.family_uuid || 'Not available'}
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        <strong>Password:</strong> Temporary password generated during signup
                      </div>
                      <button
                        onClick={async () => {
                          // Generate new temporary password
                          const newPassword = Math.random().toString(36).slice(-8);
                          alert(`New temporary password generated: ${newPassword}\n\nPlease share this with your child securely. Note: This is a placeholder - actual password regeneration would require backend storage.`);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        Regenerate Password
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Generate a new temporary password for child login</p>
                    </div>
                  </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Calendar Theme</label>
                     <button
                       onClick={() => setShowTemplateSelector(true)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                     >
                       Change Theme
                     </button>
                     <p className="text-xs text-gray-500 mt-1">Customize the look and feel of your calendar</p>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">AI Chat Personality</label>
                     <select
                       value={profileForm.systemPromptTemplate}
                       onChange={(e) => setProfileForm(prev => ({ ...prev, systemPromptTemplate: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                       {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                         <option key={template.id} value={template.id}>
                           {template.name} - {template.description}
                         </option>
                       ))}
                     </select>
                     <p className="text-xs text-gray-500 mt-1">Choose how the AI should speak when chatting with your child</p>
                   </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProfileSettings(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Basic validation
                    if (!profileForm.parentName.trim()) {
                      alert('Parent name is required');
                      return;
                    }
                    if (!profileForm.childName.trim()) {
                      alert('Child name is required');
                      return;
                    }
                    if (!profileForm.childBirthdate) {
                      alert('Child birthdate is required');
                      return;
                    }

                    // Check if birthdate is reasonable (not in future, not too old)
                    const birthDate = new Date(profileForm.childBirthdate);
                    const now = new Date();
                    const minAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
                    const maxAge = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

                    if (birthDate > now) {
                      alert('Birthdate cannot be in the future');
                      return;
                    }
                    if (birthDate < minAge) {
                      alert('Child seems too old for an advent calendar');
                      return;
                    }
                    if (birthDate > maxAge) {
                      alert('Child seems too young for an advent calendar');
                      return;
                    }

                    // TODO: Implement save profile logic with API call
                    // For now, just close the modal
                    setShowProfileSettings(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    // Switch to child view
                    window.location.href = '/child/calendar';
                  }}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Switch to Child View
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to log out?')) {
                      await logout();
                      window.location.href = '/auth';
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Choose Calendar Theme</h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close template selector"
                >
                  ×
                </button>
              </div>

              <TemplateErrorBoundary>
                <TemplateSelector
                  selectedTemplate={currentTemplate}
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
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to update template');
                    }

                     // Log template change event
                     analytics.logTemplateChange(templateId, currentTemplate || undefined);

                     setCurrentTemplate(templateId);
                     setShowTemplateSelector(false);

                     // Apply template styling dynamically without page reload
                     const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId);
                     if (template) {
                       applyTemplateStyling(template.metadata, template.id);
                     }
                  } catch (error) {
                    console.error('Failed to update template:', error);
                    alert('Failed to update calendar theme. Please try again.');
                  }
                }}
                />
              </TemplateErrorBoundary>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Calendar Analytics</h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close analytics"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{tiles.filter(t => t.gift_unlocked).length}</div>
                    <div className="text-sm text-gray-600">Gifts Unlocked</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{tiles.filter(t => t.media_url).length}</div>
                    <div className="text-sm text-gray-600">Tiles with Media</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{tiles.filter(t => t.note_from_child).length}</div>
                    <div className="text-sm text-gray-600">Child Notes</div>
                  </div>
                </div>

                <div className="text-center text-gray-500">
                  <p>Detailed analytics dashboard coming soon!</p>
                  <p className="text-sm mt-2">Track user engagement, tile interactions, and calendar usage.</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;