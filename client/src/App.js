import { Component } from 'react'
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom'
import Home from './components/Home'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
// import TodoList from './components/TodoList'
// import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

class App extends Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LoginForm />}
          />
          <Route
            path="/register"
            element={<RegisterForm />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    )
  }
}

export default App
