const ConnectionStatus = ({ isConnected }) => {
  return (
    <div className="connection-status">
      <div className={`status-dot ${isConnected ? '' : 'disconnected'}`}></div>
      <span>{isConnected ? 'Live' : 'Disconnected'}</span>
    </div>
  );
};

export default ConnectionStatus;

