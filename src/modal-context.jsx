import React, { createContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const openModal = useCallback((component, props) => {
    return new Promise((resolve, reject) => {
      setModal({ component, props, resolve, reject });
    });
  }, []);

  const closeModal = useCallback((result) => {
    setModal(null);
  }, []);

  return (
  <ModalContext.Provider value={{ openModal, closeModal }}>
    {children}
    {modal && (
      <div className="modal-overlay">
        <div className="modal-container">
          <modal.component {...modal.props} closeModal={closeModal} resolve={modal.resolve} />
        </div>
      </div>
    )}
  </ModalContext.Provider>
  );
}

export default ModalContext;
