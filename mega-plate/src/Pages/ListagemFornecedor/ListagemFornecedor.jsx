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
        const cargoUsuario = sessionStorage.getItem("cargoUsuario");
        setIsGestor(Number(cargoUsuario) === 2);

        const res = await api.get("/api/fornecedores", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    }

    useEffect(() => {
        buscarFornecedores().then((data) => {
            console.log("RESPOSTA /fornecedores:", data);
            setFornecedores(data);
        });
    }, []);


    // ❌ Deletar usuário
    const handleDeletarFornecedor = async (id) => {
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
                await api.delete(`/api/fornecedores/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toastSuccess("Fornecedor deletado com sucesso!", "", "success");
                buscarFornecedores();
            } catch (error) {
                toastError("Erro ao atualizar status", "", "error");
            }
        }
    };

    // 🔎 Filtros de nome, email, cargo
    const fornecedoresFiltrados = fornecedores.filter((f) => {
        const nomeOk = f.nomeFantasia
            ?.toLowerCase()
            .includes(filtroNome.toLowerCase().trim());

        const emailOk = f.email
            ?.toLowerCase()
            .includes(filtroEmail.toLowerCase().trim());

        // mostra apenas fornecedores que batem com ambos filtros
        return nomeOk && emailOk;
    });


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
                    </div>

                    <p className={styles.qtdUsuarios}>
                        {fornecedoresFiltrados.length} fornecedores(s) encontrado(s)
                    </p>

                    {carregando ? (
                        <p>Carregando fornecedores...</p>
                    ) : fornecedoresFiltrados.length === 0 ? (
                        <p>Nenhum fornecedor encontrado.</p>
                    ) : (
                        <div className={styles.tabelaWrapper}>
                            <table
                                className={`${styles.tabela} ${fade ? styles.fadeIn : styles.fadeOut
                                    }`}
                            >
                                <thead>
                                    <tr className={styles.containerTitulos}>
                                        <th id="titulo">NOME FANTASIA</th>
                                        <th id="titulo">EMAIL</th>
                                        <th id="titulo">CNPJ</th>
                                        <th id="titulo">I.E</th>
                                        <th id="titulo">CARGO</th>
                                        <th id="titulo">RESPONSÁVEL</th>
                                        <th id="titulo">CONTATO</th>
                                        <th id="titulo">EXCLUIR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fornecedoresFiltrados.map((fornecedor, index) => (
                                        <tr key={fornecedor.fornecedorId || `fornecedor-${index}`}>
                                            <td data-label="Nome">{String(fornecedor.nomeFantasia || "—")}</td>
                                            <td data-label="Email">{String(fornecedor.email || "—")}</td>
                                            <td data-label="Cnpj">{String(fornecedor.cnpj || "—")}</td>
                                            <td data-label="I.e">{String(fornecedor.ie || "—")}</td>
                                            <td data-label="Cargo">{String(fornecedor.cargo || "—")}</td>
                                            <td data-label="Responsável">{String(fornecedor.responsavel || "—")}</td>
                                            <td data-label="Contato">{String(fornecedor.telefone || "—")}</td>
                                            <td>
                                                <div className={styles.statusColuna}>
                                                    {isGestor &&
                                                        String(sessionStorage.getItem("fornecedor")) !==
                                                        String(fornecedor?.fornecedorId || "") && (
                                                            <>
                                                                <button
                                                                    className={styles.textExcluir}
                                                                    onClick={() =>
                                                                        handleDeletarFornecedor(fornecedor?.fornecedorId)
                                                                    }
                                                                >
                                                                    EXCLUIR
                                                                </button>
                                                            </>
                                                        )
                                                    }
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
