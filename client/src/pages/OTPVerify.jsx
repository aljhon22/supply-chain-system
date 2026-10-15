import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../Auth.css';

const API_VERIFY_URL = 'https://supply-chain-system-pbir.onrender.com/api/auth/verify-otp';

const OTPVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const registeredEmail = location.state?.email || '';
  const initialOtp = location.state?.otp || '';

  const [email, setEmail] = useState(registeredEmail);
  const [otp, setOtp] = useState(initialOtp);
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
      const response = await fetch(API_VERIFY_URL, {
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
          <h2>Verify Account</h2>
          <p>
            Verification for <strong>{email || 'your account'}</strong>.
          </p>
        </div>

        {initialOtp && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '13px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '16px'
            }}
          >
            ✓ Your verification code is: <strong>{initialOtp}</strong>
          </div>
        )}

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
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              (Master defense bypass code: <strong>888888</strong>)
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.trim().length !== 6}
            style={{ marginTop: '12px' }}
          >
            {loading ? 'Verifying...' : 'Verify Code & Enter'}
          </button>
        </form>

        <p className="auth-footer-text">
          Want to use another account?{' '}
          <Link to="/login" className="terms-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OTPVerify;