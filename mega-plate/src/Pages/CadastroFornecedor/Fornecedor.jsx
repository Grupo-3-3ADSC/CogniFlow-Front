import styles from './fornecedor.module.css';
import logo from '../../assets/logo-megaplate.png';
import { useState } from 'react';
import NavBar from '../../components/NavBar';
import Swal from 'sweetalert2';
import { api } from '../../provider/api.js';

export function CadastroFornecedor() {
  const [progresso, setProgresso] = useState(1);
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    cep: '',
    endereco: '',
    numero: '',
    telefone: '',
    email: '',
  });

  const cadastrarFornecedor = () => {
    if (!formData.cnpj || !formData.nomeFantasia || !formData.razaoSocial || !formData.cep || !formData.endereco || !formData.numero || !formData.telefone || !formData.email) {
      Swal.fire({
        title: "Preencha as informações",
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const userData = {
      cnpj: formData.cnpj.trim(),
      nomeFantasia: formData.nomeFantasia.trim(),
      razaoSocial: formData.razaoSocial.trim(),
      cep: formData.cep.trim(),
      endereco: formData.endereco.trim(),
      numero: formData.numero.trim(),
      telefone: formData.telefone.trim(),
      email: formData.email.trim()
    };

    api.post('/fornecedores', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      console.log('Resposta do servidor:', response.data);
      Swal.fire({
        title: "Fornecedor cadastrado com sucesso!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      setFormData({
        cnpj: '',
        nomeFantasia: '',
        razaoSocial: '',
        cep: '',
        endereco: '',
        numero: '',
        telefone: '',
        email: ''
      });
      setProgresso(1);
    }).catch((error) => {
      console.error('Erro ao cadastrar fornecedor:', error);
      Swal.fire({
        title: "Erro ao cadastrar fornecedor",
        text: "Por favor, tente novamente mais tarde.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    });
  };

  function avancar() {
    if (progresso < 3) setProgresso(progresso + 1);
  }

  function voltar() {
    if (progresso > 1) setProgresso(progresso - 1);
  }

  return (
    <>
      <NavBar />

      <div className={styles['tab-container']}></div>
      <section className={styles.material}>
        <div className={styles['bloco-fundo-material']}>
          <div className={styles['tab-container-user']}>
            <div className={styles.tabActiveMaterial}>Cadastro de Fornecedor</div>
          </div>
        </div>
        <aside className={styles['aside-material']}>
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className={styles['form-content-material']}>
          {progresso === 1 && (
            <>
              <div className={styles['input-group']}>
                <p>CNPJ</p>
                <input
                  placeholder="Digite o CNPJ"
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Razão Social</p>
                <input
                  placeholder="Digite a razão social"
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Nome fantasia</p>
                <input
                  placeholder="Digite o Nome Fantasia"
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                />
              </div>
            </>
          )}

          {progresso === 2 && (
            <>
              <div className={styles['input-group']}>
                <p>CEP</p>
                <input
                  placeholder="Digite o CEP"
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Endereço</p>
                <input
                  placeholder="Digite o Endereço"
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Número</p>
                <input
                  placeholder="Digite o Número"
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                />
              </div>
            </>
          )}

          {progresso === 3 && (
            <>
              <div className={styles['input-group']}>
                <p>Telefone</p>
                <input
                  placeholder="Digite o Telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Email</p>
                <input
                  placeholder="Digite o Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            {progresso > 1 && (
              <button onClick={voltar}>VOLTAR</button>
            )}
            {progresso < 3 && (
              <button onClick={avancar}>PRÓXIMO</button>
            )}
            {progresso === 3 && (
              <button id={styles['buttonCadastrar']} onClick={cadastrarFornecedor}>
                CADASTRAR
              </button>
            )}
          </div>
        </main>
      </section>
    </>
  );
}

export default CadastroFornecedor;