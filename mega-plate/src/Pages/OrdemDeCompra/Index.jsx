import style from "./ordemDeCompra.module.css";
// import logo from '../../assets/logo-megaplate.png'
// import user from '../../assets/User.png';
import progressoImg from "../../assets/progressoOrdemDeCompra.png";
import progressoConcluido from "../../assets/progresso1Concluido.png";
import progresso2Concluido from "../../assets/progresso2Concluido.png";
import progresso3Concluido from "../../assets/progresso3Concluido.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../provider/api";
import { jsPDF } from "jspdf";
import NavBar from "../../components/NavBar";
import {
  toastError,
  toastSucess,
} from "../../components/toastify/ToastifyService";
import { jwtDecode } from "jwt-decode";
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
        console.error("Erro ao buscar usuários", erro);
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

  function finalizarOrdemDeCompra() {
    const usuarioId = getUsuarioIdDoToken(); // pegue o usuário do token
    if (!usuarioId) {
      toastError("Usuário não autenticado corretamente.");
      return;
    }

    const dadosParaApi = {
      usuarioId: usuarioId, // integer do token
   fornecedorId: Number(valoresInput["FornecedorId"] || valoresInput["FornecedorIdId"]), // id do fornecedor selecionado
      prazoEntrega: valoresInput["Prazo de entrega"], // string
      ie: valoresInput["I.E"], // string
      condPagamento: valoresInput["Cond. Pagamento"], // string
      valorKg: parseFloat(valoresInput["Valor por Kg"]?.replace(",", ".") || 0), // double
      rastreabilidade: valoresInput["Rastreabilidade"], // string
     estoqueId: Number(valoresInput["MaterialId"] || valoresInput["MaterialIdId"]), // id do estoque selecionado
      valorPeca: parseFloat(
        valoresInput["Valor por peça"]?.replace(",", ".") || 0
      ), // double
      descricaoMaterial: valoresInput["Descrição do material"], // string
      valorUnitario: parseFloat(
        valoresInput["Valor Unitário"]?.replace(",", ".") || 0
      ), // double
      ipi: parseFloat(valoresInput["IPI"]?.replace(",", ".") || 0), // double
      quantidade: parseInt(valoresInput["Quantidade"] || 0), // integer
    };

 api
  .post("/ordemDeCompra", dadosParaApi)
  .then((res) => {
    const novaId = res?.data?.id;

    if (!novaId || isNaN(novaId)) {
      console.error("ID inválido retornado:", res?.data);
      toastError("Erro ao obter o ID da nova ordem de compra.");
      return;
    }

    // Agora só entra aqui se tiver novaId válido
    return api.get(`/ordemDeCompra/${novaId}`);
  })
  .then((resDetalhado) => {
    if (!resDetalhado) return; // segurança

    setOrdemDeCompra(resDetalhado.data);
    toastSucess("Ordem cadastrada com sucesso!");
    setProgresso(4);
    setImage(etapas[4].imagem);
  })
  .catch((err) => {
    console.error("Erro geral na finalização:", err);
    toastError("Erro ao finalizar ordem de compra.");
  });

}

  const etapas = {
    1: {
      inputs: [
        {
          id: "input1",
          titulo: "Fornecedor",
          tipo: "select",
          options: listaFornecedores,
          optionLabel: "nomeFantasia", // o que aparece no dropdown
          optionValue: "fornecedorId", // o que será enviado (valor)
        },
        { id: "input2", titulo: "Prazo de entrega", tipo: "text" },
        { id: "input3", titulo: "I.E", tipo: "text" },
        { id: "input4", titulo: "Cond. Pagamento", tipo: "text" },
      ],
      imagem: progressoImg,
    },
    2: {
      inputs: [
        { id: "input1", titulo: "Valor por Kg", tipo: "text" },
        { id: "input2", titulo: "Rastreabilidade", tipo: "text" },
        {
          id: "input3",
          titulo: "Material",
          tipo: "select",
          options: listaMateriais,
          optionLabel: "tipoMaterial",
          optionValue: "id",
        },
        { id: "input4", titulo: "Valor por peça", tipo: "text" },
        { id: "input5", titulo: "Descrição do material", tipo: "text" },
      ],
      imagem: progressoConcluido,
    },
    3: {
      inputs: [
        { id: "input1", titulo: "Valor Unitário", tipo: "text" },
        { id: "input2", titulo: "IPI", tipo: "text" },
        { id: "input3", titulo: "Total", tipo: "text", disabled: true },
        { id: "input4", titulo: "Quantidade", tipo: "text" },
      ],
      imagem: progresso2Concluido,
    },
    4: {
      inputs: [],
      imagem: progresso3Concluido,
    },
  };

  const [progresso, setProgresso] = useState(1);
  const [image, setImage] = useState(etapas[1].imagem);
  const [titulo, setTitulo] = useState("ORDEM DE COMPRA");
  const [nomeBotao, setNomeBotao] = useState("PRÓXIMO");
  const [valoresInput, setValoresInput] = useState({});

  useEffect(() => {
    const valorUnitario =
      parseFloat((valoresInput["Valor Unitário"] || "").replace(",", ".")) || 0;
    const valorPorKg =
      parseFloat((valoresInput["Valor por Kg"] || "").replace(",", ".")) || 0;

    const total = valorUnitario * valorPorKg;

    setValoresInput((resultado) => ({
      ...resultado,
      Total: total.toFixed(2),
    }));
  }, [valoresInput["Valor Unitário"], valoresInput["Valor por Kg"]]);

  useEffect(() => {
    if (progresso == 5) {
      setTitulo("FORMULÁRIO FINALIZADO COM SUCESSO!");
    } else {
      setTitulo("ORDEM DE COMPRA");
    }
  }, [progresso]);

  if (!autenticacaoPassou) return null;

  function validarInputsVazias() {
    const inputs = etapas[progresso].inputs;
    for (let input of inputs) {
      if (input.titulo === "Fornecedor") continue;

      const valor = valoresInput[input.titulo];

      if (input.tipo === "select") {
        const valorId = valoresInput[input.titulo + "Id"];
        if (!valorId || valorId === "") return true;
      } else {
        if (!input.disabled && (!valor || valor.trim() === "")) {
          return true;
        }
      }
    }
    return false;
  }

  function validarInputsEspeciais() {
    const sqlPattern =
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
    const inputs = etapas[progresso].inputs;
    for (let input of inputs) {
      const valor = valoresInput[input.titulo];
      if (typeof valor === "string" && sqlPattern.test(valor)) {
        return false;
      }
      if (
        typeof valor === "string" &&
        /<script.*?>.*?<\/script>/gi.test(valor)
      ) {
        return false;
      }
    }
    return true;
  }

  function mudarProgresso() {
    if (!validarInputsEspeciais()) {
      toastError("Comando não permitido em uma das inputs");
      return;
    }

    if (validarInputsVazias()) {
      toastError("Por favor preencher todos os campos dessa seção!");
      return;
    }
    const novoProgresso = progresso + 1;

    if (etapas[novoProgresso]) {
      setProgresso(novoProgresso);
      setImage(etapas[novoProgresso].imagem);
    }

    if (progresso == 2) {
      setNomeBotao("FINALIZAR");
      return;
    }

    if (progresso == 3) {
      finalizarOrdemDeCompra();
      return;
    }

    setNomeBotao("PRÓXIMO");
  }

  function voltarProgresso() {
    const novoProgresso = progresso - 1;
    if (etapas[novoProgresso]) {
      setProgresso(novoProgresso);
      setImage(etapas[novoProgresso].imagem);
    }

    setNomeBotao("PRÓXIMO");
  }

  function reiniciarOrdemDeCompra() {
    setProgresso(1);
    setImage(etapas[1].imagem);
  }

  function irParaDashboard() {
    navigate("/Material");
  }

  function baixarPDF() {
    const doc = new jsPDF();

    const corPrimaria = [41, 128, 185];
    const corSecundaria = [149, 165, 166];
    const corTexto = [44, 62, 80];

    const fornecedorSelecionado = ordemDeCompra.fornecedor;

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

    if (fornecedorSelecionado) {
      doc.text(`CNPJ: ${fornecedorSelecionado.cnpj}`, 20, 28);
      doc.text(`Endereço: ${fornecedorDetalhes.complemento}`, 105, 20);
      doc.text(`Telefone: ${fornecedorDetalhes.telefone}`, 105, 28);
    }

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

    if (fornecedorSelecionado) {
      doc.text(`Nome: ${fornecedorSelecionado.nomeFantasia}`, 20, posicaoY);
      posicaoY += 6;
      if (fornecedorSelecionado.cnpj) {
        doc.text(`CNPJ: ${fornecedorSelecionado.cnpj}`, 20, posicaoY);
        posicaoY += 6;
      }
      if (fornecedorDetalhes.complemento) {
        doc.text(`Endereço: ${fornecedorDetalhes.complemento}`, 20, posicaoY);
        posicaoY += 6;
      }
    } else {
      doc.text("Fornecedor não encontrado", 20, posicaoY);
      posicaoY += 6;
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
    const ipi = parseFloat(valoresInput["IPI"]) || 0;

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

    posicaoY += 35;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 20, posicaoY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const observacoes = [
      "• Documento gerado automaticamente pelo sistema",
      "• Válido como comprovante de compra",
      "• IPI calculado conforme percentual informado",
      "• Para dúvidas, entre em contato conosco",
    ];
    observacoes.forEach((obs, index) => {
      doc.text(obs, 20, posicaoY + 8 + index * 6);
    });

    const alturaRodape = 280;
    doc.setFillColor(...corPrimaria);
    doc.rect(0, alturaRodape, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Documento gerado em " + new Date().toLocaleString("pt-BR"),
      20,
      alturaRodape + 8
    );

    doc.text(
      "www.megaplate.com.br | vendas@megaplate.com.br",
      20,
      alturaRodape + 12
    );

    if (fornecedorSelecionado) {
      doc.text(
        `www.${fornecedorSelecionado.nomeFantasia.toLowerCase()}.com.br | contato@${fornecedorSelecionado.nomeFantasia.toLowerCase()}.com.br`,
        20,
        alturaRodape + 16
      );
    }

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
        `CNPJ: ${fornecedor.cnpj || "N/A"}`,
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
      sheet.addRow([`Nome: ${fornecedor.nomeFantasia}`]);
      if (fornecedor.cnpj) sheet.addRow([`CNPJ: ${fornecedor.cnpj}`]);
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
          <img src={image} />
        </div>

        <main className={style.formContent}>
          <span
            className={style.spanTitulo}
            style={
              progresso == 4
                ? {
                    backgroundColor: "#1D597B",
                    width: "330px",
                    height: "200px",
                  }
                : { backgroundColor: "#05314C" }
            }
          >
            <h1>{titulo}</h1>
          </span>
          <div className={style.inputs}>
            {etapas[progresso].inputs.map((input) => (
              <div key={input.id} className={style.inputGroup}>
                <p>{input.titulo}</p>
                {input.tipo === "select" ? (
                  <select
                    value={valoresInput[input.titulo + "Id"] || ""}
                    onChange={(e) => {
                      const valorSelecionado = e.target.value;
                      const campoValor = input.optionValue || "id"; // Use optionValue definido

                      const selectedOption = input.options.find(
                        (opt) => String(opt[campoValor]) === valorSelecionado
                      );

                      setValoresInput({
                        ...valoresInput,
                        [input.titulo]: selectedOption
                          ? selectedOption[input.optionLabel]
                          : "",
                        [input.titulo + "Id"]: valorSelecionado,
                      });
                    }}
                  >
                    <option value="">Selecione</option>
                    {input.options.map((opt, idx) => {
                      const campoValor = input.optionValue || "id";
                      const valor = opt[campoValor] || idx;

                      return (
                        <option key={`${valor}`} value={valor}>
                          {opt[input.optionLabel]}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={valoresInput[input.titulo] || ""}
                    onChange={(e) =>
                      setValoresInput({
                        ...valoresInput,
                        [input.titulo]: e.target.value,
                      })
                    }
                    disabled={input.disabled}
                  />
                )}
              </div>
            ))}
          </div>

          <div className={style.botaoPdf}>
            <button
              disabled={progresso === 1}
              style={
                progresso != 4 ? { display: "none" } : { display: "block" }
              }
              onClick={baixarDocumentos}
            >
              BAIXAR ORDEM DE COMPRA
            </button>
          </div>
        </main>

        <div className={style.botoes}>
          {progresso > 1 && progresso < 4 ? (
            <button onClick={voltarProgresso}>VOLTAR</button>
          ) : (
            <span disabled={progresso === 1} style={{ visibility: "hidden" }}>
              VOLTAR
            </span>
          )}

          <button
            onClick={mudarProgresso}
            disabled={progresso === 4}
            style={progresso == 4 ? { display: "none" } : { display: "block" }}
          >
            {nomeBotao}
          </button>

          {progresso === 4 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={reiniciarOrdemDeCompra}
                disabled={progresso < 4}
                style={
                  progresso < 4 ? { display: "none" } : { display: "block" }
                }
              >
                CRIAR NOVA ORDEM DE COMPRA
              </button>

              <button
                onClick={irParaDashboard}
                disabled={progresso < 4}
                style={
                  progresso < 4 ? { display: "none" } : { display: "block" }
                }
              >
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
