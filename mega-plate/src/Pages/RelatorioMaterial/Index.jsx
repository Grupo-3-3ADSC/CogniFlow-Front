import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./relatorioMaterial.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


export function RelatorioMaterial() {
    const [materiais, setMaterias] = useState([]);
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const navigate = useNavigate();

    /* 
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
      }, [navigate]); */

    const buscarMateriais = async () => {
        const token = sessionStorage.getItem("authToken");

        try {
            const res = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(res.data);
        } catch (error) {
            Swal.fire("Erro ao carregar materiais", "", "error");
        }
    };

    return (
      <>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>RELATÓRIO DE SAÍDAS POR MATERIAIS</h1>
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
                </div>
            </div>
        </>
    )



}

export default RelatorioMaterial