import style from "./ordemDeCompra.module.css";
import progressoImg from "../../assets/progressoOrdemDeCompra.png";
import progressoConcluido from "../../assets/progresso1Concluido.png";
import progresso2Concluido from "../../assets/progresso2Concluido.png";
import progresso3Concluido from "../../assets/progresso3Concluido.png";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { api } from "../../provider/api"; // Descomente para integração real
// import { jwtDecode } from "jwt-decode"; // Descomente para integração real
import NavBar from "../../components/NavBar";
import {toastError,toastSuccess} from "../../components/toastify/ToastifyService";
// import baixarOrdemDeCompraPDF from "../../tools/baixarOrdemDeCompraPDF"; // Descomente se usar

export function OrdemDeCompra() {
  const [listaFornecedores, setListaFornecedores] = useState([]);
  const [listaMateriais, setListaMateriais] = useState([]);
  const [ordemDeCompra, setOrdemDeCompra] = useState({}); 

  const navigate = useNavigate();
  
  // Mocks para rodar o app sem o backend completo
  const mockFornecedores = [
    {
      fornecedorId: 1,
      nomeFantasia: "Fornecedor A (USIMINAS)",
      razaoSocial: "Razão Social Fornecedor A",
      cnpj: "12.345.678/0001-90",
    },
    {
      fornecedorId: 2,
      nomeFantasia: "Fornecedor B (Votorantim)",
      razaoSocial: "Razão Social Fornecedor B",
      cnpj: "98.765.432/0001-11",
    },
    {
      fornecedorId: 3,
      nomeFantasia: "Fornecedor C (ArcelorMittal)",
      razaoSocial: "Razão Social Fornecedor C",
      cnpj: "11.223.344/0001-22",
    },
  ];
  
  const mockMateriais = [
    {
      id: 1,
      tipoMaterial: "SAE 1045",
      descricao: "Aço carbono SAE 1045 para construção.",
    },
    {
      id: 2,
      tipoMaterial: "SAE 1020",
      descricao: "Aço carbono SAE 1020 com baixo teor de carbono.",
    },
    {
      id: 3,
      tipoMaterial: "HARDOX",
      descricao: "Chapa Hardox 500 de alta resistência à abrasão.",
    },
  ];
  
  useEffect(() => {
    setListaFornecedores(mockFornecedores); 
  }, []);
  
  useEffect(() => {
    setListaMateriais(mockMateriais); 
  }, []);
  
  // --- Estados de Controle ---
  const [progresso, setProgresso] = useState(1);
  const [valoresInput, setValoresInput] = useState({});
  const [errosValidacao, setErrosValidacao] = useState({});

  // --- Funções de Formatação ---
  const formatarPagamento = (valor) => {
    const nums = valor.replace(/\D/g, "");
    if (nums.length === 0) return "";
    if (nums.length <= 2) return `${nums} dias`;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)} dias`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)} dias`;
  };

  const formatarValorMonetario = (valor) => {
    // Remove caracteres não numéricos, exceto a vírgula/ponto para o formato
    let nums = valor.replace(/[^\d,]/g, "");

    // Garante que apenas a última vírgula seja mantida, substituindo outras
    let parts = nums.split(',');
    if (parts.length > 2) {
        // Se houver mais de uma vírgula, usa apenas os números
        nums = nums.replace(/,/g, '');
        parts = [nums];
    } else if (parts.length === 2) {
        // Limita os decimais a 2
        parts[1] = parts[1].substring(0, 2);
        nums = parts.join(',');
    }

    // Remove todos os caracteres não numéricos e transforma em um número para formatar
    const numSemVirgula = nums.replace(/,/g, '');
    if (numSemVirgula.length === 0) return "";

    // Converte para centavos para trabalhar com a formatação
    const numero = parseInt(numSemVirgula);
    if (numero === 0) return "0,00";

    let inteiros = numSemVirgula.slice(0, -2);
    let decimais = numSemVirgula.slice(-2);

    if (numSemVirgula.length <= 2) {
      inteiros = "0";
      decimais = numSemVirgula.padStart(2, '0').slice(-2);
    }

    const inteirosLimpos = inteiros.replace(/^0+/, "") || "0";

    const inteirosFormatados = inteirosLimpos.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

    return `${inteirosFormatados},${decimais}`;
  };

  const formatarRastreio = (valor) => {
    const formatted = valor.toUpperCase().replace(/[^A-Z0-9\-\/]/g, "");
    return formatted.substring(0, 20); 
  };

  const formatarQuantidade = (valor) => {
    return valor.replace(/\D/g, "");
  };
  
  // --- Configuração das Etapas (Memoizado) ---
  const etapas = useMemo(
    () => ({
      1: {
        inputs: [
          {
            id: "fornecedor",
            titulo: "Fornecedor",
            tipo: "select",
            options: mockFornecedores,
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
            pattern: "^\\d{1,3}(/\\d{1,3})?(\\s?dias?)?$", // Atualizado o regex para ser mais robusto, aceitando com ou sem "dias"
            required: true,
            validationMessage: "Use formato: 30 dias ou 30/60 dias. Máximo 3 dígitos por prazo.",
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
            pattern: "^\\d+(\\.\\d{3})*([,]\\d{1,2})?$", // Para aceitar formato monetário pt-BR (ponto milhar, vírgula decimal)
            required: false, 
            validationMessage: "Valor inválido. Use formato: 12,50",
            formatador: formatarValorMonetario,
          },
          {
            id: "rastreio",
            titulo: "Rastreabilidade",
            tipo: "text",
            placeholder: "Código de rastreamento (Max 20 caracteres)",
            pattern: "^[A-Za-z0-9\\-\\/]{1,20}$", 
            required: true,
            validationMessage:
              "Código inválido. Use até 20 caracteres alfanuméricos.", 
            formatador: formatarRastreio,
          },
          {
            id: "MaterialId",
            titulo: "Material",
            tipo: "select",
            options: mockMateriais,
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
            pattern: "^\\d+(\\.\\d{3})*([,]\\d{1,2})?$",
            required: false, 
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
            pattern: "^\\d+(\\.\\d{3})*([,]\\d{1,2})?$",
            required: true,
            validationMessage: "Valor inválido. Use formato: 9,90",
            formatador: formatarValorMonetario,
          },
          {
            id: "quantidade",
            titulo: "Quantidade",
            tipo: "text",
            placeholder: "Número de peças/unidades (Ex: 100)",
            pattern: "^[1-9]\\d{0,4}$", // Garante pelo menos 1 e no máximo 5 dígitos
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
      4: { // Nova etapa de Confirmação/Resumo
        inputs: [],
        imagem: progresso3Concluido,
      },
      5: { // Nova etapa de Finalizado
        inputs: [],
        imagem: progresso3Concluido,
      }
    }),
    []
  );

  // --- Estados Derivados ---
  const image = progresso === 1 ? etapas[1].imagem :
                progresso === 2 ? etapas[2].imagem :
                progresso === 3 ? etapas[3].imagem :
                progresso >= 4 ? etapas[4].imagem :
                progressoImg;

  // const image = etapas[progresso]?.imagem || progressoImg;
  
  const titulo = useMemo(() => {
    if (progresso === 4) return "REVISÃO DA ORDEM DE COMPRA";
    if (progresso === 5) return "FORMULÁRIO FINALIZADO COM SUCESSO!";
    return "ORDEM DE COMPRA";
  }, [progresso]);
  
  const nomeBotao = progresso === 3 ? "AVANÇAR E REVISAR" : "PRÓXIMO"; 

  // --- Efeitos de Cálculo ---
  useEffect(() => {
    // Converte para formato numérico padrão (ponto como decimal)
    const valorUnitString = valoresInput["Valor Unitário"] || "";
    const valorUnit =
      parseFloat(valorUnitString.replace(/\./g, '').replace(",", ".")) || 0;
      
    const quantidade = parseInt(valoresInput["Quantidade"] || "0") || 0;
    const total = valorUnit * quantidade;

    if (total > 0) {
      setValoresInput((prev) => ({
        ...prev,
        Total: formatarValorMonetario(String(total.toFixed(2)).replace(".", ",")),
      }));
    } else {
      setValoresInput((prev) => ({ ...prev, Total: "" }));
    }
  }, [valoresInput["Valor Unitário"], valoresInput["Quantidade"]]);

  // --- Funções de Validação e Submissão ---

  // Lógica de validação de campo individual
  const validarCampo = useCallback((input, valor) => {
    
    // 1. Validação de campo obrigatório (Required)
    if (input.required) {
      if (input.tipo === "select") {
        // Para selects, o valor é o ID, que não deve ser vazio ou "0" se for número
        const valorId = valoresInput[input.titulo + "Id"] || "";
        if (!valorId) {
          return { valido: false, erro: input.validationMessage };
        }
      } else if (input.tipo === "date") {
        // Para datas, verifica se há valor
        if (!valor) {
          return { valido: false, erro: input.validationMessage };
        }
      } else if (!valor.trim()) {
        return { valido: false, erro: input.validationMessage };
      }
    }

    // Se o campo não for obrigatório e estiver vazio, é válido
    if (!input.required && !valor) {
      return { valido: true };
    }

    // 2. Validação de padrão (Pattern)
    if (input.pattern) {
      let valorAValidar = valor;

      // Para valores monetários, remove a formatação visual (pontos de milhar) para validar o formato
      if (input.tipo === "double" || input.titulo === "Valor Unitário") {
        valorAValidar = valor.replace(/\./g, ''); // Remove pontos de milhar
      }

      // Remove a formatação de "dias" para validar apenas os números/barra
      if (input.titulo === "Cond. Pagamento") {
        valorAValidar = valor.replace(/\s?dias?$/i, '');
      }
          
      const regex = new RegExp(input.pattern);
      if (!regex.test(valorAValidar)) {
        return { valido: false, erro: input.validationMessage };
      }
    }
    
    // 3. Validação de lógica específica (Ex: Data futura)
    if (input.tipo === "date") {
      const dataEntrega = new Date(valor);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); 
      if (dataEntrega < hoje) {
        return { valido: false, erro: "A data de entrega deve ser futura ou o dia de hoje." };
      }
    }

    return { valido: true };
  }, [valoresInput]);

  // Lógica de validação cruzada para o passo 2
  const validarCamposValor = (valoresInput) => {
    const erros = {};
    const valorKg = valoresInput["Valor por Kg"] || "";
    const valorPeca = valoresInput["Valor por peça"] || "";
    
    if (!valorKg && !valorPeca) {
      // Pelo menos um dos campos de valor deve ser preenchido
      erros["Valor por Kg"] = "Preencha o Valor por Kg ou o Valor por Peça.";
      erros["Valor por peça"] = "Preencha o Valor por Kg ou o Valor por Peça.";
    }

    return erros;
  };

  const validarFormulario = useCallback(() => {
    const inputs = etapas[progresso]?.inputs || [];
    let novosErros = {};
    let temErro = false;

    // Validação de campos individuais
    inputs.forEach((input) => {
        const valor = valoresInput[input.titulo] || "";
        
        // Para selects, o valor a ser validado é o ID armazenado
        let valorValidacao = valor;
        if (input.tipo === "select") {
          valorValidacao = valoresInput[input.titulo + "Id"] || "";
        }

        const { valido, erro } = validarCampo(input, valorValidacao);
        
        if (!valido) {
            novosErros[input.titulo] = erro;
            temErro = true;
        }
    });

    // Validação cruzada para o progresso 2 (Valores)
    if (progresso === 2) {
      const errosValor = validarCamposValor(valoresInput);
      
      // Mescla os erros, sobrescrevendo se um erro de valor cruzado for mais importante (ex: ambos vazios)
      novosErros = { ...novosErros, ...errosValor };

      if (Object.keys(errosValor).length > 0) {
        temErro = true;
      }
    }
    
    setErrosValidacao(novosErros);

    if (temErro) {
        toastError("Preencha todos os campos obrigatórios corretamente.");
    }
    return !temErro;
  }, [progresso, etapas, valoresInput, validarCampo]);


  const finalizarOrdemDeCompra = useCallback(async () => {
    // Simulação da submissão para a API.
    
    // Nota: A lógica de busca do fornecedor/material precisa usar o ID, que está armazenado como string
    const fornecedorSelecionado = mockFornecedores.find(f => 
        String(f.fornecedorId) === valoresInput["FornecedorId"]
    );
    const materialSelecionado = mockMateriais.find(m => 
        String(m.id) === valoresInput["MaterialId"]
    );

    const ordemFinal = {
        id: `OC-${Math.floor(Math.random() * 10000)}`, // ID aleatório para mock
        fornecedor: {
            name: fornecedorSelecionado?.nomeFantasia || valoresInput["Fornecedor"],
            cnpj: fornecedorSelecionado?.cnpj || "N/A",
        },
        prazoEntrega: valoresInput["Prazo de entrega"],
        condPagamento: valoresInput["Cond. Pagamento"],
        material: {
            nome: materialSelecionado?.tipoMaterial || valoresInput["Material"],
            rastreio: valoresInput["Rastreabilidade"]
        },
        valorUnitario: valoresInput["Valor Unitário"],
        ipi: "0", // Simulação, IPI não foi implementado nos inputs
        qtdMaterial: valoresInput["Quantidade"],
        valorTotal: valoresInput["Total"],
    };
    
    setOrdemDeCompra(ordemFinal);
    setProgresso(4); // Vai para a tela de Confirmação
    toastSuccess("Ordem criada! Revise os dados.");
  }, [valoresInput]);

  // --- Navegação ---
  const avancarProgresso = useCallback(() => {
    // Permite avançar da tela 4 para a 5 (Finalizado) sem validação
    if (progresso === 4) {
        setProgresso(5); // Vai para a tela Finalizada
        return;
    }

    if (progresso < 4 && !validarFormulario()) return;

    if (progresso === 3) {
      finalizarOrdemDeCompra(); // Submete e vai para progresso 4 (Confirmação)
    } else if (progresso < 5) {
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
    setOrdemDeCompra({});
    setErrosValidacao({});
  }, []);

  const handleInputChange = useCallback(
    (titulo, valor, isSelect = false, formatador = null) => {
      let valorFormatado = valor;

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

      // Limpa o erro ao digitar se houver
      if (errosValidacao[titulo]) {
        setErrosValidacao((prev) => ({ ...prev, [titulo]: "" }));
      }
    },
    [errosValidacao]
  );
  
  // --- Componente da Tela de Confirmação (progresso 4) - LAYOUT PROFISSIONAL ---
  const TelaDeConfirmacao = ({ ordemDeCompra, onNovaOrdem }) => {
    const fornecedorNome = ordemDeCompra.fornecedor?.name || valoresInput["Fornecedor"] || "N/A";
    const prazoEntrega = ordemDeCompra.prazoEntrega || valoresInput["Prazo de entrega"] || "N/A";
    const materialNome = ordemDeCompra.material?.nome || valoresInput["Material"] || "N/A";
    const rastreabilidade = ordemDeCompra.material?.rastreio || valoresInput["Rastreabilidade"] || "N/A";
    const valorkg = valoresInput["Valor por Kg"] || "0,00";
    const valorpeca = valoresInput["Valor por peça"] || "0,00";
    const descricaoMaterial = valoresInput["Descrição do material"] || "N/A";
    
    const valorUnitario = ordemDeCompra.valorUnitario || valoresInput["Valor Unitário"] || "0,00";
    const ipi = ordemDeCompra.ipi || "0";
    const qtdMaterial = ordemDeCompra.qtdMaterial || valoresInput["Quantidade"] || "0";
    const valorTotal = ordemDeCompra.valorTotal || valoresInput["Total"] || "0,00";

    const blocosDeDados = [
        {
            titulo: "INFORMAÇÕES GERAIS",
            id: "geral",
            dados: [
                { label: "Nº da Ordem:", value: ordemDeCompra.id || "PENDENTE" },
                { label: "Prazo de Entrega:", value: prazoEntrega },
                { label: "Cond. Pagamento:", value: valoresInput["Cond. Pagamento"] || "Nenhuma" },
            ]
        },
        {
            titulo: "DADOS DO FORNECEDOR",
            id: "fornecedor",
            dados: [
                { label: "Nome:", value: fornecedorNome },
                { label: "CNPJ:", value: ordemDeCompra.fornecedor?.cnpj || "00.000.000/0000-00" },
                { label: "ID Fornecedor:", value: valoresInput["FornecedorId"] || "1" },
            ]
        },
        {
            titulo: "MATERIAL E RASTREIO",
            id: "material",
            dados: [
                { label: "Material:", value: materialNome },
                { label: "Descrição:", value: descricaoMaterial },
                { label: "Rastreio:", value: rastreabilidade },
                { label: "Valor por Kg (R$):", value: valorkg },
                { label: "Valor por Peça (R$):", value: valorpeca },
            ]
        }
    ];

    const blocoValores = [
        { label: "Valor Unitário (R$):", value: valorUnitario },
        { label: "IPI (%):", value: ipi },
        { label: "Quantidade (Uni.):", value: qtdMaterial },
    ];


    return (
        <div className={style.telaDeConfirmacao}>
            <div className={style.painelRevisao}>
                
                {/* BLOCAGEM PRINCIPAL - GRID */}
                <div className={style.gridRevisao}>
                    {blocosDeDados.map((bloco) => (
                        <div key={bloco.id} className={style.cardRevisao}>
                            <h3>{bloco.titulo}</h3>
                            {/* Botão de edição simulado, pode ser conectado à função de voltar */}
                            <button className={style.editBtn} onClick={voltarProgresso}>✏️</button> 
                            {bloco.dados.map((dado, index) => (
                                <p key={index}>
                                    <strong>{dado.label}</strong> {dado.value}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                {/* BLOCAGEM DE VALOR TOTAL - DESTAQUE */}
                <div className={style.blocoValores}>
                    <h4>RESUMO FINANCEIRO</h4>
                    <div className={style.valoresItens}>
                        {blocoValores.map((item, index) => (
                            <div key={index} className={style.itemValor}>
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>
                    
                    <div className={style.valorTotal}>
                        <span>VALOR TOTAL (R$)</span>
                        <strong>{valorTotal}</strong>
                    </div>

                    {/* <button className={style.btnNovaOrdem} onClick={onNovaOrdem}>
                        Adicionar Material +
                    </button> */}
                    
                </div>
                
            </div>
            
        </div>
    );
};
  
  // --- Componente da Tela Finalizada (progresso 5) ---
  const TelaFinalizada = ({ ordemDeCompra }) => {
    const { 
        id, 
        prazoEntrega, 
        condPagamento, 
        valorTotal, 
        valorUnitario, 
        qtdMaterial, 
        ipi, 
        fornecedor, 
        material 
    } = ordemDeCompra;
    
    const fornecedorNome = fornecedor?.name || "N/A";
    const materialNome = material?.nome || "N/A";
    const rastreabilidade = material?.rastreio || "N/A";

    const dadosGerais = [
        { label: "Nº da Ordem", value: id || "N/A" },
        { label: "Condição de Pagamento", value: condPagamento || "N/A" },
        { label: "Prazo de Entrega", value: prazoEntrega || "N/A" },
        { label: "Data de Emissão", value: new Date().toLocaleDateString('pt-BR') },
    ];

    const dadosFinanceiros = [
        { label: "Valor Unitário", value: valorUnitario || "0,00" },
        { label: "IPI", value: `${ipi || "0"}%` },
        { label: "Quantidade", value: `${qtdMaterial || "0"} Unidades` },
        { label: "VALOR TOTAL (R$)", value: valorTotal || "0,00", isTotal: true },
    ];

    return (
        <div className={style.ordemFinalizadaContainer}>
            <div className={style.headerFinalizado}>
                <h2>Ordem de Compra Emitida</h2>
                <p>Detalhes da ordem enviada ao fornecedor.</p>
            </div>
            
            <div className={style.painelFinalizado}>
                
                {/* 1. SEÇÃO FORNECEDOR */}
                <div className={style.colunaFinalizada}>
                    <h3>FORNECEDOR</h3>
                    <div className={style.campo}>
                        <strong>Nome:</strong>
                        <span>{fornecedorNome}</span>
                    </div>
                    <div className={style.campo}>
                        <strong>CNPJ:</strong>
                        <span>{fornecedor?.cnpj || "00.000.000/0000-00"}</span>
                    </div>
                    <div className={style.campo}>
                        <strong>ID Fornecedor:</strong>
                        <span>{valoresInput["FornecedorId"] || "1"}</span>
                    </div>
                </div>

                {/* 2. SEÇÃO MATERIAL */}
                <div className={style.colunaFinalizada}>
                    <h3>MATERIAL E RASTREIO</h3>
                    <div className={style.campo}>
                        <strong>Material:</strong>
                        <span>{materialNome}</span>
                    </div>
                    <div className={style.campo}>
                        <strong>Descrição:</strong>
                        <span>{valoresInput["Descrição do material"] || "N/A"}</span>
                    </div>
                    <div className={style.campo}>
                        <strong>Rastreabilidade:</strong>
                        <span>{rastreabilidade}</span>
                    </div>
                    <div className={style.campo}>
                        <strong>Valor por Kg:</strong>
                        <span>{valoresInput["Valor por Kg"] || "0,00"}</span>
                    </div>
                    <div className={style.campo}>
                        <strong>Valor por Peça:</strong>
                        <span>{valoresInput["Valor por peça"] || "0,00"}</span>
                    </div>
                </div>

                {/* 3. SEÇÃO VALORES */}
                <div className={style.colunaFinalizada}>
                    <h3>DADOS FINANCEIROS</h3>
                    {dadosFinanceiros.map((dado, index) => (
                        <div key={index} className={`${style.campo} ${dado.isTotal ? style.campoTotal : ''}`}>
                            <strong>{dado.label}:</strong>
                            <span>{dado.isTotal ? `R$ ${dado.value}` : dado.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={style.dadosGerais}>
                <h3>INFORMAÇÕES GERAIS DA ORDEM</h3>
                <div className={style.dadosGeraisGrid}>
                    {dadosGerais.map((dado, index) => (
                        <div key={index} className={style.campoGeral}>
                            <strong>{dado.label}:</strong>
                            <span>{dado.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


  // --- Renderização Principal ---
  return (
    <>
      <NavBar />
      <section className={style.ordemDeCompra}>
        
        {/* Progresso da Seção (FORA DO formContent) */}
        <div className={style.progressoSecao}>
          {progresso <= 3 ? <img src={image} alt="Progresso" /> : <img src={progresso3Concluido} alt="Progresso Concluído" />} 
        </div>

        <main className={style.formContent}>
          <span className={style.spanTitulo}>
            <h1>{titulo}</h1>
          </span>

          {/* Renderização condicional por progresso */}
          {progresso < 4 ? (
            // progresso 1, 2, 3: Formulário
            <div className={style.inputs}>
              {etapas[progresso]?.inputs.map((input) => (
                <div key={input.id} className={style.inputGroup}>
                  <p>
                    {input.titulo}{" "}
                    {input.required && <span style={{ color: "red" }}>*</span>}
                  </p>
                  {input.tipo === "select" ? (
                    <select
                      // Usa o ID para controlar o valor do select
                      value={valoresInput[input.titulo + "Id"] || ""}
                      onChange={(e) => {
                        const valorId = e.target.value;
                        
                        // Encontra o nome fantasia para armazenar
                        const valorNome = 
                          input.options.find(
                            (opt) => String(opt[input.optionValue]) === valorId
                          )?.[input.optionLabel] || "";

                        // Chama o handler com o nome (valor formatado) e o ID (valor)
                        handleInputChange(input.titulo, valorNome, true);
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
                      // Usa o valor no estado para controlar o input
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

                  {/* Mensagem de erro */}
                  {errosValidacao[input.titulo] && (
                      <span className={style.errorMessage}>
                        {errosValidacao[input.titulo]}
                      </span>
                  )}
                </div>
              ))}
            </div>
          ) : progresso === 4 ? (
            // progresso 4: Tela de Confirmação/Resumo (Nova Estrutura)
            <TelaDeConfirmacao
                ordemDeCompra={ordemDeCompra}
                onNovaOrdem={reiniciar} 
            />
          ) : (
            // progresso 5: Tela de Finalização (Tela profissional)
            <TelaFinalizada ordemDeCompra={ordemDeCompra} /> 
          )}
        </main>

        <div className={style.botoes}>
          {/* VOLTAR */}
          {progresso > 1 && progresso < 5 && (
            <button onClick={voltarProgresso}>VOLTAR</button>
          )}

          {/* AVANÇAR / REVISAR */}
          {progresso < 4 && (
            <button onClick={avancarProgresso}>{nomeBotao}</button>
          )}

          {/* FINALIZAR (da revisão para a tela final) */}
          {progresso === 4 && (
            <button onClick={avancarProgresso}>FINALIZAR</button> 
          )}

          {/* TELA DE FINALIZAÇÃO (progresso === 5) */}
          {progresso === 5 && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => alert("Baixar PDF (Funcionalidade simulada)")}>
                BAIXAR ORDEM DE COMPRA
              </button>
              <button onClick={reiniciar}>CRIAR NOVA ORDEM</button>
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