import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import styles from "./relatorios.module.css";
import { toastSuccess, toastError, toastInfo } from "../../components/toastify/ToastifyService.jsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import logoMegaPlate from "../../assets/logo-megaplate-azul.png";
import { useNavigate } from "react-router-dom";


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
  const [anoSelecionado, setAnoSelecionado] = useState(null);

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
    { tipo: "materiais", titulo: "Relatório de Saídas por Materiais", descricao: "Visão geral dos materiais mais movimentados no período.", botao: "MATERIAS" }
  ];

  const relatoriosFiltrados = listaRelatorios.filter(r => filtroRelatorio === "todos" || r.tipo === filtroRelatorio);

  async function baixarExcelEntradas(ordensDeCompra) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Entradas");

    // Cabeçalho do Excel
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

    // Estilo do cabeçalho
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2A80B9" }, // Azul
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Adiciona os dados da tabela
    ordensDeCompra.forEach((ordem) => {
      sheet.addRow([
        ordem.data,
        ordem.fornecedor,
        ordem.ordemCompra,
        ordem.produto,
        ordem.quantidade,
        `R$ ${ordem.precoUnitario.toFixed(2).replace(".", ",")}`,
        `R$ ${ordem.precoTotalPedido.toFixed(2).replace(".", ",")}`,
        `${ordem.ipi.toFixed(2).replace(".", ",")}%`,
        `R$ ${ordem.valorTotal.toFixed(2).replace(".", ",")}`,
      ]);
    });

    // Ajusta largura das colunas
    sheet.columns.forEach((col) => {
      col.width = 20;
    });

    // Salvar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `entradas_${anoSelecionado}.xlsx`);
  }

  // Exemplo de uso
  const ordensDeCompra = [
    { data: "8/1/2025", fornecedor: "ABC", ordemCompra: 1, produto: "SAE1023", quantidade: 30, precoUnitario: 250, precoTotalPedido: 7500, ipi: 10, valorTotal: 8250 },
    { data: "8/2/2025", fornecedor: "ABCD", ordemCompra: 2, produto: "SAE1025", quantidade: 50, precoUnitario: 500, precoTotalPedido: 25000, ipi: 0, valorTotal: 25000 },
    // ... adicione todos os outros dados aqui
  ];


  async function baixarExcelSaidas(transferencias) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Saidas");

    // Cabeçalho do Excel
    const header = [
      "Data",
      "Material",
      "Quantidade Solicitada",
      "Média preço",
      "Destino",
    ];

    const headerRow = sheet.addRow(header);

    // Estilo do cabeçalho
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2A80B9" }, // Azul
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Adiciona os dados da tabela
    transferencias.forEach((ordem) => {
      sheet.addRow([
        ordem.data,
        ordem.material,
        ordem.qtdSolicitada,
        ordem.mediaPreco,
        ordem.destino,
      ]);
    });


    // Ajusta largura das colunas
    sheet.columns.forEach((col) => {
      col.width = 20;
    });

    // Salvar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `entradas_${anoSelecionado}.xlsx`);
  }

  // Exemplo de uso
  const transferencias = [
    { data: "8/1/2025", material: "SAE1023", qtdSolicitada: 100, mediaPreco: 250, destino: "C1" },
    { data: "8/2/2025", material: "SAE1024", qtdSolicitada: 200, mediaPreco: 500, destino: "C2" },
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
                      baixarExcelEntradas(ordensDeCompra.filter(o => o.data.includes(anoSelecionado)));
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
                      baixarExcelSaidas(transferencias.filter(t => t.data.includes(anoSelecionado)));
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
