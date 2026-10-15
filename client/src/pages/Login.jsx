import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Auth.css';

const API_LOGIN_URL = 'https://supply-chain-system-pbir.onrender.com/api/auth/login';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

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
    setStatusText('Connecting to cloud server...');

    // Timer para magpaalala kapag gising pa lang ang libreng Render server
    const wakeTimer = setTimeout(() => {
      setStatusText('Waking up free cloud backend (may take ~30-50s)...');
    }, 4500);

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
        throw new Error('Server returned an unreadable response. Please retry in a few seconds.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Invalid username or password.');
      }

      // Kuhanin ang token at role
      const resolvedToken = data.token || `auth-token-${Date.now()}`;
      const resolvedRole = data.user?.role || data.role || 'Admin';
      const resolvedUsername = data.user?.username || data.username || formData.username;

      // I-save sa session
      localStorage.setItem('token', resolvedToken);
      localStorage.setItem('role', resolvedRole);
      localStorage.setItem('username', resolvedUsername);

      navigate('/dashboard');
    } catch (err) {
      clearTimeout(wakeTimer);

      // Maayos na mensahe kung sakaling tulog pa o offline
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Server is still waking up from idle mode. Please click "Sign In" again.');
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