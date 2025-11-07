export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  
  if (localPart.length === 0 || localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;
  
  if (domain.length === 0 || domain.length > 255) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  if (!domain.includes('.')) return false;
  
  const domainParts = domain.split('.');
  for (const part of domainParts) {
    if (part.length === 0 || part.length > 63) return false;
    if (part.startsWith('-') || part.endsWith('-')) return false;
    if (!/^[a-zA-Z0-9-]+$/.test(part)) return false;
  }
  
  return emailRegex.test(email);
};

export const getEmailErrorMessage = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (email.length < 3) return 'Email is too short';
  if (email.length > 255) return 'Email is too long';
  if (!email.includes('@')) return 'Email must contain @';
  
  const [localPart, domain] = email.split('@');
  
  if (!localPart) return 'Invalid email format';
  if (localPart.length > 64) return 'Local part is too long';
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Local part cannot start or end with a dot';
  }
  if (localPart.includes('..')) return 'Local part cannot have consecutive dots';
  
  if (!domain) return 'Domain is required';
  if (domain.length > 255) return 'Domain is too long';
  if (!domain.includes('.')) return 'Domain must contain a dot';
  if (domain.startsWith('-') || domain.endsWith('-')) {
    return 'Domain parts cannot start or end with hyphen';
  }
  
  const domainParts = domain.split('.');
  for (let i = 0; i < domainParts.length; i++) {
    const part = domainParts[i];
    if (part.length === 0) return 'Domain parts cannot be empty';
    if (part.length > 63) return 'Domain label is too long';
    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      return 'Domain parts can only contain alphanumeric characters and hyphens';
    }
  }
  
  if (!isValidEmail(email)) return 'Invalid email format';
  
  return null;
};

export const validateEmailRealtime = (email: string): {
  isValid: boolean;
  error: string | null;
  suggestions: string[];
} => {
  const error = getEmailErrorMessage(email);
  const suggestions: string[] = [];
  
  if (error) {
    if (email.includes('..')) {
      suggestions.push('Remove consecutive dots from your email');
    }
    if (email.includes(' ')) {
      suggestions.push('Remove spaces from your email');
    }
    if (!email.includes('@')) {
      suggestions.push('Add @ symbol to your email');
    }
    if (email.endsWith('.')) {
      suggestions.push('Remove the trailing dot');
    }
  }
  
  return {
    isValid: !error,
    error,
    suggestions
  };
};
