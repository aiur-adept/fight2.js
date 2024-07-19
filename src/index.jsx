import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import MainMenu from './main-menu';
import PlayComputer from './play-computer';
import CreateFighter from './create-fighter';
import Challenge from './challenge';
import Fight from './fight';

import { ModalProvider } from './modal-context';

async function main() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <ModalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu/>} />
          <Route path="/playcomputer" element={<PlayComputer/>} />
          <Route path="/fighter/create" element={<CreateFighter/>} />
          <Route path="/challenge" element={<Challenge/>} />
          <Route path="/fight/:uuid" element={<Fight/>} />
        </Routes>
      </Router>
    </ModalProvider>,
    document.getElementById('content')
  );
}

// TODO: find somewhere else to put this?
const adjustContentHeight = () => {
  const content = document.getElementById('root');
  const vh = window.innerHeight * 0.01;
  content.style.height = `${window.innerHeight}px`;
};
window.addEventListener('resize', adjustContentHeight);
adjustContentHeight();

main()
  .then(() => {
  });
