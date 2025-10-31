import { jsPDF } from "jspdf";
export function gerarPDFPrevia(valoresInput, materiaisSelecionados, listaFornecedores, listaMateriais) {
  try {
    const doc = new jsPDF();

    const corPrimaria = [41, 128, 185];
    const corSecundaria = [149, 165, 166];
    const corTexto = [44, 62, 80];

    // Busca fornecedor
    const fornecedor = listaFornecedores.find(
      (f) => f.fornecedorId === Number(valoresInput["FornecedorId"])
    );

    if (!fornecedor) {
      alert("Fornecedor não encontrado");
      return false;
    }

    // Cabeçalho
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MegaPlate LTDA", 20, 20);

    // Box de Pré-visualização
    doc.setFillColor(240, 240, 240);
    doc.rect(140, 40, 65, 25, "F");
    doc.setTextColor(...corTexto);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PRÉ-VISUALIZAÇÃO", 145, 50);

    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();
    const horas = String(hoje.getHours()).padStart(2, "0");
    const minutos = String(hoje.getMinutes()).padStart(2, "0");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${dia}/${mes}/${ano}`, 20, 50);
    doc.text(`Hora: ${horas}:${minutos}`, 20, 58);

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
    doc.text(`Nome: ${fornecedor.nomeFantasia || "N/A"}`, 20, posicaoY);
    posicaoY += 6;

    if (fornecedor.cnpj) {
      doc.text(`CNPJ: ${fornecedor.cnpj}`, 20, posicaoY);
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

    const prazoEntrega = new Date(valoresInput["Prazo de entrega"]).toLocaleDateString("pt-BR");
    doc.text(`Prazo de entrega: ${prazoEntrega}`, 20, posicaoY);
    posicaoY += 6;
    doc.text(`Condição de pagamento: ${valoresInput["Cond. Pagamento"]}`, 20, posicaoY);
    posicaoY += 6;

    // Descrição dos Materiais
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
    doc.text("MATERIAL", 45, posicaoY);
    doc.text("IPI", 95, posicaoY); // ✅ ADICIONADO: Coluna IPI
    doc.text("QTD", 110, posicaoY); // ✅ Ajustado posição
    doc.text("VALOR UNIT.", 130, posicaoY); // ✅ Ajustado posição
    doc.text("TOTAL", 170, posicaoY);

    posicaoY += 6;
    doc.setFont("helvetica", "normal");

    let totalGeral = 0;
    let ipiTotal = 0; // ✅ ADICIONADO: Total de IPI

    materiaisSelecionados.forEach((mat, index) => {
      const item = String(index + 1).padStart(3, "0");
      const tipoMaterial = mat.tipoMaterial || "N/A";
      const ipiValor = Number(mat.ipi) || 0; // Garante que é número
      const ipi = ipiValor.toFixed(2) + "%";
      const total = parseFloat(mat.Total?.replace(",", ".") || 0);

      posicaoY += 8;
      doc.text(item, 25, posicaoY);
      doc.text(tipoMaterial.substring(0, 18), 45, posicaoY);
      doc.text(ipi, 95, posicaoY);
      doc.text(mat.Quantidade.toString(), 110, posicaoY);
      doc.text(`R$ ${mat["Valor Unitário"]}`, 130, posicaoY);
      doc.text(`R$ ${mat.Total}`, 170, posicaoY);
      doc.line(20, posicaoY + 2, 190, posicaoY + 2);

      totalGeral += total;
      ipiTotal += total * (ipiValor / 100); // Cálculo correto do IPI
    });

    // Totais
    posicaoY += 12;
    doc.setFillColor(240, 240, 240);
    doc.rect(130, posicaoY - 5, 60, 25, "F"); // ✅ Aumentado altura para 25

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SUBTOTAL:", 135, posicaoY);
    doc.text(`R$ ${totalGeral.toFixed(2).replace(".", ",")}`, 170, posicaoY);

    // ✅ ADICIONADO: Linha do IPI total
    doc.text("CONVERSÃO IPI:", 135, posicaoY + 7);
    doc.text(`R$ ${ipiTotal.toFixed(2).replace(".", ",")}`, 170, posicaoY + 7);

    // ✅ ADICIONADO: Total Geral (Subtotal + IPI)
    doc.setFontSize(11);
    doc.text("TOTAL GERAL:", 135, posicaoY + 15);
    doc.text(`R$ ${(totalGeral + ipiTotal).toFixed(2).replace(".", ",")}`, 170, posicaoY + 15);

    // Observações
    posicaoY += 30; // ✅ Ajustado para dar mais espaço
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 20, posicaoY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const observacoes = [
      "• ESTE É UM DOCUMENTO DE PRÉ-VISUALIZAÇÃO",
      "• A ordem ainda não foi finalizada no sistema",
      `• Total de ${materiaisSelecionados.length} item(ns)`,
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

    const nomeArquivo = `previa_ordem_compra_${dia}-${mes}-${ano}.pdf`;
    doc.save(nomeArquivo);

    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar PDF de pré-visualização");
    return false;
  }
}

export default gerarPDFPrevia;