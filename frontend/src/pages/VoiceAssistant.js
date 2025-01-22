import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

const Container = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.8rem;
  color: #333;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const SectionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: rgb(35, 34, 75);
  font-size: 1.75rem;
  text-align: center;
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MicrophoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FileInput = styled.input`
  margin: 1rem 0;
`;

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: rgb(35, 34, 75);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  &:hover {
    background-color: rgb(105, 103, 238);
  }
`;

const FeaturePlaceholder = styled.div`
  text-align: center;
  padding: 1rem;
  border: 1px dashed #ccc;
  border-radius: 6px;
  font-style: italic;
  color: #888;
`;

const ResultContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
`;

const ResultTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: #555;
  text-align: left;
`;

const Preformatted = styled.pre`
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  overflow-x: auto;
`;

const InfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
`;

const InfoRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

const InfoKey = styled.td`
  font-weight: bold;
  padding: 0.5rem;
  width: 30%;
  color: #555;
`;

const InfoValue = styled.td`
  padding: 0.5rem;
  width: 70%;
  color: #333;
`;

const VoiceAssistant = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uploadResult]);

  const handleUploadFile = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/assistente-vocale`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      setUploadResult(data);
    } catch (error) {
      console.error("Error:", error);
      setUploadResult({ error: error.message });
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleButtonUpload = () => {
    if (selectedFile) {
      handleUploadFile(selectedFile);
    }
  };

  return (
    <Container>
      <Title>Vocal Assistant</Title>
      <SectionsWrapper>
        <Section>
          <SectionTitle>Carica un file audio<br/ > (attualmente supportato solo formato .wav)</SectionTitle>
          <FileUploadContainer>
            <FileInput type="file" accept="audio/*" onChange={handleFileChange} />
            <Button onClick={handleButtonUpload}>Processa</Button>
          </FileUploadContainer>
        </Section>
        <Section>
          <SectionTitle>Registra dal microfono</SectionTitle>
          <MicrophoneContainer>
            <FeaturePlaceholder>
              Feature in costruzione - presto disponibile!
            </FeaturePlaceholder>
          </MicrophoneContainer>
        </Section>
      </SectionsWrapper>
      {loading && <p style={{ textAlign: "center" }}>Elaborazione in corso...</p>}
      {uploadResult && (
        <ResultContainer>
          {uploadResult.error ? (
            <>
              <ResultTitle>Error:</ResultTitle>
              <p>{uploadResult.error}</p>
            </>
          ) : (
            <>
              <ResultTitle>Trascrizione:</ResultTitle>
              <Preformatted>{uploadResult.trascrizione}</Preformatted>
              <ResultTitle>Informazioni Estratte:</ResultTitle>
              <InfoTable>
                <tbody>
                  <InfoRow>
                    <InfoKey>Nome</InfoKey>
                    <InfoValue>{uploadResult.informazioni.nome}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoKey>Cognome</InfoKey>
                    <InfoValue>{uploadResult.informazioni.cognome}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoKey>Nota</InfoKey>
                    <InfoValue>{uploadResult.informazioni.nota}</InfoValue>
                  </InfoRow>
                </tbody>
              </InfoTable>
              <ResultTitle>Aggiornamento Database:</ResultTitle>
              <p style={{ textAlign: "left" }}>
                {uploadResult.database_aggiornato ? "Successo" : "Fallito"}
              </p>
            </>
          )}
          <div ref={messagesEndRef} />
        </ResultContainer>
      )}
    </Container>
  );
};

export default VoiceAssistant;
