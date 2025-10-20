import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import BubbleVisualization from './components/BubbleVisualization';
import Filters from './components/Filters';
import Header from './components/Header';
import Footer from './components/Footer';
import ConnectionStatus from './components/ConnectionStatus';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [searchAuthor, setSearchAuthor] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_posts: 0,
    total_authors: 0,
    total_engagement: 0,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('initial_data', ({ posts: initialPosts, hashtags: initialHashtags }) => {
      console.log(`Received ${initialPosts.length} initial posts`);
      setPosts(initialPosts);
      setHashtags(initialHashtags);
      setIsLoading(false);
      calculateStats(initialPosts);
    });

    newSocket.on('posts_update', ({ posts: updatedPosts, hashtags: updatedHashtags }) => {
      console.log(`Received ${updatedPosts.length} updated posts`);
      setPosts(updatedPosts);
      setHashtags(updatedHashtags);
      calculateStats(updatedPosts);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Calculate stats
  const calculateStats = (postList) => {
    const totalEngagement = postList.reduce((sum, post) => sum + post.engagement_score, 0);
    const uniqueAuthors = new Set(postList.map(post => post.author)).size;
    
    setStats({
      total_posts: postList.length,
      total_authors: uniqueAuthors,
      total_engagement: totalEngagement,
    });
  };

  // Filter posts based on selected hashtags and author
  useEffect(() => {
    let filtered = [...posts];

    // Filter by hashtags
    if (selectedHashtags.length > 0) {
      filtered = filtered.filter(post =>
        post.hashtags.some(tag => selectedHashtags.includes(tag))
      );
    }

    // Filter by author
    if (searchAuthor.trim()) {
      filtered = filtered.filter(post =>
        post.author.toLowerCase().includes(searchAuthor.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [posts, selectedHashtags, searchAuthor]);

  // Toggle hashtag selection
  const toggleHashtag = (tag) => {
    setSelectedHashtags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedHashtags([]);
    setSearchAuthor('');
  };

  const displayPosts = filteredPosts.length > 0 ? filteredPosts : posts;

  return (
    <div className="app">
      <Header stats={stats} />
      
      <Filters
        hashtags={hashtags}
        selectedHashtags={selectedHashtags}
        searchAuthor={searchAuthor}
        onToggleHashtag={toggleHashtag}
        onSearchAuthorChange={setSearchAuthor}
        onClearFilters={clearFilters}
      />

      {isLoading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading social bubbles...</div>
        </div>
      ) : (
        <BubbleVisualization posts={displayPosts} />
      )}
      
      <Footer />
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}

export default App;

