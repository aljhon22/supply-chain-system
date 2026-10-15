import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScannerModal({ onClose, onScanSuccess }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 220, height: 220 } },
      false
    );

    scanner.render(
      (decodedText) => {
        try {
          const parsedData = JSON.parse(decodedText);
          onScanSuccess(parsedData);
        } catch (err) {
          onScanSuccess({ id: decodedText });
        }
        scanner.clear();
      },
      (error) => {
        // Suppress continuous camera frame read errors
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear scanner:", err));
    };
  }, [onScanSuccess]);

  const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', textAlign: 'center', width: '380px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
    closeBtn: { marginTop: '15px', padding: '8px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Scan Item Tag</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#64748b' }}>
          Align the item's QR code within the frame below.
        </p>
        
        <div id="qr-reader" style={{ width: '100%' }}></div>

        <button onClick={onClose} style={styles.closeBtn}>Close Scanner</button>
      </div>
    </div>
  );
}

export default QrScannerModal;