import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      <div className="text-center mt-6">
        <h1 className="text-4xl font-bold mb-4">Create Beautiful Forms</h1>
        <p className="text-xl text-gray-600 mb-8">
          Build stunning forms with our easy-to-use drag and drop builder
        </p>
        
        {!user && (
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn btn-primary px-6 py-3 text-lg">
              Get Started - It's Free
            </Link>
            <Link to="/login" className="btn btn-outline px-6 py-3 text-lg">
              Login
            </Link>
          </div>
        )}
        
        {user && (
          <div className="flex justify-center gap-4">
            <Link to="/dashboard" className="btn btn-primary px-6 py-3 text-lg">
              Go to Dashboard
            </Link>
            <Link to="/create-form" className="btn btn-outline px-6 py-3 text-lg">
              Create New Form
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Drag & Drop Builder</h3>
          <p>Create forms with an intuitive drag and drop interface. No coding required!</p>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
          <p>Get instant insights from your form responses with beautiful charts and graphs.</p>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
          <p>Share your forms via links, embed them in websites, or generate QR codes.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;