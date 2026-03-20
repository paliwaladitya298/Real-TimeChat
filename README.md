# Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) using Socket.IO for instant messaging.

## Features

- **Real-time Messaging**: Instant message delivery using WebSockets (Socket.IO)
- **User Management**: Track online/offline status of users
- **Message History**: Persistent storage of chat messages in MongoDB
- **Typing Indicators**: See when other users are typing
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean UI**: Modern, intuitive chat interface

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - MongoDB object modeling

### Frontend
- **React** - UI library
- **Socket.IO Client** - WebSocket client for real-time communication
- **CSS3** - Modern styling with responsive design

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas connection)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Real-time-chat
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/realtime-chat
   PORT=5000
   ```
   
   If using MongoDB Atlas, replace the MONGODB_URI with your connection string.

## Running the Application

### Option 1: Development Mode (Recommended)

1. **Start the backend server**
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:5000`

2. **Start the React frontend** (in a new terminal)
   ```bash
   npm run client
   ```
   The frontend will run on `http://localhost:3000`

### Option 2: Production Mode

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```
   The application will be served from `http://localhost:5000`

## Usage

1. Open your browser and navigate to `http://localhost:3000` (development) or `http://localhost:5000` (production)

2. Enter a username to join the chat

3. Start chatting with other users in real-time!

## API Endpoints

### Messages
- `GET /api/messages` - Retrieve all chat messages
- `POST /api/users` - Create or update user

### Users
- `GET /api/users` - Get list of all users with online status

## Socket.IO Events

### Client to Server
- `join` - Join chat with username
- `sendMessage` - Send a new message
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Server to Client
- `message` - New message received
- `users` - Updated user list
- `typing` - User is typing indicator
- `stopTyping` - Stop typing indicator

## Database Schema

### Message Model
```javascript
{
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
}
```

### User Model
```javascript
{
  username: { type: String, unique: true, required: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
}
```

## Project Structure

```
Real-time-chat/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.js       # Entry point
│   └── package.json
├── server.js              # Express server and Socket.IO setup
├── package.json           # Backend dependencies
├── .env                   # Environment variables
└── README.md
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check your MONGODB_URI in the .env file
   - If using MongoDB Atlas, ensure your IP is whitelisted

2. **Socket.IO Connection Issues**
   - Check that both frontend and backend are running
   - Verify CORS settings in server.js
   - Check browser console for connection errors

3. **Port Already in Use**
   - Change the PORT in .env file
   - Kill the process using the port: `npx kill-port 5000`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
