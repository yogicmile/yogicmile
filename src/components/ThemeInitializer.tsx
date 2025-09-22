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

    // Debug: log current classes and key CSS variables
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    // eslint-disable-next-line no-console
    console.log('[ThemeInitializer] html classes:', root.className);
    // eslint-disable-next-line no-console
    console.log('[ThemeInitializer] body classes:', document.body.className);
    // eslint-disable-next-line no-console
    console.log('[ThemeInitializer] background:', styles.getPropertyValue('--background'));

    // Listen for storage changes (in case theme is changed in another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'yogicmile-theme-preferences') {
        // eslint-disable-next-line no-console
        console.log('[ThemeInitializer] storage changed, re-applying theme');
        loadPreferences();
        applyTheme();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
