import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResetPassword from '../pages/auth/ResetPassword';

import Dashboard from '../pages/therapist/Dashboard';
import Schedule from '../pages/therapist/Schedule';
import ClientsList from '../pages/therapist/ClientsList';
import ClientProfile from '../pages/therapist/ClientProfile';
import Notes from '../pages/therapist/Notes';
import Analytics from '../pages/therapist/Analytics';

import ClientPortal from '../pages/client/ClientPortal';
import BookingPage from '../pages/client/BookingPage';
import LandingPage from '../pages/LandingPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-[#0B0B45] font-bold">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><ClientsList /></ProtectedRoute>} />
      <Route path="/clients/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

      <Route path="/booking" element={<BookingPage />} />
      <Route path="/:slug" element={<ClientPortal />} />
    </Routes>
  );
}