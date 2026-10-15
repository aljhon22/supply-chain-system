import React, { useState } from 'react';
import './Auth.css';

const Auth = () => {
  const [view, setView] = useState('login'); // 'login', 'register', or 'verify'

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{view === 'login' ? 'System Login' : view === 'register' ? 'Create Account' : 'Verify Identity'}</h2>
        
        <form className="auth-form">
          {(view === 'login' || view === 'register') && (
            <>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email" required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" required />
              </div>
            </>
          )}

          {view === 'verify' && (
            <div className="input-group">
              <label>6-Digit Verification Code</label>
              <input type="text" placeholder="000000" maxLength="6" required />
            </div>
          )}

          <button type="submit" className="primary-btn">
            {view === 'login' ? 'Access Dashboard' : view === 'register' ? 'Register' : 'Verify Account'}
          </button>
        </form>

        <div className="auth-links">
          {view === 'login' ? (
            <p>Need access? <span onClick={() => setView('register')}>Register here</span></p>
          ) : (
            <p>Already registered? <span onClick={() => setView('login')}>Log in</span></p>
          )}
          {view !== 'verify' && (
            <p className="verify-link" onClick={() => setView('verify')}>Have a verification code?</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;