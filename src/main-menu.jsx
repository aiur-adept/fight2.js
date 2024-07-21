import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const options = [
  { path: '/playcomputer', label: 'play computer' },
  { path: '/challenge', label: 'create challenge link' },
];

const MainMenu = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h1>Fight2!</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <a href="/logout">Logout</a>
        </div>
      ) : (
        <a href="/auth/google">Login with Google</a>
      )}
      {options.map((option) => (
        <div key={option.path} className="option">
          <Link to={option.path}>{option.label}</Link>
        </div>
      ))}
    </div>
  );
};

export default MainMenu;
