import './style.css'
import logo from '../../assets/logo-megaplate.png'
import user from '../../assets/User.png';

export function Cadastro() {
  return (
    <>
      <nav className='navbar'>
        <div className='navbar-left'>
        </div>
        <div className='navbar-right'>
          <img src={user} />
        </div>
      </nav>
      <div class="tab-container">
        <div class="tab active">PERFIL</div>
        <div class="tab">CADASTRO</div>
      </div>
      <section className='cadastro'>


        <div className='bloco-fundo'>


          <div class="tab-container-user">
            <div class="tab active">Usuario</div>
            <div class="tab">Fornecedor</div>
          </div>
        </div>
        <aside className='aside-cadastro'>
          <img src={logo} alt="" />
        </aside>



        <main className='form-content'>


          <div className='input-group'>
            <p>Nome</p>
            <input placeholder="Marcos Antonio" type="text" />
          </div>

          <div className='input-group'>
            <p>Email</p>
            <input placeholder='********' type='Text' />
          </div>

          <div className='input-group'>
            <p>Cargo</p>
            <input placeholder='********' type='Text' />
          </div>

          <div className='input-group'>
            <p>Senha</p>
            <input placeholder='********' type='Text' />
          </div>

          <div className='input-group'>
            <p>Confirmar Senha</p>
            <input placeholder='********' type='Text' />
          </div>

          <button>CADASTRAR</button>


        </main>
      </section>

    </>
  );
};

export default Cadastro;