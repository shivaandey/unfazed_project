import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/therapist/Dashboard';
import ClientPortal from '../pages/client/ClientPortal';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/:slug" element={<ClientPortal />} />
    </Routes>
  );
}