// src/tools/baixarOrdemDeCompraPDF.js
import { jsPDF } from "jspdf";
import { api } from "../provider/api";
import {
  toastSuccess,
  toastError,
} from "../components/toastify/ToastifyService";

export async function baixarOrdemDeCompraPDF(
  ordemId,
  idsDasOrdensDoConjunto = null
) {
  try {
    console.log("GERANDO PDF OFICIAL - OC:", ordemId);

    const idsValidos = Array.isArray(idsDasOrdensDoConjunto)
      ? idsDasOrdensDoConjunto.filter((id) => id > 0)
      : [ordemId]; // fallback seguro

    if (!idsValidos.length) {
      toastError("Nenhum item encontrado para gerar o PDF.");
      return;
    }

    // Busca todas as ordens do conjunto
    const respostas = await Promise.all(
      idsValidos.map((id) => api.get(`/api/ordemDeCompra/${id}`))
    );
    const ordensDoConjunto = respostas.map((r) => r.data);
    const ordemPrincipal = ordensDoConjunto[0];

    // Dados complementares
    const [fornecedoresResp, materiaisResp] = await Promise.all([
      api.get("/api/fornecedores"),
      api.get("/api/estoque"),
    ]);

    const fornecedores = fornecedoresResp.data;
    const materiais = materiaisResp.data;

    const fornecedor = fornecedores.find(
      (f) => f.fornecedorId === ordemPrincipal.fornecedorId
    );
    if (!fornecedor) throw new Error("Fornecedor não encontrado");

    const dataObj = new Date(
      ordemPrincipal.dataDeEmissao || ordemPrincipal.dataEmissao
    );
    const dataFormatada = dataObj.toLocaleDateString("pt-BR");
    const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // === GERA PDF ===
    const doc = new jsPDF();
    const corPrimaria = [41, 128, 185];

    // Cabeçalho
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MegaPlate LTDA", 20, 20);

    // Número da Ordem
    doc.setFillColor(240, 240, 240);
    doc.rect(130, 40, 75, 28, "F");
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEM DE COMPRA", 135, 50);
    doc.setFontSize(18);
    doc.text(`Nº ${ordemId}`, 135, 62);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Data: ${dataFormatada}`, 20, 50);
    doc.text(` Hora: ${horaFormatada}`, 20, 56);

    doc.setLineWidth(0.5);
    doc.setDrawColor(149, 165, 166);
    doc.line(20, 70, 190, 70);

    // Fornecedor
    let y = 80;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FORNECEDOR", 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Razão Social: ${fornecedor.nomeFantasia || fornecedor.razaoSocial}`,
      20,
      y
    );
    y += 6;
    if (fornecedor.cnpj) doc.text(`CNPJ: ${fornecedor.cnpj}`, 20, y);
    y += 6;
    if (fornecedor.complemento)
      doc.text(`Endereço: ${fornecedor.complemento}`, 20, y);
    y += 6;
    if (fornecedor.telefone)
      doc.text(`Telefone: ${fornecedor.telefone}`, 20, y);
    y += 10;

    // Dados da compra
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DADOS DA COMPRA", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const prazo = new Date(ordemPrincipal.prazoEntrega).toLocaleDateString(
      "pt-BR"
    );
    const condPagto = ordemPrincipal.condPagamento || "Não informado";
    doc.text(`Prazo de entrega: ${prazo}`, 20, y);
    y += 6;
    doc.text(`Condição de pagamento: ${condPagto}`, 20, y);
    y += 12;

    // Tabela
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ITENS DA ORDEM DE COMPRA", 20, y);
    y += 10;

    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 10, "F");
    doc.setFontSize(9);
    doc.text("ITEM", 25, y);
    doc.text("DESCRIÇÃO", 45, y);
    doc.text("IPI", 95, y);
    doc.text("QTD", 110, y);
    doc.text("VALOR UNIT.", 130, y);
    doc.text("VALOR TOTAL", 165, y);

    y += 6;
    doc.setFont("helvetica", "normal");

       let totalGeral = 0;
    let ipiTotal = 0;

ordensDoConjunto.forEach((ordem, index) => {
  const item = String(index + 1).padStart(3, "0");

  const tipoMaterial = ordem.tipoMaterial || ordem.descricaoMaterialCompleta || "N/D";
  const quantidade = Number(ordem.quantidade) || 0;
  const valorUnitario = Number(ordem.valorUnitario) || 0;
  const totalItem = valorUnitario * quantidade;

  // === BUSCA O MATERIAL PELO estoqueId (no seu caso é 3) ===
  const materialEstoque = materiais.find(m => m.id === ordem.estoqueId);

  // === PEGA O IPI DO CAMPO CORRETO ("ipi" que é número) e formata ===
  const ipiNumero = materialEstoque?.ipi ?? 0;
  const ipiFormatado = ipiNumero > 0 ? `${ipiNumero.toFixed(2).replace(".", ",")}%` : "0,00%";

  // === CÁLCULO DO IPI EM DINHEIRO ===
  const valorIpiItem = (totalItem * ipiNumero) / 100;

  y += 8;

  doc.text(item, 25, y);
  doc.text(tipoMaterial.substring(0, 38), 45, y);
  doc.text(ipiFormatado, 95, y, { align: "center" });
  doc.text(String(quantidade), 110, y, { align: "center" });
  doc.text(`R$ ${valorUnitario.toFixed(2).replace(".", ",")}`, 130, y);
  doc.text(`R$ ${totalItem.toFixed(2).replace(".", ",")}`, 165, y);

  doc.setDrawColor(220, 220, 220);
  doc.line(20, y + 2, 190, y + 2);

  totalGeral += totalItem;
  ipiTotal += valorIpiItem;
});
    // === TOTAIS ===
    y += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(120, y - 5, 70, 38, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SUBTOTAL:", 125, y);
    doc.text(`R$ ${totalGeral.toFixed(2).replace(".", ",")}`, 165, y);

    doc.text("CONVERSÃO IPI:", 125, y + 10);
    doc.text(`R$ ${ipiTotal.toFixed(2).replace(".", ",")}`, 165, y + 10);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("TOTAL GERAL:", 125, y + 22);
    doc.text(
      `R$ ${(totalGeral + ipiTotal).toFixed(2).replace(".", ",")}`,
      165,
      y + 22
    );

    // === OBSERVAÇÕES ===
    y += 40;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const obs = [
      "• Favor confirmar recebimento desta ordem de compra.",
      "• Entregar no endereço da MegaPlate LTDA.",
      "• Qualquer divergência, entrar em contato em até 24h.",
      "• Documento emitido eletronicamente – válido sem assinatura.",
    ];
    obs.forEach((texto, i) => {
      doc.text(texto, 20, y + i * 6);
    });

    // Rodapé
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 275, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("MegaPlate LTDA • CNPJ: XX.XXX.XXX/XXXX-XX", 105, 285, {
      align: "center",
    });
    doc.text("www.megaplate.com.br | vendas@megaplate.com.br", 105, 291, {
      align: "center",
    });

    // SALVA
    const nomeArquivo = `Ordem_de_Compra_${ordemId}.pdf`;
    doc.save(nomeArquivo);
    toastSuccess(`PDF da Ordem Nº ${ordemId} gerado com sucesso!`);
  } catch (err) {
    console.error("ERRO AO GERAR PDF OFICIAL:", err);
    toastError("Falha ao gerar PDF: " + (err.message || "Verifique a conexão"));
  }
}

export default baixarOrdemDeCompraPDF;
