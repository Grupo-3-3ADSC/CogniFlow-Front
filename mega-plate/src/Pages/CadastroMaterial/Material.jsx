import styles from './Material.module.css';
import logo from '../../assets/logo-megaplate.png';
import { useState } from 'react';
import NavBar from '../../components/NavBar';

export function Material() {
  const [formData, setFormData] = useState({
    material: '',
    tamanhoReal: '',
    tamanhoTeorico: '',
    setor: '',
  });

  const cadastrarMaterial = () => {
    if (!formData.material || !formData.tamanhoReal || !formData.tamanhoTeorico || !formData.setor) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    alert('Material cadastrado com sucesso!');
    setFormData({ material: '', tamanhoReal: '', tamanhoTeorico: '', setor: '' });
  };

  return (
    <>
      <NavBar />

      <div className={styles['tab-container']}></div>
      <section className={styles.material}>
        <div className={styles['bloco-fundo-material']}>
          <div className={styles['tab-container-user']}>
            <div className={styles.tabActiveMaterial}>Cadastro de Material</div>
          </div>
        </div>
        <aside className={styles['aside-material']}>
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className={styles['form-content-material']}>
          <div className={styles['input-group']}>
            <p>Material</p>
            <input
              placeholder="Digite o nome do material"
              type="text"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            />
          </div>

          <div className={styles['input-group']}>
            <p>Tamanho Real</p>
            <input
              placeholder="Digite o tamanho real"
              type="text"
              value={formData.tamanhoReal}
              onChange={(e) => setFormData({ ...formData, tamanhoReal: e.target.value })}
            />
          </div>

          <div className={styles['input-group']}>
            <p>Tamanho Teórico</p>
            <input
              placeholder="Digite o tamanho teórico"
              type="text"
              value={formData.tamanhoTeorico}
              onChange={(e) => setFormData({ ...formData, tamanhoTeorico: e.target.value })}
            />
          </div>

          <div className={styles['input-group']}>
            <p>Setor</p>
            <input
              placeholder="Digite o setor"
              type="text"
              value={formData.setor}
              onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
            />
          </div>

          <button id={styles['buttonCadastrar']} onClick={cadastrarMaterial}>
            CADASTRAR
          </button>
        </main>
      </section>
    </>
  );
}

export default Material;