import React, { useState, useEffect, useRef } from "react";
import { Chart } from "react-google-charts";
import { Search, X } from "lucide-react";
import "./styleFornecedor.css";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  background: linear-gradient(135deg, #05314C 0%,rgb(25, 81, 114) 100%);
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
  background: linear-gradient(135deg, #05314C; 0%, rgba(69, 134, 171, 0.1) 100%);
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
  color:rgb(255, 255, 255);
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
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = popupStyles;
  document.head.appendChild(styleSheet);
}

function App() {
  const navigate = useNavigate();
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    } else {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        sessionStorage.removeItem("authToken");
        navigate("/");
      } else {
        setAutenticacaoPassou(true);
      }
    }
  }, []);

 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef(null);
  const [materiais, setMateriais] = useState([]);
  const [ordemDeCompra, setOrdemDeCompra] = useState([]);
  const [estoque, setEstoque] = useState([]);

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
  function getFornecedor() {
    api
      .get("/fornecedores")
      .then((response) => {
        const fornecedores = response.data;
        setFilteredSuppliers(fornecedores);
        // console.log(fornecedores);
      })
      .catch((error) => {
        console.error("Erro ao buscar fornecedores:", error);
        // Aqui você pode lidar com o erro, como exibir uma mensagem de erro para o usuário
      });
  }
  function getEstoque() {
    api
      .get("/estoque")
      .then((response) => {
        const materiais = response.data.map((item) => item.tipoMaterial); // isso precisa retornar um array

        setMateriais(materiais);
        //  console.log('estoque resgatou', estoque)
        setEstoque(response.data);
        // console.log(materiais);

      })
      .catch((error) => {
        console.error("Erro ao buscar estoque:", error);
      });
  }
  function BuscarOrdemDeCompra() {
    api
      .get("/ordemDeCompra")
      .then((response) => {
        const ordens = response.data;
        setOrdemDeCompra(ordens);
        console.log(ordens);
      })
      .catch((error) => {
        console.error("Erro ao buscar estoque:", error);
      });
  }
  useEffect(() => {
    BuscarOrdemDeCompra();
  }, []);


  // Função para gerar dados dinâmicos do gráfico de pizza
  // const generatePieData = (suppliers) => {
  //   const materialCount = suppliers.reduce((acc, supplier) => {
  //     acc[supplier.material] =
  //       (acc[supplier.material] || 0) + supplier.quantity;
  //     return acc;
  //   }, {});

  //   return [
  //     ["Material", "Quantidade"],
  //     ...Object.entries(materialCount).map(([material, quantity]) => [
  //       material,
  //       quantity,
  //     ]),
  //   ];
  // };



  // Função para gerar dados dinâmicos do gráfico de linha
  const generateLineData = (suppliers) => {
    const days = ["01", "05", "10", "15", "20", "25", "30"];
    const baseConsumption =
      suppliers.reduce((sum, s) => sum + s.quantity, 0) / 10;

    return [
      ["Dia", "Consumo"],
      ...days.map((day, index) => {
        const variation = Math.floor(Math.random() * 40) - 20;
        return [day, Math.floor(baseConsumption + variation)];
      }),
    ];
  };

  // Função para calcular estatísticas dinâmicas dos KPIs
  const calculateKPIData = (ordens) => {
    const materialStats = {};

    ordens.forEach((ordem) => {
      const material = ordem.estoque?.tipoMaterial || "N/A";
      const fornecedor =
        ordem.fornecedor?.nomeFantasia || "Fornecedor Desconhecido";
      const valorUnitario = Number(ordem.valorUnitario || 0);
      const quantidade = Number(ordem.quantidade || 0);

      if (!materialStats[material]) {
        materialStats[material] = {
          totalValue: 0,
          totalQuantity: 0,
          suppliers: new Set(),
          firstSupplier: fornecedor,
        };
      }

      materialStats[material].totalValue += valorUnitario * quantidade;
      materialStats[material].totalQuantity += quantidade;
      materialStats[material].suppliers.add(fornecedor);
    });

    return materialStats;
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };

  const handleSearch = () => {
    const filtered = ordemDeCompra.filter((ordem) => {
      const supplierDate = parseDate(ordem.dataDeEmissao);
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;

      const materialMatch =
        !selectedMaterial || ordem?.estoque?.tipoMaterial === selectedMaterial;
      const dateInRange =
        (!startDateObj || supplierDate >= startDateObj) &&
        (!endDateObj || supplierDate <= endDateObj);
      const nameMatch =
        !searchTerm ||
        ordem?.fornecedor?.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem?.estoque?.tipoMaterial.toLowerCase().includes(searchTerm.toLowerCase());

      return materialMatch && dateInRange && nameMatch;
    });

    setFilteredSuppliers(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedMaterial, startDate, endDate]);

  useEffect(() => {
    getFornecedor();
    getEstoque();
    BuscarOrdemDeCompra();
  }, []);

  if (!autenticacaoPassou) return null;
  // Dados dinâmicos dos gráficos baseados nos fornecedores filtrados
  // const pieData = generatePieData(filteredSuppliers);

  const lineData = generateLineData(filteredSuppliers);
  const kpiData = calculateKPIData(ordemDeCompra);

  // Obter os 3 principais materiais para os KPIs
  const topMaterials = Object.entries(kpiData)
    .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
    .slice(0, 3);

  const handleSupplierClick = (supplier) => {
    const ordem = ordemDeCompra.find(
      (ordem) => ordem.fornecedor?.id === supplier.id
    );

    setSelectedSupplier({
      ...supplier,
      // Corrigido: usando estoque.tipoMaterial em vez de tipoMaterial
      material: ordem?.estoque?.tipoMaterial || "Não informado",
      dataPedido: ordem?.dataDeEmissao?.split("T")[0] || "Data não disponível",
      preco: ordem?.valorUnitario || 0,
      quantidade: ordem?.quantidade || 0,
      // Corrigido: prazoEntrega é uma string, não status de entrega
      statusEntrega: ordem?.prazoEntrega
        ? `Prazo: ${ordem.prazoEntrega} dias`
        : "Prazo não informado",
      // Campos adicionais que você pode querer usar:
      descricaoMaterial: ordem?.descricaoMaterial || "Descrição não informada",
      valorKg: ordem?.valorKg || 0,
      valorPeca: ordem?.valorPeca || 0,
      condPagamento: ordem?.condPagamento || "Não informada",
      ipi: ordem?.ipi || 0,
      rastreabilidade: ordem?.rastreabilidade || "Não informada",
      idFornecedor: ordem?.fornecedorId || 1
    });
    setShowPopup(true);
  };


  // Função para gerar dados dinâmicos do gráfico de barras baseado nas ordens de compra
  const generateBarData = (ordensDeCompra) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const monthsNumbers = [0, 1, 2, 3, 4, 5]; // Janeiro = 0, Junho = 5

    // Calcula a quantidade total de todas as ordens de compra
    const totalQuantidade = ordensDeCompra.reduce((sum, ordem) => {
      return sum + (ordem.quantidade || 0);
    }, 0);

    // console.log("Total de ordens:", ordensDeCompra.length);
    // console.log("Quantidade total das ordens:", totalQuantidade);

    // Se não houver dados, retorna zeros
    if (totalQuantidade === 0) {
      console.warn("Nenhuma quantidade encontrada nas ordens de compra!");
      return [
        ["Mês", "Produção", "Meta"],
        ...months.map(month => [month, 0, 0])
      ];
    }

    // Define a meta como 75% da quantidade total (constante para todos os meses)
    const meta = Math.floor(totalQuantidade * 0.75);

    // Inicializa array para acumular produção por mês
    const producaoMensal = new Array(6).fill(0);

    // Distribui as quantidades pelos meses baseado na data de emissão
    ordensDeCompra.forEach(ordem => {
      if (ordem.dataDeEmissao && ordem.quantidade) {
        const dataEmissao = new Date(ordem.dataDeEmissao);
        const mesEmissao = dataEmissao.getMonth(); // 0-11
        const anoEmissao = dataEmissao.getFullYear();

        // Verifica se a data é do ano atual e está nos primeiros 6 meses
        if (anoEmissao === currentYear && mesEmissao >= 0 && mesEmissao <= 5) {
          producaoMensal[mesEmissao] += ordem.quantidade;
        }
      }
    });

    // console.log("Produção mensal:", producaoMensal);

    return [
      ["Mês", "Produção", "Meta"],
      ...months.map((month, index) => {
        return [month, producaoMensal[index], meta];
      }),
    ];
  };

  const barData = generateBarData(ordemDeCompra);

  const closePopup = () => {
    setShowPopup(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="IndexFornecedor">
      <NavBar />

      <div className="container">
        <div id="filtro">
          <div className="filter-headerFornecedor">
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

            <div id="FiltroData">
              <span id="textFiltro">
                <h5>Início:</h5>
              </span>
              <input
                type="date"
                id="dateInput"
                className="date-filter-input"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>

            <div id="FiltroData">
              <span id="textFiltro">
                <h5>Fim:</h5>
              </span>
              <input
                type="date"
                id="dateInput"
                className="date-filter-input"
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

        <div className="containerDashFornecedor">
          <div className="dashboardFornecedor">
            <h2>Dashboard Fornecedor</h2>

            <div id="charts-superior">
              <div id="Kpi">
                {topMaterials.map(([material, stats], index) => {
                  const avgPrice =
                    stats.totalQuantity > 0
                      ? stats.totalValue / stats.totalQuantity
                      : 0;
                  const maxPrice = avgPrice * 1.6;
                  const supplierName = Array.from(stats.suppliers)[0] || `Fornecedor ${index + 1}`;

                  return (
                    <div
                      key={material}
                      id={`chart-aviso-fornecedor${index + 1}`}
                      className="chart"
                    >
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
                {Array.from(
                  { length: Math.max(0, 3 - topMaterials.length) },
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      id={`chart-aviso-fornecedor${topMaterials.length + index + 1
                        }`}
                      className="chart"
                    >
                      <div className="kpi-title">Material N/A</div>
                      <div className="kpi-subtitle">Sem dados</div>
                      <div className="kpi-data">
                        <span>R$ 0,00 / cilindro</span>
                        <span>R$ 0,00 / cilindro</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div id="charts-inferior">
              <div id="bar_chart" className="chart">
                <Chart
                  chartType="ColumnChart"
                  data={barData}
                  options={{
                    title: `Produção Mensal (${filteredSuppliers.length} fornecedores)`,
                    backgroundColor: "transparent",
                    legend: "none",
                    titleTextStyle: { color: "white" },
                    hAxis: { textStyle: { color: "white" } },
                    vAxis: { textStyle: { color: "white" } },
                    colors: ["#4586AB", "#05314C"],
                    width: "100%",
                    height: "40vh",
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
                  {/* <th>Material</th>
                  <th>Data</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <tr
                    key={index}
                    onClick={() => handleSupplierClick(supplier)}
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
                    <td>{supplier.nomeFantasia}</td>
                    {/* <td>{materiais[index]|| "Sem material"}</td> deixei aqui só para pegar um material mesmo que esteja errado */}
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
        <h3>{selectedSupplier.nomeFantasia}</h3>
        <div className="close-button" onClick={closePopup}>
          <X size={20} />
        </div>
      </div>

      <div className="popup-body">
        <div className="popup-section">
          <h4>Informações Básicas</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Material:</span>
              <span className="info-value">
                {ordemDeCompra
      .filter((ordem) => ordem.fornecedorId === selectedSupplier.fornecedorId)
      .map((ordem) => ordem.estoque?.tipoMaterial)
      .filter((mat, idx, arr) => mat && arr.indexOf(mat) === idx) // remove duplicados e vazios
      .join(", ") || "Não encontrado"}
              </span>
            </div>
          </div>
        </div>

        {/* ORDENS DE COMPRA DO FORNECEDOR */}
        <div className="popup-section">
  <h4>Ordens de Compra</h4>
  <div className="info-grid">
    {ordemDeCompra
      .filter((ordem) => ordem.fornecedorId === selectedSupplier.fornecedorId)
      .map((ordem, index) => (
        <div key={index}>
          <div className="info-item"> 
            <span className="info-label">ID do Pedido:</span>
            <span className="info-value">{ordem.id || "N/A"}</span>
          </div>
          <div className="info-item"> 
            <span className="info-label">Data do Pedido:</span>
            <span className="info-value">
              {ordem.dataDeEmissao ? ordem.dataDeEmissao.split("T")[0] : "N/A"}
            </span>
          </div>
          <div className="info-item"> 
            <span className="info-label">Quantidade:</span>
            <span className="info-value">{ordem.quantidade || 0} unidades</span>
          </div>
          <div className="info-item"> 
            <span className="info-label">Preço Unitário:</span>
            <span className="info-value">
              R$ {ordem.valorUnitario?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="info-item"> 
            <span className="info-label">Material:</span>
            <span className="info-value">{ordem.estoque?.tipoMaterial || "N/A"}</span>
          </div>
          <div className="info-item"> 
            <span className="info-label">Prazo Entrega:</span>
            <span className="info-value">{ordem.prazoEntrega || "N/A"} dias</span>
          </div>
        </div>
      ))}
  </div>
</div>

        {/* CONTATO - segue com selectedSupplier */}
        <div className="popup-section">
          <h4>Contato</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Telefone:</span>
              <span className="info-value">{selectedSupplier.telefone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{selectedSupplier.email}</span>
            </div>
            <div className="info-item full-width">
              <span className="info-label">Endereço:</span>
              <span className="info-value">{selectedSupplier.complemento}</span>
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
