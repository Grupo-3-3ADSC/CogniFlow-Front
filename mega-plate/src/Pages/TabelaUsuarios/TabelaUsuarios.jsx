import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import {
  toastSuccess,
  toastError,
  toastInfo,
} from "../../components/toastify/ToastifyService.jsx";
import styles from "./tabela.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function TabelaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  const [isGestor, setIsGestor] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [fade, setFade] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // Mapeamento para corrigir o problema do filtro de cargo
  const mapeamentoCargos = {
    "assistente_compras": "assistente de compras",
    "comprador_pleno": "comprador pleno", 
    "analista_compras": "analista de compras",
    "coordenador_compras": "coordenador de compras",
    "gerente_suprimentos": "gerente de suprimentos",
    "comum": "comum",
    "gestor": "gestor"
  };

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
      buscarUsuarios().then(() => {
        setFade(true); // inicia fade in depois da busca
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [filtroStatus, autenticacaoPassou]);

  const buscarUsuarios = async () => {
    const token = sessionStorage.getItem("authToken");
    const cargoUsuario = sessionStorage.getItem("cargoUsuario");

    setIsGestor(Number(cargoUsuario) === 2);

    let url = "/usuarios/listarTodos";
    if (filtroStatus === "ativos") url = "/usuarios/listarAtivos";
    if (filtroStatus === "inativos") url = "/usuarios/listarInativos";

    setCarregando(true);
    try {
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data || []);
      console.log("Usuários recebidos:", res.data);
    } catch (error) {
      Swal.fire("Erro ao carregar usuários", "", "error");
    } finally {
      setCarregando(false);
    }
  };

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
      title: "Deseja excluir este usuário?",
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
        await api.delete(`/usuarios/${id}`, {
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

  // 🔎 Filtros de nome, email, cargo - CORRIGIDO
  const usuariosFiltrados = usuarios
    .filter((usuario) =>
      usuario.nome?.toLowerCase().includes(filtroNome.toLowerCase())
    )
    .filter((usuario) =>
      usuario.email?.toLowerCase().includes(filtroEmail.toLowerCase())
    )
    .filter((usuario) => {
      if (filtroCargo === "todos") return true;
      
      // Usa o mapeamento para converter o value do select para o nome real do cargo
      const cargoParaComparar = mapeamentoCargos[filtroCargo] || filtroCargo;
      return usuario.cargo?.nome?.toLowerCase() === cargoParaComparar.toLowerCase();
    });

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.background}>
          <h1>LISTAGEM DE USUÁRIOS</h1>

          <div className={styles.filtro}>
            <input
              type="text"
              id="filtro-nome"
              placeholder="Digite o nome do usuário..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className={styles.inputFiltro}
            />

            <input
              type="text"
              id="filtro-email"
              placeholder="Digite o e-mail do usuário..."
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
              <option value="todos">Todos os Cargos</option>
              <option value="comum">Comum</option>
              <option value="gestor">Gestor</option>
              <option value="assistente_compras">Assistente de Compras</option>
              <option value="comprador_pleno">Comprador Pleno</option>
              <option value="analista_compras">Analista de Compras</option>
              <option value="coordenador_compras">Coordenador de Compras</option>
              <option value="gerente_suprimentos">Gerente de Suprimentos</option>
            </select>
          </div>

          <p className={styles.qtdUsuarios}>
            {usuariosFiltrados.length} usuário(s) encontrado(s)
          </p>

          {carregando ? (
            <p>Carregando usuários...</p>
          ) : usuariosFiltrados.length === 0 ? (
            <p className={styles.mensagemVazia}>
              {filtroStatus === "ativos" && "Nenhum usuário ativo encontrado."}
              {filtroStatus === "inativos" &&
                "Nenhum usuário inativo encontrado."}
              {filtroStatus === "todos" &&
                "Nenhum usuário cadastrado no sistema."}
            </p>
          ) : (
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
                  {usuariosFiltrados.map((usuario, index) => (
                    <tr key={usuario.id || `usuario-${index}`}>
                      <td data-label="Nome">{String(usuario.nome || "—")}</td>
                      <td data-label="Email">{String(usuario.email || "—")}</td>

                      <td data-label="Cargo">
                        {usuario.cargo?.nome || "—"}
                      </td>
                      <td data-label="Status">
                        <div className={styles.statusColuna}>
                          <span className={styles.statusTexto}>
                            {usuario?.ativo ? "Ativo" : "Inativo"}
                          </span>

                          {isGestor &&
                            String(sessionStorage.getItem("usuario")) !==
                              String(usuario?.id || "") && (
                              <>
                                <button
                                  className={
                                    usuario?.ativo
                                      ? styles.textDesativar
                                      : styles.textAtivar
                                  }
                                  onClick={() =>
                                    handleToggleStatus(
                                      usuario?.id,
                                      usuario?.ativo
                                    )
                                  }
                                >
                                  {usuario?.ativo ? "Desativar" : "Ativar"}
                                </button>
                                <button
                                  className={styles.textExcluir}
                                  onClick={() =>
                                    handleDeletarUsuario(usuario?.id)
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

export default TabelaUsuarios;