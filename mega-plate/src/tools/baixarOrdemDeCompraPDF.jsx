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
    // Busca todas as ordens do conjunto
    const respostas = await Promise.all(
      idsValidos.map((id) => api.get(`/ordemDeCompra/${id}`))
    );
    const ordensDoConjunto = respostas.map((r) => r.data);
    console.log("Ordens do conjunto:", ordensDoConjunto); // 🔍 log das ordens

    const ordemPrincipal = ordensDoConjunto[0];

    // Dados complementares
    const [fornecedoresResp, materiaisResp] = await Promise.all([
      api.get("/fornecedores"),
      api.get("/estoque"),
    ]);

    const fornecedores = fornecedoresResp.data;
    const materiais = materiaisResp.data;

    console.log("Materiais no estoque:", materiais); // 🔍 log dos materiais

    const fornecedor = fornecedores.find(
      (f) => f.fornecedorId === ordemPrincipal.fornecedorId
    );
    console.log("Fornecedor da ordem principal:", fornecedor); //

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

    doc.setFontSize(8);
    doc.text("ITEM", 22, y);
    doc.text("MATERIAL", 34, y);
    doc.text("TIPO", 78, y);
    doc.text("QTD", 92, y);
    doc.text("VL UNIT", 104, y);
    doc.text("IPI", 124, y);
    doc.text("TOTAL S/ IPI", 138, y);
    doc.text("TOTAL C/ IPI", 162, y);

    y += 8;
    doc.setFont("helvetica", "normal");

    let totalGeral = 0;
    let ipiTotal = 0;

    function getMaterialValue(ordem, materiais) {
      const material =
        materiais.find(
          (m) => Number(m.id ?? m.estoqueId) === Number(ordem.estoqueId)
        ) || {};

      const tipoCompra = ordem.tipoCompra?.toUpperCase();

      const valorUnitario =
        tipoCompra === "UNIDADE"
          ? Number(ordem.valorUnitario ?? material.valorUnitario ?? 0)
          : 0;
      const valorKg =
        tipoCompra === "QUILO"
          ? Number(ordem.valorKg ?? material.valorKg ?? 0)
          : 0;
      const ipi = Number(material.ipi ?? 0);

      const materialNome =
        material.tipoMaterial ??
        material.nome ??
        material.descricao ??
        material.nomeMaterial ??
        material.material?.nome ??
        "N/D";

      return {
        valorUnitario,
        valorKg,
        ipi,
        materialNome,
      };
    }

    function formatTipoCompra(tipo) {
      if (!tipo) return "Unidade";
      const t = tipo.toString().toUpperCase();
      if (t === "QUILO" || t === "KG" || t === "KILO") return "Kg";
      return "Unidade";
    }

    ordensDoConjunto.forEach((ordem, index) => {
      const { valorUnitario, valorKg, ipi, materialNome } = getMaterialValue(
        ordem,
        materiais
      );

      const item = String(index + 1).padStart(3, "0");
      const tipoCompra = ordem.tipoCompra?.toUpperCase() || "UNIDADE"; // fallback seguro
      const tipoCompraTexto = formatTipoCompra(ordem.tipoCompra);
      const quantidade = Number(ordem.quantidade) || 0;

      const ipiFormatado =
        ipi > 0 ? `${ipi.toFixed(2).replace(".", ",")}%` : "0,00%";

      const valorUnit = tipoCompra === "QUILO" ? valorKg : valorUnitario;

      const totalSemIpi = valorUnit * quantidade;
      const valorIpi = (totalSemIpi * ipi) / 100;
      const totalComIpi = totalSemIpi + valorIpi;

      y += 8;
      doc.setFontSize(8);

      doc.text(item, 22, y);
      doc.text(materialNome.substring(0, 26), 34, y);
      doc.text(tipoCompraTexto, 78, y);
      doc.text(String(quantidade), 95, y, { align: "center" });
      doc.text(`R$ ${valorUnit.toFixed(2).replace(".", ",")}`, 104, y);
      doc.text(ipiFormatado, 124, y, { align: "center" });
      doc.text(`R$ ${totalSemIpi.toFixed(2).replace(".", ",")}`, 138, y);
      doc.text(`R$ ${totalComIpi.toFixed(2).replace(".", ",")}`, 162, y);

      y += 5;
      doc.setFontSize(8);
      doc.text(`Rastre.: ${ordem.rastreabilidade || "-"}`, 34, y);

      y += 4;
      doc.text(
        `Descrição: ${(ordem.descricaoMaterial || "-").substring(0, 95)}`,
        34,
        y
      );

      y += 4;
      doc.setDrawColor(220, 220, 220);
      doc.line(20, y, 190, y);

      totalGeral += totalSemIpi;
      ipiTotal += valorIpi;
    });

    // === TOTAIS ===
    y += 10;
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
    y += 20;
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
    doc.rect(0, 270, 210, 27, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("MegaPlate LTDA • CNPJ: XX.XXX.XXX/XXXX-XX", 105, 280, {
      align: "center",
    });
    doc.text("www.megaplate.com.br | vendas@megaplate.com.br", 105, 286, {
      align: "center",
    });

    // SALVA
    const nomeArquivo = `Ordem_de_Compra_${ordemId}.pdf`;
    doc.save(nomeArquivo);
  } catch (err) {
    console.error("ERRO AO GERAR PDF OFICIAL:", err);
    toastError("Falha ao gerar PDF: " + (err.message || "Verifique a conexão"));
    
  }
}

export default baixarOrdemDeCompraPDF;
