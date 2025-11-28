import { jsPDF } from "jspdf";
import { toastSuccess, toastError } from "../components/toastify/ToastifyService";

export function gerarPDFPrevia(dadosFornecedor, materiaisSelecionados, listaFornecedores) {
  try {
    const doc = new jsPDF();
    const corPrimaria = [41, 128, 185];
    const corTexto = [44, 62, 80];

    // === BUSCA FORNECEDOR ===
    const fornecedorId = Number(dadosFornecedor.FornecedorId || dadosFornecedor["FornecedorId"] || 0);
    const fornecedor = listaFornecedores.find(f => f.fornecedorId === fornecedorId);

    if (!fornecedor || fornecedorId === 0) {
      toastError("Fornecedor não encontrado. Verifique os dados da ordem.");
      return false;
    }

    // Cabeçalho
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MegaPlate LTDA", 20, 20);

    // Box Pré-visualização
    doc.setFillColor(240, 240, 240);
    doc.rect(140, 40, 65, 25, "F");
    doc.setTextColor(...corTexto);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PRÉ-VISUALIZAÇÃO", 145, 50);

    const hoje = new Date();
    const dataHora = hoje.toLocaleString("pt-BR");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${dataHora}`, 20, 50);

    doc.setDrawColor(149, 165, 166);
    doc.setLineWidth(0.5);
    doc.line(20, 70, 190, 70);

    // Dados do Fornecedor
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO FORNECEDOR", 20, 80);

    let y = 90;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nome: ${fornecedor.nomeFantasia}`, 20, y); y += 6;
    if (fornecedor.cnpj) doc.text(`CNPJ: ${fornecedor.cnpj}`, 20, y); y += 10;

    // Dados da Compra
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DADOS DA COMPRA", 20, y); y += 8;

    const prazoRaw = dadosFornecedor["Prazo de entrega"] || dadosFornecedor.prazoEntrega;
    const prazoEntrega = prazoRaw ? new Date(prazoRaw).toLocaleDateString("pt-BR") : "Não informado";
    const condPagto = dadosFornecedor["Cond. Pagamento"] || dadosFornecedor.condPagamento || "Não informado";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Prazo de entrega: ${prazoEntrega}`, 20, y); y += 6;
    doc.text(`Condição de pagamento: ${condPagto}`, 20, y); y += 12;

    // Tabela de Materiais
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DESCRIÇÃO DOS MATERIAIS", 20, y); y += 10;

    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 10, "F");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("ITEM", 25, y);
    doc.text("MATERIAL", 45, y);
    doc.text("IPI", 95, y);
    doc.text("QTD", 110, y);
    doc.text("VALOR UNIT.", 130, y);
    doc.text("TOTAL", 170, y);

    y += 6;
    doc.setFont("helvetica", "normal");

    let totalGeral = 0;
    let ipiTotal = 0;

    materiaisSelecionados.forEach((mat, i) => {
      const item = String(i + 1).padStart(3, "0");
      const valorUnit = Number(mat.valorUnitario) || 0;
      const quantidade = Number(mat.quantidade) || 0;

      // Valor total do item SEM IPI (do campo "total" que já vem formatado)
      const totalItemSemIpi = parseFloat((mat.total || "0,00").replace(".", "").replace(",", ".")) || 0;

      // Calcula o % de IPI (ex: "18,00%" → 18)
      const ipiPercentual = parseFloat((mat.ipiFormatado || "0,00%").replace("%", "").replace(",", ".")) || 0;

      // Valor do IPI em dinheiro
      const valorIpiItem = (totalItemSemIpi * ipiPercentual) / 100;

      y += 8;
      doc.text(item, 25, y);
      doc.text((mat.tipoMaterial || "N/A").substring(0, 25), 45, y);
      doc.text(mat.ipiFormatado || "0,00%", 95, y);
      doc.text(String(quantidade), 110, y);
      doc.text(`R$ ${valorUnit.toFixed(2).replace(".", ",")}`, 130, y);
      doc.text(`R$ ${mat.total || "0,00"}`, 170, y);
      doc.line(20, y + 2, 190, y + 2);

      totalGeral += totalItemSemIpi;
      ipiTotal += valorIpiItem;
    });

    // === TOTAIS ===
    y += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(130, y - 5, 60, 35, "F"); // aumentei altura

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SUBTOTAL:", 135, y);
    doc.text(`R$ ${totalGeral.toFixed(2).replace(".", ",")}`, 170, y);

    doc.text("CONVERSÃO IPI:", 135, y + 8);
    doc.text(`R$ ${ipiTotal.toFixed(2).replace(".", ",")}`, 170, y + 8);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("TOTAL GERAL:", 135, y + 18);
    doc.text(`R$ ${(totalGeral + ipiTotal).toFixed(2).replace(".", ",")}`, 170, y + 18);

    // === OBSERVAÇÕES ===
    y += 40;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("• ESTE É UM DOCUMENTO DE PRÉ-VISUALIZAÇÃO", 20, y + 10);
    doc.text("• A ordem ainda não foi finalizada no sistema", 20, y + 16);

    // Rodapé
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 275, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("www.megaplate.com.br | vendas@megaplate.com.br", 20, 290);

    const nomeArquivo = `previa_ordem_compra_${hoje.toISOString().slice(0, 10)}.pdf`;
    doc.save(nomeArquivo);

/*     toastSuccess("PDF gerado com sucesso!");
 */    return true;

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toastError("Erro ao gerar o PDF. Verifique os dados.");
    return false;
  }
}

export default gerarPDFPrevia;