import styles from './fornecedor.module.css';
import { useState } from 'react';
import NavBar from '../../components/NavBar';
import Swal from 'sweetalert2';

export function CadastroFornecedorProgresso() {
  const [progresso, setProgresso] = useState(1);
  const [formData, setFormData] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    endereco: '',
    cidade: '',
    estado: '',
  });

  function avancar() {
    if (progresso < 3) setProgresso(progresso + 1);
  }

  function voltar() {
    if (progresso > 1) setProgresso(progresso - 1);
  }

  function cadastrarFornecedor() {
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
    setFormData({
      cnpj: '',
      razao_social: '',
      nome_fantasia: '',
      endereco: '',
      cidade: '',
      estado: '',
    });
    setProgresso(1);
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
        <main className={styles['form-content-material']}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <div className={progresso >= 1 ? styles['progress-active'] : styles['progress-inactive']}>1</div>
            <div className={progresso >= 2 ? styles['progress-active'] : styles['progress-inactive']}>2</div>
            <div className={progresso === 3 ? styles['progress-active'] : styles['progress-inactive']}>3</div>
          </div>

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
            </>
          )}

          {progresso === 2 && (
            <>
              <div className={styles['input-group']}>
                <p>Endereço</p>
                <input
                  placeholder="Digite o endereço"
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Cidade</p>
                <input
                  placeholder="Digite a cidade"
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              <div className={styles['input-group']}>
                <p>Estado</p>
                <input
                  placeholder="Digite o estado"
                  type="text"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
              </div>
            </>
          )}

          {progresso === 3 && (
            <div style={{ textAlign: 'center' }}>
              <h3>Confirme os dados:</h3>
              <p><b>CNPJ:</b> {formData.cnpj}</p>
              <p><b>Razão Social:</b> {formData.razao_social}</p>
              <p><b>Nome Fantasia:</b> {formData.nome_fantasia}</p>
              <p><b>Endereço:</b> {formData.endereco}</p>
              <p><b>Cidade:</b> {formData.cidade}</p>
              <p><b>Estado:</b> {formData.estado}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            {progresso > 1 && (
              <button onClick={voltar}>VOLTAR</button>
            )}
            {progresso < 3 && (
              <button onClick={avancar}>PRÓXIMO</button>
            )}
            {progresso === 3 && (
              <button onClick={cadastrarFornecedor}>CADASTRAR</button>
            )}
          </div>
        </main>
      </section>
    </>
  );
}

export default CadastroFornecedorProgresso;