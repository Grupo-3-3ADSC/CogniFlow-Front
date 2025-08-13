import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./relatorios.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";

export function Relatorios() {
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
   const [filtroRelatorio, setFiltroRelatorio] = useState("todos");
    const todosAnos = [2025, 2026, 2027, 2028, 2029, 2030];
    const [inicio, setInicio] = useState(0);
    const [anoSelecionado, setAnoSelecionado] = useState(todosAnos[0]);




    /*  useEffect(() => {
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
     */


    const anosVisiveis = todosAnos.slice(inicio, inicio + 5);

    const avancarAno = () => {
        if (inicio + 5 < todosAnos.length) {
            setInicio(inicio + 1);
        }
    };

    const voltarAno = () => {
        if (inicio > 0) {
            setInicio(inicio - 1);
        }
    };

    const listaRelatorios = [
        {
            tipo: "entradas",
            titulo: "Relatório Geral de Entradas",
            descricao: "Análise anual geral de preços com foco em fornecedores, sazonalidades e oscilações críticas que impactaram os custos.",
            botao: "BAIXAR RELATÓRIO COMPARATIVO ANUAL"
        },
        {
            tipo: "saidas",
            titulo: "Relatório Geral de Saídas",
            descricao: "Análise anual geral de saídas com comparativo de saídas internas e externas.",
            botao: "BAIXAR RELATÓRIO COMPARATIVO ANUAL"
        },
        {
            tipo: "fornecedores",
            titulo: "Relatório Comparativo de Fornecedores",
            descricao: "Análise anual geral dos fornecedores, com matérias mais comprados e comparativo de preços.",
            botao: "FORNECEDORES"
        },
        {
            tipo: "material",
            titulo: "Relatório de Saídas por Material",
            descricao: "Análise anual geral de saídas com comparativo de saídas por produto.",
            botao: "MATERIAIS"
        }
    ];

    // Filtragem antes do return
    const relatoriosFiltrados = listaRelatorios.filter((relatorio) => {
        if (filtroRelatorio === "todos") return true; // mostra todos
        return relatorio.tipo === filtroRelatorio;
    });
    


    return (
        <>
            <NavBar />

            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>RELATÓRIOS DE DESEMPENHO</h1>
                    <div className={styles.filtro}>

                        <select
                            id="filtro"
                            value={filtroRelatorio}
                            onChange={(e) => setFiltroRelatorio(e.target.value)}
                            className={styles.selectFiltro}
                        >
                            <option value="todos">Todos os Relatórios</option>
                            <option value="entradas">Relatório Geral de Entradas</option>
                            <option value="saidas">Relatório Geral de Saídas</option>
                            <option value="material">Relatório de Saídas por Material</option>
                            <option value="fornecedores">Relatório Comparativo de Fornecedores</option>
                        </select>

                        <div className={styles.filtroAno}>
                            <div className={styles.anoContent}>
                                <img
                                    src={setaImg}
                                    alt="seta esquerda"
                                    className={styles.seta}
                                    onClick={voltarAno}
                                />
                                {anosVisiveis.map((ano) => (
                                    <div
                                        key={ano}
                                        className={`${styles.ano} ${anoSelecionado === ano ? styles.ativo : ""}`}
                                        onClick={() => setAnoSelecionado(ano)}
                                    >
                                        {ano}
                                    </div>
                                ))}
                                <img
                                    src={setaRightImg}
                                    alt="seta direita"
                                    className={styles.seta}
                                    onClick={avancarAno}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.relatorios}>
                        {relatoriosFiltrados.map((relatorio, index) => (
                            <div key={index} className={styles.relatorio}>
                                <h3>{relatorio.titulo} - {anoSelecionado}</h3>
                                <p>{relatorio.descricao}</p>
                                <button className={styles.botao}>
                                    {relatorio.botao}
                                    {(relatorio.tipo === "fornecedores" || relatorio.tipo === "material") && (
                                        <img src={setaRightImg} alt="Seta" className={styles.iconeBotao} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>


        </>
    );





}
export default Relatorios