import React from 'react';

const Toast = ({ message = 'Action completed', variant = 'info', isVisible, onDismiss, autoHideMs = 2500 }) => {
  const timerRef = React.useRef();
  React.useEffect(() => {
    if (isVisible) {
      timerRef.current = setTimeout(() => onDismiss?.(), autoHideMs);
    }
    return () => clearTimeout(timerRef.current);
  }, [isVisible, autoHideMs, onDismiss]);

  if (!isVisible) return null;
  return (
    <div className={`toast toast-${variant}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onDismiss} aria-label="Dismiss notification">×</button>
    </div>
  );
};

export default Toast;
