import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { setAuthToken } from './api';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmailVerification from './pages/EmailVerification';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import PostedJobs from './pages/PostedJobs';
import JobHistory from './pages/JobHistory';
import Dashboard from './pages/Dashboard';
import Profile from './ProfileNew';
import JobDetails from './pages/JobDetails';

const getUserFromStorage = () => {
  const stored = localStorage.getItem('jobportal_user') || sessionStorage.getItem('jobportal_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

function App() {
  const [user, setUser] = useState(getUserFromStorage());
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.token) {
      setAuthToken(user.token);
    }
  }, [user]);

  const handleLogin = (userData, remember) => {
    setUser(userData);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('jobportal_user', JSON.stringify(userData));
    setAuthToken(userData.token);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jobportal_user');
    sessionStorage.removeItem('jobportal_user');
    setAuthToken(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/jobs" element={<Jobs user={user} />} />
          <Route path="/job/:id" element={<JobDetails user={user} />} />
          
          {/* Recruiter-only routes */}
          <Route
            path="/post-job"
            element={
              <ProtectedRoute user={user} requiredRole="employer">
                <PostJob user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posted-jobs"
            element={
              <ProtectedRoute user={user} requiredRole="employer">
                <PostedJobs user={user} />
              </ProtectedRoute>
            }
          />
          
          {/* Common routes */}
          <Route
            path="/history"
            element={
              <ProtectedRoute user={user}>
                <JobHistory user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
