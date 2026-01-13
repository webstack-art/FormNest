import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const { register } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  const { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !password2) {
      setAlert('Please fill in all fields', 'error');
      return;
    }

    if (password !== password2) {
      setAlert('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      setAlert('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setAlert(result.message, 'error');
      }
    } catch (err) {
      setAlert('Something went wrong', 'error');
    }
  };

  return (
    <div className="container">
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="card">
          <div className="card-header">Create an Account</div>
          
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={name}
                onChange={onChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={password}
                onChange={onChange}
                required
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password2" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="password2"
                name="password2"
                className="form-input"
                value={password2}
                onChange={onChange}
                required
                minLength="6"
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full mt-4">
              Register
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;