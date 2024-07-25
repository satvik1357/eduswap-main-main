import React from 'react';
import '../styles/SignupPage.css'; // Adjust path if needed

function SignupPage() {
  return (
    <div className="signup-page">
      <h1>Sign Up Page</h1>
      <form className="signup-form" autoComplete="on">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username" // Provides a hint to the browser
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password" // Provides a hint to the browser
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupPage;
