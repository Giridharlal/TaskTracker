const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const Cookies = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = 'taskTracker.db';
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the users table if not exists
    await db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );`);
    
    // Create the tasks table if not exists
    await db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,         
    title TEXT NOT NULL,                          
    description TEXT,                             
    status TEXT CHECK(status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',  
    due_date TEXT,                                 
    user_id INTEGER,                               
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);
    
    app.listen(5000, () => {
      console.log('Server is running at http://localhost:5000/');
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Middleware to authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).send('Invalid JWT Token');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).send('Invalid JWT Token');
    }
    req.userId = user.userId; 
    next();
  });
};

// API 1: POST /register (User registration)
app.post('/register', async (request, response) => {
  try {
    const { name, email, password } = request.body;

    const existingUser = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);

    if (existingUser) {
      return response.status(400).send('User already exists');
    }

    if (password.length < 5) {
      return response.status(400).send('Password is too short');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword]);

    response.status(200).send('User created successfully');
  } catch (error) {
    response.status(500).send('Internal Server Error');
  }
});

// API 2: POST /login (User login)
app.post('/login', async (request, response) => {
  try {
    const {email, password } = request.body;

    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!user) {
      return response.status(400).send('Invalid user');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(400).send('Invalid password');
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    response.status(200).json({ token });
  } catch (error) {
    console.log(error);
    response.status(500).send('Internal Server Error');
  }
});

// API 3: POST /tasks (Create new task)
app.post('/tasks', authenticateToken, async (request, response) => {
  try {
    const { title, description, due_date, status } = request.body;
    const userId = request.userId; 

    if (!title || !description || !due_date) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const taskId = uuidv4();
    await db.run(`INSERT INTO tasks (id, user_id, title, description, due_date, status) 
                  VALUES (?, ?, ?, ?, ?, ?)`, [parseInt(taskId), userId, title, description, due_date, status]);

    response.status(201).json({ message: 'Task created', taskId, title, description, due_date, status });
  } catch (error) {
    console.error('kjadffjba: ',error);  // Log the error to help with debugging
    response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// API 4: GET /tasks (Get all tasks of a user)
app.get('/tasks', authenticateToken, async (request, response) => {
  try {
    const userId = request.userId;
    const tasks = await db.all(`SELECT * FROM tasks WHERE user_id = ?`, [userId]);
    response.json(tasks);
  } catch (error) {
    response.status(500).send('Internal Server Error');
  }
});

// API 5: PUT /tasks/:id (Update task details)
app.put('/tasks/:id', authenticateToken, async (request, response) => {
  try {
    const { id } = request.params;
    const { title, status, description, due_date } = request.body;

    const existingTask = await db.get(`SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!existingTask) {
      return response.status(404).send('Task not found');
    }

    await db.run(`UPDATE tasks SET title = ?, status = ?, description = ?, due_date = ? WHERE id = ?`, 
                [title, status, description, due_date, id]);

    response.send('Task updated');
  } catch (error) {
    response.status(500).send('Internal Server Error');
  }
});

// API 6: DELETE /tasks/:id (Delete task)
app.delete('/tasks/:id', authenticateToken, async (request, response) => {
  try {
    const { id } = request.params;
    console.log('task ID: ',id);
    const existingTask = await db.get(`SELECT * FROM tasks WHERE id = ?`, [id]);
    if (!existingTask) {
      return response.status(404).send('Task not found');
    }

    await db.run(`DELETE FROM tasks WHERE id = ?`, [id]);
    response.send('Task deleted');
  } catch (error) {
    response.status(500).send('Internal Server Error');
  }
});
