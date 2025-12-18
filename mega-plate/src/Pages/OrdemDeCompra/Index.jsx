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
  const [dadosFornecedor, setDadosFornecedor] = useState({});
  const [materiaisSelecionados, setMateriaisSelecionados] = useState([]);
  const [progresso, setProgresso] = useState(1);

  const [valoresInput, setValoresInput] = useState({});
  const [errosValidacao, setErrosValidacao] = useState({});
  const [tipoCompra, setTipoCompra] = useState("UNIDADE");

  const [modalTemp, setModalTemp] = useState({
    materialSelecionado: "",
    quantidade: "",
    descricao: "",
    rastreabilidade: "",
    valorKg: "",
    valorPeca: "",
    valorUnitario: "",
    ipiFormatado: "0,00%",
    total: "0,00",
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [materialEditandoIndex, setMaterialEditandoIndex] = useState(null);
  const [materialSelecionado, setMaterialSelecionado] = useState("");
  const [quantidadeMaterial, setQuantidadeMaterial] = useState("");
  const navigate = useNavigate();
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [conjuntoIdSalvo, setConjuntoIdSalvo] = useState(null);
  const [idsDoConjuntoAtual, setIdsDoConjuntoAtual] = useState([]); // ← NOVO ESTADO
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

  useEffect(() => {
    if (tipoCompra === "QUILO") {
      setValoresInput((prev) => ({ ...prev, "Valor Unitário": "" }));
    } else {
      setValoresInput((prev) => ({ ...prev, "Valor por Kg": "" }));
    }
  }, [tipoCompra]);

  useEffect(() => {
    const qtd = Number(quantidadeMaterial || 0);

    const valorUnitario = Number(
      (valoresInput["Valor Unitário"] || "0").replace(",", ".")
    );

    const valorKg = Number(
      (valoresInput["Valor por Kg"] || "0").replace(",", ".")
    );

    let total = 0;

    if (tipoCompra === "UNIDADE") {
      total = qtd * valorUnitario;
    } else {
      total = qtd * valorKg;
    }

    setValoresInput((prev) => ({
      ...prev,
      Total: total > 0 ? total.toFixed(2).replace(".", ",") : "0,00",
    }));
  }, [
    quantidadeMaterial,
    valoresInput["Valor Unitário"],
    valoresInput["Valor por Kg"],
    tipoCompra,
  ]);

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
    const nums = (valor || "0").toString().replace(/[^\d,]/g, "");
    let valorLimpo = "0,00";

    if (nums.includes(",")) {
      const partes = nums.split(",");
      valorLimpo = `${partes[0]},${partes[1].slice(0, 2)}`;
    } else if (nums && nums !== "0") {
      valorLimpo = nums.includes(".")
        ? nums.replace(".", ",").split(",")[0] +
          "," +
          nums.split(".")[1].slice(0, 2).padEnd(2, "0")
        : nums + ",00";
    }

    return `${valorLimpo}%`; // ← AQUI ESTÁ A MÁGICA
  };

  const validarPrazoEntrega = () => {
    const prazo = dadosFornecedor["Prazo de entrega"];
    if (!prazo) return true; // será validado em outro lugar

    const dataSelecionada = new Date(prazo);
    const hoje = new Date();
    dataSelecionada.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada <= hoje) {
      toastError("Informe uma data de entrega posterior à data atual.");
      return false;
    }
    return true;
  };

  const validarEtapaFornecedor = () => {
    let temErro = false;

    if (!valoresInput["FornecedorId"]) {
      toastError("O campo Fornecedor é obrigatório.");
      temErro = true;
    }

    if (!valoresInput["Prazo de entrega"]) {
      toastError("O campo Prazo de Entrega é obrigatório.");
      temErro = true;
    }

    if (!valoresInput["Cond. Pagamento"]) {
      toastError("O campo Condição de Pagamento é obrigatória.");
      temErro = true;
    }

    return !temErro;
  };

  const validarRastreabilidade = (valor) => {
  if (!valor || valor.trim() === "") {
    toastError("O campo Rastreabilidade é obrigatório.");
    return false;
  }

  if (valor.length < 7 || valor.length > 17) {
    toastError("Rastreabilidade deve conter entre 7 e 17 caracteres.");
    return false;
  }

  return true;
};

const validarDescricao = (valor) => {
  if (!valor || valor.trim() === "") {
    toastError("O campo Descrição é obrigatório.");
    return false;
  }

  if (valor.trim().length < 4) {
    toastError("A descrição deve conter pelo menos 4 caracteres.");
    return false;
  }

  return true;
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
            placeholder: "Código de rastreamento (Max 17 caracteres)",
            pattern: "^[A-Za-z0-9\\-\\/]{7,17}$",
            required: true,
            validationMessage:
              "Código inválido. Use 7-17 caracteres alfanuméricos.",
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
  // VALIDAÇÃO CORRETA E SIMPLES (funciona 100%)
  const validarFormulario = useCallback(() => {
    if (progresso === 1) {
      if (!dadosFornecedor.FornecedorId) {
        toastError("Selecione o fornecedor");
        return false;
      }
      if (!dadosFornecedor["Prazo de entrega"]) {
        toastError("Informe o prazo de entrega");
        return false;
      }
      if (!dadosFornecedor["Cond. Pagamento"]) {
        toastError("Informe a condição de pagamento");
        return false;
      }
      if (!validarPrazoEntrega()) return false;
      return true;
    }

    if (progresso === 2 && materiaisSelecionados.length === 0) {
      toastError("Adicione pelo menos um material antes de avançar");
      return false;
    }

    return true;
  }, [progresso, dadosFornecedor, materiaisSelecionados]);

  // Navegação

  const avancarProgresso = useCallback(() => {
    if (validarFormulario()) {
      setProgresso((prev) => Math.min(prev + 1, 4));
    }
  }, [validarFormulario]);

  const voltarProgresso = useCallback(() => {
    setProgresso((prev) => Math.max(prev - 1, 1));
    setErrosValidacao({});
  }, []);

  const reiniciar = useCallback(() => {
    setProgresso(1);
    setDadosFornecedor({});
    setValoresInput({});
    setErrosValidacao({});
    setMateriaisSelecionados([]);
    setMaterialSelecionado("");
    setQuantidadeMaterial("");
    setMaterialEditando(null);
    setModalAberto(false);
    setModalEdicao(false);
    setConjuntoIdSalvo(null);
    setIdsDoConjuntoAtual([]);
    toastSuccess("Nova ordem de compra iniciada! Tudo limpo e pronto!");
    window.scrollTo(0, 0);
  }, []);

  // ✅ FUNÇÃO QUE ESTAVA FALTANDO!
  const handleInputFornecedor = (titulo, valor, isSelect = false) => {
    let valorFormatado = valor;

    // Formata automaticamente o campo "Cond. Pagamento"
    if (titulo === "Cond. Pagamento") {
      valorFormatado = formatarPagamento(valor);
    }

    setDadosFornecedor((prev) => ({
      ...prev,
      [titulo]: valorFormatado,
      ...(isSelect && { [titulo + "Id"]: valor }),
    }));
  };

  // Handle input
  const handleInputChange = useCallback(
    (titulo, valor, isSelect = false, formatador = null) => {
      let valorFormatado = valor;
      if (formatador && !isSelect) valorFormatado = formatador(valor);

      // Formata automaticamente o campo "Cond. Pagamento"
      if (titulo === "Cond. Pagamento") {
        valorFormatado = formatarPagamento(valor);
      }

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

    setMaterialSelecionado(mat.estoqueId);
    setQuantidadeMaterial(mat.quantidade.toString());

    // ✅ AQUI ESTAVA FALTANDO
    setTipoCompra(mat.tipoCompra);

    setValoresInput({
      Descrição: mat.descricao,
      Rastreabilidade: mat.rastreabilidade,
      "Valor por Kg":
        mat.tipoCompra === "QUILO"
          ? mat.valorKg?.toString().replace(".", ",")
          : "",
      "Valor Unitário":
        mat.tipoCompra === "UNIDADE"
          ? mat.valorUnitario?.toString().replace(".", ",")
          : "",
      Total: mat.total,
      IPI: mat.ipiFormatado || "0,00",
    });

    setMaterialEditando({ ...mat, index });
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
      Descrição: "",
      Rastreabilidade: "",
      "Valor por Kg": "",
      "Valor por peça": "",
      "Valor Unitário": "",
      IPI: "",
      Total: "0,00",
    }));
  };

  // ✅ Nova função para salvar edição
  const salvarEdicao = () => {
    let temErro = false;

    // Valida todos os campos obrigatórios individualmente
    if (!materialSelecionado) {
      toastError("O campo Material é obrigatório.");
      temErro = true;
    }

    if (!quantidadeMaterial) {
      toastError("O campo Quantidade é obrigatório.");
      temErro = true;
    }

  if (!validarDescricao(valoresInput["Descrição"])) return;

if (!validarRastreabilidade(valoresInput["Rastreabilidade"])) return;

    // Regra específica: precisa ter pelo menos um dos dois
    if (
      (tipoCompra === "UNIDADE" && !valoresInput["Valor Unitário"]) ||
      (tipoCompra === "QUILO" && !valoresInput["Valor por Kg"])
    ) {
      toastError("Informe o valor de acordo com o tipo de compra.");
      return;
    }

    if (temErro) return;

    const index = materialEditando.index;

    // Impede duplicidade ao editar (não considera o próprio item sendo editado)
    if (
      materiaisSelecionados.some(
        (m, i) => i !== index && m.estoqueId === Number(materialSelecionado)
      )
    ) {
      toastError("Este material já foi adicionado");
      return;
    }

    const materialAtual = listaMateriais.find(
      (m) => m.id === Number(materialSelecionado)
    );

    const ipiAtual = materialAtual
      ? Number(materialAtual.ipi) || 0
      : materialEditando.ipi || 0;
    const ipiFormatadoAtual = materialAtual
      ? formatarIPI(materialAtual.ipi?.toString() || "0")
      : materialEditando.ipiFormatado || "0,00";

    const atualizado = {
      ...materialEditando,

      estoqueId: Number(materialSelecionado),
      quantidade: Number(quantidadeMaterial),
      tipoCompra, // ✅ ESSENCIAL

      descricao: valoresInput["Descrição"],
      rastreabilidade: valoresInput["Rastreabilidade"],

      valorKg:
        tipoCompra === "QUILO"
          ? Number((valoresInput["Valor por Kg"] || "0").replace(",", "."))
          : null,

      valorUnitario:
        tipoCompra === "UNIDADE"
          ? Number((valoresInput["Valor Unitário"] || "0").replace(",", "."))
          : null,

      total:
        tipoCompra === "QUILO"
          ? (
              Number((valoresInput["Valor por Kg"] || "0").replace(",", ".")) *
              Number(quantidadeMaterial)
            )
              .toFixed(2)
              .replace(".", ",")
          : (
              Number(
                (valoresInput["Valor Unitário"] || "0").replace(",", ".")
              ) * Number(quantidadeMaterial)
            )
              .toFixed(2)
              .replace(".", ","),

      ipi: ipiAtual,
      ipiFormatado: ipiFormatadoAtual,
    };

    setMateriaisSelecionados((prev) => {
      const copia = [...prev];
      copia[index] = atualizado;
      return copia;
    });

    setModalEdicao(false);
    toastSuccess("Material atualizado com sucesso!");
  };

  // ✅ Nova função para remover material
  const removerMaterial = (index) => {
    setMateriaisSelecionados((prev) => prev.filter((_, i) => i !== index));
    toastSuccess("Material removido com sucesso!");
  };

  const adicionarMaterial = () => {
    let temErro = false;

    // 🔸 Validação individual de cada campo
    if (!materialSelecionado) {
      toastError("O campo Material é obrigatório.");
      temErro = true;
    }

    if (!quantidadeMaterial) {
      toastError("O campo Quantidade é obrigatório.");
      temErro = true;
    }

   if (!validarDescricao(valoresInput["Descrição"])) return;

if (!validarRastreabilidade(valoresInput["Rastreabilidade"])) return;

    // 🔸 Se houver qualquer erro, interrompe a execução aqui
    if (temErro) return;

    const mat = listaMateriais.find(
      (m) => m.id === Number(materialSelecionado)
    );

    // 🔸 Impede duplicidade (usa `estoqueId` nos materiais já adicionados)
    if (materiaisSelecionados.some((m) => m.estoqueId === mat.id)) {
      toastError("Este material já foi adicionado");
      return;
    }

    // 🔸 Calcula o total antes de adicionar
    const valorUnit = parseFloat(
      (valoresInput["Valor Unitário"] || "0").replace(",", ".")
    );
    const qtd = parseInt(quantidadeMaterial);
    let totalCalculado = 0;

    if (tipoCompra === "UNIDADE") {
      totalCalculado = valorUnit * qtd;
    }

    if (tipoCompra === "QUILO") {
      const valorKg = parseFloat(
        (valoresInput["Valor por Kg"] || "0").replace(",", ".")
      );
      totalCalculado = valorKg * qtd;
    }

    const totalFormatado = totalCalculado.toFixed(2).replace(".", ",");

    // 🔸 Adiciona o material completo
    setMateriaisSelecionados((prev) => [
      ...prev,
      {
        estoqueId: Number(mat.id),
        tipoMaterial: mat.tipoMaterial,
        quantidade: Number(quantidadeMaterial),

        tipoCompra, // ✅ AQUI

        descricao: valoresInput["Descrição"],
        rastreabilidade: valoresInput["Rastreabilidade"].trim(),


        valorKg:
          tipoCompra === "QUILO"
            ? Number((valoresInput["Valor por Kg"] || "0").replace(",", "."))
            : null,

        valorUnitario:
          tipoCompra === "UNIDADE"
            ? Number((valoresInput["Valor Unitário"] || "0").replace(",", "."))
            : null,

        total: totalCalculado,

        ipi: Number(mat.ipi) || 0,
        ipiFormatado: formatarIPI(mat.ipi?.toString() || "0"),
      },
    ]);

    limparCamposModal();
    fecharModal();
    toastSuccess("Material adicionado com sucesso!");
  };

  const calcularTotal = () => {
    const quantidade = Number(quantidadeMaterial?.replace(",", ".") || 0);

    const valorUnitario = Number(
      valoresInput["Valor Unitário"]?.replace(",", ".") || 0
    );

    const valorKg = Number(
      valoresInput["Valor por Kg"]?.replace(",", ".") || 0
    );

    let total = 0;

    if (tipoCompra === "UNIDADE") {
      total = quantidade * valorUnitario;
    }

    if (tipoCompra === "QUILO") {
      total = quantidade * valorKg;
    }

    setValoresInput((prev) => ({
      ...prev,
      Total: total.toFixed(2).replace(".", ","),
    }));
  };
  useEffect(() => {
    calcularTotal();
  }, [
    quantidadeMaterial,
    valoresInput["Valor Unitário"],
    valoresInput["Valor por Kg"],
    tipoCompra,
  ]);

  // Finalizar ordem - CORRIGIDO: Envia array de ordens ao invés de objeto único

  const finalizarOrdemDeCompra = () => {
    const usuarioId = getUsuarioIdDoToken();

    if (!usuarioId) {
      toastError("Usuário não autenticado. Faça login novamente.");
      navigate("/");
      return;
    }

const ordensParaEnviar = materiaisSelecionados.map(mat => {
  const isQuilo = mat.tipoCompra === "QUILO";

  const ordem = {
    usuarioId,
    fornecedorId: Number(dadosFornecedor.FornecedorId),
    estoqueId: Number(mat.estoqueId),
    quantidade: Number(mat.quantidade),
    tipoCompra: mat.tipoCompra,
    descricaoMaterial: mat.descricao.substring(0, 100),
    rastreabilidade: mat.rastreabilidade.substring(0, 17),
    prazoEntrega: dadosFornecedor["Prazo de entrega"],
    condPagamento: dadosFornecedor["Cond. Pagamento"],
    ipi: Number(mat.ipi || 0),
    dataEmissao: new Date().toISOString().split("T")[0],
  };

  // adiciona apenas o campo correto
  if (isQuilo && mat.valorKg) ordem.valorKg = Number(mat.valorKg);
  if (!isQuilo && mat.valorUnitario) ordem.valorUnitario = Number(mat.valorUnitario);

  return ordem;
});



    if (ordensParaEnviar.length === 0) {
      toastError("Adicione pelo menos um material.");
      return;
    }

    console.log("Enviando ordens:", ordensParaEnviar);

    api
      .post("/ordemDeCompra/multiplas-ordens", ordensParaEnviar)
      .then((response) => {
        toastSuccess("Ordem de compra cadastrada com sucesso!");

        const ordensSalvas = Array.isArray(response.data)
          ? response.data
          : [response.data];
        const ids = ordensSalvas.map((o) => o.id);
        const numeroOC = ids[0];

        // SALVA OS DOIS: o número da OC e os IDs completos
        setConjuntoIdSalvo(numeroOC);
        setIdsDoConjuntoAtual(ids); // ← ESSA LINHA É A CHAVE

        // Gera PDF automaticamente com os IDs corretos
        baixarOrdemDeCompraPDF(numeroOC, ids);

        toastSuccess(`PDF da Ordem Nº ${numeroOC} gerado automaticamente!`);
        setProgresso(4);
      });
  };
  const image = etapas[progresso]?.imagem || progressoImg;

  return (
    <>
      <NavBar />
      <section className={style.ordemDeCompra}>
        <div className={style.progressoSecao}>
          <img
            src={etapas[progresso]?.imagem || progressoImg}
            alt="Progresso"
          />
        </div>
        <main className={style.formContent}>
          <h1 className={style.titulo}>
            {progresso === 4
              ? "FORMULÁRIO FINALIZADO COM SUCESSO!"
              : progresso === 3
              ? "RESUMO DA ORDEM DE COMPRA"
              : "ORDEM DE COMPRA"}
          </h1>

          {/* === Etapa 1: Inputs do formulário principal === */}
          {progresso === 1 && (
            <div className={style.inputs}>
              {etapas[1].inputs.map((input) => (
                <div key={input.id} className={style.inputGroup}>
                  <p>
                    {input.titulo}{" "}
                    {input.required && <span style={{ color: "red" }}>*</span>}
                  </p>
                  {input.tipo === "select" ? (
                    <select
                      value={dadosFornecedor[input.titulo + "Id"] || ""}
                      onChange={(e) =>
                        handleInputFornecedor(
                          input.titulo,
                          e.target.value,
                          true
                        )
                      }
                    >
                      <option value="">{input.placeholder}</option>
                      {input.options.map((opt) => (
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
                      value={dadosFornecedor[input.titulo] || ""}
                      onChange={(e) =>
                        handleInputFornecedor(input.titulo, e.target.value)
                      }
                      placeholder={input.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {/* === Etapa 2: Lista de Materiais e Modal === */}
          {progresso === 2 && (
            <>
              {materiaisSelecionados.length === 0 ? (
                <div className={style.estadoVazio}>
                  <p className={style.mensagemVazia}>
                    Nenhum material foi adicionado ainda.
                  </p>
                  <p className={style.mensagemSecundaria}>
                    Clique abaixo para cadastrar o primeiro material.
                  </p>
                  <button
                    onClick={abrirModal}
                    className={style.botaoAdicionarGrande}
                  >
                    <span className={style.iconeMais}>+</span> Adicionar
                    Material
                  </button>
                </div>
              ) : (
                <div className={style.tabelaContainer}>
                  <table className={style.tabelaMateriais}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Descrição</th>
                        <th>Qtd</th>
                        <th>Valor Unit./Kg</th>
                        <th>IPI</th>
                        <th>Total</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiaisSelecionados.map((mat, idx) => (
                        <tr key={idx}>
                          <td>{mat.tipoMaterial || "N/A"}</td>
                          <td>{mat.descricao}</td>
                          <td>{mat.quantidade}</td>
                          <td>
                            R${" "}
                            {Number(
                              mat.valorKg ?? mat.valorUnitario
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>

                          <td>{mat.ipiFormatado || "0,00%"}</td>
                          <td>R$ {mat.total}</td>
                          <td className={style.acoes}>
                            <button
                              className={style.btnEditar}
                              onClick={() => abrirModalEdicao(idx)}
                            >
                              Editar
                            </button>
                            <button
                              className={style.btnRemover}
                              onClick={() => removerMaterial(idx)}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* botão vai aparecer no canto inferior da tabela */}
                  <div className={style.wrapperBotaoTabela}>
                    <button
                      onClick={abrirModal}
                      className={style.botaoAdicionarTabela}
                    >
                      +
                    </button>
                  </div>
                </div>
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
                            setMaterialSelecionado(valor); // ← agora atualiza o estado correto!

                            // Atualiza o IPI automaticamente
                            const material = listaMateriais.find(
                              (m) => m.id === Number(valor)
                            );
                            if (material) {
                              handleInputChange(
                                "IPI",
                                formatarIPI(material.ipi?.toString() || "0")
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
                      <div className={style.inputGroup}>
                        <p>
                          Tipo de compra <span style={{ color: "red" }}>*</span>
                        </p>
                        <div className={style.radioGroup}>
                          <label className={style.radioLabel}>
                            <input
                              type="radio"
                              name="tipoCompra"
                              value="UNIDADE"
                              checked={tipoCompra === "UNIDADE"}
                              onChange={() => setTipoCompra("UNIDADE")}
                            />
                            <span className={style.radioCustom}></span>
                            Por unidade
                          </label>

                          <label className={style.radioLabel}>
                            <input
                              type="radio"
                              name="tipoCompra"
                              value="QUILO"
                              checked={tipoCompra === "QUILO"}
                              onChange={() => setTipoCompra("QUILO")}
                            />
                            <span className={style.radioCustom}></span>
                            Por quilo
                          </label>
                        </div>
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
                            setQuantidadeMaterial(
                              formatarQuantidade(e.target.value)
                            )
                          }
                        />
                      </div>

                      {/* Descrição do Material */}
                      <div className={style.inputGroup}>
                        <p>
                          Descrição do material{" "}
                          <span style={{ color: "red" }}>*</span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginLeft: "10px",
                            }}
                          >
                            ({(valoresInput["Descrição"] || "").length}/50)
                          </span>
                        </p>
                        <input
                          type="text"
                          placeholder="Ex: Parafuso galvanizado M6"
                          value={valoresInput["Descrição"] || ""}
                          maxLength={50}
                          onChange={(e) =>
                            handleInputChange("Descrição", e.target.value)
                          }
                        />
                      </div>

                      {/* Rastreabilidade */}
                      <div className={style.inputGroup}>
                        <p>
                          Rastreabilidade{" "}
                          <span style={{ color: "red" }}>*</span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginLeft: "10px",
                            }}
                          >
                            ({(valoresInput["Rastreabilidade"] || "").length}
                            /17)
                          </span>
                        </p>
                        <input
                          type="text"
                          placeholder="Ex: 21345-2015"
                          value={valoresInput["Rastreabilidade"] || ""}
                       onChange={(e) =>
  handleInputChange("Rastreabilidade", e.target.value)
}

                        />
                      </div>

                      {/* Valor por Kg */}
                      <div className={style.inputGroup}>
                        <p>Valor por Kg</p>
                        <input
                          type="text"
                          placeholder="Ex: 12,50"
                          disabled={tipoCompra !== "QUILO"}
                          value={valoresInput["Valor por Kg"] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "Valor por Kg",
                              formatarValorMonetario(e.target.value)
                            )
                          }
                        />
                      </div>

                      {/* Valor por peça */}
                      {/*     <div className={style.inputGroup}>
                          <p>Valor por peça</p>
                          <input
                            type="text"
                            placeholder="Ex: 5,00"
                            value={valoresInput["Valor por peça"] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "Valor por peça",
                                formatarValorMonetario(e.target.value)
                              )
                            }
                          />
                        </div> */}

                      {/* Valor Unitário */}
                      <div className={style.inputGroup}>
                        <p>
                          Valor Unitário <span style={{ color: "red" }}>*</span>
                        </p>
                        <input
                          type="text"
                          placeholder="Ex: 9,90"
                          disabled={tipoCompra !== "UNIDADE"}
                          value={valoresInput["Valor Unitário"] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "Valor Unitário",
                              formatarValorMonetario(e.target.value)
                            )
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
                          style={{
                            backgroundColor: "#f0f0f0",
                            cursor: "not-allowed",
                          }}
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
                        <p>
                          Material <span style={{ color: "red" }}>*</span>
                        </p>
                        <select
                          value={materialSelecionado}
                          // No modal de adição, no <select> onChange:
                          onChange={(e) => {
                            const valor = e.target.value;
                            setMaterialSelecionado(valor);
                            const material = listaMateriais.find(
                              (m) => m.id.toString() === valor.toString()
                            );
                            if (material) {
                              handleInputChange(
                                "IPI",
                                formatarIPI(material.ipi?.toString() || "0") // ← Atualiza IPI se mudar material
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
                      <div className={style.inputGroup}>
                        <p>
                          Tipo de compra <span style={{ color: "red" }}>*</span>
                        </p>

                        <div className={style.radioGroup}>
                          <label className={style.radioLabel}>
                            <input
                              type="radio"
                              name="tipoCompraEdicao"
                              value="UNIDADE"
                              checked={tipoCompra === "UNIDADE"}
                              onChange={() => setTipoCompra("UNIDADE")}
                            />
                            <span className={style.radioCustom}></span>
                            Por unidade
                          </label>

                          <label className={style.radioLabel}>
                            <input
                              type="radio"
                              name="tipoCompraEdicao"
                              value="QUILO"
                              checked={tipoCompra === "QUILO"}
                              onChange={() => setTipoCompra("QUILO")}
                            />
                            <span className={style.radioCustom}></span>
                            Por quilo
                          </label>
                        </div>
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
                            setQuantidadeMaterial(
                              formatarQuantidade(e.target.value)
                            )
                          }
                        />
                      </div>

                      {/* Descrição do Material */}
                      <div className={style.inputGroup}>
                        <p>
                          Descrição do material{" "}
                          <span style={{ color: "red" }}>*</span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginLeft: "10px",
                            }}
                          >
                            ({(valoresInput["Descrição"] || "").length}/50)
                          </span>
                        </p>
                        <input
                          type="text"
                          placeholder="Ex: Parafuso galvanizado M6"
                          value={valoresInput["Descrição"] || ""}
                          maxLength={50}
                          onChange={(e) =>
                            handleInputChange("Descrição", e.target.value)
                          }
                        />
                      </div>

                      {/* Rastreabilidade */}
                      <div className={style.inputGroup}>
                        <p>
                          Rastreabilidade{" "}
                          <span style={{ color: "red" }}>*</span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginLeft: "10px",
                            }}
                          >
                            ({(valoresInput["Rastreabilidade"] || "").length}
                            /17)
                          </span>
                        </p>
                        <input
                          type="text"
                          placeholder="Ex: 21345-2015"
                          value={valoresInput["Rastreabilidade"] || ""}
                        onChange={(e) =>
  handleInputChange("Rastreabilidade", e.target.value)
}

                        />
                      </div>

                      {/* Valor por Kg */}
                      <div className={style.inputGroup}>
                        <p>Valor por KG</p>
                        <input
                          type="text"
                          disabled={tipoCompra !== "QUILO"}
                          value={valoresInput["Valor por Kg"] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "Valor por Kg",
                              formatarValorMonetario(e.target.value)
                            )
                          }
                        />
                      </div>

                      {/* Valor por peça */}
                      {/* <div className={style.inputGroup}>
                          <p>Valor por peça</p>
                          <input
                            type="text"
                            placeholder="Ex: 5,00"
                            value={valoresInput["Valor por peça"] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "Valor por peça",
                                formatarValorMonetario(e.target.value)
                              )
                            }
                          />
                        </div> */}

                      {/* Valor Unitário */}
                      <div className={style.inputGroup}>
                        <p>Valor por Unidade</p>
                        <input
                          type="text"
                          disabled={tipoCompra !== "UNIDADE"}
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
                        <p>IPI (%)</p>
                        <input
                          type="text"
                          value={valoresInput["IPI"] || "0,00"}
                          disabled
                          style={{
                            backgroundColor: "#f0f0f0",
                            color: "#2c3e50",
                          }}
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
                          style={{
                            backgroundColor: "#f0f0f0",
                            cursor: "not-allowed",
                          }}
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
              <div className={style.resumoContainer}>
                {/* Informações do Fornecedor */}
                <div className={style.resumoSecao}>
                  <h2>Dados do Fornecedor</h2>
                  <p>
                    <strong>Fornecedor:</strong>{" "}
                    {listaFornecedores.find(
                      (f) =>
                        f.fornecedorId === Number(dadosFornecedor.FornecedorId)
                    )?.nomeFantasia || "N/A"}
                  </p>
                  <p>
                    <strong>Prazo de entrega:</strong>{" "}
                    {dadosFornecedor["Prazo de entrega"]
                      ? new Date(
                          dadosFornecedor["Prazo de entrega"]
                        ).toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </p>
                  <p>
                    <strong>Condição de Pagamento:</strong>{" "}
                    {dadosFornecedor["Cond. Pagamento"] || "Não informado"}
                  </p>
                </div>

                {/* Lista de Materiais */}
                <div className={style.resumoSecao} style={{ maxWidth: "80%" }}>
                  <h2>Materiais Selecionados</h2>
                  <table className={style.tabelaResumo}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Valor Unit./Kg</th>
                        <th>IPI</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiaisSelecionados.map((mat, idx) => (
                        <tr key={idx}>
                          <td>{mat.tipoMaterial}</td>
                          <td>{mat.descricao}</td>
                          <td>{mat.quantidade}</td>

                          <td>
                            R${" "}
                            {Number(
                              mat.tipoCompra === "QUILO"
                                ? mat.valorKg
                                : mat.valorUnitario
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>

                          <td>{mat.ipiFormatado || "0,00%"}</td>
                          <td>R$ {mat.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total Geral */}
                  <div className={style.totalGeral}>
                    <p>
                      <strong>Total Geral:</strong> R${" "}
                      {materiaisSelecionados
                        .reduce((acc, mat) => {
                          const valor =
                            typeof mat.total === "number"
                              ? mat.total
                              : Number((mat.total || "0").replace(",", "."));

                          return acc + valor;
                        }, 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  </div>
                </div>
              </div>
              {/* Botão de Download do PDF */}
              <div className={style.acoesPDF}>
                <button
                  className={style.botaoPDF}
                  onClick={() => {
                    const sucesso = gerarPDFPrevia(
                      dadosFornecedor,
                      materiaisSelecionados,
                      listaFornecedores
                    );
                    if (sucesso) {
                      toastSuccess("PDF de pré-visualização baixado!");
                    }
                  }}
                >
                  <img src={iconbaixar} alt="Baixar" />
                </button>
              </div>

              <p className={style.avisoConfirmacao}>
                ⚠️ Revise os dados acima. Ao clicar em "Finalizar", a ordem será
                registrada no sistema.
              </p>
            </div>
          )}
          {progresso === 4 && (
            <div className={style.finalizacaoWrapper}>
              <div className={style.containerAcoes}>
                {/* Área do PDF */}
                <div className={style.areaPDF}>
                  <button
                    className={style.botaoPDFGrande}
                    onClick={() =>
                      conjuntoIdSalvo &&
                      idsDoConjuntoAtual.length > 0 &&
                      baixarOrdemDeCompraPDF(
                        conjuntoIdSalvo,
                        idsDoConjuntoAtual
                      )
                    }
                    disabled={
                      !conjuntoIdSalvo || idsDoConjuntoAtual.length === 0
                    }
                  >
                    📄Baixar Ordem de Compra Final
                  </button>
                </div>

                {/* Área de navegação */}
                <div className={style.areaBotoes}>
                  <p className={style.subTexto}>
                    O que você deseja fazer agora?
                  </p>

                  <button onClick={reiniciar}>Nova Ordem de Compra</button>
                  <button onClick={() => navigate("/HistoricoOrdemDeCompra")}>
                    Histórico de OC's
                  </button>

                  <button onClick={() => navigate("/DashEstoque")}>
                    Dashboard Estoque
                  </button>

                  <button onClick={() => navigate("/Material")}>
                    Dashboard Materiais
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === Botões de navegação === */}
          <div
            className={style.botoes}
            style={{
              justifyContent:
                progresso === 1
                  ? "flex-end" // 👈 primeira etapa: botão "Avançar" à direita
                  : "space-between", // demais etapas: "Voltar" à esquerda e "Avançar" à direita
            }}
          >
            {progresso > 1 && progresso < 4 && (
              <button onClick={voltarProgresso}>Voltar</button>
            )}
            {progresso < 3 && (
              <button onClick={avancarProgresso}>Avançar</button>
            )}
            {progresso === 3 && (
              <button onClick={finalizarOrdemDeCompra}>Finalizar</button>
            )}
          </div>
        </main>
      </section>
    </>
  );
}

export default OrdemDeCompra;
