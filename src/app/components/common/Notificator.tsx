// components/Notification.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type NotificationType = 'success' | 'error' | null;

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export const Notification = ({
  type,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Wait for fade-out animation
        }, autoCloseDuration);

        return () => clearTimeout(timer);
      }
    }
  }, [type, message, autoClose, autoCloseDuration, onClose]);

  if (!type || !isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const icon = type === 'success' ? (
    <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
  ) : (
    <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <div
        className={`rounded-md border ${bgColor} ${borderColor} p-4 shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {icon}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={`inline-flex rounded-md ${bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};