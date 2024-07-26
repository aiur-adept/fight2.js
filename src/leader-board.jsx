import React, { useEffect, useState } from 'react';

function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaders(data.slice(0, 10)); // Get top ten fighters
      }
    };
    fetchLeaders();
  }, []);

  return (
    <div>
      <h1>Leader Board</h1>
      <p><a href="/">Return to Main Menu</a></p>
      <table id="leaderBoardTable">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Wins</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{leader.name}</td>
              <td>{leader.wins || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderBoard;