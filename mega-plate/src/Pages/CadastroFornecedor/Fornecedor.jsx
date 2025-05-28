import styles from './fornecedor.module.css';
import logo from '../../assets/logo-megaplate.png';
import { useState } from 'react';
import NavBar from '../../components/NavBar';
import Swal from 'sweetalert2';

export function CadastroFornecedor() {
  const [formData, setFormData] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
  });

  const cadastrarFornecedor = () => {
    if (!formData.cnpj || !formData.nome_fantasia || !formData.razao_social) {
            Swal.fire({
            title: "Preencha as informações",
            icon: "info",
            confirmButtonColor: "#3085d6",
          });
      return;
    }

          Swal.fire({
          title: "Fornecedor cadastrado com sucesso!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        
    setFormData({ cnpj: '', nome_fantasia: '', razao_social: '' });
  };

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
              value={formData.razao_social}
              onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            />
          </div>

          <div className={styles['input-group']}>
            <p>Nome fantasia</p>
            <input
              placeholder="Digite o Nome Fantasia"
              type="text"
              value={formData.nome_fantasia}
              onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
            />
          </div>

         

          <button id={styles['buttonCadastrar']} onClick={cadastrarFornecedor}>
            CADASTRAR
          </button>
        </main>
      </section>
    </>
  );
}

export default CadastroFornecedor;