import styles from './Estoque.module.css';
import logo from '../../assets/logo-megaplate.png'
// import user from '../../assets/User.png';
// import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';



export function Estoque() {

    // const navigate = useNavigate();
     
    return (
      <>
      <NavBar />
        <div className={styles['tab-container']}>
              <div className="tab active">Cadastro</div>
               
                 </div>
        <section className={styles.estoque}>
        
        
        <div className={styles['bloco-fundo-estoque']}>  


        <div className={styles['tab-container-user']}>
              <div className="tab active">Estoque</div>
                 </div>   
                        </div>
            <aside className={styles['aside-estoque']}>
                            <img src={logo} alt="" />
                        </aside>
                        
                        
                               
                        <main className={styles['form-content-estoque']}>
                            
            
                            <div className={styles['input-group']}>
                                <p>Material</p>
                                <input placeholder="SAE 1020"  type="text" />
                            </div>

                            <div className={styles['input-group']}>
                                <p>Setor</p>
                                <input placeholder="A2" type='Text'/>
                            </div>
            
                            <div className={styles['input-group']}>
                                <p>Quantidade atual</p>
                                <input placeholder="50" type='Text'/>
                            </div>
            
                            <div className={styles['input-group']}>
                                <p>Quantidade adicional</p>
                                <input placeholder="10" type='Text'/>
                            </div>
            
                            <button id='buttonEstoque'>CADASTRAR</button>
            
                        </main>
          </section>
          
          </>
    );
  };
  
  export default Estoque;