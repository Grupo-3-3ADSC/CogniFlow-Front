import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBarStyles.css';
import iconDash from '../assets/icon-dash.png';
import iconLogout from '../assets/icon-logout.png';
import iconTransferencia from '../assets/icon-transferencia.png';
import iconFormularios from '../assets/icon-formularios.png';
import logoMega from '../assets/logo-megaplate.png';
import menuHamburger from '../assets/menu-hamburguer.png';
import user from '../assets/User.png';
import { useEffect } from 'react';
import { api } from '../provider/api';

const NavBar = () => {
  const navigate = useNavigate();
  const [showDashSubmenu, setShowDashSubmenu] = useState(false);
  const [showFormSubmenu, setShowFormSubmenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 520);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Usuario");

  const token = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('usuario');

  function getFoto() {

    if (token) {
      api.get(`/usuarios/${userId}/foto`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((resposta) => {
        setFile(resposta.data);
      }).catch((err) => {
        console.log("Erro de resgatar foto:", err);
      });
    }
  }

  function getUsuario() {
    if(token){
      api.get(`/usuarios/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((resposta) => {
      setNomeUsuario(resposta.data.nome);
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

  const toggleDashSubmenu = () => setShowDashSubmenu(prev => !prev);
  const toggleFormSubmenu = () => setShowFormSubmenu(prev => !prev);

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
            <li title="Perfil" onClick={() => navigate('/Perfil')}>
              <img className="icons-menu" src={user} alt="Perfil de usuário" />
              <span>Perfil</span>
            </li>
            <li title="Transferência" onClick={() => navigate('/transferencia')}>
              <img className="icons-menu" src={iconTransferencia} alt="Transferência" />
              <span>Transferência</span>
            </li>
            <li className="has-submenu" title="Dashboards" onClick={toggleDashSubmenu}>
              <img className="icons-menu" src={iconDash} alt="Dashboards" />
              <span>Dashboards</span>
              <svg className={`arrow-icon ${showDashSubmenu ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </li>
            {showDashSubmenu && (
              <ul className="submenu-list">
                <li onClick={() => navigate('/Fornecedor')}>Dashboard Fornecedor</li>
                <li onClick={() => navigate('/Material')}>Dashboard Material</li>
                <li onClick={() => navigate('/DashEstoque')}>Dashboard Estoque</li>
              </ul>
            )}
            <li className="has-submenu" title="Formulários" onClick={toggleFormSubmenu}>
              <img className="icons-menu" src={iconFormularios} alt="Formulários" />
              <span>Formulários</span>
              <svg className={`arrow-icon ${showFormSubmenu ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </li>
            {showFormSubmenu && (
              <ul className="submenu-list">
                <li onClick={() => navigate('/ordemDeCompra')}>Ordem de Compra</li>
                <li onClick={() => navigate('/cadastro')}>Cadastrar Usuários</li>
              </ul>
            )}
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
          src={`${import.meta.env.VITE_API_URL}/usuarios/${userId}/foto`}
          alt="imagem de usuário"
          className="icons-menu"
          onError={(e) => {
            e.target.onError = null;
            e.target.src = user;
          }}
        />
      </div>
    </header>
  );
};

export default NavBar;