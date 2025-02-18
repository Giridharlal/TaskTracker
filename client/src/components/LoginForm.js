import { Component } from 'react';
import Cookies from 'js-cookie';
import { Navigate, Link } from 'react-router-dom';
import './LoginForm.css'; // Importing CSS file

class LoginForm extends Component {
  state = {
    email: '',
    password: '',
    showSubmitError: false,
    errorMsg: '',
  };

  onChangeEmail = event => {
    this.setState({ email: event.target.value });
  };

  onChangePassword = event => {
    this.setState({ password: event.target.value });
  };

  onSubmitSuccess = jwtToken => {
    Cookies.set('jwt_token', jwtToken, { expires: 30 }); // Store JWT token
    this.props.history.replace('/'); // Redirect to home
  };

  onSubmitFailure = errorMsg => {
    this.setState({ showSubmitError: true, errorMsg });
  };

  submitForm = async event => {
    event.preventDefault();
    const { email, password } = this.state;
    const userDetails = { email, password };
    const url = 'http://localhost:5000/login';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        this.onSubmitSuccess(data.token);
      } else {
        this.onSubmitFailure(data.error_msg);
      }
    } catch (error) {
      this.onSubmitFailure('Something went wrong, please try again later.');
    }
  };

  renderPasswordField = () => {
    const { password } = this.state;

    return (
      <div className="input-container">
        <label className="input-label" htmlFor="password">
          PASSWORD
        </label>
        <input
          type="password"
          id="password"
          className="password-input-field"
          value={password}
          onChange={this.onChangePassword}
          placeholder="Password"
        />
      </div>
    );
  };

  renderEmailField = () => {
    const { email } = this.state;

    return (
      <div className="input-container">
        <label className="input-label" htmlFor="email">
          EMAIL
        </label>
        <input
          type="text"
          id="email"
          className="username-input-field"
          value={email}
          onChange={this.onChangeEmail}
          placeholder="Email"
        />
      </div>
    );
  };

  render() {
    const { showSubmitError, errorMsg } = this.state;
    const jwtToken = Cookies.get('jwt_token');

    if (jwtToken !== undefined) {
      return <Navigate to="/" />;
    }

    return (
      <div className="login-form-container">
        <form className="form-container" onSubmit={this.submitForm}>
          <img
            src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-logo-img.png"
            className="login-website-logo"
            alt="website logo"
          />
          {this.renderEmailField()}
          {this.renderPasswordField()}
          <div className='button-container'>
            <button type="submit" className="login-button">
              Login
            </button>
            <Link to="/register" >
              <button className="register-button">Register</button>
            </Link>
          </div>
          {showSubmitError && <p className="error-message">*{errorMsg}</p>}
        </form>
      </div>
    );
  }
}

export default LoginForm;
