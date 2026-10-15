import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../Auth.css';

const OTPVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email forwarded from registration view or input fallback
  const registeredEmail = location.state?.email || '';

  const [email, setEmail] = useState(registeredEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: cleanOtp,
          code: cleanOtp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed. Please check the code.');
      }

      // Store authenticated credentials
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user?.role || 'Warehouse');
        localStorage.setItem('username', data.user?.username || 'Operator');
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Verify Email</h2>
          <p>
            Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>.
          </p>
        </div>

        {error && <div className="alert-message alert-error">{error}</div>}

        <form onSubmit={handleVerify}>
          {!registeredEmail && (
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>
              6-Digit Passcode
            </label>
            <input
              type="text"
              maxLength="6"
              className="form-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={{
                fontSize: '28px',
                fontWeight: '700',
                letterSpacing: '10px',
                textAlign: 'center',
                padding: '10px'
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.trim().length !== 6}
            style={{ marginTop: '16px' }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <p className="auth-footer-text">
          Didn't receive the email?{' '}
          <Link to="/register" className="terms-link">
            Try registering again
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OTPVerify;