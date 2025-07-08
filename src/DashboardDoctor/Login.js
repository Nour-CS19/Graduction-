// src/pages/Login.jsx
import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    console.log('Login:', email, password);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="p-4">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="loginEmail" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="loginEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
        </div>
        <div className="mb-3">
          <label htmlFor="loginPassword" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="loginPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <div className="mt-3">
        <a href="#!">Forgot Password?</a>
      </div>
    </div>
  );
};

export default Login;
