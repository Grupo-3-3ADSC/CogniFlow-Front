import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import { Search, X } from 'lucide-react';
import './styleFornecedor.css';
import NavBar from '../../components/NavBar';

// Estilos do Pop-up padronizados com o Dashboard Material
const popupStyles = `
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.popup-content {
  background: linear-gradient(135deg, #05314C 0%, #4586AB 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  color: white;
  border: 2px solid rgba(126, 185, 217, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 2px solid rgba(126, 185, 217, 0.3);
  background: rgba(126, 185, 217, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
}

.popup-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.close-button {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.1);
}

.popup-body {
  padding: 30px;
}

.popup-section {
  margin-bottom: 30px;
}

.popup-section h4 {
  margin: 0 0 20px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  border-bottom: 2px solid #7EB9D9;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.9rem;
  color: #B0C4DE;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 16px;
  background: rgba(126, 185, 217, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(126, 185, 217, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  color: #ffffff;
}

.info-value:hover {
  background: rgba(126, 185, 217, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.status-ontime {
  color: #4ade80 !important;
  border-color: rgba(74, 222, 128, 0.5) !important;
  background: rgba(74, 222, 128, 0.15) !important;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.2);
}

.status-late {
  color: #f87171 !important;
  border-color: rgba(248, 113, 113, 0.5) !important;
  background: rgba(248, 113, 113, 0.15) !important;
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.2);
}

.financial-summary {
  background: linear-gradient(135deg, rgba(126, 185, 217, 0.2) 0%, rgba(69, 134, 171, 0.1) 100%);
  padding: 20px;
  border-radius: 16px;
  border: 2px solid rgba(126, 185, 217, 0.3);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.financial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.financial-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.financial-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #05314C;
  text-shadow: 0 2px 8px rgba(126, 185, 217, 0.5);
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(126, 185, 217, 0.4);
}

@media (max-width: 600px) {
  .popup-content {
    width: 95%;
    margin: 10px;
    border-radius: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .popup-header {
    padding: 20px 24px;
  }
  
  .popup-body {
    padding: 24px;
  }
  
  .popup-header h3 {
    font-size: 1.5rem;
  }
  
  .financial-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = popupStyles;
  document.head.appendChild(styleSheet);
}

function App() {
  const [userPhoto, setUserPhoto] = useState('/images/User.png');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
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

  // Dados expandidos dos fornecedores
  const supplierData = [
    { 
      name: 'Fornecedor 1', 
      date: '28/04/2025', 
      material: 'SAE 1020',
      price: 500.00,
      quantity: 120,
      delivery: 'Em dia',
      quality: 'Excelente',
      contact: '(11) 9999-1111',
      email: 'contato@fornecedor1.com',
      address: 'Rua das Indústrias, 123 - São Paulo/SP',
      lastDelivery: '25/04/2025',
      certification: 'ISO 9001:2015'
    },
    { 
      name: 'Fornecedor 2', 
      date: '27/04/2025', 
      material: 'SAE 1045',
      price: 650.00,
      quantity: 95,
      delivery: 'Atrasado',
      quality: 'Boa',
      contact: '(11) 8888-2222',
      email: 'vendas@fornecedor2.com',
      address: 'Av. Industrial, 456 - Guarulhos/SP',
      lastDelivery: '20/04/2025',
      certification: 'ISO 14001:2015'
    },
    { 
      name: 'Fornecedor 3', 
      date: '26/04/2025', 
      material: 'HARDOX 450',
      price: 850.00,
      quantity: 75,
      delivery: 'Em dia',
      quality: 'Excelente',
      contact: '(11) 7777-3333',
      email: 'comercial@fornecedor3.com',
      address: 'Rod. dos Metalúrgicos, 789 - Osasco/SP',
      lastDelivery: '24/04/2025',
      certification: 'ISO 45001:2018'
    },
    { 
      name: 'Fornecedor 4', 
      date: '25/04/2025', 
      material: 'SAE 1020',
      price: 480.00,
      quantity: 140,
      delivery: 'Em dia',
      quality: 'Boa',
      contact: '(11) 6666-4444',
      email: 'atendimento@fornecedor4.com',
      address: 'Rua da Metalurgia, 321 - São Bernardo/SP',
      lastDelivery: '23/04/2025',
      certification: 'OHSAS 18001'
    },
    { 
      name: 'Fornecedor 5', 
      date: '24/04/2025', 
      material: 'SAE 1045',
      price: 620.00,
      quantity: 110,
      delivery: 'Atrasado',
      quality: 'Regular',
      contact: '(11) 5555-5555',
      email: 'suporte@fornecedor5.com',
      address: 'Est. dos Aços, 654 - Diadema/SP',
      lastDelivery: '18/04/2025',
      certification: 'NBR ISO 9001'
    }
  ];

  // Função para gerar dados dinâmicos do gráfico de pizza
  const generatePieData = (suppliers) => {
    const materialCount = suppliers.reduce((acc, supplier) => {
      acc[supplier.material] = (acc[supplier.material] || 0) + supplier.quantity;
      return acc;
    }, {});

    return [
      ['Material', 'Quantidade'],
      ...Object.entries(materialCount).map(([material, quantity]) => [material, quantity])
    ];
  };

  // Função para gerar dados dinâmicos do gráfico de barras
  const generateBarData = (suppliers) => {
    const currentDate = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    return [
      ['Mês', 'Produção', 'Meta'],
      ...months.map((month, index) => {
        const baseProduction = suppliers.reduce((sum, s) => sum + s.quantity, 0);
        const monthlyVariation = Math.floor(Math.random() * 300) + 900;
        const production = Math.floor(baseProduction * 0.8 + monthlyVariation);
        return [month, production, 1200];
      })
    ];
  };

  // Função para gerar dados dinâmicos do gráfico de linha
  const generateLineData = (suppliers) => {
    const days = ['01', '05', '10', '15', '20', '25', '30'];
    const baseConsumption = suppliers.reduce((sum, s) => sum + s.quantity, 0) / 10;
    
    return [
      ['Dia', 'Consumo'],
      ...days.map((day, index) => {
        const variation = Math.floor(Math.random() * 40) - 20;
        return [day, Math.floor(baseConsumption + variation)];
      })
    ];
  };

  // Função para calcular estatísticas dinâmicas dos KPIs
  const calculateKPIData = (suppliers) => {
    const materialStats = suppliers.reduce((acc, supplier) => {
      if (!acc[supplier.material]) {
        acc[supplier.material] = {
          suppliers: [],
          totalValue: 0,
          totalQuantity: 0
        };
      }
      acc[supplier.material].suppliers.push(supplier);
      acc[supplier.material].totalValue += supplier.price * supplier.quantity;
      acc[supplier.material].totalQuantity += supplier.quantity;
      return acc;
    }, {});

    return materialStats;
  };

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

  // Dados dinâmicos dos gráficos baseados nos fornecedores filtrados
  const pieData = generatePieData(filteredSuppliers);
  const barData = generateBarData(filteredSuppliers);
  const lineData = generateLineData(filteredSuppliers);
  const kpiData = calculateKPIData(filteredSuppliers);

  // Obter os 3 principais materiais para os KPIs
  const topMaterials = Object.entries(kpiData)
    .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
    .slice(0, 3);

  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedSupplier(null);
  };

  return (
    <div className='IndexFornecedor'>
      <NavBar />

      <div className="container">
        <div id="filtro">
          <div className="filter-header">
            <select 
              id="select-Filtro-Fornecedor" 
              value={selectedMaterial} 
              onChange={handleMaterialChange}
            >
              <option value="">Todos Materiais</option>
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
              {/* <div className="search-icon" onClick={handleSearch}>
                <Search size={18} color="#ffffff" />
              </div> */}
            </div>
          </div>
        </div>

        <div className="containerDash">
          <div className="dashboard">
            <h2>Dashboard Fornecedor</h2>

            <div id="charts-superior">
              <div id="Kpi">
                {topMaterials.map(([material, stats], index) => {
                  const avgPrice = stats.totalValue / stats.totalQuantity;
                  const maxPrice = avgPrice * 1.6;
                  const supplierName = stats.suppliers[0]?.name || `Fornecedor ${index + 1}`;
                  
                  return (
                    <div key={material} id={`chart-aviso-fornecedor${index + 1}`} className="chart">
                      <div className="kpi-title">{material}</div>
                      <div className="kpi-subtitle">{supplierName}</div>
                      <div className="kpi-data">
                        <span>R$ {avgPrice.toFixed(2)} / cilindro</span>
                        <span>R$ {maxPrice.toFixed(2)} / cilindro</span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Preencher KPIs restantes se houver menos de 3 materiais */}
                {Array.from({ length: Math.max(0, 3 - topMaterials.length) }, (_, index) => (
                  <div key={`empty-${index}`} id={`chart-aviso-fornecedor${topMaterials.length + index + 1}`} className="chart">
                    <div className="kpi-title">Material N/A</div>
                    <div className="kpi-subtitle">Sem dados</div>
                    <div className="kpi-data">
                      <span>R$ 0,00 / cilindro</span>
                      <span>R$ 0,00 / cilindro</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="charts-inferior">
              <div id="bar_chart" className="chart">
                <Chart
                  chartType="ColumnChart"
                  data={barData}
                  options={{
                    title: `Produção Mensal (${filteredSuppliers.length} fornecedores)`,
                    backgroundColor: 'transparent',
                    legend: 'none',
                    titleTextStyle: { color: 'white' },
                    hAxis: { textStyle: { color: 'white' } },
                    vAxis: { textStyle: { color: 'white' } },
                    colors: ['#4586AB', '#05314C'],
                    width: '100%'
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
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <tr 
                    key={index}
                    onClick={() => handleSupplierClick(supplier)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'rgba(69, 134, 171, 0.1)'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                  >
                    <td>{supplier.name}</td>
                    <td>{supplier.material}</td>
                    <td>{supplier.date}</td>
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

      {/* Pop-up Modal Padronizado */}
      {showPopup && selectedSupplier && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>{selectedSupplier.name}</h3>
              <fechar className="close-button" onClick={closePopup}>
                <X size={20} />
              </fechar>
            </div>
            
            <div className="popup-body">
              <div className="popup-section">
                <h4>Informações Básicas</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Material:</span>
                    <span className="info-value">{selectedSupplier.material}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Data do Pedido:</span>
                    <span className="info-value">{selectedSupplier.date}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Preço Unitário:</span>
                    <span className="info-value">R$ {selectedSupplier.price.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Quantidade:</span>
                    <span className="info-value">{selectedSupplier.quantity} unidades</span>
                  </div>
                </div>
              </div>

              <div className="popup-section">
                <h4>Status e Qualidade</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status da Entrega:</span>
                    <span className={`info-value status-${selectedSupplier.delivery === 'Em dia' ? 'ontime' : 'late'}`}>
                      {selectedSupplier.delivery}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Qualidade:</span>
                    <span className="info-value">{selectedSupplier.quality}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Última Entrega:</span>
                    <span className="info-value">{selectedSupplier.lastDelivery}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Certificação:</span>
                    <span className="info-value">{selectedSupplier.certification}</span>
                  </div>
                </div>
              </div>

              <div className="popup-section">
                <h4>Contato</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Telefone:</span>
                    <span className="info-value">{selectedSupplier.contact}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedSupplier.email}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Endereço:</span>
                    <span className="info-value">{selectedSupplier.address}</span>
                  </div>
                </div>
              </div>

              <div className="popup-section">
                <h4>Resumo Financeiro</h4>
                <div className="financial-summary">
                  <div className="financial-item">
                    <span className="financial-label">Valor Total do Pedido:</span>
                    <span className="financial-value">
                      R$ {(selectedSupplier.price * selectedSupplier.quantity).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;