import style from "./ordemDeCompra.module.css";
import progressoImg from "../../assets/progressoOrdemDeCompra.png";
import progressoConcluido from "../../assets/progresso1Concluido.png";
import progresso2Concluido from "../../assets/progresso2Concluido.png";
import progresso3Concluido from "../../assets/progresso3Concluido.png";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api";
import { jwtDecode } from "jwt-decode";
import NavBar from "../../components/NavBar";
import {
  toastError,
  toastSuccess,
} from "../../components/toastify/ToastifyService";

export function OrdemDeCompra() {
  const [listaFornecedores, setListaFornecedores] = useState([]);
  const [listaMateriais, setListaMateriais] = useState([]);
  const [ordemDeCompra, setOrdemDeCompra] = useState([]);
  const [materiaisSelecionados, setMateriaisSelecionados] = useState([]);
  const [progresso, setProgresso] = useState(1);
  const [valoresInput, setValoresInput] = useState({});
  const [errosValidacao, setErrosValidacao] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState("");
  const [quantidadeMaterial, setQuantidadeMaterial] = useState("");
  const [modalVerMaisAberto, setModalVerMaisAberto] = useState(false);
const [materialVerMais, setMaterialVerMais] = useState(null);

  const navigate = useNavigate();
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  // API
  const getFornecedores = useCallback(() => {
    api
      .get("/fornecedores")
      .then((res) => setListaFornecedores(res.data))
      .catch(() => toastError("Erro ao buscar fornecedores"));
  }, []);

  const getMateriaPrima = useCallback(() => {
    api
      .get("/estoque")
      .then((res) => setListaMateriais(res.data))
      .catch((err) => console.error("Erro ao buscar estoque", err));
  }, []);

  const getUsuarioIdDoToken = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) navigate("/");
    else {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        sessionStorage.removeItem("authToken");
        navigate("/");
      } else setAutenticacaoPassou(true);
    }
  }, [navigate]);

  useEffect(() => {
    getFornecedores();
    getMateriaPrima();
  }, [getFornecedores, getMateriaPrima]);

  // Formatação
  const formatarPagamento = (valor) => {
    const nums = valor.replace(/\D/g, "");
    if (!nums) return "";
    if (nums.length <= 2) return `${nums} dias`;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)} dias`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)} dias`;
  };

  const formatarValorMonetario = (valor) => {
    const nums = valor.replace(/\D/g, "");
    if (!nums) return "";
    if (nums.length === 1) return `0,0${nums}`;
    if (nums.length === 2) return `0,${nums}`;
    const inteiros = nums.slice(0, -2).replace(/^0+/, "") || "0";
    const decimais = nums.slice(-2);
    return `${inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimais}`;
  };

  const formatarRastreio = (valor) =>
    valor
      .toUpperCase()
      .replace(/[^A-Z0-9\-\/]/g, "")
      .substring(0, 20);

  const formatarQuantidade = (valor) => valor.replace(/\D/g, "");

  const validarCamposValor = (valoresInput) => {
    const valorKg = valoresInput["Valor por Kg"];
    const valorPeca = valoresInput["Valor por Peça"];
    if (!valorKg && !valorPeca)
      return {
        "Valor por Kg": "Preencha o valor por Kg OU o valor por peça",
        "Valor por Peça": "Preencha o valor por Kg OU o valor por peça",
      };
    return {};
  };

  // Etapas
  const etapas = useMemo(
    () => ({
      1: {
        inputs: [
          {
            id: "fornecedor",
            titulo: "Fornecedor",
            tipo: "select",
            options: listaFornecedores,
            optionLabel: "nomeFantasia",
            optionValue: "fornecedorId",
            required: true,
            placeholder: "Selecione o fornecedor",
          },
          {
            id: "prazo",
            titulo: "Prazo de entrega",
            tipo: "date",
            required: true,
            placeholder: "Data de entrega",
          },
          {
            id: "pagamento",
            titulo: "Cond. Pagamento",
            tipo: "text",
            required: true,
            placeholder: "30 dias ou 30/60 dias",
            formatador: formatarPagamento,
          },
        ],
      },
      2: {
        inputs: [
          {
            id: "material",
            titulo: "Material",
            tipo: "select",
            options: listaMateriais,
            optionLabel: "tipoMaterial",
            optionValue: "id",
            required: true,
          },
          {
            id: "descricao",
            titulo: "Descrição",
            tipo: "text",
            required: true,
          },
          {
            id: "quantidade",
            titulo: "Quantidade",
            tipo: "text",
            required: true,
          },
          {
            id: "rastreio",
            titulo: "Rastreabilidade",
            tipo: "text",
            required: true,
          },
          { id: "valorKg", titulo: "Valor por Kg", tipo: "text" },
          { id: "valorPeca", titulo: "Valor por Peça", tipo: "text" },
          {
            id: "valorUnit",
            titulo: "Valor Unitário",
            tipo: "text",
            required: true,
          },
          { id: "total", titulo: "Total", tipo: "text", disabled: true },
        ],
      },
    }),
    [listaFornecedores, listaMateriais]
  );

  const handleInputChange = useCallback(
    (titulo, valor, isSelect = false, formatador = null) => {
      let valorFormatado = valor;
      if (formatador && !isSelect) valorFormatado = formatador(valor);

      setValoresInput((prev) => {
        const newState = {
          ...prev,
          [titulo]: valorFormatado,
          ...(isSelect && { [titulo + "Id"]: valor }),
        };

        // Total automático
        if (titulo === "Valor Unitário" || titulo === "Quantidade") {
          const valorUnit =
            parseFloat((newState["Valor Unitário"] || "0").replace(",", ".")) ||
            0;
          const quantidade = parseInt(newState["Quantidade"] || "0") || 0;
          newState.Total =
            quantidade > 0 && valorUnit > 0
              ? formatarValorMonetario(
                  String(Math.round(valorUnit * quantidade * 100) / 100)
                )
              : "0,00";
        }

        return newState;
      });
    },
    []
  );

  // Modal
  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    setMaterialSelecionado("");
    setQuantidadeMaterial("");
    setValoresInput((prev) => ({
      ...prev,
      Descrição: "",
      Rastreabilidade: "",
      "Valor Unitário": "",
      "Valor por Kg": "",
      "Valor por Peça": "",
      Total: "0,00",
    }));
  };

  const abrirModalVerMais = (mat) => {
  setMaterialVerMais(mat);
  setModalVerMaisAberto(true);
};

const fecharModalVerMais = () => {
  setMaterialVerMais(null);
  setModalVerMaisAberto(false);
};


  useEffect(() => {
    const valorUnit =
      parseFloat((valoresInput["Valor Unitário"] || "0").replace(",", ".")) ||
      0;
    const quantidade = parseInt(quantidadeMaterial || "0") || 0;

    const total =
      quantidade > 0 && valorUnit > 0
        ? (Math.round(valorUnit * quantidade * 100) / 100)
            .toFixed(2)
            .replace(".", ",")
        : "0,00";

    setValoresInput((prev) => ({ ...prev, Total: total }));
  }, [valoresInput["Valor Unitário"], quantidadeMaterial]);

  const adicionarMaterial = () => {
    if (!materialSelecionado || !quantidadeMaterial) {
      toastError("Selecione material e quantidade");
      return;
    }

    const mat = listaMateriais.find(
      (m) => m.id === Number(materialSelecionado)
    );

    if (materiaisSelecionados.some((m) => m.id === mat.id)) {
      toastError("Este material já foi adicionado");
      return;
    }

    setMateriaisSelecionados((prev) => [
      ...prev,
      {
        ...mat,
        Quantidade: quantidadeMaterial,
        "Valor Unitário": valoresInput["Valor Unitário"] || "0,00",
        "Valor por Kg": valoresInput["Valor por Kg"] || "0,00",
        "Valor por Peça": valoresInput["Valor por Peça"] || "0,00",
        Total: valoresInput.Total || "0,00",
        Descrição: valoresInput.Descrição || "",
        Rastreabilidade: valoresInput.Rastreabilidade || "",
      },
    ]);
    fecharModal();
  };

  // Finalizar ordem
  const finalizarOrdemDeCompra = useCallback(() => {
    const dadosApi = {
      usuarioId: getUsuarioIdDoToken(),
      fornecedorId: Number(valoresInput["FornecedorId"]),
      prazoEntrega: valoresInput["Prazo de entrega"],
      condPagamento: valoresInput["Cond. Pagamento"],
      materiais: materiaisSelecionados.map((mat) => ({
        estoqueId: mat.id,
        valorKg: parseFloat(mat["Valor por Kg"]?.replace(",", ".") || 0),
        valorPeca: parseFloat(mat["Valor por Peça"]?.replace(",", ".") || 0),
        descricaoMaterial: mat.Descrição,
        rastreabilidade: mat.Rastreabilidade,
        quantidade: parseFloat(mat.Quantidade || 1),
        valorUnitario: parseFloat(
          mat["Valor Unitário"]?.replace(",", ".") || 0
        ),
      })),
    };

    api
      .post("/ordemDeCompra", dadosApi)
      .then((res) => {
        const novaId = res?.data?.id;
        if (!novaId) {
          toastError("Erro ao obter ID da ordem");
          return;
        }
        return api.get(`/ordemDeCompra/${novaId}`);
      })
      .then((resDetalhado) => {
        if (!resDetalhado) return;
        setOrdemDeCompra(resDetalhado.data);
        toastSuccess("Ordem cadastrada com sucesso!");
        setProgresso(4);
      })
      .catch(() => toastError("Erro ao criar ordem de compra"));
  }, [materiaisSelecionados, valoresInput]);

  return (
    <>
      <NavBar />
      <section className={style.ordemDeCompra}>
        <div className={style.progressoSecao}>
          <img src={progressoImg} alt="Progresso" />
        </div>
        <main className={style.formContent}>
          <h1>
            {progresso === 4
              ? "FORMULÁRIO FINALIZADO COM SUCESSO!"
              : "ORDEM DE COMPRA"}
          </h1>

          {/* === Etapa 1 === */}
          {progresso === 1 &&
            etapas[1].inputs.map((input) => (
              <div key={input.id} className={style.inputGroup}>
                <p>
                  {input.titulo}
                  {input.required && <span style={{ color: "red" }}>*</span>}
                </p>
                {input.tipo === "select" ? (
                  <select
                    value={valoresInput[input.titulo + "Id"] || ""}
                    onChange={(e) =>
                      handleInputChange(input.titulo, e.target.value, true)
                    }
                  >
                    <option value="">{input.placeholder}</option>
                    {(input.options || []).map((opt) => (
                      <option
                        key={opt[input.optionValue]}
                        value={opt[input.optionValue]}
                      >
                        {opt[input.optionLabel]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={input.tipo}
                    placeholder={input.placeholder}
                    value={valoresInput[input.titulo] || ""}
                    disabled={input.disabled}
                    onChange={(e) =>
                      handleInputChange(input.titulo, e.target.value)
                    }
                  />
                )}
              </div>
            ))}

          {/* === Etapa 2 === */}
          {progresso === 2 && (
            <>
              <button onClick={abrirModal}>Adicionar Material</button>
              {materiaisSelecionados.length === 0 ? (
                <p>Nenhum material adicionado ainda</p>
              ) : (
                <div className={style.ordemDeCompraTabelaWrapper}>
                  <table className={style.ordemDeCompraTabela}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Quantidade</th>
                        <th>Valor Unitário</th>
                        <th>Total</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiaisSelecionados.map((mat, idx) => (
                        <tr key={idx}>
                          <td>{mat.tipoMaterial}</td>
                          <td>{mat.Quantidade}</td>
                          <td>{mat["Valor Unitário"]}</td>
                          <td>{mat.Total}</td>
                         <td>
  <button
    className={style.botaoEditar}
    onClick={() => editarMaterial(idx)}
  >
    Editar
  </button>
  <button
    className={style.botaoVerMais}
    onClick={() => abrirModalVerMais(mat)}
  >
    Ver Mais
  </button>
  <button
    className={style.botaoExcluir}
    onClick={() =>
      setMateriaisSelecionados((prev) => prev.filter((_, i) => i !== idx))
    }
  >
    Excluir
  </button>
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Modal */}
              {modalAberto && (
                <div className={style.modalOverlay}>
                  <div className={style.modalContent}>
                    <h3>Adicionar Material</h3>
                    <div className={style.modalGrid}>
                      <div className={style.inputGroup}>
                        <p>Material*</p>
                        <select
                          value={materialSelecionado}
                          onChange={(e) =>
                            setMaterialSelecionado(e.target.value)
                          }
                        >
                          <option value="">Selecione</option>
                          {listaMateriais.map((mat) => (
                            <option key={mat.id} value={mat.id}>
                              {mat.tipoMaterial}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={style.inputGroup}>
                        <p>Quantidade*</p>
                        <input
                          type="text"
                          placeholder="Número de peças"
                          value={quantidadeMaterial}
                          onChange={(e) =>
                            setQuantidadeMaterial(
                              formatarQuantidade(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className={style.inputGroup}>
                        <p>Descrição*</p>
                        <input
                          type="text"
                          placeholder="Descrição do material"
                          value={valoresInput.Descrição || ""}
                          onChange={(e) =>
                            handleInputChange("Descrição", e.target.value)
                          }
                        />
                      </div>

                      <div className={style.inputGroup}>
                        <p>Rastreabilidade*</p>
                        <input
                          type="text"
                          placeholder="Ex: 12345-2025"
                          value={valoresInput.Rastreabilidade || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "Rastreabilidade",
                              formatarRastreio(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className={style.inputGroup}>
                        <p>Valor Unitário*</p>
                        <input
                          type="text"
                          placeholder="Ex: 12,50"
                          value={valoresInput["Valor Unitário"] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "Valor Unitário",
                              formatarValorMonetario(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className={style.inputGroup}>
                        <p>Valor por Kg</p>
                        <input
                          type="text"
                          placeholder="Ex: 12,50"
                          value={valoresInput["Valor por Kg"] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "Valor por Kg",
                              formatarValorMonetario(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className={style.inputGroup}>
                        <p>Valor por Peça</p>
                        <input
                          type="text"
                          placeholder="Ex: 12,50"
                          value={valoresInput["Valor por Peça"] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "Valor por Peça",
                              formatarValorMonetario(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className={style.inputGroup}>
                        <p>Total</p>
                        <input
                          type="text"
                          value={valoresInput.Total || "0,00"}
                          disabled
                        />
                      </div>
                    </div>

                    <div className={style.modalButtons}>
                      <button onClick={adicionarMaterial}>Adicionar</button>
                      <button onClick={fecharModal}>Fechar</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {modalVerMaisAberto && materialVerMais && (
  <div className={style.modalOverlay}>
    <div className={style.modalContent}>
      <h3>Detalhes do Material</h3>
      <div className={style.modalGrid}>
        <div className={style.inputGroup}>
          <p>Material</p>
          <input type="text" value={materialVerMais.tipoMaterial} disabled />
        </div>
        <div className={style.inputGroup}>
          <p>Quantidade</p>
          <input type="text" value={materialVerMais.Quantidade} disabled />
        </div>
        <div className={style.inputGroup}>
          <p>Valor Unitário</p>
          <input type="text" value={materialVerMais["Valor Unitário"]} disabled />
        </div>
        <div className={style.inputGroup}>
          <p>Valor por Kg</p>
          <input type="text" value={materialVerMais["Valor por Kg"]} disabled />
        </div>
        <div className={style.inputGroup}>
          <p>Valor por Peça</p>
          <input type="text" value={materialVerMais["Valor por Peça"]} disabled />
        </div>
        <div className={style.inputGroup}>
          <p>Total</p>
          <input type="text" value={materialVerMais.Total} disabled />
        </div>
        <div className={style.inputGroup}>
          <p>Descrição</p>
          <input type="text" value={materialVerMais.Descrição} disabled />
        </div>
        <div className={style.inputGroup}>
          <p>Rastreabilidade</p>
          <input type="text" value={materialVerMais.Rastreabilidade} disabled />
        </div>
      </div>

      <div className={style.modalButtons}>
        <button onClick={fecharModalVerMais}>Fechar</button>
      </div>
    </div>
  </div>
)}


          <div className={style.botoes}>
            {progresso > 1 && progresso < 4 && (
              <button onClick={() => setProgresso((p) => p - 1)}>Voltar</button>
            )}
            {progresso < 3 && (
              <button onClick={() => setProgresso((p) => p + 1)}>
                Avançar
              </button>
            )}
            {progresso === 3 && (
              <button onClick={finalizarOrdemDeCompra}>Finalizar</button>
            )}
            {progresso === 4 && (
              <button onClick={() => setProgresso(1)}>Reiniciar</button>
            )}
          </div>
        </main>
      </section>
    </>
  );
}

export default OrdemDeCompra;
