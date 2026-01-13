import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CreateForm from './components/forms/CreateForm';
import FormPreview from './components/forms/FormPreview';
import FormResponses from './components/forms/FormResponses';
import FormAnalytics from './components/forms/FormAnalytics';
import NotFound from './components/layout/NotFound';

// Contexts
import AuthState from './context/AuthState';
import AlertState from './context/AlertState';

// CSS
import './App.css';

function App() {
  return (
    <AuthState>
      <AlertState>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <>
              <Navbar />
              <div className="container">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-form" element={<CreateForm />} />
                  <Route path="/form/:id" element={<FormPreview />} />
                  <Route path="/form/:id/responses" element={<FormResponses />} />
                  <Route path="/form/:id/analytics" element={<FormAnalytics />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </>
          </Router>
        </DndProvider>
      </AlertState>
    </AuthState>
  );
}

export default App;