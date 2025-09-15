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
    if (!ordens || ordens.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    // const sheet = workbook.addWorksheet("Entradas");

    const response = await fetch(logoMegaPlate);
    const blob = await response.blob();
    const imageBuffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });

    const sheetEntradas = workbook.addWorksheet("Entradas");

    // === Faixa azul do topo ===
    sheetEntradas.mergeCells("A1:I4");
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
    const titleRow = sheetEntradas.addRow([]);
    titleRow.height = 30;
    sheetEntradas.mergeCells("A6:I6");

    const tituloCell = sheetEntradas.getCell("A6");
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

    const headerRow = sheetEntradas.addRow(header);

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
      console.log(fornecedoresFiltrados);
      const row = sheetEntradas.addRow([
        formatarDataBrasileira(ordem.dataDeEmissao) || "N/A", // Data de emissão formatada (DD/MM/YYYY)
        ordem.fornecedor?.nomeFantasia || "Desconhecido", // Nome do fornecedor
        ordem.id || "N/A", // ID da ordem de compra
        ordem.descricaoMaterial || "N/A", // Descrição do material
        ordem.quantidade || 0, // Quantidade solicitada
        ordem.valorUnitario || 0, // Valor unitário
        ordem.valorUnitario * ordem.quantidade || 0, // Quantidade * Valor unitário
        (ordem.ipi || 0) / 100, // IPI em formato decimal (ex.: 10% -> 0.10)
        ordem.valorUnitario * ordem.quantidade * (1 + (ordem.ipi || 0) / 100) ||
          0, // Valor total com IPI
      ]);

      // Formatação de células
      row.getCell(6).numFmt = '"R$"#,##0.00';
      row.getCell(7).numFmt = '"R$"#,##0.00';
      row.getCell(8).numFmt = "0.00%";
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
    sheetEntradas.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      col.width = maxLength + 5;
    });
    const buffer = await workbook.xlsx.writeBuffer();
const nomeArquivo = nomeFornecedor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "_");

    saveAs(
      new Blob([buffer]),
      `entradas_${nomeArquivo}_${anoSelecionado}.xlsx`
    );
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
