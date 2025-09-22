import { useEffect } from 'react';
import { useThemeCustomization } from '@/hooks/use-theme-customization';

// Ensures theme preferences are loaded and applied on every route, even after hard refresh
export const ThemeInitializer = () => {
  const { applyTheme, loadPreferences } = useThemeCustomization();

  useEffect(() => {
    // loadPreferences internally applies the theme after fetching/syncing
    loadPreferences();
    // Also ensure immediate apply if anything was already in local state
    applyTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
