
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '@/app/components/common/Notificator';

interface NotificationContextType {
  showNotification: (type: 'success' | 'error', message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const clearNotification = () => {
    setNotification({ type: null, message: '' });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={clearNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};