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
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Styled components per la dashboard e per il layout a colonne
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Roboto', sans-serif;
`;

const MainContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const FilterContainer = styled.div`
  width: 280px;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const ChartsContainer = styled.div`
  flex: 1;
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

const PieWrapper = styled.div`
  width: 420px;
  height: 420px;
  margin: 0 auto;
`;

const ResetButton = styled.button`
  display: block;
  margin: 0 auto 1rem auto;
  padding: 8px 16px;
  background-color: rgb(35, 34, 75);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: rgb(58, 58, 107);
  }
`;

const FilterPanel = ({
  clienti,
  selectedAgeRange,
  setSelectedAgeRange,
  selectedProfession,
  setSelectedProfession,
  selectedIncomeBin,
  setSelectedIncomeBin,
  selectedPropRange,
  setSelectedPropRange,
  selectedPropDanni,
  setSelectedPropDanni,
  resetFilters,
  incomeLabels,
  propVitaLabels,
  propDanniLabels,
}) => {
  const uniqueAges = [...new Set(clienti.map((cliente) => cliente.eta))].sort((a, b) => a - b);
  const uniqueProfessions = [...new Set(clienti.map((cliente) => cliente.professione))].filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Età:</label>
        <br />
        {uniqueAges.length > 0 && (
          <div style={{ margin: '0 10px' }}>
            <Slider
              range
              min={uniqueAges[0]}
              max={uniqueAges[uniqueAges.length - 1]}
              defaultValue={[uniqueAges[0], uniqueAges[uniqueAges.length - 1]]}
              value={selectedAgeRange}
              onChange={setSelectedAgeRange}
            />
            <div>
              Range selezionato: {selectedAgeRange ? `${selectedAgeRange[0]} - ${selectedAgeRange[1]}` : ''}
            </div>
          </div>
        )}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Professione:</label>
        <br />
        <select
          value={selectedProfession || ''}
          onChange={(e) => setSelectedProfession(e.target.value || null)}
          style={{ width: '100%', padding: '4px' }}
        >
          <option value="">Tutte</option>
          {uniqueProfessions.map((prof) => (
            <option key={prof} value={prof}>
              {prof}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Reddito:</label>
        <br />
        <select
          value={selectedIncomeBin || ''}
          onChange={(e) => setSelectedIncomeBin(e.target.value || null)}
          style={{ width: '100%', padding: '4px' }}
        >
          <option value="">Tutte</option>
          {incomeLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Propensione Prodotti Vita:</label>
        <br />
        <select
          value={selectedPropRange || ''}
          onChange={(e) => setSelectedPropRange(e.target.value || null)}
          style={{ width: '100%', padding: '4px' }}
        >
          <option value="">Tutte</option>
          {propVitaLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Propensione Prodotti Danni:</label>
        <br />
        <select
          value={selectedPropDanni || ''}
          onChange={(e) => setSelectedPropDanni(e.target.value || null)}
          style={{ width: '100%', padding: '4px' }}
        >
          <option value="">Tutte</option>
          {propDanniLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <ResetButton onClick={resetFilters}>Reset Filtri</ResetButton>
    </div>
  );
};

const Dashboard = () => {
  const [clienti, setClienti] = useState([]);

  const [selectedAgeRange, setSelectedAgeRange] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedIncomeBin, setSelectedIncomeBin] = useState(null);
  const [selectedPropRange, setSelectedPropRange] = useState(null);
  const [selectedPropDanni, setSelectedPropDanni] = useState(null);

  const incomeBins = [0, 20000, 40000, 60000, 80000, 100000, 120000, Infinity];
  const incomeLabels = incomeBins.slice(0, -1).map((bin, idx) => {
    const upper = incomeBins[idx + 1] === Infinity ? '+' : incomeBins[idx + 1];
    return `${bin}-${upper}`;
  });
  const propVitaBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];
  const propVitaLabels = ['0 - 0.20', '0.21 - 0.40', '0.41 - 0.60', '0.61 - 0.80', '0.81 - 1'];
  const propDanniBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];
  const propDanniLabels = ['0 - 0.20', '0.21 - 0.40', '0.41 - 0.60', '0.61 - 0.80', '0.81 - 1'];

  useEffect(() => {
    const fetchClienti = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clienti`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClienti(data);

        if (data && data.length > 0) {
          const ages = data.map((cliente) => cliente.eta);
          const minAge = Math.min(...ages);
          const maxAge = Math.max(...ages);
          setSelectedAgeRange([minAge, maxAge]);
        }
      } catch (error) {
        console.error("Errore nel recuperare i dati:", error);
      }
    };
    fetchClienti();
  }, []);

  const getFilteredClienti = () => {
    let data = clienti;
    if (selectedAgeRange !== null) {
      data = data.filter(
        (cliente) =>
          cliente.eta >= selectedAgeRange[0] && cliente.eta <= selectedAgeRange[1]
      );
    }
    if (selectedProfession !== null) {
      data = data.filter((cliente) => cliente.professione === selectedProfession);
    }
    if (selectedIncomeBin !== null) {
      const parts = selectedIncomeBin.split('-');
      const low = Number(parts[0]);
      const high = parts[1] === '+' ? Infinity : Number(parts[1]);
      data = data.filter(
        (cliente) =>
          cliente.reddito >= low &&
          (high === Infinity ? true : cliente.reddito < high)
      );
    }
    if (selectedPropRange !== null) {
      const [lowStr, highStr] = selectedPropRange.split('-').map((s) => s.trim());
      const low = Number(lowStr);
      const high = Number(highStr);
      data = data.filter(
        (cliente) =>
          Number(cliente.propensione_acquisto_prodotti_vita) >= low &&
          Number(cliente.propensione_acquisto_prodotti_vita) < high
      );
    }
    if (selectedPropDanni !== null) {
      const [lowStr, highStr] = selectedPropDanni.split('-').map((s) => s.trim());
      const low = Number(lowStr);
      const high = Number(highStr);
      data = data.filter(
        (cliente) =>
          Number(cliente.propensione_acquisto_prodotti_danni) >= low &&
          Number(cliente.propensione_acquisto_prodotti_danni) < high
      );
    }
    return data;
  };

  const filteredData = getFilteredClienti();

  // --- Grafico: Distribuzione Età ---
  const ageCounts = {};
  filteredData.forEach((cliente) => {
    const age = cliente.eta;
    ageCounts[age] = (ageCounts[age] || 0) + 1;
  });
  const uniqueAgesForChart = Object.keys(ageCounts)
    .map(Number)
    .sort((a, b) => a - b);
  const ageCountsArray = uniqueAgesForChart.map((age) => ageCounts[age]);
  const ageData = {
    labels: uniqueAgesForChart,
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
        // Qui potresti gestire, ad esempio, la selezione di un singolo valore
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
  filteredData.forEach((cliente) => {
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
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8e44ad',
          '#2980b9',
          '#27ae60',
          '#e67e22',
          '#e74c3c',
          '#1abc9c',
          '#f1c40f',
          '#2ecc71',
        ],
      },
    ],
  };
  const pieOptions = {
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const prof = chart.data.labels[index];
        setSelectedProfession(prof);
      }
    },
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  // --- Grafico: Distribuzione Reddito ---
  const incomeCounts = new Array(incomeLabels.length).fill(0);
  filteredData.forEach((cliente) => {
    const income = cliente.reddito;
    const binIdx = incomeBins.findIndex(
      (bound, idx) =>
        idx < incomeBins.length - 1 &&
        income >= bound &&
        income < incomeBins[idx + 1]
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
      }
    },
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Fascia di Reddito' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true },
    },
  };

  // --- Grafico: Distribuzione Propensione Acquisto Prodotti Vita ---
  const propVitaCounts = new Array(propVitaLabels.length).fill(0);
  filteredData.forEach((cliente) => {
    const prop = Number(cliente.propensione_acquisto_prodotti_vita);
    if (!isNaN(prop)) {
      const binIdx = propVitaBins.findIndex(
        (bound, idx) =>
          idx < propVitaBins.length - 1 &&
          prop >= bound &&
          prop < propVitaBins[idx + 1]
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
      }
    },
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Intervallo di Propensione (Vita)' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true },
    },
  };

  // --- Grafico: Distribuzione Propensione Acquisto Prodotti Danni ---
  const propDanniCounts = new Array(propDanniLabels.length).fill(0);
  filteredData.forEach((cliente) => {
    const prop = Number(cliente.propensione_acquisto_prodotti_danni);
    if (!isNaN(prop)) {
      const binIdx = propDanniBins.findIndex(
        (bound, idx) =>
          idx < propDanniBins.length - 1 &&
          prop >= bound &&
          prop < propDanniBins[idx + 1]
      );
      if (binIdx !== -1) {
        propDanniCounts[binIdx]++;
      }
    }
  });
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
    // for eta, reset to min and max values
    if (clienti.length) {
      const ages = clienti.map((cliente) => cliente.eta);
      const minAge = Math.min(...ages);
      const maxAge = Math.max(...ages);
      setSelectedAgeRange([minAge, maxAge]);
    }
    setSelectedProfession(null);
    setSelectedIncomeBin(null);
    setSelectedPropRange(null);
    setSelectedPropDanni(null);
  };

  return (
    <DashboardContainer>
      {(selectedAgeRange !== null ||
        selectedProfession !== null ||
        selectedIncomeBin !== null ||
        selectedPropRange !== null ||
        selectedPropDanni !== null) && (
          <ResetButton onClick={resetFilters}>Mostra tutti i dati</ResetButton>
        )}
      
      <MainContainer>
        {/* Area dei grafici */}
        <ChartsContainer>
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Distribuzione Età</h3>
              <Bar data={ageData} options={ageOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Distribuzione Professioni {selectedProfession ? `(Professione: ${selectedProfession})` : ''}
              </h3>
              <PieWrapper>
                <Pie data={pieData} options={pieOptions} />
              </PieWrapper>
            </ChartColumn>
          </ChartRow>
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Distribuzione Reddito {selectedIncomeBin ? `(Fascia: ${selectedIncomeBin})` : ''}
              </h3>
              <Bar data={incomeData} options={incomeOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Propensione all'Acquisto (Prodotti Vita){' '}
                {selectedPropRange ? `(Intervallo: ${selectedPropRange})` : ''}
              </h3>
              <Bar data={propVitaData} options={propVitaOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Propensione all'Acquisto (Prodotti Danni){' '}
                {selectedPropDanni ? `(Intervallo: ${selectedPropDanni})` : ''}
              </h3>
              <Bar data={propDanniData} options={propDanniOptions} />
            </ChartColumn>
          </ChartRow>
        </ChartsContainer>

        {/* Pannello dei filtri */}
        <FilterContainer>
          <FilterPanel
            clienti={clienti}
            selectedAgeRange={selectedAgeRange}
            setSelectedAgeRange={setSelectedAgeRange}
            selectedProfession={selectedProfession}
            setSelectedProfession={setSelectedProfession}
            selectedIncomeBin={selectedIncomeBin}
            setSelectedIncomeBin={setSelectedIncomeBin}
            selectedPropRange={selectedPropRange}
            setSelectedPropRange={setSelectedPropRange}
            selectedPropDanni={selectedPropDanni}
            setSelectedPropDanni={setSelectedPropDanni}
            resetFilters={resetFilters}
            incomeLabels={incomeLabels}
            propVitaLabels={propVitaLabels}
            propDanniLabels={propDanniLabels}
          />
        </FilterContainer>
      </MainContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
