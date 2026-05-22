import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// --- Toast Component -------------------------------------------------------
export const Toast = ({ toasts, removeToast }) => {
    return createPortal(
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span className="toast-icon">
                        {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
                    </span>
                    <span className="toast-message">{t.message}</span>
                    <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
                </div>
            ))}
        </div>,
        document.body
    );
};

// --- useToast Hook ----------------------------------------------------------
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};
