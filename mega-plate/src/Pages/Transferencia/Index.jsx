import './style.css';
// import logo from '../../assets/logo-megaplate.png';
import user from '../../assets/User.png';
import { useNavigate } from 'react-router-dom';
import iconDash from '../../assets/icon-dash.png';
import iconLogout from '../../assets/icon-logout.png';
import iconTransferencia from '../../assets/icon-transferencia.png';
import iconFormularios from '../../assets/icon-formularios.png';
import menuHamburguer from '../../assets/menu-hamburger.png';
import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function Transferencia() {
    const navigate = useNavigate();
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [quantidadeUMR, setQuantidadeUMR] = useState('');
    const [tipoMaterial, setTipoMaterial] = useState('');
    const [tipoTransferencia, setTipoTransferencia] = useState('');
    const [menuExpandido, setMenuExpandido] = useState(false);

    function toggleMenu() {
        setMenuExpandido(!menuExpandido);
    }


    function irParaOrdemDeCompra() {
        navigate('/ordemDeCompra');
    }

    function irParaCadastro() {
        navigate('/cadastro');
    }

    function irParaDashMaterial() {
        navigate('/dashboardMaterial');
    }

    function irParaDashFornecedor() {
        navigate('/dashboardFornecedor');
    }

    function irParaTransferencia() {
        navigate('/transferencia');
    }

    function handleTransferir() {
        setShowSuccessScreen(true);
    }

    function handleNovaTransferencia() {
        // Redefine os estados para os valores iniciais
        setQuantidadeUMR('');
        setTipoMaterial('');
        setTipoTransferencia('');
        setShowSuccessScreen(false); // Retorna para a tela de transferência
    }

    function fazerLogout() {
        navigate('/login');
    }

    function gerarPDF() {
        const doc = new jsPDF();

        // Adiciona título
        doc.setFontSize(18);
        doc.text('Relatório de Transferência de Material', 20, 20);

        // Adiciona informações da transferência
        doc.setFontSize(12);
        doc.text(`Quantidade UMR: ${quantidadeUMR}`, 20, 40);
        doc.text(`Tipo de Material: ${tipoMaterial}`, 20, 50);
        doc.text(`Tipo de Transferência: ${tipoTransferencia}`, 20, 60);

        // Adiciona rodapé
        doc.setFontSize(10);
        doc.text('Relatório gerado automaticamente.', 20, 280);

        // Salva o PDF
        doc.save('relatorio-transferencia.pdf');
    }

    return (
        <>
        {/* <div className="transferencia"> */}
            <div className={`container-transferencia ${showSuccessScreen ? 'success-screen' : 'transfer-screen'}`}>
                <header className="navbar-transferencia">
                    <div className={`menu-lateral ${menuExpandido ? 'expandido' : 'colapsado'}`}>
                        <img src={menuHamburguer}
                            alt="Menu"
                            className='menu-hamburguer'
                            onClick={toggleMenu}
                        />

                        {menuExpandido && (
                            <nav className="menu-items">
                                <ul className='menu-list'>
                                    <li>
                                        <img className='icons-menu' src={iconTransferencia} alt="Ícone de Transferência" />
                                        <span className="menu-text" onClick={irParaTransferencia}>Transferência</span>
                                    </li>
                                    <li className="submenu">
                                        <div className="icon-dashboard">
                                            <img className='icons-menu' src={iconDash} alt="Ícone de Dashboard" />
                                            <span className="menu-text">Dashboard ▾</span>
                                        </div>
                                        <ul className="submenu-items">
                                            <li>
                                                <span className="menu-text" onClick={irParaDashMaterial}>Dashboard Material</span>
                                            </li>
                                            <li>
                                                <span className="menu-text" onClick={irParaDashFornecedor}>Dashboard Fornecedor</span>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="submenu">
                                        <div className="submenu-title">
                                            <img className='icons-menu' src={iconFormularios} alt="Ícone de Formulários" />
                                            <span className="menu-text">Formulários ▾</span>
                                        </div>
                                        <ul className="submenu-items">
                                            <li>
                                                <span className="menu-text">Cadastrar Material</span>
                                            </li>
                                            <li>
                                                <span className="menu-text">Cadastrar Fornecedores</span>
                                            </li>
                                            <li>
                                                <span className="menu-text" onClick={irParaOrdemDeCompra}>Ordem de Compra</span>
                                            </li>
                                            <li>
                                                <span className="menu-text" onClick={irParaCadastro}>Cadastrar Usuários</span>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </nav>
                        )}
                        <div className="logout">
                            <img onClick={fazerLogout} src={iconLogout} alt="Logout" />
                            <span onClick={fazerLogout}>Log out</span>
                        </div>
                    </div>
                    <div className="perfil">
                        <span>Olá, Usuário!</span>

                        <img className="userPhoto" src={user} alt="" />
                    </div>
                </header>

                {/* Tela de transferência */}
                <div className="box-mega">
                    <h1>TRANSFERÊNCIA <br /> DE MATERIAL</h1>
                </div>

                <div className="box-campos">
                    <label htmlFor="input-quantidadeUMR">Quantidade UMR:</label>
                    <input
                        className="input-quantidadeUMR"
                        type="text"
                        maxLength={10}
                        placeholder="Quantidade UMR"
                        value={quantidadeUMR}
                        onChange={(e) => setQuantidadeUMR(e.target.value)}
                    />

                    <label htmlFor="select-tipoMaterial">Tipo de Material:</label>
                    <select
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

                    <label htmlFor="select-tipo">Tipo de Transferência:</label>
                    <select
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

                    <button className="botao-confirmar" onClick={handleTransferir}>
                        TRANSFERIR
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
                <div className="botoes-acao" style={{ display: showSuccessScreen ? 'block' : 'none' }}>
                    <button onClick={handleNovaTransferencia}>REALIZAR OUTRA TRANSFERÊNCIA</button>
                </div>
            </div>
            {/* </div> */}
        </>
    );
}

export default Transferencia;