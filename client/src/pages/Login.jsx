import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const navigate = useNavigate();

  // Primary Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2FA Modal States
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FASetup, setIs2FASetup] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [userId, setUserId] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const API_BASE_URL = 'https://supply-chain-system-pbir.onrender.com/api/auth'; // Update to Render URL for cloud deployment

  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login credentials incorrect.');
      }

      if (data.requires2FA) {
        setUserId(data.userId);
        setIs2FASetup(data.isSetup);
        if (data.isSetup) {
          setQrCodeImage(data.qrCode);
          setSecretKey(data.secretKey);
        }
        setShow2FAModal(true);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          totpCode,
          secretKey: is2FASetup ? secretKey : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid authenticator code.');
      }

      // Store authenticated credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('role', data.user.role);

      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        padding: '36px 30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            System Sign In
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Enterprise Supply Chain Management Portal
          </p>
        </div>

        {errorMessage && !show2FAModal && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleInitialLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Username or Email
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. wawawa2"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Account Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {isLoading ? 'Verifying Credentials...' : 'Authenticate Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Authorized Personnel Only. Need an account?{' '}
          <Link to="/register" style={{ color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>
            Register
          </Link>
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      {show2FAModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Two-Factor Authentication</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShow2FAModal(false);
                  setErrorMessage('');
                  setTotpCode('');
                }}
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                marginBottom: '16px',
                border: '1px solid #fecaca'
              }}>
                {errorMessage}
              </div>
            )}

            {is2FASetup ? (
              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
                  Scan this QR code using the <strong>Google Authenticator</strong> mobile application:
                </p>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  display: 'inline-block',
                  border: '1px solid #e2e8f0',
                  marginBottom: '12px'
                }}>
                  <img src={qrCodeImage} alt="2FA QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Manual Secret Key: <strong style={{ color: '#0f172a' }}>{secretKey}</strong>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '38px', marginBottom: '8px' }}>🔐</div>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
                  Enter the rolling 6-digit passcode generated by your Google Authenticator app:
                </p>
              </div>
            )}

            <form onSubmit={handleVerify2FA}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '22px',
                    letterSpacing: '6px',
                    fontWeight: '800',
                    padding: '10px'
                  }}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                  Defense Emergency Master Bypass Code: <strong>888888</strong>
                </span>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || totpCode.length !== 6}
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
              >
                {isLoading ? 'Validating Token...' : 'Verify & Access System'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;