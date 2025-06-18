import styles from './cadastro.module.css';
import logo from '../../assets/logo-megaplate.png';
import { useEffect, useState } from 'react';
import { api } from '../../provider/api.js';
import NavBar from '../../components/NavBar'; // Importando a NavBar
import { useNavigate } from 'react-router-dom';
import { toastSucess, toastError } from '../../components/toastify/ToastifyService.jsx';
import {jwtDecode} from "jwt-decode";
import Swal from 'sweetalert2'


export function Cadastro() {

  const navigate = useNavigate();

  // let mensagem = '';

  

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: {
      id: 1,
      nome: 'comum'
    },
    password: '',
  });

  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);

    useEffect(() => {
      const token = sessionStorage.getItem('authToken');
      if(!token){
        navigate('/');
      }else{
        const {exp} = jwtDecode(token)
        if(Date.now() >= exp * 1000) {
          sessionStorage.removeItem('authToken');
          navigate('/');
        }else{
        setAutenticacaoPassou(true);
        }
      }
    }, []);

    if(!autenticacaoPassou) return null;

  const cadastrar = () => {
    if (!formData.nome || !formData.email || !formData.cargo || !formData.password) {
      Swal.fire({
        title: "Preencha as informações",
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const token = sessionStorage.getItem('authToken');

    // console.log('Token:', token); // verificação se o token esta sendo pego corretamente

    if (!token) {
      toastError('Token de autenticação não encontrado. Faça login novamente.');
      navigate('/')
      return;
    }

    
    const userData = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      cargo: {
        id: formData.cargo.id,
        nome: formData.cargo.id === 1 ? 'comum' : 'gestor'
      },
      password: formData.password.trim()
    };

     
        const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
            if (sqlPattern.test(userData.email) || 
            sqlPattern.test(userData.nome) ||
            sqlPattern.test(userData.password)) {
                return toastError('Por favor não cadastrar com comandos especiais...');
            }
            if (/<script.*?>.*?<\/script>/gi.test(userData.email) ||
             /<script.*?>.*?<\/script>/gi.test(userData.nome) ||
            /<script.*?>.*?<\/script>/gi.test(userData.password)) {
                return toastError('Por favor não cadastrar com comandos especiais...');
            }  

    const endpoint = formData.cargo.id === 2 ? '/usuarios/gestor' : '/usuarios';

    api.post(endpoint, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })


      .then((response) => {
        console.log('Resposta do servidor:', response.data);
        Swal.fire({
          title: "Usuário cadastrado com sucesso!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        setFormData({ nome: '', email: '', password: '' });
      })
      .catch((error) => {
        console.error('Erro completo:', error);
        if (error.response) {
          console.log('Status do erro:', error.response.status);
          console.log('Dados do erro:', error.response.data);

          if (error.response.status === 400) {

            toastError('Dados inválidos: ' + (error.response.data.message || 'Verifique as informações'));

          } else if (error.response.status === 401) {
            toastError('Sessão expirada. Por favor, faça login novamente.');
            navigate('/login');
          } else {
            toastError('Erro ao cadastrar usuário: ' + (error.response.data?.message || 'Tente novamente mais tarde.'));
          }
        } else {
          toastError('Erro de conexão. Verifique sua internet e tente novamente.');
        }
      });
  };

  return (
    <>
      <NavBar />

      <div className={styles['tab-container']}>
      </div>
      <section className={styles.cadastro}>
        <div className={styles['bloco-fundo']}>
          <div className={styles['tab-container-user']}>
            <div className={styles.tabActiveUsuario}>Usuario</div>

          </div>
        </div>
        <aside className={styles['aside-cadastro']}>
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className={styles['form-content']}>
          <div className={styles['input-group']}>
            <p id='textCadastro'>Nome</p>
            <input
              placeholder="Marcos Antonio"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className={styles['input-group']}>
            <p id='textCadastro'>Email</p>
            <input
              placeholder="exemplo@dominio.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className={styles['input-group']}>
            <p>Cargo</p>
            <select
              value={formData.cargo?.id || 1}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                setFormData({
                  ...formData,
                  cargo: {
                    id: selectedId,
                    nome: selectedId === 1 ? 'comum' : 'gestor'
                  }
                });
              }}
            >
              <option value={1}>Usuário Comum</option>


              <option value={2}>Gestor</option>

            </select>
          </div>

          <div className={styles['input-group']}>
            <p id='textCadastro'>Senha</p>
            <input
              placeholder="********"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button id='buttonCadastrar' onClick={cadastrar}>CADASTRAR</button>

        </main>
      </section>
    </>
  );
}

export default Cadastro;