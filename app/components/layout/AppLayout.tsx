import React from 'react';
import BottomNavigation from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  hideNavigation = false,
  title,
  subtitle,
  showBackButton = false,
  showNotifications = true
}) => {
  return (
    <div className="pb-16 pt-16 min-h-screen bg-background">
        {/* <Header 
          title={title} 
          subtitle={subtitle}
          showBackButton={showBackButton}
          showNotifications={showNotifications}
        /> */}
        {children}
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;