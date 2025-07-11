import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Package,
  Calendar,
  Clock,
  User,
  Truck,
  Ruler,
  Layers,
} from "lucide-react";
import "./styleEstoque.css";
import NavBar from "../../components/NavBar";
import { api } from "../../provider/api";

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
  display: flex;
  align-items: center;
  gap: 12px;
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

.status-high {
  color: #4ade80 !important;
  border-color: rgba(74, 222, 128, 0.5) !important;
  background: rgba(74, 222, 128, 0.15) !important;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.2);
}

.status-medium {
  color: #facc15 !important;
  border-color: rgba(250, 204, 21, 0.5) !important;
  background: rgba(250, 204, 21, 0.15) !important;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.2);
}

.status-low {
  color: #f87171 !important;
  border-color: rgba(248, 113, 113, 0.5) !important;
  background: rgba(248, 113, 113, 0.15) !important;
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.2);
}

.stock-summary {
  background: linear-gradient(135deg, rgba(126, 185, 217, 0.2) 0%, rgba(69, 134, 171, 0.1) 100%);
  padding: 20px;
  border-radius: 16px;
  border: 2px solid rgba(126, 185, 217, 0.3);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.stock-item:last-child {
  margin-bottom: 0;
}

.stock-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stock-value {
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
  
  .stock-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
`;

// Adicionar estilos ao documento
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = popupStyles;
  document.head.appendChild(styleSheet);
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredStockItems, setFilteredStockItems] = useState([]);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

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

  // Dados expandidos de exemplo para a tabela de estoque
  const [stockData, setStockData] = useState([]);

  function getEstoque() {
    api
      .get("/estoque")
      .then((resposta) => {
        setStockData(resposta.data);
      })
      .catch((err) => {
        console.log("erro:", err);
      });
  }

  useEffect(() => {
    getEstoque();
  }, []);

  const parseDate = (dateString) => {
    return new Date(dateString); // já funciona com formato YYYY-MM-DD
  };

  const handleSearch = () => {
    const filtered = stockData.filter((item) => {
      const itemDate = parseDate(item.ultimaMovimentacao);
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      // Filtro por tipo de material (select)
      const materialMatch =
        !selectedMaterial || item.tipoMaterial === selectedMaterial;

      // Filtro por data
      const dateInRange =
        (!startDateObj || itemDate >= startDateObj) &&
        (!endDateObj || itemDate <= endDateObj);

      // Filtro por busca de texto
      const searchMatch =
        !searchTerm ||
        item.tipoMaterial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.lote &&
          item.lote.toLowerCase().includes(searchTerm.toLowerCase()));

      return materialMatch && dateInRange && searchMatch;
    });

    setFilteredStockItems(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedMaterial, startDate, endDate]);

  useEffect(() => {
    setFilteredStockItems(stockData);
  }, [stockData]);

  const handleStockItemClick = (item) => {
    setSelectedStockItem(item);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedStockItem(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Em estoque":
        return "status-high";
      case "Estoque baixo":
        return "status-medium";
      case "Reservado":
        return "status-low";
      default:
        return "";
    }
  };

  return (
    <div className="IndexFornecedor">
      <NavBar />

      <div className="container">
        <div className="filter-headerEstoque">
          <select
            id="select-Filtro-Fornecedor"
            value={selectedMaterial}
            onChange={handleMaterialChange} // Usando a função correta
          >
            <option value="">Todos Materiais</option>
            {[...new Set(stockData.map((item) => item.tipoMaterial))].map(
              (tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              )
            )}
          </select>

          <div id="FiltroData">
            <span id="textFiltro">
              <h5>Início:</h5>
            </span>
            <input
              className="inputEstoque"
              type="date"
              id="dateInput"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>

          <div id="FiltroData">
            <span id="textFiltro">
              <h5>Fim:</h5>
            </span>
            <input
              className="inputEstoque"
              type="date"
              id="dateInput"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Pesquisar material, fornecedor ou lote..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {/* <div className="search-icon" onClick={handleSearch}>
              <Search size={18} color="#ffffff" />
            </div> */}
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
                  <th>Quantidade mininma</th>
                  <th>Quantidade máxima</th>
                  <th>Qtd. Externo</th>
                  <th>Qtd. Interno</th>
                </tr>
              </thead>
              <tbody>
                {filteredStockItems.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => handleStockItemClick(item)}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) =>
                      (e.target.parentElement.style.backgroundColor =
                        "rgba(69, 134, 171, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.parentElement.style.backgroundColor =
                        "transparent")
                    }
                  >
                    <td>{item.tipoMaterial}</td>
                    <td>{item.quantidadeAtual}</td>
                    <td>{item.quantidadeMinima}</td>
                    <td>{item.quantidadeMaxima}</td>
                    <td>{item.externa || 0}</td>
                    <td>{item.interna || 0}</td>
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

      {/* Pop-up Modal para Item de Estoque */}
      {showPopup && selectedStockItem && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>
                <Package size={24} />
                {selectedStockItem.tipoMaterial} - {selectedStockItem.id}
              </h3>
              <div className="close-button" onClick={closePopup}>
                <X size={20} />
              </div>
            </div>

            <div className="popup-body">
              <div className="popup-section">
                <h4>
                  <Layers size={20} />
                  Especificações do Material
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Material:</span>
                    <span className="info-value">
                      {selectedStockItem.tipoMaterial}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Quantidade:</span>
                    <span className="info-value">
                      {selectedStockItem.quantidadeAtual} unidades
                    </span>
                  </div>
                </div>
              </div>

              {/* <div className="popup-section">
                <h4>
                  <Ruler size={20} />
                  Dimensões
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Largura:</span>
                    <span className="info-value">{selectedStockItem.largura}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Espessura:</span>
                    <span className="info-value">{selectedStockItem.espessura}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Localização:</span>
                    <span className="info-value">{selectedStockItem.localizacao}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Valor Unitário:</span>
                    <span className="info-value">R$ {selectedStockItem.valorUnitario.toFixed(2)}</span>
                  </div>
                </div>
              </div> */}

              <div className="popup-section">
                <h4>
                  <Calendar size={20} />
                  Informações de Data
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-value">
  {selectedStockItem.ultimaMovimentacao ? (
    isNaN(new Date(selectedStockItem.ultimaMovimentacao)) ? (
      "Data inválida"
    ) : (
      new Date(selectedStockItem.ultimaMovimentacao).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  ) : (
    "Sem movimentação"
  )}
</span>

                  </div>
                  {/* <div className="info-item">
                    <span className="info-label">Hora de Entrada:</span>
                    <span className="info-value">
                      <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                      {selectedStockItem.hora}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Próxima Inspeção:</span>
                    <span className="info-value">{selectedStockItem.proximaInspecao}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className={`info-value ${getStatusClass(selectedStockItem.status)}`}>
                      {selectedStockItem.status}
                    </span>
                  </div> */}
                </div>
              </div>

              {/* <div className="popup-section">
                <h4>
                  <User size={20} />
                  Fornecedor e Qualidade
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Fornecedor:</span>
                    <span className="info-value">
                      <Truck size={16} style={{ display: 'inline', marginRight: '8px' }} />
                      {selectedStockItem.fornecedor}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Qualidade:</span>
                    <span className="info-value">{selectedStockItem.qualidade}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Certificação:</span>
                    <span className="info-value">{selectedStockItem.certificacao}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Observações:</span>
                    <span className="info-value">{selectedStockItem.observacoes}</span>
                  </div>
                </div>
              </div> */}

              {/* <div className="popup-section">
                <h4>Resumo Financeiro</h4>
                <div className="stock-summary">
                  <div className="stock-item">
                    <span className="stock-label">Valor Total do Lote:</span>
                    <span className="stock-value">
                      R$ {(selectedStockItem.valorUnitario * selectedStockItem.quantidade).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
