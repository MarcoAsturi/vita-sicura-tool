import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import Chatbot from './pages/Chatbot';
import Database from './pages/Database';
import VoiceAssistant from './pages/VoiceAssistant';

// import AnalisiDescrittiva from './pages/AnalisiDescrittiva';
// import Predizione from './pages/Predizione';
// import Trascrizione from './pages/Trascrizione';
// import Podcast from './pages/Podcast';

const MainContent = styled.div`
  margin-left: 200px; /* Larghezza della sidebar */
  padding: 20px;
`;

function App() {
  return (
    <Router>
      <Sidebar />
      <MainContent>
        <Routes>
          <Route path="/" element={<Navigate to="/database" />} />
          {/* <Route path="/analisi-descrittiva" element={<AnalisiDescrittiva />} />*/}
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/assistente-vocale" element={<VoiceAssistant />} />
          <Route path="/database" element={<Database />} />
        </Routes>
      </MainContent>
    </Router>
  );
}

export default App;
