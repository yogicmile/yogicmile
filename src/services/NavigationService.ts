// Navigation service for use outside React components
// Uses History API to avoid full page reloads

class NavigationService {
  private static instance: NavigationService;

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  navigate(path: string): void {
    // Use History API to navigate without full page reload
    window.history.pushState({}, '', path);
    
    // Dispatch a custom event that React Router can pick up
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
  }

  navigateToDeepLink(deepLink: string): void {
    try {
      const url = new URL(deepLink, window.location.origin);
      this.navigate(url.pathname + url.search);
    } catch (error) {
      console.error('Invalid deep link:', deepLink, error);
    }
  }
}

export const navigationService = NavigationService.getInstance();
