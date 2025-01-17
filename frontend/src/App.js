import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import Chatbot from './pages/Chatbot';
import Database from './pages/Database';

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
          {/* <Route path="/analisi-descrittiva" element={<AnalisiDescrittiva />} />
          <Route path="/predizione" element={<Predizione />} />
          <Route path="/trascrizione" element={<Trascrizione />} />
          <Route path="/podcast" element={<Podcast />} /> */}
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/database" element={<Database />} /> {/* Nuova Route Aggiunta */}
        </Routes>
      </MainContent>
    </Router>
  );
}

export default App;
