// Centralized phase definitions to maintain consistency across the app
export const PHASE_DEFINITIONS = [
  { 
    id: 1, 
    name: 'Paisa Phase', 
    symbol: '🟡', 
    rate: 1, 
    stepRequirement: 200000, 
    timeLimit: 60 
  },
  { 
    id: 2, 
    name: 'Coin Phase', 
    symbol: '🪙', 
    rate: 2, 
    stepRequirement: 300000, 
    timeLimit: 60 
  },
  { 
    id: 3, 
    name: 'Token Phase', 
    symbol: '🎟️', 
    rate: 3, 
    stepRequirement: 400000, 
    timeLimit: 60 
  },
  { 
    id: 4, 
    name: 'Gem Phase', 
    symbol: '💎', 
    rate: 5, 
    stepRequirement: 500000, 
    timeLimit: 60 
  },
  { 
    id: 5, 
    name: 'Diamond Phase', 
    symbol: '💠', 
    rate: 7, 
    stepRequirement: 600000, 
    timeLimit: 60 
  },
  { 
    id: 6, 
    name: 'Crown Phase', 
    symbol: '👑', 
    rate: 10, 
    stepRequirement: 800000, 
    timeLimit: 60 
  },
  { 
    id: 7, 
    name: 'Emperor Phase', 
    symbol: '🏵️', 
    rate: 15, 
    stepRequirement: 1000000, 
    timeLimit: 60 
  },
  { 
    id: 8, 
    name: 'Legend Phase', 
    symbol: '🏅', 
    rate: 20, 
    stepRequirement: 1200000, 
    timeLimit: 60 
  },
  { 
    id: 9, 
    name: 'Immortal Phase', 
    symbol: '🏆', 
    rate: 30, 
    stepRequirement: 1500000, 
    timeLimit: 60 
  },
] as const;

export type PhaseDefinition = typeof PHASE_DEFINITIONS[number];

// Constants
export const MAX_DAILY_STEPS = 12000;
export const STEPS_PER_UNIT = 25;
export const MAX_PHASE = 9;
