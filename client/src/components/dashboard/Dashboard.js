import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        };

        const res = await axios.get('/api/forms', config);
        setForms(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err.response.data);
        setLoading(false);
      }
    };

    if (user) {
      fetchForms();
    }
  }, [user]);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Your Forms</h2>
        <Link to="/create-form" className="btn btn-primary">
          Create New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">You don't have any forms yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first form</p>
          <Link to="/create-form" className="btn btn-primary">
            Create Form
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          {forms.map(form => (
            <div key={form._id} className="form-card">
              <h3 className="form-card-title">{form.title}</h3>
              <p className="text-gray-600 mb-3">{form.description || 'No description'}</p>
              
              <div className="form-card-stats">
                <span>{form.responsesCount} responses</span>
                <span>{form.fields.length} fields</span>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Link 
                  to={`/form/${form._id}`} 
                  className="btn btn-outline text-sm flex-1 text-center"
                >
                  Preview
                </Link>
                <Link 
                  to={`/form/${form._id}/responses`} 
                  className="btn btn-outline text-sm flex-1 text-center"
                >
                  Responses
                </Link>
                <Link 
                  to={`/form/${form._id}/analytics`} 
                  className="btn btn-outline text-sm flex-1 text-center"
                >
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;