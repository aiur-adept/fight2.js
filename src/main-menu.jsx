import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const options = [
  { path: '/challenge', label: 'Create Challenge Link' },
];

const blue = '#1976d2';
const blueDark = '#1565c0';
const white = '#fff';

const MainMenu = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const createComputerOpponent = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/createComputerOpponent');
      if (!response.ok) throw new Error('Failed to create computer opponent');
      const data = await response.json();
      window.location.href = data.url;
    } catch (e) {
      setError('Could not create computer opponent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: white,
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.10)',
          padding: '32px 24px',
          maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'Roboto, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 32,
            marginBottom: 28,
            color: blue,
            letterSpacing: 0.5,
          }}
        >
          Fight2!
        </h1>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button
            onClick={createComputerOpponent}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 6,
              border: 'none',
              background: loading ? '#bdbdbd' : blue,
              color: white,
              fontSize: 17,
              fontWeight: 500,
              fontFamily: 'Roboto, Arial, sans-serif',
              boxShadow: '0 1px 4px rgba(25, 118, 210, 0.10)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.18s, box-shadow 0.18s',
              outline: 'none',
            }}
            onMouseOver={e => {
              if (!loading) {
                e.currentTarget.style.background = blueDark;
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.16)';
              }
            }}
            onMouseOut={e => {
              if (!loading) {
                e.currentTarget.style.background = blue;
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(25, 118, 210, 0.10)';
              }
            }}
          >
            {loading ? 'Creating...' : 'Play Computer'}
          </button>
          {options.map((option) => (
            <Link
              key={option.path}
              to={option.path}
              style={{
                textDecoration: 'none',
                width: '100%',
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 6,
                  border: 'none',
                  background: blue,
                  color: white,
                  fontSize: 17,
                  fontWeight: 500,
                  fontFamily: 'Roboto, Arial, sans-serif',
                  boxShadow: '0 1px 4px rgba(25, 118, 210, 0.10)',
                  cursor: 'pointer',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  outline: 'none',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = blueDark;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.16)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = blue;
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(25, 118, 210, 0.10)';
                }}
              >
                {option.label}
              </button>
            </Link>
          ))}
        </div>
        {error && (
          <div
            style={{
              color: '#d32f2f',
              fontSize: 15,
              marginTop: 16,
              textAlign: 'center',
              fontFamily: 'Roboto, Arial, sans-serif',
            }}
          >
            {error}
          </div>
        )}
        {user && (
          <div
            style={{
              marginTop: 28,
              color: blue,
              fontSize: 15,
              textAlign: 'center',
              wordBreak: 'break-all',
              opacity: 0.85,
            }}
          >
            Signed in as {user.displayName}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
