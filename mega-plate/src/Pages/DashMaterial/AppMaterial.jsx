// App.jsx - Dashboard Material com NavBar integrada, filtros dinâmicos baseados no estoque e alertas clicáveis
import React, { useState, useEffect, useRef } from "react";
import { Chart } from "react-google-charts";
import { Search, X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import "../DashMaterial/styleMaterial.css";
import NavBar from "../../components/NavBar"; // Importando a NavBar
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../../provider/api";

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
  const [transferencias, setTransferencias] = useState([]);

  // Estado para modal de detalhes do alerta
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Estados para KPIs
  const [mensagemMinimo, setMensagemMinimo] = useState("");
  const [mensagemMeta, setMensagemMeta] = useState("");

  // Função para buscar dados do estoque
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

  // Função para buscar dados das transferências
   function getTransferencias() {
    api.get("/transferencias")
      .then((resposta) => {
        const dados = resposta.data || [];
        setTransferencias(dados);
        console.log("=== DEBUG API ===");
        console.log("Transferências recebidas:", dados);

        if (dados.length > 0) {
          inicializarGraficoTransferencias(dados);
        } else {
          setPieData([
            ["Tipo de Transferência", "Quantidade"],
            ["Sem transferências", 1],
          ]);
        }
      })
      .catch((err) => {
        console.log("Erro ao buscar transferências:", err);
        setPieData([
          ["Tipo de Transferência", "Quantidade"],
          ["Erro ao carregar", 1],
        ]);
      });
  }

  // Função que prepara os dados para o gráfico
  const inicializarGraficoTransferencias = (dados) => {
  console.log("=== Estrutura dos dados ===");
  console.log("Primeiro item:", dados[0]);
  console.log("Propriedades disponíveis:", Object.keys(dados[0]));

  // Criar acumuladores
  const totais = { C1: 0, C2: 0, C3: 0, C4: 0 };

  dados.forEach((item) => {
    const setor = item.setor; // "C1", "C2", ...
    const qtd = item.quantidadeTransferida || 0;

    if (totais[setor] !== undefined) {
      totais[setor] += qtd;
    }
  });

  console.log("=== Totais calculados ===", totais);

  const totalGeral = Object.values(totais).reduce((acc, val) => acc + val, 0);

  if (totalGeral === 0) {
    setPieData([
      ["Tipo de Transferência", "Quantidade"],
      ["Sem transferências", 1],
    ]);
    return;
  }

  // Montar dados para o gráfico
  const newPieData = [["Tipo de Transferência", "Quantidade"]];
  Object.entries(totais).forEach(([setor, valor]) => {
    if (valor > 0) {
      newPieData.push([setor, valor]);
    }
  });

  // Mostrar porcentagens no console
  console.log("=== Porcentagens ===");
  Object.entries(totais).forEach(([setor, valor]) => {
    if (valor > 0) {
      const perc = ((valor / totalGeral) * 100).toFixed(1);
      console.log(`${setor}: ${valor} (${perc}%)`);
    }
  });

  console.log("Dados finais do gráfico:", newPieData);
  setPieData(newPieData);
};

  // Função para inicializar os gráficos de estoque
  const inicializarGraficos = (dadosEstoque) => {
    if (!dadosEstoque || dadosEstoque.length === 0) {
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

    // Contar materiais para gráfico de barras
    const materialCounts = {};
    dadosEstoque.forEach((item) => {
      materialCounts[item.tipoMaterial] =
        (materialCounts[item.tipoMaterial] || 0) + (item.quantidadeAtual || 0);
    });

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

  // useEffect para carregar dados iniciais
  useEffect(() => {
    getEstoque();
    getTransferencias();
  }, []);

  // useEffect para atualizar gráfico de transferências quando os dados chegarem
  useEffect(() => {
    if (transferencias && transferencias.length > 0) {
      inicializarGraficoTransferencias(transferencias);
    }
  }, [transferencias]);

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
    if (dateString && typeof dateString === "string") {
      if (dateString.includes("T")) {
        return new Date(dateString);
      }
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        return new Date(year, month - 1, day);
      }
    }
    return new Date(dateString);
  };

  // Função para filtrar dados baseada nos filtros do estoque
  const aplicarFiltros = () => {
    if (!estoqueData || estoqueData.length === 0) return;

    // Filtrar dados do estoque
    const filtered = estoqueData.filter((item) => {
      const materialMatch =
        !selectedMaterial || item.tipoMaterial === selectedMaterial;

      const transferTypeMatch =
        !selectedTransferType ||
        (item.tipoTransferencia &&
          item.tipoTransferencia === selectedTransferType);

      let dateInRange = true;
      if (item.ultimaMovimentacao && (startDate || endDate)) {
        const itemDate = parseDate(item.ultimaMovimentacao);
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        dateInRange =
          (!startDateObj || itemDate >= startDateObj) &&
          (!endDateObj || itemDate <= endDateObj);
      }

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

    // Atualizar gráfico de barras (Estoque Atual vs Estoque Mínimo)
    const materialCounts = {};
    filtered.forEach((item) => {
      materialCounts[item.tipoMaterial] =
        (materialCounts[item.tipoMaterial] || 0) + (item.quantidadeAtual || 0);
    });

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

    setBarData(newBarData);

    // Atualizar mensagens de KPI
    if (materiaisAbaixoMinimo.length > 0) {
      const mensagemAlerta = `${
        materiaisAbaixoMinimo.length
      } material(is) abaixo do estoque mínimo: ${materiaisAbaixoMinimo
        .map((item) => `${item.material} (${item.atual}/${item.minimo})`)
        .join(", ")}`;
      setMensagemMinimo(mensagemAlerta);
    } else {
      setMensagemMinimo("Não há nenhum material abaixo do minímo");
    }

    // Lógica para materiais acima da meta (75% do máximo)
    const materiaisAcimaMeta = [];

    if (Object.keys(materialCounts).length > 0) {
      Object.entries(materialCounts).forEach(([material, quantidadeAtual]) => {
        const materialInfo = filtered.find(
          (item) => item.tipoMaterial === material
        );
        const quantidadeMaxima = materialInfo
          ? materialInfo.quantidadeMaxima || 0
          : 0;

        const metaAlerta = quantidadeMaxima * 0.75;

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
      const mensagemMeta = `${
        materiaisAcimaMeta.length
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
                      Materiais em Estoque
                    </h4>
                  </div>
                  {materiais.length > 0 ? (
                    materiais.map((materiais, index) => (
                      <div id="Produto" key={index}>
                        {materiais}
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
                        width: "80%", // Ajustado para dar espaço à legenda
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
                        position: "right", // Alterado de 'none' para 'right'
                        textStyle: { 
                          color: "white", // Cor do texto da legenda
                          fontSize: 12 
                        },
                        alignment: "center"
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
                          fontSize: 0.1
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
      </div>
    </div>
  );
}

export default App;
