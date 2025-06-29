import React, { useState } from 'react';

function TextInputModal({ promptText, closeModal, resolve }) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    closeModal(value);
    resolve(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="md-modal-content" style={{
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      padding: 32,
      minWidth: 320,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h2 style={{
        fontWeight: 500,
        fontSize: 22,
        marginBottom: 24,
        color: '#222'
      }}>{promptText}</h2>
      <div style={{ width: '100%', marginBottom: 32 }}>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '100%',
            fontSize: 16,
            padding: '14px 12px',
            border: '1px solid #bdbdbd',
            borderRadius: 4,
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
            background: '#fafafa'
          }}
        />
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmit}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '10px 24px',
            fontSize: 15,
            fontWeight: 500,
            boxShadow: '0 2px 4px rgba(25, 118, 210, 0.08)',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default TextInputModal;
