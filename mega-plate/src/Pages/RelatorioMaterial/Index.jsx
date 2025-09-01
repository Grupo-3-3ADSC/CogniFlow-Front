import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import { toastSuccess, toastError, toastInfo } from "../../components/toastify/ToastifyService.jsx";
import styles from "./relatorioMaterial.module.css";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoMegaPlate from "../../assets/logo-megaplate.png";




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
  const [filtroMaterial, setFiltroMaterial] = useState("todos");
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

  const MOCK_ENTRADAS = [
    { data: "01/08/2025", fornecedor: "Fornecedor X", quantidade: 50, precoUnitario: 20, total: 1000 },
    { data: "05/08/2025", fornecedor: "Fornecedor Y", quantidade: 30, precoUnitario: 22, total: 660 }
  ];

  const MOCK_SAIDAS = [
    { data: "06/08/2025", destino: "Cliente A", quantidade: 20, mediaPreco: 21, total: 420 },
    { data: "07/08/2025", destino: "Cliente B", quantidade: 40, mediaPreco: 20, total: 800 }
  ];


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

  async function baixarExcelMaterial(material, entradas, saidas) {
    const workbook = new ExcelJS.Workbook();

    // ======== Aba de Entradas ========
    const sheetEntradas = workbook.addWorksheet("Entradas");

 const response = await fetch(logoMegaPlate);
    const blob = await response.blob();
    const imageBuffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });

    // === Faixa azul do topo ===
    sheetEntradas.mergeCells("B1:H4");
    const faixa = sheetEntradas.getCell("B1");
    faixa.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1D597B" }, // azul médio
    };

    // Adiciona logo (colocado dentro da faixa azul)
    sheetEntradas.addImage(imageId, {
      tl: { col: 1.2, row: 0.2 }, // canto esquerdo
      ext: { width: 120, height: 60 },
    });

    // Título
    sheetEntradas.mergeCells("B6:H6");
    const tituloEntradas = sheetEntradas.getCell("B6");
    tituloEntradas.value = `Entradas do material: ${material}`;
    tituloEntradas.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    tituloEntradas.alignment = { horizontal: "center" };
    tituloEntradas.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "05314c" },
    };

    // Cabeçalho
    const header = ["Data", "Fornecedor", "Quantidade", "Preço Unitário", "Preço Total do Pedido", "IPI", " Valor Total"]

    const headerEntradas = sheetEntradas.addRow(["", ...header]);
    
    headerEntradas.eachCell((cell) => {
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

    entradas.forEach((e) => {
      const row = sheetEntradas.addRow([
        new Date(e.data),
        e.fornecedor,
        e.quantidade,
        e.precoUnitario,
        e.precoTotalPedido,
        e.ipi,
        e.valorTotal
      ]);

      row.eachCell((cell, colNumber) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };

        if (colNumber === 1) cell.numFmt = "dd/mm/yyyy"; // Data
        if (colNumber === 4 || colNumber === 5 || colNumber === 7) cell.numFmt = '"R$"#,##0.00';
        if (colNumber === 6) cell.numFmt = "0.00%";
      });
    });

    // Ajuste de largura
    sheetEntradas.columns.forEach(col => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      col.width = maxLength + 2;
    });

    // ======== Aba de Transferências ========
    const sheetSaidas = workbook.addWorksheet("Transferências");

 sheetSaidas.mergeCells("B1:D4");
    const faixaSaida = sheetSaidas.getCell("B1");
    faixa.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "05314c" },
    };

    sheetSaidas.addImage(imageId, {
      tl: { col: 1.2, row: 0.2 }, 
      ext: { width: 120, height: 60 },
    });

    // Título
    sheetSaidas.mergeCells("B6:D6");
    const tituloSaidas = sheetSaidas.getCell("B6");
    tituloSaidas.value = `Entradas do material: ${material}`;
    tituloSaidas.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    tituloSaidas.alignment = { horizontal: "center" };
    tituloSaidas.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "05314c" },
    };

    const headerSaidas = sheetSaidas.addRow(["Data", "Destino", "Quantidade"]);
    headerSaidas.eachCell((cell) => {
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB22222" } };
      cell.alignment = { horizontal: "center" };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    saidas.forEach(s => {
      const row = sheetSaidas.addRow([new Date(s.data), s.destino, s.quantidade]);
      row.eachCell((cell, colNumber) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        if (colNumber === 1) cell.numFmt = "dd/mm/yyyy";
      });
    });

    sheetSaidas.columns.forEach(col => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      col.width = maxLength + 2;
    });

    // ======== Salvar arquivo ========
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Movimentacoes_${material}.xlsx`);
  }



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
            <h1>RELATÓRIO DE MOVIMENTAÇÕES {anoSelecionado && ` - ${anoSelecionado}`}</h1>
          </div>
          <div className={styles.filtro}>
            <select value={filtroMaterial} onChange={(e) => setFiltroMaterial(e.target.value)} className={styles.selectFiltro}>
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

                    baixarExcelMaterial(
                      material.material,
                      MOCK_ENTRADAS,
                      MOCK_SAIDAS
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
