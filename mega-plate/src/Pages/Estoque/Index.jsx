import './style.css'
import logo from '../../assets/logo-megaplate.png'
import user from '../../assets/User.png';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';



export function Estoque() {

    // const navigate = useNavigate();
     
    return (
      <>
      <NavBar />

      
        <div className="tab-container">
              {/* <div className="tab active">Cadastro</div> */}
               
                 </div>
        <section className='estoque'>
        
        
        <div className='bloco-fundo-estoque'>  


        <div className="tab-container-user">
              <div className="tab active">Estoque</div>
                 </div>   
                        </div>
            <aside className='aside-estoque'>
                            <img src={logo} alt="" />
                        </aside>
                        
                        
                               
                        <main className='form-content-estoque'>
                            
            
                            <div className='input-group'>
                                <p>Material</p>
                                <input placeholder=""  type="text" />
                            </div>

                            <div className='input-group'>
                                <p>Setor</p>
                                <input placeholder='' type='Text'/>
                            </div>
            
                            <div className='input-group'>
                                <p>Quantidade atual</p>
                                <input placeholder='' type='Text'/>
                            </div>
            
                            <div className='input-group'>
                                <p>Quantidade adicional</p>
                                <input placeholder='' type='Text'/>
                            </div>
            
                            <button id='buttonEstoque'>CADASTRAR</button>
            
                        </main>
          </section>
          
          </>
    );
  };
  
  export default Estoque;