// src/components/EditModal.js
import React, { useState } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  border-radius: 8px;
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

const FormField = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background-color: #2ecc71;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  &:hover {
    background-color: #27ae60;
  }
`;

const EditModal = ({ client, onClose, onSave }) => {
  const [nome, setNome] = useState(client.nome);
  const [cognome, setCognome] = useState(client.cognome);
  const [eta, setEta] = useState(client.eta);
  const [reddito, setReddito] = useState(client.reddito);

  const handleSave = async () => {
    const payload = { nome, cognome, eta, reddito };
    try {
      const response = await fetch(`${API_BASE_URL}/clienti/${client.codice_cliente}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        // Qui puoi estrarre ulteriori dettagli dall'errore se l'API li restituisce
        const errorData = await response.json();
        throw new Error(errorData.detail || "Errore nell'aggiornamento");
      }
      const updatedClient = await response.json();
      onSave(updatedClient);
      onClose();
    } catch (error) {
      alert("Errore durante l'aggiornamento: " + error.message);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>Chiudi</CloseButton>
        <h3>Modifica Cliente</h3>
        <FormField>
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </FormField>
        <FormField>
          <Label>Cognome</Label>
          <Input value={cognome} onChange={(e) => setCognome(e.target.value)} />
        </FormField>
        <FormField>
          <Label>Età</Label>
          <Input type="number" value={eta} onChange={(e) => setEta(Number(e.target.value))} />
        </FormField>
        <FormField>
          <Label>Reddito</Label>
          <Input type="number" value={reddito} onChange={(e) => setReddito(Number(e.target.value))} />
        </FormField>
        <SaveButton onClick={handleSave}>Salva</SaveButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditModal;
