import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResetPassword from '../pages/auth/ResetPassword';

// Therapist Pages
import Dashboard from '../pages/therapist/Dashboard';
import Clients from '../pages/therapist/Clients';
import Notes from '../pages/therapist/Notes';

// Client Pages
import BookingPage from '../pages/client/BookingPage';
// Assume LandingPage is your main root component
import LandingPage from '../pages/LandingPage'; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Therapist Dashboard Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/notes" element={<Notes />} />
      
      {/* Public Client Booking Route (Must be last to avoid catching other paths) */}
      <Route path="/:slug" element={<BookingPage />} />
    </Routes>
  );
}