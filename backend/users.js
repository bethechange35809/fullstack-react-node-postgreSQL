const pool = require('./database');

const getUsers = async (request, response) => {
  try {
    const results = await pool.query('SELECT * FROM users ORDER BY id ASC');
    response.status(200).json(results.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    response.status(500).json({ error: 'Failed to retrieve users', details: error.message });
  }
};

const getUserById = async (request, response) => {
  const id = parseInt(request.params.id, 10);
  if (isNaN(id)) {
    return response.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const results = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (results.rows.length === 0) {
      return response.status(404).json({ error: `User with ID ${id} not found` });
    }
    response.status(200).json(results.rows[0]);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error.message);
    response.status(500).json({ error: 'Failed to retrieve user', details: error.message });
  }
};

const createUser = async (request, response) => {
  const { name, email } = request.body;

  if (!name || !email) {
    return response.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const results = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    response.status(201).json({
      message: 'User added successfully',
      user: results.rows[0],
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    response.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

const updateUser = async (request, response) => {
  const id = parseInt(request.params.id, 10);
  const { name, email } = request.body;

  if (isNaN(id)) {
    return response.status(400).json({ error: 'Invalid user ID' });
  }

  if (!name || !email) {
    return response.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const results = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );

    if (results.rows.length === 0) {
      return response.status(404).json({ error: `User with ID ${id} not found` });
    }

    response.status(200).json({
      message: `User updated with ID: ${id}`,
      user: results.rows[0],
    });
  } catch (error) {
    console.error(`Error updating user ${id}:`, error.message);
    response.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};

const deleteUser = async (request, response) => {
  const id = parseInt(request.params.id, 10);

  if (isNaN(id)) {
    return response.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const results = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (results.rows.length === 0) {
      return response.status(404).json({ error: `User with ID ${id} not found` });
    }

    response.status(200).json({
      message: `User deleted with id: ${id}`,
      deletedId: id,
    });
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error.message);
    response.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};