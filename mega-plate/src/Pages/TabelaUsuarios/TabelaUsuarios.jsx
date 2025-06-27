import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { api } from '../../provider/api.js';
import Swal from "sweetalert2";
import styles from "./tabela.module.css";
import { FaUserSlash, FaUserCheck } from "react-icons/fa";

export function TabelaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [isGestor, setIsGestor] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("authToken");

        // Pegando o usuário do sessionStorage (deve ser salvo no login!)
        const usuarioData = JSON.parse(sessionStorage.getItem("usuarioData") || "{}");
        setIsGestor(Number(usuarioData?.cargo?.id) === 2);

        api.get("/usuarios", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsuarios(res.data))
        .catch(() => {
            Swal.fire("Erro ao carregar usuários", "", "error");
        });
    }, []);

    const handleToggleStatus = (id, ativo) => {
        const token = sessionStorage.getItem("authToken");

        api.patch(`/usuarios/${id}/status`, { ativo: !ativo }, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
            setUsuarios((prev) =>
                prev.map((u) =>
                    u.id === id ? { ...u, ativo: !ativo } : u
                )
            );
            Swal.fire("Status atualizado com sucesso!", "", "success");
        })
        .catch(() => Swal.fire("Erro ao atualizar status", "", "error"));
    };

    return (
        <>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.background}>
                    <h2>Lista de Usuários</h2>
                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Cargo</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.nome}</td>
                                    <td>{usuario.email}</td>
                                    <td>{Number(usuario.cargo?.id) === 2 ? "Gestor" : "Comum"}</td>
                                    <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {usuario.ativo ? "Ativo" : "Inativo"}
                                        {isGestor && (
                                            <button
                                                onClick={() => handleToggleStatus(usuario.id, usuario.ativo)}
                                                className={styles.toggleBtn}
                                                title={usuario.ativo ? "Desativar usuário" : "Ativar usuário"}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    marginLeft: 6,
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {usuario.ativo ? (
                                                    <FaUserSlash color="#d9534f" size={18} />
                                                ) : (
                                                    <FaUserCheck color="#5cb85c" size={18} />
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default TabelaUsuarios;
