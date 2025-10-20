const Header = ({ stats }) => {
  return (
    <div className="header">
      <div className="logo">
        <span className="logo-icon">🌐</span>
        <span className="logo-text">Social Bubble</span>
        <span className="logo-subtitle">Live Social Visualization</span>
      </div>
      <div className="stats">
        <div className="stat-item">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_posts.toLocaleString()}</div>
            <div className="stat-label">Posts</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_authors.toLocaleString()}</div>
            <div className="stat-label">Authors</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_engagement.toLocaleString()}</div>
            <div className="stat-label">Engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

