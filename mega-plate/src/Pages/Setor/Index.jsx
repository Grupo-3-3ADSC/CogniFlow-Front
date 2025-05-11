import styles from './setor.module.css'
import logo from '../../assets/logo-megaplate.png'
// import user from '../../assets/User.png';
import NavBar from '../../components/NavBar';
import { api } from '../../provider/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Setor() {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nomeSetor: '',
        descricao: '',
    });

    const cadastrarSetor = () => {
        if(!formData.nomeSetor || !formData.descricao) {
            alert('Por favor, preencha todos os campos');
            return;
    }

    const token = sessionStorage.getItem('authToken');

    if (!token) {
      alert('Token de autenticação não encontrado. Faça login novamente.');
      navigate('/login')
      return;
    }

    const setorData = {
        nomeSetor: formData.nomeSetor.trim(),
        descricao: formData.descricao.trim(),
    }

    api.post('/setores', setorData, {
        headers: {'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      })

        .then((response) => {
            console.log('Setor cadastrado com sucesso:', response.data);
            alert('Setor cadastrado com sucesso!');
            setFormData({
                nomeSetor: '',
                descricao: '',
            })
            }).catch((error) => {
                console.error('Erro ao cadastrar setor:', error);
                alert('Erro ao cadastrar setor. Tente novamente.');
            });
        
}   

    return (
        <>
            <NavBar />

            <div className={styles["tab-container"]}></div>
            {/* <div className={styles.tabActiveUsuario}>Cadastro</div> */}
            <section className={styles.setor}>
                <div className={styles['bloco-fundo-setor']}>
                    <div className={styles["tab-container-user"]}>
                        <div className={styles.tabActiveSetor}>Setor</div>
                    </div>
                </div>
                <aside className={styles['aside-setor']}>
                    <img src={logo} alt="" />
                </aside>
                <main className={styles['form-content-setor']}>
                    <div className={styles['input-group']}>
                        <p>Nome</p>
                        <input placeholder="" type="text" value={formData.nomeSetor} onChange={(e) => setFormData({...formData, nomeSetor:e.target.value})}/>
                    </div>

                    <div className={styles['input-group']}>
                        <p>Descrição</p>
                        <input placeholder='' type='Text' value={formData.descricao} onChange={(e) => setFormData({...formData, descricao:e.target.value})}/>
                    </div>


                    <button onClick={cadastrarSetor}>CADASTRAR</button>

                    {/* <a onClick={irParaSetor}>Não tem conta? <span>Cadastrar</span></a> */}
                </main>
            </section>

        </>
    );
};

export default Setor;