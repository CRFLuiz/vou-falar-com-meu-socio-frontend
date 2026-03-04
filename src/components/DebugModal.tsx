import React from 'react';

interface DebugModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: unknown;
}

export const DebugModal: React.FC<DebugModalProps> = ({ isOpen, onClose, title, data }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: '#1a1a2e',
                border: '1px solid var(--primary-cyan)',
                borderRadius: '8px',
                padding: '2rem',
                width: '80%',
                maxWidth: '800px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                color: '#fff',
                boxShadow: '0 0 20px rgba(0, 255, 242, 0.2)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '0.5rem'
                }}>
                    <h3 style={{ margin: 0, color: 'var(--primary-cyan)' }}>🤖 AI DEBUG: {title}</h3>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: '#0f0f1a',
                    padding: '1rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap'
                }}>
                    <pre style={{ margin: 0 }}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>

                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1.5rem',
                            backgroundColor: 'var(--primary-cyan)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Close Debug View
                    </button>
                </div>
            </div>
        </div>
    );
};
