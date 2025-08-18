import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./relatorioMaterial.module.css";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

function gerarRelatorioMaterial(material, dadosAno, dadosMensais, ano) {
  const doc = new jsPDF();
  const corPrimaria = [5, 49, 76];
  const corTexto = [44, 62, 80];
  const dataHoraEmissao = new Date().toLocaleString("pt-BR");

  // Função para rodapé
  const addRodape = () => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8).setTextColor(100);
    doc.text(`Emitido em: ${dataHoraEmissao}`, 14, pageHeight - 10);
  };

  // --- CAPA ---
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text(`RELATÓRIO DE SAÍDAS POR MATERIAL - ${ano}`, 20, 20);

  doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
  doc.text(
    "Análise anual das movimentações do material selecionado, com detalhamento por tipo de saída e destino.",
    20,
    60,
    { maxWidth: 170 }
  );
  doc.text(`Material: ${material}`, 20, 80);
  doc.text(`Data de emissão: ${dataHoraEmissao}`, 20, 100);

  addRodape();

  // --- PÁGINAS MENSAIS ---
  dadosMensais.forEach((mes) => {
    doc.addPage();
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 20, "F");

    doc.setTextColor(255, 255, 255).setFontSize(14).setFont("helvetica", "bold");
    doc.text(`RELATÓRIO DE SAÍDAS POR MATERIAL - ${ano}`, 20, 12);

    doc.setTextColor(...corPrimaria).setFontSize(16);
    doc.text(mes.nomeMes.toUpperCase(), 20, 40);

    doc.setTextColor(...corTexto).setFontSize(12);
    let posY = 60;
    mes.dados.forEach((item) => {
      doc.text(`${item.label}: ${item.valor}`, 20, posY);
      posY += 10;
    });

    addRodape();
  });

  // --- PÁGINA RESUMO ANUAL ---
  doc.addPage();
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, 210, 20, "F");

  doc.setTextColor(255, 255, 255).setFontSize(14).setFont("helvetica", "bold");
  doc.text(`RELATÓRIO GERAL DE SAÍDAS - ${ano}`, 20, 12);

  doc.setTextColor(...corPrimaria).setFontSize(16);
  doc.text(`${ano} - RESUMO ANUAL`, 20, 40);

  doc.setTextColor(...corTexto).setFontSize(12);
  let posY = 60;
  dadosAno.forEach((item) => {
    doc.text(`${item.label}: ${item.valor}`, 20, posY);
    posY += 10;
  });

  addRodape();

  // --- SALVAR ---
  doc.save(`relatorio_material_${material}_${ano}.pdf`);
}

const MOCK_DADOS_MENSAIS = [
  { nomeMes: "Janeiro", dados: [
      { label: "Total de saídas", valor: "120" },
      { label: "Saídas internas", valor: "80" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1020" }
    ]
  },
  { nomeMes: "Fevereiro", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Março", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Abril", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Maio", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Junho", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Julho", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Agosto", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Setembro", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },

    { nomeMes: "Novembro", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },
    { nomeMes: "Dezembro", dados: [
      { label: "Total de saídas", valor: "95" },
      { label: "Saídas internas", valor: "55" },
      { label: "Saídas externas", valor: "40" },
      { label: "Material mais movimentado", valor: "SAE 1040" }
    ]
  },

];

const MOCK_DADOS_ANO = [
  { label: "Total de saídas (quantidade)", valor: "215" },
  { label: "Nº de saídas internas", valor: "135" },
  { label: "Nº de saídas externas", valor: "80" },
  { label: "Material mais movimentado do ano", valor: "SAE 1020" }
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
  const [anoSelecionado, setAnoSelecionado] = useState(todosAnos[todosAnos.length - 1]);
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
      } else {
        const token = sessionStorage.getItem("authToken");
        const res = await api.get("/materiais", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMateriais(res.data);
      }
    } catch (error) {
      Swal.fire("Erro ao carregar materiais", "", "error");
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
          <h1>RELATÓRIO DE SAÍDAS POR MATERIAIS - {anoSelecionado}</h1>
          <div className={styles.filtro}>
            <select value={filtroMaterial} onChange={(e) => setFiltroMateiral(e.target.value)} className={styles.selectFiltro}>
              <option value="todos">Todos os Materias</option>
              <option value="SAE 1020">SAE 1020</option>
              <option value="SAE 1040">SAE 1040</option>
              <option value="HARDOX">HARDOX</option>
              <option value="materiais">Relatório de Materiais</option>
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
                  onClick={() => gerarRelatorioMaterial(
                    material.material,
                    MOCK_DADOS_ANO,
                    MOCK_DADOS_MENSAIS,
                    anoSelecionado
                  )}
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
