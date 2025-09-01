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
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2A80B9" }, // azul
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Filtra fornecedor
  const ordensFiltradas = fornecedorSelecionado
    ? ordensDeCompra.filter((ordem) => ordem.fornecedor === fornecedorSelecionado)
    : ordensDeCompra;

  ordensFiltradas.forEach((ordem) => {
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

  sheet.columns.forEach((col) => (col.width = 20));

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
