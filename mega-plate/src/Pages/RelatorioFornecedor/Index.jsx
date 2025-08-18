import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import Swal from "sweetalert2";
import styles from "./relatorioFornecedor.module.css";
import iconBaixar from '../../assets/icon-baixar.png';
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api.js";
import { jsPDF } from "jspdf";


export function gerarRelatorioFornecedores(fornecedor, dadosAno, dadosMensais, ano) {
    const doc = new jsPDF();
    const corPrimaria = [5, 49, 76];
    const corTexto = [44, 62, 80];
    const dataEmissao = new Date().toLocaleString("pt-BR");

    // --- CAPA ---
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16).setFont("helvetica", "bold");
    doc.text(`RELATÓRIO COMPARATIVO DE FORNECEDORES - ${ano}`, 20, 20);

    doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
    doc.text(
        "Análise anual das compras realizadas com o fornecedor selecionado, incluindo valores, quantidade de pedidos e materiais adquiridos.",
        20,
        60,
        { maxWidth: 170 }
    );
    doc.text(`Fornecedor: ${fornecedor}`, 20, 80);
    doc.text(`Data de emissão: ${dataEmissao}`, 20, 100);

    // --- PÁGINAS MENSAL ---
    dadosMensais.forEach((mes) => {
        doc.addPage();
        doc.setFillColor(...corPrimaria);
        doc.rect(0, 0, 210, 20, "F");

        doc.setTextColor(255, 255, 255).setFontSize(14).setFont("helvetica", "bold");
        doc.text(`RELATÓRIO COMPARATIVO DE FORNECEDORES - ${ano}`, 20, 12);

        doc.setTextColor(...corPrimaria).setFontSize(16);
        doc.text(mes.nomeMes.toUpperCase(), 20, 40);

        doc.setTextColor(...corTexto).setFontSize(12);
        let posY = 60;
        mes.dados.forEach((item) => {
            doc.text(`${item.label}: ${item.valor}`, 20, posY);
            posY += 10;
        });
    });

    // --- PÁGINA RESUMO ANUAL ---
    doc.addPage();
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 20, "F");

    doc.setTextColor(255, 255, 255).setFontSize(14).setFont("helvetica", "bold");
    doc.text(`RELATÓRIO GERAL DE ENTRADAS - ${ano}`, 20, 12);

    doc.setTextColor(...corPrimaria).setFontSize(16);
    doc.text(`${ano} - RESUMO ANUAL`, 20, 40);

    doc.setTextColor(...corTexto).setFontSize(12);
    let posY = 60;
    dadosAno.forEach((item) => {
        doc.text(`${item.label}: ${item.valor}`, 20, posY);
        posY += 10;
    });

    // --- RODAPÉ EM TODAS AS PÁGINAS ---
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(9).setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text(
            `Emitido em: ${dataEmissao} | Página ${i} de ${totalPaginas}`,
            105, // centralizado (largura A4 ~210mm, então metade é ~105)
            290, // embaixo (altura A4 ~297mm, margem inferior)
            { align: "center" }
        );
    }

    doc.save(`relatorio_fornecedor_${fornecedor}_${ano}.pdf`);
}


const dadosMensaisFake = [
  {
    nomeMes: "Janeiro",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
  {
    nomeMes: "Fevereiro",
    dados: [
      { label: "Total de compras no mês", valor: "100" },
      { label: "Valor total comprado (R$)", valor: "40.000,00" },
      { label: "Nº de pedidos realizados", valor: "10" },
      { label: "Material mais comprado", valor: "Bobina (50 unid.)" }
    ]
  },
   {
    nomeMes: "Março",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Abril",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Maio",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Junho",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Julho",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Agosto",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Setembro",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Outrubro",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Novembro",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },
   {
    nomeMes: "Dezembro",
    dados: [
      { label: "Total de compras no mês", valor: "120" },
      { label: "Valor total comprado (R$)", valor: "50.000,00" },
      { label: "Nº de pedidos realizados", valor: "15" },
      { label: "Material mais comprado", valor: "Chapa Aço (80 unid.)" }
    ]
  },


];

const dadosAnoFake = [
  { label: "Total de compras no ano", valor: "1500" },
  { label: "Valor total comprado (R$)", valor: "500.000,00" },
  { label: "Nº de pedidos realizados", valor: "120" },
  { label: "Material mais comprado", valor: "Chapa Aço (800 unid.)" }
];

function gerarListaAnos(anoInicial) {
    const anoAtual = new Date().getFullYear();
    const anos = [];

    for (let ano = anoAtual; ano >= anoInicial; ano--) {
        anos.push(ano);
    }

    return anos;
}


export function RelatorioFornecedor() {
    const [fornecedores, setFornecedores] = useState([]);
    const [filtroNome, setFiltroNome] = useState("");
    const [inicio, setInicio] = useState(0);
    const todosAnos = gerarListaAnos(2018);
    const [anoSelecionado, setAnoSelecionado] = useState(todosAnos[todosAnos.length - 1]);

    const anosVisiveis = todosAnos.slice(inicio, inicio + 5);

    const avancarAno = () => {
        if (inicio + 5 < todosAnos.length) setInicio(inicio + 1);
    };
    const voltarAno = () => {
        if (inicio > 0) setInicio(inicio - 1);
    };

    const navigate = useNavigate();
    const MOCK_MODE = true;

    const buscarFornecedores = async () => {
        try {
            if (MOCK_MODE) {
                setFornecedores([
                    {
                        id: 1,
                        nomeFantasia: "Metalúrgica Alfa",
                        cnpj: "12.345.678/0001-99",
                        contato: "(11) 99999-0000",
                        status: "ativos"
                    },
                    {
                        id: 2,
                        nomeFantasia: "Aço Forte LTDA",
                        cnpj: "98.765.432/0001-55",
                        contato: "(11) 98888-1111",
                        status: "inativos"
                    },
                    {
                        id: 3,
                        nomeFantasia: "Chapas Brasil",
                        cnpj: "11.222.333/0001-44",
                        contato: "(21) 97777-2222",
                        status: "ativos"
                    }
                ]);
            } else {
                const token = sessionStorage.getItem("authToken");
                const res = await api.get("/fornecedores", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFornecedores(res.data);
            }
        } catch (error) {
            Swal.fire("Erro ao carregar fornecedores", "", "error");
        }
    };

    useEffect(() => {
        buscarFornecedores();
    }, []);

    // ✅ Agora filtra só pelo nome
    const fornecedoresFiltrados = fornecedores.filter(f =>
        f.nomeFantasia.toLowerCase().includes(filtroNome.toLowerCase().trim())
    );

    return (
        <>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>RELATÓRIO COMPARATIVO DE FORNECEDORES - {anoSelecionado}</h1>
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
                                <img src={setaImg} alt="seta esquerda" className={styles.seta} onClick={voltarAno} />
                                {anosVisiveis.map((ano) => (
                                    <div
                                        key={ano}
                                        className={`${styles.ano} ${anoSelecionado === ano ? styles.ativo : ""}`}
                                        onClick={() => setAnoSelecionado(ano)}
                                    >
                                        {ano}
                                    </div>
                                ))}
                                <img src={setaRightImg} alt="seta direita" className={styles.seta} onClick={avancarAno} />
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
                                                onClick={() =>
                                                    gerarRelatorioFornecedores(
                                                        fornecedor.nomeFantasia,
                                                        dadosAnoFake,      // aqui depois você puxa da API
                                                        dadosMensaisFake,  // idem
                                                        anoSelecionado     // ✅ usa o ano selecionado
                                                    )
                                                }
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
