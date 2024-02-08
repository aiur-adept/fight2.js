import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Challenge() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const fetchFightUrl = async () => {
      try {
        const response = await fetch('/api/challenge');
        const data = await response.json();

        if (data && data.fightUrl) {
          setUrl(data.fightUrl);
        }
      } catch (error) {
        console.error('Error fetching fight URL:', error);
      }
    };

    fetchFightUrl();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.origin + url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Challenge</h1>
      {url && (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={window.location.origin + url}
              readOnly
              style={{
                marginRight: '10px',
                textAlign: 'center',
                maxWidth: '80%',
              }}
            />
            <button onClick={copyToClipboard}>Copy</button>
            <div>send this link to your opponent</div>
          </div>
          <Link to={url}>Join Fight</Link>
        </>
      )}
    </div>
  );
}

export default Challenge;
