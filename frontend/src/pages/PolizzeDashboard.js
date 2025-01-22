import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Bar, Pie } from 'react-chartjs-2';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { API_BASE_URL } from '../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Roboto', sans-serif;
`;

const TopButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ResetButton = styled.button`
  padding: 8px 16px;
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #c0392b;
  }
`;

const ExtraChartsButton = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const MainContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const ChartsContainer = styled.div`
  flex: 1;
`;

const FilterContainer = styled.div`
  width: 280px;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  height: fit-content;
`;

const ChartRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 2rem;
`;

const ChartColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const PieWrapper = styled.div`
  width: 420px;
  height: 420px;
  margin: 0 auto;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 1000;
`;
const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-height: 80%;
  overflow-y: auto;
  z-index: 1001;
`;

// ------ API Fetching e Memoization ------

const PolizzeDashboard = () => {
  // Stati per dati API
  const [polizze, setPolizze] = useState([]);
  const [reclami, setReclami] = useState([]);
  const [sinistri, setSinistri] = useState([]);

  // Effettua le chiamate API una sola volta
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [polizzeRes, reclamiRes, sinistriRes] = await Promise.all([
          fetch(`${API_BASE_URL}/polizze`),
          fetch(`${API_BASE_URL}/reclami_info`),
          fetch(`${API_BASE_URL}/sinistri`)
        ]);
        const polizzeData = await polizzeRes.json();
        const reclamiData = await reclamiRes.json();
        const sinistriData = await sinistriRes.json();
        setPolizze(polizzeData);
        setReclami(reclamiData);
        setSinistri(sinistriData);
      } catch (error) {
        console.error("Errore nel recupero dei dati:", error);
      }
    };
    fetchData();
  }, []);

  // ------ Elaborazione dati dei grafici ------

  // Memoizza i dataset per polizze per prodotto
  const polizzeProdottoData = useMemo(() => {
    const data = {};
    polizze.forEach(p => {
      const prodotto = p.prodotto;
      if (prodotto) {
        data[prodotto] = (data[prodotto] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Numero di polizze per Prodotto',
          data: Object.values(data),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }
      ]
    };
  }, [polizze]);

  // Memoizza i dataset per polizze per area di bisogno
  const polizzeAreaData = useMemo(() => {
    const data = {};
    polizze.forEach(p => {
      const area = p.area_di_bisogno;
      if (area) {
        data[area] = (data[area] || 0) + 1;
      }
    });
    const bgColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#2980b9', '#27ae60'
    ];
    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Polizze per Area di Bisogno',
          data: Object.values(data),
          backgroundColor: bgColors.slice(0, Object.keys(data).length),
        }
      ]
    };
  }, [polizze]);

  // Reclami per prodotto
  const reclamiData = useMemo(() => {
    const data = {};
    reclami.forEach(r => {
      const prodotto = r.prodotto;
      if (prodotto) {
        data[prodotto] = (data[prodotto] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Reclami per Prodotto',
          data: Object.values(data),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        }
      ]
    };
  }, [reclami]);

  // Sinistri per prodotto
  const sinistriData = useMemo(() => {
    const data = {};
    sinistri.forEach(s => {
      const prodotto = s.prodotto;
      if (prodotto) {
        data[prodotto] = (data[prodotto] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Sinistri per Prodotto',
          data: Object.values(data),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }
      ]
    };
  }, [sinistri]);

  // Opzioni per grafici (non modificate qui)
  const commonOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
  };

  // ------ Grafici Extra (Modal) ------
  // Aggrega i dati dalle polizze extra in base a prodotto e area di bisogno
  const aggregatedProducts = useMemo(() => {
    const data = {};
    polizze.forEach(p => {
      if (p.prodotto) {
        data[p.prodotto] = (data[p.prodotto] || 0) + 1;
      }
    });
    return data;
  }, [polizze]);

  const aggregatedAreas = useMemo(() => {
    const data = {};
    polizze.forEach(p => {
      if (p.area_di_bisogno) {
        data[p.area_di_bisogno] = (data[p.area_di_bisogno] || 0) + 1;
      }
    });
    return data;
  }, [polizze]);

  // Array di 5 colori per i prodotti e 3 per le aree
  const productsColors = ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#27ae60'];
  const areasColors = ['#FF6384', '#36A2EB', '#FFCE56'];

  const extraProductsData = useMemo(() => ({
    labels: Object.keys(aggregatedProducts),
    datasets: [{
      label: 'Prodotti',
      data: Object.values(aggregatedProducts),
      backgroundColor: Object.keys(aggregatedProducts).map((_, idx) =>
        productsColors[idx % productsColors.length]
      )
    }]
  }), [aggregatedProducts]);

  const extraAreasData = useMemo(() => ({
    labels: Object.keys(aggregatedAreas),
    datasets: [{
      label: 'Aree di Bisogno',
      data: Object.values(aggregatedAreas),
      backgroundColor: Object.keys(aggregatedAreas).map((_, idx) =>
        areasColors[idx % areasColors.length]
      )
    }]
  }), [aggregatedAreas]);

  // Extra Options (per il modal)
  const extraOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
  };

  // ------ Stato e Funzioni del Modal extra ------
  const [showExtraCharts, setShowExtraCharts] = useState(false);
  const resetFiltersAndExtra = () => {
    // Se necessario, puoi fare ulteriori reset (qui non è implementato un reset completo)
    setShowExtraCharts(false);
  };

  return (
    <DashboardContainer>

      <MainContainer>
        {/* Grafici principali */}
        <ChartsContainer>
          {/* Prima Row: Polizze per Prodotto e per Area di Bisogno */}
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Polizze per Prodotto</h3>
              <Bar data={polizzeProdottoData} options={commonOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Polizze per Area di Bisogno</h3>
              <PieWrapper>
                <Pie data={polizzeAreaData} options={commonOptions} />
              </PieWrapper>
            </ChartColumn>
          </ChartRow>
          {/* Seconda Row: Reclami e Sinistri per Prodotto */}
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Reclami per Prodotto</h3>
              <Bar data={reclamiData} options={{
                ...commonOptions,
                scales: {
                  y: { title: { display: true, text: 'Numero di Reclami' }, beginAtZero: true }
                },
                onClick: (event, elements, chart) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const prodotto = chart.data.labels[index];
                    console.log("Filtro applicato sui Reclami: Prodotto =", prodotto);
                  }
                }
              }} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Sinistri per Prodotto</h3>
              <Bar data={sinistriData} options={{
                ...commonOptions,
                scales: {
                  y: { title: { display: true, text: 'Numero di Sinistri' }, beginAtZero: true }
                },
                onClick: (event, elements, chart) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const prodotto = chart.data.labels[index];
                    console.log("Filtro applicato sui Sinistri: Prodotto =", prodotto);
                  }
                }
              }} />
            </ChartColumn>
          </ChartRow>
        </ChartsContainer>
        {/* Qui, per semplicità, non è presente un pannello di filtri separato. Se necessario, puoi aggiungerlo */}
      </MainContainer>
    </DashboardContainer>
  );
};

export default PolizzeDashboard;
