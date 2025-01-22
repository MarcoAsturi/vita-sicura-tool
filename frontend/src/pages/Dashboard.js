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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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
`;

const PieWrapper = styled.div`
  width: 420px;
  height: 420px;
  margin: 0 auto;
`;

const ExtraChartsContainer = styled.div`
  margin-top: 2rem;
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

const ToggleExtraChartsButton = styled.button`
  display: block;
  margin: 1rem auto;
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

// Funzione helper per la gestione dei checkbox
const handleCheckboxChange = (e, value, selectedArray, setSelectedArray) => {
  if (e.target.checked) {
    // Se non ancora selezionato, aggiunge
    if (!selectedArray.includes(value)) {
      setSelectedArray([...selectedArray, value]);
    }
  } else {
    // Rimuove l'opzione
    setSelectedArray(selectedArray.filter(item => item !== value));
  }
};

// Componente FilterPanel con checkbox e slider per età
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
  // Calcola età min e max e opzioni per professione
  const uniqueAges = [...new Set(clienti.map(cliente => cliente.eta))].sort((a, b) => a - b);
  const uniqueProfessions = [...new Set(clienti.map(cliente => cliente.professione))].filter(Boolean);

  return (
    <div>
      {/* Filtro per età con slider */}
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
      
      {/* Filtro per Professione con checkbox */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Professione:</label>
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
      
      {/* Filtro per Reddito con checkbox */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Reddito:</label>
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

      {/* Filtro per Propensione Prodotti Vita con checkbox */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Propensione Prodotti Vita:</label>
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

      {/* Filtro per Propensione Prodotti Danni con checkbox */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Propensione Prodotti Danni:</label>
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
  const [clienti, setClienti] = useState([]);
  // Stato per lo slider (range età) e per i filtri multi-selezione (come array)
  const [selectedAgeRange, setSelectedAgeRange] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState([]);
  const [selectedIncomeBin, setSelectedIncomeBin] = useState([]);
  const [selectedPropRange, setSelectedPropRange] = useState([]);
  const [selectedPropDanni, setSelectedPropDanni] = useState([]);
  
  // Stato per mostrare i grafici extra (proporzioni prodotti e aree di bisogno)
  const [showExtraCharts, setShowExtraCharts] = useState(false);
  
  // Dati per i filtri
  const incomeBins = [0, 20000, 40000, 60000, 80000, 100000, 120000, Infinity];
  const incomeLabels = incomeBins.slice(0, -1).map((bin, idx) => {
    const upper = incomeBins[idx + 1] === Infinity ? '+' : incomeBins[idx + 1];
    return `${bin}-${upper}`;
  });
  const propVitaBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];
  const propVitaLabels = ['0 - 0.20', '0.21 - 0.40', '0.41 - 0.60', '0.61 - 0.80', '0.81 - 1'];
  const propDanniBins = [0, 0.21, 0.41, 0.61, 0.81, 1.01];
  const propDanniLabels = ['0 - 0.20', '0.21 - 0.40', '0.41 - 0.60', '0.61 - 0.80', '0.81 - 1'];

  // Recupera i dati dei clienti
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

  // Recupera i dati delle polizze per i grafici extra
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

  // Filtraggio dei clienti
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

  // --- Grafico: Distribuzione Età ---
  const ageCounts = {};
  filteredClienti.forEach(cliente => {
    ageCounts[cliente.eta] = (ageCounts[cliente.eta] || 0) + 1;
  });
  const uniqueAgesForChart = Object.keys(ageCounts).map(Number).sort((a, b) => a - b);
  const ageCountsArray = uniqueAgesForChart.map(age => ageCounts[age]);
  const ageData = {
    labels: uniqueAgesForChart,
    datasets: [{
      label: 'Numero di clienti',
      data: ageCountsArray,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };
  const ageOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Età' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        // TODO: add click event handling
      }
    }
  };

  // --- Grafico: Distribuzione Professioni ---
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
    plugins: { legend: { position: 'bottom' } },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const profession = chart.data.labels[index];
        // Se già selezionata, rimuovila; altrimenti aggiungila
        setSelectedProfession(prev => 
          prev.includes(profession)
            ? prev.filter(p => p !== profession)
            : [...prev, profession]
        );
      }
    }
  };

  // --- Grafico: Distribuzione Reddito ---
  const incomeCounts = new Array(incomeLabels.length).fill(0);
  filteredClienti.forEach(cliente => {
    const income = cliente.reddito;
    const binIdx = incomeBins.findIndex((bound, idx) =>
      idx < incomeBins.length - 1 &&
      income >= bound && income < incomeBins[idx + 1]
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
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Fascia di Reddito' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const bin = chart.data.labels[index];
        // Toggle per il filtro Reddito
        setSelectedIncomeBin(prev => 
          prev.includes(bin)
            ? prev.filter(b => b !== bin)
            : [...prev, bin]
        );
      }
    }
  };

  // --- Grafico: Distribuzione Propensione Prodotti Vita ---
  const propVitaCounts = new Array(propVitaLabels.length).fill(0);
  filteredClienti.forEach(cliente => {
    const prop = Number(cliente.propensione_acquisto_prodotti_vita);
    if (!isNaN(prop)) {
      const binIdx = propVitaBins.findIndex((bound, idx) =>
        idx < propVitaBins.length - 1 &&
        prop >= bound && prop < propVitaBins[idx + 1]
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
    plugins: { legend: { position: 'top' }, title: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Intervallo di Propensione (Vita)' } },
      y: { title: { display: true, text: 'Numero di clienti' }, beginAtZero: true }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const range = chart.data.labels[index];
        // Toggle per il filtro Propensione Vita
        setSelectedPropRange(prev =>
          prev.includes(range)
            ? prev.filter(r => r !== range)
            : [...prev, range]
        );
      }
    }
  };

  // --- Grafico: Distribuzione Propensione Prodotti Danni ---
  const propDanniCounts = new Array(propDanniLabels.length).fill(0);
  filteredClienti.forEach(cliente => {
    const prop = Number(cliente.propensione_acquisto_prodotti_danni);
    if (!isNaN(prop)) {
      const binIdx = propDanniBins.findIndex((bound, idx) =>
        idx < propDanniBins.length - 1 &&
        prop >= bound && prop < propDanniBins[idx + 1]
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
    plugins: { legend: { position: 'top' }, title: { display: false } },
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

  // Funzione per filtrare anche le polizze in base ai clienti filtrati
  const getFilteredPolizze = () => {
    // Considera solo le polizze relative a clienti filtrati
    return polizze.filter(polizza =>
      filteredClienti.some(cliente => cliente.codice_cliente === polizza.codice_cliente)
    );
  };

  // Aggrega i dati delle polizze per prodotto e per area di bisogno
  const aggregatedProducts = {};
  const aggregatedAreas = {};
  getFilteredPolizze().forEach(polizza => {
    // Aggregazione per prodotto
    if (polizza.prodotto) {
      aggregatedProducts[polizza.prodotto] = (aggregatedProducts[polizza.prodotto] || 0) + 1;
    }
    // Aggregazione per area di bisogno
    if (polizza.area_di_bisogno) {
      aggregatedAreas[polizza.area_di_bisogno] = (aggregatedAreas[polizza.area_di_bisogno] || 0) + 1;
    }
  });
  
  // Prepara dati e opzioni per i grafici extra
  // Array di 5 colori per i prodotti
  const productsColors = ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#27ae60'];

  // Array di 3 colori per le aree di bisogno
  const areasColors = ['#FF6384', '#36A2EB', '#FFCE56'];

  // Prepara dati e opzioni per i grafici extra
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
    plugins: { legend: { position: 'top' }, title: { display: false } }
  };

  const resetFiltersAndExtra = () => {
    // Reset filtri
    if (clienti.length) {
      const ages = clienti.map(cliente => cliente.eta);
      setSelectedAgeRange([Math.min(...ages), Math.max(...ages)]);
    }
    setSelectedProfession([]);
    setSelectedIncomeBin([]);
    setSelectedPropRange([]);
    setSelectedPropDanni([]);
    // Nascondi grafici extra
    setShowExtraCharts(false);
  };

  return (
    <DashboardContainer>
      {(selectedAgeRange ||
        selectedProfession.length > 0 ||
        selectedIncomeBin.length > 0 ||
        selectedPropRange.length > 0 ||
        selectedPropDanni.length > 0) && (
        <ResetButton onClick={resetFiltersAndExtra}>Mostra tutti i dati</ResetButton>
      )}
      <MainContainer>
        {/* Area dei grafici principali */}
        <ChartsContainer>
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Distribuzione Età</h3>
              <Bar data={ageData} options={ageOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Distribuzione Professioni {selectedProfession.length > 0 ? `(Professione: ${selectedProfession.join(', ')})` : ''}
              </h3>
              <PieWrapper>
                <Pie data={pieData} options={pieOptions} />
              </PieWrapper>
            </ChartColumn>
          </ChartRow>
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Distribuzione Reddito {selectedIncomeBin.length > 0 ? `(Fascia: ${selectedIncomeBin.join(', ')})` : ''}
              </h3>
              <Bar data={incomeData} options={incomeOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Propensione all'Acquisto (Prodotti Vita){' '}
                {selectedPropRange.length > 0 ? `(Intervallo: ${selectedPropRange.join(', ')})` : ''}
              </h3>
              <Bar data={propVitaData} options={propVitaOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>
                Propensione all'Acquisto (Prodotti Danni){' '}
                {selectedPropDanni.length > 0 ? `(Intervallo: ${selectedPropDanni.join(', ')})` : ''}
              </h3>
              <Bar data={propDanniData} options={propDanniOptions} />
            </ChartColumn>
          </ChartRow>
          {/* Pulsante per mostrare/nascondere i grafici extra */}
          <ToggleExtraChartsButton onClick={() => setShowExtraCharts(!showExtraCharts)}>
            {showExtraCharts ? 'Nascondi Proporzioni Prodotti/Aree di Bisogno' : 'Mostra Proporzioni Prodotti/Aree di Bisogno'}
          </ToggleExtraChartsButton>
          {showExtraCharts && (
            <ExtraChartsContainer>
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
            </ExtraChartsContainer>
          )}
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
