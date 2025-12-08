export interface ContentItem {
  text: string;
  theme: string;
  ageGroup?: string;
  used?: boolean;
  useCount?: number;
  relevanceScore?: number;
}

export interface ChildInterests {
  [key: string]: unknown;
}

export interface ContentLibrary {
  ageGroups: {
    [ageGroup: string]: {
      themes: {
        [theme: string]: string[];
      };
    };
  };
  universal: {
    themes: {
      [theme: string]: string[];
    };
  };
}

class ContentLibraryService {
  private library: ContentLibrary | null = null;
  private usedContent = new Set<string>();

  async loadLibrary(): Promise<ContentLibrary> {
    if (this.library) {
      return this.library;
    }

    try {
      const response = await fetch('/data/contentLibrary.json');
      if (!response.ok) {
        throw new Error('Failed to load content library');
      }
      this.library = await response.json() as ContentLibrary;
      return this.library;
    } catch (error) {
      console.error('Error loading content library:', error);
      // Return a minimal fallback library
      return {
        ageGroups: {
          "2-4": {
            themes: {
              christmas_magic: ["Merry Christmas! You're the most wonderful gift!"]
            }
          }
        },
        universal: {
          themes: {
            encouragement: ["You're amazing and capable of great things!"]
          }
        }
      };
    }
  }

  getContentForAgeAndTheme(age: number, theme: string, count: number = 1): ContentItem[] {
    if (!this.library) {
      return [];
    }

    const library = this.library;

    // Determine age group
    let ageGroup = "2-4";
    if (age >= 8) ageGroup = "8-12";
    else if (age >= 5) ageGroup = "5-7";

    const results: ContentItem[] = [];

    // Try age-specific content first
    if (library.ageGroups[ageGroup]?.themes[theme]) {
      const themeContent = library.ageGroups[ageGroup].themes[theme];
      const availableContent = themeContent.filter(text => !this.usedContent.has(text));

      for (let i = 0; i < Math.min(count, availableContent.length); i++) {
        const text = availableContent[i];
        results.push({
          text,
          theme,
          ageGroup,
          used: false,
          useCount: 0
        });
        this.usedContent.add(text);
      }
    }

    // If we need more content, use universal themes
    if (results.length < count && library.universal.themes[theme]) {
      const universalContent = library.universal.themes[theme];
      const availableContent = universalContent.filter(text => !this.usedContent.has(text));

      for (let i = 0; i < Math.min(count - results.length, availableContent.length); i++) {
        const text = availableContent[i];
        results.push({
          text,
          theme,
          ageGroup: 'universal',
          used: false,
          useCount: 0
        });
        this.usedContent.add(text);
      }
    }

    return results;
  }

  getRandomContent(age: number, count: number = 1): ContentItem[] {
    if (!this.library) {
      return [];
    }

    // Determine age group
    let ageGroup = "2-4";
    if (age >= 8) ageGroup = "8-12";
    else if (age >= 5) ageGroup = "5-7";

    const allContent: ContentItem[] = [];

    // Collect age-specific content
    if (this.library.ageGroups[ageGroup]) {
      Object.entries(this.library.ageGroups[ageGroup].themes).forEach(([theme, texts]) => {
        texts.forEach(text => {
          if (!this.usedContent.has(text)) {
            allContent.push({
              text,
              theme,
              ageGroup,
              used: false,
              useCount: 0
            });
          }
        });
      });
    }

    // Collect universal content
    Object.entries(this.library.universal.themes).forEach(([theme, texts]) => {
      texts.forEach(text => {
        if (!this.usedContent.has(text)) {
          allContent.push({
            text,
            theme,
            ageGroup: 'universal',
            used: false,
            useCount: 0
          });
        }
      });
    });

    // Shuffle and return requested count
    const shuffled = allContent.sort(() => Math.random() - 0.5);
    const results = shuffled.slice(0, count);

    // Mark as used
    results.forEach(item => this.usedContent.add(item.text));

    return results;
  }

  getThemesForAge(age: number): string[] {
    if (!this.library) {
      return [];
    }

    let ageGroup = "2-4";
    if (age >= 8) ageGroup = "8-12";
    else if (age >= 5) ageGroup = "5-7";

    const themes = new Set<string>();

    // Age-specific themes
    if (this.library.ageGroups[ageGroup]) {
      Object.keys(this.library.ageGroups[ageGroup].themes).forEach(theme => themes.add(theme));
    }

    // Universal themes
    Object.keys(this.library.universal.themes).forEach(theme => themes.add(theme));

    return Array.from(themes);
  }

  resetUsageTracking(): void {
    this.usedContent.clear();
  }

  getContextualSuggestions(
    age: number,
    interests: ChildInterests,
    count: number = 5
  ): ContentItem[] {
    if (!this.library) {
      return [];
    }

    // Determine age group
    let ageGroup = "2-4";
    if (age >= 8) ageGroup = "8-12";
    else if (age >= 5) ageGroup = "5-7";

    const allItems: ContentItem[] = [];

    // Collect all available content
    if (this.library.ageGroups[ageGroup]) {
      Object.entries(this.library.ageGroups[ageGroup].themes).forEach(([theme, texts]) => {
        texts.forEach(text => {
          if (!this.usedContent.has(text)) {
            allItems.push({
              text,
              theme,
              ageGroup,
              used: false,
              useCount: 0,
              relevanceScore: this.calculateRelevanceScore(text, interests)
            });
          }
        });
      });
    }

    // Add universal content
    Object.entries(this.library.universal.themes).forEach(([theme, texts]) => {
      texts.forEach(text => {
        if (!this.usedContent.has(text)) {
          allItems.push({
            text,
            theme,
            ageGroup: 'universal',
            used: false,
            useCount: 0,
            relevanceScore: this.calculateRelevanceScore(text, interests)
          });
        }
      });
    });

    // Sort by relevance score (highest first) and return top items
    return allItems
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, count);
  }

  private calculateRelevanceScore(text: string, interests: ChildInterests): number {
    let score = 0;
    const lowerText = text.toLowerCase();

    // Check for interest keywords
    Object.entries(interests).forEach(([interest, value]) => {
      if (value && typeof value === 'string') {
        const keywords = value.toLowerCase().split(/[,;]/).map(k => k.trim());
        keywords.forEach(keyword => {
          if (keyword.length > 2 && lowerText.includes(keyword)) {
            score += 2; // High relevance for direct matches
          }
        });
      } else if (value === true || value === 1) {
        // Boolean or numeric interests
        const interestWords = interest.toLowerCase().split('_');
        interestWords.forEach(word => {
          if (word.length > 2 && lowerText.includes(word)) {
            score += 1.5; // Medium relevance for interest matches
          }
        });
      }
    });

    // Theme-based scoring
    if (lowerText.includes('adventure') && interests.adventure) score += 1;
    if (lowerText.includes('animal') && interests.animals) score += 1;
    if (lowerText.includes('music') && interests.music) score += 1;
    if (lowerText.includes('art') && interests.art) score += 1;
    if (lowerText.includes('sports') && interests.sports) score += 1;
    if (lowerText.includes('science') && interests.science) score += 1;
    if (lowerText.includes('books') && interests.reading) score += 1;
    if (lowerText.includes('nature') && interests.nature) score += 1;

    // Length appropriateness (prefer shorter messages for younger kids)
    const wordCount = text.split(' ').length;
    if (wordCount <= 20) score += 0.5; // Shorter messages are generally better

    return score;
  }

  getSuggestedThemes(interests: ChildInterests): string[] {
    const themeScores: { [theme: string]: number } = {};

    // Analyze interests to suggest relevant themes
    Object.entries(interests).forEach(([interest, value]) => {
      if (value) {
        const lowerInterest = interest.toLowerCase();

        // Map interests to themes
        if (lowerInterest.includes('adventure') || lowerInterest.includes('explore')) {
          themeScores.daily_adventures = (themeScores.daily_adventures || 0) + 2;
        }
        if (lowerInterest.includes('animal') || lowerInterest.includes('pet')) {
          themeScores.family_love = (themeScores.family_love || 0) + 1;
        }
        if (lowerInterest.includes('music') || lowerInterest.includes('sing')) {
          themeScores.christmas_magic = (themeScores.christmas_magic || 0) + 1;
        }
        if (lowerInterest.includes('art') || lowerInterest.includes('draw')) {
          themeScores.learning_discovery = (themeScores.learning_discovery || 0) + 1;
        }
        if (lowerInterest.includes('sport') || lowerInterest.includes('play')) {
          themeScores.friendship_kindness = (themeScores.friendship_kindness || 0) + 1;
        }
        if (lowerInterest.includes('science') || lowerInterest.includes('learn')) {
          themeScores.personal_growth = (themeScores.personal_growth || 0) + 1;
        }
        if (lowerInterest.includes('nature') || lowerInterest.includes('outside')) {
          themeScores.family_traditions = (themeScores.family_traditions || 0) + 1;
        }
      }
    });

    // Always include some default themes
    themeScores.christmas_magic = (themeScores.christmas_magic || 0) + 1;
    themeScores.family_love = (themeScores.family_love || 0) + 1;

    // Sort themes by score and return top ones
    return Object.entries(themeScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  getLibraryStats(): { totalItems: number; usedItems: number; availableItems: number } {
    if (!this.library) {
      return { totalItems: 0, usedItems: 0, availableItems: 0 };
    }

    let totalItems = 0;

    // Count age-specific items
    Object.values(this.library.ageGroups).forEach(ageGroup => {
      Object.values(ageGroup.themes).forEach(themeContent => {
        totalItems += themeContent.length;
      });
    });

    // Count universal items
    Object.values(this.library.universal.themes).forEach(themeContent => {
      totalItems += themeContent.length;
    });

    return {
      totalItems,
      usedItems: this.usedContent.size,
      availableItems: totalItems - this.usedContent.size
    };
  }
}

// Export singleton instance
export const contentLibrary = new ContentLibraryService();