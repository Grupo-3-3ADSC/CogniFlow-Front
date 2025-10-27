import { jsPDF } from "jspdf";
import { api } from "../provider/api";

export async function baixarOrdemDeCompraPDF(conjuntoId) {
  try {
    console.log("=== INICIANDO DOWNLOAD PDF ===");
    console.log("ID do Conjunto:", conjuntoId);

    // Validação do ID do conjunto
    if (!conjuntoId || conjuntoId <= 0) {
      throw new Error("ID do conjunto inválido");
    }

    console.log("Buscando dados...");

    // Busca o conjunto de ordens de compra pelo ID
    const [conjuntoResponse, fornecedoresResponse, materiaisResponse] = await Promise.all([
      api.get(`/conjunto-ordem-compra/${conjuntoId}`),
      api.get("/fornecedores"),
      api.get("/estoque"),
    ]);

    const conjunto = conjuntoResponse.data;
    const listaFornecedores = fornecedoresResponse.data;
    const listaMateriais = materiaisResponse.data;

    console.log("=== DADOS RECEBIDOS ===");
    console.log("Conjunto completo:", conjunto);
    console.log("Número de fornecedores:", listaFornecedores?.length);
    console.log("Número de materiais:", listaMateriais?.length);
    console.log("Ordens de compra:", conjunto?.ordensDeCompra);

    // Validação de dados recebidos
    if (!conjunto) {
      throw new Error("Conjunto não encontrado");
    }

    if (!conjunto.ordensDeCompra || conjunto.ordensDeCompra.length === 0) {
      throw new Error("Conjunto sem ordens de compra");
    }

    // Pega a primeira ordem para extrair dados comuns
    const primeiraOrdem = conjunto.ordensDeCompra[0];
    console.log("Primeira ordem:", primeiraOrdem);
    console.log("Fornecedor ID da ordem:", primeiraOrdem.fornecedorId);

    const doc = new jsPDF();

    const corPrimaria = [41, 128, 185];
    const corSecundaria = [149, 165, 166];
    const corTexto = [44, 62, 80];

    // Busca fornecedor pela primeira ordem
    const fornecedorDetalhes = listaFornecedores.find(
      (f) => f.fornecedorId === primeiraOrdem.fornecedorId
    );

    console.log("Fornecedor encontrado:", fornecedorDetalhes);

    if (!fornecedorDetalhes) {
      console.error("Fornecedores disponíveis:", listaFornecedores.map(f => ({ id: f.fornecedorId, nome: f.nomeFantasia })));
      throw new Error(`Fornecedor com ID ${primeiraOrdem.fornecedorId} não encontrado`);
    }

    // Cabeçalho
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`MegaPlate LTDA`, 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Box do Conjunto de Ordem de Compra
    doc.setFillColor(240, 240, 240);
    doc.rect(140, 40, 65, 25, "F");
    doc.setTextColor(...corTexto);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Conjunto OC:", 145, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nº ${conjunto.id}`, 145, 58);

    // Formatação de data usando a data da primeira ordem
    const dataObj = new Date(primeiraOrdem.dataDeEmissao);
    const dia = String(dataObj.getDate()).padStart(2, "0");
    const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
    const ano = dataObj.getFullYear();
    const horas = String(dataObj.getHours()).padStart(2, "0");
    const minutos = String(dataObj.getMinutes()).padStart(2, "0");
    const segundos = String(dataObj.getSeconds()).padStart(2, "0");

    const dataFormatada = `${dia}/${mes}/${ano}`;
    const horaFormatada = `${horas}:${minutos}:${segundos}`;

    doc.text(`Data: ${dataFormatada}`, 20, 50);
    doc.text(`Hora: ${horaFormatada}`, 20, 58);

    doc.setDrawColor(...corSecundaria);
    doc.setLineWidth(0.5);
    doc.line(20, 70, 190, 70);

    // Dados do Fornecedor
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO FORNECEDOR", 20, 80);

    let posicaoY = 90;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome: ${fornecedorDetalhes.nomeFantasia || fornecedorDetalhes.nomeFornecedor || "N/A"}`, 20, posicaoY); 
    posicaoY += 6;
    
    if (fornecedorDetalhes.cnpj) {
      doc.text(`CNPJ: ${fornecedorDetalhes.cnpj}`, 20, posicaoY); 
      posicaoY += 6;
    }
    if (fornecedorDetalhes.complemento) {
      doc.text(`Endereço: ${fornecedorDetalhes.complemento}`, 20, posicaoY); 
      posicaoY += 6;
    }
    if (fornecedorDetalhes.telefone) {
      doc.text(`Telefone: ${fornecedorDetalhes.telefone}`, 20, posicaoY); 
      posicaoY += 6;
    }

    // Dados da Compra
    posicaoY += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DADOS DA COMPRA", 20, posicaoY);

    posicaoY += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (primeiraOrdem.prazoEntrega) {
      const prazoEntrega = new Date(primeiraOrdem.prazoEntrega).toLocaleDateString("pt-BR");
      doc.text(`Prazo de entrega: ${prazoEntrega}`, 20, posicaoY); 
      posicaoY += 6;
    }
    
    if (primeiraOrdem.condPagamento) {
      doc.text(`Condição de pagamento: ${primeiraOrdem.condPagamento}`, 20, posicaoY); 
      posicaoY += 6;
    }

    // Descrição dos Materiais (Todas as ordens do conjunto)
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
    doc.text("QTD", 115, posicaoY);
    doc.text("VALOR UNIT.", 135, posicaoY);
    doc.text("TOTAL", 170, posicaoY);

    posicaoY += 6;
    doc.setFont("helvetica", "normal");

    let totalGeral = 0;
    let ipiTotal = 0;

    console.log("=== PROCESSANDO ORDENS ===");

    // Itera sobre todas as ordens de compra do conjunto
    conjunto.ordensDeCompra.forEach((ordemDeCompra, index) => {
      console.log(`Ordem ${index + 1}:`, ordemDeCompra);

      // Busca o material pelo estoqueId da ordem
      const materialSelecionado = listaMateriais.find(
        (m) => m.id === ordemDeCompra.estoqueId
      );

      console.log(`Material encontrado para ordem ${index + 1}:`, materialSelecionado);

      const item = String(index + 1).padStart(3, "0");
      const descricao = ordemDeCompra.descricaoMaterial || 
                        ordemDeCompra.descricaoMaterialCompleta ||
                        materialSelecionado?.tipoMaterial || 
                        materialSelecionado?.descricao ||
                        "Material não encontrado";
      
      const quantidade = ordemDeCompra.quantidade || 0;
      const valorUnitario = parseFloat(ordemDeCompra.valorUnitario || 0);
      const total = valorUnitario * quantidade;
      
      // IPI pode estar na ordem ou no material
      const ipi = parseFloat(ordemDeCompra.ipi || materialSelecionado?.ipi || 0);

      console.log(`Item ${item}: ${descricao} - Qtd: ${quantidade} - Valor: ${valorUnitario} - Total: ${total}`);

      posicaoY += 4;
      doc.text(item, 25, posicaoY);
      doc.text(descricao.substring(0, 20), 45, posicaoY);
      doc.text(quantidade.toString(), 115, posicaoY);
      doc.text(`R$ ${valorUnitario.toFixed(2).replace(".", ",")}`, 135, posicaoY);
      doc.text(`R$ ${total.toFixed(2).replace(".", ",")}`, 170, posicaoY);
      doc.line(20, posicaoY + 2, 190, posicaoY + 2);

      totalGeral += total;
      ipiTotal += (total * (ipi / 100));
    });

    console.log("Total Geral:", totalGeral);
    console.log("IPI Total:", ipiTotal);

    // Totais
    posicaoY += 12;
    doc.setFillColor(240, 240, 240);
    doc.rect(130, posicaoY - 5, 60, 25, "F");

    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL:", 135, posicaoY);
    doc.text(`R$ ${totalGeral.toFixed(2).replace(".", ",")}`, 170, posicaoY);

    doc.text(`IPI:`, 135, posicaoY + 8);
    const valorIPI = ipiTotal;
    doc.text(`R$ ${valorIPI.toFixed(2).replace(".", ",")}`, 170, posicaoY + 8);

    doc.setFontSize(11);
    doc.text("TOTAL GERAL:", 135, posicaoY + 16);
    doc.text(
      `R$ ${(totalGeral + ipiTotal).toFixed(2).replace(".", ",")}`,
      170,
      posicaoY + 16
    );

    // Observações
    posicaoY += 30;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 20, posicaoY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const observacoes = [
      "• Documento gerado automaticamente pelo sistema",
      "• Válido como comprovante de compra",
      `• Total de ${conjunto.ordensDeCompra.length} item(ns) na ordem`,
      "• Para dúvidas, entre em contato conosco",
    ];
    observacoes.forEach((obs, index) => {
      doc.text(obs, 20, posicaoY + 8 + index * 6);
    });

    // Rodapé
    const alturaRodape = 275;
    doc.setFillColor(...corPrimaria);
    doc.rect(0, alturaRodape, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Documento gerado em " + new Date().toLocaleString("pt-BR"), 20, alturaRodape + 8);
    doc.text("www.megaplate.com.br | vendas@megaplate.com.br", 20, alturaRodape + 14);
    
    if (fornecedorDetalhes?.nomeFantasia) {
      const nomeFantasiaLower = fornecedorDetalhes.nomeFantasia.toLowerCase().replace(/\s/g, "");
      doc.text(
        `www.${nomeFantasiaLower}.com.br | contato@${nomeFantasiaLower}.com.br`,
        20,
        alturaRodape + 20
      );
    }

    const nomeArquivo = `ordem_compra_conjunto_${conjunto.id}_${dia}-${mes}-${ano}.pdf`;
    
    console.log("=== GERANDO PDF ===");
    console.log("Nome do arquivo:", nomeArquivo);
    
    doc.save(nomeArquivo);

    console.log("=== PDF GERADO COM SUCESSO ===");

  } catch (err) {
    console.error("=== ERRO AO GERAR PDF ===");
    console.error("Erro completo:", err);
    console.error("Stack:", err.stack);
    console.error("Response data:", err.response?.data);
    console.error("Response status:", err.response?.status);
    
    // Tratamento específico de erros
    if (err.response?.status === 404) {
      alert("Conjunto de ordem de compra não encontrado. Verifique o ID informado.");
    } else if (err.response?.status === 500) {
      const mensagem = err.response?.data?.message || "Erro interno do servidor";
      alert(`Erro no servidor: ${mensagem}`);
    } else if (err.response?.status === 401) {
      alert("Sessão expirada. Faça login novamente");
    } else if (err.message) {
      alert(`Erro: ${err.message}`);
    } else {
      alert("Erro ao gerar PDF. Tente novamente");
    }
  }
}

export default baixarOrdemDeCompraPDF;