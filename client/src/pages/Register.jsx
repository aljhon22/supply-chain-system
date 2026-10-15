import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const DEPARTMENT_PASSKEYS = {
  Warehouse: 'WH-2026',
  Procurement: 'PROC-2026',
  Admin: 'ADMIN-2026'
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    contactNumber: '',
    role: 'Warehouse',
    securityPasskey: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Seamless Adaptive URL (Supports Localhost and Cloud Deployment automatically)
  const API_BASE_URL =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000/api/auth'
      : 'https://supply-chain-system-pbir.onrender.com/api/auth';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation Checks
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('You must acknowledge and accept the Terms of Service to proceed.');
      return;
    }

    const expectedPasskey = DEPARTMENT_PASSKEYS[formData.role];
    if (formData.securityPasskey.trim().toUpperCase() !== expectedPasskey) {
      setErrorMessage(`Invalid Department Authorization Passkey for ${formData.role}. Required key: ${expectedPasskey}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          dob: formData.dob,
          contactNumber: formData.contactNumber.trim(),
          role: formData.role,
          securityPasskey: formData.securityPasskey.trim().toUpperCase(),
          address: formData.address.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please check your details.');
      }

      setSuccessMessage('Account registered successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '30px 16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#1e293b',
          borderRadius: '14px',
          padding: '32px 28px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#f8fafc'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            Create Account
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Supply Chain Logistics Management Platform
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '18px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#6ee7b7',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '18px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Row 1: Username & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                placeholder="e.g. jdoe_staff"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Email Address (Any Dummy Email) *
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                placeholder="e.g. staff1@dummy.local"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: First Name & Middle Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Middle Name (Optional)
              </label>
              <input
                type="text"
                name="middleName"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                placeholder="Middle name"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Last Name & Date of Birth */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Date of Birth *
              </label>
              <input
                type="date"
                name="dob"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 4: Contact Number & System Role */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                placeholder="e.g. 09123456789"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                System Role *
              </label>
              <select
                name="role"
                className="form-input"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Warehouse">Warehouse Staff</option>
                <option value="Procurement">Procurement Manager</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          </div>

          {/* Department Passkey Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#93c5fd' }}>
                Department Authorization Passkey *
              </label>
              <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '600' }}>
                Key for {formData.role}: <strong>{DEPARTMENT_PASSKEYS[formData.role]}</strong>
              </span>
            </div>
            <input
              type="text"
              name="securityPasskey"
              className="form-input"
              style={{ backgroundColor: '#0f172a', borderColor: '#1d4ed8', color: '#ffffff', letterSpacing: '1px' }}
              placeholder={`Enter key (e.g. ${DEPARTMENT_PASSKEYS[formData.role]})`}
              value={formData.securityPasskey}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address / Assignment */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
              Address / Warehouse Facility Assignment
            </label>
            <input
              type="text"
              name="address"
              className="form-input"
              style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
              placeholder="e.g. Central Logistics Hub, Quezon City"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Row 5: Password & Confirm Password (with Show/Hide Toggle) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  style={{ width: '100%', paddingRight: '42px', backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  style={{ width: '100%', paddingRight: '42px', backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="agreeTerms" style={{ fontSize: '12.5px', color: '#94a3b8', cursor: 'pointer' }}>
              I have read and agree to the <span style={{ color: '#38bdf8' }}>Terms of Service</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', fontSize: '14.5px' }}
          >
            {isLoading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;