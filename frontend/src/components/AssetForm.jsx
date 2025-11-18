import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AssetForm({ asset, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    region: ''
  });
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegions();
    if (asset) {
      setFormData({
        name: asset.name,
        serial_number: asset.serial_number,
        region: asset.region
      });
    }
  }, [asset]);

  const fetchRegions = async () => {
    try {
      const response = await axios.get('/api/regions/');
      setRegions(response.data);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (asset) {
        // Update existing asset
        await axios.put(`/api/assets/${asset.id}/`, formData);
      } else {
        // Create new asset
        await axios.post('/api/assets/', formData);
      }
      onClose();
    } catch (err) {
      setError('Failed to save asset');
      console.error('Error saving asset:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{asset ? 'Edit Asset' : 'Create New Asset'}</h2>
      
      {error && <div>Error: {error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Serial Number:
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Region:
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
            >
              <option value="">Select a region</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Submit'}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssetForm;
