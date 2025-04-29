import './style.css';
import logo from '../../assets/logo-megaplate.png';
import olho from '../../assets/olho.png';
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
                console.log(response.data)
                setFormData({email:'', password: ''})
              })
              .catch((error)=>{
                console.error('Erro no login do usuário: ', error);
                alert('Não foi possível autenticar, email ou password inválidos.')
              });
              
        }

    return(    
        <section className='login'>

            <aside className='aside-login'>
                <img src={logo} alt="" />
            </aside>
            <main className='form-content'>
                <h1>Login</h1>

                <div className='input-group'>
                    <p>Email</p>
                    <input placeholder="marcos@email.com"  
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className='input-group'>
                    <p>Senha</p>
                    <input placeholder='********' 
                    type={visivel ? 'text' : 'password'} 
                    className='input-password'
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}/>

                    <img className='olho' src={olho} onClick={visorpassword} alt='Mostrar password'/>
                </div>

                <button onClick={login}>ENTRAR</button>

                {/* <a onClick={irParaCadastro}>Não tem conta? <span>Cadastrar</span></a> */}
            </main>
        </section>
    )
}

export default Login;