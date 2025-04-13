'use client';

import React, { useState, useEffect } from 'react';
import { MockPageUser } from '@/payload-types';

interface MockPageUserFormProps {
  mockPageUser?: MockPageUser;
  onClose: () => void;
  onSave: (data: { name: string }) => Promise<void>;
  title: string;
}

const MockPageUserForm: React.FC<MockPageUserFormProps> = ({ mockPageUser, onClose, onSave, title }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form data if editing an existing mock page user
  useEffect(() => {
    if (mockPageUser) {
      setName(mockPageUser.name);
    }
  }, [mockPageUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate form
      if (!name.trim()) {
        setError('Name is required');
        setIsLoading(false);
        return;
      }
      
      await onSave({ name });
      
      setSuccess('Mock page user saved successfully!');
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error saving mock page user:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter user type name"
                className="form-input"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MockPageUserForm;
