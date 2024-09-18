const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');  // Required to parse form data

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Store users (in memory)
const users = {};  // { username: { password: 'pass', id: socket.id } }

// Middleware to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the introduction page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve the chat interface
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Handle user registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  if (users[username]) {
    return res.send('User already exists');
  }

  // Store the user's credentials (in memory for now)
  users[username] = { password };
  console.log(`${username} registered`);
  res.redirect('/login');
});

// Handle user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials
  if (!users[username] || users[username].password !== password) {
    return res.send('Invalid username or password');
  }

  console.log(`${username} logged in`);
  res.redirect('/chat');
});

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle when a user logs in (using socket for chat)
  socket.on('login', (username) => {
    if (users[username]) {
      users[username].id = socket.id; // Save the user's socket ID
      io.emit('updateUsers', Object.keys(users)); // Broadcast updated user list
    }
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    // Emit the chat message to all connected clients
    io.emit('chatMessage', { username: message.username, message: message.text });
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    // Find and remove the user
    for (let username in users) {
      if (users[username].id === socket.id) {
        console.log(`${username} disconnected`);
        delete users[username].id;  // Remove socket ID to indicate the user is offline
        io.emit('updateUsers', Object.keys(users));  // Broadcast updated user list
        break;
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
