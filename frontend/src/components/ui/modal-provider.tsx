'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal, SuccessModal, ErrorModal } from './modal';

interface ModalContextType {
  showAlert: (title: string, message: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Confirm State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showAlert = useCallback((title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertConfig({ isOpen: true, title, message, type });
  }, []);

  const showConfirm = useCallback((title: string, message: string, confirmText?: string, cancelText?: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmConfig({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        resolve,
      });
    });
  }, []);

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  const handleConfirm = (value: boolean) => {
    if (confirmConfig) {
      confirmConfig.resolve(value);
      setConfirmConfig(null);
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Global Alert Modals */}
      {alertConfig.type === 'success' ? (
        <SuccessModal
          isOpen={alertConfig.isOpen}
          onClose={closeAlert}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      ) : (
        <ErrorModal
          isOpen={alertConfig.isOpen}
          onClose={closeAlert}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      )}

      {/* Global Confirm Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => handleConfirm(false)}
          onConfirm={() => handleConfirm(true)}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
};
