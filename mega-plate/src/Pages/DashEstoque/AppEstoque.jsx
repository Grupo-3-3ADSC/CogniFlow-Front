export default App;import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import './styleEstoque.css';
import NavBar from '../../components/NavBar';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredStockItems, setFilteredStockItems] = useState([]);

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

  // Dados de exemplo para a tabela de estoque
  const stockData = [
    { material: 'SAE 1020', quantidade: 250, largura: '1.5m', espessura: '2mm', fornecedor: 'Fornecedor 1', data: '28/04/2025', hora: '08:30' },
    { material: 'SAE 1045', quantidade: 175, largura: '2.0m', espessura: '3mm', fornecedor: 'Fornecedor 2', data: '27/04/2025', hora: '14:15' },
    { material: 'HARDOX 450', quantidade: 120, largura: '1.8m', espessura: '4mm', fornecedor: 'Fornecedor 3', data: '26/04/2025', hora: '10:45' },
    { material: 'SAE 1020', quantidade: 300, largura: '2.2m', espessura: '2.5mm', fornecedor: 'Fornecedor 4', data: '25/04/2025', hora: '16:20' },
    { material: 'SAE 1045', quantidade: 200, largura: '1.6m', espessura: '3.5mm', fornecedor: 'Fornecedor 5', data: '24/04/2025', hora: '09:00' },
    { material: 'SAE 1048', quantidade: 200, largura: '1.6m', espessura: '3.5mm', fornecedor: 'Fornecedor 5', data: '24/04/2025', hora: '09:00' },
    { material: 'SAE 1046', quantidade: 200, largura: '1.6m', espessura: '3.5mm', fornecedor: 'Fornecedor 5', data: '24/04/2025', hora: '09:00' },
  ];

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const handleSearch = () => {
    const filtered = stockData.filter(item => {
      const itemDate = parseDate(item.data);
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      const materialMatch = !selectedMaterial || item.material === selectedMaterial;
      const dateInRange = (!startDateObj || itemDate >= startDateObj) &&
                          (!endDateObj || itemDate <= endDateObj);
      const searchMatch = !searchTerm ||
        item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());

      return materialMatch && dateInRange && searchMatch;
    });

    setFilteredStockItems(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedMaterial, startDate, endDate]);

  useEffect(() => {
    setFilteredStockItems(stockData);
  }, []);

  return (
    <div className='IndexFornecedor'>
      <NavBar />

      <div className="container">
        <div className="filter-header">
          <select
            id="select-Filtro-Estoque" 
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
            <input class='inputEstoque'
              type="date" 
              id="dateInput" 
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>

          <div id='FiltroData'>
            <span id='textFiltro'><h5>Fim:</h5></span>
            <input class='inputEstoque'
              type="date" 
              id="dateInput" 
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Pesquisar material ou fornecedor..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <div className="search-icon" onClick={handleSearch}>
              <Search size={18} color="#ffffff" />
            </div>
          </div>
        </div>

        <div className="containerDash">
          <div className="supplier-table-container">
            <h3>Tabela de Estoque</h3>
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Largura</th>
                  <th>Espessura</th>
                  <th>Fornecedor</th>
                  <th>Data</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {filteredStockItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.material}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.largura}</td>
                    <td>{item.espessura}</td>
                    <td>{item.fornecedor}</td>
                    <td>{item.data}</td>
                    <td>{item.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="search-results">
              <p>{filteredStockItems.length} itens encontrados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}