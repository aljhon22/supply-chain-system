import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TermsModal from '../components/TermsModal';
import '../Auth.css';

const API_REGISTER_URL = 'https://supply-chain-system-pbir.onrender.com/api/auth/register';
const API_HEALTH_URL = 'https://supply-chain-system-pbir.onrender.com/api/health';

const PASSKEY_HINTS = {
  Warehouse: 'WH-2026',
  Procurement: 'PROC-2026',
  Admin: 'ADMIN-2026'
};

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
    securityPasskey: '',
    password: '',
    confirmPassword: ''
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(API_HEALTH_URL, { method: 'GET' }).catch(() => {});
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
      setError('Ang password ay dapat hindi bababa sa 6 na characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Hindi magkatugma ang password confirmation.');
      return;
    }

    if (!agreedToTerms) {
      setError('Paki-sang-ayunan muna ang Terms of Service.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          securityPasskey: formData.securityPasskey.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Hindi natuloy ang pagrehistro.');
      }

      alert('✓ Tagumpay! Nalikha ang account. Maaari ka nang mag-sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Network error. Pakisubukan muli.');
    } finally {
      setLoading(false);
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

        <form onSubmit={handleRegister}>
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                placeholder="Pumili ng username"
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
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Pangalan"
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
                placeholder="Gitnang pangalan (opsyonal)"
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
                placeholder="Apelyido"
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

            {/* Department Security Passkey Requirement */}
            <div className="form-group full-width" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0, color: '#93c5fd' }}>Department Authorization Passkey</label>
                <span style={{ fontSize: '11px', color: '#60a5fa' }}>
                  Default for {formData.role}: <strong>{PASSKEY_HINTS[formData.role]}</strong>
                </span>
              </div>
              <input
                type="text"
                name="securityPasskey"
                className="form-input"
                value={formData.securityPasskey}
                onChange={handleChange}
                placeholder={`Ilagay ang passkey (Halimbawa: ${PASSKEY_HINTS[formData.role]})`}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Address / Warehouse Assignment</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="Halimbawa: Central Warehouse, Quezon City"
                required
              />
            </div>

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
            style={{ width: '100%', height: '44px' }}
          >
            {loading ? 'Authorizing & Creating Account...' : 'Register Account'}
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