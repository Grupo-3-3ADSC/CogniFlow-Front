import './style.css'
import logo from '../../assets/logo-megaplate.png'
import user from '../../assets/User.png';
// import { useNavigate } from 'react-router-dom';


export function Setor() {

//     const navigate = useNavigate();
            
//    const irParaSetor = () => {
//     navigate('/setor');
//     }
    return (
      <>
       <div className="sidebar">
    <div className="menu-icon">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
      <nav className='navbar'>
      <div className='navbar-left'>
        </div>
        <div className='navbar-right'>
          <img src={user}/>
        </div>
        </nav>
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