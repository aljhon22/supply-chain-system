import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Auth.css';

const API_LOGIN_URL = 'https://supply-chain-system-pbir.onrender.com/api/auth/login';
const API_HEALTH_URL = 'https://supply-chain-system-pbir.onrender.com/api/health';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Pre-warm backend sa background pagkabukas pa lang ng page
  useEffect(() => {
    fetch(API_HEALTH_URL, { method: 'GET' })
      .then(() => console.log('Backend is awake and ready.'))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStatusText('Authenticating...');

    const wakeTimer = setTimeout(() => {
      setStatusText('Connecting to cloud server...');
    }, 3000);

    try {
      const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      clearTimeout(wakeTimer);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned an unreadable response. Please retry.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Invalid username or password.');
      }

      const resolvedToken = data.token || `auth-token-${Date.now()}`;
      const resolvedRole = data.user?.role || data.role || 'Admin';
      const resolvedUsername = data.user?.username || data.username || formData.username;

      localStorage.setItem('token', resolvedToken);
      localStorage.setItem('role', resolvedRole);
      localStorage.setItem('username', resolvedUsername);

      navigate('/dashboard');
    } catch (err) {
      clearTimeout(wakeTimer);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Server is warming up. Please click "Sign In" again.');
      } else {
        setError(err.message || 'Login attempt failed.');
      }
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign In</h2>
          <p>Supply Chain Logistics Management Platform</p>
        </div>

        {error && <div className="alert-message alert-error">{error}</div>}

        {loading && statusText && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#60a5fa',
              fontSize: '12px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '16px'
            }}
          >
            ⏳ {statusText}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Username or Email</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/register" className="terms-link">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;