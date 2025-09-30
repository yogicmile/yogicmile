import React, { useEffect } from 'react';
import { HelpCenter } from '@/components/HelpCenter';

export const HelpPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Help & Support | Yogic Mile';
  }, []);

  return <HelpCenter />;
};