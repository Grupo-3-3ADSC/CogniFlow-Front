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
import {toastError,toastSuccess} from "../../components/toastify/ToastifyService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export function OrdemDeCompra() {
  const [listaFornecedores, setListaFornecedores] = useState([]);
  const [listaMateriais, setListaMateriais] = useState([]);
  const [ordemDeCompra, setOrdemDeCompra] = useState([]);

  function getFornecedores() {
    api
      .get("/fornecedores")
      .then((resposta) => {
        setListaFornecedores(resposta.data);
      })
      .catch((erro) => {
        toastError("Erro ao buscar usuários", erro);
      });
  }

  const navigate = useNavigate();
  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);

  function getUsuarioIdDoToken() {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.id; // ou decoded.sub ou decoded.usuarioId, dependendo do seu backend
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
      return null;
    }
  }

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
  }, []);

  function getMateriaPrima() {
    api
      .get("/estoque")
      .then((resposta) => {
        setListaMateriais(resposta.data);
      })
      .catch((erro) => {
        console.error("Erro ao buscar usuários", erro);
      });
  }

  useEffect(() => {
    getFornecedores();
    getMateriaPrima();
  }, []);

  const [progresso, setProgresso] = useState(1);
  const [valoresInput, setValoresInput] = useState({});
  const [errosValidacao, setErrosValidacao] = useState({});

  // Funções de formatação
  const formatarIE = (valor) => {
    const nums = valor.replace(/\D/g, "");
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9)
      return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(
      6,
      9
    )}.${nums.slice(9, 12)}`;
  };

  const formatarPagamento = (valor) => {
    const nums = valor.replace(/\D/g, "");
    if (nums.length === 0) return "";
    if (nums.length <= 2) return `${nums} dias`;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)} dias`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)} dias`;
  };

  // Função de formatação corrigida para valores monetários
  const formatarValorMonetario = (valor) => {
    const nums = valor.replace(/[^\d]/g, "");
    if (nums.length === 0) return "";

    // Converte para número e formata corretamente
    const numero = parseInt(nums);
    if (numero === 0) return "";

    // Se tem apenas 1 dígito, trata como centavos
    if (nums.length === 1) return `0,0${nums}`;
    // Se tem 2 dígitos, trata como centavos
    if (nums.length === 2) return `0,${nums}`;

    // Para mais de 2 dígitos, separa os centavos
    const inteiros = nums.slice(0, -2);
    const decimais = nums.slice(-2);

    // Remove zeros à esquerda dos inteiros
    const inteirosLimpos = inteiros.replace(/^0+/, "") || "0";

    // Adiciona separadores de milhares
    const inteirosFormatados = inteirosLimpos.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

    return `${inteirosFormatados},${decimais}`;
  };

  // CORREÇÃO: Limitando o campo de rastreabilidade a 20 caracteres
  const formatarRastreio = (valor) => {
    const formatted = valor.toUpperCase().replace(/[^A-Z0-9\-\/]/g, "");
    return formatted.substring(0, 20); // Limite de 20 caracteres
  };

  const formatarIPI = (valor) => {
    const nums = valor.replace(/[^\d,]/g, "");
    if (nums.includes(",")) {
      const partes = nums.split(",");
      return `${partes[0]},${partes[1].slice(0, 2)}`;
    }
    return nums ? `${nums}` : "";
  };

  const formatarQuantidade = (valor) => {
    return valor.replace(/\D/g, "");
  };

  const validarCamposValor = (valoresInput) => {
    const valorKg = valoresInput["Valor por Kg"];
    const valorPeca = valoresInput["Valor por peça"];

    // Se nenhum dos dois estiver preenchido, ambos são obrigatórios
    if (!valorKg && !valorPeca) {
      return {
        "Valor por Kg": "Preencha o valor por Kg OU o valor por peça",
        "Valor por peça": "Preencha o valor por Kg OU o valor por peça",
      };
    }

    return {}; // Nenhum erro se pelo menos um estiver preenchido
  };

  // Configuração das etapas otimizada
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
            id: "ie",
            titulo: "I.E",
            tipo: "text",
            placeholder: "Ex: 123.456.789.000",
            pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}\\.\\d{3}$",
            required: true,
            validationMessage:
              "Inscrição estadual inválida. Use: 123.456.789.000",
            formatador: formatarIE,
          },
          {
            id: "pagamento",
            titulo: "Cond. Pagamento",
            tipo: "text",
            placeholder: "Ex: 30 dias ou 30/60 dias",
            pattern: "^\\d{1,3}(\\/\\d{1,3})?\\s?dias?$",
            required: true,
            validationMessage: "Use formato: 30 dias ou 30/60 dias",
            color: "black",
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
            pattern: "^[A-Za-z0-9\\-\\/]{16,20}$", // CORREÇÃO: Limite ajustado para 20
            required: true,
            validationMessage:
              "Código inválido. Use 16-20 caracteres alfanuméricos.", // CORREÇÃO: Mensagem atualizada
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
            placeholder: "Escolha o material desejado",
            validationMessage: "Selecione um material válido.",
          },
          {
            id: "valorpeca",
            titulo: "Valor por peça",
            tipo: "double",
            placeholder: "Preço unitário da peça (Ex: 5,00)",
            pattern: "^\\d+([,.]\\d{1,2})?$",
            required: false, // Não é mais sempre obrigatório
            validationMessage: "Valor inválido. Use formato: 5,00",
            formatador: formatarValorMonetario,
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
        ],
        imagem: progressoConcluido,
      },
      3: {
        inputs: [
          {
            id: "valorunit",
            titulo: "Valor Unitário",
            tipo: "text",
            placeholder: "Valor final por unidade (Ex: 9,90)",
            pattern: "^\\d+([,.]\\d{1,2})?$",
            required: true,
            validationMessage: "Valor inválido. Use formato: 9,90",
            formatador: formatarValorMonetario,
          },
          {
            id: "ipi",
            titulo: "IPI",
            tipo: "text",
            placeholder: "Percentual do imposto (Ex: 12)",
            pattern: "^\\d{1,2}([,.]\\d{1,2})?%?$",
            required: true,
            validationMessage: "IPI inválido. Use números",
            formatador: formatarIPI,
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
            id: "total",
            titulo: "Total",
            tipo: "text",
            placeholder: "Valor calculado automaticamente",
            disabled: true,
          },
        ],
        imagem: progresso2Concluido,
      },
      4: {
        inputs: [],
        imagem: progresso3Concluido,
      },
    }),
    [listaFornecedores, listaMateriais]
  );

  // Estados derivados
  const image = etapas[progresso]?.imagem || progressoImg;
  const titulo =
    progresso === 4 ? "FORMULÁRIO FINALIZADO COM SUCESSO!" : "ORDEM DE COMPRA";
  const nomeBotao = progresso === 3 ? "FINALIZAR" : "PRÓXIMO";

  // Fetch data (comentado para usar dados mockados)
  const fetchData = useCallback(async () => {
    try {
      // Simulando carregamento da API
      console.log("Usando dados mockados...");

      // Descomente as linhas abaixo quando quiser usar a API real:
      // const [fornecedores, materiais] = await Promise.all([
      //   api.get("/fornecedores/listarFornecedorCompleto"),
      //   api.get("/estoque")
      // ]);
      // setListaFornecedores(fornecedores.data);
      // setListaMateriais(materiais.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CORREÇÃO: Cálculo automático do total incluindo quantidade
  useEffect(() => {
    const valorUnit =
      parseFloat((valoresInput["Valor Unitário"] || "").replace(",", ".")) || 0;
    const quantidade = parseInt(valoresInput["Quantidade"] || "0") || 0;
    const total = valorUnit * quantidade;

    if (total > 0) {
      setValoresInput((prev) => ({
        ...prev,
        Total: total.toFixed(2).replace(".", ","),
      }));
    } else {
      setValoresInput((prev) => ({ ...prev, Total: "" }));
    }
  }, [valoresInput["Valor Unitário"], valoresInput["Quantidade"]]);

  // Validação
  const validarCampo = useCallback((input, valor) => {
    if (!input.required) return { valido: true };

    if (!valor || valor.trim() === "") {
      return { valido: false, erro: `${input.titulo} é obrigatório` };
    }

    if (input.pattern && !new RegExp(input.pattern).test(valor)) {
      return { valido: false, erro: input.validationMessage };
    }

    return { valido: true };
  }, []);

  const validarFormulario = useCallback(() => {
    const inputs = etapas[progresso]?.inputs || [];
    const novosErros = {};
    let temErro = false;
    let mensagensErro = []; // Array para coletar mensagens de erro

    // Validação especial para campos de valor na etapa 2
    if (progresso === 2) {
      const errosValor = validarCamposValor(valoresInput);
      Object.assign(novosErros, errosValor);
      if (Object.keys(errosValor).length > 0) {
        temErro = true;
        // Adicionar mensagens de erro dos campos de valor
        Object.values(errosValor).forEach((erro) => {
          if (erro && !mensagensErro.includes(erro)) {
            mensagensErro.push(erro);
          }
        });
      }
    }

    for (let input of inputs) {
      if (input.titulo === "Total" && input.disabled) continue;

      // Validação específica para prazo de entrega (não pode ser anterior a hoje)
      if (input.titulo === "Prazo de entrega") {
        const dataHoje = new Date();
        dataHoje.setHours(0, 0, 0, 0); // Zera hora para comparação só da data

        const dataInput = new Date(valoresInput["Prazo de entrega"]);
        dataInput.setHours(0, 0, 0, 0);

        if (dataInput < dataHoje) {
          const erroMsg =
            "A data do prazo de entrega não pode ser anterior a hoje.";
          novosErros["Prazo de entrega"] = erroMsg;
          temErro = true;
          if (!mensagensErro.includes(erroMsg)) {
            mensagensErro.push(erroMsg);
          }
        }
      }

      // Pula validação de obrigatoriedade para campos de valor se o outro estiver preenchido
      if (
        progresso === 2 &&
        (input.titulo === "Valor por Kg" || input.titulo === "Valor por peça")
      ) {
        const valorKg = valoresInput["Valor por Kg"];
        const valorPeca = valoresInput["Valor por peça"];

        // Se um dos campos estiver preenchido, o outro não é obrigatório
        if (
          (input.titulo === "Valor por Kg" && valorPeca) ||
          (input.titulo === "Valor por peça" && valorKg)
        ) {
          continue;
        }
      }

      const valor =
        input.tipo === "select"
          ? valoresInput[input.titulo + "Id"]
          : valoresInput[input.titulo];

      const validacao = validarCampo(input, valor);
      if (!validacao.valido && !novosErros[input.titulo]) {
        novosErros[input.titulo] = validacao.erro;
        temErro = true;
        // Adicionar mensagem de erro única
        if (!mensagensErro.includes(validacao.erro)) {
          mensagensErro.push(validacao.erro);
        }
      }
    }

    // Validação de segurança
    const sqlPattern =
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
    const scriptPattern = /<script.*?>.*?<\/script>/gi;

    for (let input of inputs) {
      const valor = valoresInput[input.titulo];
      if (typeof valor === "string") {
        if (sqlPattern.test(valor)) {
          const erroMsg = "Comandos SQL não são permitidos";
          novosErros[input.titulo] = erroMsg;
          temErro = true;
          if (!mensagensErro.includes(erroMsg)) {
            mensagensErro.push(erroMsg);
          }
          break;
        }
        if (scriptPattern.test(valor)) {
          const erroMsg = "Scripts não são permitidos";
          novosErros[input.titulo] = erroMsg;
          temErro = true;
          if (!mensagensErro.includes(erroMsg)) {
            mensagensErro.push(erroMsg);
          }
          break;
        }
      }
    }

    // Exibir toastError para cada mensagem de erro única
    if (mensagensErro.length > 0) {
      mensagensErro.forEach((mensagem) => {
        toastError(mensagem);
      });
    }

    setErrosValidacao(novosErros);
    return !temErro;
  }, [progresso, etapas, valoresInput, validarCampo]);

  // CORREÇÃO: Finalizar ordem - simulando sucesso para chegar na tela 4
  const finalizarOrdemDeCompra = useCallback(async () => {
    const usuarioId = getUsuarioIdDoToken();
    console.log(Number(valoresInput["MaterialId"]));
    const dadosApi = {
      usuarioId: getUsuarioIdDoToken(),
      fornecedorId: Number(valoresInput["FornecedorId"]), // ✅
      prazoEntrega: valoresInput["Prazo de entrega"],
      ie: (valoresInput["I.E"] || "").replace(/\./g, ""),
      condPagamento: valoresInput["Cond. Pagamento"],
      valorKg: parseFloat(valoresInput["Valor por Kg"]?.replace(",", ".") || 0),
      rastreabilidade: valoresInput["Rastreabilidade"],
      estoqueId: Number(valoresInput["MaterialId"]),
      valorPeca: parseFloat(
        valoresInput["Valor por peça"]?.replace(",", ".") || 0
      ),
      descricaoMaterial: valoresInput["Descrição do material"],
      valorUnitario: parseFloat(
        valoresInput["Valor Unitário"]?.replace(",", ".") || 0
      ),
      ipi: parseFloat(valoresInput["IPI"]?.replace(",", ".") || 0),
      quantidade: parseInt(valoresInput["Quantidade"] || 0),
    };
    // console.log(dadosApi);
    // console.log("listaMateriais", listaMateriais);
    // console.log("valoresInput", valoresInput);

    api
      .post("/ordemDeCompra", dadosApi)
      .then((res) => {
        const novaId = res?.data?.id;

        if (!novaId || isNaN(novaId)) {
          console.error("ID inválido retornado:", res?.data);
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
        // console.error("Erro ao criar ordem:", err);
        toastError(err.response.data?.message || "Erro ao criar ordem de compra");
        setErrosValidacao({
          geral: "Erro ao criar ordem de compra. Verifique os dados.",
        });
      });
  }, [valoresInput]);

  // Navegação
  const avancarProgresso = useCallback(() => {
    if (!validarFormulario()) return;

    if (progresso === 3) {
      finalizarOrdemDeCompra();
    } else {
      setProgresso((prev) => prev + 1);
    }
  }, [progresso, validarFormulario, finalizarOrdemDeCompra]);

  const voltarProgresso = useCallback(() => {
    if (progresso > 1) {
      setProgresso((prev) => prev - 1);
      setErrosValidacao({});
    }
  }, [progresso]);

  const reiniciar = useCallback(() => {
    setProgresso(1);
    setValoresInput({});
    setErrosValidacao({});
  }, []);

  const handleInputChange = useCallback(
    (titulo, valor, isSelect = false, formatador = null) => {
      let valorFormatado = valor;

      // Aplicar formatação se existir
      if (formatador && !isSelect) {
        valorFormatado = formatador(valor);
      }

      setValoresInput((prev) => {
        const newState = {
          ...prev,
          [titulo]: valorFormatado,
          ...(isSelect && { [titulo + "Id"]: valor }),
        };

        return newState;
      });

      // Limpar erros (manter apenas para lógica interna, não para exibição)
      if (errosValidacao[titulo]) {
        setErrosValidacao((prev) => ({ ...prev, [titulo]: "" }));
      }
    },
    [errosValidacao]
  );

  // Geração de documentos (versão simplificada)
  function baixarPDF() {
    const doc = new jsPDF();

    const corPrimaria = [41, 128, 185];
    const corSecundaria = [149, 165, 166];
    const corTexto = [44, 62, 80];

    const fornecedorDetalhes = listaFornecedores.find(
      (f) => f.fornecedorId === parseInt(valoresInput["FornecedorId"])
    );

    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(`MegaPlate LTDA`, 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");


    doc.setFillColor(240, 240, 240);
    doc.rect(140, 40, 65, 25, "F");
    doc.setTextColor(...corTexto);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ordem De Compra:", 145, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Nº ${ordemDeCompra.id}`, 145, 58);

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString("pt-BR");
    const horaFormatada = dataAtual.toLocaleTimeString("pt-BR");
    doc.text(`Data: ${dataFormatada}`, 20, 50);
    doc.text(`Hora: ${horaFormatada}`, 20, 58);

    doc.setDrawColor(...corSecundaria);
    doc.setLineWidth(0.5);
    doc.line(20, 70, 190, 70);

    doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("DADOS DO FORNECEDOR", 20, 80);

let posicaoY = 90;
doc.setFontSize(10);
doc.setFont("helvetica", "normal");

if (fornecedorDetalhes) {
  doc.text(`Nome: ${fornecedorDetalhes.nomeFantasia}`, 20, posicaoY); posicaoY += 6;
  if (fornecedorDetalhes.cnpj) {
    doc.text(`CNPJ: ${fornecedorDetalhes.cnpj}`, 20, posicaoY); posicaoY += 6;
  }
  if (fornecedorDetalhes.complemento) {
    doc.text(`Endereço: ${fornecedorDetalhes.complemento}`, 20, posicaoY); posicaoY += 6;
  }
  if (valoresInput["I.E"]) {
    doc.text(`I.E: ${valoresInput["I.E"]}`, 20, posicaoY); posicaoY += 6;
  }
} else {
  doc.text("Fornecedor não encontrado", 20, posicaoY);
  posicaoY += 6;
}

posicaoY += 10;
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("DADOS DA COMPRA", 20, posicaoY);

posicaoY += 8;
doc.setFont("helvetica", "normal");
doc.setFontSize(10);

const prazoEntrega = new Date(valoresInput["Prazo de entrega"]).toLocaleDateString("pt-BR");
doc.text(`Prazo de entrega: ${prazoEntrega}`, 20, posicaoY); posicaoY += 6;

doc.text(`Condição de pagamento: ${valoresInput["Cond. Pagamento"]}`, 20, posicaoY); posicaoY += 6;

const valorPeca = parseFloat(valoresInput["Valor por peça"]?.replace(",", ".") || 0);
const valorKg = parseFloat(valoresInput["Valor por Kg"]?.replace(",", ".") || 0);

if (valorPeca > 0) {
  doc.text(`Valor por peça: R$ ${valorPeca.toFixed(2).replace(".", ",")}`, 20, posicaoY); posicaoY += 6;
}
if (valorKg > 0) {
  doc.text(`Valor por Kg: R$ ${valorKg.toFixed(2).replace(".", ",")}`, 20, posicaoY); posicaoY += 6;
}

    posicaoY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DESCRIÇÃO DOS MATERIAIS", 20, posicaoY);

    posicaoY += 10;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, posicaoY - 5, 170, 10, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("ITEM", 25, posicaoY);
    doc.text("DESCRIÇÃO", 45, posicaoY);
    doc.text("QTD", 120, posicaoY);
    doc.text("VALOR UNIT.", 140, posicaoY);
    doc.text("TOTAL", 170, posicaoY);

    const materialSelecionado = listaMateriais.find(
      (m) => m.id === parseInt(valoresInput["MaterialId"])
    );

    const item = "001";
    const descricao =
      materialSelecionado?.tipoMaterial || "Material não encontrado";
    const quantidade = parseFloat(valoresInput["Quantidade"]) || 0;
    const valorUnitario = parseFloat(valoresInput["Valor Unitário"]) || 0;
    const total =
      parseFloat(valoresInput["Total"]) || valorUnitario * quantidade;
    const ipi = parseFloat(valoresInput["IPI"]?.replace(",", ".") || 0);


    posicaoY += 10;
    doc.setFont("helvetica", "normal");
    doc.text(item, 25, posicaoY);
    doc.text(descricao.substring(0, 25), 45, posicaoY);
    doc.text(quantidade.toString(), 120, posicaoY);
    doc.text(`R$ ${valorUnitario.toFixed(2).replace(".", ",")}`, 140, posicaoY);
    doc.text(`R$ ${total.toFixed(2).replace(".", ",")}`, 170, posicaoY);
    doc.line(20, posicaoY + 3, 190, posicaoY + 3);

    posicaoY += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(130, posicaoY - 5, 60, 25, "F");

    const totalGeral = total + ipi;

    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL:", 135, posicaoY);
    doc.text(`R$ ${total.toFixed(2).replace(".", ",")}`, 170, posicaoY);

    doc.text(`IPI:`, 135, posicaoY + 8);
    doc.text(`R$ ${ipi.toFixed(2).replace(".", ",")}`, 170, posicaoY + 8);

    doc.setFontSize(11);
    doc.text("TOTAL GERAL:", 135, posicaoY + 16);
    doc.text(
      `R$ ${totalGeral.toFixed(2).replace(".", ",")}`,
      170,
      posicaoY + 16
    );

if (valoresInput["Rastreabilidade"]) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("RASTREABILIDADE", 20, posicaoY);
  posicaoY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Código: ${valoresInput["Rastreabilidade"]}`, 20, posicaoY);
  posicaoY += 10;
}

    posicaoY += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 20, posicaoY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const observacoes = [
      "• Documento gerado automaticamente pelo sistema",
      "• Válido como comprovante de compra",
      "• Para dúvidas, entre em contato conosco",
    ];
    observacoes.forEach((obs, index) => {
      doc.text(obs, 20, posicaoY + 8 + index * 6);
    });

    const alturaRodape = 275;
    doc.setFillColor(...corPrimaria);
    doc.rect(0, alturaRodape, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Documento gerado em " + new Date().toLocaleString("pt-BR"), 20, alturaRodape + 8);
doc.text("www.megaplate.com.br | vendas@megaplate.com.br", 20, alturaRodape + 14);
doc.text(`www.${fornecedorDetalhes.nomeFantasia.toLowerCase()}.com.br | contato@${fornecedorDetalhes.nomeFantasia.toLowerCase()}.com.br`, 20, alturaRodape + 20);

    const nomeArquivo = `ordem_de_compra_${
      ordemDeCompra.id
    }_${dataFormatada.replace(/\//g, "-")}.pdf`;
    doc.save(nomeArquivo);
  }

  async function baixarExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ordem de Compra");

    const fornecedor = ordemDeCompra.fornecedor;

    const fornecedorDetalhes = listaFornecedores.find(
      (f) => f.fornecedorId === parseInt(valoresInput["FornecedorId"])
    );

    const corPrimaria = "2A80B9"; // Azul
    const corSecundaria = "95A5A6"; // Cinza
    const corTexto = "2C3E50";

    sheet.mergeCells("A1:E1");

    sheet.getCell("A1").value = `MegaPlate LTDA`;

    sheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: corPrimaria },
    };
    sheet.getCell("A1").font = {
      color: { argb: "FFFFFF" },
      bold: true,
      size: 16,
    };
    sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };

    sheet.addRow([]);

    if (fornecedor || fornecedorDetalhes) {
      sheet.addRow([
        `CNPJ: ${fornecedorDetalhes?.cnpj || "N/A"}`,
        "",
        "",
        `Endereço: ${fornecedorDetalhes.complemento || "N/A"}`,
      ]);
      sheet.addRow([`Telefone: ${fornecedorDetalhes.telefone || "N/A"}`]);
    } else {
      sheet.addRow(["Dados do fornecedor não disponíveis"]);
    }

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString("pt-BR");
    const horaFormatada = dataAtual.toLocaleTimeString("pt-BR");

    sheet.addRow([]);
    sheet.addRow([`Ordem de Compra Nº: ${ordemDeCompra.id}`]);
    sheet.addRow([`Data: ${dataFormatada}`, `Hora: ${horaFormatada}`]);

    sheet.addRow([]);
    sheet.addRow(["DADOS DO FORNECEDOR"]);
    sheet.getCell(`A${sheet.lastRow.number}`).font = { bold: true, size: 12 };

    if (fornecedor || fornecedorDetalhes) {
      sheet.addRow([`Nome: ${fornecedorDetalhes?.nomeFantasia}`]);
      if (fornecedorDetalhes?.cnpj)
        sheet.addRow([`CNPJ: ${fornecedorDetalhes?.cnpj}`]);
      if (fornecedorDetalhes.complemento)
        sheet.addRow([`Endereço: ${fornecedorDetalhes.complemento}`]);
    } else {
      sheet.addRow(["Fornecedor não encontrado"]);
    }

    sheet.addRow([]);
    sheet.addRow(["DESCRIÇÃO DOS MATERIAIS"]);
    sheet.getCell(`A${sheet.lastRow.number}`).font = { bold: true, size: 12 };

    // Cabeçalho da tabela
    const header = ["ITEM", "DESCRIÇÃO", "QTD", "VALOR UNIT.", "TOTAL"];
    const headerRow = sheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F0F0F0" },
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Dados do material
    const material = listaMateriais.find(
      (m) => m.id === parseInt(valoresInput["MaterialId"])
    );
    const descricao = material?.tipoMaterial || "Material não encontrado";
    const quantidade = parseFloat(valoresInput["Quantidade"]) || 0;
    const valorUnit = parseFloat(valoresInput["Valor Unitário"]) || 0;
    const total = parseFloat(valoresInput["Total"]) || valorUnit * quantidade;
    const ipi = parseFloat(valoresInput["IPI"]) || 0;
    const totalGeral = total + ipi;

    sheet.addRow([
      "001",
      descricao.substring(0, 50),
      quantidade,
      `R$ ${valorUnit.toFixed(2).replace(".", ",")}`,
      `R$ ${total.toFixed(2).replace(".", ",")}`,
    ]);

    sheet.addRow([]);
    sheet.addRow([
      "SUBTOTAL:",
      "",
      "",
      "",
      `R$ ${total.toFixed(2).replace(".", ",")}`,
    ]);
    sheet.addRow([
      "IPI:",
      "",
      "",
      "",
      `R$ ${ipi.toFixed(2).replace(".", ",")}`,
    ]);
    sheet.addRow([
      "TOTAL GERAL:",
      "",
      "",
      "",
      `R$ ${totalGeral.toFixed(2).replace(".", ",")}`,
    ]);

    sheet.addRow([]);
    sheet.addRow(["OBSERVAÇÕES:"]);
    sheet.getCell(`A${sheet.lastRow.number}`).font = { bold: true };
    const observacoes = [
      "• Documento gerado automaticamente pelo sistema",
      "• Válido como comprovante de compra",
      "• IPI calculado conforme percentual informado",
      "• Para dúvidas, entre em contato conosco",
    ];
    observacoes.forEach((obs) => sheet.addRow([obs]));

    sheet.addRow([]);
    sheet.addRow([
      `Documento gerado em ${new Date().toLocaleString("pt-BR")}`,
      "",
      "",
      "",
      "www.megaplate.com.br | vendas@megaplate.com.br",
    ]);

    // Ajustar largura das colunas
    sheet.columns.forEach((col) => {
      col.width = 25;
    });

    // Gerar o arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const nomeArquivo = `ordem_de_compra_${
      ordemDeCompra.id
    }_${dataFormatada.replace(/\//g, "-")}.xlsx`;
    saveAs(new Blob([buffer]), nomeArquivo);
  }

  async function baixarDocumentos() {
    baixarPDF();
    await baixarExcel();
    window.location.reload();
  }

  return (
    <>
      <NavBar />
      <section className={style.ordemDeCompra}>
        <div className={style.progressoSecao}>
          <img src={image} alt="Progresso" />
        </div>

        <main className={style.formContent}>
          <span className={style.spanTitulo}>
            <h1>{titulo}</h1>
          </span>

          <div className={style.inputs}>
            {etapas[progresso]?.inputs.map((input) => (
              <div key={input.id} className={style.inputGroup}>
                <p>
                  {input.titulo}{" "}
                  {input.required && <span style={{ color: "red" }}>*</span>}
                </p>
                {input.tipo === "select" ? (
                  <select
                    value={valoresInput[input.titulo + "Id"] || ""}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setValoresInput((prev) => ({
                        ...prev,
                        [input.titulo]:
                          input.options.find(
                            (opt) => String(opt[input.optionValue]) === valor
                          )?.[input.optionLabel] || "",
                        [input.titulo + "Id"]: valor,
                      }));
                    }}
                    style={
                      errosValidacao[input.titulo] ? { borderColor: "red" } : {}
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
                    placeholder={input.placeholder}
                    value={valoresInput[input.titulo] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        input.titulo,
                        e.target.value,
                        false,
                        input.formatador
                      )
                    }
                    disabled={input.disabled}
                    style={
                      errosValidacao[input.titulo] ? { borderColor: "red" } : {}
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {progresso === 4 && (
            <div className={style.botaoPdf}>
              <button onClick={baixarDocumentos}>BAIXAR ORDEM DE COMPRA</button>
            </div>
          )}
        </main>

        <div className={style.botoes}>
          {progresso > 1 && progresso < 4 && (
            <button onClick={voltarProgresso}>VOLTAR</button>
          )}

          {progresso < 4 && (
            <button onClick={avancarProgresso}>{nomeBotao}</button>
          )}

          {progresso === 4 && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={reiniciar}>CRIAR NOVA ORDEM DE COMPRA</button>
              <button onClick={() => navigate("/Material")}>
                IR PARA DASHBOARD
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default OrdemDeCompra;
