import './style.css';
import logo from '../../assets/logo-megaplate.png';
import user from '../../assets/User.png';
import { useEffect, useState } from 'react';
import { api } from '../../provider/api.js';

export function Cadastro() {
  const irParaEstoque = () => {
    window.location.href = '/estoque';
  };

  const [listarUsuario, setListarUsuario] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '', 
    cargo: '',
    password: '',
  });

  useEffect(() => {
    exibir();
  }, []);

  const exibir = () => {
    api
      .get('/usuarios')
      .then((response) => {
        setListarUsuario(response.data);
      })
      .catch((error) => {
        console.error('Erro ao listar usuários:', error);
      });
  };

  const cadastrar = () => {
    if (!formData.nome || !formData.email || !formData.cargo || !formData.password) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    api
      .post('/usuarios', {
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo,
        password: formData.password,
      })
      .then((response) => {
        console.log(response.data);
        exibir();
        setFormData({ nome: '', email: '', cargo: '', password: '' }); // Reset form
      })
      .catch((error) => {
        console.error('Erro ao cadastrar usuário:', error);
      });
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left"></div>
        <div className="navbar-right">
          <img src={user} alt="User icon" />
        </div>
      </nav>
      <div className="tab-container">
        <div className="tab active">PERFIL</div>
        <div className="tab">CADASTRO</div>
      </div>
      <section className="cadastro">
        <div className="bloco-fundo">
          <div className="tab-container-user">
            <div className="tab active">Usuario</div>
            <div className="tab">Fornecedor</div>
          </div>
        </div>
        <aside className="aside-cadastro">
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className="form-content">
          <div className="input-group">
            <p>Nome</p>
            <input
              placeholder="Marcos Antonio"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="input-group">
            <p>Email</p>
            <input
              placeholder="exemplo@dominio.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="input-group">
            <p>Cargo</p>
            <input
              placeholder="Gerente"
              type="text"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
            />
          </div>

          <div className="input-group">
            <p>Senha</p>
            <input
              placeholder="********"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button onClick={cadastrar}>CADASTRAR</button>

          <a onClick={irParaEstoque}>
            Não tem conta? <span>Cadastrar</span>
          </a>
        </main>
        <section className="user-list">
          {listarUsuario.map((usuario) => (
            <div key={usuario.id || Math.random()} className="user-card">
              <p><strong>Nome:</strong> {usuario.nome}</p>
              <p><strong>Email:</strong> {usuario.email || 'N/A'}</p>
              <p><strong>Cargo:</strong> {usuario.cargo || 'N/A'}</p>
            </div>
          ))}
        </section>
      </section>
    </>
  );
}

export default Cadastro;