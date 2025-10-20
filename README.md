# 🌐 Social Bubble

**An interactive real-time visualization of social media conversations as floating 3D bubbles**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://social-bubble.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9-orange.svg)](https://d3js.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![Social Bubble Preview](./screenshot.png)

## ✨ Overview

Social Bubble transforms live social media data from Bluesky into a mesmerizing visualization where conversations become colorful, interactive 3D bubbles. Watch as trending topics float and pulse with activity, with each bubble containing individual posts sized by their popularity and engagement.

### 🎯 Key Features

- **🔴 Real-Time Data**: Live updates from Bluesky every 15 minutes
- **🫧 3D Bubble Physics**: Realistic bubble effects with radial gradients and glossy highlights
- **🎨 Dynamic Sizing**: Bubbles scale based on engagement and post count
- **🏷️ Topic Clustering**: Posts automatically grouped by hashtags into parent bubbles
- **👤 Profile Pictures**: User avatars displayed in individual post bubbles
- **🔍 Advanced Filtering**: Filter by hashtags, search by author, and more
- **📊 Live Statistics**: Real-time metrics for posts, authors, and engagement
- **↔️ Resizable Sidebar**: Drag to adjust the filter panel width
- **🖱️ Interactive**: Drag bubbles, hover for details, click to open posts
- **📱 Responsive Design**: Beautiful on all screen sizes

## 🚀 Tech Stack

### Frontend
- **React** - UI framework
- **D3.js** - Data visualization and force simulation
- **Vite** - Fast build tool and dev server
- **Socket.io Client** - Real-time WebSocket connection
- **CSS3** - Custom animations and styling

### Backend
- **Node.js & Express** - REST API server
- **Socket.io** - WebSocket server for real-time updates
- **PostgreSQL** - Persistent data storage
- **Bluesky AT Protocol** - Social media data source
- **Node-cron** - Scheduled data fetching

### Infrastructure
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting + PostgreSQL database
- **GitHub Actions** - CI/CD pipeline

## 📸 Features in Detail

### Real-Time Visualization
- Posts appear as bubbles within topic circles
- Size reflects engagement (likes + reposts + replies)
- Color-coded by hashtag category
- Smooth animations and transitions
- No overlapping bubbles with automatic scaling

### Advanced Filters
- **Trending Topics**: Click hashtags to filter posts
- **Author Search**: Find posts by specific users
- **Dynamic Updates**: Filters apply in real-time
- **Active Filters Badge**: See how many filters are active
- **Resizable Panel**: Drag the edge to customize width

### 3D Bubble Effects
- Radial gradients for depth perception
- Glossy highlight overlays for realism
- Drop shadows for separation
- Enhanced glow on hover
- Smooth transitions and animations

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Railway account)
- Bluesky account with app password

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/King0508/social-bubble.git
   cd social-bubble
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Create `backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   
   # Database (Railway or local PostgreSQL)
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # Bluesky API
   BLUESKY_IDENTIFIER=your-handle.bsky.social
   BLUESKY_PASSWORD=your-app-password
   
   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

4. **Initialize the database**
   ```bash
   cd backend
   node jobs/fetchPosts.js
   ```

5. **Start development servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🌍 Deployment

### Backend (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Add PostgreSQL database
3. Deploy from GitHub repository
4. Set root directory to `backend`
5. Add environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   BLUESKY_IDENTIFIER=your-handle.bsky.social
   BLUESKY_PASSWORD=your-app-password
   PORT=3001
   NODE_ENV=production
   ```
6. Generate domain and copy the URL

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   ```
   VITE_BACKEND_URL=https://your-railway-backend.up.railway.app
   ```
4. Deploy

## 📊 Architecture

```
┌─────────────────┐
│   Bluesky API   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Node.js API    │◄────►│  PostgreSQL  │
│  (Railway)      │      │  (Railway)   │
└────────┬────────┘      └──────────────┘
         │
         │ WebSocket
         ▼
┌─────────────────┐
│  React + D3.js  │
│  (Vercel)       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│      Users      │
└─────────────────┘
```

## 🎨 Color Palette

The visualization uses a carefully selected color palette for maximum visual appeal:

- **Purple** (#667eea) - Technology & Innovation
- **Pink** (#f093fb, #fa709a) - Entertainment & Culture  
- **Blue** (#4facfe, #30cfd0) - News & Information
- **Green** (#43e97b) - Environment & Nature
- **Yellow** (#fee140, #feca57) - Lifestyle & Fun
- **Red** (#ff6b6b) - Breaking News & Urgent

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bluesky** - For providing free API access to social data
- **D3.js Community** - For amazing visualization tools
- **Interstellar** - For visual inspiration

## 📧 Contact

**King0508** - [@King0508](https://github.com/King0508)

Project Link: [https://github.com/King0508/social-bubble](https://github.com/King0508/social-bubble)

---

<div align="center">
  <p>Built with ❤️ using React, D3.js, and real-time data</p>
  <p>⭐ Star this repo if you found it interesting!</p>
</div>
