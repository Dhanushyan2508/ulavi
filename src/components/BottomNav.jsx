export default function BottomNav({ activePage, setPage }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item${activePage === 'scan' ? ' active' : ''}`}
        onClick={() => setPage('scan')}
      >
        <span className="material-icons">photo_camera</span>
        <span className="nav-label">Scan</span>
      </button>

      <button
        className={`nav-item${activePage === 'review' ? ' active' : ''}`}
        onClick={() => setPage('review')}
      >
        <span className="material-icons">edit_note</span>
        <span className="nav-label">Review</span>
      </button>

      {/* Centre FAB - simplified for this component, logic handled in App or Screen */}
      <div style={{ width: 60, height: 60, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <button
          className="nav-scan-btn"
          onClick={() => setPage('scan')}
          aria-label="Scanner"
        >
          <span className="material-icons">qr_code_scanner</span>
        </button>
      </div>

      <button
        className={`nav-item${activePage === 'contacts' ? ' active' : ''}`}
        onClick={() => setPage('contacts')}
      >
        <span className="material-icons">group</span>
        <span className="nav-label">Contacts</span>
      </button>

      <button
        className={`nav-item${activePage === 'templates' ? ' active' : ''}`}
        onClick={() => setPage('templates')}
      >
        <span className="material-icons">tune</span>
        <span className="nav-label">Settings</span>
      </button>
    </nav>
  );
}
