import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./tabela.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';


export function TabelaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [isGestor, setIsGestor] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();

useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            const { exp } = jwtDecode(token)
            if (Date.now() >= exp * 1000) {
                sessionStorage.removeItem('authToken');
                navigate('/');
            } else {
                setAutenticacaoPassou(true);
            }
        }
    }, [navigate]);


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

        Swal.fire("Status atualizado com sucesso!", "", "success");
        buscarUsuarios(); // Recarrega a lista do banco
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        Swal.fire("Erro ao atualizar status", "", "error");
      }
    }
  };

  return (
    <>
      <NavBar/>
      <div className={styles.container}>
        <div className={styles.background}>
          <h2>Lista de Usuários</h2>
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
          <p>{usuarios.length} usuário(s) encontrado(s)</p>

          <div className={styles.tabelaWrapper}>
            <table
              className={`${styles.tabela} ${
                fade ? styles.fadeIn : styles.fadeOut
              }`}
            >
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
                    <td data-label="Nome">{usuario.nome}</td>
                    <td data-label="Email">{usuario.email}</td>
                    <td data-label="Cargo">
                      {Number(usuario.cargo?.id) === 2 ? "Gestor" : "Comum"}
                    </td>
                    <td data-label="Status">
                      <div className={styles.statusColuna}>
                        <span className={styles.statusTexto}>
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                        {isGestor && (
                          <button
                            className={
                              usuario.ativo
                                ? styles.textDesativar
                                : styles.textAtivar
                            }
                            onClick={() =>
                              handleToggleStatus(usuario.id, usuario.ativo)
                            }
                          >
                            {usuario.ativo ? "Desativar" : "Ativar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default TabelaUsuarios;
