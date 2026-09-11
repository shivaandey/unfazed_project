import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/therapist/Dashboard';
import ClientPortal from '../pages/client/ClientPortal';

export default function AppRoutes() {
  return (
    <Routes>
      {/* This makes the Felicity-style landing page the default home screen */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/:slug" element={<ClientPortal />} />
    </Routes>
  );
}