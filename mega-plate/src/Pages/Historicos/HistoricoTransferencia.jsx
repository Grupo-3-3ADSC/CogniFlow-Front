import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import styles from "./historicos.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import iconbaixar from "../../assets/icon-baixar.png";

export function HistoricoTransferencia() {
    const [transferencias, setTransferencias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [isGestor, setIsGestor] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todas");
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();
    const [historicoTransferencias, setHistoricoTransferencias] = useState([]);


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

    useEffect(() => {
        setFade(false); // inicia fade out
        const timeout = setTimeout(() => {
            setUsuarios([]);
            buscarTransferencias();
            setFade(true); // inicia fade in depois de buscar
        }, 200); // tempo de fade out antes de buscar

        return () => clearTimeout(timeout);
    }, [filtroStatus]);

    const buscarTransferencias = async () => {
        const token = sessionStorage.getItem("authToken");
        const cargoUsuario = sessionStorage.getItem("cargoUsuario");

        setIsGestor(Number(cargoUsuario) === 2);

        let url = "/estoque";

        try {
            const res = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransferencias(res.data);
        } catch (error) {
            Swal.fire("Erro ao carregar transferências", "", "error");
        }
    };

    function formatarDataBrasileira(dataISO) {
        if (!dataISO) return "N/A";

        // Pega só a parte da data, ignorando a hora
        const [ano, mes, dia] = dataISO.split("T")[0].split("-");

        return `${dia}/${mes}/${ano}`;
    }

    const formatarHora = (isoString) => {
        const data = new Date(isoString);
        return data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const transferenciasFiltradas = transferencias.filter((transferencias) => {
        if (filtroStatus === "todas") return true;
        if (filtroStatus === "internas") return transferencias.tipoTransferencia === "Internas";
        if (filtroStatus === "externas") return transferencias.tipoTransferencia === "Externas";
        return true;
    });

    function baixarOrdem(id) {
        const item = transferencias.find((t) => t.id === id);
        if (!item) {
            Swal.fire("Transferência não encontrada", "", "warning");
            return;
        }
        gerarPDFTransferencia(item);
    }

    function gerarPDFTransferencia(t) {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const primaryColor = [52, 58, 64];
        const secondaryColor = [0, 123, 255];
        const textColor = [33, 37, 41];

        const marginLeft = 20;
        const marginTop = 20;

        // Cabeçalho
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 35, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("RELATÓRIO DE TRANSFERÊNCIA", marginLeft, marginTop + 5);
        doc.setFontSize(14);
        doc.text("DE MATERIAL", marginLeft, marginTop + 12);

        doc.setTextColor(...textColor);

        // Metadados
        let yPos = 45;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text("Informações do Registro", marginLeft, yPos);

        doc.setFillColor(248, 249, 250);
        doc.rect(marginLeft - 5, yPos + 5, 170, 25, "F");

        yPos += 15;
        doc.setFontSize(11);
        doc.setTextColor(...textColor);

        const dataHora = t?.ultimaMovimentacao
            ? new Date(t.ultimaMovimentacao).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            : new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

        doc.setFont("helvetica", "bold");
        doc.text("Data e Hora:", marginLeft, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(String(dataHora), marginLeft + 35, yPos);

        // Detalhes
        yPos += 25;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...secondaryColor);
        doc.text("Detalhes da Movimentação", marginLeft, yPos);

        doc.setFillColor(248, 249, 250);
        doc.rect(marginLeft - 5, yPos + 5, 170, 50, "F");

        yPos += 20;
        doc.setFontSize(11);
        doc.setTextColor(...textColor);

        const details = [
            { label: "ID:", value: t?.id ?? "—" },
            { label: "Quantidade:", value: t?.quantidadeAtual ?? "—" },
            { label: "Tipo de Material:", value: t?.tipoMaterial ?? "—" },
            { label: t?.setor ? "Setor:" : "Tipo de Transferência:", value: t?.setor ?? t?.tipoTransferencia ?? "—" },
        ];

        details.forEach((item, index) => {
            doc.setFont("helvetica", "bold");
            doc.text(item.label, marginLeft, yPos + index * 12);
            doc.setFont("helvetica", "normal");
            doc.text(String(item.value), marginLeft + 50, yPos + index * 12);
        });

        // Rodapé + página
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(220, 220, 220);
        doc.line(marginLeft - 5, pageH - 27, pageW - 20, pageH - 27);

        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(128, 128, 128);
        doc.text("Documento gerado automaticamente pelo sistema.", marginLeft, pageH - 17);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("MEGA PLATE", marginLeft, pageH - 12);
        doc.setFont("helvetica", "normal");
        doc.text("- Supremacia em Corte", marginLeft + 20, pageH - 12);

        const total = doc.getNumberOfPages ? doc.getNumberOfPages() : doc.internal.getNumberOfPages();
        doc.setTextColor(128, 128, 128);
        doc.text(`Página 1 de ${total}`, pageW - 20, pageH - 12, { align: "right" });

        doc.save(`transferencia-${t?.id ?? "detalhe"}.pdf`);
    }

    function gerarPDFHistorico(lista) {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const primaryColor = [52, 58, 64];
        const textColor = [33, 37, 41];

        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const marginLeft = 12;
        const marginRight = 12;
        const usableW = pageW - marginLeft - marginRight;

        // Cabeçalho
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageW, 20, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("HISTÓRICO DE TRANSFERÊNCIAS", marginLeft, 13);

        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(
            `Emitido em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}  |  Total de registros: ${lista.length}`,
            marginLeft,
            28
        );

        // Tabela
        let y = 36;

        const cols = [
            { key: "id", title: "ID", width: 16 },
            { key: "dia", title: "DIA", width: 22 },
            { key: "hora", title: "HORA", width: 18 },
            { key: "tipoMaterial", title: "MATERIAL", width: 60 },
            { key: "setor", title: "SETOR", width: 28 },
            { key: "quantidadeAtual", title: "QTD", width: 26, align: "right" },
        ];

        const headerH = 8;
        const rowH = 8;

        function desenharCabecalhoTabela() {
            let x = marginLeft;
            doc.setFillColor(240, 240, 240);
            doc.setDrawColor(200, 200, 200);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            cols.forEach((c) => {
                doc.rect(x, y, c.width, headerH, "F");
                doc.text(c.title, x + 2, y + 5);
                x += c.width;
            });
            y += headerH;
        }

        desenharCabecalhoTabela();

        const ordenar = [...lista].sort((a, b) => {
            const da = a?.ultimaMovimentacao ? new Date(a.ultimaMovimentacao).getTime() : 0;
            const db = b?.ultimaMovimentacao ? new Date(b.ultimaMovimentacao).getTime() : 0;
            return db - da; // mais recentes primeiro
        });

        ordenar.forEach((t) => {
            if (y + rowH > pageH - 18) {
                doc.addPage();
                y = 20;
                // título em páginas seguintes
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("HISTÓRICO DE TRANSFERÊNCIAS (cont.)", marginLeft, y);
                y += 6;
                desenharCabecalhoTabela();
            }

            const linha = {
                id: t?.id ?? "—",
                dia: t?.ultimaMovimentacao ? formatarDataBrasileira(t.ultimaMovimentacao) : "—",
                hora: t?.ultimaMovimentacao ? formatarHora(t.ultimaMovimentacao) : "—",
                tipoMaterial: t?.tipoMaterial ?? "—",
                setor: t?.setor ?? t?.tipoTransferencia ?? "—",
                quantidadeAtual: t?.quantidadeAtual ?? "—",
            };

            let x = marginLeft;
            doc.setDrawColor(220, 220, 220);
            cols.forEach((c) => {
                doc.rect(x, y, c.width, rowH); // borda da célula
                const txt = String(linha[c.key]);
                if (c.align === "right") {
                    doc.text(txt, x + c.width - 2, y + 6, { align: "right" });
                } else {
                    // corte simples se o texto for muito grande
                    const txtCortado = doc.splitTextToSize(txt, c.width - 3)[0];
                    doc.text(txtCortado, x + 2, y + 6);
                }
                x += c.width;
            });
            y += rowH;
        });

        // Rodapés com paginação
        const total = doc.getNumberOfPages ? doc.getNumberOfPages() : doc.internal.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            doc.setPage(i);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${total}`, pageW - 12, pageH - 8, { align: "right" });
        }

        doc.save("historico-transferencias.pdf");
    }



    return (
        <>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>HISTÓRICO DE TRANSFERÊNCIAS</h1>
                    <label htmlFor="filtro" className={styles.labelFiltro}>
                        Filtrar por status:{" "}
                    </label>
                    <select
                        id="filtro"
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className={styles.selectFiltro}
                    >
                        <option value="todas">Todas</option>
                        <option value="internas">Internas</option>
                        <option value="externas">Externas</option>
                    </select>
                    <p className={styles.qtdUsuarios}>
                        {transferencias.length} transferência(s) encontrada(s)
                    </p>

                    {transferenciasFiltradas.length === 0 ? (
                        <p className={styles.mensagemVazia}>
                            {filtroStatus === "internas" && "Nenhuma transferência interna foi encontrada."}

                            {filtroStatus === "externas" && "Nenhuma transferência externa foi encontrada."}

                            {filtroStatus === "todas" && "Nenhuma transferência cadastrada no sistema."}
                        </p>
                    ) : (
                        <div className={styles.tabelaWrapper}>
                            <table className={`${styles.tabela} ${fade ? styles.fadeIn : styles.fadeOut}`}>
                                <thead>
                                    <tr className={styles.containerTitulos}>
                                        <th id="titulo">TRANSFERÊNCIA</th>
                                        <th id="titulo">DIA</th>
                                        <th id="titulo">HORA</th>
                                        <th id="titulo">MATERIAL</th>
                                        <th id="titulo">SETOR</th>
                                        <th id="titulo">QUANTIDADE TRANSFERIDA</th>
                                        <th id="titulo">BAIXAR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transferenciasFiltradas.map((transferencias) => (
                                        <tr className={styles.containerDados} key={transferencias.id}>
                                            <td><p><b> ID: {transferencias.id} </b> </p></td>
                                            <td><p><b>{formatarDataBrasileira(transferencias.ultimaMovimentacao)}</b></p> </td>
                                            <td><p><b>{formatarHora(transferencias.ultimaMovimentacao)}</b></p> </td>
                                            <td><p><b>{transferencias.tipoMaterial}</b></p></td>
                                            <td><p><b>{transferencias.setor}</b></p> </td>
                                            <td><p><b>{transferencias.quantidadeAtual}</b></p></td>
                                            <td > <button className={styles.baixarRelatorio}
                                                onClick={() => baixarOrdem(transferencias.id)}

                                            >
                                                <img src={iconbaixar} alt="Baixar" />

                                            </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default HistoricoTransferencia;