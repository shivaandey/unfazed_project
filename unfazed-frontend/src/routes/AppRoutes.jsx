import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/therapist/Dashboard';
import Schedule from '../pages/therapist/Schedule';
import ClientsList from '../pages/therapist/ClientsList'; // NEW
import ClientProfile from '../pages/therapist/ClientProfile'; // NEW
import ClientPortal from '../pages/client/ClientPortal';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/clients" element={<ClientsList />} />
      <Route path="/clients/:id" element={<ClientProfile />} />
      <Route path="/:slug" element={<ClientPortal />} />
    </Routes>
  );
}