import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import MainMenu from './main-menu';
import MyRecord from './my-record';
import Challenge from './challenge';
import LeaderBoard from './leader-board';
import Fight from './fight';

import { ModalProvider } from './modal-context';

async function main() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <ModalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu/>} />
          <Route path="/myrecord" element={<MyRecord/>} />
          <Route path="/challenge" element={<Challenge/>} />
          <Route path="/leaderboard" element={<LeaderBoard/>} />
          <Route path="/fight/:uuid" element={<Fight/>} />
        </Routes>
      </Router>
    </ModalProvider>
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
