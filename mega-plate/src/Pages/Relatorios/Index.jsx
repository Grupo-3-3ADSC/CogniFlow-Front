import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import styles from "./relatorios.module.css";
import { jsPDF } from "jspdf";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";


/* ---------- Funções de geração de PDF ---------- */
export function gerarRelatorioEntradas(dadosAno, dadosMensais, ano) {
    const doc = new jsPDF();
    const corPrimaria = [5, 49, 76];
    const corTexto = [44, 62, 80];

    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20).setFont("helvetica", "bold");
    doc.text(`RELATÓRIO GERAL DE ENTRADAS – ${ano}`, 20, 20);

    doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
    doc.text(
        "Análise anual de entradas de materiais, destacando fornecedores, sazonalidades e variações de custo.",
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
    doc.text(`${ano} - RESUMO ANUAL (ENTRADAS)`, 20, 20);
    doc.setTextColor(...corTexto).setFontSize(12);
    let posY = 40;
    dadosAno.forEach(item => {
        doc.text(`${item.label}: ${item.valor}`, 20, posY);
        posY += 8;
    });

    doc.save(`relatorio_entradas_${ano}.pdf`);
}

export function gerarRelatorioSaidas(dadosAno, dadosMensais, ano) {
    const doc = new jsPDF();
    const corPrimaria = [102, 0, 0];
    const corTexto = [44, 62, 80];

    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20).setFont("helvetica", "bold");
    doc.text(`RELATÓRIO GERAL DE SAÍDAS – ${ano}`, 20, 20);

    doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
    doc.text(
        "Análise anual das saídas de materiais, com detalhamento por tipo de movimentação e quantidade transferida.",
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
    doc.text(`${ano} - RESUMO ANUAL (SAÍDAS)`, 20, 20);
    doc.setTextColor(...corTexto).setFontSize(12);
    let posY = 40;
    dadosAno.forEach(item => {
        doc.text(`${item.label}: ${item.valor}`, 20, posY);
        posY += 8;
    });

    doc.save(`relatorio_saidas_${ano}.pdf`);
}



function gerarDadosMensaisFake() {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return meses.map(mes => ({
        nomeMes: mes,
        dados: [
            { label: "Total do Valor Gasto", valor: `R$ ${(Math.random() * 100000 + 50000).toFixed(2)}` },
            { label: "Nº de fornecedores distintos", valor: Math.floor(Math.random() * 10) + 1 },
            { label: "Material mais comprado", valor: "Chapa Aço 1020" }
        ]
    }));
}


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
    const [anoSelecionado, setAnoSelecionado] = useState(todosAnos[todosAnos.length - 1]);

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
                                    <button className={styles.botao} onClick={() =>
                                        gerarRelatorioEntradas(dadosEntradasFake, gerarDadosMensaisFake(), anoSelecionado)
                                    }>
                                        {relatorio.botao}
                                    </button>
                                )}
                                {relatorio.tipo === "saidas" && (
                                    <button className={styles.botao} onClick={() =>
                                        gerarRelatorioSaidas(dadosSaidasFake, gerarDadosMensaisFake(), anoSelecionado)
                                    }>
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
