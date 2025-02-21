Task Tracker 
Objective 
Build a Simple Task Tracker using the specified tech stack. The application should allow users 
to create, update, and track tasks efficiently. 
Tech Stack 
● Frontend: React.js, React Router DOM,  
● Backend: Node.js, Express.js 
● Database: SQLite 
Features and Flow 
1. User Authentication 
● Implement user signup and login functionality. 
● Store hashed passwords securely. 
● Use JWT for authentication. 
● After successful login, redirect users to the dashboard. 
2. Dashboard 
● Display a list of tasks with the following details: 
○ Title 
○ Description 
○ Status (Pending, In Progress, Completed) 
○ Created Date 
○ Due Date 
● Allow users to: 
○ Add new tasks 
○ Update task status 
○ Delete tasks 
3. Task Management 
● Users should be able to: 
○ View all tasks in a table format. 
○ Click on a task to view its details. 
○ Edit task details (title, description, due date). 
○ Mark a task as completed. 
○ Delete a task. 
4. Database Design (SQLite) 
● Create a table for users: 
○ id (Primary Key) 
○ name 
○ email (Unique) 
○ password (Hashed) 
○ created_at 
● Create a table for tasks: 
○ id (Primary Key) 
○ title 
○ description 
○ status (Pending, In Progress, Completed) 
○ due_date 
○ user_id (Foreign Key referencing users.id) 
5. API Endpoints 
● User Authentication: 
○ POST /signup – Register a user. 
○ POST /login – Authenticate user and return JWT token. 
● Task Management: 
○ GET /tasks – Fetch all tasks for a user. 
○ POST /tasks – Create a new task. 
○ PUT /tasks/:id – Update task details or status. 
○ DELETE /tasks/:id – Delete a task. 
