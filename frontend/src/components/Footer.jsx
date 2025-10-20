const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <span className="footer-icon">💫</span>
          <span className="footer-text">Real-time data from Bluesky</span>
        </div>
        <div className="footer-divider">•</div>
        <div className="footer-section">
          <span className="footer-icon">🔄</span>
          <span className="footer-text">Updates every 15 minutes</span>
        </div>
        <div className="footer-divider">•</div>
        <div className="footer-section">
          <span className="footer-icon">🚀</span>
          <span className="footer-text">Built with React & D3.js</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;

