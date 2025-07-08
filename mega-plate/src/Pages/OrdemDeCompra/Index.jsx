import style from "./ordemDeCompra.module.css";
import progressoImg from '../../assets/progressoOrdemDeCompra.png';
import progressoConcluido from '../../assets/progresso1Concluido.png';
import progresso2Concluido from '../../assets/progresso2Concluido.png';
import progresso3Concluido from '../../assets/progresso3Concluido.png';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../provider/api';
import { jsPDF } from 'jspdf';
import NavBar from '../../components/NavBar';
import { toastError, toastSucess } from '../../components/toastify/ToastifyService';
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";

export function OrdemDeCompra() {
  const navigate = useNavigate();
  
  // Lista mockada de fornecedores
  const fornecedoresMock = [
    {
      fornecedorId: 1,
      nomeFantasia: "MetalTech Indústria",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 3456-7890",
      complemento: "Rua das Indústrias, 123 - São Paulo/SP"
    },
    {
      fornecedorId: 2,
      nomeFantasia: "SteelMax Suprimentos",
      cnpj: "23.456.789/0001-80",
      telefone: "(11) 9876-5432",
      complemento: "Av. Industrial, 456 - Guarulhos/SP"
    },
    {
      fornecedorId: 3,
      nomeFantasia: "IronWorks Distribuidora",
      cnpj: "34.567.890/0001-70",
      telefone: "(11) 5555-1234",
      complemento: "Rua do Ferro, 789 - Osasco/SP"
    },
    {
      fornecedorId: 4,
      nomeFantasia: "AlumCorp Materiais",
      cnpj: "45.678.901/0001-60",
      telefone: "(11) 2222-9999",
      complemento: "Estrada dos Metais, 321 - Barueri/SP"
    },
    {
      fornecedorId: 5,
      nomeFantasia: "Bronze & Cia Ltda",
      cnpj: "56.789.012/0001-50",
      telefone: "(11) 7777-3333",
      complemento: "Alameda Industrial, 654 - Diadema/SP"
    }
  ];

  // Lista mockada de materiais
  const materiaisMock = [
    {
      id: 1,
      tipoMaterial: "Aço Carbono 1020"
    },
    {
      id: 2,
      tipoMaterial: "Alumínio 6061"
    },
    {
      id: 3,
      tipoMaterial: "Cobre Eletrolítico"
    },
    {
      id: 4,
      tipoMaterial: "Bronze Fosforoso"
    },
    {
      id: 5,
      tipoMaterial: "Aço Inoxidável 304"
    },
    {
      id: 6,
      tipoMaterial: "Ferro Fundido Cinzento"
    }
  ];

  const [listaFornecedores, setListaFornecedores] = useState(fornecedoresMock);
  const [listaMateriais, setListaMateriais] = useState(materiaisMock);
  const [ordemDeCompra, setOrdemDeCompra] = useState([]);
  const [progresso, setProgresso] = useState(1);
  const [valoresInput, setValoresInput] = useState({});
  const [errosValidacao, setErrosValidacao] = useState({});

  // Funções de formatação
  const formatarIE = (valor) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}.${nums.slice(9, 12)}`;
  };

  const formatarPagamento = (valor) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length === 0) return '';
    if (nums.length <= 2) return `${nums} dias`;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)} dias`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)} dias`;
  };

  // Função de formatação corrigida para valores monetários
  const formatarValorMonetario = (valor) => {
    const nums = valor.replace(/[^\d]/g, '');
    if (nums.length === 0) return '';
    
    // Converte para número e formata corretamente
    const numero = parseInt(nums);
    if (numero === 0) return '';
    
    // Se tem apenas 1 dígito, trata como centavos
    if (nums.length === 1) return `0,0${nums}`;
    // Se tem 2 dígitos, trata como centavos
    if (nums.length === 2) return `0,${nums}`;
    
    // Para mais de 2 dígitos, separa os centavos
    const inteiros = nums.slice(0, -2);
    const decimais = nums.slice(-2);
    
    // Remove zeros à esquerda dos inteiros
    const inteirosLimpos = inteiros.replace(/^0+/, '') || '0';
    
    // Adiciona separadores de milhares
    const inteirosFormatados = inteirosLimpos.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${inteirosFormatados},${decimais}`;
  };

  // CORREÇÃO: Limitando o campo de rastreabilidade a 20 caracteres
  const formatarRastreio = (valor) => {
    const formatted = valor.toUpperCase().replace(/[^A-Z0-9\-\/]/g, '');
    return formatted.substring(0, 20); // Limite de 20 caracteres
  };

  const formatarIPI = (valor) => {
    const nums = valor.replace(/[^\d,]/g, '');
    if (nums.includes(',')) {
      const partes = nums.split(',');
      return `${partes[0]},${partes[1].slice(0, 2)}%`;
    }
    return nums ? `${nums}%` : '';
  };

  const formatarQuantidade = (valor) => {
    return valor.replace(/\D/g, '');
  };

  // Função para validação condicional dos campos valor
  const validarCamposValor = (valoresInput) => {
    const valorKg = valoresInput["Valor por Kg"];
    const valorPeca = valoresInput["Valor por peça"];
    
    // Se nenhum dos dois estiver preenchido, ambos são obrigatórios
    if (!valorKg && !valorPeca) {
      return {
        "Valor por Kg": "Preencha o valor por Kg OU o valor por peça",
        "Valor por peça": "Preencha o valor por Kg OU o valor por peça"
      };
    }
    
    return {}; // Nenhum erro se pelo menos um estiver preenchido
  };

  // Configuração das etapas otimizada
  const etapas = useMemo(() => ({
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
          validationMessage: "Inscrição estadual inválida. Use: 123.456.789.000",
          formatador: formatarIE
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
          formatador: formatarPagamento
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
          formatador: formatarValorMonetario
        },
        {
          id: "rastreio",
          titulo: "Rastreabilidade",
          tipo: "text",
          placeholder: "Código de rastreamento (Max 20 caracteres)",
          pattern: "^[A-Za-z0-9\\-\\/]{3,20}$", // CORREÇÃO: Limite ajustado para 20
          required: true,
          validationMessage: "Código inválido. Use 3-20 caracteres alfanuméricos.", // CORREÇÃO: Mensagem atualizada
          formatador: formatarRastreio
        },
        {
          id: "material",
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
          formatador: formatarValorMonetario
        },
        {
          id: "descricao",
          titulo: "Descrição do material",
          tipo: "text",
          placeholder: "Descreva detalhadamente o material (Ex: Parafuso galvanizado M6)",
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
          formatador: formatarValorMonetario
        },
        {
          id: "ipi",
          titulo: "IPI",
          tipo: "text",
          placeholder: "Percentual do imposto (Ex: 12%)",
          pattern: "^\\d{1,2}([,.]\\d{1,2})?%?$",
          required: true,
          validationMessage: "IPI inválido. Use formato: 12% ou 12",
          formatador: formatarIPI
        },
        {
          id: "quantidade",
          titulo: "Quantidade",
          tipo: "text",
          placeholder: "Número de peças/unidades (Ex: 100)",
          pattern: "^\\d{1,5}$",
          required: true,
          validationMessage: "Quantidade inválida. Use apenas números (1-99999).",
          formatador: formatarQuantidade
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
  }), [listaFornecedores, listaMateriais]);

  // Estados derivados
  const image = etapas[progresso]?.imagem || progressoImg;
  const titulo = progresso === 4 ? "FORMULÁRIO FINALIZADO COM SUCESSO!" : "ORDEM DE COMPRA";
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
    const valorUnit = parseFloat((valoresInput["Valor Unitário"] || "").replace(",", ".")) || 0;
    const quantidade = parseInt(valoresInput["Quantidade"] || "0") || 0;
    const total = valorUnit * quantidade;

    if (total > 0) {
      setValoresInput(prev => ({ ...prev, Total: total.toFixed(2).replace(".", ",") }));
    } else {
      setValoresInput(prev => ({ ...prev, Total: "" }));
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

  // Função de validação atualizada
  const validarFormulario = useCallback(() => {
    const inputs = etapas[progresso]?.inputs || [];
    const novosErros = {};
    let temErro = false;

    // Validação especial para campos de valor na etapa 2
    if (progresso === 2) {
      const errosValor = validarCamposValor(valoresInput);
      Object.assign(novosErros, errosValor);
      if (Object.keys(errosValor).length > 0) {
        temErro = true;
      }
    }

    for (let input of inputs) {
      if (input.titulo === "Total" && input.disabled) continue;
      
      // Pula validação de obrigatoriedade para campos de valor se o outro estiver preenchido
      if (progresso === 2 && (input.titulo === "Valor por Kg" || input.titulo === "Valor por peça")) {
        const valorKg = valoresInput["Valor por Kg"];
        const valorPeca = valoresInput["Valor por peça"];
        
        // Se um dos campos estiver preenchido, o outro não é obrigatório
        if ((input.titulo === "Valor por Kg" && valorPeca) || 
            (input.titulo === "Valor por peça" && valorKg)) {
          continue;
        }
      }
      
      const valor = input.tipo === "select" 
        ? valoresInput[input.titulo + "Id"] 
        : valoresInput[input.titulo];
      
      const validacao = validarCampo(input, valor);
      if (!validacao.valido && !novosErros[input.titulo]) {
        novosErros[input.titulo] = validacao.erro;
        temErro = true;
      }
    }

    // Validação de segurança
    const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
    const scriptPattern = /<script.*?>.*?<\/script>/gi;
    
    for (let input of inputs) {
      const valor = valoresInput[input.titulo];
      if (typeof valor === 'string') {
        if (sqlPattern.test(valor)) {
          novosErros[input.titulo] = 'Comandos SQL não são permitidos';
          temErro = true;
          break;
        }
        if (scriptPattern.test(valor)) {
          novosErros[input.titulo] = 'Scripts não são permitidos';
          temErro = true;
          break;
        }
      }
    }

    setErrosValidacao(novosErros);
    return !temErro;
  }, [progresso, etapas, valoresInput, validarCampo]);

  // CORREÇÃO: Finalizar ordem - simulando sucesso para chegar na tela 4
  const finalizarOrdemDeCompra = useCallback(async () => {
    const dadosApi = {
      fornecedorId: valoresInput["FornecedorId"],
      prazoEntrega: valoresInput["Prazo de entrega"],
      ie: valoresInput["I.E"],
      condPagamento: valoresInput["Cond. Pagamento"],
      valorKg: valoresInput["Valor por Kg"],
      rastreabilidade: valoresInput["Rastreabilidade"],
      estoqueId: valoresInput["MaterialId"],
      valorPeca: valoresInput["Valor por peça"],
      descricaoMaterial: valoresInput["Descrição do material"],
      valorUnitario: valoresInput["Valor Unitário"],
      ipi: valoresInput["IPI"],
      total: valoresInput["Total"],
      quantidade: valoresInput["Quantidade"],
    };

    try {
      // CORREÇÃO: Simulando resposta da API para permitir ir para a tela 4
      // const res = await api.post("/ordemDeCompra", dadosApi);
      // setOrdemDeCompra(res.data);
      
      // Simulando resposta de sucesso
      const ordemSimulada = {
        id: Math.floor(Math.random() * 10000),
        ...dadosApi
      };
      
      setOrdemDeCompra(ordemSimulada);
      setProgresso(4);
      toastSucess("Ordem de compra criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar ordem:", error);
      toastError("Erro ao criar ordem de compra. Verifique os dados.");
      setErrosValidacao({ geral: "Erro ao criar ordem de compra. Verifique os dados." });
    }
  }, [valoresInput]);

  // Navegação
  const avancarProgresso = useCallback(() => {
    if (!validarFormulario()) return;

    if (progresso === 3) {
      finalizarOrdemDeCompra();
    } else {
      setProgresso(prev => prev + 1);
    }
  }, [progresso, validarFormulario, finalizarOrdemDeCompra]);

  const voltarProgresso = useCallback(() => {
    if (progresso > 1) {
      setProgresso(prev => prev - 1);
      setErrosValidacao({});
    }
  }, [progresso]);

  const reiniciar = useCallback(() => {
    setProgresso(1);
    setValoresInput({});
    setErrosValidacao({});
  }, []);

  // Handler para limpar o campo oposto quando um dos valores for preenchido
  const handleInputChange = useCallback((titulo, valor, isSelect = false, formatador = null) => {
    let valorFormatado = valor;
    
    // Aplicar formatação se existir
    if (formatador && !isSelect) {
      valorFormatado = formatador(valor);
    }
    
    setValoresInput(prev => {
      const newState = {
        ...prev,
        [titulo]: valorFormatado,
        ...(isSelect && { [titulo + "Id"]: valor })
      };
      
      return newState;
    });
    
    // Lógica para limpar erros dos campos de valor quando um for preenchido
    if (titulo === "Valor por Kg" && valorFormatado) {
      // Limpa erro do campo "Valor por peça" quando "Valor por Kg" for preenchido
      setErrosValidacao(prevErros => ({
        ...prevErros,
        "Valor por peça": ""
      }));
    } else if (titulo === "Valor por peça" && valorFormatado) {
      // Limpa erro do campo "Valor por Kg" quando "Valor por peça" for preenchido
      setErrosValidacao(prevErros => ({
        ...prevErros,
        "Valor por Kg": ""
      }));
    }
    
    // Limpar erro específico do campo atual
    if (errosValidacao[titulo]) {
      setErrosValidacao(prev => ({ ...prev, [titulo]: '' }));
    }
  }, [errosValidacao]);

  // Geração de documentos (versão simplificada)
  const gerarPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text('Ordem de Compra', 20, 20);
    doc.text(`ID: ${ordemDeCompra.id}`, 20, 30);
    doc.text(`Fornecedor: ${valoresInput["Fornecedor"]}`, 20, 40);
    doc.text(`Total: R$ ${valoresInput["Total"]}`, 20, 50);
    doc.save(`ordem_${ordemDeCompra.id}.pdf`);
  }, [ordemDeCompra, valoresInput]);

  const baixarDocumentos = useCallback(async () => {
    try {
      gerarPDF();
      toastSucess("Documentos baixados com sucesso!");
    } catch (error) {
      toastError("Erro ao gerar documentos");
      setErrosValidacao({ geral: "Erro ao gerar documentos" });
    }
  }, [gerarPDF]);

  return (
    <>
      <NavBar />
      <section className={style.ordemDeCompra}>
        <div className={style.progressoSecao}>
          <img src={image} alt="Progresso" />
        </div>

        <main className={style.formContent}>
          <span className={style.spanTitulo} style={progresso === 4 ? 
            { backgroundColor: "#1D597B", width: "330px", height: "200px" } : 
            { backgroundColor: "#05314C" }}>
            <h1>{titulo}</h1>
          </span>

          <div className={style.inputs}>
            {etapas[progresso]?.inputs.map((input) => (
              <div key={input.id} className={style.inputGroup}>
                <p>{input.titulo} {input.required && <span style={{color: 'red'}}>*</span>}</p>
                {input.tipo === "select" ? (
                  <select
                    value={valoresInput[input.titulo + "Id"] || ""}
                    onChange={(e) => {
                      const valor = e.target.value;
                      const opcao = input.options.find(opt => 
                        String(opt[input.optionValue]) === valor
                      );
                      handleInputChange(input.titulo, opcao?.[input.optionLabel] || "", true);
                      setValoresInput(prev => ({ ...prev, [input.titulo + "Id"]: valor }));
                    }}
                    style={errosValidacao[input.titulo] ? { borderColor: 'red' } : {}}
                  >
                    <option value="">{input.placeholder}</option>
                    {input.options.map((opt) => (
                      <option key={opt[input.optionValue]} value={opt[input.optionValue]}>
                        {opt[input.optionLabel]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={input.tipo}
                    placeholder={input.placeholder}
                    value={valoresInput[input.titulo] || ""}
                    onChange={(e) => handleInputChange(input.titulo, e.target.value, false, input.formatador)}
                    disabled={input.disabled}
                    style={errosValidacao[input.titulo] ? { borderColor: 'red' } : {}}
                  />
                )}
                {errosValidacao[input.titulo] && (
                  <small style={{ color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    {errosValidacao[input.titulo]}
                  </small>
                )}
              </div>
            ))}
          </div>

          {progresso === 4 && (
            <div className={style.botaoPdf}>
              <button onClick={baixarDocumentos}>
                BAIXAR ORDEM DE COMPRA
              </button>
            </div>
          )}
        </main>

        <div className={style.botoes}>
          {progresso > 1 && progresso < 4 && (
            <button onClick={voltarProgresso}>VOLTAR</button>
          )}

          {progresso < 4 && (
            <button onClick={avancarProgresso}>
              {nomeBotao}
            </button>
          )}

          {progresso === 4 && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={reiniciar}>
                CRIAR NOVA ORDEM DE COMPRA
              </button>
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