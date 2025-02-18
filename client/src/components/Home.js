import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './home.css'; // Import CSS file

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [taskData, setTaskData] = useState({ title: '', description: '', due_date: '', status: '' });
  const navigate = useNavigate();
  
  const token = Cookies.get('jwt_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/tasks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to load tasks');
      }
    };

    fetchTasks();
  }, [navigate, token]);

  // Create Task Function
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const { title, description, due_date, status } = taskData;

    try {
      const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, due_date, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTaskData = await response.json();
      setTasks([...tasks, newTaskData]);
      setIsCreating(false);
      setTaskData({ title: '', description: '', due_date: '', status: '' });
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to create task');
    }
  };

  // Delete Task Function
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to delete task');
    }
  };

  // Open Edit Form
  const handleEditClick = (task) => {
    setIsEditing(true);
    setEditTaskId(task.id);
    setTaskData({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: task.status,
    });
  };

  // Update Task Function
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/tasks/${editTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setTasks(tasks.map(task => (task.id === editTaskId ? { ...task, ...taskData } : task)));
      setIsEditing(false);
      setTaskData({ title: '', description: '', due_date: '', status: '' });
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to update task');
    }
  };

  // Logout Function
  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to the Task Tracker</h2>
      <button className="logout-button" onClick={handleLogout}>Logout</button>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <h3 className="tasks-heading">Your Tasks:</h3>
      <ul className="tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id} className="task-item">
              <h4 className="task-title">Task: {task.title}</h4>
              <p className="task-description">Task Description: {task.description}</p>
              <p className="task-status">Status: {task.status}</p>
              <p className="task-date">Due Date: {task.due_date}</p>
              <button className="edit-button" onClick={() => handleEditClick(task)}>Edit</button>
              <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p className="no-tasks">No tasks found</p>
        )}
      </ul>

      <button className="create-task-button" onClick={() => setIsCreating(true)}>Create Task</button>

      {isCreating && (
        <div className="form-container">
        <div className="form-card">
          <h3 className="form-title">Create a New Task</h3>
          <form className="task-form" onSubmit={handleCreateTask}>
            <label className="form-label">Task</label>
            <input
              type="text"
              className="form-input"
              placeholder="Task Title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              required
            />
  
            <label className="form-label">Description: </label>
            <input
              type="text"
              className="form-input"
              placeholder="Task Description"
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              required
            />
  
            <label className="form-label">Due Date: </label>
            <input
              type="date"
              className="form-input"
              value={taskData.due_date}
              onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
              required
            />
  
            <label className="form-label">Task Status</label>
            <select
              className="form-input"
              value={taskData.status}
              onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
              required
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
  
            <button type="submit" className="form-button">Create Task</button>
          </form>
  
          <button onClick={() => setIsCreating(false)} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
      )}

      {isEditing && (
        <div className="edit-task-form">
          <h3>Edit Task</h3>
          <form onSubmit={handleUpdateTask}>
            <input type="text" placeholder="Task Title" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} required />
            <input type="text" placeholder="Task Description" value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} required />
            <input type="date" placeholder="Due Date" value={taskData.due_date} onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })} required />
            <select value={taskData.status} onChange={(e) => setTaskData({ ...taskData, status: e.target.value })} required>
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button type="submit">Update Task</button>
          </form>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Home;
