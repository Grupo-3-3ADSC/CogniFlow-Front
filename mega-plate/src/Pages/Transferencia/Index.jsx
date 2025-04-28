import './style.css';
import logo from '../../assets/logo-megaplate.png';
import user from '../../assets/User.png';
import { useNavigate } from 'react-router-dom';
import iconDash from '../../assets/icon-dash.png';
import iconLogout from '../../assets/icon-logout.png';
import iconTransferencia from '../../assets/icon-transferencia.png';
import iconFormularios from '../../assets/icon-formularios.png';
import { useState } from 'react';

export function Transferencia() {
    const navigate = useNavigate();
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);

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

    function handleTransferir() {
        setShowSuccessScreen(true); 
    }

    function fazerLogout() {
        navigate('/login');
    }

    return (
        <>
            <div className={`container ${showSuccessScreen ? 'success-screen' : 'transfer-screen'}`}>
                <header className="navbar">
                    <div className="menu-lateral">
                        <img src={logo} alt="" />
                        <nav className="menu-items">
                            <ul>
                                <li>
                                    <img src={iconTransferencia} alt="Ícone de Transferência" />
                                    <span className="menu-text">Transferência</span>
                                </li>
                                <li className="submenu">
                                    <div className="icon-dashboard">
                                        <img src={iconDash} alt="Ícone de Dashboard" />
                                        <span className="menu-text">Dashboard ▾</span>
                                    </div>
                                    <ul className="submenu-items">
                                        <li onClick={irParaDashMaterial}>
                                            <span className="menu-text">Dashboard Material</span>
                                        </li>
                                        <li onClick={irParaDashFornecedor}>
                                            <span className="menu-text">Dashboard Fornecedor</span>
                                        </li>
                                    </ul>
                                </li>
                                <li className="submenu">
                                    <div className="submenu-title">
                                        <img src={iconFormularios} alt="Ícone de Formulários" />
                                        <span className="menu-text">Formulários ▾</span>
                                    </div>
                                    <ul className="submenu-items">
                                        <li>
                                            <span className="menu-text">Cadastrar Materiais</span>
                                        </li>
                                        <li>
                                            <span className="menu-text">Cadastrar Fornecedores</span>
                                        </li>
                                        <li onClick={irParaOrdemDeCompra}>
                                            <span className="menu-text">Ordem de Compra</span>
                                        </li>
                                        <li onClick={irParaCadastro}>
                                            <span className="menu-text">Cadastrar Usuários</span>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                        <div className="logout">
                            <img onClick={fazerLogout} src={iconLogout} alt="Logout" />
                            <span onClick={fazerLogout}>Log out</span>
                        </div>
                    </div>
                    <div className="perfil">
                        <img className="userPhoto" src={user} alt="" />
                    </div>
                </header>

                {/* Tela de transferência */}
                <div className="box-mega">
                    <h1>TRANSFERÊNCIA <br /> DE MATERIAL</h1>
                </div>

                <div className="box-campos">
                    <label htmlFor="input-quantidadeUMR">Quantidade UMR:</label>
                    <input className="input-quantidadeUMR" type="text" maxLength={10} placeholder="Quantidade UMR" />

                    <label htmlFor="select-tipoMaterial">Tipo de Material:</label>
                    <select className="input-material" type="text">
                        <option value="" disabled selected>Selecione uma opção</option>
                        <option value="">SAE 1020</option>
                        <option value="">SAE 1045</option>
                        <option value="">HARDOX 450</option>
                    </select>

                    <label htmlFor="select-tipo">Tipo de Transferência:</label>
                    <select className="input-tipoTransferencia" type="text">
                        <option value="" disabled selected>Selecione uma opção</option>
                        <option value="">Interna</option>
                        <option value="">Externa</option>
                    </select>

                    <button className="botao-confirmar" onClick={handleTransferir}>TRANSFERIR</button>
                </div>

                {/* Tela de sucesso */}
                <div className="box-sucesso">
                    <h1>TRANSFERÊNCIA REALIZADA COM SUCESSO!</h1>
                    <p>Foi enviado uma confirmação para o seu e-mail!</p>
                    <button className="botao-relatorio">BAIXAR RELATÓRIO DE TRANSFERÊNCIA</button>
                    <button onClick={() => navigate('/dashboard')}>IR PARA DASHBOARD</button>
                    <button onClick={() => setShowSuccessScreen(false)}>REALIZAR OUTRA TRANSFERÊNCIA</button>
                </div>
            </div>
        </>
    );
}

export default Transferencia;