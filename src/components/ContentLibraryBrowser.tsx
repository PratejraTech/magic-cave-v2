import React, { useState, useEffect } from 'react';
import { contentLibrary, ContentItem } from '../lib/contentLibrary';

interface ContentLibraryBrowserProps {
  childAge: number;
  childInterests?: Record<string, any>;
  onSelectContent: (content: string) => void;
  onClose: () => void;
}

const ContentLibraryBrowser: React.FC<ContentLibraryBrowserProps> = ({
  childAge,
  childInterests = {},
  onSelectContent,
  onClose
}) => {
  const [library, setLibrary] = useState<any>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contextualItems, setContextualItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'themes' | 'contextual'>('contextual');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const lib = await contentLibrary.loadLibrary();
        setLibrary(lib);
        const themes = contentLibrary.getThemesForAge(childAge);
        setAvailableThemes(themes);
        if (themes.length > 0) {
          setSelectedTheme(themes[0]);
        }

        // Load contextual suggestions
        const contextual = contentLibrary.getContextualSuggestions(childAge, childInterests, 8);
        setContextualItems(contextual);
      } catch (error) {
        console.error('Failed to load content library:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [childAge, childInterests]);

  useEffect(() => {
    if (selectedTheme && library) {
      const items = contentLibrary.getContentForAgeAndTheme(childAge, selectedTheme, 10);
      setContentItems(items);
    }
  }, [selectedTheme, library, childAge]);

  const handleSelectContent = (content: string) => {
    onSelectContent(content);
    onClose();
  };

  const getRandomContent = () => {
    const randomItems = contentLibrary.getRandomContent(childAge, 5);
    setContentItems(randomItems);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading content library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Content Library</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl p-1"
            aria-label="Close content library"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('contextual')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'contextual'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✨ Personalized for {Object.keys(childInterests).length > 0 ? 'Your Child' : 'Age ' + childAge}
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'themes'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 Browse by Theme
            </button>
          </div>

          {activeTab === 'themes' && (
            <div className="flex items-center gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableThemes.map(theme => (
                    <option key={theme} value={theme}>
                      {theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={getRandomContent}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  🎲 Random Mix
                </button>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            {activeTab === 'contextual'
              ? `Personalized content suggestions based on your child's interests and age.`
              : `Browse age-appropriate content by theme for your ${childAge}-year-old.`
            }
            Click on any message to use it in your tile.
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(activeTab === 'contextual' ? contextualItems : contentItems).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'contextual'
                ? "No personalized suggestions available. Try browsing by theme instead."
                : "No content available for this theme. Try selecting a different theme or use the random mix."
              }
            </div>
          ) : (
            (activeTab === 'contextual' ? contextualItems : contentItems).map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectContent(item.text)}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-800 mb-2">{item.text}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {item.theme.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 rounded">
                        Age {item.ageGroup}
                      </span>
                      {item.relevanceScore && item.relevanceScore > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          ⭐ {item.relevanceScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-purple-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentLibraryBrowser;