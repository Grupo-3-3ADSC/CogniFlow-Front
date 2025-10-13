import style from "./ordemDeCompra.module.css";
import progressoImg from "../../assets/progressoOrdemDeCompra.png";
import progressoConcluido from "../../assets/progresso1Concluido.png";
import progresso2Concluido from "../../assets/progresso2Concluido.png";
import progresso3Concluido from "../../assets/progresso3Concluido.png";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api";
import { jwtDecode } from "jwt-decode";
import { jsPDF } from "jspdf";
import NavBar from "../../components/NavBar";
import {
  toastError,
  toastSuccess,
} from "../../components/toastify/ToastifyService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import baixarOrdemDeCompraPDF from "../../tools/baixarOrdemDeCompraPDF";

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
  const navigate = useNavigate();
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);

  // Funções API
  const getFornecedores = useCallback(() => {
    api
      .get("/fornecedores")
      .then((res) => setListaFornecedores(res.data))
      .catch((err) => toastError("Erro ao buscar fornecedores"));
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
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
      return null;
    }
  };

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

  useEffect(() => {
    getFornecedores();
    getMateriaPrima();
  }, [getFornecedores, getMateriaPrima]);

  // Funções de formatação
  const formatarPagamento = (valor) => {
    const nums = valor.replace(/\D/g, "");
    if (!nums) return "";
    if (nums.length <= 2) return `${nums} dias`;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)} dias`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)} dias`;
  };

  const formatarValorMonetario = (valor) => {
    const nums = valor.replace(/[^\d]/g, "");
    if (!nums) return "";
    if (nums.length === 1) return `0,0${nums}`;
    if (nums.length === 2) return `0,${nums}`;
    const inteiros = nums.slice(0, -2).replace(/^0+/, "") || "0";
    const decimais = nums.slice(-2);
    return `${inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimais}`;
  };

  const formatarRastreio = (valor) => {
    return valor
      .toUpperCase()
      .replace(/[^A-Z0-9\-\/]/g, "")
      .substring(0, 20);
  };

  const formatarQuantidade = (valor) => valor.replace(/\D/g, "");

  const formatarIPI = (valor) => {
    const nums = valor.replace(/[^\d,]/g, "");
    if (nums.includes(",")) {
      const partes = nums.split(",");
      return `${partes[0]},${partes[1].slice(0, 2)}`;
    }
    return nums || "0,00";
  };

  const validarCamposValor = (valoresInput) => {
    const valorKg = valoresInput["Valor por Kg"];
    const valorPeca = valoresInput["Valor por peça"];
    if (!valorKg && !valorPeca) {
      return {
        "Valor por Kg": "Preencha o valor por Kg OU o valor por peça",
        "Valor por peça": "Preencha o valor por Kg OU o valor por peça",
      };
    }
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
            placeholder: "Selecione o fornecedor da lista",
            validationMessage: "Selecione um fornecedor válido.",
          },
          {
            id: "prazo",
            titulo: "Prazo de entrega",
            tipo: "date",
            placeholder: "Selecione a data de entrega",
            required: true,
            validationMessage: "Informe uma data de entrega válida",
          },
          {
            id: "pagamento",
            titulo: "Cond. Pagamento",
            tipo: "text",
            placeholder: "Ex: 30 dias ou 30/60 dias",
            pattern: "^\\d{1,3}(\\/\\d{1,3})?\\s?dias?$",
            required: true,
            validationMessage: "Use formato: 30 dias ou 30/60 dias",
            formatador: formatarPagamento,
          },
        ],
        imagem: progressoImg,
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
            placeholder: "Selecione o material",
          },
          {
            id: "descricao",
            titulo: "Descrição do material",
            tipo: "text",
            placeholder:
              "Descreva detalhadamente o material (Ex: Parafuso galvanizado M6)",
            pattern: "^[\\w\\s\\-\\.]{3,100}$",
            required: true,
            validationMessage: "Descrição deve ter entre 3 e 100 caracteres.",
          },
          {
            id: "quantidade",
            titulo: "Quantidade",
            tipo: "text",
            placeholder: "Número de peças/unidades (Ex: 100)",
            pattern: "^\\d{1,5}$",
            required: true,
            validationMessage:
              "Quantidade inválida. Use apenas números (1-99999).",
            formatador: formatarQuantidade,
          },
          {
            id: "rastreio",
            titulo: "Rastreabilidade",
            tipo: "text",
            placeholder: "Código de rastreamento (Max 20 caracteres)",
            pattern: "^[A-Za-z0-9\\-\\/]{16,20}$",
            required: true,
            validationMessage:
              "Código inválido. Use 16-20 caracteres alfanuméricos.",
            formatador: formatarRastreio,
          },
          {
            id: "valorkg",
            titulo: "Valor por Kg",
            tipo: "text",
            placeholder: "Digite o valor por Kg (Ex: 12,50)",
            required: false,
            validationMessage: "Valor inválido. Use formato: 12,50",
            formatador: formatarValorMonetario,
          },
          {
            id: "valorpeca",
            titulo: "Valor por peça",
            tipo: "text",
            placeholder: "Preço unitário da peça (Ex: 5,00)",
            required: false,
            validationMessage: "Valor inválido. Use formato: 5,00",
            formatador: formatarValorMonetario,
          },
          {
            id: "valorunit",
            titulo: "Valor Unitário",
            tipo: "text",
            placeholder: "Valor final por unidade (Ex: 9,90)",
            required: true,
            validationMessage: "Valor inválido. Use formato: 9,90",
            formatador: formatarValorMonetario,
          },
          { id: "total", titulo: "Total", tipo: "text", disabled: true },
          { id: "ipi", titulo: "IPI", tipo: "text", disabled: true },
        ],
        imagem: progressoConcluido,
      },
      3: { inputs: [], imagem: progresso2Concluido },
      4: { inputs: [], imagem: progresso3Concluido },
    }),
    [listaFornecedores, listaMateriais]
  );

  const validarCampo = useCallback((input, valor) => {
    if (!input.required) return { valido: true };
    if (!valor || valor.trim() === "")
      return { valido: false, erro: `${input.titulo} é obrigatório` };
    if (input.pattern && !new RegExp(input.pattern).test(valor))
      return { valido: false, erro: input.validationMessage };
    return { valido: true };
  }, []);

  const validarFormulario = useCallback(() => {
    const inputs = etapas[progresso]?.inputs || [];
    const novosErros = {};
    const mensagensErro = [];

    if (progresso === 2) {
      const errosValor = validarCamposValor(valoresInput);
      Object.assign(novosErros, errosValor);
      Object.values(errosValor).forEach((e) =>
        mensagensErro.includes(e) ? null : mensagensErro.push(e)
      );
    }

    for (let input of inputs) {
      if (input.titulo === "Total" || input.disabled) continue;
      const valor =
        input.tipo === "select"
          ? valoresInput[input.titulo + "Id"]
          : valoresInput[input.titulo];
      const validacao = validarCampo(input, valor);
      if (!validacao.valido) {
        novosErros[input.titulo] = validacao.erro;
        if (!mensagensErro.includes(validacao.erro))
          mensagensErro.push(validacao.erro);
      }
    }

    mensagensErro.forEach((msg) => toastError(msg));
    setErrosValidacao(novosErros);
    return mensagensErro.length === 0;
  }, [etapas, progresso, validarCampo, valoresInput]);

  // Navegação
  const avancarProgresso = useCallback(() => {
    if (!validarFormulario()) return;
    setProgresso((prev) => Math.min(prev + 1, 4));
  }, [validarFormulario]);

  const voltarProgresso = useCallback(() => {
    setProgresso((prev) => Math.max(prev - 1, 1));
    setErrosValidacao({});
  }, []);

  const reiniciar = useCallback(() => {
    setProgresso(1);
    setValoresInput({});
    setErrosValidacao({});
  }, []);

  // Handle input
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

        // Atualiza IPI automaticamente se material selecionado
        if (titulo === "Material") {
          const material = listaMateriais.find(
            (m) => m.id.toString() === valor.toString()
          );
          if (material)
            newState["IPI"] = formatarIPI(material.IPI?.toString() || "0");
        }

        return newState;
      });

      if (errosValidacao[titulo]) {
        setErrosValidacao((prev) => ({ ...prev, [titulo]: "" }));
      }
    },
    [errosValidacao, listaMateriais]
  );

  // MODAL
  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    setMaterialSelecionado("");
    setQuantidadeMaterial("");
  };
  const adicionarMaterial = () => {
    if (!materialSelecionado || !quantidadeMaterial) {
      toastError("Selecione material e quantidade");
      return;
    }

    const mat = listaMateriais.find(
      (m) => m.id === Number(materialSelecionado)
    );

    // Evita duplicado
    if (materiaisSelecionados.some((m) => m.id === mat.id)) {
      toastError("Este material já foi adicionado");
      return;
    }

    setMateriaisSelecionados((prev) => [
      ...prev,
      { ...mat, Quantidade: quantidadeMaterial },
    ]);
    fecharModal();
  };

  // Total automático
  useEffect(() => {
    const valorUnit =
      parseFloat((valoresInput["Valor Unitário"] || "0").replace(",", ".")) ||
      0;
    const quantidade = parseInt(valoresInput["Quantidade"] || "0") || 0;
    const total = valorUnit * quantidade;
    setValoresInput((prev) => ({
      ...prev,
      Total: total > 0 ? total.toFixed(2).replace(".", ",") : "0,00",
    }));
  }, [valoresInput["Valor Unitário"], valoresInput["Quantidade"]]);

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
        valorPeca: parseFloat(mat["Valor por peça"]?.replace(",", ".") || 0),
        descricaoMaterial: mat["Descrição"],
        ipi: parseFloat(mat.IPI?.replace(",", ".") || 0),
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
        if (!novaId || isNaN(novaId)) {
          toastError("Erro ao obter o ID da nova ordem de compra.");
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
      .catch((err) => {
        toastError(
          err.response?.data?.message || "Erro ao criar ordem de compra"
        );
        setErrosValidacao({
          geral: "Erro ao criar ordem de compra. Verifique os dados.",
        });
      });
  }, [materiaisSelecionados, valoresInput]);

  const image = etapas[progresso]?.imagem || progressoImg;

return (
  <>
    <NavBar />
    <section className={style.ordemDeCompra}>
      <div className={style.progressoSecao}>
        <img src={etapas[progresso]?.imagem || progressoImg} alt="Progresso" />
      </div>
      <main className={style.formContent}>
        <h1>
          {progresso === 4
            ? "FORMULÁRIO FINALIZADO COM SUCESSO!"
            : "ORDEM DE COMPRA"}
        </h1>

        {/* === Etapa 1: Inputs do formulário principal === */}
        {progresso === 1 && (
          <div className={style.inputs}>
            {etapas[1].inputs.map((input) => (
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
          </div>
        )}

        {/* === Etapa 2: Lista de Materiais e Modal === */}
        {progresso === 2 && (
          <>
            <button onClick={abrirModal}>Adicionar Material</button>

            {materiaisSelecionados.length === 0 ? (
              <p>Nenhum material adicionado ainda</p>
            ) : (
              <ul>
                {materiaisSelecionados.map((mat, idx) => (
                  <li key={idx}>
                    <div className={style.listaPrincipal}>
                      {mat.tipoMaterial} - Qtd: {mat.Quantidade} - Valor Unitário:{" "}
                      {mat["Valor Unitário"]} - IPI: {mat.IPI} - Total:{" "}
                      {mat.Total || "0,00"}
                      <button
                        onClick={() => {
                          setMateriaisSelecionados((prev) => {
                            const copy = [...prev];
                            copy[idx].expandido = !copy[idx].expandido;
                            return copy;
                          });
                        }}
                      >
                        {mat.expandido ? "Ver Menos" : "Ver Mais"}
                      </button>
                    </div>
                    {mat.expandido && (
                      <div className={style.listaExpandida}>
                        <p>Descrição: {mat["Descrição"]}</p>
                        <p>Rastreabilidade: {mat.Rastreabilidade}</p>
                        <p>Valor por Kg: {mat["Valor por Kg"]}</p>
                        <p>Valor por peça: {mat["Valor por peça"]}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* === Modal de adicionar material === */}
       {modalAberto && (
  <div className={style.modalOverlay}>
    <div className={style.modalContent}>
      <h3>Adicionar Material</h3>

      <div className={style.modalGrid}>
        {/* Select do Material */}
        <div className={style.inputGroup}>
          <p>Material <span style={{ color: "red" }}>*</span></p>
          <select
            value={materialSelecionado}
            onChange={(e) => setMaterialSelecionado(e.target.value)}
          >
            <option value="">Selecione um material</option>
            {listaMateriais.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.tipoMaterial}
              </option>
            ))}
          </select>
        </div>

        {/* Quantidade */}
        <div className={style.inputGroup}>
          <p>Quantidade <span style={{ color: "red" }}>*</span></p>
          <input
            type="text"
            placeholder="Número de peças/unidades"
            value={quantidadeMaterial}
            onChange={(e) => setQuantidadeMaterial(e.target.value)}
          />
        </div>
        {/* Valor Unitário */}
        <div className={style.inputGroup}>
          <p>Valor Unitário</p>
          <input
            type="text"
            placeholder="Ex: 12,50"
            value={valoresInput["Valor Unitário"] || ""}
            onChange={(e) =>
              handleInputChange("Valor Unitário", e.target.value)
            }
          />
        </div>
<div className={style.inputGroup}>
          <p>Ratreabilidade</p>
          <input
            type="text"
            placeholder="Ex:21345-2015"
            value={valoresInput["Rastreabilidade"] || ""}
            onChange={(e) =>
              handleInputChange("Rastreabilidade", formatarPagamento(e.target.value))
            }
          />
        </div>

        {/* Valor Unitário */}
        <div className={style.inputGroup}>
          <p>Valor Unitário</p>
          <input
            type="text"
            placeholder="Ex: 12,50"
            value={valoresInput["Valor Unitário"] || ""}
            onChange={(e) =>
              handleInputChange("Valor Unitário", e.target.value)
            }
          />
        </div>

       {/* Valor Unitário */}
        <div className={style.inputGroup}>
          <p>Valor Unitário</p>
          <input
            type="text"
            placeholder="Ex: 12,50"
            value={valoresInput["Valor Unitário"] || ""}
            onChange={(e) =>
              handleInputChange("Valor Unitário", e.target.value)
            }
          />
        </div>
        {/* Valor Unitário */}
        <div className={style.inputGroup}>
          <p>Valor Unitário</p>
          <input
            type="text"
            placeholder="Ex: 12,50"
            value={valoresInput["Valor Unitário"] || ""}
            onChange={(e) =>
              handleInputChange("Valor Unitário", e.target.value)
            }
          />
        </div>
        {/* Valor Unitário */}
        <div className={style.inputGroup}>
          <p>Valor Unitário</p>
          <input
            type="text"
            placeholder="Ex: 12,50"
            value={valoresInput["Valor Unitário"] || ""}
            onChange={(e) =>
              handleInputChange("Valor Unitário", e.target.value)
            }
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

        {/* === Botões de navegação === */}
        <div className={style.botoes}>
          {progresso > 1 && progresso < 4 && (
            <button onClick={voltarProgresso}>Voltar</button>
          )}
          {progresso < 3 && <button onClick={avancarProgresso}>Avançar</button>}
          {progresso === 3 && (
            <button onClick={finalizarOrdemDeCompra}>Finalizar</button>
          )}
          {progresso === 4 && <button onClick={reiniciar}>Reiniciar</button>}
        </div>
      </main>
    </section>
  </>
);
}

export default OrdemDeCompra;
