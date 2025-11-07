import { Capacitor } from "@capacitor/core";

interface PermissionStatus {
  activity: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  camera?: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  location?: "prompt" | "prompt-with-rationale" | "granted" | "denied";
}

class PermissionManagerService {
  private hasCompletedOnboarding: boolean = false;
  private permissionCacheKey = "yogicmile_permissions_completed";

  constructor() {
    this.loadOnboardingStatus();
  }

  private loadOnboardingStatus(): void {
    const stored = localStorage.getItem(this.permissionCacheKey);
    this.hasCompletedOnboarding = stored === "true";
  }

  public hasCompletedPermissions(): boolean {
    return this.hasCompletedOnboarding;
  }

  public setPermissionsCompleted(): void {
    this.hasCompletedOnboarding = true;
    localStorage.setItem(this.permissionCacheKey, "true");
  }

  public async requestActivityPermission(): Promise<PermissionStatus> {
    const platform = Capacitor.getPlatform();

    if (platform === "android") {
      return this.requestAndroidActivityPermission();
    } else if (platform === "ios") {
      return this.requestIOSActivityPermission();
    } else {
      return { activity: "granted" };
    }
  }

  private async requestAndroidActivityPermission(): Promise<PermissionStatus> {
    try {
      const { Permissions } = await import("@capacitor/app");

      const result = await Permissions.query({
        name: "ACTIVITY_RECOGNITION",
      });

      if (result.state === "prompt") {
        return { activity: "prompt" };
      } else if (result.state === "prompt-with-rationale") {
        return { activity: "prompt-with-rationale" };
      } else if (result.state === "granted") {
        this.setPermissionsCompleted();
        return { activity: "granted" };
      } else {
        return { activity: "denied" };
      }
    } catch (error) {
      console.error("Error requesting Android activity permission:", error);
      return { activity: "denied" };
    }
  }

  private async requestIOSActivityPermission(): Promise<PermissionStatus> {
    try {
      const { Permissions } = await import("@capacitor/app");

      const result = await Permissions.query({
        name: "MOTION",
      });

      if (result.state === "granted") {
        this.setPermissionsCompleted();
        return { activity: "granted" };
      } else if (result.state === "prompt") {
        return { activity: "prompt" };
      } else {
        return { activity: "denied" };
      }
    } catch (error) {
      console.error("Error requesting iOS activity permission:", error);
      return { activity: "denied" };
    }
  }

  public async requestMultiplePermissions(): Promise<PermissionStatus> {
    try {
      const activityResult = await this.requestActivityPermission();

      if (activityResult.activity === "granted") {
        this.setPermissionsCompleted();
        return activityResult;
      }

      return activityResult;
    } catch (error) {
      console.error("Error requesting multiple permissions:", error);
      return { activity: "denied" };
    }
  }

  public resetPermissionsStatus(): void {
    this.hasCompletedOnboarding = false;
    localStorage.removeItem(this.permissionCacheKey);
  }

  public getPermissionStatus(): string {
    if (this.hasCompletedOnboarding) {
      return "All permissions granted";
    }
    return "Permissions not yet requested";
  }
}

export const permissionManager = new PermissionManagerService();
export default permissionManager;
