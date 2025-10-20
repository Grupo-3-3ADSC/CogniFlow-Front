import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import {
    toastSuccess,
    toastError,
    toastInfo,
} from "../../components/toastify/ToastifyService.jsx";
import styles from "./listagemFornecedor.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function ListagemFornecedor() {
    const [fornecedores, setFornecedores] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [isGestor, setIsGestor] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [filtroNome, setFiltroNome] = useState("");
    const [filtroEmail, setFiltroEmail] = useState("");
    const [filtroCargo, setFiltroCargo] = useState("todos");
    const [fade, setFade] = useState(true);
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    // 🔐 Autenticação
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
                setAutenticacaoPassou(true); // só libera depois da autenticação
            }
        }
    }, [navigate]);

    // 🔍 Buscar usuários (só depois da autenticação)
    useEffect(() => {
        if (!autenticacaoPassou) return; // trava se ainda não autenticou

        setFade(false); // inicia fade out
        const timeout = setTimeout(() => {
            buscarFornecedores().then(() => {
                setFade(true); // inicia fade in depois da busca
            });
        }, 200);

        return () => clearTimeout(timeout);
    }, [filtroStatus, autenticacaoPassou]);

    async function buscarFornecedores() {
        const token = sessionStorage.getItem("authToken");
        const res = await api.get("/fornecedores", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    }

    useEffect(() => {
        buscarFornecedores().then((data) => setFornecedores(data));
    }, []);

    // 🔄 Ativar/Desativar usuário
    const handleToggleStatus = async (id, ativo) => {
        const result = await Swal.fire({
            title: ativo
                ? "Deseja desativar este usuário?"
                : "Deseja ativar este usuário?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: ativo ? "Desativar" : "Ativar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: ativo ? "#d33" : "#28a745",
        });

        if (result.isConfirmed) {
            const token = sessionStorage.getItem("authToken");
            try {
                await api.patch(
                    `/usuarios/desativarUsuario/${id}`,
                    { ativo: !ativo },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toastSuccess("Status atualizado com sucesso!");
                buscarUsuarios(); // Recarrega a lista do banco
            } catch (error) {
                console.error("Erro ao atualizar status:", error);
                toastError("Erro ao atualizar status");
            }
        }
    };

    // ❌ Deletar usuário
    const handleDeletarUsuario = async (id) => {
        const result = await Swal.fire({
            title: "Deseja excluir este fornecedor?",
            text: "Essa ação é irreversível!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Excluir",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });

        if (result.isConfirmed) {
            const token = sessionStorage.getItem("authToken");
            try {
                await api.delete(`/fornecedores/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                Swal.fire("Usuário deletado com sucesso!", "", "success");
                buscarUsuarios();
            } catch (error) {
                Swal.fire("Erro ao atualizar status", "", "error");
            }
        }
    };

    // 🔎 Filtros de nome, email, cargo
    const fornecedoresFiltrados = fornecedores.filter((f) =>
        f.nomeFantasia.toLowerCase().includes(filtroNome.toLowerCase().trim())
    );

    return (
        <>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>LISTAGEM DE FORNECEDORES</h1>

                    <div className={styles.filtro}>
                        <input
                            type="text"
                            id="filtro-nome"
                            placeholder="Digite o nome do fornecedor..."
                            value={filtroNome}
                            onChange={(e) => setFiltroNome(e.target.value)}
                            className={styles.inputFiltro}
                        />

                        <input
                            type="text"
                            id="filtro-email"
                            placeholder="Digite o e-mail do fornecedor..."
                            value={filtroEmail}
                            onChange={(e) => setFiltroEmail(e.target.value)}
                            className={styles.inputFiltro}
                        />
                        <select
                            id="filtro"
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className={styles.selectFiltro}
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </select>

                        <select
                            id="filtroCargo"
                            value={filtroCargo}
                            onChange={(e) => setFiltroCargo(e.target.value)}
                            className={styles.selectFiltro}
                        >
                            <option value="todos">Todos os Fornecedores</option>
                        </select>
                    </div>

                    <p className={styles.qtdUsuarios}>
                        {fornecedoresFiltrados.length} fornecedores(s) encontrado(s)
                    </p>

                    {carregando ? (
                        <p>Carregando fornecedores...</p>
                    ) : fornecedoresFiltrados.length === 0 ? (
                        <p className={styles.mensagemVazia}>
                            {filtroStatus === "ativos" && "Nenhum fornecedor ativo encontrado."}
                            {filtroStatus === "inativos" &&
                                "Nenhum usuário inativo encontrado."}
                            {filtroStatus === "todos" &&
                                "Nenhum fornecedor cadastrado no sistema."}
                        </p>
                    ) : (
                        <div className={styles.tabelaWrapper}>
                            <table
                                className={`${styles.tabela} ${fade ? styles.fadeIn : styles.fadeOut
                                    }`}
                            >
                                <thead>
                                    <tr>
                                        <th>NOME FANTASIA</th>
                                        <th>EMAIL</th>
                                        <th>CNPJ</th>
                                        <th>CONTATO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fornecedoresFiltrados.map((fornecedor, index) => (
                                        <tr key={fornecedor.id || `fornecedor-${index}`}>
                                            <td data-label="Nome">{String(fornecedor.nomeFantasia || "—")}</td>
                                            <td data-label="Email">{String(fornecedor.email || "—")}</td>
                                            <td data-label="Cnpj">{String(fornecedor.cnpj || "—")}</td>
                                            <td data-label="Contato">{String(fornecedor.telefone || "—")}</td>
                                            <td>
                                                <div className={styles.statusColuna}>


                                                    {isGestor &&
                                                        String(sessionStorage.getItem("fornecedor")) !==
                                                        String(fornecedor?.id || "") && (
                                                            <>
                                                                <button
                                                                    className={
                                                                        fornecedor?.ativo
                                                                            ? styles.textDesativar
                                                                            : styles.textAtivar
                                                                    }
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            fornecedor?.id,
                                                                            fornecedor?.ativo
                                                                        )
                                                                    }
                                                                >
                                                                    {usuario?.ativo ? "Desativar" : "Ativar"}
                                                                </button>
                                                                <button
                                                                    className={styles.textExcluir}
                                                                    onClick={() =>
                                                                        handleDeletarUsuario(fornecedor?.id)
                                                                    }
                                                                >
                                                                    Excluir
                                                                </button>
                                                            </>
                                                        )}
                                                </div>
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

export default ListagemFornecedor;
