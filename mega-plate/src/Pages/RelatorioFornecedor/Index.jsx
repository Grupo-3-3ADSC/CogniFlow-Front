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

    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20).setFont("helvetica", "bold");
    doc.text(`Relatório de Fornecimento da ${fornecedor} – ${ano}`, 20, 20);

    doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
    doc.text(
        "Análise dos fornecedores mais utilizados e desempenho anual.",
        20,
        60,
        { maxWidth: 170 }
    );
    doc.text(`DATA DE EMISSÃO: ${new Date().toLocaleString("pt-BR")}`, 20, 100);

    dadosMensais.forEach(mes => {
        doc.addPage();
        doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
        doc.text(mes.nomeMes.toUpperCase(), 20, 20);
        doc.setTextColor(...corTexto).setFontSize(12);
        let posY = 40;
        mes.dados.forEach(item => {
            doc.text(`${item.label}: ${item.valor}`, 20, posY);
            posY += 8;
        });
    });

    doc.addPage();
    doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
    doc.text(`${ano} - RESUMO ANUAL`, 20, 20);
    doc.setTextColor(...corTexto).setFontSize(12);
    let posY = 40;
    dadosAno.forEach(item => {
        doc.text(`${item.label}: ${item.valor}`, 20, posY);
        posY += 8;
    });

    doc.save(`relatorio_fornecedor_${fornecedor}_${ano}.pdf`);
}


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

    const anosVisiveis = todosAnos.slice(inicio, inicio + 3);

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
                    <h1>RELATÓRIO COMPARATIVO DE FORNECEDORES</h1>
                    <div className="filtro">    
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
                                                        dadosAnoFake,
                                                        dadosMensaisFake,
                                                        2025
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
