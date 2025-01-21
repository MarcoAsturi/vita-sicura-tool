import React from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../config";

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Logo = styled.img`
  width: 650px;
  height: 250px;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  color: #333;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Presentation = styled.p`
  font-size: 1.1rem;
  text-align: left;
  margin: 1rem 0;
  max-width: 700px;
`;

const Warning = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: left;
  max-width: 600px;
`;

const TrafficLight = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${(props) => (props.status === "ok" ? "green" : "red")};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
`;

const StatusMessage = styled.p`
  margin-top: 1rem;
  color: ${(props) => (props.error ? "red" : "#333")};
`;

const Home = () => {
    // fetch the status of the API
  const { data, isLoading, error } = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/status`);
      if (!res.ok) {
        throw new Error("Status non disponibile");
      }
      return res.json();
    },
    refetchInterval: 10000,
    retry: false,
  });

  // force the status to be "ok" for testing purposes
  const status = data && data.status === "ok" && !error ? "ok" : "pending";

  return (
    <HomeContainer>
      <Logo src="logoVitaSicura.png" alt="Logo" />
      <Presentation>
        Benvenuto nel tool di Vita Sicura, lo strumento pensato per facilitare la
        pianificazione e l’operatività degli agenti assicurativi.<br /> Qui potrai
        organizzare il tuo lavoro e accedere a informazioni dettagliate sui clienti,
        tramite dashboard interattive e funzionalità integrate.
      </Presentation>
      <Warning>
        <strong>ATTENZIONE:</strong> <br /> - Dopo il primo avvio l'accesso alle funzionalità potrebbe
        richiedere del tempo (circa 120 secondi).<br /> - Attendere il cambio di stato (simbolo verde con scritta 'GO') prima di
        navigare.<br /> - Se il simbolo dello stato rimane rosso con scritta 'WAIT' chiudere la pagina e riapirla dopo 2/3 minuti circa.
        <br /> - Il caricamento dei grafici e delle tabelle sugli altri TAB potrebbe richiedere una decina di secondi anche dopo che l'applicazione 
        si è avviata correttamente.
      </Warning>
      <TrafficLight status={status}>
        {status === "ok" ? "GO" : "WAIT"}
      </TrafficLight>
      {/* {isLoading && <StatusMessage>Controllo dello status in corso...</StatusMessage>}
      {error && <StatusMessage error>Errore: {error.message}</StatusMessage>} */}
    </HomeContainer>
  );
};

export default Home;
