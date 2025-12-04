import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import {
  toastSuccess,
  toastError,
  toastInfo
} from "../../components/toastify/ToastifyService.jsx";
import styles from "./relatorioFornecedor.module.css";
import logoMegaPlate from "../../assets/logo-megaplate.png";
import iconBaixar from "../../assets/icon-baixar.png";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jwtDecode } from "jwt-decode";

export function RelatorioFornecedor() {
  const navigate = useNavigate();
  const [fornecedores, setFornecedores] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [estoque, setEstoque] = useState([]);
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  const [inicio, setInicio] = useState(0);
  const todosAnos = gerarListaAnos(2018);
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );
  const [ordensDeCompra, setOrdensDeCompra] = useState([]); // Estado para armazenar as ordens de compra
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const anosVisiveis = todosAnos.slice(inicio, inicio + 5);
  useEffect(() => {
  const token = sessionStorage.getItem("authToken");

  buscarFornecedores().then((data) => setFornecedores(data));

  api.get("/estoque", {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then((res) => {
    setEstoque(res.data);
    console.log("Estoque carregado para IPI (fornecedores):", res.data);
  })
  .catch((err) => {
    console.error("Erro ao carregar estoque para IPI", err);
    toastError("Erro ao carregar dados de IPI");
  });
}, []);
  const avancarAno = () => {
    if (inicio + 5 < todosAnos.length) setInicio(inicio + 1);
  };
  const voltarAno = () => {
    if (inicio > 0) setInicio(inicio - 1);
  };


  async function buscarFornecedores() {
    const token = sessionStorage.getItem("authToken");
    const res = await api.get("/fornecedores", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async function buscarOrdensDeCompra(fornecedorId, anoSelecionado) {
    const token = sessionStorage.getItem("authToken");
    const res = await api.get(
      `/ordemDeCompra/relatorioFornecedor/${fornecedorId}?ano=${anoSelecionado}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  }

  useEffect(() => {
    buscarFornecedores().then((data) => setFornecedores(data));
  }, []);

  const fornecedoresFiltrados = fornecedores.filter((f) =>
    f.nomeFantasia.toLowerCase().includes(filtroNome.toLowerCase().trim())
  );

  // 🔹 Função para gerar Excel
  async function baixarExcelFornecedores(ordens, anoSelecionado, nomeFornecedor) {
  if (!ordens || ordens.length === 0) return;

  
// === CARREGA O ESTOQUE AQUI DENTRO, AGORA MESMO ===
let estoque = [];
const token = sessionStorage.getItem("authToken"); // <--- AQUI ESTAVA O PROBLEMA!!!
try {
  const res = await api.get("/estoque", {
    headers: { Authorization: `Bearer ${token}` },
  });
  estoque = res.data;
  console.log("ESTOQUE CARREGADO DENTRO DO DOWNLOAD:", estoque);
} catch (err) {
  toastError("Erro ao carregar dados de IPI");
  console.error("Erro ao carregar estoque:", err);
  return;
}

  // === CRIA O MAPA DE IPI COM O ESTOQUE FRESCO ===
  const estoqueIpiMap = {};
  estoque.forEach(item => {
    const id = Number(item.id);
    const ipiValor = item.ipi !== null && item.ipi !== undefined && item.ipi !== ""
      ? Number(String(item.ipi).replace(",", "."))
      : 0;
    estoqueIpiMap[id] = ipiValor;
  });

  console.log("MAPA DE IPI CRIADO COM SUCESSO:", estoqueIpiMap);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Entradas");


  // === Logo ===
  const response = await fetch(logoMegaPlate);
  const blob = await response.blob();
  const imageBuffer = await blob.arrayBuffer();
  const imageId = workbook.addImage({ buffer: imageBuffer, extension: "png" });

  sheet.mergeCells("A1:H4");
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "05314c" } };
  sheet.addImage(imageId, { tl: { col: 1.2, row: 0.2 }, ext: { width: 120, height: 60 } });

  // === Título ===
  sheet.mergeCells("A6:H6");
  const tituloCell = sheet.getCell("A6");
  tituloCell.value = `Relatório de Entradas - ${nomeFornecedor} - ${anoSelecionado}`;
  tituloCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  tituloCell.alignment = { horizontal: "center", vertical: "middle" };
  tituloCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF05314C" } };

  // === Cabeçalho ===
  const header = [
    "Data", "Ordem de compra", "Produto", "Quantidade", 
    "Preço unitário", "Preço total s/ IPI", "IPI", "Valor total c/ IPI"
  ];
  const headerRow = sheet.addRow(header);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D597B" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });

  function formatarDataBrasileira(dataISO) {
    if (!dataISO) return "N/A";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // === DADOS COM IPI CORRETO ===
  ordens.forEach((ordem, index) => {
  const materialId = ordem.estoqueId;  // AQUI ESTAVA O PROBLEMA DESDE O INÍCIO
const ipi = estoqueIpiMap[Number(materialId)] ?? estoqueIpiMap[String(materialId)] ?? 0;
  const precoSemIpi = (ordem.valorUnitario || 0) * (ordem.quantidade || 0);
  const precoComIpi = precoSemIpi * (1 + ipi / 100);

  // VOCÊ VAI VER ISSO NO CONSOLE E VAI CHORAR DE FELICIDADE
  console.log(`Ordem ${ordem.id} → estoqueId: ${materialId} → IPI: ${ipi}% → Valor com IPI: R$${precoComIpi.toFixed(2)}`);

  const row = sheet.addRow([
    formatarDataBrasileira(ordem.dataDeEmissao),
    ordem.id || "N/A",
    ordem.tipoMaterial || ordem.descricaoMaterial || "N/A",
    ordem.quantidade || 0,
    ordem.valorUnitario || 0,
    precoSemIpi,
    ipi,
    precoComIpi
  ]);

  row.getCell(5).numFmt = 'R$ #,##0.00';
  row.getCell(6).numFmt = 'R$ #,##0.00';
  row.getCell(7).numFmt = '0.00"%"';
  row.getCell(8).numFmt = 'R$ #,##0.00';

  if (index % 2 === 0) {
    row.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
    });
  }
});

  // Depois de clicar no botão de um fornecedor, abre o console e cola isso:
console.log("PRIMEIRA ORDEM DESSE FORNECEDOR:", ordens[0]);
console.log("TODOS OS CAMPOS DISPONÍVEIS:", Object.keys(ordens[0]));
console.log("VALOR DO material_id (ou similar):", ordens[0]?.material_id, ordens[0]?.estoque_id, ordens[0]?.estoqueId);

// ADICIONE ESSES 2 CONSOLE.LOG LOGO APÓS CRIAR O MAPA
console.log("ESTOQUE COMPLETO (pra ver o id e o ipi):", estoque);
console.log("MAPA FINAL DE IPI:", estoqueIpiMap);
console.log("EXEMPLO: item com id 2 tem ipi =", estoque.find(i => Number(i.id) === 2)?.ipi);

  // === Total ===
  const ultimaLinha = sheet.rowCount;
  const totalRow = sheet.addRow([
    "TOTAL:", "", "",
    { formula: `SUBTOTAL(9,D8:D${ultimaLinha})` },
    "",
    { formula: `SUBTOTAL(9,F8:F${ultimaLinha})` },
    "",
    { formula: `SUBTOTAL(9,H8:H${ultimaLinha})` }
  ]);

  totalRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D597B" } };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };

        sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      col.width = maxLength + 5;
    });
  });

  // Filtros e largura
  sheet.autoFilter = { from: "A7", to: `H${ultimaLinha}` };
  sheet.columns.forEach(col => col.width = 18);

  // === Salvar ===
  const buffer = await workbook.xlsx.writeBuffer();
  const nomeArquivo = nomeFornecedor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "_");

  saveAs(new Blob([buffer]), `entradas_${nomeArquivo}_${anoSelecionado}.xlsx`);
}


  // 🔹 Exemplo de dados mockados (até integrar API de ordens)

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
            <img
              src={setaImg}
              alt="Voltar"
              className={styles.seta}
              onClick={() => navigate("/relatorios")}
            />
            <h1>
              RELATÓRIO COMPARATIVO DE FORNECEDORES{" "}
              {anoSelecionado && ` - ${anoSelecionado}`}
            </h1>
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
                <img
                  src={setaImg}
                  alt="seta esquerda"
                  className={styles.setaAno}
                  onClick={voltarAno}
                />
                {anosVisiveis.map((ano) => (
                  <div
                    key={ano}
                    className={`${styles.ano} ${anoSelecionado === ano ? styles.ativo : ""
                      }`}
                    onClick={() => setAnoSelecionado(ano)}
                  >
                    {ano}
                  </div>
                ))}
                <img
                  src={setaRightImg}
                  alt="seta direita"
                  className={styles.setaAno}
                  onClick={avancarAno}
                />
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
                  <tr key={fornecedor.fornecedorId}>
                    <td>
                      <b>
                        <h4>FORNECEDOR</h4>
                      </b>
                      <p>ID: {fornecedor.fornecedorId}</p>
                    </td>
                    <td>
                      <b>
                        <h4>NOME FANTASIA</h4>
                      </b>
                      <p>{fornecedor.nomeFantasia}</p>
                    </td>
                    <td>
                      <b>
                        <h4>CNPJ</h4>
                      </b>
                      <p>{fornecedor.cnpj}</p>
                    </td>
                    <td>
                      <b>
                        <h4>CONTATO</h4>
                      </b>
                      <p>{fornecedor.telefone}</p>
                    </td>
                    <td>
                      <button
                        className={styles.baixar}
                        onClick={async () => {
                          if (!anoSelecionado) {
                            toastError("Por favor, selecione um ano antes de baixar o relatório.");
                            return;
                          }

                          const ordens = await buscarOrdensDeCompra(
                            fornecedor.fornecedorId,
                            anoSelecionado
                          );

                          if (!ordens || ordens.length === 0) {
                            toastInfo("Nenhuma ordem encontrada para este fornecedor neste ano.");
                            return;
                          }

                          await baixarExcelFornecedores(ordens, anoSelecionado, fornecedor.nomeFantasia);
                          toastSuccess("Relatório gerado com sucesso!");
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
