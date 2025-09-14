import React, { useState, useEffect, useRef, useMemo } from "react";
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

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedFornecedor, setSelectedFornecedor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Estados para dados
  const [fornecedores, setFornecedores] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [ordemDeCompra, setOrdemDeCompra] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [fornecedoresPage, setFornecedoresPage] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [paginasTotais, setPaginasTotais] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fornecedoresPorPagina = 6;

  // Estado para controlar o carrossel de materiais
  const [materialIndices, setMaterialIndices] = useState({});

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

  // Função para buscar fornecedores
  function getFornecedor() {
    api
      .get("/fornecedores")
      .then((response) => {
        const fornecedores = response.data;
        setFornecedores(fornecedores);
        console.log("Fornecedores carregados:", fornecedores);
      })
      .catch((error) => {
        console.error("Erro ao buscar fornecedores:", error);
      });
  }

  // Função para buscar ordens de compra
  function BuscarOrdemDeCompra() {
    api
      .get("/ordemDeCompra")
      .then((response) => {
        const ordens = response.data;
        setOrdemDeCompra(ordens);
        console.log("Ordens de compra carregadas:", ordens);
      })
      .catch((error) => {
        console.error("Erro ao buscar ordens de compra:", error);
      });
  }

  // Função para buscar estoque
  function getEstoque() {
    api
      .get("/estoque")
      .then((response) => {
        const estoqueData = response.data;
        setEstoque(estoqueData);
        console.log("Estoque carregado:", estoqueData);
      })
      .catch((error) => {
        console.error("Erro ao buscar estoque:", error);
      });
  }


  function getFornecedoresPaginados() {

    const paginaInt = Number(paginaAtual) || 0;
    api.
      get(`/fornecedores/paginados?pagina=${paginaInt}&tamanho=${fornecedoresPorPagina}`)
      .then((response) => {
        const { data, paginasTotais, totalItems, paginaAtual, hasNext, hasPrevious } = response.data;

        // console.log("dataaaa: ", data)

        setFornecedoresPage(data);
        setPaginasTotais(paginasTotais);
        setTotalItems(totalItems);
        setPaginaAtual(paginaAtual);
        setHasNext(hasNext);
        setHasPrevious(hasPrevious);
      })
      .catch((err) => {
        console.error("Erro ao buscar fornecedores paginados:", err);
      });
  }

  // Função de parsing de data melhorada
  const parseDate = (dateString) => {
    if (!dateString) return null;

    if (dateString.includes("T")) {
      return new Date(dateString);
    }

    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return new Date(year, month - 1, day);
    }

    return new Date(dateString);
  };

  // Função para agrupar dados por fornecedor e especificação
  const groupedData = useMemo(() => {
    const filtered = selectedFornecedor
      ? fornecedores.filter(
        (f) =>
          (f.nomeFantasia || f.razaoSocial || f.id) === selectedFornecedor
      )
      : fornecedores;

    if (selectedFornecedor) {
      // Se um fornecedor específico está selecionado, agrupa por especificação
      const grouped = filtered.reduce((acc, item) => {
        const key = item.especificacao;
        if (!acc[key]) {
          acc[key] = {
            especificacao: key,
            receita: 0,
            fornecedor: selectedFornecedor,
          };
        }
        acc[key].receita += item.receita;
        return acc;
      }, {});

      return Object.values(grouped);
    } else {
      // Se nenhum fornecedor específico, agrupa por fornecedor
      const grouped = filtered.reduce((acc, item) => {
        const key = item.nomeFantasia || item.razaoSocial || item.id;
        if (!acc[key]) {
          acc[key] = {
            fornecedor: key,
            receita: 0,
            especificacoes: new Set(),
          };
        }
        acc[key].receita += item.receita;
        acc[key].especificacoes.add(item.especificacao);
        return acc;
      }, {});

      return Object.values(grouped).map((item) => ({
        ...item,
        especificacoes: Array.from(item.especificacoes),
      }));
    }
  }, [selectedFornecedor, fornecedores]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSearch = () => {
    if (fornecedores.length === 0 || ordemDeCompra.length === 0) {
      setFilteredSuppliers([]);
      return;
    }

    // Filtra ordens de compra
    const ordensFiltered = ordemDeCompra.filter((ordem) => {
      const materialMatch =
        !selectedMaterial ||
        ordem?.estoque?.tipoMaterial === selectedMaterial ||
        ordem?.descricaoMaterialCompleta?.includes(selectedMaterial);

      let dateInRange = true;
      if (startDate || endDate) {
        const ordemDate = parseDate(ordem.dataDeEmissao);
        if (ordemDate) {
          const startDateObj = startDate ? new Date(startDate) : null;
          const endDateObj = endDate ? new Date(endDate) : null;
          dateInRange =
            (!startDateObj || ordemDate >= startDateObj) &&
            (!endDateObj || ordemDate <= endDateObj);
        }
      }
      return materialMatch && dateInRange;
    });

    // Filtra fornecedores
    const fornecedoresFiltrados = fornecedores.filter((fornecedor) => {
      const nameMatch =
        !searchTerm ||
        fornecedor.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase());

      const temOrdemValida = ordensFiltered.some(
        (ordem) =>
          ordem.fornecedorId === fornecedor.id ||
          ordem.fornecedor?.id === fornecedor.id
      );

      return (
        nameMatch &&
        (ordensFiltered.length === ordemDeCompra.length || temOrdemValida)
      );
    });

    // Aplica paginação nos resultados filtrados
    const itemsPerPage = fornecedoresPorPagina || 6;
    const startIndex = paginaAtual * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const fornecedoresPaginados = fornecedoresFiltrados.slice(startIndex, endIndex);

    // Atualiza o estado de fornecedoresPage com os resultados paginados
    setFornecedoresPage(fornecedoresPaginados);

    // Atualiza informações de paginação baseado nos dados filtrados
    const totalPaginasFiltradas = Math.ceil(fornecedoresFiltrados.length / itemsPerPage);
    setPaginasTotais(totalPaginasFiltradas);
    setTotalItems(fornecedoresFiltrados.length);
    setHasNext(paginaAtual < totalPaginasFiltradas - 1);
    setHasPrevious(paginaAtual > 0);

    // Mantém compatibilidade com o estado filteredSuppliers se necessário
    setFilteredSuppliers(fornecedoresFiltrados);

    // Salvar as ordens filtradas em um estado separado
    setOrdensFiltradasParaGrafico(ordensFiltered);

    // Atualiza KPI baseado nas ordens filtradas
    const kpiData = gerarDadosKPI(ordensFiltered);
    setKpiData(kpiData);
  };

  const [ordensFiltradasParaGrafico, setOrdensFiltradasParaGrafico] = useState(
    []
  );

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMaterial('');
    setStartDate('');
    setEndDate('');
    setPaginaAtual(0);

    // Volta a buscar dados paginados do servidor
    getFornecedoresPaginados(0);
  };


  useEffect(() => {
    const hasFilters = searchTerm || selectedMaterial || startDate || endDate;

    if (!hasFilters) {
      getFornecedoresPaginados(paginaAtual);
    }
  }, [paginaAtual]);

  // Efeito para aplicar filtros quando os critérios mudam
  useEffect(() => {
    if (fornecedores.length > 0 && ordemDeCompra.length > 0) {
      if (ordensFiltradasParaGrafico.length === 0) {
        setOrdensFiltradasParaGrafico(ordemDeCompra);
      }
      handleSearch();
    }
  }, [
    searchTerm,
    selectedMaterial,
    selectedFornecedor,
    startDate,
    endDate,
    fornecedores,
    ordemDeCompra,
    paginaAtual
  ]);

  // Carregamento inicial dos dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        await getFornecedor();
        await getEstoque();
        await BuscarOrdemDeCompra();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    if (autenticacaoPassou) {
      carregarDados();
    }
  }, [autenticacaoPassou]);

  if (!autenticacaoPassou) return null;

  // Função para gerar KPI
  function gerarDadosKPI(ordens) {
    var statsPorFornecedor = {};

    for (var i = 0; i < ordens.length; i++) {
      var ordem = ordens[i];
      var fornecedorId = ordem.fornecedorId || ordem.fornecedor?.id;

      if (!fornecedorId) continue;

      var fornecedorNome =
        ordem.nomeFornecedor ||
        ordem.fornecedor?.nomeFantasia ||
        "Fornecedor " + fornecedorId;
      var material =
        ordem.descricaoMaterialCompleta || ordem.estoque?.tipoMaterial || "N/A";

      var valorUnitario = Number(ordem.valorUnitario || 0);
      var quantidade = Number(ordem.quantidade || 0);
      var valorTotalOrdem = valorUnitario * quantidade;

      if (!statsPorFornecedor[fornecedorId]) {
        statsPorFornecedor[fornecedorId] = {
          valorTotalAcumulado: 0,
          totalQuantity: 0,
          nome: fornecedorNome,
          materiais: new Set(),
          numeroOrdens: 0,
        };
      }

      statsPorFornecedor[fornecedorId].valorTotalAcumulado += valorTotalOrdem;
      statsPorFornecedor[fornecedorId].totalQuantity += quantidade;
      statsPorFornecedor[fornecedorId].materiais.add(material);
      statsPorFornecedor[fornecedorId].numeroOrdens++;
    }

    if (selectedFornecedor) {
      var kpisPorMaterial = [];
      var fornecedorSelecionado = null;

      for (var fornecedorId in statsPorFornecedor) {
        var stats = statsPorFornecedor[fornecedorId];
        if (stats.nome === selectedFornecedor) {
          fornecedorSelecionado = stats;
          break;
        }
      }

      if (fornecedorSelecionado) {
        Array.from(fornecedorSelecionado.materiais).forEach(function (
          material
        ) {
          var valorMaterial = 0;
          var quantidadeMaterial = 0;

          for (var j = 0; j < ordens.length; j++) {
            var ordem = ordens[j];
            var ordemMaterial =
              ordem.descricaoMaterialCompleta ||
              ordem.estoque?.tipoMaterial ||
              "N/A";
            var ordemFornecedor =
              ordem.nomeFornecedor || ordem.fornecedor?.nomeFantasia;

            if (
              ordemMaterial === material &&
              ordemFornecedor === selectedFornecedor
            ) {
              valorMaterial +=
                Number(ordem.valorUnitario || 0) *
                Number(ordem.quantidade || 0);
              quantidadeMaterial += Number(ordem.quantidade || 0);
            }
          }

          kpisPorMaterial.push({
            fornecedorId: fornecedorId + "_" + material,
            supplierName: selectedFornecedor,
            materialIndividual: material,
            valorTotalAcumulado: valorMaterial,
            quantidadeTotal: quantidadeMaterial,
            precoMedioUnitario:
              quantidadeMaterial > 0 ? valorMaterial / quantidadeMaterial : 0,
            numeroOrdens: fornecedorSelecionado.numeroOrdens,
          });
        });
      }
      return kpisPorMaterial;
    } else if (selectedMaterial) {
      var listaFinal = [];
      for (var fornecedorId in statsPorFornecedor) {
        var stats = statsPorFornecedor[fornecedorId];

        var temMaterialFiltrado = Array.from(stats.materiais).some(function (
          material
        ) {
          return (
            material.includes(selectedMaterial) ||
            selectedMaterial.includes(material)
          );
        });

        if (temMaterialFiltrado) {
          listaFinal.push({
            fornecedorId: fornecedorId,
            supplierName: stats.nome,
            valorTotalAcumulado: stats.valorTotalAcumulado,
            quantidadeTotal: stats.totalQuantity,
            precoMedioUnitario:
              stats.totalQuantity > 0
                ? stats.valorTotalAcumulado / stats.totalQuantity
                : 0,
            tiposMateriaisString: Array.from(stats.materiais).join(", "),
            numeroOrdens: stats.numeroOrdens,
          });
        }
      }

      return listaFinal.sort(
        (a, b) => b.valorTotalAcumulado - a.valorTotalAcumulado
      );
    } else {
      var listaFinal = [];
      for (var fornecedorId in statsPorFornecedor) {
        var stats = statsPorFornecedor[fornecedorId];

        var materiaisDetalhados = [];
        Array.from(stats.materiais).forEach(function (material) {
          var valorMaterial = 0;
          var quantidadeMaterial = 0;

          for (var j = 0; j < ordens.length; j++) {
            var ordem = ordens[j];
            var ordemMaterial =
              ordem.descricaoMaterialCompleta ||
              ordem.estoque?.tipoMaterial ||
              "N/A";
            var ordemFornecedor =
              ordem.nomeFornecedor || ordem.fornecedor?.nomeFantasia;

            if (ordemMaterial === material && ordemFornecedor === stats.nome) {
              valorMaterial +=
                Number(ordem.valorUnitario || 0) *
                Number(ordem.quantidade || 0);
              quantidadeMaterial += Number(ordem.quantidade || 0);
            }
          }

          materiaisDetalhados.push({
            material: material,
            valorTotalAcumulado: valorMaterial,
            quantidadeTotal: quantidadeMaterial,
            precoMedioUnitario:
              quantidadeMaterial > 0 ? valorMaterial / quantidadeMaterial : 0,
          });
        });

        listaFinal.push({
          fornecedorId: fornecedorId,
          supplierName: stats.nome,
          valorTotalAcumulado: stats.valorTotalAcumulado,
          quantidadeTotal: stats.totalQuantity,
          precoMedioUnitario:
            stats.totalQuantity > 0
              ? stats.valorTotalAcumulado / stats.totalQuantity
              : 0,
          tiposMateriaisString: Array.from(stats.materiais).join(", "),
          numeroOrdens: stats.numeroOrdens,
          materiaisDetalhados: materiaisDetalhados,
        });
      }

      return listaFinal.sort(
        (a, b) => b.valorTotalAcumulado - a.valorTotalAcumulado
      );
    }
  }

  // Função para lidar com clique no fornecedor
  const handleSupplierClick = (supplier) => {
    const ordem = ordemDeCompra.find(
      (ordem) =>
        ordem.fornecedorId === supplier.id ||
        ordem.fornecedor?.id === supplier.id
    );

    setSelectedSupplier({
      ...supplier,
      fornecedorId: supplier.id,
    });
    setShowPopup(true);
  };

  // Função para gerar dados do gráfico de barras
  function generateBarData(ordensDeCompra, startDateFilter, endDateFilter) {
    var months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Determinar o range de anos baseado nos filtros
    var anoInicio, anoFim;

    if (startDateFilter || endDateFilter) {
      anoInicio = startDateFilter
        ? new Date(startDateFilter).getFullYear()
        : new Date().getFullYear();
      anoFim = endDateFilter
        ? new Date(endDateFilter).getFullYear()
        : new Date().getFullYear();
    } else {
      anoInicio = anoFim = new Date().getFullYear();
    }

    var totalQuantidade = 0;
    for (var i = 0; i < ordensDeCompra.length; i++) {
      var quantidade = ordensDeCompra[i].quantidade || 0;
      totalQuantidade += quantidade;
    }

    if (totalQuantidade === 0) {
      var resultadoVazio = [["Mês", "Produção", "Meta"]];
      for (var j = 0; j < months.length; j++) {
        resultadoVazio.push([months[j], 0, 0]);
      }
      return resultadoVazio;
    }

    var meta = Math.floor(totalQuantidade * 0.75);
    var producaoMensal = new Array(12).fill(0);

    for (var k = 0; k < ordensDeCompra.length; k++) {
      var ordem = ordensDeCompra[k];
      if (ordem.dataDeEmissao && ordem.quantidade) {
        var dataEmissao = parseDate(ordem.dataDeEmissao);
        if (dataEmissao) {
          var mesEmissao = dataEmissao.getMonth();
          var anoEmissao = dataEmissao.getFullYear();

          if (
            anoEmissao >= anoInicio &&
            anoEmissao <= anoFim &&
            mesEmissao >= 0 &&
            mesEmissao <= 11
          ) {
            producaoMensal[mesEmissao] += ordem.quantidade;
          }
        }
      }
    }

    var resultadoFinal = [["Mês", "Entrada de Material", "Meta"]];
    for (var m = 0; m < months.length; m++) {
      var labelMes = months[m];
      if (
        anoInicio !== new Date().getFullYear() ||
        anoFim !== new Date().getFullYear()
      ) {
        labelMes += ` ${anoInicio === anoFim ? anoInicio : anoInicio + "-" + anoFim
          }`;
      }
      resultadoFinal.push([labelMes, producaoMensal[m], meta]);
    }

    return resultadoFinal;
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage <= paginasTotais && newPage !== paginaAtual) {
      setPaginaAtual(newPage);
    }
  };

  const barData = generateBarData(
    ordensFiltradasParaGrafico.length > 0
      ? ordensFiltradasParaGrafico
      : ordemDeCompra,
    startDate,
    endDate
  );

  const closePopup = () => {
    setShowPopup(false);
    setSelectedSupplier(null);
  };

  // Funções do carrossel
  const handlePrevMaterial = (fornecedorId) => {
    setMaterialIndices(prev => ({
      ...prev,
      [fornecedorId]: Math.max(0, (prev[fornecedorId] || 0) - 1)
    }));
  };

  const handleNextMaterial = (fornecedorId) => {
    const kpiItem = kpiData.find(item => item.fornecedorId === fornecedorId);
    if (kpiItem && kpiItem.materiaisDetalhados) {
      const maxIndex = kpiItem.materiaisDetalhados.length - 1;
      setMaterialIndices(prev => ({
        ...prev,
        [fornecedorId]: Math.min(maxIndex, (prev[fornecedorId] || 0) + 1)
      }));
    }
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
              {[...new Set(estoque.map((item) => item.tipoMaterial))].map(
                (tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                )
              )}
            </select>
            <select
              id="select-Filtro-Fornecedor"
              value={selectedFornecedor}
              onChange={(e) => setSelectedFornecedor(e.target.value)}
            >
              <option value="">Todos fornecedores</option>
              {[
                ...new Set(
                  fornecedores.map(
                    (f) => f.nomeFantasia || f.razaoSocial || f.id
                  )
                ),
              ].map((nome, idx) => (
                <option key={nome + idx} value={nome}>
                  {nome}
                </option>
              ))}
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
            </div>
          </div>
        </div>

        <div className="containerDashFornecedor">
          <div className="dashboardFornecedor">
            <h2>Custos por Fornecedor</h2>

            <div id="charts-superior">
              <div id="Kpi">
                {kpiData.map(function (item, index) {
                  const currentMaterialIndex = materialIndices[item.fornecedorId] || 0;
                  const currentMaterial = item.materiaisDetalhados && item.materiaisDetalhados.length > 0
                    ? item.materiaisDetalhados[currentMaterialIndex]
                    : null;

                  return (
                    <React.Fragment key={item.fornecedorId}>
                      <div
                        id={"chart-aviso-fornecedor" + (index + 1)}
                        className="chart"
                      >
                        {/* Nome do fornecedor */}
                        <div className="kpi-title">{item.supplierName}</div>

                        {/* Lista de materiais (resumida) */}
                        <div className="kpi-subtitle">
                          {item.tiposMateriaisString}
                        </div>

                        {/* Totais do fornecedor */}
                        <div className="kpi-data">
                          <div>
                            <span>Gastos Totais:</span>
                            <span className="value-green">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.valorTotalAcumulado)}
                            </span>
                          </div>
                          <div>
                            <span>Quantidade Total:</span>
                            <span className="value-green">
                              {item.quantidadeTotal}
                            </span>
                          </div>
                          <div>
                            <span>Preço Médio Unitário:</span>
                            <span className="value-green">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.precoMedioUnitario)}
                            </span>
                          </div>
                        </div>

                        {/* Detalhes por material com carrossel funcional */}
                        {item.materiaisDetalhados && item.materiaisDetalhados.length > 0 && (
                          <div className="material-navigation-container">
                            <div className="material-header">
                              <h5>Detalhes por Material</h5>
                            </div>
                            
                            <div className="kpi-materials">
                              <div className="kpi-material">
                                <strong>{currentMaterial.material}</strong>
                                <div className="material-details">
                                  <div>
                                    <span>Gastos:</span>
                                    <span className="value-green">
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(currentMaterial.valorTotalAcumulado)}
                                    </span>
                                  </div>
                                  <div>
                                    <span>Quantidade:</span>
                                    <span className="value-green">
                                      {currentMaterial.quantidadeTotal}
                                    </span>
                                  </div>
                                  <div>
                                    <span>Preço Médio Unitário:</span>
                                    <span className="value-green">
                                      {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      }).format(currentMaterial.precoMedioUnitario)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Setas de navegação funcionais */}
                            {item.materiaisDetalhados.length > 1 && (
                              <div className="material-navigation-arrows">
                                <button 
                                  onClick={() => handlePrevMaterial(item.fornecedorId)}
                                  className="nav-arrow prev-arrow"
                                  title="Material anterior"
                                  disabled={currentMaterialIndex === 0}
                                >
                                  &#8249;
                                </button>
                                <span className="material-counter">
                                  {currentMaterialIndex + 1} / {item.materiaisDetalhados.length}
                                </span>
                                <button 
                                  onClick={() => handleNextMaterial(item.fornecedorId)}
                                  className="nav-arrow next-arrow"
                                  title="Próximo material"
                                  disabled={currentMaterialIndex === item.materiaisDetalhados.length - 1}
                                >
                                  &#8250;
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="supplier-table-container-fornecedor">
            <h3>Fornecedores</h3>
            <div className="table-wrapper">
              <table className="supplier-table">
                <thead>
                  <tr>
                    <th>Nome do Fornecedor</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedoresPage.map((supplier, index) => (
                    <tr
                      key={supplier.id || index}
                      onClick={() => handleSupplierClick(supplier)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {supplier.nomeFantasia ||
                          supplier.razaoSocial ||
                          "Nome não informado"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="1">
                      <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}>
                        <button
                          disabled={!hasPrevious}
                          onClick={() => handlePageChange(Number(paginaAtual) - 1)}
                        >
                          {"<"}
                        </button>
                        <span>
                          {paginaAtual + 1}/{paginasTotais}
                        </span>
                        <button
                          disabled={!hasNext}
                          onClick={() => handlePageChange(paginaAtual + 1)}
                        >
                          {">"}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="search-results">
              <p>{filteredSuppliers.length} fornecedores encontrados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Modal */}
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
              {/* CONTATO */}
              <div className="popup-section">
                <h4>Contato</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Telefone:</span>
                    <span className="info-value">
                      {selectedSupplier.telefone}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedSupplier.email}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Endereço:</span>
                    <span className="info-value">
                      {selectedSupplier.complemento}
                    </span>
                  </div>
                </div>
              </div>

              {/* ORDENS DE COMPRA DO FORNECEDOR */}
              <div className="popup-section">
                <h4>
                  Ordens de Compra 
                </h4>

                <div className="info-grid">
                  <div className="info-item">
                  <span className="info-label">Ordens de compra:</span>
                  <span className="info-value">
                Esse fornecedor realizou {ordemDeCompra.filter(
                    (ordem) => ordem.fornecedorId === selectedSupplier.fornecedorId
                  ).length} ordens de compra
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
