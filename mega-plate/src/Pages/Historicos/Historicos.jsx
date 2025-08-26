import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./historicos.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import iconbaixar from "../../assets/icon-baixar.png";

export function Historicos() {
    const [ordens, setOrdens] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [isGestor, setIsGestor] = useState(false);
    const [filtroId, setFiltroId] = useState("");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroPrazo, setFiltroPrazo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();

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
            buscarOrdensDeCompra();
            setFade(true); // inicia fade in depois de buscar
        }, 200); // tempo de fade out antes de buscar

        return () => clearTimeout(timeout);
    }, [filtroStatus]);

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




    function handleMudancaQuantidadeAtual() {

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


    const alternarEntrega = async (entregaConfirmada) => {
        const result = await Swal.fire({
            title: entregaConfirmada
                ? "Deseja cancelar esta entrega?"
                : "Deseja confirmar esta entrega?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: entregaConfirmada ? "Cancelar" : "Confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: entregaConfirmada ? "#ff0000" : "#28a745",
        });

        if (result.isConfirmed) {
            const idUsuario = sessionStorage.getItem("usuario");

            const [resposta, setResposta] = useState({
                id: "",
                pendentes: "",
                pendenciaAlterada: ""
            })

            for (i = 0; i <= ordens.length; i++) {
                let ordemAtual = ordens[i];

                if (ordemAtual.usuarioId == idUsuario) {
                    if (ordemAtual.pendenciaAlterada == 0) {
                        setResposta({
                            id: parseInt(ordemAtual.id),
                            pendentes: ordemAtual.quantidade,
                            pendenciaAlterada: true
                        });
                        break;
                    }

                    setResposta({
                        id: parseInt(ordemAtual.id),
                        pendentes: ordemAtual.pendentes,
                        pendenciaAlterada: false
                    });
                    break;
                }
            }

            api.patch(`/ordemDeCompra/${idUsuario}`, resposta, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
                .then((requisicao) => {
                    //console.log(requisicao.data);
                    setResposta({
                        id: "",
                        pendentes: "",
                        pendenciaAlterada: ""
                    });
                    Swal.fire("Sucesso na entrega da ordem de compra!", "", "success");
                })
                .catch((err) => {
                    console.error("erro na mudança de quantidade atual: ", err);
                    Swal.fire("Erro ao confirmar entrega da ordem de compra", "", "error");
                });
        }
    }

    const ordensFiltradas = ordens.filter((ordem) => {
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

        const matchStatus = filtroStatus
            ? (ordem?.status ?? "")
                .toLowerCase()
                .includes(filtroStatus.toLowerCase())
            : true;

        return matchId && matchDia && matchPrazo && matchStatus;
    });



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
                        <input
                            type="text"
                            placeholder="Filtrar por status"
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className={styles.inputFiltro}
                        />
                    </div>
                    <p className={styles.qtdUsuarios}>
                        {ordens.length} ordem(s) de compra encontrada(s)
                    </p>

                    {ordensFiltradas.length === 0 ? (
                        <p className={styles.mensagemVazia}>
                            {filtroStatus === "pendentes" && "Nenhuma ordem de compra pendente foi encontrada."}

                            {filtroStatus === "confirmadas" && "Nenhuma ordem de compra confirmada foi encontrada."}

                            {filtroStatus === "todas" && "Nenhuma ordem de compra cadastrada no sistema."}
                        </p>
                    ) : (
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
                                            <td><b><p>{ordem.status}</p> </b> </td>
                                            <td >
                                                <button className={styles.ativar}
                                                    onClick={() => alternarEntrega(ordem.id, ordem.entregaConfirmada)}
                                                >
                                                    <b>CONFIRMAR </b>
                                                </button>
                                            </td>
                                            <td>
                                                <button className={styles.cancelar}
                                                    onClick={() => alternarEntrega(ordem.id)}
                                                >
                                                    <b>CANCELAR </b>
                                                </button>
                                            </td>
                                            <td >
                                                <button className={styles.baixar}
                                                    onClick={() => baixarOrdem(ordem.id)}

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

export default Historicos;

