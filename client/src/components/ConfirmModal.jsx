import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  danger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box confirm-dialog-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div className="confirm-icon-box" style={{ background: danger ? 'var(--danger-subtle)' : 'var(--forest-subtle)', color: danger ? 'var(--danger)' : 'var(--forest-primary)' }}>
          <AlertTriangle size={28} />
        </div>

        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions-row">
          <button type="button" onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .confirm-dialog-box {
          max-width: 440px;
          text-align: center;
          padding: 2.2rem 1.8rem;
        }
        .confirm-icon-box {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.2rem auto;
        }
        .confirm-title {
          font-size: 1.4rem;
          color: var(--text-heading);
          margin-bottom: 0.5rem;
        }
        .confirm-message {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 1.8rem;
        }
        .confirm-actions-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
