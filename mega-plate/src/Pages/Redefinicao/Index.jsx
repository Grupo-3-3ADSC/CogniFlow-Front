import './style.css';
import logo from '../../assets/logo-megaplate.png';
import olho from '../../assets/olho.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Redefinicao() {
    const navigate = useNavigate();

    const [visivel, setVisivel] = useState(false);

    const visorSenha = () => {
        setVisivel(!visivel);
    };

    function irParaLogin() {
        navigate('/');
    }

    return (
        <section className='redefinicao'>

            <aside className='aside-redefinicao'>
                <img src={logo} alt="" />
            </aside>
            <main className='form-content-redefinicao'>
                <h1>Redefinição de Senha</h1>

                <div className='input-group'>
                    <p>Nova Senha</p>
                    <input placeholder="********" type={visivel ? 'text' : 'password'} className='input-senha' />
                    <img className='olho' src={olho} onClick={visorSenha} alt='Mostrar senha' />
                </div>

                <div className='input-group'>
                    <p>Senha</p>
                    <input placeholder='********' type={visivel ? 'text' : 'password'} className='input-senha' />
                    <img className='olho' src={olho} onClick={visorSenha} alt='Mostrar senha' />
                </div>

                <button onClick={irParaLogin}>REDEFINIR</button>

                {/* <a onClick={irParaCadastro}>Não tem conta? <span>Cadastrar</span></a> */}
                {/* <a onClick={irParaLinks}>Links</a> */}
            </main>
        </section>
    )
}

export default Redefinicao;