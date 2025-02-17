"use strict";

var express = require('express');

var cors = require('cors');

var bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

var _require = require('sqlite'),
    open = _require.open;

var sqlite3 = require('sqlite3');

var Cookies = require('cookie-parser');

var _require2 = require('uuid'),
    uuidv4 = _require2.v4;

require('dotenv').config();

var app = express();
app.use(cors());
app.use(express.json());
var dbPath = 'taskTracker.db';
var db = null;

var initializeDbAndServer = function initializeDbAndServer() {
  return regeneratorRuntime.async(function initializeDbAndServer$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(open({
            filename: dbPath,
            driver: sqlite3.Database
          }));

        case 3:
          db = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(db.run("CREATE TABLE IF NOT EXISTS users (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      email TEXT UNIQUE NOT NULL,\n      password TEXT NOT NULL,\n      created_at TEXT DEFAULT (datetime('now', 'localtime'))\n    );"));

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(db.run("CREATE TABLE IF NOT EXISTS tasks (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,         \n    title TEXT NOT NULL,                          \n    description TEXT,                             \n    status TEXT CHECK(status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',  \n    due_date TEXT,                                 \n    user_id INTEGER,                               \n    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n    );"));

        case 8:
          app.listen(5000, function () {
            console.log('Server is running at http://localhost:5000/');
          });
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.log("DB Error: ".concat(_context.t0.message));
          process.exit(1);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

initializeDbAndServer(); // Middleware to authenticate JWT Token

var authenticateToken = function authenticateToken(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Invalid JWT Token');
  }

  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).send('Invalid JWT Token');
    }

    req.userId = user.userId;
    next();
  });
}; // API 1: POST /register (User registration)


app.post('/register', function _callee(request, response) {
  var _request$body, name, email, password, existingUser, hashedPassword;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _request$body = request.body, name = _request$body.name, email = _request$body.email, password = _request$body.password;
          _context2.next = 4;
          return regeneratorRuntime.awrap(db.get("SELECT * FROM users WHERE email = ?", [email]));

        case 4:
          existingUser = _context2.sent;

          if (!existingUser) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", response.status(400).send('User already exists'));

        case 7:
          if (!(password.length < 5)) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", response.status(400).send('Password is too short'));

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 11:
          hashedPassword = _context2.sent;
          _context2.next = 14;
          return regeneratorRuntime.awrap(db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]));

        case 14:
          response.status(200).send('User created successfully');
          _context2.next = 20;
          break;

        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](0);
          response.status(500).send('Internal Server Error');

        case 20:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 17]]);
}); // API 2: POST /login (User login)

app.post('/login', function _callee2(request, response) {
  var _request$body2, email, password, user, isPasswordValid, token;

  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _request$body2 = request.body, email = _request$body2.email, password = _request$body2.password;
          _context3.next = 4;
          return regeneratorRuntime.awrap(db.get("SELECT * FROM users WHERE email = ?", [email]));

        case 4:
          user = _context3.sent;

          if (user) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", response.status(400).send('Invalid user'));

        case 7:
          _context3.next = 9;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 9:
          isPasswordValid = _context3.sent;

          if (isPasswordValid) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", response.status(400).send('Invalid password'));

        case 12:
          token = jwt.sign({
            userId: user.id
          }, process.env.JWT_SECRET);
          response.status(200).json({
            token: token
          });
          _context3.next = 20;
          break;

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](0);
          console.log(_context3.t0);
          response.status(500).send('Internal Server Error');

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 16]]);
}); // API 3: POST /tasks (Create new task)

app.post('/tasks', authenticateToken, function _callee3(request, response) {
  var _request$body3, title, description, due_date, status, userId, taskId;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _request$body3 = request.body, title = _request$body3.title, description = _request$body3.description, due_date = _request$body3.due_date, status = _request$body3.status;
          userId = request.userId;

          if (!(!title || !description || !due_date)) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", response.status(400).json({
            error: 'Missing required fields'
          }));

        case 5:
          taskId = uuidv4();
          _context4.next = 8;
          return regeneratorRuntime.awrap(db.run("INSERT INTO tasks (id, user_id, title, description, due_date, status) \n                  VALUES (?, ?, ?, ?, ?, ?)", [parseInt(taskId), userId, title, description, due_date, status]));

        case 8:
          response.status(201).json({
            message: 'Task created',
            taskId: taskId,
            title: title,
            description: description,
            due_date: due_date,
            status: status
          });
          _context4.next = 15;
          break;

        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          console.error('kjadffjba: ', _context4.t0); // Log the error to help with debugging

          response.status(500).json({
            error: 'Internal Server Error',
            details: _context4.t0.message
          });

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // API 4: GET /tasks (Get all tasks of a user)

app.get('/tasks', authenticateToken, function _callee4(request, response) {
  var userId, tasks;
  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          userId = request.userId;
          _context5.next = 4;
          return regeneratorRuntime.awrap(db.all("SELECT * FROM tasks WHERE user_id = ?", [userId]));

        case 4:
          tasks = _context5.sent;
          response.json(tasks);
          _context5.next = 11;
          break;

        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          response.status(500).send('Internal Server Error');

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 8]]);
}); // API 5: PUT /tasks/:id (Update task details)

app.put('/tasks/:id', authenticateToken, function _callee5(request, response) {
  var id, _request$body4, title, status, description, due_date, existingTask;

  return regeneratorRuntime.async(function _callee5$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          id = request.params.id;
          _request$body4 = request.body, title = _request$body4.title, status = _request$body4.status, description = _request$body4.description, due_date = _request$body4.due_date;
          _context6.next = 5;
          return regeneratorRuntime.awrap(db.get("SELECT * FROM tasks WHERE id = ?", [id]));

        case 5:
          existingTask = _context6.sent;

          if (existingTask) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", response.status(404).send('Task not found'));

        case 8:
          _context6.next = 10;
          return regeneratorRuntime.awrap(db.run("UPDATE tasks SET title = ?, status = ?, description = ?, due_date = ? WHERE id = ?", [title, status, description, due_date, id]));

        case 10:
          response.send('Task updated');
          _context6.next = 16;
          break;

        case 13:
          _context6.prev = 13;
          _context6.t0 = _context6["catch"](0);
          response.status(500).send('Internal Server Error');

        case 16:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // API 6: DELETE /tasks/:id (Delete task)

app["delete"]('/tasks/:id', authenticateToken, function _callee6(request, response) {
  var id, existingTask;
  return regeneratorRuntime.async(function _callee6$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          id = request.params.id;
          console.log('task ID: ', id);
          _context7.next = 5;
          return regeneratorRuntime.awrap(db.get("SELECT * FROM tasks WHERE id = ?", [id]));

        case 5:
          existingTask = _context7.sent;

          if (existingTask) {
            _context7.next = 8;
            break;
          }

          return _context7.abrupt("return", response.status(404).send('Task not found'));

        case 8:
          _context7.next = 10;
          return regeneratorRuntime.awrap(db.run("DELETE FROM tasks WHERE id = ?", [id]));

        case 10:
          response.send('Task deleted');
          _context7.next = 16;
          break;

        case 13:
          _context7.prev = 13;
          _context7.t0 = _context7["catch"](0);
          response.status(500).send('Internal Server Error');

        case 16:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 13]]);
});
//# sourceMappingURL=index.dev.js.map
