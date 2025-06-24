import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onLogin({ username, password });
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-logo">
          <img src="/deloitte-logo.png" alt="Deloitte Logo" />
          <h1>Deloitte People Experience</h1>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button">Sign In</button>
          
          <div className="login-help">
            <p>For demo purposes:</p>
            <p>Employee login: employee/password</p>
            <p>Admin login: admin/password</p>
          </div>
        </form>
      </div>
      
      <div className="login-info">
        <h2>AI-Powered Employee Well-being</h2>
        <p>Our intelligent conversation bot helps identify and address employee concerns, improving overall well-being and engagement at Deloitte.</p>
      </div>
    </div>
  );
};

export default Login;
