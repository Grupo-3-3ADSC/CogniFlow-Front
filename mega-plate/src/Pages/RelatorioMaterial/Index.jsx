import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import Swal from "sweetalert2";
import styles from "./relatorioMaterial.module.css";
import iconBaixar from "../../assets/icon-baixar.png";
import { useNavigate } from "react-router-dom";
 import { jsPDF } from "jspdf";

export function RelatorioMaterial() {
  const [materiais, setMateriais] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const navigate = useNavigate();

  const MOCK_MODE = true;

  const listaMateriais = [
    { id: "1", material: "SAE 1020" },
    { id: "2", material: "SAE 1040" },
    { id: "3", material: "Hardox" },
    { id: "4", material: "SAE " },
    { id: "5", material: "SAE " },
    { id: "6", material: "SAE " },
    { id: "7", material: "SAE " },
    { id: "8", material: "SAE " },
    { id: "9", material: "SAE " },
    { id: "10", material: "SAE " },
    { id: "11", material: "SAE " }
  ]

  const buscarMateriais = async () => {
    try {
      if (MOCK_MODE) {
        setMateriais([
          { id: 1, material: "SAE 1020", status: "ativos" },
          { id: 2, material: "SAE 1040", status: "inativos" },
          { id: 3, material: "HARDOX", status: "ativos" },
        ]);
      } else {
        const token = sessionStorage.getItem("authToken");
        const res = await api.get("/materiais", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMateriais(res.data);
      }
    } catch (error) {
      Swal.fire("Erro ao carregar materiais", "", "error");
    }
  };




  useEffect(() => {
    buscarMateriais();
  }, []);

  // ✅ Agora filtra a lista correta (materiais) e usa a mesma variável no JSX
  const materiaisFiltrados = materiais.filter((m) =>
    (m.material ?? "").toLowerCase().includes(filtroNome.toLowerCase().trim())
  );

  const materialFiltrado = listaMateriais.filter(r => filtroMaterial === "todos" || r.tipo === filtroMaterial);

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.background}>
          <h1>RELATÓRIO DE SAÍDAS POR MATERIAIS</h1>
          <div className={styles.filtro}>
            <select value={filtroMaterial} onChange={(e) => setFiltroMateiral(e.target.value)} className={styles.selectFiltro}>
              <option value="todos">Todos os Relatórios</option>
              <option value="entradas">Relatório Geral de Entradas</option>
              <option value="saidas">Relatório Geral de Saídas</option>
              <option value="fornecedores">Relatório de Fornecedores</option>
              <option value="materiais">Relatório de Materiais</option>
            </select>
          </div>

          <input
            type="text"
            id="filtro-nome"
            placeholder="Digite o nome do material..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className={styles.inputFiltro}
          />

          <p className={styles.qtdMateriais}>
            {materiaisFiltrados.length} material(is) encontrado(s)
          </p>

          <div className={styles.tabelaWrapper}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {materiaisFiltrados.map((material) => (
                  <tr key={material.id}>
                    <td>
                      <b>ID:</b> {material.id} <br />
                      <b>Nome:</b> {material.material} <br />
                    </td>
                    <td>
                      <button className={styles.baixar}>
                        <img src={iconBaixar} alt="Baixar" />
                      </button>
                    </td>
                  </tr>
                ))}

                {materiaisFiltrados.length === 0 && (
                  <tr>
                    {/* use número em colSpan no React */}
                    <td colSpan={2} style={{ textAlign: "center", padding: 10 }}>
                      Nenhum material encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default RelatorioMaterial;
