import "./style.css";
import user from "../../assets/User.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import NavBar from "../../components/NavBar";
import { toastError,toastSuccess} from "../../components/toastify/ToastifyService";
import { jwtDecode } from "jwt-decode";
import { api } from "../../provider/api";

export function Transferencia() {
  const navigate = useNavigate();

  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);

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

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [quantidadeAtual, setquantidadeAtual] = useState("");
  const [tipoMaterial, setTipoMaterial] = useState("");
  const [materiais, setMateriais] = useState([]);
  const [tipoTransferencia, setTipoTransferencia] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dadosUltimaTransferencia, setDadosUltimaTransferencia] =
    useState(null);

  function getEstoque() {
    api
      .get("/estoque")
      .then((resposta) => {
        setMateriais(resposta.data);
      })
      .catch((err) => {
        console.log("erro:", err);
      });
  }

  useEffect(() => {
    document.body.classList.add("transferencia-body");
    getEstoque();
    return () => document.body.classList.remove("transferencia-body");
  }, []);

  if (!autenticacaoPassou) return null;

  function handleTransferir() {
    const validationMessage = validateInputs();
    if (validationMessage) {
      toastError(validationMessage);
      return;
    }

    setIsLoading(true);

    const dados = {
      tipoMaterial,
      quantidadeAtual: Number(quantidadeAtual),
      tipoTransferencia,
    };

    api
      .put("/estoque/retirar", dados)
      .then((resposta) => {
        gerarPDF(dados);
        setDadosUltimaTransferencia(dados); // Salva os dados da última transferência
        resetForm();
        setShowSuccessScreen(true);
        showSuccessToast(
          resposta.data.message || "Transferência realizada com sucesso"
        );
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
          toastError(err.response.data.message);
        } else {
          toastError("Erro ao realizar transferência.");
        }
        console.log("erro:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // Função helper para validação
  function validateInputs() {
    const validations = [
      {
        condition:
          !quantidadeAtual?.trim() ||
          !tipoMaterial?.trim() ||
          !tipoTransferencia?.trim(),
        message: "Por favor, preencha todos os campos.",
      },
      {
        condition: isNaN(quantidadeAtual),
        message: "A quantidade UMR deve ser um número.",
      },
      {
        condition: Number(quantidadeAtual) <= 0,
        message: "A quantidade UMR deve ser maior que zero.",
      },
      {
        condition: !Number.isInteger(Number(quantidadeAtual)),
        message: "A quantidade UMR deve ser um número inteiro.",
      },
      {
        condition: tipoMaterial === "Selecione uma opção",
        message: "Por favor, selecione um tipo de material.",
      },
      {
        condition: tipoTransferencia === "Selecione uma opção",
        message: "Por favor, selecione um tipo de transferência.",
      },
    ];

    const failedValidation = validations.find((v) => v.condition);
    return failedValidation?.message || null;
  }

  // Função helper para resposta de erro
  function handleErrorResponse(response, rawResponse, contentType) {
    let errorData = {
      message: `Erro ${response.status}: ${response.statusText}`,
    };

    try {
      if (contentType?.includes("application/json")) {
        errorData = JSON.parse(rawResponse);
      } else {
        errorData.message = rawResponse || "Erro desconhecido do servidor";
      }
    } catch (parseError) {
      console.error("Erro ao processar resposta de erro:", parseError);
    }

    // Mapeamento de erros específicos
    const errorMessages = {
      404: "Material não encontrado. Verifique se o material está cadastrado.",
      400: errorData.message || "Dados inválidos na requisição.",
      401: "Sessão expirada. Faça login novamente.",
      403: "Você não tem permissão para realizar esta operação.",
      409: "Conflito: Esta transferência já foi processada.",
      422: "Dados inconsistentes. Verifique as informações.",
      500: "Erro interno do servidor. Tente novamente em alguns minutos.",
    };

    const message =
      errorMessages[response.status] ||
      errorData.message ||
      "Erro ao realizar transferência.";
    alert(message);

    // Log detalhado para debugging
    console.error("Erro HTTP:", { status: response.status, errorData });
  }

  // Função helper para tratamento de erros de rede/timeout
  function handleError(error) {
    console.error("Erro na requisição:", {
      error: error.message,
      tipoMaterial,
      quantidadeAtual,
      tipoTransferencia,
    });

    const errorMessages = {
      "Material não encontrado.":
        "Material não encontrado. Verifique se o material está cadastrado ou entre em contato com o administrador.",
      AbortError:
        "Tempo de requisição esgotado. Verifique sua conexão e tente novamente.",
      TypeError: "Erro de conexão com o servidor. Verifique sua internet.",
      NetworkError: "Erro de rede. Verifique sua conexão.",
      default: "Erro de conexão com o servidor. Tente novamente.",
    };

    const message =
      errorMessages[error.name] ||
      errorMessages[error.message] ||
      errorMessages.default;

    alert(message);
  }

  // Função helper para obter token (se necessário)
  function getAuthToken() {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || ""
    );
  }

  // Função helper para toast de sucesso (opcional)
  function showSuccessToast(message) {
    // Implementar conforme biblioteca de toast utilizada
    // Exemplo: toast.success(message);
    console.log("Sucesso:", message);
  }

  function gerarPDF(materiais) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Define colors
    const primaryColor = [52, 58, 64]; // Dark gray
    const secondaryColor = [0, 123, 255]; // Blue
    const textColor = [33, 37, 41]; // Dark text

    // Define margins and spacing
    const marginLeft = 20;
    const marginTop = 20;

    // Header Section
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RELATÓRIO DE TRANSFERÊNCIA", marginLeft, marginTop + 5);
    doc.setFontSize(14);
    doc.text("DE MATERIAL", marginLeft, marginTop + 12);

    // Reset text color
    doc.setTextColor(...textColor);

    // Metadata Section - with styled title
    let yPos = 45;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("Informações do Registro", marginLeft, yPos);

    // Metadata content
    doc.setFillColor(248, 249, 250);
    doc.rect(marginLeft - 5, yPos + 5, 170, 25, "F");

    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    // Two-column layout for metadata
    const dataAtual = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    doc.setFont("helvetica", "bold");
    doc.text("Data e Hora:", marginLeft, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(dataAtual, marginLeft + 35, yPos);

    // doc.setFont('helvetica', 'bold');
    // doc.text('Usuário:', marginLeft + 100, yPos);
    // doc.setFont('helvetica', 'normal');
    // doc.text('Nome do Usuário', marginLeft + 130, yPos);

    // Details Section
    yPos += 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.text("Detalhes da Movimentação", marginLeft, yPos);

    // Details content box
    doc.setFillColor(248, 249, 250);
    doc.rect(marginLeft - 5, yPos + 5, 170, 50, "F");

    // Details content with styled labels
    yPos += 20;
    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    const details = [
      {
        label: "Quantidade:",
        value: materiais?.quantidadeAtual || "Não informado", // Added null check and fallback
      },
      {
        label: "Tipo de Material:",
        value: materiais?.tipoMaterial || "Não informado", // Added null check and fallback
      },
      {
        label: "Tipo de Transferência:",
        value: materiais?.tipoTransferencia || "Não informado", // Added null check and fallback
      },
    ];

    details.forEach((item, index) => {
      doc.setFont("helvetica", "bold");
      doc.text(item.label, marginLeft, yPos + index * 12);
      doc.setFont("helvetica", "normal");
      doc.text(String(item.value), marginLeft + 50, yPos + index * 12);
    });

    // Additional Information Section
    yPos += 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.text("Informações Adicionais", marginLeft, yPos);

    // Add a box for additional info
    doc.setFillColor(248, 249, 250);
    doc.rect(marginLeft - 5, yPos + 5, 170, 30, "F");

    yPos += 20;
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Este documento é gerado automaticamente e possui validade legal.",
      marginLeft,
      yPos
    );

    // Footer
    doc.setDrawColor(220, 220, 220);
    doc.line(marginLeft - 5, 270, 190, 270);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("Documento gerado automaticamente pelo sistema.", marginLeft, 280);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("MEGA PLATE", marginLeft, 285);
    doc.setFont("helvetica", "normal");
    doc.text("- Supremacia em Corte", marginLeft + 20, 285);

    // Page number
    doc.setTextColor(128, 128, 128);
    doc.text(`Página 1 de 1`, 180, 285);

    doc.save("relatorio-transferencia.pdf");
  }

  // Função helper para resetar formulário
  function resetForm() {
    setquantidadeAtual("");
    setTipoMaterial("");
    setTipoTransferencia("");
  }
  return (
    <>
      <NavBar userName="Usuário" />

      <div
        className={`container-transferencia ${
          showSuccessScreen ? "success-screen" : "transfer-screen"
        }`}
      >
        <div className="box-mega">
          <h1>
            TRANSFERÊNCIA <br /> DE MATERIAL
          </h1>
        </div>

        <div className="box-campos">
          <label htmlFor="quantidadeAtual">Quantidade:</label>
          <input
            id="quantidadeAtual"
            className="input-quantidadeAtual"
            type="text"
            maxLength={10}
            placeholder="Quantidade: 100"
            value={quantidadeAtual}
            onChange={(e) => {
              // Remove tudo que não for número
              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
              setquantidadeAtual(onlyNums);
            }}
          />

          <label htmlFor="tipoMaterial">Tipo de Material:</label>
          <select
            id="tipoMaterial"
            className="input-material"
            value={tipoMaterial}
            onChange={(e) => setTipoMaterial(e.target.value)}
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            {materiais &&
              materiais.map((material) => (
                <option
                  key={material.tipoMaterial}
                  value={material.tipoMaterial}
                >
                  {material.tipoMaterial}
                </option>
              ))}
          </select>

          <label htmlFor="tipo">Tipo de Transferência:</label>
          <select
            id="tipo"
            className="input-tipoTransferencia"
            value={tipoTransferencia}
            onChange={(e) => setTipoTransferencia(e.target.value)}
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            <option value="Interna">Interna</option>
            <option value="Externa">Externa</option>
          </select>

          <button
            className="botao-confirmar"
            onClick={handleTransferir}
            disabled={isLoading}
          >
            {isLoading ? "Transferindo..." : "TRANSFERIR"}
          </button>
        </div>

        <div className="box-sucesso">
          <h1>
            TRANSFERÊNCIA REALIZADA <br /> COM SUCESSO!
          </h1>
          <button
            className="botao-relatorio"
            onClick={() => gerarPDF(dadosUltimaTransferencia)}
          >
            BAIXAR RELATÓRIO DE TRANSFERÊNCIA
          </button>
        </div>
      </div>

      <div className="botoes">
        <div
          className="botao-acao"
          style={{ display: showSuccessScreen ? "block" : "none" }}
        >
          <button
            onClick={() => {
              resetForm();
              setShowSuccessScreen(false);
            }}
          >
            REALIZAR OUTRA TRANSFERÊNCIA
          </button>
        </div>
      </div>
    </>
  );
}

export default Transferencia;
