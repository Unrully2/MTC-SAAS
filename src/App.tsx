/**
 * Main application component
 * This serves as the entry point for the React app
 */

import './index.css';
import { useEffect, useState } from 'react';
import { getCurrentUser, isLoggedIn } from './assets/js/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = isLoggedIn();
    if (loggedIn) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading Mercylife ERP...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login
    window.location.href = '/login.html';
    return null;
  }

  return (
    <div>
      <h1>Welcome, {user.full_name}</h1>
      <p>Role: {user.role}</p>
      <a href="/dashboard.html">Go to Dashboard</a>
    </div>
  );
}
