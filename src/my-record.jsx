import React, { useEffect, useState } from 'react';

function MyRecord() {
  const [records, setRecords] = useState([]);
  const [recordSummaries, setRecordSummaries] = useState({});
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      fetch('/api/myRecord')
        .then(response => {
          if (!response.ok) {
            if (response.status === 401) {
              setUnauthorized(true);
            }
            throw new Error('Failed to fetch records');
          }
          return response.json();
        })
        .then(data => {
          setRecords(data);
        })
        .then(() => {
          return fetch('/api/recordSummaries')
            .then(response => response.json())
            .then(data => setRecordSummaries(data[0]));
        })
        .catch(error => {
          console.error('Error fetching records:', error);
        });
    };

    fetchRecords();
  }, []);

  if (unauthorized) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You need to <a href="/auth/google">login</a> to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <p><a href="/">Back to Main Menu</a></p>
      <h1>My Record</h1>
      <p>Wins: {recordSummaries?.win || 0}</p>
      <p>Losses: {recordSummaries?.loss || 0}</p>
      <p>Draws: {recordSummaries?.draw || 0}</p>
      {records.length > 0 && (
        <table id="myRecordTable">
          <thead>
            <tr>
              <th>Combatants</th>
              <th>Result Description</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record._id && record._id.$oid ? record._id.$oid : index} style={{ backgroundColor: record.victor ? (record.victor === record.name ? '#ccffcc' : '#ffcccc') : 'none' }}>
                <td>{record.names.join(' vs ')}</td>
                <td>{record.resultDescription}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyRecord;
