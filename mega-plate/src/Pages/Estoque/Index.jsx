import styles from './estoque.module.css';
import logo from '../../assets/logo-megaplate.png'
// import user from '../../assets/User.png';
 import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { api } from '../../provider/api';
import { useState } from 'react';



export function Estoque() {

     const navigate = useNavigate();
    const [formData, setFormData] = useState({
        materialEstoque: '',
        setor: '',
        quantidadeAtual: '',
        quantidadeAdicional: '',
    });
    const cadastrarEstoque = () => {
          if(!formData.materialEstoque || !formData.setor || !formData.quantidadeAtual || !formData.quantidadeAdicional) {
            alert('Por favor, preencha todos os campos');
            return;
    }

    const token = sessionStorage.getItem('authToken');
    
        if (!token) {
          alert('Token de autenticação não encontrado. Faça login novamente.');
          navigate('/login')
          return;
        }
    
        const estoqueData = {
            materialEstoque: formData.materialEstoque,
            setor: formData.setor,
            quantidadeAtual: formData.quantidadeAtual,
            quantidadeAdicional: formData.quantidadeAdicional,
            
        }
    
        api.post('/estoque', estoqueData, {
            headers: {'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
          })
    
            .then((response) => {
                console.log('Setor cadastrado com sucesso:', response.data);
                alert('Estoque cadastrado com sucesso!');
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
        <div className={styles['tab-container']}>
              <div className={styles.tabActiveUsuario}>Cadastro</div>
               
                 </div>
        <section className={styles.estoque}>
        
        
        <div className={styles['bloco-fundo-estoque']}>  


        <div className={styles['tab-container-user']}>
              <div className={styles.tabActiveUsuario}>Estoque</div>
                 </div>   
                        </div>
            <aside className={styles['aside-estoque']}>
                            <img src={logo} alt="" />
                        </aside>
                        
                        
                               
                        <main className={styles['form-content-estoque']}>
                            
            
                            <div className={styles['input-group']}>
                                <p>Material</p>
                                <input placeholder="SAE 1020"  type="text"  value={formData.materialEstoque} onChange={(e) => setFormData({...formData, materialEstoque:e.target.value})}/>
                            </div>

                            <div className={styles['input-group']}>
                                <p>Setor</p>
                                <input placeholder="A2" type='Text' value={formData.setor} onChange={(e) => setFormData({...formData, setor:e.target.value})}/>
                            </div>
            
                            <div className={styles['input-group']}>
                                <p>Quantidade atual</p>
                                <input placeholder="50" type='Text'value={formData.quantidadeAtual} onChange={(e) => setFormData({...formData, quantidadeAtual:e.target.value})}/>
                            </div>
            
                            <div className={styles['input-group']}>
                                <p>Quantidade adicional</p>
                                <input placeholder="10" type='Text'value={formData.quantidadeAdicional} onChange={(e) => setFormData({...formData, quantidadeAdicional:e.target.value})}/>
                            </div>
            
                            <button onClick={cadastrarEstoque}>CADASTRAR</button>
            
                        </main>
          </section>
          
          </>
    );
  };

  export default Estoque;