import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FormResponses = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form details
        const formRes = await axios.get(`/api/forms/${id}`);
        setForm(formRes.data);

        // Fetch responses
        const responsesRes = await axios.get(`/api/responses/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setResponses(responsesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  if (!form) return <div className="text-center mt-8">Form not found</div>;

  // Helper function to get field label by ID
  const getFieldLabel = (fieldId) => {
    const field = form.fields.find(f => f.id === fieldId);
    return field ? field.label : fieldId;
  };

  // Helper function to get response value for display
  const formatResponseValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return value || 'Not answered';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        <p className="text-gray-600">{responses.length} responses</p>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No responses yet</h3>
          <p className="text-gray-600">Share your form to start collecting responses</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">Response ID</th>
                <th className="py-3 px-4 text-left">Submitted At</th>
                {form.fields.map((field, index) => (
                  <th key={field.id} className="py-3 px-4 text-left">{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((response, index) => (
                <tr key={response._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4">{response._id.substring(0, 8)}</td>
                  <td className="py-3 px-4">{new Date(response.submittedAt).toLocaleString()}</td>
                  {form.fields.map(field => {
                    const responseValue = response.responses.find(r => r.fieldId === field.id);
                    return (
                      <td key={field.id} className="py-3 px-4">
                        {formatResponseValue(responseValue ? responseValue.value : null)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {responses.length > 0 && (
        <div className="mt-6">
          <a 
            href={`/api/responses/${id}/export/csv`}
            className="btn btn-primary"
            download
          >
            Export as CSV
          </a>
        </div>
      )}
    </div>
  );
};

export default FormResponses;