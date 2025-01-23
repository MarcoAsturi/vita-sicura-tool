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

// ------ API Fetching and Memoization ------

const PolizzeDashboard = () => {
  // State for API data
  const [polizze, setPolizze] = useState([]);
  const [reclami, setReclami] = useState([]);
  const [sinistri, setSinistri] = useState([]);

  // Fetch API calls only once
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
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // ------ Data Processing for Charts ------

  // Memoize policies per product
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
          label: 'Numero di polizze per prodotto',
          data: Object.values(data),
          backgroundColor: 'rgba(54, 235, 114, 0.6)',
        }
      ]
    };
  }, [polizze]);

  // Memoize policies per need area
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
          label: 'Policies per Need Area',
          data: Object.values(data),
          backgroundColor: bgColors.slice(0, Object.keys(data).length),
        }
      ]
    };
  }, [polizze]);

  // Complaints per product
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
          label: 'Reclami per prodotto',
          data: Object.values(data),
          backgroundColor: 'rgba(138, 118, 54, 0.6)',
        }
      ]
    };
  }, [reclami]);

  // Claims per product
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
          label: 'Sinistri per prodotto',
          data: Object.values(data),
          backgroundColor: 'rgba(199, 54, 235, 0.6)',
        }
      ]
    };
  }, [sinistri]);

  // Common chart options
  const commonOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: false } },
  };

  // ------ Extra Charts (Modal) ------
  // Aggregate data from extra policies by product and need area
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

  // 5 colors for products and 3 for areas
  const productsColors = ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#27ae60'];
  const areasColors = ['#FF6384', '#36A2EB', '#FFCE56'];

  const extraProductsData = useMemo(() => ({
    labels: Object.keys(aggregatedProducts),
    datasets: [{
      label: 'Products',
      data: Object.values(aggregatedProducts),
      backgroundColor: Object.keys(aggregatedProducts).map((_, idx) =>
        productsColors[idx % productsColors.length]
      )
    }]
  }), [aggregatedProducts]);

  const extraAreasData = useMemo(() => ({
    labels: Object.keys(aggregatedAreas),
    datasets: [{
      label: 'Need Areas',
      data: Object.values(aggregatedAreas),
      backgroundColor: Object.keys(aggregatedAreas).map((_, idx) =>
        areasColors[idx % areasColors.length]
      )
    }]
  }), [aggregatedAreas]);

  // Extra chart options
  const extraOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: false } },
  };

  // ------ Modal State and Functions ------
  const [showExtraCharts, setShowExtraCharts] = useState(false);
  const resetFiltersAndExtra = () => {
    setShowExtraCharts(false);
  };

  return (
    <DashboardContainer>

      <MainContainer>
        {/* Main Charts */}
        <ChartsContainer>
          {/* First Row: Policies per Product and per Need Area */}
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Polizze per prodotto</h3>
              <Bar data={polizzeProdottoData} options={commonOptions} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Polizze per area di bisogno</h3>
              <PieWrapper>
                <Pie data={polizzeAreaData} options={commonOptions} />
              </PieWrapper>
            </ChartColumn>
          </ChartRow>
          {/* Second Row: Complaints and Claims per Product */}
          <ChartRow>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Reclami per prodotto</h3>
              <Bar data={reclamiData} options={{
                ...commonOptions,
                scales: {
                  y: { title: { display: true, text: 'Numero di sinistri' }, beginAtZero: true }
                },
                onClick: (event, elements, chart) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const prodotto = chart.data.labels[index];
                    console.log("Filter applied on Complaints: Product =", prodotto);
                  }
                }
              }} />
            </ChartColumn>
            <ChartColumn>
              <h3 style={{ textAlign: 'center' }}>Sinistri per prodotto</h3>
              <Bar data={sinistriData} options={{
                ...commonOptions,
                scales: {
                  y: { title: { display: true, text: 'Numero di reclami' }, beginAtZero: true }
                },
                onClick: (event, elements, chart) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const prodotto = chart.data.labels[index];
                    console.log("Filter applied on Claims: Product =", prodotto);
                  }
                }
              }} />
            </ChartColumn>
          </ChartRow>
        </ChartsContainer>
      </MainContainer>
    </DashboardContainer>
  );
};

export default PolizzeDashboard;
