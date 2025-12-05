import React, { useState } from 'react';
import TileEditor from './TileEditor';
import TemplateSelector from './TemplateSelector';
import TemplateErrorBoundary from './TemplateErrorBoundary';
import CustomizationPanel from './CustomizationPanel';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { CalendarTile } from '../types/calendar';
import { analytics } from '../lib/analytics';
import { applyTemplateStyling } from '../lib/templateStyling';
import { getTemplateDefinition } from '../data/templates';
import { motion } from 'framer-motion';
import WinterThemeToggle from './WinterThemeToggle';
import { useWinterTheme } from '../contexts/WinterThemeContext';
import WonderlandLayout from './layout/WonderlandLayout';
import { Button } from './ui/WonderButton';

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

interface ParentDashboardProps {
  testMode?: boolean;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ testMode = false }) => {
  const { userType, isAuthenticated, parent, child, logout, session } = useAuth();
  const { variant } = useWinterTheme();
  const { tiles, loading, error, updateTile, uploadMedia } = useCalendarData();
  const [showTileEditor, setShowTileEditor] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
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
  const layoutMood = variant === 'masculine' ? 'frost' : variant === 'neutral' ? 'aurora' : 'ember';

  if (!testMode && (!isAuthenticated || userType !== 'parent')) {
    return (
      <WonderlandLayout
        title="Parents Only"
        subtitle="Sign in to craft magical surprises for your little ones."
        mood={layoutMood}
        showSnow
        showButterflies
        contentClassName="flex items-center justify-center"
      >
        <div className="max-w-lg rounded-3xl border border-white/20 bg-white/10 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
          <p className="text-lg text-white/90">This dashboard is only accessible to parents.</p>
          <Button
            fullWidth
            variant="frosted"
            size="lg"
            onClick={() => (window.location.href = '/auth')}
          >
            Return to Login
          </Button>
        </div>
      </WonderlandLayout>
    );
  }

  if (loading) {
    return (
      <WonderlandLayout
        title="Gathering Your Workshop"
        subtitle="Fetching calendar data, snow, butterflies, and cheer..."
        mood={layoutMood}
        showSnow
        contentClassName="flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/10 px-10 py-8 text-white shadow-2xl backdrop-blur-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <p className="text-white/90">Loading your calendar...</p>
        </div>
      </WonderlandLayout>
    );
  }

  if (error) {
    return (
      <WonderlandLayout
        title="Something Went Frosty"
        subtitle="Refresh and we’ll retune the workshop."
        mood="ember"
        showSnow
        showButterflies={false}
        contentClassName="flex items-center justify-center"
      >
        <div className="max-w-lg rounded-3xl border border-white/20 bg-white/10 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
          <p className="text-lg text-white/90">{error}</p>
          <Button
            fullWidth
            variant="frosted"
            size="lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </WonderlandLayout>
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
    <WonderlandLayout
      title="Parent Dashboard"
      subtitle="Customize your child's advent calendar with messages, photos, and magical gifts."
      mood={layoutMood}
      showSnow
      showButterflies
      actions={<WinterThemeToggle />}
      contentClassName="relative space-y-6"
    >
      <div className="max-w-6xl mx-auto relative z-10">

        <div className="winter-wonderland-card frosted p-4 sm:p-6 mb-4 sm:mb-6 winter-ornamentation">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">Calendar Overview</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: 'Profile & Settings',
                    gradient: '',
                    action: () => setShowProfileSettings(true),
                    aria: 'Profile and settings'
                  },
                  {
                    label: 'Edit Tiles',
                    gradient: 'from-blue-500/20 to-indigo-500/20',
                    action: () => setShowTileEditor(true),
                    aria: 'Edit calendar tiles'
                  },
                  {
                    label: '🎨 Customize',
                    gradient: 'from-indigo-500/20 to-purple-500/20',
                    action: () => setShowCustomization(true),
                    aria: 'Advanced customization options'
                  },
                  {
                    label: 'Analytics',
                    gradient: 'from-purple-500/20 to-pink-500/20',
                    action: () => setShowAnalytics(true),
                    aria: 'View analytics'
                  },
                  {
                    label: 'Export PDF',
                    gradient: 'from-emerald-500/20 to-teal-500/20',
                    action: handleExportPDF,
                    aria: 'Export calendar as PDF'
                  }
                ].map(button => (
                  <motion.div key={button.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="frosted"
                      size="md"
                      className={button.gradient ? `bg-gradient-to-r ${button.gradient}` : ''}
                      onClick={button.action}
                      aria-label={button.aria}
                    >
                      {button.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
          </div>

          <div className="winter-calendar-grid">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((day) => {
              const tile = tiles.find(t => t.day === day);
              return (
                <div
                  key={day}
                   className="winter-calendar-tile cursor-pointer winter-magic-sparkle"
                   role="button"
                   tabIndex={0}
                   aria-label={`Day ${day} tile${tile?.title ? `: ${tile.title}` : ''}`}
                 >
                   <div className="winter-calendar-day-label">Day {day}</div>
                   {tile?.title && (
                     <div className="winter-calendar-title" title={tile.title}>
                       {tile.title}
                     </div>
                   )}
                   {tile?.media_url && (
                     <div
                       className="winter-calendar-badge winter-calendar-badge--media"
                       aria-label="Tile has media attachment"
                     >
                       📷
                     </div>
                   )}
                   {tile?.gift ? (
                     tile.gift_unlocked ? (
                       <div
                         className="winter-calendar-meta winter-calendar-meta--success"
                         aria-label="Gift unlocked"
                       >
                         ✅ Unlocked
                       </div>
                     ) : (
                       <div
                         className="winter-calendar-meta winter-calendar-meta--gift"
                         aria-label="Gift assigned"
                       >
                         🎁 Gift ready
                       </div>
                     )
                   ) : (
                     <div className="winter-calendar-meta" aria-label="No gift configured">
                       No gift yet
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="winter-wonderland-card frosted p-4 sm:p-6 winter-ornamentation">
          <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-blue-400/30">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">{tiles.length}</div>
              <div className="text-xs sm:text-sm text-blue-200/80">Total Tiles</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                {tiles.filter(t => t.gift).length}
              </div>
              <div className="text-xs sm:text-sm text-emerald-200/80">Tiles with Gifts</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {tiles.filter(t => t.gift_unlocked).length}
              </div>
              <div className="text-xs sm:text-sm text-purple-200/80">Unlocked Gifts</div>
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
          childName={child?.name}
          childAge={child?.birthdate ? new Date().getFullYear() - new Date(child.birthdate).getFullYear() : 3}
          parentType={profileForm.systemPromptTemplate}
          childInterests={child?.interests}
        />
      )}

      {showProfileSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="winter-wonderland-card frosted rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto winter-ornamentation">
            <div className="p-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent mb-4">Profile & Settings</h2>

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
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowProfileSettings(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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
                >
                  Save Changes
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <Button
                  fullWidth
                  variant="primary"
                  className="bg-gradient-to-r from-emerald-400 to-teal-500"
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xl text-slate-600 hover:text-slate-900"
                  onClick={() => setShowTemplateSelector(false)}
                  aria-label="Close template selector"
                >
                  ×
                </Button>
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
                     setShowTemplateSelector(false);

                     const templateDefinition = getTemplateDefinition(templateId);
                     if (templateDefinition) {
                       applyTemplateStyling(templateDefinition.metadata, templateDefinition.id);
                     }
                  } catch (error) {
                    console.error('Failed to update template:', error);
                    alert('Failed to update calendar theme. Please try again.');
                  }
                }}
                />
              </TemplateErrorBoundary>

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateSelector(false)}
                >
                  Cancel
                </Button>
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

      {showCustomization && (
        <CustomizationPanel
          onClose={() => setShowCustomization(false)}
          onApply={(options) => {
            // Save customization options (could be stored in user preferences)
            console.log('Applied customizations:', options);
            setShowCustomization(false);
          }}
        />
      )}
    </WonderlandLayout>
  );
};

export default ParentDashboard;
