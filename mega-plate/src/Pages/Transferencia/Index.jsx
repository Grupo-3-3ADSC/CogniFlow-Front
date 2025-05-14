import './style.css';
import user from '../../assets/User.png';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

// Importando o componente NavBar reutilizável
import NavBar from '../../components/NavBar';

export function Transferencia() {
    const navigate = useNavigate();
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [quantidadeUMR, setQuantidadeUMR] = useState('');
    const [tipoMaterial, setTipoMaterial] = useState('');
    const [tipoTransferencia, setTipoTransferencia] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Adiciona a classe ao body
        document.body.classList.add('transferencia-body');

        // Remove a classe ao desmontar o componente
        return () => {
            document.body.classList.remove('transferencia-body');
        };
    }, []);

    function handleTransferir() {
        if (quantidadeUMR.trim() === '' || tipoMaterial.trim() === '' || tipoTransferencia.trim() === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        if (isNaN(quantidadeUMR)) {
            alert('A quantidade UMR deve ser um número.');
            return;
        }
        if (quantidadeUMR <= 0) {
            alert('A quantidade UMR deve ser maior que zero.');
            return;
        }
        if (tipoMaterial === 'Selecione uma opção') {
            alert('Por favor, selecione um tipo de material.');
            return;
        }
        if (tipoTransferencia === 'Selecione uma opção') {
            alert('Por favor, selecione um tipo de transferência.');
            return;
        }
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setShowSuccessScreen(true);
        }, 2000);
    }

    function handleNovaTransferencia() {
        setQuantidadeUMR('');
        setTipoMaterial('');
        setTipoTransferencia('');
        setShowSuccessScreen(false);
    }

    function gerarPDF() {
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('Mega Plate - Supremacia em Corte', 20, 20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text('Relatório de Transferência de Material', 20, 30);

        // Linha divisória
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Informações gerais
        const dataAtual = new Date().toLocaleString(); // Data e hora atual
        doc.setFontSize(10);
        doc.text(`Data e Hora: ${dataAtual}`, 20, 45);
        doc.text(`Usuário: Nome do Usuário`, 20, 50); // Substitua pelo nome do usuário, se disponível

        // Detalhes da transferência
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('Detalhes da Transferência:', 20, 65);

        doc.setFont("helvetica", "normal");
        doc.text(`Quantidade UMR: ${quantidadeUMR}`, 20, 75);
        doc.text(`Tipo de Material: ${tipoMaterial}`, 20, 85);
        doc.text(`Tipo de Transferência: ${tipoTransferencia}`, 20, 95);

        // Tabela de resumo
        doc.setFont("helvetica", "bold");
        doc.text('Resumo:', 20, 115);
        doc.setFont("helvetica", "normal");
        doc.text('---------------------------------------------', 20, 120);
        doc.text('Descrição                  Valor', 20, 130);
        doc.text('---------------------------------------------', 20, 135);
        doc.text('Material Transferido       R$ 500,00', 20, 145);
        doc.text('Taxa de Transferência      R$ 50,00', 20, 155);
        doc.text('---------------------------------------------', 20, 165);
        doc.text('Total:                     R$ 550,00', 20, 175);

        // Linha divisória
        doc.line(20, 185, 190, 185);

        // Rodapé
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text('Relatório gerado automaticamente pelo sistema.', 20, 280);
        doc.text('Mega Plate - Supremacia em Corte', 20, 290);

        // Salvar o PDF
        doc.save('relatorio-transferencia.pdf');
    }

    return (
        <>
            {/* Usando o componente NavBar reutilizável */}
            <NavBar userName="Usuário" />

            <div className={`container-transferencia ${showSuccessScreen ? 'success-screen' : 'transfer-screen'}`}>
                {/* Tela de transferência */}
                <div className="box-mega">
                    <h1>TRANSFERÊNCIA <br /> DE MATERIAL</h1>
                </div>

                <div className="box-campos">
                    <label htmlFor="quantidadeUMR">Quantidade UMR:</label>
                    <input
                        id='quantidadeUMR'
                        className="input-quantidadeUMR"
                        type="text"
                        maxLength={10}
                        placeholder="Quantidade UMR"
                        value={quantidadeUMR}
                        onChange={(e) => setQuantidadeUMR(e.target.value)}
                    />

                    <label htmlFor="tipoMaterial">Tipo de Material:</label>
                    <select
                        id='tipoMaterial'
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
                        id='tipo'
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

                {/* Tela de sucesso */}
                <div className="box-sucesso">
                    <h1>TRANSFERÊNCIA REALIZADA <br /> COM SUCESSO!</h1>
                    <button className="botao-relatorio" onClick={gerarPDF}>
                        BAIXAR RELATÓRIO DE TRANSFERÊNCIA
                    </button>
                </div>
            </div>
            <div className="botoes">
                <div className="botao-acao" style={{ display: showSuccessScreen ? 'block' : 'none' }}>
                    <button onClick={handleNovaTransferencia}>REALIZAR OUTRA TRANSFERÊNCIA</button>
                </div>
            </div>
        </>
    );
}

export default Transferencia;