import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch initial messages
  useEffect(() => {
    fetch('http://localhost:5000/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Error fetching messages:', err));
  }, []);

  // Socket event listeners
  useEffect(() => {
    socket.on('message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('users', (usersList) => {
      setUsers(usersList);
    });

    socket.on('typing', (user) => {
      setTypingUser(user);
    });

    socket.on('stopTyping', () => {
      setTypingUser('');
    });

    return () => {
      socket.off('message');
      socket.off('users');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoin = async () => {
    if (username.trim()) {
      try {
        await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        
        socket.emit('join', username);
        setIsJoined(true);
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', { username, message });
      setMessage('');
      socket.emit('stopTyping');
    }
  };

  const handleTyping = () => {
    socket.emit('typing', username);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping');
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isJoined) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h1>Real-Time Chat</h1>
          <p>Enter your username to join the chat</p>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            className="username-input"
          />
          <button onClick={handleJoin} className="join-button">
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Chat Users</h3>
        </div>
        <div className="users-list">
          {users.map((user, index) => (
            <div key={index} className="user-item">
              <div className={`user-status ${user.isOnline ? 'online' : 'offline'}`}></div>
              <span className="username">{user.username}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-main">
        <div className="chat-header">
          <h2>Real-Time Chat</h2>
          <span className="current-user">Logged in as: {username}</span>
        </div>
        
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.username === username ? 'own-message' : 'other-message'}`}>
              <div className="message-header">
                <span className="message-username">{msg.username}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))}
          {typingUser && (
            <div className="typing-indicator">
              <span>{typingUser} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="message-input-container">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            rows={1}
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
