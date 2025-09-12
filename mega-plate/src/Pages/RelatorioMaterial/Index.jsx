import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar.jsx";
import { api } from "../../provider/api.js";
import {
  toastSuccess,
  toastError,
  toastInfo
} from "../../components/toastify/ToastifyService.jsx";
import styles from "./relatorioMaterial.module.css";
import setaImg from "../../assets/seta.png";
import setaRightImg from "../../assets/setaRight.png";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoMegaPlate from "../../assets/logo-megaplate.png";
import { jwtDecode } from "jwt-decode";

function gerarListaAnos(anoInicial) {
  const anoAtual = new Date().getFullYear();
  const anos = [];
  for (let ano = anoAtual; ano >= anoInicial; ano--) {
    anos.push(ano);
  }
  return anos;
}

// ... (imports e funções auxiliares iguais)

export function RelatorioMaterial() {
  const [materiais, setMateriais] = useState([]);
  const [filtroMaterial, setFiltroMaterial] = useState("todos");
  const [filtroNome, setFiltroNome] = useState("");
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  const todosAnos = gerarListaAnos(2018);
  const [inicio, setInicio] = useState(0);
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );
  const navigate = useNavigate();
  const anosVisiveis = todosAnos.slice(inicio, inicio + 5);

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
  }, [navigate]);

  const avancarAno = () => {
    if (inicio + 5 < todosAnos.length) setInicio(inicio + 1);
  };
  const voltarAno = () => {
    if (inicio > 0) setInicio(inicio - 1);
  };

  const buscarMateriais = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await api.get("/estoque", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const adaptados = (res.data || []).map((m) => ({
        id: m.id,
        material: m.tipoMaterial ?? "Não informado",
        quantidade: m.quantidadeAtual ?? 0,
        rastreabilidade: m.rastreabilidade ?? "-",
      }));

      setMateriais(adaptados);
    } catch (error) {
      console.error(error);
      toastError("Erro ao carregar materiais");
    }
  };

  const buscarMovimentacoes = async (material) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const [entradasRes, saidasRes] = await Promise.all([
        api.get(
          `/ordemDeCompra/material/${material.id}?ano=${anoSelecionado}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        api.get(
          `/transferencias/material/${material.material}?ano=${anoSelecionado}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      return {
        ordens: entradasRes.data || [],
        transferencias: saidasRes.data || [],
      };
    } catch (err) {
      console.error(
        "Endpoints específicos falharam, tentando fallback:",
        err.response?.status || err
      );

      try {
        const ordensRes = await api.get("/ordemDeCompra", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });
        const transferenciasRes = await api.get("/transferencias", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });

        const materialSelecionado = materiais.find(
          (m) => m.id === material.id
        )?.material;

        const filtrarPorAno = (data) =>
          data ? new Date(data).getFullYear() === anoSelecionado : false;

        const ordens = (ordensRes.data || []).filter(
          (o) =>
            o.tipoMaterial === materialSelecionado &&
            filtrarPorAno(o.dataDeEmissao)
        );

        const transferencias = (transferenciasRes.data || []).filter(
          (t) =>
            t.tipoMaterial === materialSelecionado &&
            filtrarPorAno(t.ultimaMovimentacao)
        );

        return { ordens, transferencias };
      } catch (err2) {
        console.error("Erro no fallback:", err2);
        toastError("Erro ao buscar movimentações");
        return { ordens: [], transferencias: [] };
      }
    }
  };

  useEffect(() => {
    buscarMateriais();
  }, []);

  const materiaisFiltrados = materiais.filter((m) => {
    const nomeMatch = (m.material ?? "")
      .toLowerCase()
      .includes(filtroNome.toLowerCase().trim());
    const tipoMatch =
      filtroMaterial === "todos" || m.material === filtroMaterial;
    return nomeMatch && tipoMatch;
  });

  const baixarExcelMaterial = async (
    material,
    ordens = [],
    transferencias = []
  ) => {
    const workbook = new ExcelJS.Workbook();

    // --- Entradas ---
    const sheetEntradas = workbook.addWorksheet("Entradas");
    const response = await fetch(logoMegaPlate);
    const blob = await response.blob();
    const imageBuffer = await blob.arrayBuffer();
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });

    // Entradas
    sheetEntradas.mergeCells("A1:G4");
    const faixaEntrada = sheetEntradas.getCell("A1");
    faixaEntrada.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF05314C" }, // azul
    };
    sheetEntradas.addImage(imageId, {
      tl: { col: 1.2, row: 0.2 },
      ext: { width: 120, height: 60 },
    });

    sheetEntradas.mergeCells("A6:G6");
    const titulo = sheetEntradas.getCell("A6");
    titulo.value = `Entradas do material: ${material ?? "Não informado"}`;
    titulo.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titulo.alignment = { horizontal: "center" };
    titulo.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF05314C" },
    };

    const header = [
      "Data",
      "Fornecedor",
      "Quantidade",
      "Preço Unitário",
      "Preço Total do Pedido",
      "IPI",
      "Valor Total",
    ];
    const headerRow = sheetEntradas.addRow(header);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF05314C" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // --- Entradas ---
    (ordens || []).forEach((ordem, index) => {
      const row = sheetEntradas.addRow([
        ordem.dataDeEmissao ? new Date(ordem.dataDeEmissao) : "",
        ordem.nomeFornecedor || "Desconhecido",
        ordem.quantidade || 0,
        ordem.valorUnitario || 0,
        (ordem.valorUnitario || 0) * (ordem.quantidade || 0),
        (ordem.ipi || 0) / 100,
        (ordem.valorUnitario || 0) *
          (ordem.quantidade || 0) *
          (1 + (ordem.ipi || 0) / 100),
      ]);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (colNumber === 1) cell.numFmt = "dd/mm/yyyy";
        if ([4, 5, 7].includes(colNumber)) cell.numFmt = '"R$"#,##0.00';
        if (colNumber === 6) cell.numFmt = "0.00%";
      });

      // zebra stripes
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEFEFEF" },
          };
        });
      }
    });

    // ajuste de largura só aqui no final
    sheetEntradas.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      col.width = maxLength + 5;
    });

    // --- Transferências ---
    const sheetSaidas = workbook.addWorksheet("Transferências");
    sheetSaidas.mergeCells("A1:C4");
    const faixaSaida = sheetSaidas.getCell("A1");
    faixaSaida.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF05314C" }, // azul
    };
    sheetSaidas.addImage(imageId, {
      tl: { col: 1.2, row: 0.2 },
      ext: { width: 120, height: 60 },
    });

    sheetSaidas.mergeCells("A6:C6");
    const tituloSaida = sheetSaidas.getCell("A6");
    tituloSaida.value = `Saídas do material: ${material ?? "Não informado"}`;
    tituloSaida.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    tituloSaida.alignment = { horizontal: "center", vertical: "middle" };
    tituloSaida.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF05314C" }, // azul escuro
    };

    const headerSaida = sheetSaidas.addRow(["Data", "Quantidade", "Destino"]);
    headerSaida.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB22222" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    function formatarDataBrasileira(dataISO) {
      if (!dataISO) return "N/A";

      // Pega só a parte da data, ignorando a hora
      const [ano, mes, dia] = dataISO.split("T")[0].split("-");

      return `${dia}/${mes}/${ano}`;
    }

    (transferencias || []).forEach((t, index) => {
      const row = sheetSaidas.addRow([
        formatarDataBrasileira(t.ultimaMovimentacao),
        t.quantidadeTransferida,
        t.setor,
      ]);

      // zebra stripes
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEFEFEF" },
          };
        });
      }
    });

    // ajuste de largura no final
    sheetSaidas.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      col.width = maxLength + 5;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `Movimentacoes_${material ?? "material"}_${anoSelecionado}.xlsx`
    );
  };

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.background}>
          <div className={styles.header}>
            <img
              src={setaImg}
              alt="Voltar"
              className={styles.seta}
              onClick={() => navigate("/relatorios")}
            />
            <h1>
              RELATÓRIO DE MOVIMENTAÇÕES{" "}
              {anoSelecionado ? `- ${anoSelecionado}` : ""}
            </h1>
          </div>

          <div className={styles.filtro}>
            <select
              value={filtroMaterial}
              onChange={(e) => setFiltroMaterial(e.target.value)}
              className={styles.selectFiltro}
            >
              <option value="todos">Todos os Materiais</option>
              {(materiais || []).map((m) => (
                <option key={m.id} value={m.material}>
                  {m.material}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Digite o nome do material..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className={styles.inputFiltro}
            />

            <div className={styles.filtroAno}>
              <div className={styles.anoContent}>
                <img
                  src={setaImg}
                  alt="seta esquerda"
                  className={styles.setaAno}
                  onClick={voltarAno}
                />
                {anosVisiveis.map((ano) => (
                  <div
                    key={ano}
                    className={`${styles.ano} ${
                      anoSelecionado === ano ? styles.ativo : ""
                    }`}
                    onClick={() => setAnoSelecionado(ano)}
                  >
                    {ano}
                  </div>
                ))}
                <img
                  src={setaRightImg}
                  alt="seta direita"
                  className={styles.setaAno}
                  onClick={avancarAno}
                />
              </div>
            </div>
          </div>

          <p className={styles.qtdMateriais}>
            {materiaisFiltrados.length} material(is) encontrado(s)
          </p>

          <div className={styles.gridMateriais}>
            {(materiaisFiltrados || []).map((material) => (
              <div key={material.id} className={styles.cardMaterial}>
                <div className={styles.info}>
                  <p>
                    <b>Material</b>
                  </p>
                  <p>
                    #{material.id} - {material.material ?? "Não informado"}
                  </p>
                </div>
                <button
                  className={styles.btnBaixar}
                  onClick={async () => {
                    if (!anoSelecionado)
                      return toastError(
                        "Selecione um ano antes de baixar o relatório."
                      );

                    const { ordens, transferencias } =
                      await buscarMovimentacoes(material);

                    if (
                      (!ordens || ordens.length === 0) &&
                      (!transferencias || transferencias.length === 0)
                    ) {
                      toastInfo(
                        "Nenhuma movimentação encontrada para este material neste ano."
                      );
                      return; // para a execução
                    }

                    await baixarExcelMaterial(
                      material.material,
                      ordens,
                      transferencias
                    );
                    toastSuccess("Relatório gerado com sucesso!");
                  }}
                >
                  Baixar Relatório
                </button>
              </div>
            ))}

            {materiaisFiltrados.length === 0 && (
              <p className={styles.mensagemVazia}>
                Nenhum material encontrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default RelatorioMaterial;
