import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  console.log('🔍 Modal render - isOpen:', isOpen);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-md)'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto"
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-lg)',
          maxWidth: '360px',
          width: '100%',
          zIndex: 10000,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-2xl)',
          transform: 'scale(1)',
          animation: 'modalSlideIn 0.3s ease-out',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-lg font-semibold"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: '600',
              flex: '1',
              marginRight: 'var(--space-lg)'
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            style={{
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-normal)',
              padding: 'var(--space-xs)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              flexShrink: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        {children}
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p 
          className="text-gray-600"
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: '1.6',
            margin: '0',
            textAlign: 'center'
          }}
        >
          {message}
        </p>
        
        <div 
          className="flex space-x-3 justify-center"
          style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            justifyContent: 'center',
            alignItems: 'stretch',
            marginTop: 'var(--space-md)'
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            style={{
              height: '40px',
              padding: 'var(--space-xs) var(--space-md)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100px',
              flex: '1'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              height: '40px',
              padding: 'var(--space-xs) var(--space-md)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              color: 'var(--luxury-velvet-black)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100px',
              flex: '1',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {isLoading ? 'Traitement...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'OK'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--alert-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-sm)',
              color: 'white',
              fontSize: '24px'
            }}
          >
            ✓
          </div>
        </div>
        
        <p 
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: '1.6',
            margin: '0',
            textAlign: 'center'
          }}
        >
          {message}
        </p>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
          <Button
            onClick={onClose}
            style={{
              height: '40px',
              padding: 'var(--space-xs) var(--space-md)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              color: 'var(--luxury-velvet-black)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'OK'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--alert-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-sm)',
              color: 'white',
              fontSize: '24px'
            }}
          >
            ✕
          </div>
        </div>
        
        <p 
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: '1.6',
            margin: '0',
            textAlign: 'center'
          }}
        >
          {message}
        </p>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
          <Button
            onClick={onClose}
            style={{
              height: '40px',
              padding: 'var(--space-xs) var(--space-md)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              color: 'var(--luxury-velvet-black)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 