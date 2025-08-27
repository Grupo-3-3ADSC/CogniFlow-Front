import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { toastSuccess, toastError, toastInfo } from "../../components/toastify/ToastifyService.jsx";
import styles from "./relatorioFornecedor.module.css";
import iconBaixar from '../../assets/icon-baixar.png';
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import logoMegaPlate from "../../assets/logo-megaplate-azul.png";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


function drawKpiCard(doc, x, y, w, h, titulo, valor, corPrimaria, corTexto) {
    doc.setDrawColor(...corPrimaria);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(x, y, w, h, 3, 3, "FD");

    doc.setTextColor(...corTexto);
    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.text(titulo, x + 6, y + 9);

    doc.setFont("helvetica", "normal").setFontSize(12);
    doc.setTextColor(30);
    doc.text(String(valor ?? "-"), x + 6, y + 20);
}

export function gerarRelatorioFornecedores(fornecedor, dadosAno, dadosMensais, ano) {
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
    doc.text(`RELATÓRIO DE FORNECEDOR – ${ano}`, pageWidth / 2, 20, { align: "center" });

    doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
    doc.text(`Fornecedor: ${fornecedor}`, pageWidth / 2, 80, { align: "center" })

    doc.setTextColor(...corTexto).setFontSize(12).setFont("helvetica", "normal");
    doc.text(
        "Análise dos fornecedores mais utilizados e desempenho anual.",
        pageWidth / 2, 60, { maxWidth: 170, align: "center" }
    );

    doc.text(`DATA DE EMISSÃO: ${dataEmissao}`, pageWidth / 2, 100, { align: "center" });
    if (logoMegaPlate) {
        doc.addImage(logoMegaPlate, "PNG", (pageWidth - 50) / 2, 120, 50, 50);
    }

    // ===== PÁGINAS MENSAIS =====
    (dadosMensais || []).forEach((mes) => {
        doc.addPage();

        // título do mês
        doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
        doc.text((mes?.nomeMes || "").toUpperCase(), 20, 30);

        // monta KPIs
        const kpis = mes?.dados?.map(d => ({ t: d.label, v: d.valor })) || [];

        // grid 2x2 de cards
        const gridX = 20, gridY = 50, gap = 8, cols = 2;
        const cardW = (pageWidth - gridX * 2 - gap * (cols - 1)) / cols;
        const cardH = 26;

        let idx = 0;
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < cols; c++) {
                if (idx >= kpis.length) break;
                const x = gridX + c * (cardW + gap);
                const y = gridY + r * (cardH + gap);
                const { t, v } = kpis[idx++];
                drawKpiCard(doc, x, y, cardW, cardH, t, v, corPrimaria, corTexto);
            }
        }

        // tabela de pedidos do mês
        const pedidos = mes?.pedidos || [];
        if (pedidos.length > 0) {
            const head = [
                ["Data", "Ordem de compra", "Produto", "Qtd", "Preço unitário", "Preço total pedido", "IPI (%)*", "Valor total"]
            ];

            const body = pedidos.map(p => [
                p.data,
                p.ordemCompra,
                p.produto,
                p.quantidade,
                `R$ ${p.precoUnitario.toFixed(2)}`,
                `R$ ${p.precoTotalPedido.toFixed(2)}`,
                `${p.ipi}%`,
                `R$ ${p.valorTotal.toFixed(2)}`
            ]);

            autoTable(doc, {
                head,
                body,
                startY: gridY + 2 * (cardH + gap) + 10,
                styles: { font: "helvetica", fontSize: 9 },
                headStyles: { fillColor: corPrimaria, textColor: [255, 255, 255] },
                theme: "striped",
                margin: { left: 20, right: 20 }
            });
        }

        doc.setFontSize(9).setFont("helvetica", "italic").setTextColor(...corTexto);
        doc.text(
            "* IPI (%) - Imposto sobre Produtos Industrializados aplicado sobre o material.",
            20, pageHeight - 41
        );

    });

    // ===== RESUMO ANUAL =====
    doc.addPage();
    doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...corPrimaria);
    doc.text(`${ano} - RESUMO ANUAL (FORNECEDOR)`, 20, 30);

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

    doc.save(`relatorio_fornecedor_${fornecedor}_${ano}.pdf`);
}


pedidos: [
    {
        data: "08/01/2025",
        ordemCompra: "1",
        produto: "SAE1023",
        quantidade: 30,
        precoUnitario: 250,
        precoTotalPedido: 7500,
        ipi: 10,
        valorTotal: 8250
    },
    {
        data: "08/02/2025",
        ordemCompra: "2",
        produto: "SAE1025",
        quantidade: 50,
        precoUnitario: 500,
        precoTotalPedido: 25000,
        ipi: 0,
        valorTotal: 25000
    }
]


const dadosMensaisFake = [
    {
        nomeMes: "Janeiro",
        dados: [
            { label: "Total de compras no mês", valor: "120" },
            { label: "Valor total comprado (R$)", valor: "50.000,00" },
            { label: "Nº de pedidos realizados", valor: "15" },
            { label: "Material mais comprado", valor: "Chapa Aço" }
        ],
        pedidos: [
            {
                data: "08/01/2025",
                ordemCompra: "1",
                produto: "SAE1023",
                quantidade: 30,
                precoUnitario: 250,
                precoTotalPedido: 7500,
                ipi: 10,
                valorTotal: 8250
            },
            {
                data: "08/02/2025",
                ordemCompra: "2",
                produto: "SAE1025",
                quantidade: 50,
                precoUnitario: 500,
                precoTotalPedido: 25000,
                ipi: 0,
                valorTotal: 25000
            }
        ]
    },
    {
        nomeMes: "Fevereiro",
        dados: [
            { label: "Total de compras no mês", valor: "100" },
            { label: "Valor total comprado (R$)", valor: "40.000,00" },
            { label: "Nº de pedidos realizados", valor: "10" },
            { label: "Material mais comprado", valor: "Bobina" }
        ],
        pedidos: [] // pode deixar vazio se não quiser mostrar tabela
    }
];


const dadosAnoFake = [
    { label: "Total de compras no ano", valor: "1500" },
    { label: "Valor total comprado (R$)", valor: "500.000,00" },
    { label: "Nº de pedidos realizados", valor: "120" },
    { label: "Material mais comprado", valor: "Chapa Aço" }
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
    const [anoSelecionado, setAnoSelecionado] = useState(null);

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
            toastError("Erro ao carregar fornecedores");
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
                    <div className={styles.header}>
                        <img
                            src={setaImg}
                            alt="Voltar"
                            className={styles.seta}
                            onClick={() => navigate("/relatorios")}
                        />
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
                                                    gerarRelatorioFornecedores(
                                                        fornecedor.nomeFantasia,
                                                        dadosAnoFake,
                                                        dadosMensaisFake,  // idem
                                                        anoSelecionado
                                                    )
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
