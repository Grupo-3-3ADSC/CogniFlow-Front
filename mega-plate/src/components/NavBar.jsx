import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBarStyles.css';
import iconDash from '../assets/icon-dash.png';
import iconLogout from '../assets/icon-logout.png';
import iconTransferencia from '../assets/icon-transferencia.png';
import iconFormularios from '../assets/icon-formularios.png';
import iconHistorico from '../assets/icon-historico.png';
/* import iconGroup from '../assets/icon-group.png';
 */
import iconPasta from '../assets/icon-pasta.png';
import iconCaixa from '../assets/icon-caixa.png';
import iconCifrao from '../assets/icon-cifrao.png';
import logoMega from '../assets/logo-megaplate.png';
import menuHamburger from '../assets/menu-hamburguer.png';
import user from '../assets/User.png';
import { useEffect } from 'react';
import { api } from '../provider/api';

const NavBar = () => {
  const navigate = useNavigate();
  const [showDashSubmenu, setShowDashSubmenu] = useState(false);
  const [showGestaoSubmenu, setShowGestaoSubmenu] = useState(false);
  const [showFormSubmenu, setShowFormSubmenu] = useState(false);
  const [showHistoricoSubmenu, setShowHistoricoSubmenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 520);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Usuario");
  const [fotoUrl, setFotoUrl] = useState(null); // Mudança: usar fotoUrl específico
  const [fotoError, setFotoError] = useState(false);
  const [usuarioLista, setUsuarioLista] = useState([]);

  const token = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('usuario');

  function getFoto() {
    if (token) {
      setFotoError(false);

      api.get(`/usuarios/${userId}/foto`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob',
        timeout: 10000
      }).then((resposta) => {
        if (resposta.data && resposta.data.size > 0) {
          if (fotoUrl && fotoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(fotoUrl);
          }

          const imageUrl = URL.createObjectURL(resposta.data);
          console.log("NAVBAR: Nova URL criada:", imageUrl);
          setFotoUrl(imageUrl);
          setFotoError(false);
        } else {
          console.log("NAVBAR: Resposta vazia ou sem dados");
          setFotoUrl(null);
          setFotoError(true);
        }
      }).catch((err) => {
        setFotoUrl(null);
        setFotoError(true);
      });
    }
  }

  function getUsuario() {
    if (token) {
      api.get(`/usuarios/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((resposta) => {
        setNomeUsuario(resposta.data.nome);
        setUsuarioLista(resposta.data);
      }).catch((err) => {
        console.log("erro: ", err);
      });
    }
  }

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 520;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // fecha sidebar se sair do mobile
    };
    getFoto();
    getUsuario();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (fotoUrl && fotoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fotoUrl);
      }
    };
  }, [fotoUrl]);

  const toggleGestaoSubmenu = () => setShowGestaoSubmenu(prev => !prev);
  const toggleDashSubmenu = () => setShowDashSubmenu(prev => !prev);
  const toggleFormSubmenu = () => setShowFormSubmenu(prev => !prev);
  const toggleHistoricoSubmenu = () => setShowHistoricoSubmenu(prev => !prev);



  return (
    <header className="navbar-transferencia">
      {isMobile && (
        <img
          src={menuHamburger}
          alt="Menu"
          className="hamburger-icon"
          onClick={() => setSidebarOpen(prev => !prev)}
        />
      )}

      <div className={`menu-lateral ${isMobile ? (sidebarOpen ? 'open' : 'closed') : ''}`}>
        <img src={logoMega} alt="Logo" className="menu-logo" />
        <nav className="menu-items">
          <ul className="menu-list">

            <li title="Ordem de Compra" onClick={() => navigate('/ordemDeCompra')}>
              <img className="icons-menu" src={iconCaixa} alt="Ordem_de_Compra" />
              <span>Ordem de Compra</span>
            </li>

            <li title="Transferência" onClick={() => navigate('/transferencia')}>
              <img className="icons-menu" src={iconTransferencia} alt="Transferência" />
              <span>Transferência</span>
            </li>


            {/*            <li title='Tabela de Usuários' onClick={() => navigate('/TabelaUsuarios')}>
              <img className='icons-menu' src={iconGroup} alt="Tabela de Usuários" />
              <span>Listagem de Usuários</span>
            </li> */}

            <li className="has-submenu" title="Gestão" onClick={toggleGestaoSubmenu}>
              <img className="icons-menu" src={iconPasta} alt="Gestão" />
              <span>Gestão</span>
              <svg className={`arrow-icon ${showGestaoSubmenu ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </li>
            {showGestaoSubmenu && (
              <ul className="submenu-list">
                <li onClick={() => navigate('/TabelaUsuarios')}>Listagem de Usuários</li>
                <li onClick={() => navigate('/ListagemFornecedor')}>Listagem de Fornecedores</li>
              </ul>
            )}
            <li className="has-submenu" title="Dashboards" onClick={toggleDashSubmenu}>
              <img className="icons-menu" src={iconDash} alt="Dashboards" />
              <span>Dashboards</span>
              <svg className={`arrow-icon ${showDashSubmenu ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </li>
            {showDashSubmenu && (
              <ul className="submenu-list">
                <li onClick={() => navigate('/Material')}>Dashboard Material</li>
                <li onClick={() => navigate('/DashEstoque')}>Dashboard Estoque</li>
              </ul>
            )}
            <li title="Fornecedores" onClick={() => navigate('/Fornecedor')}>
              <img className="icons-cifrao" src={iconCifrao} alt="Fornecedor" />
              <span>Custos por Fornecedor</span>
            </li>
            {usuarioLista?.cargo?.id === 2 && (
              <li className="has-submenu" title="Formulários" onClick={toggleFormSubmenu}>
                <img className="icons-menu" src={iconFormularios} alt="Formulários" />
                <span>Cadastros</span>
                <svg className={`arrow-icon ${showFormSubmenu ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </li>
            )}
            {showFormSubmenu && (
              <ul className="submenu-list">


                {usuarioLista?.cargo?.id === 2 && ( // Verifica se o cargo do usuário logado é gestor (id === 2)
                  <li onClick={() => navigate('/cadastro')}>Cadastrar Usuários</li>
                )}
                {usuarioLista?.cargo?.id === 2 && ( // Verifica se o cargo do usuário logado é gestor (id === 2)
                  <li onClick={() => navigate('/CadastroFornecedor')}>Cadastro de Fornecedor</li>
                )}
              </ul>
            )}

            {usuarioLista?.cargo?.id === 2 && (
              <li className="has-submenu" title="Históricos" onClick={toggleHistoricoSubmenu}>
                <img className="icons-historico" src={iconHistorico} alt="Históricos" />
                <span>Históricos</span>
                <svg className={`arrow-icon ${showHistoricoSubmenu ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </li>
            )}
            {showHistoricoSubmenu && (
              <ul className="submenu-list">


                <li onClick={() => navigate('/HistoricoOrdemDeCompra')}>Histórico de Ordem de Compra</li>

                <li onClick={() => navigate('/HistoricoTransferencia')}>Histórico de Transferências</li>
              </ul>


            )}


            {usuarioLista?.cargo?.id === 2 && (
              <li title="Relatórios" onClick={() => navigate('/relatorios')}>
                <img className="icons-menu" src={iconFormularios} alt="Relatórios" />
                <span>Relatórios</span>
              </li>
            )}



            <li title="Perfil" onClick={() => navigate('/Perfil')}>
              <img className="icons-menu" src={user} alt="Perfil de usuário" />
              <span>Perfil</span>
            </li>

          </ul>


        </nav>
        <div className="logout" onClick={() => navigate('/')}>
          <img src={iconLogout} alt="Logout" title="Logout" />
          <span>Logoff</span>
        </div>
      </div>

      <div className="perfil">
        <span>Olá, {nomeUsuario}!</span>
        <img
          src={fotoUrl || user}
          alt="imagem de usuário"
          className="icons-menu"
          onClick={() => navigate('/Perfil')}
          onError={(e) => {
            e.target.onError = null;
            e.target.src = user;
            setFotoError(true);
          }}
        />
      </div>
    </header>
  );
};

export default NavBar;