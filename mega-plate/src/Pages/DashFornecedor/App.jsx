import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import { Search } from 'lucide-react';
import './styleFornecedor.css';
import NavBar from '../../components/NavBar';


function App() {
  const [userPhoto, setUserPhoto] = useState('/images/User.png');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMaterialChange = (e) => {
    setSelectedMaterial(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const pieData = [
    ['Material', 'Quantidade'],
    ['Material A', 45],
    ['Material B', 30],
    ['Material C', 25],
  ];

  const barData = [
    ['Mês', 'Produção', 'Meta'],
    ['Jan', 1000, 1200],
    ['Fev', 1170, 1200],
    ['Mar', 1250, 1200],
    ['Abr', 1330, 1200],
    ['Mai', 1200, 1200],
    ['Jun', 1100, 1200],
  ];

  const lineData = [
    ['Dia', 'Consumo'],
    ['01', 100],
    ['05', 120],
    ['10', 130],
    ['15', 90],
    ['20', 110],
    ['25', 135],
    ['30', 125],
  ];

  const supplierData = [
    { name: 'Fornecedor 1', date: '28/04/2025', time: '08:30', material: 'SAE 1020' },
    { name: 'Fornecedor 2', date: '27/04/2025', time: '14:15', material: 'SAE 1045' },
    { name: 'Fornecedor 3', date: '26/04/2025', time: '10:45', material: 'HARDOX 450' },
    { name: 'Fornecedor 4', date: '25/04/2025', time: '16:20', material: 'SAE 1020' },
    { name: 'Fornecedor 5', date: '24/04/2025', time: '09:00', material: 'SAE 1045' },
  ];

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const handleSearch = () => {
    const filtered = supplierData.filter(supplier => {
      const supplierDate = parseDate(supplier.date);
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      const materialMatch = !selectedMaterial || supplier.material === selectedMaterial;
      const dateInRange = (!startDateObj || supplierDate >= startDateObj) &&
                          (!endDateObj || supplierDate <= endDateObj);
      const nameMatch = !searchTerm ||
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.material.toLowerCase().includes(searchTerm.toLowerCase());

      return materialMatch && dateInRange && nameMatch;
    });

    setFilteredSuppliers(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedMaterial, startDate, endDate]);

  useEffect(() => {
    setFilteredSuppliers(supplierData);
  }, []);

  return (

    
<div className='IndexFornecedor'>
<NavBar />

<div className="container">
      <div id="filtro">
        <div className="filter-header">
          <select 
            id="select-Filtro" 
            value={selectedMaterial} 
            onChange={handleMaterialChange}
          >
            <option value="">Selecione Material</option>
            <option value="SAE 1020">SAE 1020</option>
            <option value="SAE 1045">SAE 1045</option>
            <option value="HARDOX 450">HARDOX 450</option>
          </select>

          <div id='FiltroData'>
            <span id='textFiltro'><h5>Início:</h5></span>
            <input 
              type="date" 
              id="dateInput" 
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>

          <div id='FiltroData'>
            <span id='textFiltro'><h5>Fim:</h5></span>
            <input 
              type="date" 
              id="dateInput" 
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Pesquisar fornecedor..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <div className="search-icon" onClick={handleSearch}>
              <Search size={18} color="#05314C" />
            </div>
          </div>
        </div>
      </div>

      <div className="containerDash">
        <div className="dashboard">
          <h2>Dashboard Material</h2>

          <div id="charts-superior">
            <div id="Kpi">
              <div id="chart-aviso-fornecedor1" className="chart">
                <div className="kpi-title">SAE 1020</div>
                <div className="kpi-subtitle">Fornecedor 1</div>
                <div className="kpi-data">
                  <span>R$ 500,00 / cilindro</span>
                  <span>R$ 800,00 / cilindro</span>
                </div>
              </div>

              <div id="chart-aviso-fornecedor2" className="chart">
                <div className="kpi-title">SAE 1045</div>
                <div className="kpi-subtitle">Fornecedor 2</div>
                <div className="kpi-data">
                  <span>R$ 500,00 / cilindro</span>
                  <span>R$ 800,00 / cilindro</span>
                </div>
              </div>

              <div id="chart-aviso-fornecedor3" className="chart">
                <div className="kpi-title">HARDOX 450</div>
                <div className="kpi-subtitle">Fornecedor 3</div>
                <div className="kpi-data">
                  <span>R$ 500,00 / cilindro</span>
                  <span>R$ 800,00 / cilindro</span>
                </div>
              </div>
            </div>
          </div>

          <div id="charts-inferior">
            <div id="bar_chart" className="chart">
              <Chart
                chartType="ColumnChart"
                data={barData}
                options={{
                  title: 'Produção Mensal',
                  backgroundColor: 'transparent',
                  legend: { textStyle: { color: 'white' } },
                  titleTextStyle: { color: 'white' },
                  hAxis: { textStyle: { color: 'white' } },
                  vAxis: { textStyle: { color: 'white' } },
                  colors: ['#4586AB', '#05314C'],
                }}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>

        <div className="supplier-table-container">
          <h3>Fornecedores</h3>
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Nome do Fornecedor</th>
                <th>Material</th>
                <th>Data</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier, index) => (
                <tr key={index}>
                  <td>{supplier.name}</td>
                  <td>{supplier.material}</td>
                  <td>{supplier.date}</td>
                  <td>{supplier.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="search-results">
            <p>{filteredSuppliers.length} fornecedores encontrados</p>
          </div>
        </div>
      </div>
    </div>
</div>

  
  );
}

export default App;
