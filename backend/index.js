require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const db = require('./users');
const port = process.env.PORT || 5050;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (request, response) => {
  response.json({
    status: 'online',
    info: 'Node.js, Express, and PostgreSQL API',
    endpoints: {
      health: '/health',
      users: '/users',
    },
  });
});

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/users', db.getUsers);
app.get('/users/:id', db.getUserById);
app.post('/users', db.createUser);
app.patch('/users/:id', db.updateUser);
app.delete('/users/:id', db.deleteUser);

app.listen(port, () => {
  console.log(`Backend server running on port ${port} (Ready)`);
});
