import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import styles from "./relatorios.module.css";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../components/toastify/ToastifyService.jsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import logoMegaPlate from "../../assets/logo-megaplate.png";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api.js";

// Função para criar lista de anos (ano atual até ano inicial)
function gerarListaAnos(anoInicial) {
  const anoAtual = new Date().getFullYear();
  const anos = [];

  for (let ano = anoAtual; ano >= anoInicial; ano--) {
    anos.push(ano);
  }

  return anos;
}

/* ---------- Componente principal ---------- */
export function Relatorios() {
  const navigate = useNavigate();
  const [filtroRelatorio, setFiltroRelatorio] = useState("todos");
  const todosAnos = gerarListaAnos(2018);
  const [inicio, setInicio] = useState(0);
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  const [isGestor, setIsGestor] = useState(false);
  const [ordens, setOrdens] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [fade, setFade] = useState(true);

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
  }, [navigate]);

  useEffect(() => {
    setFade(false); // inicia fade out
    const timeout = setTimeout(() => {
      setUsuarios([]);
      buscarOrdensDeCompra();
      setFade(true); // inicia fade in depois de buscar
    }, 200); // tempo de fade out antes de buscar

    return () => clearTimeout(timeout);
  }, [filtroStatus]);

  const buscarOrdensDeCompra = async () => {
    const token = sessionStorage.getItem("authToken");
    const cargoUsuario = sessionStorage.getItem("cargoUsuario");

    setIsGestor(Number(cargoUsuario) === 2);

    let url = "/ordemDeCompra";

    try {
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Res da API ordens:", res.data); // <-- debug aqui

      setOrdens(res.data);
    } catch (error) {
      console.error("Erro ao carregar ordens de compra:", error);
      toastError("Erro ao carregar ordens de compra");
    }
  };

  const anosVisiveis = todosAnos.slice(inicio, inicio + 7);

  const avancarAno = () => {
    if (inicio + 7 < todosAnos.length) setInicio(inicio + 1);
  };
  const voltarAno = () => {
    if (inicio > 0) setInicio(inicio - 1);
  };

  const dadosEntradasFake = [
    { label: "Total do Valor Gasto", valor: "R$ 1.450.000,00" },
    { label: "Material mais comprado", valor: "Chapa Aço 1020" },
  ];
  const dadosSaidasFake = [
    { label: "Total de Saídas", valor: "R$ 980.000,00" },
    { label: "Material mais saído", valor: "Bobina Galvanizada" },
  ];

  const listaRelatorios = [
    {
      tipo: "entradas",
      titulo: "Relatório Geral de Entradas",
      descricao:
        "Análise anual geral de preços com foco em fornecedores, sazonalidades e oscilações críticas que impactaram os custos.",
      botao: "BAIXAR RELATÓRIO COMPARATIVO ANUAL",
    },
    {
      tipo: "saidas",
      titulo: "Relatório Geral de Saídas",
      descricao:
        "Análise anual geral de saídas com comparativo de saídas internas e externas.",
      botao: "BAIXAR RELATÓRIO COMPARATIVO ANUAL",
    },
    {
      tipo: "fornecedores",
      titulo: "Relatório Comparativo de Fornecedores",
      descricao: "Análise dos fornecedores mais utilizados e desempenho anual.",
      botao: "FORNECEDORES",
    },
    {
      tipo: "materiais",
      titulo: "Relatório de Movimentações por Materiais",
      descricao: "Visão geral dos materiais mais movimentados no período.",
      botao: "MATERIAS",
    },
  ];

  const relatoriosFiltrados = listaRelatorios.filter(
    (r) => filtroRelatorio === "todos" || r.tipo === filtroRelatorio
  );

async function baixarExcelEntradas(ordens) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Entradas");

  // === Logo ===
  const response = await fetch(logoMegaPlate);
  const blob = await response.blob();
  const imageBuffer = await blob.arrayBuffer();

  const imageId = workbook.addImage({
    buffer: imageBuffer,
    extension: "png",
  });

  sheet.mergeCells("A1:I4");
  const faixa = sheet.getCell("A1");
  faixa.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "05314c" },
  };

  sheet.addImage(imageId, {
    tl: { col: 1.2, row: 0.2 },
    ext: { width: 120, height: 60 },
  });

  // === Título ===
  sheet.mergeCells("A6:I6");
  const tituloCell = sheet.getCell("A6");
  tituloCell.value = `Relatório de Entradas - ${anoSelecionado}`;
  tituloCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  tituloCell.alignment = { horizontal: "center", vertical: "middle" };
  tituloCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF05314C" },
  };

  // === Cabeçalho ===
  const header = [
    "Data",
    "Fornecedor",
    "Ordem de compra",
    "Produto",
    "Quantidade solicitada",
    "Preço unitário",
    "Preço total do pedido",
    "IPI",
    "Valor total",
  ];
  const headerRow = sheet.addRow(header);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D597B" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  function formatarDataBrasileira(dataISO) {
    if (!dataISO) return "N/A";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // === Linhas da tabela com zebra ===
  ordens.forEach((o, index) => {
    const row = sheet.addRow([
      formatarDataBrasileira(o.dataDeEmissao),
      o.nomeFornecedor || "Desconhecido",
      o.id || "N/A",
      o.tipoMaterial || "N/A",
      o.quantidade || 0,
      o.valorUnitario || 0,
      o.valorUnitario * o.quantidade || 0,
      o.ipi || 0,
      o.valorUnitario * o.quantidade * (1 + (o.ipi || 0) / 100) || 0,
    ]);

    // zebra: linhas pares cinza claro
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEFEFEF" }, // cinza claro
        };
      });
    }
  });

  // === Linha de totais ===
  const ultimaLinha = sheet.rowCount + 1;
  const totalRow = sheet.addRow([
    "Total:",
    "",
    "",
    "",
{ formula: `SUBTOTAL(9,E8:E${sheet.rowCount})` }, // Quantidade
    "", // preço unitário não soma
{ formula: `SUBTOTAL(9,G8:G${sheet.rowCount})` }, // Preço total do pedido
"",
{ formula: `SUBTOTAL(9,I8:I${sheet.rowCount})` }, // Valor total
  ]);

  // Formatar as colunas de valores em Real (BRL)
totalRow.getCell(7).numFmt = 'R$ #,##0.00'; // Coluna G (Preço total pedido)
totalRow.getCell(9).numFmt = 'R$ #,##0.00'; // Coluna I (Valor total)

  totalRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D597B" }, // azul escuro
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // === Ativa filtros ===
  sheet.autoFilter = {
    from: "A7",
    to: `I${ultimaLinha - 1}`,
  };

  // === Ajusta largura ===
  sheet.columns.forEach((col) => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : "";
      if (cellValue.length > maxLength) maxLength = cellValue.length;
    });
    col.width = maxLength + 5;
  });

  // === Salvar ===
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `entradas_${anoSelecionado}.xlsx`);
}


  

  // ====================== Saídas ======================
  const [transferencias, setTransferencias] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    api
      .get("/transferencias", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTransferencias(res.data))
      .catch(() => toastError("Erro ao carregar transferências"));
  }, []);

async function baixarExcelSaidas(transferencias) {
  function formatarDataBrasileira(dataISO) {
    if (!dataISO) return "N/A";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Saídas");

  // === Logo ===
  const response = await fetch(logoMegaPlate);
  const blob = await response.blob();
  const imageBuffer = await blob.arrayBuffer();

  const imageId = workbook.addImage({
    buffer: imageBuffer,
    extension: "png",
  });

  sheet.mergeCells("A1:D4");
  const faixa = sheet.getCell("A1");
  faixa.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "05314c" },
  };

  sheet.addImage(imageId, {
    tl: { col: 1.2, row: 0.2 },
    ext: { width: 120, height: 60 },
  });

  // === Título ===
  sheet.mergeCells("A6:D6");
  const tituloCell = sheet.getCell("A6");
  tituloCell.value = `Relatório de Saídas - ${anoSelecionado}`;
  tituloCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  tituloCell.alignment = { horizontal: "center", vertical: "middle" };
  tituloCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF05314C" },
  };

  // === Cabeçalho ===
  const header = ["Data", "Material", "Quantidade Solicitada", "Destino"];
  const headerRow = sheet.addRow(header);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D597B" }, // azul escuro
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // === Linhas com zebra ===
  transferencias.forEach((t, index) => {
    const row = sheet.addRow([
      formatarDataBrasileira(t.ultimaMovimentacao),
      t.tipoMaterial || "N/A",
      t.quantidadeTransferida || 0,
      t.setor || "Desconhecido",
    ]);

    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEFEFEF" }, // cinza claro
        };
      });
    }
  });

  // === Linha de total ===
  const ultimaLinha = sheet.rowCount + 1;
  const totalRow = sheet.addRow([
    "Total:",
    "",
{ formula: `SUBTOTAL(9,C8:C${sheet.rowCount})` }, // Quantidade
    "",
  ]);

  totalRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D597B" }, // azul escuro
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // === Filtros ===
  sheet.autoFilter = {
    from: "A7",
    to: `D${ultimaLinha - 1}`,
  };

  // === Ajusta largura ===
  sheet.columns.forEach((col) => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      if (val.length > maxLength) maxLength = val.length;
    });
    col.width = maxLength + 5;
  });

  // === Salvar ===
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `saidas_${anoSelecionado}.xlsx`);
}

  

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.background}>
          <h1>RELATÓRIOS DE DESEMPENHO</h1>

          <div className={styles.filtro}>
            <select
              value={filtroRelatorio}
              onChange={(e) => setFiltroRelatorio(e.target.value)}
              className={styles.selectFiltro}
            >
              <option value="todos">Todos os Relatórios</option>
              <option value="entradas">Relatório Geral de Entradas</option>
              <option value="saidas">Relatório Geral de Saídas</option>
              <option value="fornecedores">Relatório de Fornecedores</option>
              <option value="materiais">Relatório de Materiais</option>
            </select>

            <div className={styles.filtroAno}>
              <div className={styles.anoContent}>
                <img
                  src={setaImg}
                  alt="seta esquerda"
                  className={styles.seta}
                  onClick={voltarAno}
                />
                {anosVisiveis.map((ano) => (
                  <div
                    key={ano}
                    className={`${styles.ano} ${
                      anoSelecionado === ano ? styles.ativo : ""
                    }`}
                    onClick={() => setAnoSelecionado(ano)}
                  >
                    {ano}
                  </div>
                ))}
                <img
                  src={setaRightImg}
                  alt="seta direita"
                  className={styles.seta}
                  onClick={avancarAno}
                />
              </div>
            </div>
          </div>

          <div className={styles.relatorios}>
            {relatoriosFiltrados.map((relatorio, index) => (
              <div key={index} className={styles.relatorio}>
                <h3>
                  {relatorio.titulo}
                  {(relatorio.tipo === "entradas" ||
                    relatorio.tipo === "saidas") &&
                    anoSelecionado &&
                    ` - ${anoSelecionado}`}
                </h3>

                <p>{relatorio.descricao}</p>

                {relatorio.tipo === "entradas" && (
                  <button
                    className={styles.botao}
                    onClick={() => {
                      if (!anoSelecionado) {
                        toastError("Selecione um ano para gerar o relatório.");
                        return;
                      }

                      const ordensFiltradas = ordens.filter((o) => {
                        const ano = o.prazoEntrega.split("-")[0]; // pega "2025" de "2025-07-26"
                        return ano === String(anoSelecionado);
                      });

                      if (ordensFiltradas.length === 0) {
                        toastInfo(
                          `Nenhuma ordem de compra encontrada para o ano ${anoSelecionado}.`
                        );
                        return;
                      }

                      baixarExcelEntradas(ordensFiltradas);
                      toastSuccess("Relatório gerado com sucesso!");
                    }}
                  >
                    {relatorio.botao}
                  </button>
                )}

                {relatorio.tipo === "saidas" && (
                  <button
                    className={styles.botao}
                    onClick={() => {
                      if (!anoSelecionado) {
                        toastError(
                          "Por favor, selecione um ano antes de baixar o relatório."
                        );
                        return;
                      }

                      const transferenciasFiltradas = transferencias.filter(
                        (t) =>
                          t.ultimaMovimentacao.includes(String(anoSelecionado))
                      );

                      if (transferenciasFiltradas.length === 0) {
                        toastInfo(
                          `Nenhuma transferência encontrada para o ano ${anoSelecionado}.`
                        );
                        return;
                      }

                      baixarExcelSaidas(transferenciasFiltradas);
                      toastSuccess("Relatório gerado com sucesso!");
                    }}
                  >
                    {relatorio.botao}
                  </button>
                )}

                {relatorio.tipo === "fornecedores" && (
                  <button
                    className={styles.botao}
                    onClick={() => navigate("/relatorioFornecedor")}
                  >
                    {relatorio.botao}
                    <img
                      src={setaRightImg}
                      alt="seta"
                      className={styles.iconeSeta}
                    />
                  </button>
                )}
                {relatorio.tipo === "materiais" && (
                  <button
                    className={styles.botao}
                    onClick={() => navigate("/relatorioMaterial")}
                  >
                    {relatorio.botao}
                    <img
                      src={setaRightImg}
                      alt="seta"
                      className={styles.iconeSeta}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Relatorios;
