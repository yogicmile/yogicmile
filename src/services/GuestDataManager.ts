// Guest Data Manager - Handles localStorage persistence for guest users

const GUEST_PREFIX = 'yogic_guest_';

interface GuestStepsData {
  date: string;
  steps: number;
  coins: number;
  phase: number;
}

interface GuestWalletData {
  balance: number;
  totalEarned: number;
  lastUpdated: string;
}

interface GuestPhaseData {
  currentPhase: number;
  totalSteps: number;
  phaseStartDate: string;
}

export class GuestDataManager {
  private static instance: GuestDataManager;

  static getInstance(): GuestDataManager {
    if (!GuestDataManager.instance) {
      GuestDataManager.instance = new GuestDataManager();
    }
    return GuestDataManager.instance;
  }

  // Daily Steps Management
  getTodaySteps(): GuestStepsData | null {
    const today = new Date().toISOString().split('T')[0];
    const key = `${GUEST_PREFIX}steps_${today}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveTodaySteps(steps: number, coins: number, phase: number): void {
    const today = new Date().toISOString().split('T')[0];
    const key = `${GUEST_PREFIX}steps_${today}`;
    const data: GuestStepsData = { date: today, steps, coins, phase };
    localStorage.setItem(key, JSON.stringify(data));
  }

  getAllSteps(): GuestStepsData[] {
    const steps: GuestStepsData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${GUEST_PREFIX}steps_`)) {
        const data = localStorage.getItem(key);
        if (data) steps.push(JSON.parse(data));
      }
    }
    return steps.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Wallet Management
  getWallet(): GuestWalletData {
    const key = `${GUEST_PREFIX}wallet`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { balance: 0, totalEarned: 0, lastUpdated: new Date().toISOString() };
  }

  saveWallet(balance: number, totalEarned: number): void {
    const key = `${GUEST_PREFIX}wallet`;
    const data: GuestWalletData = {
      balance,
      totalEarned,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  addCoins(amount: number): void {
    const wallet = this.getWallet();
    wallet.balance += amount;
    wallet.totalEarned += amount;
    this.saveWallet(wallet.balance, wallet.totalEarned);
  }

  // Phase Management
  getPhase(): GuestPhaseData {
    const key = `${GUEST_PREFIX}phase`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { 
      currentPhase: 1, 
      totalSteps: 0,
      phaseStartDate: new Date().toISOString()
    };
  }

  savePhase(currentPhase: number, totalSteps: number): void {
    const key = `${GUEST_PREFIX}phase`;
    const existing = this.getPhase();
    const data: GuestPhaseData = {
      currentPhase,
      totalSteps,
      phaseStartDate: existing.phaseStartDate
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Migration helper - get all guest data for migration
  getAllGuestData() {
    return {
      steps: this.getAllSteps(),
      wallet: this.getWallet(),
      phase: this.getPhase()
    };
  }

  // Clear all guest data (after successful migration or on logout)
  clearAllGuestData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(GUEST_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Check if guest has any data
  hasGuestData(): boolean {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(GUEST_PREFIX)) return true;
    }
    return false;
  }
}

export const guestDataManager = GuestDataManager.getInstance();
