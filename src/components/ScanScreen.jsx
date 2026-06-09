import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { runOCR, mergeOCRTexts, runOfflineOCR } from '../utils/ocrService';
import { extractCardData } from '../utils/extractCardData';
import { saveContactToDB } from '../storage/db';
import { enqueueAction } from '../queue/offlineQueue';

export default function ScanScreen({ onCardScanned }) {

  const [scanning, setScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sourceLabel, setSourceLabel] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const galleryRef = useRef(null);

  const addToast = useToast();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch (error) {
      addToast('Camera access denied.', 'error');
    }
  };

  const captureSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      stopCamera();
      processImage(blob, 'Camera');
    }, 'image/jpeg', 0.95);
  };

  // ─────────────────────────────────────────────
  // MAIN PROCESS
  // ─────────────────────────────────────────────

  const processImage = async (imageFile, source) => {
    if (!imageFile.type.startsWith('image/')) {
      addToast('Please upload image file', 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    setScanning(true);
    setProgress(10);
    setSourceLabel(source);

    try {
      addToast('Running local OCR scan...', 'info');
      setProgress(20);

      // Run client-side Tesseract OCR via unified runOCR
      const ocrResult = await runOCR(imageFile, (p) => {
        // Scale Tesseract progress (0-1) to our progress UI range (20-90)
        setProgress(Math.round(20 + p * 70));
      });

      if (!ocrResult.text) {
        throw new Error('OCR returned no text');
      }

      const extractedData = extractCardData(ocrResult.text);
      
      // Keep raw Blob for avatars/previews
      extractedData.imageBlob = imageFile;

      setProgress(100);
      setTimeout(() => {
        setScanning(false);
        addToast('Scan complete!', 'success');
        onCardScanned(extractedData, objectUrl);
      }, 500);

    } catch (error) {
      console.error(error);
      addToast('Failed to scan card locally', 'error');
      setScanning(false);
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="page-content">

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Capture Card
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Instant AI extraction from any business card.
        </p>
      </div>

      {cameraOpen ? (

        <div className="scan-area" style={{ marginBottom: 24 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="scan-frame">
            <div className="scan-corner tl" />
            <div className="scan-corner tr" />
            <div className="scan-corner bl" />
            <div className="scan-corner br" />
          </div>
          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 20
          }}>
            <button className="btn" onClick={stopCamera}>Close</button>
            <button className="btn" onClick={captureSnapshot}>Capture</button>
          </div>
        </div>

      ) : (

        <div className="scan-area" style={{ marginBottom: 24 }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt="Preview"
            />
          ) : (
            <div className="scan-placeholder">
              <div className="scan-placeholder-icon">📷</div>
              <span>Upload or Take Photo</span>
            </div>
          )}
          {scanning && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%',
              transform: 'translateX(-50%)', background: 'black',
              color: 'white', padding: '8px 20px', borderRadius: 99
            }}>
              Reading Card... {progress}%
            </div>
          )}
        </div>

      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={openCamera}
          disabled={scanning}
        >
          Take Photo
        </button>
        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={() => galleryRef.current.click()}
          disabled={scanning}
        >
          Upload
        </button>
      </div>

      {/* Premium Feature Flash Cards */}
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: 2 }}>
          AI Core Features
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 12 
        }}>
          {/* Card 1: Fast OCR */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 10, 
              background: 'var(--primary)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span className="material-icons" style={{ fontSize: 18 }}>offline_bolt</span>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Fast OCR</h4>
              <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3 }}>In-browser local AI engine reads card text instantly.</p>
            </div>
          </div>

          {/* Card 2: Offline First */}
          <div style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '1px solid #BBF7D0',
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 10, 
              background: 'var(--success)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span className="material-icons" style={{ fontSize: 18 }}>wifi_off</span>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>100% Offline</h4>
              <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3 }}>Fully works without internet. Scan, edit, & save instantly.</p>
            </div>
          </div>

          {/* Card 3: Smart Match */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1px solid #FDE68A',
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 10, 
              background: 'var(--warning)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span className="material-icons" style={{ fontSize: 18 }}>call_merge</span>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Smart Match</h4>
              <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3 }}>Detects duplicate contacts instantly in local DB.</p>
            </div>
          </div>

          {/* Card 4: Action Queue */}
          <div style={{
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            border: '1px solid #E9D5FF',
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 10, 
              background: '#7C3AED', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span className="material-icons" style={{ fontSize: 18 }}>sync</span>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Smart Queue</h4>
              <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3 }}>Queues follow-ups and CRM syncs until online.</p>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files[0]) processImage(e.target.files[0], 'Gallery');
          e.target.value = '';
        }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

    </div>
  );
}