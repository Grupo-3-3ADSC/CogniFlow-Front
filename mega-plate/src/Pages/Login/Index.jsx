import './style.css'
import logo from '../../assets/logo-megaplate.png'

export function Login() {
    return(
        <section className='login'>
            <aside>
                <img src={logo} alt="" />
            </aside>
            <main className='form-content'>
                <h1>Login</h1>

                <div className='input-group'>
                    <p>Nome</p>
                    <input type="text" />
                </div>

                <div className='input-group'>
                    <p>Senha</p>
                    <input type="text" />
                </div>

                <button>ENTRAR</button>

                <a href='#'>Não tenha conta? <span>Cadastrar</span></a>
            </main>
        </section>
    )
}