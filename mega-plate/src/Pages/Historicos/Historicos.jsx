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

    
        

    function handleMudancaQuantidadeAtual(){
        
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
            id:"",
            pendentes:"",
            pendenciaAlterada:""
        })

        for(i = 0; i <= ordens.length; i++){
                let ordemAtual = ordens[i];

                if(ordemAtual.usuarioId == idUsuario){
                    if(ordemAtual.pendenciaAlterada == 0){
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

        api.patch(`/ordemDeCompra/${idUsuario}` , resposta, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((requisicao) => {
            //console.log(requisicao.data);
            setResposta({
                id:"",
            pendentes:"",
            pendenciaAlterada:""
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
        if (filtroStatus === "todas") return true;
        if (filtroStatus === "pendentes") return ordem.status === "Pendente"; // ajuste conforme seu status real
        if (filtroStatus === "confirmadas") return ordem.status === "Confirmada";
        return true;
    });



    return (
        <>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>Histórico de Ordem de Compra</h1>
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
                        <option value="pendentes">Pendentes</option>
                        <option value="confirmadas">Confirmadas</option>
                    </select>
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

                                <tbody>
                                    {ordensFiltradas.map((ordem) => (
                                        <tr key={ordem.id}>
                                            <td><b><h4>ORDEM DE COMPRA</h4></b> <p>ID: {ordem.id}</p></td>
                                            <td><b><h4>DIA</h4></b> <p>{formatarDataBrasileira(ordem.dataDeEmissao)}</p> </td>
                                            <td><b><h4>HORA</h4></b> <p>{formatarHora(ordem.dataDeEmissao)}</p> </td>
                                            <td><b><h4>PRAZO DE ENTREGA</h4></b> <p>{formatarDataBrasileira(ordem.prazoEntrega)}</p> </td>
                                            <td><b><h4>STATUS</h4></b> <p>{ordem.status}</p></td>
                                            <td>
                                                <button className={styles.ativar}
                                                    onClick={() => alternarEntrega(ordem.id, ordem.entregaConfirmada)}
                                                >
                                                    <b>CONFIRMAR ENTREGA</b>
                                                </button>
                                            </td>
                                            <td>
                                                <button className={styles.cancelar}
                                                    onClick={() => alternarEntrega(ordem.id)}
                                                >
                                                    <b>CANCELAR ENTREGA</b>
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

