import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Layout from './components/Layout';
import RequesterDashboard from './pages/RequesterDashboard';
import TicketDetail from './pages/TicketDetail';
import AgentDashboard from './pages/AgentDashboard';
import MySupportTickets from './pages/MySupportTickets';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Layout />}>
            <Route path="requester/dashboard" element={<RequesterDashboard />} />
            <Route path="agent/dashboard" element={<AgentDashboard />} />
            <Route path="agent/my-tickets" element={<MySupportTickets />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            {/* Add other protected routes here */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
