import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./historicos.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import iconbaixar from "../../assets/icon-baixar.png";

export function HistoricoTransferencia() {
    const [transferencias, setTransferencias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [isGestor, setIsGestor] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todos");
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
            Swal.fire("Erro ao carregar transferencias", "", "error");
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
                        {transferencias.length} transferencia(s) encontrada(s)
                    </p>

                    {transferenciasFiltradas.length === 0 ? (
                        <p className={styles.mensagemVazia}>
                            {filtroStatus === "internas" && "Nenhuma transferencia interna foi encontrada."}

                            {filtroStatus === "externas" && "Nenhuma transferencia externa foi encontrada."}

                            {filtroStatus === "todas" && "Nenhuma transferencia cadastrada no sistema."}
                        </p>
                    ) : (
                        <div className={styles.tabelaWrapper}>
                            <table className={`${styles.tabela} ${fade ? styles.fadeIn : styles.fadeOut}`}>
                                <thead>
                                    <tr>
                                        <th>MATERIAL</th>
                                        <th>C1</th>
                                        <th>C2</th>
                                        <th>C3</th>
                                        <th>C4</th>
                                    </tr>
                                </thead>
                                    <tbody>
                                        {transferenciasFiltradas.map((transferencias) => (
                                            <tr key={transferencias.id}>
                                                <td><b><h4>TRANSFERÊNCIA</h4></b> <p>ID: {transferencias.id}</p></td>
                                                <td><b><h4>DIA</h4></b> <p>{formatarDataBrasileira(transferencias.ultimaMovimentacao)}</p> </td>
                                                <td><b><h4>HORA</h4></b> <p>{formatarHora(transferencias.ultimaMovimentacao)}</p> </td>
                                                <td><b><h4>TIPO</h4></b> <p>{transferencias.externa || transferencias.interna}</p> </td>
                                                <td><b><h4>MATERIAL</h4></b> <p>{transferencias.tipoMaterial}</p></td>
                                                <td >
                                                    <button className={styles.baixarRelatorio}
                                                        onClick={() => baixarOrdem(transferencias.id)}

                                                    >
                                                        <b> BAIXAR RELATÓRIO </b>
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