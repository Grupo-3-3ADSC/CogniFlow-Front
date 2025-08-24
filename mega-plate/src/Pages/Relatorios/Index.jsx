import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import styles from "./relatorios.module.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import logoMegaPlate from "../../assets/logo-megaplate-azul.png";
import { useNavigate } from "react-router-dom";

// Desenha um "card" de KPI
function drawKpiCard(doc, x, y, w, h, titulo, valor, corPrimaria, corTexto) {
  doc.setDrawColor(...corPrimaria);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(x, y, w, h, 3, 3, "FD");

  doc.setTextColor(...corTexto);
  doc.setFont("helvetica", "bold").setFontSize(10);
  doc.text(titulo, x + 6, y + 9);

  doc.setFont("helvetica", "normal").setFontSize(14);
  doc.setTextColor(30);
  doc.text(String(valor ?? "-"), x + 6, y + 20);
}


function renderTabela(doc, titulo, head, body, startY, corPrimaria, corTexto) {

  doc.setFont("helvetica", "bold")
    .setFontSize(12)
    .setTextColor(...corPrimaria);
  doc.text(titulo, 20, startY);

  const afterTitleY = startY + 6;


  autoTable(doc, {
    head: [head],
    body,
    startY: afterTitleY,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 3, textColor: corTexto },
    headStyles: { fillColor: corPrimaria, textColor: [255, 255, 255] },
    theme: "striped",
    margin: { left: 20, right: 20 }
  });

  return doc.lastAutoTable.finalY + 6;
}
// Funções de formatação
function formatarNumero(valor) {
  if (valor == null || isNaN(valor)) return "-";
  return new Intl.NumberFormat("pt-BR").format(valor);
}

function formatarMoeda(valor) {
  if (valor == null || isNaN(valor)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
}

function formatarPercentual(valor) {
  if (valor == null || isNaN(valor)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2
  }).format(valor / 100); // divide por 100 pois o formato espera 0.1 = 10%
}


// Render da página de um mês
function renderPaginaMensal(doc, mes, corPrimaria, corTexto) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Título do mês
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
  doc.text((mes?.nomeMes || "").toUpperCase(), 20, 30);

  // KPIs (lendo estrutura nova; caso não exista, tenta inferir de mes.dados)
  const resumo = mes?.resumo || {};
  const infer = (label) => {
    const f = (mes?.dados || []).find(d => (d.label || "").toLowerCase().includes(label));
    return f?.valor;
  };

  const kpis = [
    { t: "Total (kg)", v: formatarNumero(resumo.totalKg ?? infer("kg")) },
    { t: "Custo total (R$)", v: formatarMoeda(resumo.custoTotal ?? infer("custo total")) },
    { t: "Fornecedores", v: formatarNumero(resumo.fornecedores ?? infer("fornecedor")) },
    { t: "Ordens de Compra (OC)", v: formatarNumero(resumo.ordensCompra ?? infer("ordem")) },
    { t: "Var. vs mês ant. (%)", v: formatarPercentual(resumo.variacaoVsAnteriorPct ?? infer("varia")) },
    { t: "Partic. no ano (%)", v: formatarPercentual(resumo.participacaoAnoPct ?? infer("partic")) },
  ];



  // Grid de 3 colunas x 2 linhas
  const gridX = 20;
  const gridY = 40;
  const gap = 8;
  const cols = 3;
  const cardW = (pageWidth - gridX * 2 - gap * (cols - 1));
  const colW = cardW / cols;
  const cardH = 26;

  let idx = 0;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= kpis.length) break;
      const x = gridX + c * (colW + gap);
      const y = gridY + r * (cardH + gap);
      const { t, v } = kpis[idx++];
      drawKpiCard(doc, x, y, colW, cardH, t, v, corPrimaria, corTexto);
    }
  }

  // Tabelas
  let nextY = gridY + 2 * (cardH + gap) + 10;

  // Materiais
  const materias = mes?.Materiais || [];
  const matHead = ["Material", "Kg", "IPI(%)", "Custo total (R$)", "Custo médio (R$/kg)", "Valor total (R$)"];
  const matBody = materias.map(m => [
    m.material,
    formatarPercentual(m.ipi),
    formatarNumero(m.kg),
    formatarMoeda(m.custoMedio),
    formatarMoeda(m.custoTotal),
    formatarMoeda(m.valoroTotal)
  ]);
  nextY = renderTabela(doc, "Materiais", matHead, matBody, nextY, corPrimaria, corTexto);

  // Fornecedores
  const forn = mes?.Fornecedores || [];
  const fornHead = ["Fornecedor", "OCs", "Kg", "Custo total (R$)"];
  const fornBody = forn.map(f => [
    f.fornecedor,
    formatarNumero(f.ocs),
    formatarNumero(f.kg),
    formatarMoeda(f.custoTotal),
  ]);
  nextY = renderTabela(doc, "Fornecedores", fornHead, fornBody, nextY, corPrimaria, corTexto);


}
export function gerarRelatorioEntradas(dadosAno, dadosMensais, ano) {
  const doc = new jsPDF();
  const corPrimaria = [5, 49, 76];
  const corTexto = [44, 62, 80];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dataEmissao = new Date().toLocaleString("pt-BR");

  // ====== CAPA ======
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255).setFontSize(20).setFont("helvetica", "bold");
  doc.text(`RELATÓRIO GERAL DE ENTRADAS – ${ano}`, pageWidth / 2, 20, { align: "center" });

  doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
  doc.text(
    "Análise anual de entradas de materiais, destacando fornecedores, sazonalidades e variações de custo.",
    pageWidth / 2, 60, { maxWidth: 170, align: "center" }
  );
  doc.text(`DATA DE EMISSÃO: ${dataEmissao}`, pageWidth / 2, 100, { align: "center" });

  if (logoMegaPlate) {
    doc.addImage(logoMegaPlate, "PNG", (pageWidth - 50) / 2, 120, 50, 50);
  }

  // ====== PÁGINAS MENSAIS ======
  (dadosMensais || []).forEach((mes) => {
    doc.addPage();
    renderPaginaMensal(doc, mes, corPrimaria, corTexto);
  });

  // ====== RESUMO ANUAL ======
  doc.addPage();
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
  doc.text(`${ano} - RESUMO ANUAL (ENTRADAS)`, 20, 30);
  doc.setTextColor(...corTexto).setFontSize(12);

  // ====== CALCULA MES MIN/MAX ======
  const calcularMesesExtremos = (dadosMensais) => {
    if (!dadosMensais || dadosMensais.length === 0) return { mesMin: "-", mesMax: "-" };
    let mesMin = dadosMensais[0], mesMax = dadosMensais[0];
    dadosMensais.forEach(mes => {
      const totalKg = mes?.resumo?.totalKg ?? 0;
      if (totalKg < (mesMin?.resumo?.totalKg ?? 0)) mesMin = mes;
      if (totalKg > (mesMax?.resumo?.totalKg ?? 0)) mesMax = mes;
    });
    return { mesMin: mesMin?.nomeMes ?? "-", mesMax: mesMax?.nomeMes ?? "-" };
  };

  const { mesMin, mesMax } = calcularMesesExtremos(dadosMensais);

  const resumoAnual = [
    { t: "Total (kg)", v: formatarNumero(dadosAno.find(d => d.label === "totalKg")?.valor) },
    { t: "Custo total (R$)", v: formatarMoeda(dadosAno.find(d => d.label === "custoTotal")?.valor) },
    { t: "Fornecedores", v: formatarNumero(dadosAno.find(d => d.label === "fornecedores")?.valor) },
    { t: "Ordens de compra (OC)", v: formatarNumero(dadosAno.find(d => d.label === "ordensCompra")?.valor) },
    { t: "Var. vs mês ant. (%) *", v: formatarPercentual(dadosAno.find(d => d.label === "variacaoVsAnteriorPct")?.valor) },
    { t: "Partic. no ano (%)", v: formatarPercentual(dadosAno.find(d => d.label === "participacaoAnoPct")?.valor) },
    { t: "Mês com menos entradas", v: mesMin },
    { t: "Mês com mais entradas", v: mesMax },
  ];

  const gridX = 20;
  let gridY = 46;
  const gap = 8;
  const cols = 3;
  const cardW = (pageWidth - gridX * 2 - gap * (cols - 1)) / cols;
  const cardH = 26;

  let idx = 0;
  for (let r = 0; r < Math.ceil(resumoAnual.length / cols); r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= resumoAnual.length) break;
      const x = gridX + c * (cardW + gap);
      const y = gridY + r * (cardH + gap);
      const { t, v } = resumoAnual[idx++];
      drawKpiCard(doc, x, y, cardW, cardH, t, v, corPrimaria, corTexto);
    }
  }



  // ====== RODAPÉ ======
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFillColor(...corPrimaria);
    doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
    doc.setFontSize(9).setFont("helvetica", "italic").setTextColor(255, 255, 255);
    doc.text(`Emitido em: ${dataEmissao} | Página ${i} de ${totalPaginas}`, pageWidth / 2, pageHeight - 7, { align: "center" });
  }

  doc.save(`relatorio_entradas_${ano}.pdf`);
}



// === RELATÓRIO DE SAÍDAS ===

// Render da página de um mês (saídas)
function renderPaginaMensalSaidas(doc, mes, corPrimaria, corTexto) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título do mês
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
  doc.text((mes?.nomeMes || "").toUpperCase(), 20, 30);

  // KPIs
  const resumo = mes?.resumo || {};
  const kpis = [
    { t: "Materiais", v: formatarNumero(resumo.materiais) },
    { t: "Total de Saídas", v: formatarNumero(resumo.totalSaidas) },
    { t: "Transferências realizadas", v: formatarNumero(resumo.transferencias) },
    { t: "Var. vs mês ant. (%)", v: formatarPercentual(resumo.variacaoVsAnteriorPct) },
  ];

  // Grid de KPIs
const gridX = 20;
const gridY = 40;
const gap = 8;
const cols = 2; // agora só 2 por linha
const colW = (pageWidth - gridX * 2 - gap * (cols - 1)) / cols;
const cardH = 26;

let idx = 0;
for (let r = 0; r < 2; r++) { // 2 linhas
  for (let c = 0; c < cols; c++) {
    if (idx >= kpis.length) break;
    const x = gridX + c * (colW + gap);
    const y = gridY + r * (cardH + gap);
    const { t, v } = kpis[idx++];
    drawKpiCard(doc, x, y, colW, cardH, t, v, corPrimaria, corTexto);
  }
}


  // Tabelas
  let nextY = gridY + cardH + 55;

  // --- Materiais ---
  const materias = mes?.Materiais || [];
  const matHead = ["Material", "Total Saídas", "C1", "C2", "C3", "C4"];
  const matBody = materias.map(m => [
    m.material,
    formatarNumero(m.total),
    formatarNumero(m.C1),
    formatarNumero(m.C2),
    formatarNumero(m.C3),
    formatarNumero(m.C4),
  ]);
  nextY = renderTabela(doc, "Materiais", matHead, matBody, nextY, corPrimaria, corTexto);

  // --- Setores ---
  const setores = mes?.Setores || [];
  const setHead = ["Setor", "Total Saídas"];
  const setBody = setores.map(s => [
    s.setor,
    formatarNumero(s.total),
  ]);
  nextY = renderTabela(doc, "Setores", setHead, setBody, nextY, corPrimaria, corTexto);
}

const dadosMensaisSaidas = [
  {
    nomeMes: "Janeiro",
    resumo: {
      totalMateriais: 320,
      transferencias: 18,
      variacaoVsAnteriorPct: null,
    },
    Materiais: [
      { material: "Aço Inox 304", total: 120, C1: 30, C2: 40, C3: 25, C4: 25 },
      { material: "Alumínio", total: 200, C1: 50, C2: 60, C3: 40, C4: 50 },
    ],
    Setores: [
      { setor: "C1", total: 80 },
      { setor: "C2", total: 100 },
      { setor: "C3", total: 65 },
      { setor: "C4", total: 75 },
    ],
  },
  {
    nomeMes: "Fevereiro",
    resumo: {
      totalMateriais: 280,
      transferencias: 15,
      variacaoVsAnteriorPct: -12.5,
    },
    Materiais: [
      { material: "Cobre", total: 150, C1: 40, C2: 50, C3: 30, C4: 30 },
      { material: "Aço Inox 316", total: 130, C1: 30, C2: 40, C3: 20, C4: 40 },
    ],
    Setores: [
      { setor: "C1", total: 70 },
      { setor: "C2", total: 90 },
      { setor: "C3", total: 50 },
      { setor: "C4", total: 70 },
    ],
  }
];


export function gerarRelatorioSaidas(dadosAno, dadosMensaisSaidas, ano) {
  const doc = new jsPDF();
  const corPrimaria = [102, 0, 0]; // Vermelho vinho
  const corTexto = [44, 62, 80];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dataEmissao = new Date().toLocaleString("pt-BR");

  // ====== CAPA ======
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255).setFontSize(20).setFont("helvetica", "bold");
  doc.text(`RELATÓRIO GERAL DE SAÍDAS – ${ano}`, pageWidth / 2, 20, { align: "center" });

  doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
  doc.text(
    "Análise anual das saídas de materiais, destacando transferências, materiais movimentados e distribuição por setor.",
    pageWidth / 2, 60, { maxWidth: 170, align: "center" }
  );
  doc.text(`DATA DE EMISSÃO: ${dataEmissao}`, pageWidth / 2, 100, { align: "center" });

  if (logoMegaPlate) {
    doc.addImage(logoMegaPlate, "PNG", (pageWidth - 50) / 2, 120, 50, 50);
  }

  // ====== PÁGINAS MENSAIS ======
  (dadosMensais || []).forEach((mes) => {
    doc.addPage();
    renderPaginaMensalSaidas(doc, mes, corPrimaria, corTexto);
  });

  // ====== RESUMO ANUAL ======
  doc.addPage();
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
  doc.text(`${ano} - RESUMO ANUAL (SAÍDAS)`, 20, 30);

  const resumoAnual = [
    { t: "Materiais", v: formatarNumero(dadosAno.find(d => d.label === "materiais")?.valor) },
    { t: "Total de Saídas", v: formatarNumero(dadosAno.find(d => d.label === "totalSaidas")?.valor) },
    { t: "Transferências realizadas", v: formatarNumero(dadosAno.find(d => d.label === "transferencias")?.valor) },
    { t: "Var. vs mês ant. (%)", v: formatarPercentual(dadosAno.find(d => d.label === "variacaoVsAnteriorPct")?.valor) },
    { t: "Mês com menos saídas", v: dadosAno.find(d => d.label === "mesMin")?.valor ?? "-" },
    { t: "Mês com mais saídas", v: dadosAno.find(d => d.label === "mesMax")?.valor ?? "-" },
  ];

  const gridX = 20;
  let gridY = 46;
  const gap = 8;
  const cols = 3;
  const cardW = (pageWidth - gridX * 2 - gap * (cols - 1)) / cols;
  const cardH = 26;

  let idx = 0;
  for (let r = 0; r < Math.ceil(resumoAnual.length / cols); r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= resumoAnual.length) break;
      const x = gridX + c * (cardW + gap);
      const y = gridY + r * (cardH + gap);
      const { t, v } = resumoAnual[idx++];
      drawKpiCard(doc, x, y, cardW, cardH, t, v, corPrimaria, corTexto);
    }
  }

  // ====== RODAPÉ ======
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFillColor(...corPrimaria);
    doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
    doc.setFontSize(9).setFont("helvetica", "italic").setTextColor(255, 255, 255);
    doc.text(`Emitido em: ${dataEmissao} | Página ${i} de ${totalPaginas}`, pageWidth / 2, pageHeight - 7, { align: "center" });
  }

  doc.save(`relatorio_saidas_${ano}.pdf`);
}




// ==== MOCK DE DADOS ====

// Dados por mês
const dadosMensais = [
  {
    nomeMes: "Janeiro",
    resumo: {
      totalKg: 12500,
      custoTotal: 98000,
      fornecedores: 2,
      ordensCompra: 12,
      variacaoVsAnteriorPct: null,
      participacaoAnoPct: 8.5
    },
    Materiais: [
      { material: "Aço Inox 304", IPI: 0, kg: 5000, custoMedio: 7.0, custoTotal: 35000, valorTotal: 7.0 },
      { material: "Alumínio", IPI: 0, kg: 3000, custoMedio: 7.0, custoTotal: 27000, valorTotal: 9.0 }
    ],
    Fornecedores: [
      { fornecedor: "Fornecedor A", OCs: 4, kg: 4000, custoTotal: 28000 },
      { fornecedor: "Fornecedor B", OCs: 3, kg: 2500, custoTotal: 19000 }
    ],
  },
  {
    nomeMes: "Fevereiro",
    resumo: {
      totalKg: 8900,
      custoTotal: 71000,
      fornecedores: 2,
      ordensCompra: 8,
      variacaoVsAnteriorPct: -28.8,
      participacaoAnoPct: 6.2
    },
    Materiais: [
      { material: "Cobre", IPI: 0, kg: 5000, custoMedio: 7.0, custoTotal: 35000, valorTotal: 7.0 },
      { material: "Aço Inox 316", IPI: 0, kg: 3000, custoMedio: 7.0, custoTotal: 27000, valorTotal: 9.0 }
    ],
    Fornecedores: [
      { fornecedor: "Fornecedor C", nfs: 2, kg: 3000, custoTotal: 2500 },
      { fornecedor: "Fornecedor D", nfs: 2, kg: 1500, custoTotal: 12000 }
    ],

  }
];


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
    if (inicio + 5 < todosAnos.length) setInicio(inicio + 1);
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
                  {(relatorio.tipo === "entradas" || relatorio.tipo === "saidas") && ` - ${anoSelecionado}`}
                </h3>

                <p>{relatorio.descricao}</p>

                {relatorio.tipo === "entradas" && (
                  <button
                    className={styles.botao}
                    onClick={() => {
                      if (!anoSelecionado) {
                        alert("⚠️ Por favor, selecione um ano antes de baixar o relatório de entradas.");
                        return;
                      }
                      gerarRelatorioEntradas(dadosEntradasFake, dadosMensais, anoSelecionado);
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
                        alert("⚠️ Por favor, selecione um ano antes de baixar o relatório de saídas.");
                        return;
                      }
                      gerarRelatorioSaidas(dadosSaidasFake, dadosMensais, anoSelecionado);
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
