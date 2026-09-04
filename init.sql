-- Initialize database schema for fullstack app
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial sample seed data if empty
INSERT INTO users (name, email)
SELECT 'Saketh Varma', 'saketh@example.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'saketh@example.com');

INSERT INTO users (name, email)
SELECT 'John Doe', 'john.doe@example.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.doe@example.com');

INSERT INTO users (name, email)
SELECT 'Jane Smith', 'jane.smith@example.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane.smith@example.com');
