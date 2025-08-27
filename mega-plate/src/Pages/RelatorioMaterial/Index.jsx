import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import { toastSuccess, toastError, toastInfo } from "../../components/toastify/ToastifyService.jsx";
import styles from "./relatorioMaterial.module.css";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoMegaPlate from '../../assets/logo-megaplate-azul.png';


function drawKpiCard(doc, x, y, w, h, title, value, corPrimaria, corTexto) {
  // Desenha o fundo do card
  doc.setFillColor(245, 245, 245).setDrawColor(...corPrimaria);
  doc.roundedRect(x, y, w, h, 3, 3, "FD"); // Borda arredondada

  // Título (KPI)
  doc.setTextColor(...corTexto).setFontSize(9).setFont("helvetica", "normal");
  doc.text(title, x + w / 2, y + 8, { align: "center" });

  // Valor
  doc.setTextColor(...corPrimaria).setFontSize(14).setFont("helvetica", "bold");
  doc.text(value.toString(), x + w / 2, y + 18, { align: "center" });
}

export function gerarRelatorioMaterial(material, dadosAno, dadosMensais, ano) {
  const doc = new jsPDF();
  const corPrimaria = [5, 49, 76];
  const corTexto = [44, 62, 80];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dataEmissao = new Date().toLocaleString("pt-BR");

  // ===== CAPA =====
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255).setFontSize(20).setFont("helvetica", "bold");
  doc.text(`RELATÓRIO DE MATERIAL – ${ano}`, pageWidth / 2, 20, { align: "center" });

  doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
  doc.text(`Material: ${material}`, pageWidth / 2, 80, { align: "center" });
  doc.text(`Análise das movimentações e desempenho anual`, pageWidth / 2, 60, { align: "center" });
  doc.text(`DATA DE EMISSÃO: ${dataEmissao}`, pageWidth / 2, 100, { align: "center" });
  if (logoMegaPlate) doc.addImage(logoMegaPlate, "PNG", (pageWidth - 50) / 2, 120, 50, 50);

  // ===== PÁGINAS MENSAIS =====
  (dadosMensais || []).forEach(mes => {
    doc.addPage();
    doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
    doc.text((mes?.nomeMes || "").toUpperCase(), 20, 30);


    // KPIs
    const kpis = mes?.dados?.map(d => ({ t: d.label, v: d.valor })) || [];
    const gridX = 20, gridY = 50, gap = 8, cols = 2;
    const cardW = (pageWidth - gridX * 2 - gap * (cols - 1)) / cols;
    const cardH = 26;
    let idx = 0;

    // CALCULA O NÚMERO DE LINHAS NECESSÁRIAS (ceil(6/2) = 3 linhas)
    const totalRows = Math.ceil(kpis.length / cols);

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < cols; c++) {
        if (idx >= kpis.length) break;
        const x = gridX + c * (cardW + gap);
        const y = gridY + r * (cardH + gap);
        const { t, v } = kpis[idx++];
        drawKpiCard(doc, x, y, cardW, cardH, t, v, corPrimaria, corTexto);
      }
    }

    // tabela de movimentações (igual a pedidos)
    const movimentos = mes?.movimentos || [];
    if (movimentos.length > 0) {
      const head = [["Data", "Setor", "Qtd", "Observação"]];

      const body = movimentos.map(m => [m.data, m.setor, m.quantidade, m.obs || "-"]);

      autoTable(doc, {
        head, body,
        startY: gridY + totalRows * (cardH + gap) + 10,
        styles: { font: "helvetica", fontSize: 9 },
        headStyles: { fillColor: corPrimaria, textColor: [255, 255, 255] },
        theme: "striped",
        margin: { left: 20, right: 20 }
      });
    }
  });

  // ===== RESUMO ANUAL =====
  doc.addPage();
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
  doc.text(`${ano} - RESUMO ANUAL (MATERIAL)`, 20, 30);

  const resumo = dadosAno || [];
  const gridX = 20, gridY = 50, gap = 8, cols = 2;
  const cardW = (pageWidth - gridX * 2 - gap * (cols - 1)) / cols;
  const cardH = 26;
  let idx = 0;
  for (let r = 0; r < Math.ceil(resumo.length / cols); r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= resumo.length) break;
      const x = gridX + c * (cardW + gap);
      const y = gridY + r * (cardH + gap);
      const { label, valor } = resumo[idx++];
      drawKpiCard(doc, x, y, cardW, cardH, label, valor, corPrimaria, corTexto);
    }
  }

  // ===== RODAPÉ =====
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFillColor(...corPrimaria);
    doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
    doc.setFontSize(9).setFont("helvetica", "italic").setTextColor(255, 255, 255);
    doc.text(`Emitido em: ${dataEmissao} | Página ${i} de ${totalPaginas}`, pageWidth / 2, pageHeight - 7, { align: "center" });
  }

  doc.save(`relatorio_material_${material}_${ano}.pdf`);
}

const MOCK_DADOS_MENSAL_MATERIAL = [
  {
    nomeMes: "Janeiro",
    dados: [
      { label: "Total de saídas ", valor: "120" },
      { label: "Saídas para C1", valor: "35" },
      { label: "Saídas para C2", valor: "25" },
      { label: "Saídas para C3", valor: "40" },
      { label: "Saídas para C4", valor: "20" },
      { label: "Maior Setor (Volume)", valor: "C3" }
    ],
    movimentos: [
      { data: "01/01/2025", setor: "C1", quantidade: 35 },
      { data: "05/01/2025", setor: "C2", quantidade: 25 },
    ]
  },
];

const MOCK_DADOS_ANO_MATERIAL = [
  { label: "Total de Saídas no Ano", valor: "550" },
  { label: "Saídas Anuais para C1", valor: "150" },
  { label: "Saídas Anuais para C2", valor: "120" },
  { label: "Saídas Anuais para C3", valor: "170" },
  { label: "Saídas Anuais para C4", valor: "110" },
  { label: "Setor de Maior Consumo", valor: "C3" },
];

function gerarListaAnos(anoInicial) {
  const anoAtual = new Date().getFullYear();
  const anos = [];

  for (let ano = anoAtual; ano >= anoInicial; ano--) {
    anos.push(ano);
  }

  return anos;
}




export function RelatorioMaterial() {
  const [materiais, setMateriais] = useState([]);
  const [filtroMaterial, setFiltroMateiral] = useState("todos");
  const [filtroNome, setFiltroNome] = useState("");
  const todosAnos = gerarListaAnos(2018);
  const [inicio, setInicio] = useState(0);
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const navigate = useNavigate();



  const anosVisiveis = todosAnos.slice(inicio, inicio + 5);

  const avancarAno = () => {
    if (inicio + 5 < todosAnos.length) setInicio(inicio + 1);
  };
  const voltarAno = () => {
    if (inicio > 0) setInicio(inicio - 1);
  };


  const MOCK_MODE = true;

  const listaMateriais = [
    { id: "1", material: "SAE 1020" },
    { id: "2", material: "SAE 1040" },
    { id: "3", material: "Hardox" },
    { id: "4", material: "SAE " },
    { id: "5", material: "SAE " },
    { id: "6", material: "SAE " },
    { id: "7", material: "SAE " },
    { id: "8", material: "SAE " },
    { id: "9", material: "SAE " },
    { id: "10", material: "SAE " },
    { id: "11", material: "SAE " }
  ]

  const buscarMateriais = async () => {
    try {
      if (MOCK_MODE) {
        setMateriais([
          { id: 1, material: "SAE 1020" },
          { id: 2, material: "SAE 1040" },
          { id: 3, material: "HARDOX" },
        ]);
        toastInfo("Materiais carregados no modo MOCK."); // opcional para feedback
      } else {
        const token = sessionStorage.getItem("authToken");
        const res = await api.get("/materiais", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMateriais(res.data);
        toastSuccess("Materiais carregados com sucesso!");
      }
    } catch (error) {
      toastError("Erro ao carregar materiais");
    }
  };




  useEffect(() => {
    buscarMateriais();
  }, []);


  const materiaisFiltrados = materiais.filter((m) => {
    const nomeMatch = (m.material ?? "").toLowerCase().includes(filtroNome.toLowerCase().trim());
    const tipoMatch = filtroMaterial === "todos" || m.material === filtroMaterial;
    return nomeMatch && tipoMatch;
  });

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.background}>
          <div className={styles.header}>
            <img
              src={setaImg}
              alt="Voltar"
              className={styles.seta}
              onClick={() => navigate("/relatorios")}
            />
            <h1>RELATÓRIO DE SAÍDAS POR MATERIAIS {anoSelecionado && ` - ${anoSelecionado}`}</h1>
          </div>
          <div className={styles.filtro}>
            <select value={filtroMaterial} onChange={(e) => setFiltroMateiral(e.target.value)} className={styles.selectFiltro}>
              <option value="todos">Todos os Materias</option>
              <option value="SAE 1020">SAE 1020</option>
              <option value="SAE 1040">SAE 1040</option>
              <option value="HARDOX">HARDOX</option>
            </select>


            <input
              type="text"
              id="filtro-nome"
              placeholder="Digite o nome do material..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className={styles.inputFiltro}
            />

            <div className={styles.filtroAno}>
              <div className={styles.anoContent}>
                <img src={setaImg} alt="seta esquerda" className={styles.setaAno} onClick={voltarAno} />
                {anosVisiveis.map((ano) => (
                  <div key={ano} className={`${styles.ano} ${anoSelecionado === ano ? styles.ativo : ""}`} onClick={() => setAnoSelecionado(ano)}>
                    {ano}
                  </div>
                ))}
                <img src={setaRightImg} alt="seta direita" className={styles.setaAno} onClick={avancarAno} />
              </div>
            </div>
          </div>

          <p className={styles.qtdMateriais}>
            {materiaisFiltrados.length} material(is) encontrado(s)
          </p>

          <div className={styles.gridMateriais}>
            {materiaisFiltrados.map((material) => (
              <div key={material.id} className={styles.cardMaterial}>
                <div className={styles.info}>
                  <p><b>Material</b></p>
                  <p>#{material.id} - {material.material}</p>
                </div>
                <button
                  className={styles.btnBaixar}
                  onClick={() => {
                    if (!anoSelecionado) {
                      toastError("Por favor, selecione um ano antes de baixar o relatório.");
                      return;
                    }

                    gerarRelatorioMaterial(
                      material.material,
                      MOCK_DADOS_ANO_MATERIAL,
                      MOCK_DADOS_MENSAL_MATERIAL,
                      anoSelecionado
                    );
                    toastSuccess("Relatório gerado com sucesso!");

                  }}
                >
                  Baixar Relatório
                </button>

              </div>
            ))}

            {materiaisFiltrados.length === 0 && (
              <p className={styles.mensagemVazia}>Nenhum material encontrado.</p>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default RelatorioMaterial;
