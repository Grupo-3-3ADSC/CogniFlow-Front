import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { api } from '../../provider/api.js';
import Swal from "sweetalert2";
import styles from "./tabela.module.css";

export function TabelaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [isGestor, setIsGestor] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        const cargoUsuario = sessionStorage.getItem("cargoUsuario");

        setIsGestor(Number(cargoUsuario) === 2);

        api.get("/usuarios", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setUsuarios(res.data))
            .catch(() => {
                Swal.fire("Erro ao carregar usuários", "", "error");
            });
    }, []);
    const handleToggleStatus = async (id, ativo) => {
        const result = await Swal.fire({
            title: ativo ? "Deseja desativar este usuário?" : "Deseja ativar este usuário?",
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

                setUsuarios((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, ativo: !ativo } : u))
                );

                Swal.fire("Status atualizado com sucesso!", "", "success");
            } catch (error) {
                console.error("Erro ao atualizar status:", error);
                Swal.fire("Erro ao atualizar status", "", "error");
            }
        }
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
                                    <td className={styles.statusColuna}>
                                        {usuario.ativo ? "Ativo" : "Inativo"}
                                        {isGestor && (
                                            <span
                                                className={
                                                    usuario.ativo ? styles.textDesativar : styles.textAtivar
                                                }
                                                onClick={() => handleToggleStatus(usuario.id, usuario.ativo)}
                                            >
                                                {usuario.ativo ? "Desativar" : "Ativar"}
                                            </span>
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
