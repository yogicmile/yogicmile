import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from 'framer-motion';

// Animation Context for consistent animations across the app
const AnimationContext = createContext({
  reduceMotion: false,
  enableHaptics: true,
  animationSpeed: 1,
});

export const useAnimationSystem = () => {
  const context = useContext(AnimationContext);
  return context;
};

// Enhanced Animation Provider
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [enableHaptics, setEnableHaptics] = useState(true);

  useEffect(() => {
    // Detect user motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handleChange = () => setReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AnimationContext.Provider value={{ reduceMotion, enableHaptics, animationSpeed: 1 }}>
      {children}
    </AnimationContext.Provider>
  );
}

// Standard Animation Variants for consistent animations
export const animationVariants = {
  // Page Transitions
  pageSlide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  
  // Modal Animations
  modalFade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  
  // Button Animations
  buttonPress: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  
  // Card Animations
  cardHover: {
    whileHover: { 
      y: -4, 
      boxShadow: "0 20px 25px -5px rgba(0, 191, 255, 0.1)",
      transition: { duration: 0.2 }
    },
    whileTap: { scale: 0.98 }
  },
  
  // Progress Animations
  progressFill: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 2, ease: "easeOut" }
  },
  
  // Achievement Celebrations
  achievementPop: {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: [0, 1.2, 1], 
      rotate: [0, 10, 0],
      transition: { duration: 0.6, ease: "backOut" }
    }
  }
};

// Enhanced Progress Counter with smooth animations
export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  className = "",
  suffix = ""
}: { 
  value: number; 
  duration?: number; 
  className?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const { reduceMotion } = useAnimationSystem();

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const startTime = Date.now();
    
    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (value - startValue) * easeOut);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }, [value, duration, reduceMotion]);

  return (
    <motion.span 
      className={className}
      key={value} // Re-animate when value changes
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
}

// Confetti Animation for Celebrations
export function ConfettiCelebration({ 
  isVisible, 
  onComplete 
}: { 
  isVisible: boolean; 
  onComplete: () => void;
}) {
  const particles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 2000);
          }}
        >
          {particles.map(i => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              initial={{
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                scale: 0,
                rotate: 0
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 100,
                scale: [0, 1, 0],
                rotate: 360
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              style={{
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Micro-interaction Button Component
export function MicroButton({ 
  children, 
  onClick, 
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "golden";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}) {
  const { enableHaptics } = useAnimationSystem();

  const handleClick = () => {
    // Haptic feedback for mobile
    if (enableHaptics && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onClick?.();
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    golden: "bg-accent text-accent-foreground hover:bg-accent/90"
  };

  return (
    <motion.button
      className={`
        font-semibold rounded-xl transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        disabled:opacity-50 disabled:pointer-events-none
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Smooth Progress Bar with Glow Effect
export function AnimatedProgressBar({ 
  progress, 
  className = "", 
  showGlow = true 
}: { 
  progress: number; 
  className?: string; 
  showGlow?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-muted ${className}`}>
      <motion.div
        className={`h-full bg-primary rounded-full ${showGlow ? 'shadow-glow' : ''}`}
        initial={{ width: "0%" }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {showGlow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "200%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear"
          }}
        />
      )}
    </div>
  );
}

// Loading Spinner with brand colors
export function LoadingSpinner({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg 
        className="w-full h-full" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <circle
          cx="12" 
          cy="12" 
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12" 
          r="10"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="24"
        />
      </svg>
    </motion.div>
  );
}