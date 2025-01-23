import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Bar, Pie } from 'react-chartjs-2';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Styled Components
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

const ChartRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 2rem;
`;

const ChartColumn = styled.div`
  flex: 1;
  min-width: 300px;
  height: 400px;
`;

const PieWrapper = styled.div`
  width: 100%; 
  height: 400px; 
  margin: 0 auto;
`;

const ResetButton = styled.button`
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

const ExtraChartsButton = styled.button`
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

const TopButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FirstRowContainer = styled.div`
  margin-bottom: 2rem;
`;

const SecondRowContainer = styled.div`
  margin-bottom: 2rem;
`;

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;
const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  width: 60%;        
  max-height: 75%;      
  overflow-y: auto;
  z-index: 1001;
`;

const handleCheckboxChange = (e, value, selectedArray, setSelectedArray) => {
  if (e.target.checked) {
    if (!selectedArray.includes(value)) {
      setSelectedArray([...selectedArray, value]);
    }
  } else {
    setSelectedArray(selectedArray.filter(item => item !== value));
  }
};

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
  const uniqueAges = [...new Set(clienti.map(cliente => cliente.eta))].sort((a, b) => a - b);
  const uniqueProfessions = [...new Set(clienti.map(cliente => cliente.professione))].filter(Boolean);

  return (
    <div>
      {/* Slider per l'età */}
      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Età:</strong></label>
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

      {/* Checkbox per Professione */}
      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Professione:</strong></label>
        <br />
        {uniqueProfessions.map(prof => (
          <div key={prof}>
            <input
              type="checkbox"
              id={`prof-${prof}`}
              checked={selectedProfession.includes(prof)}
              onChange={(e) => handleCheckboxChange(e, prof, selectedProfession, setSelectedProfession)}
            />
            <label htmlFor={`prof-${prof}`}>{prof}</label>
          </div>
        ))}
      </div>

      {/* Checkbox per Reddito */}
      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Reddito:</strong></label>
        <br />
        {incomeLabels.map(label => (
          <div key={label}>
            <input
              type="checkbox"
              id={`income-${label}`}
              checked={selectedIncomeBin.includes(label)}
              onChange={(e) => handleCheckboxChange(e, label, selectedIncomeBin, setSelectedIncomeBin)}
            />
            <label htmlFor={`income-${label}`}>{label}</label>
          </div>
        ))}
      </div>

      {/* Checkbox per Propensione Prodotti Vita */}
      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Propensione Prodotti Vita:</strong></label>
        <br />
        {propVitaLabels.map(label => (
          <div key={label}>
            <input
              type="checkbox"
              id={`propVita-${label}`}
              checked={selectedPropRange.includes(label)}
              onChange={(e) => handleCheckboxChange(e, label, selectedPropRange, setSelectedPropRange)}
            />
            <label htmlFor={`propVita-${label}`}>{label}</label>
          </div>
        ))}
      </div>

      {/* Checkbox per Propensione Prodotti Danni */}
      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Propensione Prodotti Danni:</strong></label>
        <br />
        {propDanniLabels.map(label => (
          <div key={label}>
            <input
              type="checkbox"
              id={`propDanni-${label}`}
              checked={selectedPropDanni.includes(label)}
              onChange={(e) => handleCheckboxChange(e, label, selectedPropDanni, setSelectedPropDanni)}
            />
            <label htmlFor={`propDanni-${label}`}>{label}</label>
          </div>
        ))}
      </div>

      <ResetButton onClick={resetFilters}>Reset Filtri</ResetButton>
    </div>
  );
};

const Dashboard = () => {
  // Define the bins for the propensione ranges
  const propVitaBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];
  const propDanniBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];

  const [clienti, setClienti] = useState([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState([]);
  const [selectedIncomeBin, setSelectedIncomeBin] = useState([]);
  const [selectedPropRange, setSelectedPropRange] = useState([]);
  const [selectedPropDanni, setSelectedPropDanni] = useState([]);
  const [showExtraCharts, setShowExtraCharts] = useState(false);

  const incomeBins = [0, 20000, 40000, 60000, 80000, 100000, 120000, Infinity];
  const incomeLabels = incomeBins.slice(0, -1).map((bin, idx) => {
    const upper = incomeBins[idx + 1] === Infinity ? '+' : incomeBins[idx + 1];
    return `${bin}-${upper}`;
  });
  const propVitaLabels = ['0 - 0.20', '0.21 - 0.40', '0.41 - 0.60', '0.61 - 0.80', '0.81 - 1'];
  const propDanniLabels = ['0 - 0.20', '0.21 - 0.40', '0.41 - 0.60', '0.61 - 0.80', '0.81 - 1'];

  // Retrieve the clients for the main charts
  useEffect(() => {
    const fetchClienti = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clienti`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        setClienti(data);
        if (data.length > 0) {
          const ages = data.map(cliente => cliente.eta);
          setSelectedAgeRange([Math.min(...ages), Math.max(...ages)]);
        }
      } catch (error) {
        console.error("Errore nel recupero dei clienti:", error);
      }
    };
    fetchClienti();
  }, []);

  // Retrieve the policies for the extra charts
  const [polizze, setPolizze] = useState([]);
  useEffect(() => {
    const fetchPolizze = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/polizze`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        setPolizze(data);
      } catch (error) {
        console.error("Errore nel recupero delle polizze:", error);
      }
    };
    fetchPolizze();
  }, []);

  // Filter the clients based on the selected filters
  const getFilteredClienti = () => {
    let data = clienti;
    if (selectedAgeRange) {
      data = data.filter(cliente =>
        cliente.eta >= selectedAgeRange[0] && cliente.eta <= selectedAgeRange[1]
      );
    }
    if (selectedProfession.length > 0) {
      data = data.filter(cliente => selectedProfession.includes(cliente.professione));
    }
    if (selectedIncomeBin.length > 0) {
      data = data.filter(cliente =>
        selectedIncomeBin.some(binStr => {
          const parts = binStr.split('-');
          const low = Number(parts[0]);
          const high = parts[1] === '+' ? Infinity : Number(parts[1]);
          return cliente.reddito >= low && (high === Infinity ? true : cliente.reddito < high);
        })
      );
    }
    if (selectedPropRange.length > 0) {
      data = data.filter(cliente =>
        selectedPropRange.some(rangeStr => {
          const [lowStr, highStr] = rangeStr.split('-').map(s => s.trim());
          const low = Number(lowStr);
          const high = Number(highStr);
          return Number(cliente.propensione_acquisto_prodotti_vita) >= low &&
                 Number(cliente.propensione_acquisto_prodotti_vita) < high;
        })
      );
    }
    if (selectedPropDanni.length > 0) {
      data = data.filter(cliente =>
        selectedPropDanni.some(rangeStr => {
          const [lowStr, highStr] = rangeStr.split('-').map(s => s.trim());
          const low = Number(lowStr);
          const high = Number(highStr);
          return Number(cliente.propensione_acquisto_prodotti_danni) >= low &&
                 Number(cliente.propensione_acquisto_prodotti_danni) < high;
        })
      );
    }
    return data;
  };

  const filteredClienti = getFilteredClienti();

  // Grafico: Distribuzione Età
  const ageCounts = {};
  filteredClienti.forEach(cliente => {
    ageCounts[cliente.eta] = (ageCounts[cliente.eta] || 0) + 1;
  });
  const uniqueAgesForChart = Object.keys(ageCounts).map(Number).sort((a, b) => a - b);
  const ageCountsArray = uniqueAgesForChart.map(age => ageCounts[age]);
  const ageData = {
    labels: uniqueAgesForChart || [],
    datasets: [{
      label: 'Numero di clienti',
      data: ageCountsArray || [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };
  const ageOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false }, 
      title: { display: false } 
    },
    scales: {
      x: { title: { display: true, text: 'Età' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true }
    }
  };

  // Grafico: Distribuzione Professioni
  const professionCounts = {};
  filteredClienti.forEach(cliente => {
    if (cliente.professione) {
      professionCounts[cliente.professione] = (professionCounts[cliente.professione] || 0) + 1;
    }
  });
  const pieData = {
    labels: Object.keys(professionCounts),
    datasets: [{
      data: Object.values(professionCounts),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#2980b9',
        '#27ae60', '#e67e22', '#e74c3c', '#1abc9c', '#f1c40f', '#2ecc71'
      ]
    }]
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 15,
        }
      }, 
      title: { display: false } 
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const profession = chart.data.labels[index];
        setSelectedProfession(prev =>
          prev.includes(profession)
            ? prev.filter(p => p !== profession)
            : [...prev, profession]
        );
      }
    }
  };

  // Grafico: Distribuzione Reddito
  const incomeCounts = new Array(incomeLabels.length).fill(0);
  filteredClienti.forEach(cliente => {
    const income = cliente.reddito;
    const binIdx = incomeBins.findIndex((bound, idx) =>
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
    datasets: [{
      label: 'Numero di clienti',
      data: incomeCounts,
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    }]
  };
  const incomeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      title: { display: false } 
    },
    scales: {
      x: { title: { display: true, text: 'Fascia di Reddito' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const bin = chart.data.labels[index];
        setSelectedIncomeBin(prev =>
          prev.includes(bin)
            ? prev.filter(b => b !== bin)
            : [...prev, bin]
        );
      }
    }
  };

  // Grafico: Distribuzione Propensione Prodotti Vita
  const propVitaCounts = new Array(propVitaLabels.length).fill(0);
  filteredClienti.forEach(cliente => {
    const prop = Number(cliente.propensione_acquisto_prodotti_vita);
    if (!isNaN(prop)) {
      const binIdx = propVitaBins.findIndex((bound, idx) =>
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
    datasets: [{
      label: 'Prodotti Vita',
      data: propVitaCounts,
      backgroundColor: ['#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    }]
  };
  const propVitaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      title: { display: false } 
    },
    scales: {
      x: { title: { display: true, text: 'Intervallo di Propensione (Vita)' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const range = chart.data.labels[index];
        setSelectedPropRange(prev =>
          prev.includes(range)
            ? prev.filter(r => r !== range)
            : [...prev, range]
        );
      }
    }
  };

  // Grafico: Distribuzione Propensione Prodotti Danni
  const propDanniCounts = new Array(propDanniLabels.length).fill(0);
  filteredClienti.forEach(cliente => {
    const prop = Number(cliente.propensione_acquisto_prodotti_danni);
    if (!isNaN(prop)) {
      const binIdx = propDanniBins.findIndex((bound, idx) =>
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
    datasets: [{
      label: 'Prodotti Danni',
      data: propDanniCounts,
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#27ae60'],
    }]
  };
  const propDanniOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false }, 
      title: { display: false } 
    },
    scales: {
      x: { title: { display: true, text: 'Intervallo di Propensione (Danni)' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const range = chart.data.labels[index];
        setSelectedPropDanni(prev =>
          prev.includes(range)
            ? prev.filter(r => r !== range)
            : [...prev, range]
        );
      }
    }
  };

  // Filter the policies based on the selected clients
  const getFilteredPolizze = () => {
    return polizze.filter(polizza =>
      filteredClienti.some(cliente => cliente.codice_cliente === polizza.codice_cliente)
    );
  };

  // Aggregate data from extra policies by product and need area
  const aggregatedProducts = {};
  const aggregatedAreas = {};
  getFilteredPolizze().forEach(polizza => {
    if (polizza.prodotto) {
      aggregatedProducts[polizza.prodotto] = (aggregatedProducts[polizza.prodotto] || 0) + 1;
    }
    if (polizza.area_di_bisogno) {
      aggregatedAreas[polizza.area_di_bisogno] = (aggregatedAreas[polizza.area_di_bisogno] || 0) + 1;
    }
  });

  const productsColors = ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#27ae60'];
  const areasColors = ['#FF6384', '#36A2EB', '#FFCE56'];

  const extraProductsData = {
    labels: Object.keys(aggregatedProducts),
    datasets: [{
      label: 'Prodotti',
      data: Object.values(aggregatedProducts),
      backgroundColor: Object.keys(aggregatedProducts).map((_, idx) =>
        productsColors[idx % productsColors.length]
      )
    }]
  };

  const extraAreasData = {
    labels: Object.keys(aggregatedAreas),
    datasets: [{
      label: 'Aree di bisogno',
      data: Object.values(aggregatedAreas),
      backgroundColor: Object.keys(aggregatedAreas).map((_, idx) =>
        areasColors[idx % areasColors.length]
      )
    }]
  };

  const extraOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      title: { display: false } 
    }
  };

  const resetFiltersAndExtra = () => {
    if (clienti.length) {
      const ages = clienti.map(cliente => cliente.eta);
      setSelectedAgeRange([Math.min(...ages), Math.max(...ages)]);
    }
    setSelectedProfession([]);
    setSelectedIncomeBin([]);
    setSelectedPropRange([]);
    setSelectedPropDanni([]);
    setShowExtraCharts(false);
  };

  return (
    <DashboardContainer>
      <TopButtonsContainer>
        {(selectedAgeRange ||
          selectedProfession.length > 0 ||
          selectedIncomeBin.length > 0 ||
          selectedPropRange.length > 0 ||
          selectedPropDanni.length > 0) && (
            <ResetButton onClick={resetFiltersAndExtra}>
              Mostra tutti i dati
            </ResetButton>
        )}
        <ExtraChartsButton onClick={() => setShowExtraCharts(true)}>
          Mostra Proporzioni Prodotti/Aree di Bisogno
        </ExtraChartsButton>
      </TopButtonsContainer>

      {/* Modal per i grafici extra */}
      {showExtraCharts && (
        <ModalOverlay onClick={() => setShowExtraCharts(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ResetButton onClick={() => setShowExtraCharts(false)}>Chiudi</ResetButton>
            <ChartRow>
              <ChartColumn>
                <h3 style={{ textAlign: 'center' }}>Prodotti</h3>
                <Pie data={extraProductsData} options={extraOptions} />
              </ChartColumn>
              <ChartColumn>
                <h3 style={{ textAlign: 'center' }}>Aree di Bisogno</h3>
                <Bar data={extraAreasData} options={extraOptions} />
              </ChartColumn>
            </ChartRow>
          </ModalContent>
        </ModalOverlay>
      )}

      <MainContainer>
        {/* Grafici principali */}
        <ChartsContainer>
          {/* Prima Riga di Grafici */}
          <FirstRowContainer>
            <ChartRow>
              <ChartColumn>
                <h3 style={{ textAlign: 'center' }}>Distribuzione Età</h3>
                <Bar data={ageData} options={ageOptions} />
              </ChartColumn>
              <ChartColumn>
                <h3 style={{ textAlign: 'center' }}>Distribuzione Professioni</h3>
                <PieWrapper>
                  <Pie data={pieData} options={pieOptions} />
                </PieWrapper>
              </ChartColumn>
            </ChartRow>
          </FirstRowContainer>

          {/* Seconda Riga di Grafici */}
          <SecondRowContainer>
            <ChartRow>
              <ChartColumn>
                <h3 style={{ textAlign: 'center' }}>Distribuzione Reddito</h3>
                <Bar data={incomeData} options={incomeOptions} />
              </ChartColumn>
              <ChartColumn>
                <h3 style={{ textAlign: 'center' }}>Propensione all'Acquisto (Prodotti Vita)</h3>
                <Bar data={propVitaData} options={propVitaOptions} />
              </ChartColumn>
              <ChartColumn>
                <h3 style={{ textAlign: 'center' }}>Propensione all'Acquisto (Prodotti Danni)</h3>
                <Bar data={propDanniData} options={propDanniOptions} />
              </ChartColumn>
            </ChartRow>
          </SecondRowContainer>
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
            resetFilters={resetFiltersAndExtra}
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
