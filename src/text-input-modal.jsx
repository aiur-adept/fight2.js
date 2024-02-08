import React, { useState } from 'react';

function TextInputModal({ promptText, closeModal, resolve }) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    closeModal(value);
    resolve(value);
  };

  return (
    <div>
      <h2>{promptText}</h2>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default TextInputModal;
