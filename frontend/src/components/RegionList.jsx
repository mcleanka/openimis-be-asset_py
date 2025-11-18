import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RegionList() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/regions/');
      setRegions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load regions');
      console.error('Error fetching regions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Regions</h2>
      
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {regions.length === 0 ? (
            <tr>
              <td>No regions found</td>
            </tr>
          ) : (
            regions.map(region => (
              <tr key={region.id}>
                <td>{region.name}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RegionList;
