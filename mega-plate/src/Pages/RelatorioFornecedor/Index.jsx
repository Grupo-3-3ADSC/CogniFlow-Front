import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { toastSuccess, toastError } from "../../components/toastify/ToastifyService.jsx";
import styles from "./relatorioFornecedor.module.css";
import iconBaixar from '../../assets/icon-baixar.png';
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";



export function RelatorioFornecedor() {
  const [fornecedores, setFornecedores] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [inicio, setInicio] = useState(0);
  const todosAnos = gerarListaAnos(2018);
  const [anoSelecionado, setAnoSelecionado] = useState(null);

  const anosVisiveis = todosAnos.slice(inicio, inicio + 5);
  const avancarAno = () => { if (inicio + 5 < todosAnos.length) setInicio(inicio + 1); };
  const voltarAno = () => { if (inicio > 0) setInicio(inicio - 1); };

  const navigate = useNavigate();

  function getFornecedores() {
    const token = sessionStorage.getItem("authToken");
    api
      .get("/fornecedores", { headers: { Authorization: `Bearer ${token}` } })
      .then((resposta) => setFornecedores(resposta.data))
      .catch((erro) => {
        toastError("Erro ao buscar fornecedores");
        console.error(erro);
      });
  }

  useEffect(() => { getFornecedores(); }, []);

  const fornecedoresFiltrados = fornecedores.filter(f =>
    f.nomeFantasia.toLowerCase().includes(filtroNome.toLowerCase().trim())
  );

  // 🔹 Função para gerar Excel
  async function baixarExcelFornecedores(ordensDeCompra, fornecedorSelecionado, anoSelecionado) {
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
    sheetEntradas.mergeCells("A1:G4");
    const faixa = sheetEntradas.getCell("A1");
    faixa.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "05314c" }, // azul médio
    };

    // Adiciona logo (colocado dentro da faixa azul)
    sheetEntradas.addImage(imageId, {
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




    // Adiciona dados
    ordensDeCompra.forEach((ordem, index) => {
      const row = sheet.addRow([
        ordem.data,
        ordem.fornecedor,
        ordem.ordemCompra,
        ordem.produto,
        ordem.quantidade,
        ordem.precoUnitario,
        ordem.precoTotalPedido,
        ordem.ipi / 100,
        ordem.valorTotal,
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
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `entradas_${fornecedorSelecionado || "todos"}_${anoSelecionado}.xlsx`
    );
  }

  // 🔹 Exemplo de dados mockados (até integrar API de ordens)
  const ordensDeCompra = [
    { data: "08/01/2025", fornecedor: "ABC", ordemCompra: 1, produto: "SAE1023", quantidade: 30, precoUnitario: 250, precoTotalPedido: 7500, ipi: 10, valorTotal: 8250 },
    { data: "08/02/2025", fornecedor: "ABC", ordemCompra: 2, produto: "SAE1025", quantidade: 50, precoUnitario: 500, precoTotalPedido: 25000, ipi: 0, valorTotal: 25000 },
  ];

  // 🔹 Geração dos anos
  function gerarListaAnos(anoInicial) {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let ano = anoAtual; ano >= anoInicial; ano--) {
      anos.push(ano);
    }
    return anos;
  }

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.background}>
          <div className={styles.header}>
            <img src={setaImg} alt="Voltar" className={styles.seta} onClick={() => navigate("/relatorios")} />
            <h1>RELATÓRIO COMPARATIVO DE FORNECEDORES {anoSelecionado && ` - ${anoSelecionado}`}</h1>
          </div>

          <div className={styles.filtro}>
            <div>
              <input
                type="text"
                id="filtro-nome"
                placeholder="Digite o nome do fornecedor..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className={styles.inputFiltro}
              />
            </div>
            <div className={styles.filtroAno}>
              <div className={styles.anoContent}>
                <img src={setaImg} alt="seta esquerda" className={styles.setaAno} onClick={voltarAno} />
                {anosVisiveis.map((ano) => (
                  <div
                    key={ano}
                    className={`${styles.ano} ${anoSelecionado === ano ? styles.ativo : ""}`}
                    onClick={() => setAnoSelecionado(ano)}
                  >
                    {ano}
                  </div>
                ))}
                <img src={setaRightImg} alt="seta direita" className={styles.setaAno} onClick={avancarAno} />
              </div>
            </div>
          </div>

          <p className={styles.qtdFornecedores}>
            {fornecedoresFiltrados.length} fornecedor(es) encontrado(s)
          </p>

          <div className={styles.tabelaWrapper}>
            <table className={styles.tabela}>
              <tbody>
                {fornecedoresFiltrados.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td>
                      <b><h4>FORNECEDOR</h4></b>
                      <p>ID: {fornecedor.id}</p>
                    </td>
                    <td>
                      <b><h4>NOME FANTASIA</h4></b>
                      <p>{fornecedor.nomeFantasia}</p>
                    </td>
                    <td>
                      <b><h4>CNPJ</h4></b>
                      <p>{fornecedor.cnpj}</p>
                    </td>
                    <td>
                      <b><h4>CONTATO</h4></b>
                      <p>{fornecedor.contato}</p>
                    </td>
                    <td>
                      <button
                        className={styles.baixar}
                        onClick={() => {
                          if (!anoSelecionado) {
                            toastError("Por favor, selecione um ano antes de baixar o relatório."); return;
                          }
                          baixarExcelFornecedores(ordensDeCompra, fornecedor.nomeFantasia, anoSelecionado);
                          toastSuccess("Relatório Excel gerado com sucesso!");
                        }}
                      >
                        <img className="icons-baixar" src={iconBaixar} alt="Baixar" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default RelatorioFornecedor;
