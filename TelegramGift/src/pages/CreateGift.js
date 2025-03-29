import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function CreateGift() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    model: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleModelChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        setFormData(prev => ({ ...prev, model: file }));
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        alert('Please upload a .glb or .gltf file');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Here you would typically upload the model and create the gift
      // This is a placeholder
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('userId', user.id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      navigate('/marketplace');
    } catch (error) {
      console.error('Error creating gift:', error);
      alert('Failed to create gift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-gift-page">
      <div className="card">
        <h1>Create New Gift</h1>
        <form onSubmit={handleSubmit} className="create-gift-form">
          <div className="form-group">
            <label htmlFor="name">Gift Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (TON)</label>
            <input
              type="number"
              id="price"
              step="0.1"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">3D Model (GLB/GLTF)</label>
            <input
              type="file"
              id="model"
              accept=".glb,.gltf"
              onChange={handleModelChange}
              required
            />
          </div>

          {previewUrl && (
            <div className="model-preview">
              <h3>Preview</h3>
              <model-viewer
                src={previewUrl}
                alt="Gift preview"
                auto-rotate
                camera-controls
                shadow-intensity="1"
                environment-image="neutral">
              </model-viewer>
            </div>
          )}

          <button 
            type="submit" 
            className="button" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Gift'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGift; 