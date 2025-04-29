import './style.css';
import logo from '../../assets/logo-megaplate.png';
import olho from '../../assets/olho.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Login() {
    const navigate = useNavigate();

    const [visivel, setVisivel] = useState(false);

    const visorSenha = () => {
        setVisivel(!visivel);
    };


    // const irParaCadastro = () => {
    //     navigate('/cadastro');
    // }


    const irParaLinks = () => {
        navigate('/links');
    }

    return (
        <section className='login'>

            <aside className='aside-login'>
                <img src={logo} alt="" />
            </aside>
            <main className='form-content'>
                <h1>Login</h1>

                <div className='input-group'>
                    <p>Nome</p>
                    <input placeholder="Marcos Antonio" type="text" />
                </div>

                <div className='input-group'>
                    <p>Senha</p>
                    <input placeholder='********' type={visivel ? 'text' : 'password'} className='input-senha' />
                    <img className='olho' src={olho} onClick={visorSenha} alt='Mostrar senha' />
                </div>

                <button>ENTRAR</button>

                {/* <a onClick={irParaCadastro}>Não tem conta? <span>Cadastrar</span></a> */}
                <a onClick={irParaLinks}>Links</a>
            </main>
        </section>
    )
}

export default Login;