import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Bar, Pie } from 'react-chartjs-2';
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

const PieWrapper = styled.div`
  width: 420px;
  height: 420px;
  margin: 0 auto;
`;

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Roboto', sans-serif;
`;

const SectionTitle = styled.h2`
  text-align: center;
  color: #007bff;
  margin-bottom: 1rem;
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

const ResetButton = styled.button`
  display: block;
  margin: 0 auto 2rem auto;
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

const PolizzeDashboard = () => {
  const [polizze, setPolizze] = useState([]);
  const [reclami, setReclami] = useState([]);
  const [sinistri, setSinistri] = useState([]);
  
  useEffect(() => {
    const fetchPolizze = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/polizze`);
        const data = await response.json();
        setPolizze(data);
      } catch (error) {
        console.error("Errore nel recuperare le polizze:", error);
      }
    };
    const fetchReclami = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reclami_info`);
        const data = await response.json();
        setReclami(data);
      } catch (error) {
        console.error("Errore nel recuperare i reclami:", error);
      }
    };
    const fetchSinistri = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sinistri`);
        const data = await response.json();
        setSinistri(data);
      } catch (error) {
        console.error("Errore nel recuperare i sinistri:", error);
      }
    };

    fetchPolizze();
    fetchReclami();
    fetchSinistri();
  }, []);

  // Grafico: Polizze per Prodotto
  const polizzePerProdotto = {};
  polizze.forEach(p => {
    const prodotto = p.prodotto;
    if (prodotto) {
      polizzePerProdotto[prodotto] = (polizzePerProdotto[prodotto] || 0) + 1;
    }
  });
  const polizzeProdLabels = Object.keys(polizzePerProdotto);
  const polizzeProdCounts = Object.values(polizzePerProdotto);
  
  const polizzeProdottoData = {
    labels: polizzeProdLabels,
    datasets: [
      {
        label: 'Numero di polizze per Prodotto',
        data: polizzeProdCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const polizzeProdottoOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const prodotto = chart.data.labels[index];
        console.log("Filtro applicato: Prodotto =", prodotto);
      }
    },
  };

  // Grafico: Polizze per Area di Bisogno
  const polizzePerArea = {};
  polizze.forEach(p => {
    const area = p.area_di_bisogno;
    if (area) {
      polizzePerArea[area] = (polizzePerArea[area] || 0) + 1;
    }
  });
  const areaLabels = Object.keys(polizzePerArea);
  const areaCounts = Object.values(polizzePerArea);

  const polizzeAreaData = {
    labels: areaLabels,
    datasets: [
      {
        label: 'Polizze per Area di Bisogno',
        data: areaCounts,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8e44ad',
          '#2980b9',
          '#27ae60',
        ],
      },
    ],
  };

  const polizzeAreaOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const area = chart.data.labels[index];
        console.log("Filtro applicato: Area di Bisogno =", area);
      }
    },
  };

  // Grafico: Reclami per Prodotto
  const reclamiPerProdotto = {};
  reclami.forEach(r => {
    const prodotto = r.prodotto;
    if (prodotto) {
      reclamiPerProdotto[prodotto] = (reclamiPerProdotto[prodotto] || 0) + 1;
    }
  });
  const reclamiLabels = Object.keys(reclamiPerProdotto);
  const reclamiCounts = Object.values(reclamiPerProdotto);

  const reclamiData = {
    labels: reclamiLabels,
    datasets: [
      {
        label: 'Reclami per Prodotto',
        data: reclamiCounts,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const reclamiOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const prodotto = chart.data.labels[index];
        console.log("Filtro applicato sui Reclami: Prodotto =", prodotto);
      }
    },
    scales: {
      x: { title: { display: true, text: 'Prodotto' } },
      y: { title: { display: true, text: 'Numero di Reclami' }, beginAtZero: true },
    },
  };

  // Grafico: Sinistri per Prodotto
  const sinistriPerProdotto = {};
  sinistri.forEach(s => {
    const prodotto = s.prodotto;
    if (prodotto) {
      sinistriPerProdotto[prodotto] = (sinistriPerProdotto[prodotto] || 0) + 1;
    }
  });
  const sinistriLabels = Object.keys(sinistriPerProdotto);
  const sinistriCounts = Object.values(sinistriPerProdotto);

  const sinistriData = {
    labels: sinistriLabels,
    datasets: [
      {
        label: 'Sinistri per Prodotto',
        data: sinistriCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const sinistriOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const prodotto = chart.data.labels[index];
        console.log("Filtro applicato sui Sinistri: Prodotto =", prodotto);
      }
    },
    scales: {
      x: { title: { display: true, text: 'Prodotto' } },
      y: { title: { display: true, text: 'Numero di Sinistri' }, beginAtZero: true },
    },
  };

  const resetFilters = () => {
    // Reset filters, not implemented
  };

  return (
    <DashboardContainer>
      {/* <ResetButton onClick={resetFilters}>Mostra tutti i dati</ResetButton> */}
      
      {/* Prima Row: Polizze per Prodotto e per Area di Bisogno */}
      <ChartRow>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>Polizze per Prodotto</h3>
          <Bar data={polizzeProdottoData} options={polizzeProdottoOptions} />
        </ChartColumn>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>Polizze per Area di Bisogno</h3>
          <PieWrapper>
            <Pie data={polizzeAreaData} options={polizzeAreaOptions} />
          </PieWrapper>
        </ChartColumn>
      </ChartRow>
      
      {/* Seconda Row: Reclami e Sinistri per Prodotto */}
      <ChartRow>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>Reclami per Prodotto</h3>
          <Bar data={reclamiData} options={reclamiOptions} />
        </ChartColumn>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>Sinistri per Prodotto</h3>
          <Bar data={sinistriData} options={sinistriOptions} />
        </ChartColumn>
      </ChartRow>
    </DashboardContainer>
  );
};

export default PolizzeDashboard;
