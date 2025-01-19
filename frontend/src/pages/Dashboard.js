import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { API_BASE_URL } from '../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

const Dashboard = () => {
  const [clienti, setClienti] = useState([]);
  // Global state for the selected filters
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedIncomeBin, setSelectedIncomeBin] = useState(null);
  const [selectedPropRange, setSelectedPropRange] = useState(null);   // per prodotti Vita
  const [selectedPropDanni, setSelectedPropDanni] = useState(null);   // per prodotti Danni

  // Retrieve the data from the API
  useEffect(() => {
    const fetchClienti = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clienti`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClienti(data);
      } catch (error) {
        console.error("Errore nel recuperare i dati:", error);
      }
    };
    fetchClienti();
  }, []);

  // Function to filter the data based on the selected filters
  const getFilteredClienti = () => {
    let data = clienti;
    if (selectedAge !== null) {
      data = data.filter(cliente => cliente.eta === Number(selectedAge));
    }
    if (selectedProfession !== null) {
      data = data.filter(cliente => cliente.professione === selectedProfession);
    }
    if (selectedIncomeBin !== null) {
      const [low, high] = selectedIncomeBin.split('-').map(Number);
      data = data.filter(cliente => cliente.reddito >= low && cliente.reddito < high);
    }
    if (selectedPropRange !== null) {
      const [low, high] = selectedPropRange.split('-').map(Number);
      data = data.filter(cliente =>
        Number(cliente.propensione_acquisto_prodotti_vita) >= low &&
        Number(cliente.propensione_acquisto_prodotti_vita) < high
      );
    }
    if (selectedPropDanni !== null) {
      const [low, high] = selectedPropDanni.split('-').map(Number);
      data = data.filter(cliente =>
        Number(cliente.propensione_acquisto_prodotti_danni) >= low &&
        Number(cliente.propensione_acquisto_prodotti_danni) < high
      );
    }
    return data;
  };

  const filteredData = getFilteredClienti();

  // --- Grafico: Distribuzione Età ---
  const ageCounts = {};
  filteredData.forEach(cliente => {
    const age = cliente.eta;
    ageCounts[age] = (ageCounts[age] || 0) + 1;
  });
  const uniqueAges = Object.keys(ageCounts)
    .map(age => Number(age))
    .sort((a, b) => a - b);
  const ageCountsArray = uniqueAges.map(age => ageCounts[age]);

  const ageData = {
    labels: uniqueAges,
    datasets: [
      {
        label: 'Numero di clienti',
        data: ageCountsArray,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const ageOptions = {
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const age = uniqueAges[index];
        setSelectedAge(age);
        setSelectedProfession(null);
        setSelectedIncomeBin(null);
        setSelectedPropRange(null);
        setSelectedPropDanni(null);
      }
    },
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Età' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true },
    },
  };

  // --- Grafico: Distribuzione Professioni ---
  const professionCounts = {};
  filteredData.forEach(cliente => {
    const prof = cliente.professione;
    if (prof) {
      professionCounts[prof] = (professionCounts[prof] || 0) + 1;
    }
  });
  const pieData = {
    labels: Object.keys(professionCounts),
    datasets: [
      {
        data: Object.values(professionCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad',
          '#2980b9', '#27ae60', '#e67e22', '#e74c3c', '#1abc9c', '#f1c40f', '#2ecc71'],
      },
    ],
  };

  const pieOptions = {
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const prof = chart.data.labels[index];
        setSelectedProfession(prof);
        setSelectedAge(null);
        setSelectedIncomeBin(null);
        setSelectedPropRange(null);
        setSelectedPropDanni(null);
      }
    },
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  // --- Grafico: Distribuzione Reddito ---
  const incomeBins = [0, 20000, 40000, 60000, 80000, 100000, 120000, Infinity];
  const incomeLabels = incomeBins.slice(0, -1).map((bin, idx) => {
    const upper = incomeBins[idx + 1] === Infinity ? '+' : incomeBins[idx + 1];
    return `${bin}-${upper}`;
  });
  const incomeCounts = new Array(incomeLabels.length).fill(0);
  filteredData.forEach(cliente => {
    const income = cliente.reddito;
    const binIdx = incomeBins.findIndex((bound, idx) =>
      idx < incomeBins.length - 1 && income >= bound && income < incomeBins[idx + 1]
    );
    if (binIdx !== -1) {
      incomeCounts[binIdx]++;
    }
  });
  const incomeData = {
    labels: incomeLabels,
    datasets: [
      {
        label: 'Numero di clienti',
        data: incomeCounts,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const incomeOptions = {
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const bin = chart.data.labels[index];
        setSelectedIncomeBin(bin);
        setSelectedAge(null);
        setSelectedProfession(null);
        setSelectedPropRange(null);
        setSelectedPropDanni(null);
      }
    },
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Fascia di Reddito' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true },
    },
  };

  // --- Grafico: Distribuzione Propensione all'Acquisto dei Prodotti Vita ---
  const propVitaBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];
  const propVitaLabels = ["0 - 0.20", "0.21 - 0.40", "0.41 - 0.60", "0.61 - 0.80", "0.81 - 1"];
  const propVitaCounts = new Array(propVitaLabels.length).fill(0);
  filteredData.forEach(cliente => {
    const prop = Number(cliente.propensione_acquisto_prodotti_vita);
    if (!isNaN(prop)) {
      const binIdx = propVitaBins.findIndex((bound, idx) =>
        idx < propVitaBins.length - 1 && prop >= bound && prop < propVitaBins[idx + 1]
      );
      if (binIdx !== -1) {
        propVitaCounts[binIdx]++;
      }
    }
  });

  const propVitaData = {
    labels: propVitaLabels,
    datasets: [
      {
        label: 'Prodotti Vita',
        data: propVitaCounts,
        backgroundColor: ['#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const propVitaOptions = {
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const range = chart.data.labels[index];
        setSelectedPropRange(range);
        // Reset of the other filters
        setSelectedAge(null);
        setSelectedProfession(null);
        setSelectedIncomeBin(null);
        setSelectedPropDanni(null);
      }
    },
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Intervallo di Propensione (Vita)' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true },
    },
  };

  // --- Grafico: Distribuzione Propensione all'Acquisto dei Prodotti Danni ---
  const propDanniBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];
  const propDanniLabels = ["0 - 0.20", "0.21 - 0.40", "0.41 - 0.60", "0.61 - 0.80", "0.81 - 1"];
  const propDanniCounts = new Array(propDanniLabels.length).fill(0);
  filteredData.forEach(cliente => {
    const prop = Number(cliente.propensione_acquisto_prodotti_danni);
    if (!isNaN(prop)) {
      const binIdx = propDanniBins.findIndex((bound, idx) =>
        idx < propDanniBins.length - 1 && prop >= bound && prop < propDanniBins[idx + 1]
      );
      if (binIdx !== -1) {
        propDanniCounts[binIdx]++;
      }
    }
  });
  
  console.log("PropVitaCounts:", propVitaCounts);
  console.log("PropDanniCounts:", propDanniCounts);

  const propDanniData = {
    labels: propDanniLabels,
    datasets: [
      {
        label: 'Prodotti Danni',
        data: propDanniCounts,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#27ae60'],
      },
    ],
  };

  const propDanniOptions = {
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const range = chart.data.labels[index];
        setSelectedPropDanni(range);
        // reset of the other filters
        setSelectedAge(null);
        setSelectedProfession(null);
        setSelectedIncomeBin(null);
        setSelectedPropRange(null);
      }
    },
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Intervallo di Propensione (Danni)' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true },
    },
  };

  const resetFilters = () => {
    setSelectedAge(null);
    setSelectedProfession(null);
    setSelectedIncomeBin(null);
    setSelectedPropRange(null);
    setSelectedPropDanni(null);
  };

  return (
    <DashboardContainer>
      <SectionTitle>Dashboard Clienti</SectionTitle>
      {(selectedAge !== null || selectedProfession !== null || selectedIncomeBin !== null || selectedPropRange !== null || selectedPropDanni !== null) && (
        <ResetButton onClick={resetFilters}>Mostra tutti i dati</ResetButton>
      )}

      {/* Top Row: Istogramma Età e Diagramma a Torta per Professioni */}
      <ChartRow>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>Distribuzione Età</h3>
          <Bar data={ageData} options={ageOptions} />
        </ChartColumn>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>
            Distribuzione Professioni {selectedProfession ? `(Professione: ${selectedProfession})` : ''}
          </h3>
          <Pie data={pieData} options={pieOptions} />
        </ChartColumn>
      </ChartRow>

      {/* Second Row: Grafici per Reddito, Propensione Prodotti Vita e Prodotti Danni */}
      <ChartRow>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>
            Distribuzione Reddito {selectedIncomeBin ? `(Fascia: ${selectedIncomeBin})` : ''}
          </h3>
          <Bar data={incomeData} options={incomeOptions} />
        </ChartColumn>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>
            Propensione all'Acquisto (Prodotti Vita) {selectedPropRange ? `(Intervallo: ${selectedPropRange})` : ''}
          </h3>
          <Bar data={propVitaData} options={propVitaOptions} />
        </ChartColumn>
        <ChartColumn>
          <h3 style={{ textAlign: 'center' }}>
            Propensione all'Acquisto (Prodotti Danni) {selectedPropDanni ? `(Intervallo: ${selectedPropDanni})` : ''}
          </h3>
          <Bar data={propDanniData} options={propDanniOptions} />
        </ChartColumn>
      </ChartRow>
    </DashboardContainer>
  );
};

export default Dashboard;
