const Header = ({ stats }) => {
  return (
    <div className="header">
      <div className="logo">Social Bubble</div>
      <div className="stats">
        <div className="stat-item">
          <div className="stat-value">{stats.total_posts.toLocaleString()}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.total_authors.toLocaleString()}</div>
          <div className="stat-label">Authors</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.total_engagement.toLocaleString()}</div>
          <div className="stat-label">Engagement</div>
        </div>
      </div>
    </div>
  );
};

export default Header;

