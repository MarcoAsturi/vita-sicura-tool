import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import styled from 'styled-components';

import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Polizze from './pages/PolizzeDashboard';
import Chatbot from './pages/Chatbot';
import VoiceAssistant from './pages/VoiceAssistant';
import Database from './pages/Database';

const queryClient = new QueryClient();

const MainContent = styled.div`
  margin-left: 200px; /* Larghezza della sidebar */
  padding: 20px;
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Sidebar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/polizze" element={<Polizze />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/assistente-vocale" element={<VoiceAssistant />} />
            <Route path="/database" element={<Database />} />
          </Routes>
        </MainContent>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
