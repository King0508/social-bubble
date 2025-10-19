import { useState } from 'react';

const Filters = ({
  hashtags,
  selectedHashtags,
  searchAuthor,
  onToggleHashtag,
  onSearchAuthorChange,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedHashtags.length > 0 || searchAuthor.trim() !== '';
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle button - fixed on left edge */}
      <button
        className={`sidebar-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close Filters' : 'Open Filters'}
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Overlay when sidebar is open (for mobile) */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel - fixed on left */}
      <div className={`filters-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="sidebar-icon">🔍</span>
            <h3>Filters</h3>
          </div>
          {hasActiveFilters && (
            <span className="active-filters-badge">
              {selectedHashtags.length + (searchAuthor ? 1 : 0)}
            </span>
          )}
        </div>

      {/* Hashtag Filters */}
      <div className="filter-section">
        <div className="filter-label">
          Trending Topics 
          {selectedHashtags.length > 0 && (
            <span style={{ 
              marginLeft: '8px', 
              color: '#667eea', 
              fontWeight: '600',
              fontSize: '11px'
            }}>
              ({selectedHashtags.length} selected)
            </span>
          )}
        </div>
        <div className="hashtag-filters">
          {hashtags.slice(0, 10).map(({ tag, count }) => (
            <button
              key={tag}
              className={`hashtag-btn ${selectedHashtags.includes(tag) ? 'active' : ''}`}
              onClick={() => onToggleHashtag(tag)}
              title={`${count} posts`}
            >
              {tag}
              <span style={{ 
                marginLeft: '5px', 
                fontSize: '10px', 
                opacity: 0.7,
                fontWeight: '600'
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>
        {hashtags.length === 0 && (
          <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
            No trending hashtags yet
          </div>
        )}
      </div>

      {/* Author Search */}
      <div className="filter-section">
        <div className="filter-label">Search by Author</div>
        <input
          type="text"
          className="search-input"
          placeholder="Enter username..."
          value={searchAuthor}
          onChange={(e) => onSearchAuthorChange(e.target.value)}
        />
      </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button className="clear-btn" onClick={onClearFilters}>
            ✕ Clear All Filters
          </button>
        )}
      </div>
    </>
  );
};

export default Filters;
