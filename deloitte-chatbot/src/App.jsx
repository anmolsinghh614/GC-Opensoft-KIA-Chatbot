import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (credentials) => {
    // In production, this would be an actual API call
    if (credentials.username && credentials.password) {
      setIsAuthenticated(true);
      setUserRole(credentials.username === 'admin' ? 'admin' : 'employee');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to={userRole === 'admin' ? '/dashboard' : '/chat'} /> : 
              <Login onLogin={handleLogin} />
          } />
          <Route path="/dashboard" element={
            isAuthenticated && userRole === 'admin' ? 
              <Dashboard onLogout={handleLogout} /> : 
              <Navigate to="/login" />
          } />
          <Route path="/chat" element={
            isAuthenticated ? 
              <ChatInterface onLogout={handleLogout} userRole={userRole} /> : 
              <Navigate to="/login" />
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
