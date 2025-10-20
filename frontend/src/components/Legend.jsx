import { useState, useRef, useEffect } from 'react';

const Legend = ({ hashtags }) => {
  const colors = [
    '#667eea',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
  ];

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 40, y: window.innerHeight - 200 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const legendRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={legendRef}
      className="legend"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <h4>Top Topics (drag me)</h4>
      {hashtags.map(({ tag }, index) => (
        <div key={tag} className="legend-item">
          <div
            className="legend-circle"
            style={{ background: colors[index] }}
          />
          <span>{tag}</span>
        </div>
      ))}
      {hashtags.length === 0 && (
        <div style={{ color: '#666', fontSize: '11px' }}>
          No topics yet
        </div>
      )}
    </div>
  );
};

export default Legend;
