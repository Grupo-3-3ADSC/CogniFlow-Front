import './style.css'
import logo from '../../assets/logo-megaplate.png'
import user from '../../assets/User.png';
// import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';



export function Setor() {

//     const navigate = useNavigate();
            
//    const irParaSetor = () => {
//     navigate('/setor');
//     }
    return (
      <>

<NavBar />

      
        <div className="tab-container">
              <div className="tab active">Cadastro</div>
               
                 </div>
        <section className='cadastro'>
        
        
        <div className='bloco-fundo'>  


        <div className="tab-container-user">
              <div className="tab active">Setor</div>
                 </div>   
                        </div>
            <aside className='aside-cadastro'>
                            <img src={logo} alt="" />
                        </aside>
                        
                        
                               
                        <main className='form-content'>
                            
            
                            <div className='input-group'>
                                <p>nome</p>
                                <input placeholder=""  type="text" />
                            </div>

                            <div className='input-group'>
                                <p>descrição</p>
                                <input placeholder='' type='Text'/>
                            </div>
        
            
                            <button>CADASTRAR</button>
            
                            {/* <a onClick={irParaSetor}>Não tem conta? <span>Cadastrar</span></a> */}
                        </main>
          </section>
          
          </>
    );
  };
  
  export default Setor;