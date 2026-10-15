import React from 'react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Terms of Service & Usage Agreement</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <h4>1. Acceptance of Terms</h4>
          <p>
            By accessing and utilizing this Supply Chain Management System, you confirm your legal capacity and agree to be bound by these Terms of Service.
          </p>

          <h4>2. Authorized Access & System Integrity</h4>
          <p>
            Accounts are assigned for designated personnel based on authenticated roles. You agree not to distribute credentials, bypass route guards, or initiate unauthorized database operations.
          </p>

          <h4>3. Audit Logging & Verification</h4>
          <p>
            Every transaction, barcode scan, inventory variance, and status alteration is systematically timestamped and attributed to your user identification within an immutable audit trail.
          </p>

          <h4>4. Data Privacy & Confidentiality</h4>
          <p>
            Supplier contracts, warehouse allocations, and shipment manifests must be handled according to strict corporate data compliance policies.
          </p>

          <h4>5. Account Revocation</h4>
          <p>
            Administrators reserve the right to suspend or revoke access immediately in the event of suspicious activity or breach of warehouse operational procedures.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>I Understand & Accept</button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;