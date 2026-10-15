import React, { useState, useEffect } from 'react';
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
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyOtp = () => {
    if (initialOtp) {
      navigator.clipboard.writeText(initialOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Pakilagay ang 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: cleanOtp,
          code: cleanOtp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Mali ang verification code.');
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
      setError(err.message || 'Verification failed. Pakisubukan muli.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-header">
          <h2>Verify Account</h2>
          <p>
            Authentication code for <strong>{email || 'your account'}</strong>
          </p>
        </div>

        {/* Live In-App Passcode Card para sa Defense */}
        {initialOtp && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              textAlign: 'center',
              marginBottom: '18px'
            }}
          >
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981', fontWeight: '700', marginBottom: '4px' }}>
              ✓ Security Passcode Generated
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '8px', color: '#34d399', margin: '6px 0' }}>
              {initialOtp}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleCopyOtp}
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: 'none',
                  color: '#10b981',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>
              <button
                type="button"
                onClick={() => setOtp(initialOtp)}
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: 'none',
                  color: '#60a5fa',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Auto-Fill
              </button>
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label>6-Digit Security Code</label>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Expires in: <strong style={{ color: timeLeft < 60 ? '#ef4444' : '#38bdf8' }}>{formatTimer(timeLeft)}</strong>
              </span>
            </div>
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
                padding: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)'
              }}
              required
            />
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              (Master defense bypass code: <strong style={{ color: '#94a3b8' }}>888888</strong>)
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.trim().length !== 6}
            style={{ marginTop: '14px', width: '100%', height: '44px' }}
          >
            {loading ? 'Activating Session...' : 'Verify Code & Enter Dashboard'}
          </button>
        </form>

        <p className="auth-footer-text">
          Want to change account details?{' '}
          <Link to="/register" className="terms-link">
            Back to Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OTPVerify;