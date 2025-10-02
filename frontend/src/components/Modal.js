import React from 'react';

/**
 * Accessible reusable Modal component (stub for Deliverable 1)
 * Props:
 * - isOpen (boolean): controls visibility
 * - onClose (function): called when backdrop or close button clicked / ESC key
 * - title (string): heading text
 * - children: modal body content
 */
const Modal = ({ isOpen, onClose, title = 'Dialog', children }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        </header>
        <div className="modal-body">{children || <p>Placeholder modal content (D1 stub).</p>}</div>
      </div>
    </div>
  );
};

export default Modal;
