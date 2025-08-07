import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./historicos.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function Historicos() {
    const [usuarios, setUsuarios] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [isGestor, setIsGestor] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();

    //   useEffect(() => {
    //     const token = sessionStorage.getItem("authToken");
    //     if (!token) {
    //       navigate("/");
    //     } else {
    //       const { exp } = jwtDecode(token);
    //       if (Date.now() >= exp * 1000) {
    //         sessionStorage.removeItem("authToken");
    //         navigate("/");
    //       } else {
    //         setAutenticacaoPassou(true);
    //       }
    //     }
    //   }, [navigate]);

    useEffect(() => {
        setFade(false); // inicia fade out
        const timeout = setTimeout(() => {
            setUsuarios([]);
            buscarUsuarios();
            setFade(true); // inicia fade in depois de buscar
        }, 200); // tempo de fade out antes de buscar

        return () => clearTimeout(timeout);
    }, [filtroStatus]);

    const buscarUsuarios = async () => {
        const token = sessionStorage.getItem("authToken");
        const cargoUsuario = sessionStorage.getItem("cargoUsuario");

        setIsGestor(Number(cargoUsuario) === 2);

        let url = "/usuarios/listarTodos";
        if (filtroStatus === "ativos") url = "/usuarios/listarAtivos";
        if (filtroStatus === "inativos") url = "/usuarios/listarInativos";

        try {
            const res = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(res.data);
        } catch (error) {
            Swal.fire("Erro ao carregar usuários", "", "error");
        }
    };

    //   const handleToggleStatus = async (id, ativo) => {
    //     const result = await Swal.fire({
    //       title: ativo
    //         ? "Deseja desativar este usuário?"
    //         : "Deseja ativar este usuário?",
    //       icon: "warning",
    //       showCancelButton: true,
    //       confirmButtonText: ativo ? "Desativar" : "Ativar",
    //       cancelButtonText: "Cancelar",
    //       confirmButtonColor: ativo ? "#d33" : "#28a745",
    //     });

    //     if (result.isConfirmed) {
    //       const token = sessionStorage.getItem("authToken");
    //       try {
    //         await api.patch(
    //           `/usuarios/desativarUsuario/${id}`,
    //           { ativo: !ativo },
    //           {
    //             headers: {
    //               Authorization: `Bearer ${token}`,
    //             },
    //           }
    //         );

    //         Swal.fire("Status atualizado com sucesso!", "", "success");
    //         buscarUsuarios(); // Recarrega a lista do banco
    //       } catch (error) {
    //         console.error("Erro ao atualizar status:", error);
    //         Swal.fire("Erro ao atualizar status", "", "error");
    //       }
    //     }
    //   };

    // const handleDeletarUsuario = async (id) => {
    //     const result = await Swal.fire({
    //         title: "Deseja excluir este usuário?",
    //         text: "Essa ação é irreversível!",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonText: "Excluir",
    //         cancelButtonText: "Cancelar",
    //         confirmButtonColor: "#d33",
    //     });

    //     if (result.isConfirmed) {
    //         const token = sessionStorage.getItem("authToken");
    //         try {
    //             await api.delete(`/usuarios/${id}`,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             )
    //             Swal.fire("Usuário deletado com sucesso!", "", "success");
    //             buscarUsuarios();
    //         }

    //         catch (error) {
    //             Swal.fire("Erro ao atualizar status", "", "error");
    //         }

    //     }
    // }

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
                        <option value="todos">Todos</option>
                        <option value="ativos">Ativos</option>
                        <option value="inativos">Inativos</option>
                    </select>
                    <p className={styles.qtdUsuarios}>
                        {usuarios.length} usuário(s) encontrado(s)
                    </p>

                    {usuarios.length === 0 ? (
                        <p className={styles.mensagemVazia}>
                            {filtroStatus === "ativos" && "Nenhum usuário ativo encontrado."}
                            {filtroStatus === "inativos" &&
                                "Nenhum usuário inativo encontrado."}
                            {filtroStatus === "todos" &&
                                "Nenhum usuário cadastrado no sistema."}
                        </p>
                    ) : (
                        <div className={styles.tabelaWrapper}>
                            <table className={`${styles.tabela} ${fade ? styles.fadeIn : styles.fadeOut}`}>
                               
                                <tbody>
                                    {usuarios.map((ordem) => (
                                        <tr key={ordem.id}>
                                            <td><b><h4>Ordem de Compra</h4></b> <p>ID 1</p>{ordem.numeroOrdem || ordem.ordem}</td>
                                            <td><b><h4>Dia:</h4></b> <p>12/07</p> { ordem.dia || ordem.dataCriacao}</td>
                                            <td><b><h4>Hora:</h4></b> <p>17:47</p> {ordem.hora || ordem.horaCriacao}</td>
                                            <td><b><h4>Prazo de Entrega:</h4></b> <p>17/07/2025</p> {ordem.prazoEntrega}</td>
                                            <td><b><h4>Status</h4></b> <p>Pendende</p>{ordem.status}</td>
                                            <td>
                                                <button className={styles.ativar}
                                                    onClick={() => confirmarEntrega(ordem.id)}
                                                >
                                                    Confirmar
                                                </button>
                                            </td>
                                            <td>
                                                <button className={styles.cancelar}
                                                    onClick={() => cancelarOrdem(ordem.id)}
                                                >
                                                    Cancelar
                                                </button>
                                            </td>
                                            <td >
                                                <button className={styles.baixar}
                                                    onClick={() => baixarOrdem(ordem.id)}
                                                >
                                                    Baixar
                                                </button>
                                            </td>
                                            <div><br /><br /></div>
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

