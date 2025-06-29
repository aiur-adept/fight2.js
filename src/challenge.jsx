import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const blue = '#1976d2';
const blueDark = '#1565c0';
const white = '#fff';
const gray = '#f5f5f5';

function Challenge() {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFightUrl = async () => {
      try {
        const response = await fetch('/api/challenge');
        const data = await response.json();
        if (data && data.fightUrl) setUrl(data.fightUrl);
      } catch {}
    };
    fetchFightUrl();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: gray,
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
          maxWidth: 400,
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
            fontSize: 28,
            marginBottom: 24,
            color: blue,
            letterSpacing: 0.5,
            textAlign: 'center',
          }}
        >
          Challenge
        </h1>
        {url && (
          <>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                }}
              >
                <input
                  type="text"
                  value={window.location.origin + url}
                  readOnly
                  style={{
                    flex: 1,
                    fontSize: 15,
                    padding: '12px 10px',
                    border: '1px solid #bdbdbd',
                    borderRadius: 4,
                    background: '#fafafa',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'Roboto, Arial, sans-serif',
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: copied ? blueDark : blue,
                    color: white,
                    border: 'none',
                    borderRadius: 4,
                    padding: '10px 18px',
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: 'Roboto, Arial, sans-serif',
                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.10)',
                    cursor: 'pointer',
                    transition: 'background 0.18s, box-shadow 0.18s',
                    outline: 'none',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = blueDark;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = copied ? blueDark : blue;
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div
                style={{
                  color: '#444',
                  fontSize: 15,
                  textAlign: 'center',
                  fontFamily: 'Roboto, Arial, sans-serif',
                  opacity: 0.85,
                }}
              >
                Send this link to your opponent
              </div>
            </div>
            <Link
              to={url}
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
                Join Fight
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Challenge;
