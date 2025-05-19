import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBarStyles.css';

import iconDash from '../assets/icon-dash.png';
import iconLogout from '../assets/icon-logout.png';
import iconTransferencia from '../assets/icon-transferencia.png';
import iconFormularios from '../assets/icon-formularios.png';
import menuHamburguer from '../assets/logo-megaplate.png';
import user from '../assets/User.png';

const NavBar = ({ userName = "Usuário" }) => {
  const navigate = useNavigate();
  const [showDashSubmenu, setShowDashSubmenu] = useState(false);
  const [showFormSubmenu, setShowFormSubmenu] = useState(false);

  const toggleDashSubmenu = () => setShowDashSubmenu(prev => !prev);
  const toggleFormSubmenu = () => setShowFormSubmenu(prev => !prev);

  return (
    <header className="navbar-transferencia">
      <div className="menu-lateral">
        <img
          src={menuHamburguer}
          alt="Logo"
          className="menu-hamburguer"
        />

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
  <svg
    className={`arrow-icon ${showDashSubmenu ? 'rotate' : ''}`}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
</li>

            {showDashSubmenu && (
              <ul className="submenu-list">
                <li onClick={() => navigate('/Fornecedor')}>Dashboard Fornecedor</li>
                <li onClick={() => navigate('/Material')}>Dashboard Material</li>
              </ul>
            )}

<li className="has-submenu" title="Formulários" onClick={toggleFormSubmenu}>
  <img className="icons-menu" src={iconFormularios} alt="Formulários" />
  <span>Formulários</span>
  <svg
    className={`arrow-icon ${showFormSubmenu ? 'rotate' : ''}`}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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
        <span>Olá, {userName}!</span>
        <img className="userPhoto" src={user} alt="Usuário"
        onClick={() => navigate('/Perfil')} />
      </div>
    </header>
  );
};

export default NavBar;
