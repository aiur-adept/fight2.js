import React from 'react';
import { Link } from 'react-router-dom';

const options = [
  // { path: '/fighter/create', label: 'create fighter' },
  { path: '/challenge', label: 'create challenge link' },
];

function MainMenu() {
  return (
    <div>
      <h1>Fight2!</h1>
      {options.map((option) => (
        <div key={option.path} className="option">
          <Link to={option.path}>{option.label}</Link>
        </div>
      ))}
    </div>
  );
}

export default MainMenu;
