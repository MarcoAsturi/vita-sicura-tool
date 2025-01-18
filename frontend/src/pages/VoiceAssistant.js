import React, { useState } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
`;

const SectionTitle = styled.h4`
  margin-top: 1.5rem;
`;

const FileInput = styled.input`
  display: block;
  margin: 1rem auto;
`;

const Button = styled.button`
  display: block;
  padding: 10px 20px;
  margin: 1rem auto;
  border: none;
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const FeaturePlaceholder = styled.div`
  text-align: center;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #888;
`;

const ResultContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
`;

const VoiceAssistant = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadFile = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/assistente-vocale`, {
        method: "POST",
        body: formData
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
    if (file) {
      handleUploadFile(file);
    }
  };

  return (
    <Container>
      <Title>Assistente Vocale</Title>

      <SectionTitle>Carica un file audio</SectionTitle>
      <input type="file" accept="audio/*" onChange={handleFileChange} />

      <SectionTitle>Registrazione dal microfono</SectionTitle>
      <FeaturePlaceholder>
        Feature in costruzione - presto disponibile!
      </FeaturePlaceholder>

      {loading && <p>Elaborazione in corso...</p>}
      {uploadResult && (
        <ResultContainer>
          {uploadResult.error ? (
            <p>Error: {uploadResult.error}</p>
          ) : (
            <>
              <SectionTitle>Trascrizione:</SectionTitle>
              <pre>{uploadResult.trascrizione}</pre>
              <SectionTitle>Informazioni Estratte:</SectionTitle>
              <pre>{JSON.stringify(uploadResult.informazioni, null, 2)}</pre>
              <SectionTitle>Aggiornamento Database:</SectionTitle>
              <p>{uploadResult.database_aggiornato ? "Successo" : "Fallito"}</p>
            </>
          )}
        </ResultContainer>
      )}
    </Container>
  );
};

export default VoiceAssistant;
