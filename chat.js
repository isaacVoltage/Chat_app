const socket = io();

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messages = document.getElementById('messages');
const usersList = document.getElementById('users');
const logoutButton = document.getElementById('logout');

// Get the username from the localStorage (stored after login)
const username = localStorage.getItem('username');

// Emit login event with the username
socket.emit('login', username);

// Send message
messageForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const message = messageInput.value;
  if (message) {
    socket.emit('chatMessage', { username, text: message });
    messageInput.value = '';
  }
});

// Listen for chat messages
socket.on('chatMessage', (data) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${data.username}: ${data.message}`;
  messages.appendChild(messageElement);
});

// Update online users list
socket.on('updateUsers', (users) => {
  usersList.innerHTML = '';
  users.forEach((user) => {
    const userElement = document.createElement('li');
    userElement.textContent = user;
    usersList.appendChild(userElement);
  });
});

// Logout functionality
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('username');
  window.location.href = '/login';
});
// Logout functionality
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('username');  // Clear the stored username
    window.location.href = '/';  // Redirect to the introduction page (or wherever you want)
  });
 // Redirect to login if no username is found in localStorage
if (!localStorage.getItem('username')) {
    window.location.href = '/login';
  }
   