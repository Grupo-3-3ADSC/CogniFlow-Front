import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./historicos.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import iconbaixar from "../../assets/icon-baixar.png";
import baixarOrdemDeCompraPDF from "../../tools/baixarOrdemDeCompraPDF.jsx";

export function Historicos() {
    const [ordens, setOrdens] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [isGestor, setIsGestor] = useState(false);
    const [filtroId, setFiltroId] = useState("");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroPrazo, setFiltroPrazo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
    const [filtroPendentes, setFiltroPendentes] = useState("");
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();

    const [ordensPaginadas, setOrdensPaginadas] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [paginasTotais, setPaginasTotais] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const ordensPorPagina = 6;

    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        const cargo = parseInt(sessionStorage.getItem("cargoUsuario"), 10);
        if (!token) {
            navigate("/");
        } else if (cargo !== 2) {
            // Verifica se o usuário não é gestor
            Swal.fire({
                title: "Acesso Negado",
                text: "Você não tem permissão para acessar esta página.",
                icon: "error",
                confirmButtonColor: "#3085d6",
            });
            navigate("/material"); // Redireciona para outra página
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
            buscarOrdensDeCompra();
            getOrdensPaginadas();
            setFade(true); // inicia fade in depois de buscar
        }, 200); // tempo de fade out antes de buscar

        return () => clearTimeout(timeout);
    }, [filtroPendentes, paginaAtual]);

    const buscarOrdensDeCompra = async () => {
        const token = sessionStorage.getItem("authToken");
        const cargoUsuario = sessionStorage.getItem("cargoUsuario");

        setIsGestor(Number(cargoUsuario) === 2);

        let url = "/ordemDeCompra";

        try {
            const res = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrdens(res.data);
        } catch (error) {
            Swal.fire("Erro ao carregar ordens de compra", "", "error");
        }
    };


    function getOrdensPaginadas() {
        const paginaInt = Number(paginaAtual) || 0;
        api.
            get(`/ordemDeCompra/paginados?pagina=${paginaInt}&tamanho=${ordensPorPagina}`)
            .then((response) => {
                const { data, paginasTotais, totalItems, paginaAtual, hasNext, hasPrevious } = response.data;

                //  console.log("dataaaa: ", data)

                setOrdensPaginadas(data);
                setPaginasTotais(paginasTotais);
                setTotalItems(totalItems);
                setPaginaAtual(paginaAtual);
                setHasNext(hasNext);
                setHasPrevious(hasPrevious);
            })
            .catch((err) => {
                console.error("Erro ao buscar fornecedores paginados:", err);
            });
    }

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


    const confirmarEntrega = async (id) => {
        const token = sessionStorage.getItem("authToken");
        const result = await Swal.fire({
            title: "Deseja confirmar esta entrega?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Não",
            confirmButtonColor: "#28a745",
        });

        if (result.isConfirmed) {
            let resposta = {
                id: "",
                quantidade: "",
                pendenciaAlterada: ""
            }

            for (var i = 0; i <= ordens.length; i++) {
                let ordemAtual = ordens[i];
                if (ordemAtual.id == id) {
                    if (ordemAtual.pendenciaAlterada == 0) {
                        resposta = {
                            id: parseInt(ordemAtual.id),
                            quantidade: ordemAtual.quantidade,
                        };
                        break;
                    }
                    resposta = {
                        id: parseInt(ordemAtual.id),
                        quantidade: ordemAtual.quantidade,
                    };
                    break;
                }
            }

            api.patch(`/ordemDeCompra/${id}`, resposta, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
                .then((requisicao) => {
                    resposta = {
                        id: "",
                        quantidade: "",
                        pendenciaAlterada: ""
                    };
                    Swal.fire({
                        title: "Sucesso na entrega da ordem de compra!",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, "2000")
                })
                .catch((err) => {
                    console.error("erro na mudança de quantidade atual: ", err);
                    Swal.fire("Erro ao confirmar entrega da ordem de compra", "", "error");
                });
        }
    }

    const cancelarEntrega = async (id) => {
        const token = sessionStorage.getItem("authToken");
        const result = await Swal.fire({
            title: "Deseja cancelar esta entrega?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Cancelar",
            cancelButtonText: "Não",
            confirmButtonColor: "#ff0000",
        });

        if (result.isConfirmed) {
            let resposta = {
                id: "",
                quantidade: "",
                pendenciaAlterada: ""
            }

            for (var i = 0; i <= ordens.length; i++) {
                let ordemAtual = ordens[i];
                if (ordemAtual.id == id) {
                    if (ordemAtual.pendenciaAlterada == 0) {
                        resposta = {
                            id: parseInt(ordemAtual.id),
                            quantidade: ordemAtual.quantidade,
                        };
                        break;
                    }
                    resposta = {
                        id: parseInt(ordemAtual.id),
                        quantidade: ordemAtual.quantidade,
                    };
                    break;
                }
            }

            api.patch(`/ordemDeCompra/${id}`, resposta, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
                .then((requisicao) => {
                    resposta = {
                        id: "",
                        quantidade: "",
                        pendenciaAlterada: ""
                    };
                    Swal.fire({
                        title: "Sucesso no cancelamento da ordem de compra!",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, "1700")
                })
                .catch((err) => {
                    console.error("erro na mudança de quantidade atual: ", err);
                    Swal.fire("Erro ao confirmar entrega da ordem de compra", "", "error");
                });
        }
    }


    const ordensFiltradas = ordensPaginadas.filter((ordem) => {
        const matchId = filtroId
            ? String(ordem?.id ?? "").includes(filtroId)
            : true;

        const matchDia = filtroDia
            ? (ordem?.dataDeEmissao ?? "")
                .toLowerCase()
                .includes(filtroDia.toLowerCase())
            : true;

        const matchPrazo = filtroPrazo
            ? (ordem?.prazoEntrega ?? "")
                .toLowerCase()
                .includes(filtroPrazo.toLowerCase())
            : true;

        const matchPendentes =
            filtroPendentes && filtroPendentes !== "todos"
                ? (ordem?.pendenciaAlterada ? "entregue" : "pendente") === filtroPendentes.toLowerCase()
                : true;


        return matchId && matchDia && matchPrazo && matchPendentes;
    });


    function gerarPaginas() {
    const paginas = [];
    const maxPaginasVisiveis = 3;
    
    // Calcular o range de páginas a mostrar
    let paginaInicio = Math.max(0, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let paginaFim = Math.min(paginasTotais - 1, paginaInicio + maxPaginasVisiveis - 1);
    
    // Ajustar o início se estivermos muito próximos do fim
    if (paginaFim - paginaInicio < maxPaginasVisiveis - 1) {
        paginaInicio = Math.max(0, paginaFim - maxPaginasVisiveis + 1);
    }
    
    // Seta para esquerda (mostrar páginas anteriores)
    if (paginaInicio > 0) {
        paginas.push(
            <div
                key="prev"
                className={`${styles.circle} ${styles.circleSmall}`}
                onClick={() => {
                    const novaPagina = Math.max(0, paginaInicio - maxPaginasVisiveis);
                    setPaginaAtual(novaPagina + Math.floor(maxPaginasVisiveis / 2));
                }}
            >
                {"<"}
            </div>
        );
    }
    
    // Páginas numeradas
    for (let i = paginaInicio; i <= paginaFim; i++) {
        paginas.push(
            <div
                key={i}
                className={`${styles.circle} ${styles.circleSmall} ${paginaAtual === i ? styles.active : ""}`}
                onClick={() => setPaginaAtual(i)}
            >
                {i + 1}
            </div>
        );
    }
    
    // Seta para direita (mostrar páginas seguintes)
    if (paginaFim < paginasTotais - 1) {
        paginas.push(
            <div
                key="next"
                className={`${styles.circle} ${styles.circleSmall}`}
                onClick={() => {
                    const novaPagina = Math.min(paginasTotais - 1, paginaFim + 1);
                    setPaginaAtual(novaPagina);
                }}
            >
                {">"}
            </div>
        );
    }
    
    return paginas;
}

    return (
        <>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>HISTÓRICO DE ORDEM DE COMPRA</h1>
                    <div className={styles.filtros}>
                        <input
                            id="status"
                            type="text"
                            placeholder="Filtrar por ID"
                            value={filtroId}
                            className={styles.inputFiltro}
                            onChange={(e) => setFiltroId(e.target.value)}
                        />
                        <label htmlFor="">Filtrar por data de emissão</label>
                        <input
                            type="date"
                            value={filtroDia}
                            onChange={(e) => setFiltroDia(e.target.value)}
                            className={styles.inputFiltro}
                        />
                        <label htmlFor="">Filtrar por prazo de entrega</label>
                        <input
                            type="date"
                            placeholder="Filtrar por data de prazo"
                            value={filtroPrazo}
                            onChange={(e) => setFiltroPrazo(e.target.value)}
                            className={styles.inputFiltro}
                        />
                        <select
                            value={filtroPendentes}
                            onChange={(e) => setFiltroPendentes(e.target.value)}
                            className={styles.inputFiltro}
                        >
                            <option value="todos">Filtrar por status</option>
                            <option value="pendente">Pendente</option>
                            <option value="entregue">Entregue</option>
                        </select>
                    </div>
                    <p className={styles.qtdUsuarios}>
                        {ordens.length} ordem(s) de compra encontrada(s)
                    </p>
                    <div className={styles.tabelaWrapper}>
                        <table className={`${styles.tabela} ${fade ? styles.fadeIn : styles.fadeOut}`}>
                            <thead>
                                <tr className={styles.containerTitulos}>
                                    <th id="titulo">ORDEM DE COMPRA</th>
                                    <th id="titulo">DIA</th>
                                    <th id="titulo">HORA</th>
                                    <th id="titulo">PRAZO DE ENTREGA</th>
                                    <th id="titulo">STATUS</th>
                                    <th id="titulo">CONFIRMAR ENTREGA</th>
                                    <th id="titulo">CANCELAR ENTREGA</th>
                                    <th id="titulo">BAIXAR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordensFiltradas.map((ordem) => (
                                    <tr className={styles.containerDados} key={ordem.id}>
                                        <td><b><p>ID: {ordem.id}</p></b></td>
                                        <td><b><p>{formatarDataBrasileira(ordem.dataDeEmissao)}</p> </b> </td>
                                        <td><b><p>{formatarHora(ordem.dataDeEmissao)}</p> </b> </td>
                                        <td><b><p>{formatarDataBrasileira(ordem.prazoEntrega)}</p></b> </td>
                                        <td><b><p>{ordem.pendenciaAlterada ? "Entregue" : "Pendente"}</p> </b> </td>
                                        <td >
                                            <button className={styles.ativar}
                                                onClick={() => confirmarEntrega(ordem.id)}
                                                disabled={ordem.pendenciaAlterada === true}
                                            >
                                                <b>CONFIRMAR </b>
                                            </button>
                                        </td>
                                        <td>
                                            <button className={styles.cancelar}
                                                onClick={() => cancelarEntrega(ordem.id)}
                                                disabled={ordem.pendenciaAlterada === false}
                                            >
                                                <b>CANCELAR </b>
                                            </button>
                                        </td>
                                        <td >
                                            <button className={styles.baixar}
                                                onClick={() => baixarOrdemDeCompraPDF(ordem.id)}

                                            >
                                                <img src={iconbaixar} alt="Baixar" />

                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.backgroundPages}>
                    {gerarPaginas()}
                </div>
            </div>
        </>
    );
}
export default Historicos;

