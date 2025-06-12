import './style.css';
import user from '../../assets/User.png';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import NavBar from '../../components/NavBar';

export function Transferencia() {
    const navigate = useNavigate();
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [quantidadeUMR, setQuantidadeUMR] = useState('');
    const [tipoMaterial, setTipoMaterial] = useState('');
    const [tipoTransferencia, setTipoTransferencia] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.body.classList.add('transferencia-body');
        return () => document.body.classList.remove('transferencia-body');
    }, []);

    async function verificarMaterial(tipoMaterial) {
        const response = await fetch(`/api/materiais/${encodeURIComponent(tipoMaterial)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, // Descomente se necessário
            },
        });
        if (!response.ok) {
            throw new Error('Material não encontrado.');
        }
        return response.json();
    }

    async function handleTransferir() {
    // 1. Validação consolidada em função separada
    const validationError = validateInputs();
    if (validationError) {
        alert(validationError);
        return;
    }

    setIsLoading(true);
    
    try {
        // 2. Verificação do material antes da requisição
        await verificarMaterial(tipoMaterial);
        
        // 3. Configuração da requisição com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Aumentado para 10s
        
        const response = await fetch(`/api/materiais/${encodeURIComponent(tipoMaterial)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${getAuthToken()}`, // Função helper para token
            },
            body: JSON.stringify({
                quantidade: parseInt(quantidadeUMR, 10), // Garantir tipo inteiro
                tipoTransferencia,
                timestamp: new Date().toISOString() // Adicionar timestamp
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // 4. Processamento da resposta melhorado
        await handleResponse(response);
        
    } catch (error) {
        handleError(error);
    } finally {
        setIsLoading(false);
    }
}

// Função helper para validação
function validateInputs() {
    const validations = [
        {
            condition: !quantidadeUMR?.trim() || !tipoMaterial?.trim() || !tipoTransferencia?.trim(),
            message: 'Por favor, preencha todos os campos.'
        },
        {
            condition: isNaN(quantidadeUMR),
            message: 'A quantidade UMR deve ser um número.'
        },
        {
            condition: Number(quantidadeUMR) <= 0,
            message: 'A quantidade UMR deve ser maior que zero.'
        },
        {
            condition: !Number.isInteger(Number(quantidadeUMR)),
            message: 'A quantidade UMR deve ser um número inteiro.'
        },
        {
            condition: tipoMaterial === 'Selecione uma opção',
            message: 'Por favor, selecione um tipo de material.'
        },
        {
            condition: tipoTransferencia === 'Selecione uma opção',
            message: 'Por favor, selecione um tipo de transferência.'
        }
    ];

    const failedValidation = validations.find(v => v.condition);
    return failedValidation?.message || null;
}

// Função helper para processar resposta
async function handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const rawResponse = await response.text();
    
    console.log('Resposta do servidor:', { 
        status: response.status, 
        contentType, 
        rawResponse: rawResponse.substring(0, 200)
    });

    if (!contentType?.includes('application/json')) {
        throw new Error(`Resposta inesperada do servidor: ${rawResponse.substring(0, 200)}`);
    }

    const data = JSON.parse(rawResponse);
    if (response.ok) {
        handleSuccessResponse(data, contentType);
    } else {
        handleErrorResponse(response, data, contentType);
    }
}
// Função helper para resposta de sucesso
function handleSuccessResponse(rawResponse, contentType) {
    let data = {};
    
    try {
        if (contentType?.includes('application/json')) {
            data = JSON.parse(rawResponse);
        } else {
            data = { message: rawResponse || 'Transferência realizada com sucesso' };
        }
        
        console.log('Transferência realizada:', data);
        
        // Resetar formulário
        resetForm();
        
        // Mostrar tela de sucesso
        setShowSuccessScreen(true);
        
        // Opcional: mostrar toast de sucesso
        showSuccessToast(data.message || 'Transferência realizada com sucesso');
        
    } catch (parseError) {
        console.error('Erro ao processar resposta de sucesso:', parseError);
        alert('Transferência realizada, mas houve erro no processamento da resposta.');
    }
}

// Função helper para resposta de erro
function handleErrorResponse(response, rawResponse, contentType) {
    let errorData = { message: `Erro ${response.status}: ${response.statusText}` };
    
    try {
        if (contentType?.includes('application/json')) {
            errorData = JSON.parse(rawResponse);
        } else {
            errorData.message = rawResponse || 'Erro desconhecido do servidor';
        }
    } catch (parseError) {
        console.error('Erro ao processar resposta de erro:', parseError);
    }

    // Mapeamento de erros específicos
    const errorMessages = {
        404: 'Material não encontrado. Verifique se o material está cadastrado.',
        400: errorData.message || 'Dados inválidos na requisição.',
        401: 'Sessão expirada. Faça login novamente.',
        403: 'Você não tem permissão para realizar esta operação.',
        409: 'Conflito: Esta transferência já foi processada.',
        422: 'Dados inconsistentes. Verifique as informações.',
        500: 'Erro interno do servidor. Tente novamente em alguns minutos.'
    };

    const message = errorMessages[response.status] || errorData.message || 'Erro ao realizar transferência.';
    alert(message);
    
    // Log detalhado para debugging
    console.error('Erro HTTP:', { status: response.status, errorData });
}

// Função helper para tratamento de erros de rede/timeout
function handleError(error) {
    console.error('Erro na requisição:', { 
        error: error.message, 
        tipoMaterial, 
        quantidadeUMR, 
        tipoTransferencia 
    });

    const errorMessages = {
        'Material não encontrado.': 'Material não encontrado. Verifique se o material está cadastrado ou entre em contato com o administrador.',
        'AbortError': 'Tempo de requisição esgotado. Verifique sua conexão e tente novamente.',
        'TypeError': 'Erro de conexão com o servidor. Verifique sua internet.',
        'NetworkError': 'Erro de rede. Verifique sua conexão.',
        default: 'Erro de conexão com o servidor. Tente novamente.'
    };

    const message = errorMessages[error.name] || 
                   errorMessages[error.message] || 
                   errorMessages.default;
    
    alert(message);
}

// Função helper para resetar formulário
function resetForm() {
    setQuantidadeUMR('');
    setTipoMaterial('');
    setTipoTransferencia('');
}

// Função helper para obter token (se necessário)
function getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

// Função helper para toast de sucesso (opcional)
function showSuccessToast(message) {
    // Implementar conforme biblioteca de toast utilizada
    // Exemplo: toast.success(message);
    console.log('Sucesso:', message);
}

    function gerarPDF(data) {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Relatório de Transferência de Material', 20, 20);

        doc.setFontSize(12);
        const dataAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }); // Data e hora atual em -03
        doc.text(`Data e Hora: ${dataAtual}`, 20, 40);
        doc.text(`Usuário: Nome do Usuário`, 20, 50); // Substitua pelo nome real do usuário

        doc.text(`Quantidade UMR: ${data.quantidade || quantidadeUMR}`, 20, 70);
        doc.text(`Tipo de Material: ${data.tipoMaterial || tipoMaterial}`, 20, 80);
        doc.text(`Tipo de Transferência: ${data.tipoTransferencia || tipoTransferencia}`, 20, 90);

        doc.setFontSize(10);
        doc.text('Relatório gerado automaticamente pelo sistema.', 20, 280);
        doc.text('Mega Plate - Supremacia em Corte', 20, 290);

        doc.save('relatorio-transferencia.pdf');
    }

    return (
        <>
            <NavBar userName="Usuário" />

            <div className={`container-transferencia ${showSuccessScreen ? 'success-screen' : 'transfer-screen'}`}>
                <div className="box-mega">
                    <h1>TRANSFERÊNCIA <br /> DE MATERIAL</h1>
                </div>

                <div className="box-campos">
                    <label htmlFor="quantidadeUMR">Quantidade UMR:</label>
                    <input
                        id="quantidadeUMR"
                        className="input-quantidadeUMR"
                        type="text"
                        maxLength={10}
                        placeholder="Quantidade UMR"
                        value={quantidadeUMR}
                        onChange={(e) => setQuantidadeUMR(e.target.value)}
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
                        <option value="SAE 1020">SAE 1020</option>
                        <option value="SAE 1045">SAE 1045</option>
                        <option value="HARDOX 450">HARDOX 450</option>
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

                    <button className="botao-confirmar" onClick={handleTransferir} disabled={isLoading}>
                        {isLoading ? 'Transferindo...' : 'TRANSFERIR'}
                    </button>
                </div>

                <div className="box-sucesso">
                    <h1>TRANSFERÊNCIA REALIZADA <br /> COM SUCESSO!</h1>
                    <button className="botao-relatorio" onClick={() => gerarPDF({ quantidade: quantidadeUMR, tipoMaterial, tipoTransferencia })}>
                        BAIXAR RELATÓRIO DE TRANSFERÊNCIA
                    </button>
                </div>
            </div>

            <div className="botoes">
                <div className="botao-acao" style={{ display: showSuccessScreen ? 'block' : 'none' }}>
                    <button onClick={handleTransferir}>REALIZAR OUTRA TRANSFERÊNCIA</button>
                </div>
            </div>
        </>
    );
}

export default Transferencia;