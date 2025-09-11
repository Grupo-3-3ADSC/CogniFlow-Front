import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import styles from "./relatorios.module.css";
import { toastSuccess, toastError, toastInfo } from "../../components/toastify/ToastifyService.jsx";
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
    { label: "Material mais comprado", valor: "Chapa Aço 1020" }
  ];
  const dadosSaidasFake = [
    { label: "Total de Saídas", valor: "R$ 980.000,00" },
    { label: "Material mais saído", valor: "Bobina Galvanizada" }
  ];

  const listaRelatorios = [
    { tipo: "entradas", titulo: "Relatório Geral de Entradas", descricao: "Análise anual geral de preços com foco em fornecedores, sazonalidades e oscilações críticas que impactaram os custos.", botao: "BAIXAR RELATÓRIO COMPARATIVO ANUAL" },
    { tipo: "saidas", titulo: "Relatório Geral de Saídas", descricao: "Análise anual geral de saídas com comparativo de saídas internas e externas.", botao: "BAIXAR RELATÓRIO COMPARATIVO ANUAL" },
    { tipo: "fornecedores", titulo: "Relatório Comparativo de Fornecedores", descricao: "Análise dos fornecedores mais utilizados e desempenho anual.", botao: "FORNECEDORES" },
    { tipo: "materiais", titulo: "Relatório de Movimentações por Materiais", descricao: "Visão geral dos materiais mais movimentados no período.", botao: "MATERIAS" }
  ];

  const relatoriosFiltrados = listaRelatorios.filter(r => filtroRelatorio === "todos" || r.tipo === filtroRelatorio);

  async function baixarExcelEntradas(ordens) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Entradas");

    const response = await fetch(logoMegaPlate);
    const blob = await response.blob();
    const imageBuffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });

    // === Faixa azul do topo ===

    sheet.mergeCells("A1:I4");
    const faixa = sheet.getCell("A1");
    faixa.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "05314c" }, // azul médio
    };



    // Adiciona logo (colocado dentro da faixa azul)
    sheet.addImage(imageId, {
      tl: { col: 1.2, row: 0.2 }, // canto esquerdo
      ext: { width: 120, height: 60 },
    });

    // === Título do relatório ===
    const titleRow = sheet.addRow([]);
    titleRow.height = 30;
    sheet.mergeCells("A6:I6");

    const tituloCell = sheet.getCell("A6");
    tituloCell.value = `Relatório de Entradas - ${anoSelecionado}`;
    tituloCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } }; // Cor do texto branca
    tituloCell.alignment = { horizontal: "center", vertical: "middle" };
    tituloCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF05314C" }, // Azul escuro
    };


    // === Cabeçalho da tabela ===
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
        fgColor: { argb: "FF1D597B" }, // azul do cabeçalho
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

      // Pega só a parte da data, ignorando a hora
      const [ano, mes, dia] = dataISO.split("T")[0].split("-");

      return `${dia}/${mes}/${ano}`;
    }


    // Adiciona dados
    ordens.forEach((ordem, index) => {
      const row = sheet.addRow([
        formatarDataBrasileira(ordem.dataDeEmissao) || "N/A", // Data de emissão formatada (DD/MM/YYYY)
        ordem.nomeFornecedor || "Desconhecido", // Nome do fornecedor
        ordem.id || "N/A", // ID da ordem de compra
        ordem.tipoMaterial || "N/A", // Descrição do material
        ordem.quantidade || 0, // Quantidade solicitada
        ordem.valorUnitario || 0, // Valor unitário
        (ordem.valorUnitario) * ordem.quantidade || 0, // Quantidade * Valor unitário
        (ordem.ipi || 0) / 100, // IPI em formato decimal (ex.: 10% -> 0.10)
        (ordem.valorUnitario * ordem.quantidade) * (1 + (ordem.ipi || 0) / 100) || 0, // Valor total com IPI
      ]);

      // Formatação de células
      row.getCell(6).numFmt = '"R$"#,##0.00';
      row.getCell(7).numFmt = '"R$"#,##0.00';
      row.getCell(8).numFmt = '0.00%';
      row.getCell(9).numFmt = '"R$"#,##0.00';

      // Zebra
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEFEFEF" },
          };
        });
      }
    });

    // Ajuste automático de largura
    sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      col.width = maxLength + 5;
    });

    const ultimaLinha = sheet.rowCount + 1;

    // Texto "Total:"
    // sheet.getCell(`B${ultimaLinha}`).value = "Total:";
    // sheet.getCell(`B${ultimaLinha}`).font = { bold: true, color: { argb: "FFFFFFFF" } };
    // sheet.getCell(`B${ultimaLinha}`).alignment = { horizontal: "center", vertical: "middle" };
    // sheet.getCell(`B${ultimaLinha}`).fill = {
    //   type: "pattern",
    //   pattern: "solid",
    //   fgColor: { argb: "1D597B" },
    // };

    // // Soma do Preço unitário (coluna F)
    // sheet.getCell(`D${ultimaLinha}`).value = {
    //   formula: `SUM(D10:D${sheet.rowCount})`
    // };
    // sheet.getCell(`D${ultimaLinha}`).font = { bold: true, color: { argb: "FFFFFFFF" } };
    // sheet.getCell(`D${ultimaLinha}`).fill = {
    //   type: "pattern",
    //   pattern: "solid",
    //   fgColor: { argb: "1D597B" },
    // };
    // sheet.getCell(`${ultimaLinha}`).alignment = { horizontal: "center" };

    // sheet.getCell(`D${ultimaLinha}`).value = {
    //   formula: `SUM(F10:F${sheet.rowCount})`,

    // };
    // sheet.getCell(`F${ultimaLinha}`).font = { bold: true, color: { argb: "FFFFFFFF" } };
    // sheet.getCell(`F${ultimaLinha}`).fill = {
    //   type: "pattern",
    //   pattern: "solid",
    //   fgColor: { argb: "1D597B" },
    // };
    // sheet.getCell(`F${ultimaLinha}`).alignment = { horizontal: "center" };

    // // Soma do Preço total do pedido
    // sheet.getCell(`G${ultimaLinha}`).value = {
    //   formula: `SUM(G10:G${sheet.rowCount})`,
    //   result: 0,
    // };
    // sheet.getCell(`G${ultimaLinha}`).font = { bold: true, color: { argb: "FFFFFFFF" } };
    // sheet.getCell(`G${ultimaLinha}`).fill = {
    //   type: "pattern",
    //   pattern: "solid",
    //   fgColor: { argb: "1D597B" },
    // };
    // sheet.getCell(`G${ultimaLinha}`).alignment = { horizontal: "center" };



    // sheet.getCell(`I${ultimaLinha}`).alignment = { horizontal: "center" };

    // sheet.getCell(`I${ultimaLinha}`).value = {
    //   formula: `SUM(I10:I${sheet.rowCount})`,
    // };
    // sheet.getCell(`I${ultimaLinha}`).font = { bold: true, color: { argb: "FFFFFFFF" } };
    // sheet.getCell(`I${ultimaLinha}`).fill = {
    //   type: "pattern",
    //   pattern: "solid",
    //   fgColor: { argb: "1D597B" },
    // };
    // sheet.getCell(`I${ultimaLinha}`).alignment = { horizontal: "center" };


    // Salvar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `entradas_${anoSelecionado}.xlsx`);
  }

  const ordensDeCompra = [
    { data: "15/01/2025", fornecedor: "Fornecedor A", ordemCompra: "OC-123", produto: "Aço SAE1020", quantidade: 50, precoUnitario: 200, precoTotalPedido: 10000, ipi: 10, valorTotal: 11000 },
    { data: "20/02/2025", fornecedor: "Fornecedor B", ordemCompra: "OC-456", produto: "Bobina Galvanizada", quantidade: 30, precoUnitario: 500, precoTotalPedido: 15000, ipi: 5, valorTotal: 15750 },
  ];


  // ====================== Saídas ======================
  const [transferencias, setTransferencias] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    api.get("/transferencias", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTransferencias(res.data))
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
      fgColor: { argb: "05314c" }, // azul médio
    };

    sheet.addImage(imageId, {
      tl: { col: 1.2, row: 0.2 },
      ext: { width: 120, height: 60 },
    });

    sheet.addRow([]);
    sheet.addRow([]);



    sheet.mergeCells("A6:D6");
    const titulo = sheet.getCell("A6");
    titulo.value = `Relatório de Saídas - ${anoSelecionado}`;
    titulo.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titulo.alignment = { horizontal: "center", vertical: "middle" };
    titulo.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "05314c" }, // azul escuro
    };

    const header = ["Data", "Material", "Quantidade Solicitada", "Destino"];

    const headerRow = sheet.addRow(header);


    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1D597B" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    transferencias.forEach((t, index) => {
      const row = sheet.addRow([formatarDataBrasileira(t.ultimaMovimentacao), t.tipoMaterial, t.quantidadeTransferida, t.setor]);
      row.getCell(4).numFmt = '"R$"#,##0.00';

      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEFEFEF" },
          };
        });
      }
    });

    // Ajuste automático de largura
    sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      col.width = maxLength + 5;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `saidas_${anoSelecionado}.xlsx`);
  }

  // Exemplo de uso
  const transferenciasMock = [
    { data: "8/1/2025", material: "SAE1023", qtdSolicitada: 100, destino: "C1" },
    { data: "8/2/2025", material: "SAE1024", qtdSolicitada: 200, destino: "C2" },
    // ... adicione todos os outros dados aqui
  ];



  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.background}>
          <h1>RELATÓRIOS DE DESEMPENHO</h1>

          <div className={styles.filtro}>
            <select value={filtroRelatorio} onChange={(e) => setFiltroRelatorio(e.target.value)} className={styles.selectFiltro}>
              <option value="todos">Todos os Relatórios</option>
              <option value="entradas">Relatório Geral de Entradas</option>
              <option value="saidas">Relatório Geral de Saídas</option>
              <option value="fornecedores">Relatório de Fornecedores</option>
              <option value="materiais">Relatório de Materiais</option>
            </select>

            <div className={styles.filtroAno}>
              <div className={styles.anoContent}>
                <img src={setaImg} alt="seta esquerda" className={styles.seta} onClick={voltarAno} />
                {anosVisiveis.map((ano) => (
                  <div key={ano} className={`${styles.ano} ${anoSelecionado === ano ? styles.ativo : ""}`} onClick={() => setAnoSelecionado(ano)}>
                    {ano}
                  </div>
                ))}
                <img src={setaRightImg} alt="seta direita" className={styles.seta} onClick={avancarAno} />
              </div>
            </div>
          </div>

          <div className={styles.relatorios}>
            {relatoriosFiltrados.map((relatorio, index) => (
              <div key={index} className={styles.relatorio}>
                <h3>
                  {relatorio.titulo}
                  {(relatorio.tipo === "entradas" || relatorio.tipo === "saidas") && anoSelecionado && ` - ${anoSelecionado}`}
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
                      baixarExcelEntradas ( ordens.filter(o => {
                        const ano = o.prazoEntrega.split("-")[0]; // "2025" de "2025-07-26"
                        return ano === String(anoSelecionado);
                      }));
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
                        toastError("Por favor, selecione um ano antes de baixar o relatório.");
                        return;
                      }
                      baixarExcelSaidas(transferencias.filter(t => t.ultimaMovimentacao.includes(anoSelecionado)));
                      toastSuccess("Relatório gerado com sucesso!");
                    }}
                  >
                    {relatorio.botao}
                  </button>
                )}

                {relatorio.tipo === "fornecedores" && (
                  <button className={styles.botao} onClick={() => navigate("/relatorioFornecedor")}>
                    {relatorio.botao}
                    <img src={setaRightImg} alt="seta" className={styles.iconeSeta} />
                  </button>
                )}
                {relatorio.tipo === "materiais" && (
                  <button className={styles.botao} onClick={() => navigate("/relatorioMaterial")}>
                    {relatorio.botao}
                    <img src={setaRightImg} alt="seta" className={styles.iconeSeta} />
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