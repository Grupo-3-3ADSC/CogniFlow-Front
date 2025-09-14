import { jsPDF } from "jspdf";
import { api } from "../provider/api";
import { useState } from "react";

export async function baixarOrdemDeCompraPDF(id) {

    try {
    // Busca os dados da API
    const [ordemDeCompraResponse, fornecedoresResponse, materiaisResponse] = await Promise.all([
      api.get(`/ordemDeCompra/${id}`),
      api.get("/fornecedores"),
      api.get("/estoque"),
    ]);

      const ordemDeCompra = ordemDeCompraResponse.data;
      const listaFornecedores = fornecedoresResponse.data;
      const listaMateriais = materiaisResponse.data;

    const doc = new jsPDF();

    const corPrimaria = [41, 128, 185];
    const corSecundaria = [149, 165, 166];
    const corTexto = [44, 62, 80];

    const fornecedorDetalhes = listaFornecedores.find(
      (f) => f.fornecedorId === ordemDeCompra.fornecedorId
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

const dataObj = new Date(ordemDeCompra.dataDeEmissao);

const dia = String(dataObj.getDate()).padStart(2, "0");
const mes = String(dataObj.getMonth() + 1).padStart(2, "0"); // mês começa do 0
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
  if (ordemDeCompra.ie) {
    doc.text(`I.E: ${ordemDeCompra.ie}`, 20, posicaoY); posicaoY += 6;
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

const prazoEntrega = new Date(ordemDeCompra.prazoEntrega).toLocaleDateString("pt-BR");
doc.text(`Prazo de entrega: ${prazoEntrega}`, 20, posicaoY); posicaoY += 6;

doc.text(`Condição de pagamento: ${ordemDeCompra.condPagamento}`, 20, posicaoY); posicaoY += 6;

const valorPeca = parseFloat(String(ordemDeCompra.valorPeca)?.replace(",", ".")) || 0;
const valorKg = parseFloat(String(ordemDeCompra.valorKg)?.replace(",", ".")) || 0;

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
      (m) => m.id === ordemDeCompra.estoqueId
    );

    const item = "001";
    const descricao = materialSelecionado?.tipoMaterial || "Material não encontrado";
    const quantidade = ordemDeCompra.quantidade || 0;
    const valorUnitario = ordemDeCompra.valorUnitario || 0;
    const total = valorUnitario * quantidade;
    const ipi = parseFloat(String(materialSelecionado?.ipi || "0").replace(",", ".")) || 0;


    posicaoY += 10;
    doc.setFont("helvetica", "normal");
    doc.text(item, 25, posicaoY);
    doc.text(descricao.substring(0, 25), 45, posicaoY);
    doc.text(quantidade.toString(), 120, posicaoY);
    doc.text(`R$ ${valorUnitario.toFixed(2).replace(".", ",")}`, 140, posicaoY);
    doc.text(`R$ ${total.toFixed(2).replace()}`, 170, posicaoY);
    doc.line(20, posicaoY + 3, 190, posicaoY + 3);

    posicaoY += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(130, posicaoY - 5, 60, 25, "F");

    const totalGeral = total + (total * (ipi / 100));

    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL:", 135, posicaoY);
    doc.text(`R$ ${total.toFixed(2).replace(".", ",")}`, 170, posicaoY);

    doc.text(`IPI:`, 135, posicaoY + 8);
    doc.text(`${ipi.toFixed(2).replace(".", ",")} %`, 170, posicaoY + 8);

    doc.setFontSize(11);
    doc.text("TOTAL GERAL:", 135, posicaoY + 16);
    doc.text(
      `R$ ${totalGeral.toFixed(2).replace(".", ",")}`,
      170,
      posicaoY + 16
    );

if (ordemDeCompra.rastreabilidade) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("RASTREABILIDADE", 20, posicaoY);
  posicaoY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Código: ${ordemDeCompra.rastreabilidade}`, 20, posicaoY);
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

  } catch (err) {
    console.error("erro ao baixar ordem de compra no arquivo baixarOrdemDeCompraPDF", err);
  }

}

  export default baixarOrdemDeCompraPDF;