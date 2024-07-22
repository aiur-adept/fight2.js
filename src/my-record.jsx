import React, { useEffect, useState } from 'react';

function MyRecord() {
  const [records, setRecords] = useState([]);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('/api/myRecord');
        if (!response.ok) {
          if (response.status === 401) {
            setUnauthorized(true);
          }
          throw new Error('Failed to fetch records');
        }
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
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
      <h1>My Record</h1>
      <table>
        <thead>
          <tr>
            <th>Combatants</th>
            <th>Result Description</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record._id.$oid} style={{ backgroundColor: record.victor ? (record.victor === record.name ? '#ccffcc' : '#ffcccc') : 'none' }}>
              <td>{record.names.join(' vs ')}</td>
              <td>{record.resultDescription}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyRecord;
