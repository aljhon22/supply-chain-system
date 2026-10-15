import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TermsModal from '../components/TermsModal';
import '../Auth.css';

const API_REGISTER_URL = 'https://supply-chain-system-pbir.onrender.com/api/auth/register';
const API_HEALTH_URL = 'https://supply-chain-system-pbir.onrender.com/api/health';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    email: '',
    contactNumber: '',
    address: '',
    role: 'Warehouse',
    password: '',
    confirmPassword: ''
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Pre-warm backend sa background habang nagpi-fill up pa lang ang user
  useEffect(() => {
    fetch(API_HEALTH_URL, { method: 'GET' })
      .then(() => console.log('Backend pre-warmed for registration.'))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must read and agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    setStatusText('Creating account on cloud server...');

    const wakeTimer = setTimeout(() => {
      setStatusText('Connecting to cloud backend (may take ~30-50s if waking up)...');
    }, 4500);

    try {
      const response = await fetch(API_REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          dob: formData.dob,
          email: formData.email.trim(),
          contactNumber: formData.contactNumber.trim(),
          address: formData.address.trim(),
          role: formData.role,
          password: formData.password
        })
      });

      clearTimeout(wakeTimer);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned an unreadable response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      // Diretso sa OTP verification matapos maipadala ang verification email
      navigate('/verify-otp', { state: { email: formData.email.trim() } });
    } catch (err) {
      clearTimeout(wakeTimer);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cloud server is still spinning up. Please click Register again.');
      } else {
        setError(err.message || 'Server communication error.');
      }
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Create Account</h2>
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

        <form onSubmit={handleRegister}>
          <div className="form-grid">
            {/* Account Credentials */}
            <div className="form-group">
              <label>Username</label>
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

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Personal Details */}
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>

            <div className="form-group">
              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                className="form-input"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Middle name (optional)"
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                className="form-input"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                className="form-input"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="09123456789"
                required
              />
            </div>

            <div className="form-group">
              <label>System Role</label>
              <select
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Warehouse">Warehouse Staff</option>
                <option value="Procurement">Procurement Manager</option>
                <option value="Admin">System Admin</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Address / Warehouse Assignment</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="Location / Warehouse assignment"
                required
              />
            </div>

            {/* Password Credentials */}
            <div className="form-group">
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

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Terms & Conditions Agreement */}
          <label className="terms-agreement">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span>
              I have read and agree to the{' '}
              <span
                role="button"
                className="terms-link"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
              >
                Terms of Service
              </span>
            </span>
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !agreedToTerms}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already registered?{' '}
          <Link to="/login" className="terms-link">
            Sign In
          </Link>
        </p>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
};

export default Register;