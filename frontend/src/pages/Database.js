import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';
import EditModal from '../components/EditModal';  

const TableContainer = styled.div`
  max-width: 1100px;
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
    cursor: pointer;
  }
  th {
    background-color: rgb(35, 34, 75);
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
  background-color: rgb(98, 96, 241);
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

// Modal Components
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

// Styled Components per il modal delle note
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
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  &:hover {
    background-color: #27ae60;
  }
`;

// Componenti di supporto per i dettagli
const ClientDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  background: #f9f9f9;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  margin-bottom: 10px;
  color: #007bff;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  background: #f1f8ff;
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid #cce5ff;
  border-radius: 4px;
`;

const Database = () => {
  const [clienti, setClienti] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
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

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredClienti = clienti.filter(cliente =>
    cliente.codice_cliente.toString().includes(searchQuery) ||
    cliente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.cognome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.professione.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.luogo_di_residenza.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedClienti = sortKey
    ? [...filteredClienti].sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredClienti;

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = sortedClienti.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(sortedClienti.length / resultsPerPage);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const openEditModal = (cliente) => {
    setSelectedClientForEdit(cliente);
  };

  const closeEditModal = () => {
    setSelectedClientForEdit(null);
  };

  const openDetails = async (codice_cliente) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}`);
      const data = await response.json();
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

  const openNotes = async (codice_cliente) => {
    try {
      const clientResponse = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}`);
      const clientData = await clientResponse.json();
      setSelectedDetails(clientData);
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

  const deleteNote = async (id_nota) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa nota?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/note/${id_nota}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Errore nell'eliminazione della nota");
      }
      setNotes(prev => prev.filter(note => note.id_nota !== id_nota));
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  const addNote = async (codice_cliente) => {
    if (!newNoteText.trim()) return;
    if (!selectedDetails?.cliente) {
      alert("Dettagli cliente non disponibili. Riapri il modal 'Note' per aggiornare i dati.");
      return;
    }
    const payload = {
      nome: selectedDetails.cliente.nome,
      cognome: selectedDetails.cliente.cognome,
      nota: newNoteText.trim()
    };
    try {
      const response = await fetch(`${API_BASE_URL}/clienti/${codice_cliente}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Errore nell'aggiunta della nota");
      const data = await response.json();
      setNotes(prev => [...prev, data]);
      setNewNoteText('');
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore durante l'aggiunta della nota.");
    }
  };

  return (
    <TableContainer>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Cerca..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </SearchContainer>
      <StyledTable>
        <thead>
          <tr>
            <th onClick={() => handleSort('codice_cliente')}>Codice</th>
            <th onClick={() => handleSort('nome')}>Nome</th>
            <th onClick={() => handleSort('cognome')}>Cognome</th>
            <th onClick={() => handleSort('eta')}>Età</th>
            <th onClick={() => handleSort('luogo_di_residenza')}>Luogo di Residenza</th>
            <th onClick={() => handleSort('professione')}>Professione</th>
            <th onClick={() => handleSort('reddito')}>Reddito</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {currentResults.map((cliente, index) => (
            <tr key={index}>
              <td>{cliente.codice_cliente}</td>
              <td>{cliente.nome}</td>
              <td>{cliente.cognome}</td>
              <td>{cliente.eta}</td>
              <td>{cliente.luogo_di_residenza}</td>
              <td>{cliente.professione}</td>
              <td>{cliente.reddito}</td>
              <td>
                <ActionButton variant="edit" onClick={() => openEditModal(cliente)}>
                  Edit
                </ActionButton>
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
          {selectedDetails && selectedDetails.cliente ? (
            <div>
              <ClientDetailsGrid>
                <DetailItem><strong>Codice Cliente:</strong> {selectedDetails.cliente.codice_cliente}</DetailItem>
                <DetailItem><strong>Nome:</strong> {selectedDetails.cliente.nome}</DetailItem>
                <DetailItem><strong>Cognome:</strong> {selectedDetails.cliente.cognome}</DetailItem>
                <DetailItem><strong>Età:</strong> {selectedDetails.cliente.eta}</DetailItem>
                <DetailItem><strong>Luogo di Nascita:</strong> {selectedDetails.cliente.luogo_di_nascita}</DetailItem>
                <DetailItem><strong>Luogo di Residenza:</strong> {selectedDetails.cliente.luogo_di_residenza}</DetailItem>
                <DetailItem><strong>Professione:</strong> {selectedDetails.cliente.professione}</DetailItem>
                <DetailItem><strong>Reddito:</strong> {selectedDetails.cliente.reddito}</DetailItem>
                <DetailItem><strong>Reddito Familiare:</strong> {selectedDetails.cliente.reddito_familiare}</DetailItem>
                <DetailItem><strong>Numero Figli:</strong> {selectedDetails.cliente.numero_figli}</DetailItem>
                <DetailItem><strong>Anzianità con la Compagnia:</strong> {selectedDetails.cliente.anzianita_con_la_compagnia}</DetailItem>
                <DetailItem><strong>Stato Civile:</strong> {selectedDetails.cliente.stato_civile}</DetailItem>
                <DetailItem><strong>Numero Familiari a Carico:</strong> {selectedDetails.cliente.numero_familiari_a_carico}</DetailItem>
                <DetailItem><strong>Reddito Stimato:</strong> {selectedDetails.cliente.reddito_stimato}</DetailItem>
                <DetailItem><strong>Patrimonio Finanziario Stimato:</strong> {selectedDetails.cliente.patrimonio_finanziario_stimato}</DetailItem>
                <DetailItem><strong>Patrimonio Reale Stimato:</strong> {selectedDetails.cliente.patrimonio_reale_stimato}</DetailItem>
                <DetailItem><strong>Consumi Stimati:</strong> {selectedDetails.cliente.consumi_stimati}</DetailItem>
                <DetailItem><strong>Propensione Acquisto Prodotti Vita:</strong> {selectedDetails.cliente.propensione_acquisto_prodotti_vita}</DetailItem>
                <DetailItem><strong>Propensione Acquisto Prodotti Danni:</strong> {selectedDetails.cliente.propensione_acquisto_prodotti_danni}</DetailItem>
                <DetailItem><strong>Valore Immobiliare Medio:</strong> {selectedDetails.cliente.valore_immobiliare_medio}</DetailItem>
                <DetailItem><strong>Probabilità Furti Stimata:</strong> {selectedDetails.cliente.probabilita_furti_stimata}</DetailItem>
                <DetailItem><strong>Probabilità Rapine Stimata:</strong> {selectedDetails.cliente.probabilita_rapine_stimata}</DetailItem>
                <DetailItem><strong>Zona di Residenza:</strong> {selectedDetails.cliente.zona_di_residenza}</DetailItem>
                <DetailItem><strong>Agenzia:</strong> {selectedDetails.cliente.agenzia}</DetailItem>
              </ClientDetailsGrid>
              
              {/* Sezioni per Polizze, Reclami e Sinistri */}
              <Section>
                <SectionTitle>Polizze</SectionTitle>
                {selectedDetails.polizze && selectedDetails.polizze.length > 0 ? (
                  <List>
                    {selectedDetails.polizze.map(polizza => (
                      <ListItem key={polizza.id}>
                        <strong>Prodotto:</strong> {polizza.prodotto}<br />
                        <strong>Area di Bisogno:</strong> {polizza.area_di_bisogno}<br />
                        <strong>Data di Emissione:</strong> {polizza.data_di_emissione}<br />
                        <strong>Premio Ricorrente:</strong> {polizza.premio_ricorrente}<br />
                        <strong>Premio Unico:</strong> {polizza.premio_unico}<br />
                        <strong>Capitale Rivalutato:</strong> {polizza.capitale_rivalutato}<br />
                        <strong>Massimale:</strong> {polizza.massimale}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <p>Nessuna polizza trovata</p>
                )}
              </Section>
              
              <Section>
                <SectionTitle>Reclami e Informazioni</SectionTitle>
                {selectedDetails.reclami_info && selectedDetails.reclami_info.length > 0 ? (
                  <List>
                    {selectedDetails.reclami_info.map(item => (
                      <ListItem key={item.id}>
                        <strong>Prodotto:</strong> {item.prodotto}<br />
                        <strong>Area di Bisogno:</strong> {item.area_di_bisogno}<br />
                        <strong>Reclami e Informazioni:</strong> {item.reclami_e_info}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <p>Nessun reclamo o informazione trovato</p>
                )}
              </Section>
              
              <Section>
                <SectionTitle>Sinistri</SectionTitle>
                {selectedDetails.sinistri && selectedDetails.sinistri.length > 0 ? (
                  <List>
                    {selectedDetails.sinistri.map(sinistro => (
                      <ListItem key={sinistro.id}>
                        <strong>Prodotto:</strong> {sinistro.prodotto}<br />
                        <strong>Area di Bisogno:</strong> {sinistro.area_di_bisogno}<br />
                        <strong>Sinistro:</strong> {sinistro.sinistro}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <p>Nessun sinistro trovato</p>
                )}
              </Section>
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
          <h4>Aggiungi una nuova nota:</h4>
          <NoteInput 
            value={newNoteText} 
            onChange={(e) => setNewNoteText(e.target.value)} 
            placeholder="Scrivi qui la tua nota..." 
          />
          <NoteAddButton onClick={() => {
            if(selectedDetails?.cliente?.codice_cliente){
              addNote(selectedDetails.cliente.codice_cliente);
            } else {
              alert("Nessun cliente selezionato per aggiungere la nota");
            }
          }}>
            Aggiungi Nota
          </NoteAddButton>
        </ModalContent>
      </ModalOverlay>

      {selectedClientForEdit && (
        <EditModal 
          client={selectedClientForEdit}
          onClose={closeEditModal}
          onSave={(updatedClient) => {
            setClienti(prev => prev.map(c => c.codice_cliente === updatedClient.codice_cliente ? updatedClient : c));
          }}
        />
      )}
    </TableContainer>
  );
};

export default Database;
