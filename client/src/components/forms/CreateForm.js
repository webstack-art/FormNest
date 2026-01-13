import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Field types available in the form builder
const FIELD_TYPES = [
  { type: 'text', label: 'Short Answer', icon: 'T' },
  { type: 'textarea', label: 'Long Answer', icon: 'AB' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'email', label: 'Email', icon: '@' },
  { type: 'phone', label: 'Phone', icon: '📞' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'dropdown', label: 'Dropdown', icon: '▼' },
  { type: 'checkbox', label: 'Checkboxes', icon: '☐' },
  { type: 'radio', label: 'Multiple Choice', icon: '○' },
  { type: 'file', label: 'File Upload', icon: '📁' },
  { type: 'rating', label: 'Rating', icon: '⭐' }
];

// Component for draggable field items
const DraggableField = ({ field, onEdit, onDelete, onDuplicate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldData, setFieldData] = useState({ ...field });

  const handleSave = () => {
    onEdit(field.id, fieldData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFieldData({ ...field });
    setIsEditing(false);
  };

  const renderFieldEditor = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div>
            <input
              type="text"
              className="form-input w-full mb-2"
              value={fieldData.label}
              onChange={(e) => setFieldData({...fieldData, label: e.target.value})}
              placeholder="Question"
            />
            <input
              type="text"
              className="form-input w-full mb-2"
              value={fieldData.placeholder || ''}
              onChange={(e) => setFieldData({...fieldData, placeholder: e.target.value})}
              placeholder="Placeholder text"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fieldData.required || false}
                onChange={(e) => setFieldData({...fieldData, required: e.target.checked})}
                className="mr-2"
              />
              Required
            </label>
          </div>
        );
      case 'textarea':
        return (
          <div>
            <input
              type="text"
              className="form-input w-full mb-2"
              value={fieldData.label}
              onChange={(e) => setFieldData({...fieldData, label: e.target.value})}
              placeholder="Question"
            />
            <textarea
              className="form-input w-full mb-2"
              value={fieldData.placeholder || ''}
              onChange={(e) => setFieldData({...fieldData, placeholder: e.target.value})}
              placeholder="Placeholder text"
              rows="2"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fieldData.required || false}
                onChange={(e) => setFieldData({...fieldData, required: e.target.checked})}
                className="mr-2"
              />
              Required
            </label>
          </div>
        );
      case 'dropdown':
      case 'radio':
      case 'checkbox':
        return (
          <div>
            <input
              type="text"
              className="form-input w-full mb-2"
              value={fieldData.label}
              onChange={(e) => setFieldData({...fieldData, label: e.target.value})}
              placeholder="Question"
            />
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={fieldData.required || false}
                onChange={(e) => setFieldData({...fieldData, required: e.target.checked})}
                className="mr-2"
              />
              Required
            </label>
            <div className="mb-2">
              <label className="block mb-1">Options:</label>
              {(fieldData.options || []).map((option, idx) => (
                <div key={idx} className="flex mb-1">
                  <input
                    type="text"
                    className="form-input flex-1 mr-1"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(fieldData.options || [])];
                      newOptions[idx].label = e.target.value;
                      setFieldData({...fieldData, options: newOptions});
                    }}
                    placeholder={`Option ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = [...(fieldData.options || [])];
                      newOptions.splice(idx, 1);
                      setFieldData({...fieldData, options: newOptions});
                    }}
                    className="btn btn-danger text-xs ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newOptions = [...(fieldData.options || []), { value: `option_${uuidv4()}`, label: '' }];
                  setFieldData({...fieldData, options: newOptions});
                }}
                className="btn btn-outline text-xs mt-1"
              >
                Add Option
              </button>
            </div>
          </div>
        );
      case 'date':
        return (
          <div>
            <input
              type="text"
              className="form-input w-full mb-2"
              value={fieldData.label}
              onChange={(e) => setFieldData({...fieldData, label: e.target.value})}
              placeholder="Question"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fieldData.required || false}
                onChange={(e) => setFieldData({...fieldData, required: e.target.checked})}
                className="mr-2"
              />
              Required
            </label>
          </div>
        );
      case 'file':
        return (
          <div>
            <input
              type="text"
              className="form-input w-full mb-2"
              value={fieldData.label}
              onChange={(e) => setFieldData({...fieldData, label: e.target.value})}
              placeholder="Question"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fieldData.required || false}
                onChange={(e) => setFieldData({...fieldData, required: e.target.checked})}
                className="mr-2"
              />
              Required
            </label>
          </div>
        );
      case 'rating':
        return (
          <div>
            <input
              type="text"
              className="form-input w-full mb-2"
              value={fieldData.label}
              onChange={(e) => setFieldData({...fieldData, label: e.target.value})}
              placeholder="Question"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fieldData.required || false}
                onChange={(e) => setFieldData({...fieldData, required: e.target.checked})}
                className="mr-2"
              />
              Required
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-field-item">
      <div className="form-field-content">
        {!isEditing ? (
          <div>
            <div className="font-medium mb-2">{field.label || `Untitled ${field.type}`}</div>
            {renderFieldPreview(field)}
          </div>
        ) : (
          renderFieldEditor()
        )}
      </div>
      
      <div className="field-controls">
        <button 
          className="btn btn-outline text-xs"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
        <button 
          className="btn btn-outline text-xs"
          onClick={onDuplicate}
        >
          Duplicate
        </button>
        <button 
          className="btn btn-danger text-xs"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const renderFieldPreview = (field) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'number':
      return <input type={field.type} className="response-input" placeholder={field.placeholder || ''} disabled />;
    case 'textarea':
      return <textarea className="response-input" placeholder={field.placeholder || ''} disabled />;
    case 'dropdown':
      return (
        <select className="response-input" disabled>
          <option value="">Select an option</option>
          {(field.options || []).map((option, idx) => (
            <option key={idx} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    case 'radio':
      return (
        <div>
          {(field.options || []).map((option, idx) => (
            <div key={idx} className="response-option">
              <input type="radio" disabled /> <span>{option.label}</span>
            </div>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div>
          {(field.options || []).map((option, idx) => (
            <div key={idx} className="response-option">
              <input type="checkbox" disabled /> <span>{option.label}</span>
            </div>
          ))}
        </div>
      );
    case 'date':
      return <input type="date" className="response-input" disabled />;
    case 'file':
      return <input type="file" className="response-input" disabled />;
    case 'rating':
      return (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-yellow-400 text-xl">★</span>
          ))}
        </div>
      );
    default:
      return <input type="text" className="response-input" disabled />;
  }
};

const CreateForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: []
  });
  const [activeTab, setActiveTab] = useState('form');

  const navigate = useNavigate();

  const [{ isOver }, drop] = useDrop({
    accept: 'FIELD',
    drop: (item) => addField(item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  const addField = (type) => {
    const newField = {
      id: uuidv4(),
      type,
      label: `Untitled ${type}`,
      required: false,
      ...(type === 'dropdown' || type === 'radio' || type === 'checkbox' ? { options: [] } : {})
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleFieldEdit = (fieldId, updatedField) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updatedField } : field
      )
    }));
  };

  const handleFieldDelete = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleFieldDuplicate = (fieldId) => {
    const fieldToDuplicate = formData.fields.find(field => field.id === fieldId);
    if (fieldToDuplicate) {
      const duplicatedField = {
        ...fieldToDuplicate,
        id: uuidv4()
      };
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, duplicatedField]
      }));
    }
  };

  const moveField = (fromIndex, toIndex) => {
    const newFields = [...formData.fields];
    const [movedItem] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedItem);
    setFormData(prev => ({
      ...prev,
      fields: newFields
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const formPayload = {
        title: formData.title,
        description: formData.description,
        fields: formData.fields
      };

      await axios.post('/api/forms', formPayload, config);
      
      // Redirect to dashboard after successful creation
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating form:', err.response?.data || err.message);
    }
  };

  return (
    <div className="form-builder-container">
      {/* Left Panel - Available Fields */}
      <div className="form-fields-panel">
        <h3 className="font-semibold mb-4">Add Fields</h3>
        <div className="space-y-2">
          {FIELD_TYPES.map((fieldType, index) => (
            <div
              key={index}
              className="p-3 border rounded cursor-move bg-white shadow-sm hover:shadow-md transition-shadow"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('fieldType', fieldType.type)}
            >
              <div className="flex items-center">
                <span className="mr-2 text-gray-500">{fieldType.icon}</span>
                <span>{fieldType.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas - Form Preview */}
      <div 
        ref={drop} 
        className={`form-canvas ${isOver ? 'bg-blue-50' : ''}`}
      >
        <div className="mb-6">
          <input
            type="text"
            className="form-input text-2xl font-bold w-full mb-2"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Form Title"
          />
          <textarea
            className="form-input w-full"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Form Description"
            rows="2"
          />
        </div>

        {formData.fields.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>Drag fields from the left panel to start building your form</p>
          </div>
        ) : (
          <div>
            {formData.fields.map((field, index) => (
              <DraggableField
                key={field.id}
                field={field}
                onEdit={handleFieldEdit}
                onDelete={() => handleFieldDelete(field.id)}
                onDuplicate={() => handleFieldDuplicate(field.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-6">
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!formData.title.trim() || formData.fields.length === 0}
          >
            Save Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateForm;