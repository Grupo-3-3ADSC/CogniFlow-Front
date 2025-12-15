import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import {
  toastError,
  toastSuccess,
} from "../../components/toastify/ToastifyService";
import styles from "./historicos.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import iconbaixar from "../../assets/icon-baixar.png";
import baixarOrdemDeCompraPDF from "../../tools/baixarOrdemDeCompraPDF.jsx";

export function Historicos() {
  const [ordens, setOrdens] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  const [isGestor, setIsGestor] = useState(false);
  const [filtroId, setFiltroId] = useState("");
  const [filtroDia, setFiltroDia] = useState("");
  const [filtroPrazo, setFiltroPrazo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPendentes, setFiltroPendentes] = useState("todos");
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  const [ordensPaginadas, setOrdensPaginadas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1); // MUDANÇA: Começa em 1
  const [paginasTotais, setPaginasTotais] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false); // NOVO: controle de loading

  const ordensPorPagina = 6;

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const cargo = parseInt(sessionStorage.getItem("cargoUsuario"), 10);
    if (!token) {
      navigate("/");
    } else if (cargo !== 2) {
      Swal.fire({
        title: "Acesso Negado",
        text: "Você não tem permissão para acessar esta página.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      navigate("/material");
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
    if (autenticacaoPassou) {
      setFade(false);
      const timeout = setTimeout(() => {
        getOrdensPaginadas();
        setFade(true);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [filtroPendentes, paginaAtual, autenticacaoPassou]);

  // REMOVIDA: buscarOrdensDeCompra() - não é mais necessária

  function getOrdensPaginadas() {
    const token = sessionStorage.getItem("authToken"); // ADICIONADO: token

    setLoading(true); // NOVO
    const paginaInt = Number(paginaAtual) || 1; // 1-based
    api
      .get(
        `/ordemDeCompra/paginados?pagina=${paginaInt}&tamanho=${ordensPorPagina}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        const {
          data,
          paginasTotais,
          totalItems,
          paginaAtual,
          hasNext,
          hasPrevious,
        } = response.data;

        console.log("Ordens recebidas:", data.length);
        console.log("Total de itens:", totalItems);

        setOrdensPaginadas(data);
        setOrdens(data); // MUDANÇA: atualiza ordens também
        setPaginasTotais(paginasTotais);
        setTotalItems(totalItems);
        setPaginaAtual(paginaAtual);
        setHasNext(hasNext);
        setHasPrevious(hasPrevious);
        setLoading(false); // NOVO
      })
      .catch((err) => {
        console.error("Erro ao buscar ordens paginadas:", err);
        console.error("Detalhes do erro:", err.response?.data);
        toastError("Erro ao carregar ordens de compra");
        setLoading(false); // NOVO
      });
  }

  function formatarDataBrasileira(dataISO) {
    if (!dataISO) return "N/A";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const formatarHora = (isoString) => {
    const data = new Date(isoString);
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const confirmarEntrega = async (id) => {
    const token = sessionStorage.getItem("authToken");
    const result = await Swal.fire({
      title: "Deseja confirmar esta entrega?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Não",
      confirmButtonColor: "#28a745",
    });

    if (result.isConfirmed) {
      const ordemAtual = ordensPaginadas.find((ordem) => ordem.id === id);

      if (!ordemAtual) {
        toastError("Ordem não encontrada");
        return;
      }

      const resposta = {
        id: parseInt(ordemAtual.id),
        quantidade: ordemAtual.quantidade,
      };

      api
        .patch(`/ordemDeCompra/${id}`, resposta, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(() => {
          Swal.fire({
            title: "Sucesso na entrega da ordem de compra!",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setTimeout(() => {
            getOrdensPaginadas(); // MUDANÇA: recarrega dados sem refresh
          }, 2000);
        })
        .catch((err) => {
          console.error("Erro na mudança de quantidade atual:", err);
          Swal.fire(
            "Erro ao confirmar entrega da ordem de compra",
            "",
            "error"
          );
        });
    }
  };

  const cancelarEntrega = async (id) => {
    const token = sessionStorage.getItem("authToken");
    const result = await Swal.fire({
      title: "Deseja cancelar esta entrega?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancelar",
      cancelButtonText: "Não",
      confirmButtonColor: "#ff0000",
    });

    if (result.isConfirmed) {
      const ordemAtual = ordensPaginadas.find((ordem) => ordem.id === id);

      if (!ordemAtual) {
        toastError("Ordem não encontrada");
        return;
      }

      const resposta = {
        id: parseInt(ordemAtual.id),
        quantidade: ordemAtual.quantidade,
      };

      api
        .patch(`/ordemDeCompra/${id}`, resposta, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then(() => {
          Swal.fire({
            title: "Sucesso no cancelamento da ordem de compra!",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setTimeout(() => {
            getOrdensPaginadas(); // MUDANÇA: recarrega dados sem refresh
          }, 1700);
        })
        .catch((err) => {
          console.error("Erro na mudança de quantidade atual:", err);
          Swal.fire(
            "Erro ao confirmar cancelamento da ordem de compra",
            "",
            "error"
          );
        });
    }
  };

  const ordensFiltradas = ordensPaginadas.filter((ordem) => {
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

    const matchPendentes =
      filtroPendentes && filtroPendentes !== "todos"
        ? (ordem?.pendenciaAlterada ? "entregue" : "pendente") ===
          filtroPendentes.toLowerCase()
        : true;

    return matchId && matchDia && matchPrazo && matchPendentes;
  });

  function gerarPaginas() {
    const paginas = [];
    const maxPaginasVisiveis = 3;

    let paginaInicio = Math.max(
      1,
      paginaAtual - Math.floor(maxPaginasVisiveis / 2)
    ); // MUDANÇA: começa em 1
    let paginaFim = Math.min(
      paginasTotais,
      paginaInicio + maxPaginasVisiveis - 1
    ); // MUDANÇA: usa paginasTotais direto

    if (paginaFim - paginaInicio < maxPaginasVisiveis - 1) {
      paginaInicio = Math.max(1, paginaFim - maxPaginasVisiveis + 1); // MUDANÇA: começa em 1
    }

    if (paginaInicio > 1) {
      paginas.push(
        <div
          key="prev"
          className={`${styles.circle} ${styles.circleSmall}`}
          onClick={() => {
            const novaPagina = Math.max(1, paginaInicio - maxPaginasVisiveis);
            setPaginaAtual(novaPagina + Math.floor(maxPaginasVisiveis / 2));
          }}
        >
          {"<"}
        </div>
      );
    }

    for (let i = paginaInicio; i <= paginaFim; i++) {
      paginas.push(
        <div
          key={i}
          className={`${styles.circle} ${styles.circleSmall} ${
            paginaAtual === i ? styles.active : ""
          }`}
          onClick={() => setPaginaAtual(i)}
        >
          {i}
        </div>
      );
    }

    if (paginaFim < paginasTotais) {
      paginas.push(
        <div
          key="next"
          className={`${styles.circle} ${styles.circleSmall}`}
          onClick={() => {
            const novaPagina = Math.min(paginasTotais, paginaFim + 1);
            setPaginaAtual(novaPagina);
          }}
        >
          {">"}
        </div>
      );
    }

    return paginas;
  }

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
            <label htmlFor="">Data de Emissão</label>
            <input
              type="date"
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
              className={styles.inputFiltro}
            />
            <label htmlFor="">Prazo</label>
            <input
              type="date"
              placeholder="Filtrar por data de prazo"
              value={filtroPrazo}
              onChange={(e) => setFiltroPrazo(e.target.value)}
              className={styles.inputFiltro}
            />
            <select
              value={filtroPendentes}
              onChange={(e) => setFiltroPendentes(e.target.value)}
              className={styles.inputFiltro}
            >
              <option value="todos">Filtrar por status</option>
              <option value="pendente">Pendente</option>
              <option value="entregue">Entregue</option>
            </select>
          </div>
          <p className={styles.qtdUsuarios}>
            {totalItems} ordem(s) de compra encontrada(s)
          </p>
          <div className={styles.tabelaWrapper}>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <table
                className={`${styles.tabela} ${
                  fade ? styles.fadeIn : styles.fadeOut
                }`}
              >
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
                  {ordensFiltradas.length > 0 ? (
                    ordensFiltradas.map((ordem) => (
                      <tr className={styles.containerDados} key={ordem.id}>
                        <td>
                          <b>
                            <p>ID: {ordem.id}</p>
                          </b>
                        </td>
                        <td>
                          <b>
                            <p>{formatarDataBrasileira(ordem.dataDeEmissao)}</p>
                          </b>
                        </td>
                        <td>
                          <b>
                            <p>{formatarHora(ordem.dataDeEmissao)}</p>
                          </b>
                        </td>
                        <td>
                          <b>
                            <p>{formatarDataBrasileira(ordem.prazoEntrega)}</p>
                          </b>
                        </td>
                        <td>
                          <b>
                            <p>
                              {ordem.pendenciaAlterada
                                ? "Entregue"
                                : "Pendente"}
                            </p>
                          </b>
                        </td>
                        <td>
                          <button
                            className={styles.ativar}
                            onClick={() => confirmarEntrega(ordem.id)}
                            disabled={ordem.pendenciaAlterada === true}
                          >
                            <b>CONFIRMAR</b>
                          </button>
                        </td>
                        <td>
                          <button
                            className={styles.cancelar}
                            onClick={() => cancelarEntrega(ordem.id)}
                            disabled={ordem.pendenciaAlterada === false}
                          >
                            <b>CANCELAR</b>
                          </button>
                        </td>
                        <td>
                          <button
                            className={styles.baixar}
                            onClick={() => baixarOrdemDeCompraPDF(ordem.id)}
                          >
                            <img src={iconbaixar} alt="Baixar" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Nenhuma ordem encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className={styles.backgroundPages}>{gerarPaginas()}</div>
      </div>
    </>
  );
}
export default Historicos;
