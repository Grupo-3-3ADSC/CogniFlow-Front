// App.jsx - Dashboard Material com NavBar integrada, filtros dinâmicos baseados no estoque e alertas clicáveis
import React, { useState, useEffect, useRef } from "react";
import { Chart } from "react-google-charts";
import { Search, X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import "../DashMaterial/styleMaterial.css";
import NavBar from "../../components/NavBar"; // Importando a NavBar
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../../provider/api";

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

function App() {
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  const [userPhoto, setUserPhoto] = useState("./User.png");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
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

  // Estados para os filtros baseados no AppEstoque
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedTransferType, setSelectedTransferType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [estoqueData, setEstoqueData] = useState([]);

  // Estado para modal de detalhes do alerta
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStock, setSelectedStock] = useState(false);
  const [ordemDeCompra, setOrdemDeCompra] = useState([]);

  // Estados para os dados dos gráficos - inicializados com dados vazios
  const [pieData, setPieData] = useState([
    ["Tipo", "Quantidade"],
    ["Carregando...", 0],
  ]);

  const [barData, setBarData] = useState([
    ["Material", "Estoque Atual", "Estoque Mínimo"],
    ["Carregando...", 0, 0],
  ]);

  const [lineData, setLineData] = useState([
    ["Data", "Movimentações"],
    ["Carregando...", 0],
  ]);

  // Estado para produtos filtrados
  const [produtos, setProdutos] = useState([]);

  // Estado para alertas com detalhes expandidos
  const [alertas, setAlertas] = useState([]);

  // Estado para materiais únicos
  const [materiais, setMateriais] = useState([]);

  // Função para buscar dados do estoque e inicializar os gráficos
  function getEstoque() {
    api
      .get("/estoque")
      .then((resposta) => {
        const dadosEstoque = resposta.data;
        const tiposUnicos = [
          ...new Set(dadosEstoque.map((item) => item.tipoMaterial)),
        ];

        console.log("Tipos únicos estoque:", tiposUnicos);
        console.log("Dados estoque:", dadosEstoque);

        setEstoqueData(dadosEstoque);
        setMateriais(tiposUnicos);
        setProdutos(tiposUnicos);

        // Inicializar gráficos com todos os dados
        inicializarGraficos(dadosEstoque);
      })
      .catch((err) => {
        console.log("Erro ao buscar estoque:", err);
        // Em caso de erro, manter dados de loading
        setPieData([
          ["Tipo", "Quantidade"],
          ["Erro ao carregar", 0],
        ]);
        setBarData([
          ["Material", "Estoque Atual", "Estoque Mínimo"],
          ["Erro ao carregar", 0, 0],
        ]);
        setLineData([
          ["Data", "Movimentações"],
          ["Erro ao carregar", 0],
        ]);
      });
  }

  function getOrdemDeCompra() {
    api
      .get("/ordemDeCompra")
      .then((resposta) => {
        setOrdemDeCompra(resposta.data);
      }).catch((err) => {
        console.error("erro ao pegar ordem de compra: ", err);
      })
  }

  // Função para inicializar os gráficos com dados reais
  const inicializarGraficos = (dadosEstoque) => {
    if (!dadosEstoque || dadosEstoque.length === 0) {
      setPieData([
        ["Tipo", "Quantidade"],
        ["Sem dados", 0],
      ]);
      setBarData([
        ["Material", "Estoque Atual", "Estoque Mínimo"],
        ["Sem dados", 0, 0],
      ]);
      setLineData([
        ["Data", "Movimentações"],
        ["Sem dados", 0],
      ]);
      return;
    }

    // Gráfico de Pizza - Distribuição por tipo de material
    const materialCounts = {};

    const transferenciaInternaTotal = dadosEstoque.reduce((acc, item) => {
      const valorInterno = item.interna || 0;
      return acc + valorInterno;
    }, 0);

    const transferenciaExternaTotal = dadosEstoque.reduce((acc, item) => {
      const valorExterno = item.externa || 0;
      return acc + valorExterno;
    }, 0);

    console.log("Total de Transferências Internas:", transferenciaInternaTotal);
    console.log("Total de Transferências Externas:", transferenciaExternaTotal);

    const totalTransferencias =
      transferenciaInternaTotal + transferenciaExternaTotal;

    const newPieData = [["Tipo de Transferência", "Porcentagem"]];

    if (totalTransferencias > 0) {
      const porcentagemInterna =
        (transferenciaInternaTotal / totalTransferencias) * 100;
      const porcentagemExterna =
        (transferenciaExternaTotal / totalTransferencias) * 100;

      newPieData.push(["Interna", porcentagemInterna]);
      newPieData.push(["Externa", porcentagemExterna]);
    } else {
      newPieData.push(["Sem transferências", 100]);
    }

    setPieData(newPieData);

    // Gráfico de Barras - Estoque Atual vs Estoque Mínimo
    const newBarData = [["Material", "Estoque Atual", "Estoque Mínimo"]];
    Object.entries(materialCounts).forEach(([material, quantidadeAtual]) => {
      const materialInfo = dadosEstoque.find(
        (item) => item.tipoMaterial === material
      );
      const quantidadeMinima = materialInfo
        ? materialInfo.quantidadeMinima || 0
        : 0;

      newBarData.push([material, quantidadeAtual, quantidadeMinima]);
    });

    if (newBarData.length === 1) {
      newBarData.push(["Sem dados", 0, 0]);
    }
    setBarData(newBarData);

    // Gráfico de Linhas - Movimentações por data
    const dateMovements = {};
    dadosEstoque.forEach((item) => {
      if (item.ultimaMovimentacao) {
        const date = new Date(item.ultimaMovimentacao);
        const shortDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`;
        dateMovements[shortDate] =
          (dateMovements[shortDate] || 0) + (item.quantidadeAtual || 0);
      }
    });

    const newLineData = [["Data", "Movimentações"]];
    if (Object.keys(dateMovements).length > 0) {
      // Ordenar por data
      Object.entries(dateMovements)
        .sort(([a], [b]) => {
          const [dayA, monthA] = a.split("/");
          const [dayB, monthB] = b.split("/");
          return (
            new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB)
          );
        })
        .forEach(([date, quantidade]) => {
          newLineData.push([date, quantidade]);
        });
    } else {
      newLineData.push(["Sem movimentações", 0]);
    }
    setLineData(newLineData);

    // Gerar alertas iniciais
    gerarAlertas(dadosEstoque, materialCounts);
  };

  // Função para gerar alertas baseados nos dados
  const gerarAlertas = (dadosEstoque, materialCounts) => {
    let newAlertas = [];

    // Verificar estoques baixos (quantidade atual < quantidade mínima)
    Object.entries(materialCounts).forEach(([material, quantidadeAtual]) => {
      const materialInfo = dadosEstoque.find(
        (item) => item.tipoMaterial === material
      );
      const quantidadeMinima = materialInfo
        ? materialInfo.quantidadeMinima || 0
        : 0;

      if (quantidadeMinima > 0 && quantidadeAtual < quantidadeMinima) {
        newAlertas.push({
          id: `baixo_${material}`,
          texto: `Estoque baixo - ${material}`,
          prioridade: "alta",
          detalhes: {
            material: material,
            estoqueAtual: quantidadeAtual,
            estoqueMinimo: quantidadeMinima,
            ultimaMovimentacao: materialInfo?.ultimaMovimentacao
              ? new Date(materialInfo.ultimaMovimentacao).toLocaleDateString(
                "pt-BR"
              )
              : "N/A",
            deficit: quantidadeMinima - quantidadeAtual,
            percentualDisponivel:
              Math.round((quantidadeAtual / quantidadeMinima) * 100) + "%",
            acaoRecomendada: "Solicitar reposição urgente",
          },
        });
      }
    });

    // Verificar estoques que atingiram/ultrapassaram a quantidade máxima
    Object.entries(materialCounts).forEach(([material, quantidadeAtual]) => {
      const materialInfo = dadosEstoque.find(
        (item) => item.tipoMaterial === material
      );
      const quantidadeMaxima = materialInfo
        ? materialInfo.quantidadeMaxima || 0
        : 0;

      if (quantidadeMaxima > 0 && quantidadeAtual >= quantidadeMaxima) {
        newAlertas.push({
          id: `meta_${material}`,
          texto: `Estoque no limite máximo - ${material}`,
          prioridade: "baixa",
          detalhes: {
            material: material,
            metaEstoque: quantidadeMaxima,
            estoqueAtual: quantidadeAtual,
            percentualMeta:
              Math.round((quantidadeAtual / quantidadeMaxima) * 100) + "%",
            excesso: quantidadeAtual - quantidadeMaxima,
            ultimaMovimentacao: materialInfo?.ultimaMovimentacao
              ? new Date(materialInfo.ultimaMovimentacao).toLocaleDateString(
                "pt-BR"
              )
              : "N/A",
            observacao: "Estoque no limite máximo recomendado",
          },
        });
      }
    });

    // Alertas de movimentações recentes (últimos 7 dias)
    const setesDiasAtras = new Date();
    setesDiasAtras.setDate(setesDiasAtras.getDate() - 7);

    dadosEstoque.forEach((item) => {
      if (item.ultimaMovimentacao) {
        const dataMovimentacao = new Date(item.ultimaMovimentacao);
        if (dataMovimentacao >= setesDiasAtras) {
          newAlertas.push({
            id: `movimentacao_${item.tipoMaterial}_${item.id}`,
            texto: `Movimentação recente - ${item.tipoMaterial}`,
            prioridade: "normal",
            detalhes: {
              material: item.tipoMaterial,
              quantidadeAtual: item.quantidadeAtual,
              quantidadeMinima: item.quantidadeMinima,
              quantidadeMaxima: item.quantidadeMaxima,
              dataMovimentacao: new Date(
                item.ultimaMovimentacao
              ).toLocaleDateString("pt-BR"),
              horaMovimentacao: new Date(
                item.ultimaMovimentacao
              ).toLocaleTimeString("pt-BR"),
              diasAtras: Math.ceil(
                (new Date() - dataMovimentacao) / (1000 * 60 * 60 * 24)
              ),
              situacaoEstoque:
                item.quantidadeAtual < item.quantidadeMinima
                  ? "Abaixo do mínimo"
                  : item.quantidadeAtual >= (item.quantidadeMaxima || 0)
                    ? "No limite máximo"
                    : "Normal",
            },
          });
        }
      }
    });

    // Se não há alertas, mostrar mensagem informativa
    if (newAlertas.length === 0) {
      newAlertas.push({
        id: "sem_alertas",
        texto: "Todos os estoques estão normais",
        prioridade: "normal",
        detalhes: {
          message:
            "Todos os estoques estão dentro dos parâmetros estabelecidos",
          totalMateriais: Object.keys(materialCounts).length,
          totalRegistros: dadosEstoque.length,
          status: "Sistema funcionando normalmente",
        },
      });
    }

    setAlertas(newAlertas);
  };

  useEffect(() => {
    getEstoque();
    getOrdemDeCompra();
  }, []);

  // Verificar se a imagem de fundo foi carregada corretamente
  useEffect(() => {
    const testImage = new Image();
    testImage.src = "/assets/background.png";

    testImage.onerror = () => {
      document.body.classList.add("no-bg-image");
      console.log(
        "Imagem de fundo não encontrada. Verifique o caminho: /assets/background.png"
      );
    };
  }, []);

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

  // Função para abrir modal de detalhes do alerta
  const handleAlertClick = (alerta) => {
    setSelectedAlert(alerta);
    setIsModalOpen(true);
  };

  // Função para fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setShowPopup(false);
    setSelectedAlert(null);
  };

  // Função para obter ícone do alerta
  const getAlertIcon = (prioridade) => {
    switch (prioridade) {
      case "alta":
        return <AlertTriangle size={16} color="#FF4C4C" />;
      case "normal":
        return <Info size={16} color="#4586AB" />;
      case "baixa":
        return <CheckCircle size={16} color="#4CAF50" />;
      default:
        return <Info size={16} color="#4586AB" />;
    }
  };

  // Função para formatar data para comparação
  const parseDate = (dateString) => {
    // Se a data vier como LocalDateTime do backend, converter para Date
    if (dateString && typeof dateString === "string") {
      // Se for ISO string (2025-04-28T10:30:00)
      if (dateString.includes("T")) {
        return new Date(dateString);
      }
      // Se for formato DD/MM/YYYY
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        return new Date(year, month - 1, day);
      }
    }
    return new Date(dateString);
  };

  const [mensagemMinimo, setMensagemMinimo] = useState("");
  const [mensagemMeta, setMensagemMeta] = useState("");

  // Função para filtrar dados baseada nos filtros do estoque
  const aplicarFiltros = () => {
    if (!estoqueData || estoqueData.length === 0) return;

    // Filtrar dados do estoque
    const filtered = estoqueData.filter((item) => {
      // Filtro por tipo de material
      const materialMatch =
        !selectedMaterial || item.tipoMaterial === selectedMaterial;

      // Filtro por tipo de transferência (se existir no objeto)
      const transferTypeMatch =
        !selectedTransferType ||
        (item.tipoTransferencia &&
          item.tipoTransferencia === selectedTransferType);

      // Filtro por data (usando ultimaMovimentacao)
      let dateInRange = true;
      if (item.ultimaMovimentacao && (startDate || endDate)) {
        const itemDate = parseDate(item.ultimaMovimentacao);
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        dateInRange =
          (!startDateObj || itemDate >= startDateObj) &&
          (!endDateObj || itemDate <= endDateObj);
      }

      // Filtro de pesquisa
      const searchMatch =
        !searchTerm ||
        item.tipoMaterial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.fornecedor &&
          item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()));

      return materialMatch && transferTypeMatch && dateInRange && searchMatch;
    });

    // Atualizar produtos baseado nos dados filtrados
    const uniqueMaterials = [
      ...new Set(filtered.map((item) => item.tipoMaterial)),
    ];
    setProdutos(uniqueMaterials);

    // Atualizar gráfico de pizza baseado nos dados filtrados
    const materialCounts = {};
    filtered.forEach((item) => {
      materialCounts[item.tipoMaterial] =
        (materialCounts[item.tipoMaterial] || 0) + (item.quantidadeAtual || 0);
    });

    // Atualizar gráfico de barras (Estoque Atual vs Estoque Mínimo)
    const newBarData = [["Material", "Estoque Atual", "Estoque Mínimo"]];
    const materiaisAbaixoMinimo = [];

    if (Object.keys(materialCounts).length > 0) {
      Object.entries(materialCounts).forEach(([material, quantidadeAtual]) => {
        const materialInfo = filtered.find(
          (item) => item.tipoMaterial === material
        );
        const quantidadeMinima = materialInfo
          ? materialInfo.quantidadeMinima || 0
          : 0;

        // Verifica se o estoque atual está abaixo do mínimo
        if (quantidadeAtual < quantidadeMinima && quantidadeMinima > 0) {
          materiaisAbaixoMinimo.push({
            material: material,
            atual: quantidadeAtual,
            minimo: quantidadeMinima,
          });
        }

        newBarData.push([material, quantidadeAtual, quantidadeMinima]);
      });
    } else {
      newBarData.push(["Sem dados filtrados", 0, 0]);
    }

    // Atualiza o gráfico de barras
    setBarData(newBarData);

    // Atualiza a mensagem para o KPI
    if (materiaisAbaixoMinimo.length > 0) {
      const mensagemAlerta = `${materiaisAbaixoMinimo.length
        } material(is) abaixo do estoque mínimo: ${materiaisAbaixoMinimo
          .map((item) => `${item.material} (${item.atual}/${item.minimo})`)
          .join(", ")}`;
      setMensagemMinimo(mensagemAlerta);
    } else {
      setMensagemMinimo("Não há nenhum material abaixo do minímo");
    }

    // Nova lógica para materiais acima da meta (75% do máximo)
    const materiaisAcimaMeta = [];

    if (Object.keys(materialCounts).length > 0) {
      Object.entries(materialCounts).forEach(([material, quantidadeAtual]) => {
        const materialInfo = filtered.find(
          (item) => item.tipoMaterial === material
        );
        const quantidadeMaxima = materialInfo
          ? materialInfo.quantidadeMaxima || 0
          : 0;

        // Calcula 75% da quantidade máxima
        const metaAlerta = quantidadeMaxima * 0.75;

        // Verifica se o estoque atual está acima de 75% do máximo
        if (quantidadeAtual >= metaAlerta && quantidadeMaxima > 0) {
          const porcentagem = Math.round(
            (quantidadeAtual / quantidadeMaxima) * 100
          );
          materiaisAcimaMeta.push({
            material: material,
            atual: quantidadeAtual,
            maximo: quantidadeMaxima,
            porcentagem: porcentagem,
          });
        }
      });
    }

    if (materiaisAcimaMeta.length > 0) {
      const mensagemMeta = `${materiaisAcimaMeta.length
        } material(is) acima da meta (75%): ${materiaisAcimaMeta
          .map(
            (item) =>
              `${item.material} (${item.atual}/${item.maximo} - ${item.porcentagem}%)`
          )
          .join(", ")}`;
      setMensagemMeta(mensagemMeta);
    } else {
      setMensagemMeta("Nenhum material está acima da meta");
    }

    // const newPieData = [['Tipo', 'Quantidade']];
    // Object.entries(materialCounts).forEach(([tipo, quantidade]) => {
    //   if (quantidade > 0) {
    //     newPieData.push([tipo, quantidade]);
    //   }
    // });

    // if (newPieData.length === 1) {
    //   newPieData.push(['Sem dados filtrados', 0]);
    // }
    // setPieData(newPieData);

    // Atualizar gráfico de linhas baseado nas movimentações filtradas
    const dateMovements = {};
    filtered.forEach((item) => {
      if (item.ultimaMovimentacao) {
        const date = parseDate(item.ultimaMovimentacao);
        const shortDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`;
        dateMovements[shortDate] =
          (dateMovements[shortDate] || 0) + (item.quantidadeAtual || 0);
      }
    });

    const newLineData = [["Data", "Movimentações"]];
    if (Object.keys(dateMovements).length > 0) {
      Object.entries(dateMovements)
        .sort(([a], [b]) => {
          const [dayA, monthA] = a.split("/");
          const [dayB, monthB] = b.split("/");
          return (
            new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB)
          );
        })
        .forEach(([date, quantidade]) => {
          newLineData.push([date, quantidade]);
        });
    } else {
      newLineData.push(["Sem movimentações", 0]);
    }
    setLineData(newLineData);

    // Gerar alertas baseados nos dados filtrados
    gerarAlertas(filtered, materialCounts);


  };

  // Aplicar filtros quando qualquer um deles mudar
  useEffect(() => {
    aplicarFiltros();
  }, [
    searchTerm,
    selectedMaterial,
    selectedTransferType,
    startDate,
    endDate,
    estoqueData,
  ]);

  const obterNomeMes = (numeroMes) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes];
  };

  const agruparMovimentacoesPorMes = (tipoMaterial, ordensDeCompra) => {

    const anoAtual = new Date().getFullYear();

  // Filtrar todas as ordens relacionadas ao tipo de material
  const ordensDoMaterial = ordensDeCompra.filter(
    (ordem) =>
      ordem.estoque?.tipoMaterial === tipoMaterial ||
      ordem.descricaoMaterialCompleta === tipoMaterial ||
      ordem.descricaoMaterial === tipoMaterial
  );

  // Agrupar por ano-mês
  const movimentacoesPorMes = {};
  
  ordensDoMaterial.forEach((ordem) => {
    if (ordem.dataDeEmissao) {
      const data = new Date(ordem.dataDeEmissao);
      const ano = data.getFullYear();
      const mes = data.getMonth(); // 0-11

      if(ano == anoAtual){
      const chaveAnoMes = `${ano}-${mes}`;
      
      if (!movimentacoesPorMes[chaveAnoMes]) {
        movimentacoesPorMes[chaveAnoMes] = {
          ano,
          mes,
          nomeMes: obterNomeMes(mes),
          quantidadeTotal: 0,
          numeroMovimentacoes: 0
        };
      }
      
      if(ordem.pendenciaAlterada == true){
      movimentacoesPorMes[chaveAnoMes].quantidadeTotal += ordem.quantidade || 0;
      movimentacoesPorMes[chaveAnoMes].numeroMovimentacoes += 1;
        }
      }
    }
  });

  // Converter para array e ordenar por data (mais recente primeiro)
  return Object.values(movimentacoesPorMes)
    .sort((a, b) => {
      // Ordenar por mês decrescente
      return b.mes - a.mes;
    });
};

  const handleStockClick = (tipoMaterial) => {
    const ordensDoMaterial = ordemDeCompra.filter(
    (ordem) =>
      ordem.estoque?.tipoMaterial === tipoMaterial ||
      ordem.descricaoMaterialCompleta === tipoMaterial ||
      ordem.descricaoMaterial === tipoMaterial
  );
  
  // Pegar a primeira ordem para informações básicas
  const ordem = ordensDoMaterial[0];

  const movimentacoesPorMes = agruparMovimentacoesPorMes(tipoMaterial, ordemDeCompra);

    setSelectedStock({
    id: tipoMaterial,
    material: tipoMaterial,
    dataPedido: ordem?.dataDeEmissao?.split("T")[0] || "Data não disponível",
    preco: ordem?.valorUnitario || 0,
    quantidade: ordem?.quantidade || 0,
    descricaoMaterial: ordem?.descricaoMaterial || "Descrição não informada",
    valorKg: ordem?.valorKg || 0,
    valorPeca: ordem?.valorPeca || 0,
    pendenciaAlterada: ordem?.pendenciaAlterada || false,
    // Adicionar as movimentações agrupadas
    movimentacoesPorMes: movimentacoesPorMes
  });

    setShowPopup(true);
  };

  if (!autenticacaoPassou) return null;

  return (
    <div className="IndexMaterial">
      <div className="container">
        <NavBar />

        <div className="filter-header">
          <select
            id="select-Filtro-Material"
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
          >
            <option id="select-Filtro-Material" value="" color="#FFFFFFF">
              Todos Materiais
            </option>
            {materiais.map((material, index) => (
              <option key={index} value={material}>
                {material}
              </option>
            ))}
          </select>



          <div id="FiltroData">
            <span id="textFiltro">
              <h5>Início:</h5>
            </span>
            <input
              className="inputEstoque"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div id="FiltroData">
            <span id="textFiltro">
              <h5>Fim:</h5>
            </span>
            <input
              className="inputEstoque"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Pesquisar material, fornecedor ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="containerDashMaterial">
          <div className="dashboardMaterial">
            <h2>Dashboard Material</h2>

            <div id="charts-superior-material">
              <div>
                <div id="chart-produtos" className="chart">
                  <div id="titulo">
                    <h4
                      style={{
                        width: "100%",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "700",
                        textAlign: "center",
                        margin: "0 0 15px 0",
                        padding: "8px",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "6px",
                        borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                        letterSpacing: "0.5px",
                      }}
                    >
                     Movimentações De Materiais Em Estoque
                    </h4>
                  </div>
                  {materiais.length > 0 ? (
                    materiais.map((material, index) => (
                      <div
                        id="Produto"
                        key={index}
                        onClick={() => handleStockClick(material)}
                        style={{ cursor: 'pointer' }}
                      >
                        {material}
                      </div>
                    ))
                  ) : (
                    <div id="Produto">Nenhum material encontrado</div>
                  )}
                </div>
              </div>

              <div className="KpiMaterialDash">
                <div id="chart-aviso" className="chart">
                  <div
                    style={{
                      color: "#FF4C4C",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {mensagemMinimo || "Aguardando dados..."}
                  </div>
                </div>

                <div id="chart-aviso2" className="chart">
                  <div
                    style={{
                      color: "#4CAF50",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {mensagemMeta || "Aguardando dados..."}
                  </div>
                </div>

                <div id="chart-aviso3" className="chart">
                  <div
                    style={{
                      color: "#4586AB",
                      fontWeight: "bold",
                      fontSize: "16px",
                      textAlign: "center",
                    }}
                  >
                    {selectedMaterial
                      ? `Filtro: ${selectedMaterial}`
                      : "Todos os materiais"}
                  </div>
                </div>
              </div>

              <div id="pie_chart1" className="chart">
                <h1
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "700",
                    textAlign: "center",
                    margin: "0 0 15px 0",
                    padding: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    letterSpacing: "0.5px",
                  }}
                >
                  Tipo De Transferência
                </h1>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <Chart
                    chartType="PieChart"
                    data={pieData}
                    options={{
                      backgroundColor: "transparent",
                      chartArea: {
                        width: "70%",
                        height: "75%",
                      },
                      pieHole: 0.4,
                      pieSliceText: "percentage",
                      pieSliceTextStyle: {
                        color: "white",
                        fontSize: 12,
                        bold: true,
                      },
                      legend: {
                        position: "none",
                      },
                      colors: [
                        "#4586AB",
                        "#7EB9D9",
                        "#05314C",
                        "#2E6B8A",
                        "#1A4D6B",
                      ],
                      slices: {
                        1: { offset: 0.03 },
                      },
                      pieSliceBorderColor: "#05314C",
                      tooltip: {
                        showColorCode: true,
                        textStyle: {
                          color: '#05314C',
                          fontSize: 13
                        },
                      },
                      animation: {
                        startup: true,
                        duration: 1000,
                        easing: "out",
                      },
                    }}
                    width="100%"
                    height="90%"
                  />
                </div>
              </div>
            </div>

            <div id="charts-inferior">
              <div id="bar_chartMaterial" className="chart">
                <h1
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "700",
                    textAlign: "center",
                    margin: "0 0 15px 0",
                    padding: "8px 0",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    letterSpacing: "0.5px",
                  }}
                >
                  Estoque Atual vs. Estoque Mínimo
                </h1>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <Chart
                    chartType="ColumnChart"
                    data={barData}
                    options={{
                      backgroundColor: "transparent",
                      legend: "none",
                      hAxis: { textStyle: { color: "white" } },
                      vAxis: { textStyle: { color: "white" } },
                      colors: ["#4586AB", "#FF4C4C"],
                      chartArea: {
                        width: "80%",
                        height: "65%",
                      },
                    }}
                    width="100%"
                    height="280px"
                  />
                </div>
              </div>
              {/* <div id="line_chart" className="chart">
                <h1
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "700",
                    textAlign: "center",
                    margin: "0 0 15px 0",
                    padding: "8px 0",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    letterSpacing: "0.5px",
                  }}
                >
                  Movimentações de Material
                </h1>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <Chart
                    chartType="LineChart"
                    data={lineData}
                    options={{
                      backgroundColor: "transparent",
                      legend: "none",
                      hAxis: { textStyle: { color: "white" } },
                      vAxis: { textStyle: { color: "white" } },
                      colors: ["#4586AB"],
                      chartArea: {
                        width: "80%",
                        height: "85%",
                      },
                    }}
                    width="100%"
                    height="280px"
                  />
                </div>
              </div> */}
            </div>
          </div>

          <div className="alerts">
            <h3>Alertas do Sistema</h3>
            <ul id="alert-list">
              {alertas.map((alerta) => (
                <li
                  key={alerta.id}
                  className={`alert-${alerta.prioridade} alert-clickable`}
                  onClick={() => handleAlertClick(alerta)}
                >
                  <div className="alert-content">
                    {getAlertIcon(alerta.prioridade)}
                    <span className="alert-text">{alerta.texto}</span>
                    <span className="alert-hint">clique para detalhes</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal de detalhes do alerta */}
        {isModalOpen && selectedAlert && (
          <div className="alert-modal-overlay" onClick={closeModal}>
            <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
              <div className="alert-modal-header">
                <h3>Detalhes do Alerta</h3>
                <fechar className="close-modal" onClick={closeModal}>
                  <X size={20} />
                </fechar>
              </div>
              <div className="alert-modal-content">
                <div className="alert-title">
                  {getAlertIcon(selectedAlert.prioridade)}
                  <span>{selectedAlert.texto}</span>
                </div>
                <div className="alert-details">
                  {Object.entries(selectedAlert.detalhes).map(
                    ([key, value]) => (
                      <div key={key} className="detail-item">
                        <strong>
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, " $1")}
                          :
                        </strong>
                        <span>
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="alert-modal-footer">
                <button className="btn-close" onClick={closeModal}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
        {showPopup && selectedStock && (
          <div className="popup-overlay" onClick={closeModal}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>{selectedStock.material}</h3>
                <div className="close-button" onClick={closeModal}>
                  <X size={20} />
                </div>
              </div>

              <div className="popup-body">
                {/* MOVIMENTAÇÕES POR MÊS */}
                <div className="popup-section">
                  <h4>Movimentações por Mês</h4>
                  <div className="info-grid">
                    {selectedStock.movimentacoesPorMes && selectedStock.movimentacoesPorMes.length > 0 ? (
                      selectedStock.movimentacoesPorMes.map((movimentacao, index) => (
                        <div key={index} className="info-item">
                          <span className="info-label">
                            {movimentacao.nomeMes} {movimentacao.ano}
                          </span>
                          <span className="info-value">
                            No mês de {movimentacao.nomeMes.toLowerCase()} foram movimentadas {movimentacao.quantidadeTotal} unidades desse material
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="info-item">
                        <span className="info-label">Sem movimentações</span>
                        <span className="info-value">
                          Nenhuma movimentação encontrada para este material
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
