import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FirstTimePermissionFlow } from '@/components/onboarding/FirstTimePermissionFlow';

const PermissionsPage = () => {
  const navigate = useNavigate();

  const handlePermissionsComplete = () => {
    console.log('[PermissionsPage] Permissions complete, navigating to /welcome');
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FirstTimePermissionFlow onComplete={handlePermissionsComplete} />
    </div>
  );
};

export default PermissionsPage;
