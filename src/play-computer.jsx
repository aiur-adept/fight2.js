import React from 'react';

function PlayComputer() {
  const createComputerOpponent = async () => {
    try {
      const response = await fetch('/api/createComputerOpponent');
      if (!response.ok) {
        throw new Error('Failed to create computer opponent');
      }
      const data = await response.json();
      const fightUrl = data.url;
      window.location.href = fightUrl;
    } catch (error) {
      console.error('Error creating computer opponent:', error);
    }
  };

  return (
    <button onClick={createComputerOpponent}>Create Computer Opponent</button>
  );
}

export default PlayComputer;
