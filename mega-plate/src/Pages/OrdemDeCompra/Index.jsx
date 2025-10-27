import style from "./ordemDeCompra.module.css";
import progressoImg from "../../assets/progressoOrdemDeCompra.png";
import progressoConcluido from "../../assets/progresso1Concluido.png";
import progresso2Concluido from "../../assets/progresso2Concluido.png";
import progresso3Concluido from "../../assets/progresso3Concluido.png";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api";
import { jwtDecode } from "jwt-decode";
import iconbaixar from "../../assets/icon-baixar.png";
import { jsPDF } from "jspdf";
import NavBar from "../../components/NavBar";
import {
  toastError,
  toastSuccess,
} from "../../components/toastify/ToastifyService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import baixarOrdemDeCompraPDF from "../../tools/baixarOrdemDeCompraPDF";
import { gerarPDFPrevia } from "../../tools/gerarPDFPrevia";

export function OrdemDeCompra() {
  const [listaFornecedores, setListaFornecedores] = useState([]);
  const [listaMateriais, setListaMateriais] = useState([]);
  const [ordemDeCompra, setOrdemDeCompra] = useState([]);
  const [materiaisSelecionados, setMateriaisSelecionados] = useState([]);
  const [progresso, setProgresso] = useState(1);
  const [valoresInput, setValoresInput] = useState({});
  const [errosValidacao, setErrosValidacao] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(false); // ✅ Novo estado
  const [materialEditandoIndex, setMaterialEditandoIndex] = useState(null); // ✅ Índice do material sendo editado
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
      .then((res) => {
        console.log("Dados retornados pela API:", res.data);
        setListaMateriais(res.data);
      })
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
            id: "valorkg",
            titulo: "Valor por Kg",
            tipo: "double",
            placeholder: "Digite o valor por Kg (Ex: 12,50)",
            pattern: "^\\d+([,.]\\d{1,2})?$",
            required: false, // Não é mais sempre obrigatório
            validationMessage: "Valor inválido. Use formato: 12,50",
            formatador: formatarValorMonetario,
          },
          {
            id: "rastreio",
            titulo: "Rastreabilidade",
            tipo: "text",
            placeholder: "Código de rastreamento (Max 20 caracteres)",
            pattern: "^[A-Za-z0-9\\-\\/]{5,20}$", // CORREÇÃO: Limite ajustado para 20
            required: true,
            validationMessage:
              "Código inválido. Use 5-20 caracteres alfanuméricos.", // CORREÇÃO: Mensagem atualizada
            formatador: formatarRastreio,
          },
          {
            id: "MaterialId",
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

    // ✅ VALIDAÇÃO ESPECIAL PARA PROGRESSO 2 (materiais selecionados)
    if (progresso === 2) {
      // Verifica se há materiais adicionados
      if (materiaisSelecionados.length === 0) {
        const erroMsg = "Adicione pelo menos um material antes de avançar";
        mensagensErro.push(erroMsg);
        toastError(erroMsg);
        return false;
      }
      
      // Se tem materiais, pode avançar
      return true;
    }

    // ✅ VALIDAÇÃO PARA ETAPA 1 (dados do fornecedor)
    if (progresso === 1) {
      for (let input of inputs) {
        if (input.disabled) continue;
        
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
    }

    // Exibir mensagens de erro
    mensagensErro.forEach((msg) => toastError(msg));
    setErrosValidacao(novosErros);
    return mensagensErro.length === 0;
  }, [etapas, progresso, validarCampo, valoresInput, materiaisSelecionados]);

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
          if (material) {
            newState["IPI"] = formatarIPI(material.ipi?.toString() || "0");
          }
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
    limparCamposModal();
  };

  // ✅ Nova função para abrir modal de edição
  const abrirModalEdicao = (index) => {
    const mat = materiaisSelecionados[index];
    setMaterialEditandoIndex(index);
    setMaterialSelecionado(mat.id.toString());
    setQuantidadeMaterial(mat.Quantidade);
    
    setValoresInput((prev) => ({
      ...prev,
      "Descrição": mat["Descrição"],
      "Rastreabilidade": mat.Rastreabilidade,
      "Valor por Kg": mat["Valor por Kg"],
      "Valor por peça": mat["Valor por peça"],
      "Valor Unitário": mat["Valor Unitário"],
      "IPI": mat.IPI,
      "Total": mat.Total,
    }));
    
    setModalEdicao(true);
  };

  // ✅ Nova função para fechar modal de edição
  const fecharModalEdicao = () => {
    setModalEdicao(false);
    setMaterialEditandoIndex(null);
    setMaterialSelecionado("");
    setQuantidadeMaterial("");
    limparCamposModal();
  };

  // ✅ Nova função para limpar campos do modal
  const limparCamposModal = () => {
    setValoresInput((prev) => ({
      ...prev,
      "Descrição": "",
      "Rastreabilidade": "",
      "Valor por Kg": "",
      "Valor por peça": "",
      "Valor Unitário": "",
      "IPI": "",
      "Total": "0,00"
    }));
  };

  // ✅ Nova função para salvar edição
  const salvarEdicao = () => {
    if (!materialSelecionado || !quantidadeMaterial) {
      toastError("Selecione material e quantidade");
      return;
    }

    if (!valoresInput["Descrição"] || !valoresInput["Rastreabilidade"]) {
      toastError("Preencha Descrição e Rastreabilidade");
      return;
    }

    if (!valoresInput["Valor Unitário"]) {
      toastError("Preencha o Valor Unitário");
      return;
    }

    if (!valoresInput["Valor por Kg"] && !valoresInput["Valor por peça"]) {
      toastError("Preencha pelo menos um: Valor por Kg OU Valor por peça");
      return;
    }

    const mat = listaMateriais.find((m) => m.id === Number(materialSelecionado));
    const valorUnit = parseFloat((valoresInput["Valor Unitário"] || "0").replace(",", "."));
    const qtd = parseInt(quantidadeMaterial);
    const totalCalculado = (valorUnit * qtd).toFixed(2).replace(".", ",");

    // Atualiza o material no array
    setMateriaisSelecionados((prev) => {
      const copy = [...prev];
      copy[materialEditandoIndex] = {
        ...mat,
        Quantidade: quantidadeMaterial,
        "Descrição": valoresInput["Descrição"],
        "Rastreabilidade": valoresInput["Rastreabilidade"],
        "Valor por Kg": valoresInput["Valor por Kg"] || "0,00",
        "Valor por peça": valoresInput["Valor por peça"] || "0,00",
        "Valor Unitário": valoresInput["Valor Unitário"],
        ipi: listaMateriais.find(m => m.id === Number(materialSelecionado))?.ipi || 0,
        Total: totalCalculado,
        expandido: false
      };
      return copy;
    });

    fecharModalEdicao();
    toastSuccess("Material atualizado com sucesso!");
  };

  // ✅ Nova função para remover material
  const removerMaterial = (index) => {
    setMateriaisSelecionados((prev) => prev.filter((_, i) => i !== index));
    toastSuccess("Material removido com sucesso!");
  };

  const adicionarMaterial = () => {
    if (!materialSelecionado || !quantidadeMaterial) {
      toastError("Selecione material e quantidade");
      return;
    }

    // Validações dos campos obrigatórios do modal
    if (!valoresInput["Descrição"] || !valoresInput["Rastreabilidade"]) {
      toastError("Preencha Descrição e Rastreabilidade");
      return;
    }

    if (!valoresInput["Valor Unitário"]) {
      toastError("Preencha o Valor Unitário");
      return;
    }

    // Validação: deve ter pelo menos um dos valores (Kg ou Peça)
    if (!valoresInput["Valor por Kg"] && !valoresInput["Valor por peça"]) {
      toastError("Preencha pelo menos um: Valor por Kg OU Valor por peça");
      return;
    }

    const mat = listaMateriais.find((m) => m.id === Number(materialSelecionado));

    if (materiaisSelecionados.some((m) => m.id === mat.id)) {
      toastError("Este material já foi adicionado");
      return;
    }

    // Calcular o total antes de adicionar
    const valorUnit = parseFloat((valoresInput["Valor Unitário"] || "0").replace(",", "."));
    const qtd = parseInt(quantidadeMaterial);
    const totalCalculado = (valorUnit * qtd).toFixed(2).replace(".", ",");

    // Adiciona o material COM TODOS os valores preenchidos
    setMateriaisSelecionados((prev) => [
      ...prev,
      {
        ...mat,
        Quantidade: quantidadeMaterial,
        "Descrição": valoresInput["Descrição"],
        "Rastreabilidade": valoresInput["Rastreabilidade"],
        "Valor por Kg": valoresInput["Valor por Kg"] || "0,00",
        "Valor por peça": valoresInput["Valor por peça"] || "0,00",
        "Valor Unitário": valoresInput["Valor Unitário"],
        ipi: listaMateriais.find(m => m.id === Number(materialSelecionado))?.ipi || 0,
        Total: totalCalculado,
        expandido: false
      },
    ]);

    limparCamposModal(); // ✅ Usa a nova função
    fecharModal();
    toastSuccess("Material adicionado com sucesso!");
  };

  // Total automático - CORRIGIDO para calcular no modal também
  useEffect(() => {
    const valorUnit =
      parseFloat((valoresInput["Valor Unitário"] || "0").replace(",", ".")) || 0;
    
    // Usa quantidadeMaterial se estiver no modal (progresso 2), senão usa do valoresInput
    const quantidade = progresso === 2 && modalAberto
      ? parseInt(quantidadeMaterial || "0") || 0
      : parseInt(valoresInput["Quantidade"] || "0") || 0;
    
    const total = valorUnit * quantidade;
    
    setValoresInput((prev) => ({
      ...prev,
      Total: total > 0 ? total.toFixed(2).replace(".", ",") : "0,00",
    }));
  }, [valoresInput["Valor Unitário"], valoresInput["Quantidade"], quantidadeMaterial, progresso, modalAberto]);

  // Finalizar ordem - CORRIGIDO: Envia array de ordens ao invés de objeto único
  const finalizarOrdemDeCompra = useCallback(() => {
    const usuarioId = getUsuarioIdDoToken();

    // ✅ Cria um array de objetos (um para cada material)
    const ordensParaEnviar = materiaisSelecionados.map((mat) => ({
      usuarioId: usuarioId,
      fornecedorId: Number(valoresInput["FornecedorId"]),
      prazoEntrega: valoresInput["Prazo de entrega"],
      condPagamento: valoresInput["Cond. Pagamento"],
      estoqueId: mat.id,
      valorKg: parseFloat(mat["Valor por Kg"]?.replace(",", ".") || 0),
      valorPeca: parseFloat(mat["Valor por peça"]?.replace(",", ".") || 0),
      descricaoMaterial: mat["Descrição"],
      
      rastreabilidade: mat.Rastreabilidade,
      quantidade: parseInt(mat.Quantidade || 1),
      valorUnitario: parseFloat(mat["Valor Unitário"]?.replace(",", ".") || 0),
    }));

    // ✅ Envia o array diretamente
    api
      .post("/ordemDeCompra/multiplas-ordens", ordensParaEnviar)
      .then((res) => {
        const novaId = res?.data?.id || res?.data?.[0]?.id;
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
        console.error("Erro completo:", err.response?.data);
        toastError(
          err.response?.data?.message || "Erro ao criar ordem de compra"
        );
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
                      {mat["Valor Unitário"]} - IPI: {mat.ipi}% - Total:{" "}
                      {mat.Total || "0,00"}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => abrirModalEdicao(idx)}>
                          Editar
                        </button>
                        <button 
                          onClick={() => removerMaterial(idx)}
                          style={{ backgroundColor: "#e74c3c", color: "white" }}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* === Modal de ADICIONAR material === */}
            {modalAberto && (
              <div className={style.modalOverlay}>
                <div className={style.modalContent}>
                  <h3>Adicionar Material</h3>

                  <div className={style.modalGrid}>
                    {/* Select do Material */}
                    <div className={style.inputGroup}>
                      <p>
                        Material <span style={{ color: "red" }}>*</span>
                      </p>
                      <select
                        value={materialSelecionado}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setMaterialSelecionado(valor);

                          // Atualiza IPI automaticamente
                          const material = listaMateriais.find(
                            (m) => m.id.toString() === valor.toString()
                          );
                          if (material) {
                            handleInputChange(
                              "IPI",
                              formatarIPI(material.IPI?.toString() || "0")
                            );
                          }
                        }}
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
                      <p>
                        Quantidade <span style={{ color: "red" }}>*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Número de peças/unidades"
                        value={quantidadeMaterial}
                        onChange={(e) =>
                          setQuantidadeMaterial(formatarQuantidade(e.target.value))
                        }
                      />
                    </div>

                    {/* Descrição do Material */}
                    <div className={style.inputGroup}>
                      <p>
                        Descrição do material <span style={{ color: "red" }}>*</span>
                        <span style={{ fontSize: "12px", color: "#666", marginLeft: "10px" }}>
                          ({(valoresInput["Descrição"] || "").length}/50)
                        </span>
                      </p>
                      <input
                        type="text"
                        placeholder="Ex: Parafuso galvanizado M6"
                        value={valoresInput["Descrição"] || ""}
                        maxLength={50}
                        onChange={(e) => handleInputChange("Descrição", e.target.value)}
                      />
                    </div>

                    {/* Rastreabilidade */}
                    <div className={style.inputGroup}>
                      <p>
                        Rastreabilidade <span style={{ color: "red" }}>*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Ex: 21345-2015"
                        value={valoresInput["Rastreabilidade"] || ""}
                        onChange={(e) =>
                          handleInputChange("Rastreabilidade", formatarRastreio(e.target.value))
                        }
                      />
                    </div>

                    {/* Valor por Kg */}
                    <div className={style.inputGroup}>
                      <p>Valor por Kg</p>
                      <input
                        type="text"
                        placeholder="Ex: 12,50"
                        value={valoresInput["Valor por Kg"] || ""}
                        onChange={(e) =>
                          handleInputChange("Valor por Kg", formatarValorMonetario(e.target.value))
                        }
                      />
                    </div>

                    {/* Valor por peça */}
                    <div className={style.inputGroup}>
                      <p>Valor por peça</p>
                      <input
                        type="text"
                        placeholder="Ex: 5,00"
                        value={valoresInput["Valor por peça"] || ""}
                        onChange={(e) =>
                          handleInputChange("Valor por peça", formatarValorMonetario(e.target.value))
                        }
                      />
                    </div>

                    {/* Valor Unitário */}
                    <div className={style.inputGroup}>
                      <p>
                        Valor Unitário <span style={{ color: "red" }}>*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Ex: 9,90"
                        value={valoresInput["Valor Unitário"] || ""}
                        onChange={(e) =>
                          handleInputChange("Valor Unitário", formatarValorMonetario(e.target.value))
                        }
                      />
                    </div>

                    

                    {/* Total (calculado automaticamente) */}
                    <div className={style.inputGroup}>
                      <p>Total</p>
                      <input
                        type="text"
                        placeholder="Calculado automaticamente"
                        value={valoresInput["Total"] || "0,00"}
                        disabled
                        style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
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

            {/* ✅ Modal de EDITAR material */}
            {modalEdicao && (
              <div className={style.modalOverlay}>
                <div className={style.modalContent}>
                  <h3>Editar Material</h3>

                  <div className={style.modalGrid}>
                    {/* Select do Material */}
                    <div className={style.inputGroup}>
                      <p>Material <span style={{ color: "red" }}>*</span></p>
                      <select
                        value={materialSelecionado}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setMaterialSelecionado(valor);
                          const material = listaMateriais.find(
                            (m) => m.id.toString() === valor.toString()
                          );
                          // Não atualiza mais o campo IPI
                        }}
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
                        onChange={(e) => setQuantidadeMaterial(formatarQuantidade(e.target.value))}
                      />
                    </div>

                    {/* Descrição do Material */}
                    <div className={style.inputGroup}>
                      <p>
                        Descrição do material <span style={{ color: "red" }}>*</span>
                        <span style={{ fontSize: "12px", color: "#666", marginLeft: "10px" }}>
                          ({(valoresInput["Descrição"] || "").length}/50)
                        </span>
                      </p>
                      <input
                        type="text"
                        placeholder="Ex: Parafuso galvanizado M6"
                        value={valoresInput["Descrição"] || ""}
                        maxLength={50}
                        onChange={(e) => handleInputChange("Descrição", e.target.value)}
                      />
                    </div>

                    {/* Rastreabilidade */}
                    <div className={style.inputGroup}>
                      <p>Rastreabilidade <span style={{ color: "red" }}>*</span></p>
                      <input
                        type="text"
                        placeholder="Ex: 21345-2015"
                        value={valoresInput["Rastreabilidade"] || ""}
                        onChange={(e) => handleInputChange("Rastreabilidade", formatarRastreio(e.target.value))}
                      />
                    </div>

                    {/* Valor por Kg */}
                    <div className={style.inputGroup}>
                      <p>Valor por Kg</p>
                      <input
                        type="text"
                        placeholder="Ex: 12,50"
                        value={valoresInput["Valor por Kg"] || ""}
                        onChange={(e) => handleInputChange("Valor por Kg", formatarValorMonetario(e.target.value))}
                      />
                    </div>

                    {/* Valor por peça */}
                    <div className={style.inputGroup}>
                      <p>Valor por peça</p>
                      <input
                        type="text"
                        placeholder="Ex: 5,00"
                        value={valoresInput["Valor por peça"] || ""}
                        onChange={(e) => handleInputChange("Valor por peça", formatarValorMonetario(e.target.value))}
                      />
                    </div>

                    {/* Valor Unitário */}
                    <div className={style.inputGroup}>
                      <p>Valor Unitário <span style={{ color: "red" }}>*</span></p>
                      <input
                        type="text"
                        placeholder="Ex: 9,90"
                        value={valoresInput["Valor Unitário"] || ""}
                        onChange={(e) => handleInputChange("Valor Unitário", formatarValorMonetario(e.target.value))}
                      />
                    </div>

                    {/* Total */}
                    <div className={style.inputGroup}>
                      <p>Total</p>
                      <input
                        type="text"
                        placeholder="Calculado automaticamente"
                        value={valoresInput["Total"] || "0,00"}
                        disabled
                        style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
                      />
                    </div>
                  </div>

                  <div className={style.modalButtons}>
                    <button onClick={salvarEdicao}>Salvar</button>
                    <button onClick={fecharModalEdicao}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* === Etapa 3: Confirmação e Download === */}
        {progresso === 3 && (
          <div className={style.confirmacao}>
            <h2>Resumo da Ordem de Compra</h2>
            
            {/* Informações do Fornecedor */}
            <div className={style.resumoSecao}>
              <h3>Dados do Fornecedor</h3>
              <p><strong>Fornecedor:</strong> {listaFornecedores.find(f => f.fornecedorId === Number(valoresInput["FornecedorId"]))?.nomeFantasia || "N/A"}</p>
              <p><strong>Prazo de entrega:</strong> {new Date(valoresInput["Prazo de entrega"]).toLocaleDateString("pt-BR")}</p>
              <p><strong>Condição de Pagamento:</strong> {valoresInput["Cond. Pagamento"]}</p>
            </div>

            {/* Lista de Materiais */}
            <div className={style.resumoSecao}>
              <h3>Materiais Selecionados</h3>
              <table className={style.tabelaResumo}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Valor Unit.</th>
                    <th>IPI</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {materiaisSelecionados.map((mat, idx) => (
                    <tr key={idx}>
                      <td>{mat.tipoMaterial}</td>
                      <td>{mat["Descrição"]}</td>
                      <td>{mat.Quantidade}</td>
                      <td>R$ {mat["Valor Unitário"]}</td>
                      <td>{mat.ipi}%</td>
                      <td>R$ {mat.Total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Total Geral */}
              <div className={style.totalGeral}>
                <p><strong>Total Geral:</strong> R$ {
                  materiaisSelecionados.reduce((acc, mat) => {
                    const valor = parseFloat(mat.Total?.replace(",", ".") || 0);
                    return acc + valor;
                  }, 0).toFixed(2).replace(".", ",")
                }</p>
              </div>
            </div>

            {/* Botão de Download do PDF */}
            <div className={style.acoesPDF}>
              <button 
                className={style.botaoPDF}
                onClick={() => {
                  const sucesso = gerarPDFPrevia(valoresInput, materiaisSelecionados, listaFornecedores);
                  if (sucesso) {
                    toastSuccess("PDF de pré-visualização baixado!");
                  }
                }}
              >
                <img src={iconbaixar} alt="Baixar" />
              </button>
            </div>

            <p className={style.avisoConfirmacao}>
              ⚠️ Revise os dados acima. Ao clicar em "Finalizar", a ordem será registrada no sistema.
            </p>
          </div>
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
