import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ThemeSettings {
  themeName: 'sky_blue' | 'dark_mode' | 'nature_green' | 'sunset_orange' | 'cosmic_purple';
  accentColor: 'golden' | 'silver' | 'emerald' | 'ruby' | 'sapphire';
  darkMode: boolean;
  highContrast: boolean;
}

export interface LayoutPreferences {
  dashboardWidgets: string[];
  cardLayout: 'grid' | 'list' | 'compact';
  compactMode: boolean;
}

export interface NotificationConfig {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  achievementNotifications: boolean;
  milestoneNotifications: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'normal' | 'large' | 'extra_large';
  animationReduced: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

export interface CustomizationPreferences {
  themeSettings: ThemeSettings;
  layoutPreferences: LayoutPreferences;
  notificationConfig: NotificationConfig;
  accessibilitySettings: AccessibilitySettings;
}

const DEFAULT_PREFERENCES: CustomizationPreferences = {
  themeSettings: {
    themeName: 'sky_blue',
    accentColor: 'golden',
    darkMode: false,
    highContrast: false,
  },
  layoutPreferences: {
    dashboardWidgets: ['steps', 'coins', 'streak', 'phase'],
    cardLayout: 'grid',
    compactMode: false,
  },
  notificationConfig: {
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      start: '22:00',
      end: '07:00',
    },
    achievementNotifications: true,
    milestoneNotifications: true,
  },
  accessibilitySettings: {
    fontSize: 'normal',
    animationReduced: false,
    highContrast: false,
    screenReader: false,
  },
};

export const THEME_OPTIONS = [
  {
    name: 'sky_blue',
    displayName: 'Classic Sky Blue',
    description: 'Our signature calming sky blue theme',
    primaryColor: '#87CEEB',
    secondaryColor: '#00BFFF',
    preview: 'linear-gradient(135deg, #87CEEB, #00BFFF)',
  },
  {
    name: 'dark_mode',
    displayName: 'Dark Mode',
    description: 'Easy on the eyes for night usage',
    primaryColor: '#1E293B',
    secondaryColor: '#334155',
    preview: 'linear-gradient(135deg, #1E293B, #334155)',
  },
  {
    name: 'nature_green',
    displayName: 'Nature Green',
    description: 'Fresh and natural green tones',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    preview: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    name: 'sunset_orange',
    displayName: 'Sunset Orange',
    description: 'Warm and energizing orange gradients',
    primaryColor: '#F97316',
    secondaryColor: '#EA580C',
    preview: 'linear-gradient(135deg, #F97316, #EA580C)',
  },
  {
    name: 'cosmic_purple',
    displayName: 'Cosmic Purple',
    description: 'Mystical purple for evening workouts',
    primaryColor: '#8B5CF6',
    secondaryColor: '#7C3AED',
    preview: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  },
];

export const ACCENT_COLORS = [
  { name: 'golden', displayName: 'Golden', color: '#FFD700' },
  { name: 'silver', displayName: 'Silver', color: '#C0C0C0' },
  { name: 'emerald', displayName: 'Emerald', color: '#10B981' },
  { name: 'ruby', displayName: 'Ruby', color: '#EF4444' },
  { name: 'sapphire', displayName: 'Sapphire', color: '#3B82F6' },
];

export const useThemeCustomization = () => {
  const [preferences, setPreferences] = useState<CustomizationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  // Load preferences from database
  const loadPreferences = useCallback(async () => {
    if (isGuest || !user) {
      // Load from localStorage for guest users
      const saved = localStorage.getItem('yogicmile-theme-preferences');
      if (saved) {
        try {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
        } catch {
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customization_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          themeSettings: (data.theme_settings as any) || DEFAULT_PREFERENCES.themeSettings,
          layoutPreferences: (data.layout_preferences as any) || DEFAULT_PREFERENCES.layoutPreferences,
          notificationConfig: (data.notification_config as any) || DEFAULT_PREFERENCES.notificationConfig,
          accessibilitySettings: (data.accessibility_settings as any) || DEFAULT_PREFERENCES.accessibilitySettings,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load customization preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest, toast]);

  // Save preferences to database
  const savePreferences = useCallback(async (newPreferences: Partial<CustomizationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    if (isGuest) {
      // Save to localStorage for guest users
      localStorage.setItem('yogicmile-theme-preferences', JSON.stringify(updatedPreferences));
      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved locally",
      });
      return;
    }

    if (!user) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('customization_preferences')
        .upsert({
          user_id: user.id,
          theme_settings: updatedPreferences.themeSettings as any,
          layout_preferences: updatedPreferences.layoutPreferences as any,
          notification_config: updatedPreferences.notificationConfig as any,
          accessibility_settings: updatedPreferences.accessibilitySettings as any,
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your customization preferences have been saved",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences, user, isGuest, toast]);

  // Update theme settings
  const updateTheme = useCallback(async (themeSettings: Partial<ThemeSettings>) => {
    const newSettings = { ...preferences.themeSettings, ...themeSettings };
    await savePreferences({
      themeSettings: newSettings,
    });
  }, [preferences, savePreferences]);

  // Update layout preferences
  const updateLayout = useCallback(async (layoutPreferences: Partial<LayoutPreferences>) => {
    const newLayout = { ...preferences.layoutPreferences, ...layoutPreferences };
    await savePreferences({
      layoutPreferences: newLayout,
    });
  }, [preferences, savePreferences]);

  // Update notification config
  const updateNotifications = useCallback(async (notificationConfig: Partial<NotificationConfig>) => {
    const newConfig = { ...preferences.notificationConfig, ...notificationConfig };
    await savePreferences({
      notificationConfig: newConfig,
    });
  }, [preferences, savePreferences]);

  // Update accessibility settings
  const updateAccessibility = useCallback(async (accessibilitySettings: Partial<AccessibilitySettings>) => {
    const newSettings = { ...preferences.accessibilitySettings, ...accessibilitySettings };
    await savePreferences({
      accessibilitySettings: newSettings,
    });
  }, [preferences, savePreferences]);

  // Apply theme to document
  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    const theme = preferences.themeSettings;

    // Apply CSS custom properties based on theme
    if (theme.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply theme-specific CSS classes
    root.className = root.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-'))
      .join(' ');
    root.classList.add(`theme-${theme.themeName}`);

    // Apply accessibility settings
    if (theme.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (preferences.accessibilitySettings.animationReduced) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply font size
    root.classList.remove('text-sm', 'text-lg', 'text-xl');
    if (preferences.accessibilitySettings.fontSize !== 'normal') {
      const sizeMap = {
        small: 'text-sm',
        large: 'text-lg',
        extra_large: 'text-xl',
      };
      root.classList.add(sizeMap[preferences.accessibilitySettings.fontSize]);
    }
  }, [preferences]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    await savePreferences(DEFAULT_PREFERENCES);
    toast({
      title: "Reset Complete",
      description: "All customization settings have been reset to defaults",
    });
  }, [savePreferences, toast]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Apply theme whenever preferences change
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return {
    // State
    preferences,
    isLoading,
    isSaving,
    
    // Theme options
    themeOptions: THEME_OPTIONS,
    accentColors: ACCENT_COLORS,
    
    // Actions
    updateTheme,
    updateLayout,
    updateNotifications,
    updateAccessibility,
    savePreferences,
    resetToDefaults,
    loadPreferences,
    applyTheme,
  };
};