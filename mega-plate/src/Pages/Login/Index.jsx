import style from './login.module.css';
import logo from '../../assets/logo-megaplate.png';
import olho from '../../assets/olho.png';
import loading from '../../assets/loading.gif';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../provider/api.js';

export function Login() {
    const navigate = useNavigate();

        const [visivel, setVisivel] = useState(false);
        const [formData, setFormData] = useState({
            email:'',
            password:''
        });

        const visorpassword = () => {
          setVisivel(!visivel);
        };

        function irParaVerificacao(){
            navigate('/verificacao')
        }


        const login = () =>{
            if(!formData.email || !formData.password) {
                alert('Por favor, preencha os campos');
                return;
              }

              api.post('/usuarios/login',{
                email:formData.email,
                password:formData.password
              })
              .then((response) =>{
                if (response.status === 200 && response.data?.token) {
                    sessionStorage.setItem('authToken', response.data.token);
                    sessionStorage.setItem('usuario', response.data.nome);
                }          
                setFormData({email:'', password: ''});
                divLoading.style.display = 'block';
                setTimeout(function(){
                navigate('/Material')},1500);
              })
              .catch((error)=>{
                console.error('Erro no login do usuário: ', error);
                alert('Não foi possível autenticar, email ou password inválidos.')
              });
              
        }

    return(    
        <section className={style.login}>

            <aside className={style['aside-login']}>
                <img src={logo} alt="" />
            </aside>
            <main className={style['form-content']}>
                <h1>Login</h1>

                <div className={style['input-group']}>
                    <p>Email</p>
                    <input placeholder="marcos@email.com"  
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className={style['input-group']}>
                    <p>Senha</p>
                    <input placeholder='********' 
                    type={visivel ? 'text' : 'password'} 
                    className={style['input-password']}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}/>

                    <img className={style['olho']} src={olho} onClick={visorpassword} alt='Mostrar password'/>
                </div>

                <button onClick={login}>ENTRAR</button>

                <div style={{display: 'none'}} id='divLoading'>
                    <img src={loading} alt='Simbolo de carregamento' className={style['loading-gif']}/>
                </div>

                <a onClick={irParaVerificacao}><span>Esqueceu a senha?</span></a>
            </main>
        </section>
    )
}

export default Login;