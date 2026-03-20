const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Message Schema
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// API Routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    let user = await User.findOne({ username });
    
    if (!user) {
      user = new User({ username });
    }
    
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating/updating user' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('username isOnline lastSeen');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user to chat
  socket.on('join', async (username) => {
    socket.username = username;
    
    // Update user online status
    await User.findOneAndUpdate(
      { username },
      { isOnline: true, lastSeen: new Date() }
    );
    
    // Broadcast updated user list
    const users = await User.find().select('username isOnline lastSeen');
    io.emit('users', users);
    
    // Send welcome message
    socket.emit('message', {
      username: 'System',
      message: `Welcome to the chat, ${username}!`,
      timestamp: new Date()
    });
  });

  // Handle new messages
  socket.on('sendMessage', async (data) => {
    const { username, message } = data;
    
    // Save message to database
    const newMessage = new Message({ username, message });
    await newMessage.save();
    
    // Broadcast message to all clients
    io.emit('message', newMessage);
  });

  // Handle typing indicators
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    
    if (socket.username) {
      // Update user offline status
      await User.findOneAndUpdate(
        { username: socket.username },
        { isOnline: false, lastSeen: new Date() }
      );
      
      // Broadcast updated user list
      const users = await User.find().select('username isOnline lastSeen');
      io.emit('users', users);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
