import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

// Styled Components per la tabella
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

const ActionButton = styled.button`
  padding: 6px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  background-color: ${props =>
    props.variant === "edit" ? "#3498db" :
    props.variant === "details" ? "#f39c12" :
    props.variant === "note" ? "#2ecc71" : "#e74c3c"};
  &:hover {
    opacity: 0.9;
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

// Modal per i dettagli e per le note
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

// Modal per le note, stile "bigliettini" o post-it
const NoteCard = styled.div`
  background-color: #fffae6;
  border: 1px solid #f0dca7;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  color: #e74c3c;
  font-size: 1.2rem;
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
`;

const NoteInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px;
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const NoteAddButton = styled.button`
  background-color: #2ecc71;
  margin-top: 0.5rem;
  &:hover {
    background-color: #27ae60;
  }
`;

const Database = () => {
  const [clienti, setClienti] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;
  
  // Stato per il modal dei dettagli del cliente
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Stato per il modal delle note
  const [notes, setNotes] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  // Stato per il contenuto della nuova nota
  const [newNoteText, setNewNoteText] = useState('');

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

  // Funzione per aprire il modal con i dettagli del cliente
  const openDetails = async (codice_cliente) => {
    try {
      console.log("Richiesta dettagli per cliente:", codice_cliente);
      const response = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}`);
      const data = await response.json();
      console.log("Dettagli ricevuti:", data);
      setSelectedDetails(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Errore nel recuperare i dettagli", error);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
  };

  // Funzione per aprire il modal con le note del cliente
  const openNotes = async (codice_cliente) => {
    try {
      // Recupera i dettagli del cliente (in modo simile a openDetails)
      const clientResponse = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}`);
      const clientData = await clientResponse.json();
      setSelectedDetails(clientData);
  
      // Recupera le note associate al cliente
      const response = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}/note`);
      const data = await response.json();
      setNotes(data);
      setShowNotesModal(true);
    } catch (error) {
      console.error("Errore nel recuperare le note", error);
    }
  };

  const closeNotesModal = () => {
    setShowNotesModal(false);
    setNotes([]);
    setNewNoteText('');
  };

  // Funzione per eliminare una nota
  const deleteNote = async (id_nota) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa nota?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/note/${id_nota}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Errore nell'eliminazione della nota");
      }
      setNotes(prevNotes => prevNotes.filter(note => note.id_nota !== id_nota));
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  // Funzione per aggiungere una nuova nota
  const addNote = async (codice_cliente) => {
    if (!newNoteText.trim()) return;
    // Assumi che i dettagli del cliente siano già in selectedDetails.cliente.
    const payload = {
      nome: selectedDetails.cliente.nome,
      cognome: selectedDetails.cliente.cognome,
      nota: newNoteText.trim()
    };
    try {
      const response = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Errore nell'aggiunta della nota");
      }
      const data = await response.json();
      // Aggiungi la nuova nota alla lista
      setNotes(prevNotes => [...prevNotes, data]);
      setNewNoteText('');
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore durante l'aggiunta della nota.");
    }
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
                <ActionButton variant="note" onClick={() => openNotes(cliente.codice_cliente)}>
                  Note
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

      {/* Modal per i dettagli del cliente */}
      <ModalOverlay show={showDetailsModal}>
        <ModalContent>
          <CloseButton onClick={closeDetailsModal}>Chiudi</CloseButton>
          <h3>Dettagli Cliente</h3>
          {selectedDetails ? (
            <div>
              <p><strong>Nome:</strong> {selectedDetails.cliente.nome}</p>
              <p><strong>Cognome:</strong> {selectedDetails.cliente.cognome}</p>
              <p><strong>Età:</strong> {selectedDetails.cliente.eta}</p>
              <p><strong>Luogo di Nascita:</strong> {selectedDetails.cliente.luogo_di_nascita}</p>
              <p><strong>Luogo di Residenza:</strong> {selectedDetails.cliente.luogo_di_residenza}</p>
              <p><strong>Professione:</strong> {selectedDetails.cliente.professione}</p>
              <p><strong>Reddito:</strong> {selectedDetails.cliente.reddito}</p>
              <h4>Polizze</h4>
              {selectedDetails.polizze?.length > 0 ? (
                <ul>
                  {selectedDetails.polizze.map(polizza => (
                    <li key={polizza.id}>
                      <strong>Prodotto:</strong> {polizza.prodotto}, <strong>Area di Bisogno:</strong> {polizza.area_di_bisogno}, <strong>Data:</strong> {polizza.data_di_emissione}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nessuna polizza trovata</p>
              )}
              <h4>Reclami e Info</h4>
              {selectedDetails.reclami_info?.length > 0 ? (
                <ul>
                  {selectedDetails.reclami_info.map(item => (
                    <li key={item.id}>
                      <strong>Prodotto:</strong> {item.prodotto}, <strong>Area:</strong> {item.area_di_bisogno}, <strong>Info:</strong> {item.reclami_e_info}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nessun reclamo/info trovato</p>
              )}
              <h4>Sinistri</h4>
              {selectedDetails.sinistri?.length > 0 ? (
                <ul>
                  {selectedDetails.sinistri.map(sinistro => (
                    <li key={sinistro.id}>
                      <strong>Prodotto:</strong> {sinistro.prodotto}, <strong>Area:</strong> {sinistro.area_di_bisogno}, <strong>Sinistro:</strong> {sinistro.sinistro}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nessun sinistro trovato</p>
              )}
            </div>
          ) : (
            <p>Caricamento dettagli...</p>
          )}
        </ModalContent>
      </ModalOverlay>

      {/* Modal per le note del cliente */}
      <ModalOverlay show={showNotesModal}>
        <ModalContent>
          <CloseButton onClick={closeNotesModal}>Chiudi</CloseButton>
          <h3>Note Cliente</h3>
          {notes.length > 0 ? (
            notes.map(note => (
              <NoteCard key={note.id_nota}>
                <DeleteButton onClick={() => deleteNote(note.id_nota)}>&times;</DeleteButton>
                <p>{note.nota}</p>
              </NoteCard>
            ))
          ) : (
            <p style={{ textAlign: 'center' }}>Nessuna nota trovata</p>
          )}
          {/* Nuovo slot per aggiungere una nota */}
          <h4>Aggiungi una nuova nota:</h4>
          <NoteInput 
            value={newNoteText} 
            onChange={(e) => setNewNoteText(e.target.value)} 
            placeholder="Scrivi qui la tua nota..." 
          />
          <NoteAddButton onClick={() => addNote(selectedDetails.cliente.codice_cliente)}>
            Aggiungi Nota
          </NoteAddButton>
        </ModalContent>
      </ModalOverlay>
    </TableContainer>
  );
};

export default Database;
