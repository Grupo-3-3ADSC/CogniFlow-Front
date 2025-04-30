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

        doc.setFontSize(18);
        doc.text('Relatório de Transferência de Material', 20, 20);

        doc.setFontSize(12);
        const dataAtual = new Date().toLocaleString(); // Data e hora atual
        doc.text(`Data e Hora: ${dataAtual}`, 20, 40);
        doc.text(`Usuário: Nome do Usuário`, 20, 50); // Substitua pelo nome do usuário, se disponível

        doc.text(`Quantidade UMR: ${quantidadeUMR}`, 20, 70);
        doc.text(`Tipo de Material: ${tipoMaterial}`, 20, 80);
        doc.text(`Tipo de Transferência: ${tipoTransferencia}`, 20, 90);

        doc.setFontSize(10);
        doc.text('Relatório gerado automaticamente pelo sistema.', 20, 280);
        doc.text('Mega Plate - Supremacia em Corte', 20, 290);

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