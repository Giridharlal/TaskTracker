import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css'; // Importing CSS file

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name === '' || email === '' || password === '') {
      setErrorMessage('All fields are required');
      return;
    }

    if (password.length < 5) {
      setErrorMessage('Password should be at least 5 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      navigate('/login'); // Redirect to login page after successful registration
    } catch (error) {
      console.error(error);
      setErrorMessage('Registration failed');
    }
  };

  return (
    <div className="register-form-container">
      <h2 className="register-heading">Register</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <label className="input-label" htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            className="input-field"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label className="input-label" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="input-field"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label className="input-label" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="input-field"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="register-button">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
