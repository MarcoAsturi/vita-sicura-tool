import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

const TableContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px 15px;
    border: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #34495e;
    color: #ecf0f1;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  margin: 0 5px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  background-color: ${props => props.variant === "edit" ? "#3498db" : "#2ecc71"};
  
  &:hover {
    opacity: 0.9;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: ${props => (props.show ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  max-width: 800px;
  width: 90%;
  border-radius: 8px;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  float: right;
`;

const Database = () => {
  const [clienti, setClienti] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchClienti = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clienti`);
        const data = await response.json();
        setClienti(data);
      } catch (error) {
        console.error("Errore nel recuperare i dati", error);
      }
    };

    fetchClienti();
  }, []);

  const filteredClienti = clienti.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.cognome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredClienti.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredClienti.length / resultsPerPage);

  const goToNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const openDetails = async (codice_cliente) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}`);
      const data = await response.json();
      setSelectedDetails(data);
      setShowModal(true);
    } catch (error) {
      console.error("Errore nel recuperare i dettagli", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDetails(null);
  };

  return (
    <TableContainer>
      <h2>Database</h2>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Cerca per nome o cognome..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </SearchContainer>

      <StyledTable>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Età</th>
            <th>Luogo di Residenza</th>
            <th>Professione</th>
            <th>Reddito</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {currentResults.map((cliente, index) => (
            <tr key={index}>
              <td>{cliente.nome}</td>
              <td>{cliente.cognome}</td>
              <td>{cliente.eta}</td>
              <td>{cliente.luogo_di_residenza}</td>
              <td>{cliente.professione}</td>
              <td>{cliente.reddito}</td>
              <td>
                <ActionButton variant="edit">Edit</ActionButton>
                <ActionButton variant="details" onClick={() => openDetails(cliente.codice_cliente)}>
                  Details
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>

      <PaginationContainer>
        <PaginationButton onClick={goToPrevPage} disabled={currentPage === 1}>
          Prev
        </PaginationButton>
        <span>Pagina {currentPage} di {totalPages}</span>
        <PaginationButton onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </PaginationButton>
      </PaginationContainer>

      <ModalOverlay show={showModal}>
        <ModalContent>
          <CloseButton onClick={closeModal}>Chiudi</CloseButton>
          {selectedDetails ? (
            <div>
              <h3>Dettagli Cliente</h3>
              <p><strong>Nome:</strong> {selectedDetails.cliente.nome}</p>
              <p><strong>Cognome:</strong> {selectedDetails.cliente.cognome}</p>
              <p><strong>Età:</strong> {selectedDetails.cliente.eta}</p>
              <p><strong>Luogo di Nascita:</strong> {selectedDetails.cliente.luogo_di_nascita}</p>
              <p><strong>Luogo di Residenza:</strong> {selectedDetails.cliente.luogo_di_residenza}</p>
              <p><strong>Professione:</strong> {selectedDetails.cliente.professione}</p>
              <p><strong>Reddito:</strong> {selectedDetails.cliente.reddito}</p>

              <h4>Polizze</h4>
              {selectedDetails.polizze && selectedDetails.polizze.length > 0 ? (
                <ul>
                  {selectedDetails.polizze.map(polizza => (
                    <li key={polizza.id}>
                      <strong>Prodotto:</strong> {polizza.prodotto}, <strong>Area di Bisogno:</strong> {polizza.area_di_bisogno}, <strong>Data Emissione:</strong> {polizza.data_di_emissione}
                    </li>
                  ))}
                </ul>
              ) : <p>Nessuna polizza trovata</p>}

              <h4>Reclami e Info</h4>
              {selectedDetails.reclami_info && selectedDetails.reclami_info.length > 0 ? (
                <ul>
                  {selectedDetails.reclami_info.map(item => (
                    <li key={item.id}>
                      <strong>Prodotto:</strong> {item.prodotto}, <strong>Area di Bisogno:</strong> {item.area_di_bisogno}, <strong>Reclami e Info:</strong> {item.reclami_e_info}
                    </li>
                  ))}
                </ul>
              ) : <p>Nessun reclamo/info trovato</p>}

              <h4>Sinistri</h4>
              {selectedDetails.sinistri && selectedDetails.sinistri.length > 0 ? (
                <ul>
                  {selectedDetails.sinistri.map(sinistro => (
                    <li key={sinistro.id}>
                      <strong>Prodotto:</strong> {sinistro.prodotto}, <strong>Area di Bisogno:</strong> {sinistro.area_di_bisogno}, <strong>Sinistro:</strong> {sinistro.sinistro}
                    </li>
                  ))}
                </ul>
              ) : <p>Nessun sinistro trovato</p>}
            </div>
          ) : <p>Caricamento dettagli...</p>}
        </ModalContent>
      </ModalOverlay>
    </TableContainer>
  );
};

export default Database;
