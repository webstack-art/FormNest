import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const FormPreview = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`/api/forms/${id}`);
        setForm(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load form');
        setLoading(false);
      }
    };

    fetchForm();

    // Setup socket connection to receive real-time responses
    const socket = io();
    socket.emit('join-form', id);

    socket.on('new-response', (response) => {
      // Update responses in real-time if needed
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleInputChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxChange = (fieldId, optionValue, isChecked) => {
    setResponses(prev => {
      const currentValues = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      let newValues;
      
      if (isChecked) {
        newValues = [...currentValues, optionValue];
      } else {
        newValues = currentValues.filter(val => val !== optionValue);
      }
      
      return {
        ...prev,
        [fieldId]: newValues
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const responsePayload = {
        responses: Object.keys(responses).map(fieldId => ({
          fieldId,
          value: responses[fieldId]
        }))
      };

      await axios.post(`/api/responses/submit/${id}`, responsePayload);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit form');
    }
  };

  if (loading) return <div className="text-center mt-8">Loading form...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!form) return <div className="text-center mt-8">Form not found</div>;

  if (submitted) {
    return (
      <div className="form-preview">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p>Your response has been recorded successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-preview">
      <h1 className="form-title">{form.title}</h1>
      {form.description && <p className="form-description">{form.description}</p>}
      
      <form onSubmit={handleSubmit}>
        {form.fields.map((field, index) => (
          <div key={field.id} className="form-question">
            <label className={`question-label ${field.required ? 'question-required' : ''}`}>
              {field.label}
            </label>
            
            {field.description && <p className="text-gray-600 text-sm mb-2">{field.description}</p>}
            
            {field.type === 'text' && (
              <input
                type="text"
                className="response-input"
                placeholder={field.placeholder}
                value={responses[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                className="response-input"
                placeholder={field.placeholder}
                value={responses[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                rows="4"
                required={field.required}
              />
            )}
            
            {field.type === 'number' && (
              <input
                type="number"
                className="response-input"
                placeholder={field.placeholder}
                value={responses[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'email' && (
              <input
                type="email"
                className="response-input"
                placeholder={field.placeholder}
                value={responses[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'phone' && (
              <input
                type="tel"
                className="response-input"
                placeholder={field.placeholder}
                value={responses[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'date' && (
              <input
                type="date"
                className="response-input"
                value={responses[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'dropdown' && (
              <select
                className="response-input"
                value={responses[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options.map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'radio' && (
              <div>
                {field.options.map((option, idx) => (
                  <div key={idx} className="response-option">
                    <input
                      type="radio"
                      id={`${field.id}-${option.value}`}
                      name={field.id}
                      value={option.value}
                      checked={responses[field.id] === option.value}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                    />
                    <label htmlFor={`${field.id}-${option.value}`} className="ml-2">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
            
            {field.type === 'checkbox' && (
              <div>
                {field.options.map((option, idx) => {
                  const currentValue = Array.isArray(responses[field.id]) ? responses[field.id] : [];
                  const isChecked = currentValue.includes(option.value);
                  
                  return (
                    <div key={idx} className="response-option">
                      <input
                        type="checkbox"
                        id={`${field.id}-${option.value}`}
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(field.id, option.value, e.target.checked)}
                        required={field.required && !currentValue.length}
                      />
                      <label htmlFor={`${field.id}-${option.value}`} className="ml-2">
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
            
            {field.type === 'file' && (
              <input
                type="file"
                className="response-input"
                onChange={(e) => handleInputChange(field.id, e.target.files[0])}
                required={field.required}
              />
            )}
            
            {field.type === 'rating' && (
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-2xl ${star <= (responses[field.id] || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => handleInputChange(field.id, star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <button 
          type="submit" 
          className="btn btn-primary w-full mt-6 py-3"
        >
          {form.settings.submitButtonText || 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default FormPreview;