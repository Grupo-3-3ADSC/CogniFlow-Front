import NavBar from "../../components/NavBar";
import style from './perfil.module.css';
import { FaPencilAlt } from "react-icons/fa";
import { IconContext } from "react-icons";
import circulo from '../../assets/circulo-foto.png';
import User from '../../assets/logo-megaplate.png'
import { api } from '../../provider/api.js';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toastError, toastSucess } from "../../components/toastify/ToastifyService.jsx";
import { jwtDecode } from 'jwt-decode';


function Perfil() {

    const navigate = useNavigate();
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

    

    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('usuario');

    function getUsuarios() {

        if (token) {
            api.get(`/usuarios/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((resposta) => {
                setFormData({
                    ...resposta.data,
                    cargo: resposta.data.cargo || { id: "" }
                });
            }).catch((erro) => {
                console.error("Erro ao buscar usuário", erro);
            });
        }
    }

    function getFoto() {

        if (token) {
            api.get(`/usuarios/${userId}/foto`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((resposta) => {
                setFile(resposta.data);
            }).catch((err) => {
                console.log("Erro de resgatar foto:", err);
            });
        }
    }


    useEffect(() => {
        getUsuarios();
        getFoto()        
    }, [])

    
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cargo: {
            id: ''
        }
    });

    const [botaoDesabilitado, setBotaoDesabilitado] = useState(false);

    function desbloquearEdicao(campo) {

        let input;

        if (campo === 'editarNome') input = document.querySelector('.inputNome');
        if (campo === 'editarEmail') input = document.querySelector('.inputEmail');
        if (campo === 'editarCargo') input = document.querySelector('.inputCargo');
        if (input) input.disabled = !input.disabled;
    }

    function validarInputsEspeciais() {
        const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
        if (sqlPattern.test(formData.email) || sqlPattern.test(formData.nome)) {
            return false;
        }
        if (/<script.*?>.*?<\/script>/gi.test(formData.email) || /<script.*?>.*?<\/script>/gi.test(formData.nome)) {
            return false;
        }
        return true;
    }

    function editarUsuario() {
        if (!validarInputsEspeciais()) {
            return toastError("Por favor não colocar comandos nos campos.")
        }

        if (formData.nome.trim() === "" || !formData.nome ||
            formData.email.trim() === "" || !formData.email) {
            return toastError("Dados de edição vázio, por favor preencher.")
        }

        if (token) {
            api.patch(`/usuarios/${userId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((resposta) => {
                toastSucess('O usuário foi atualizado!')
                document.querySelectorAll('.inputNome, .inputEmail, .inputCargo')
                    .forEach(input => input.disabled = true);
                setBotaoDesabilitado(true);
                setTimeout(function () {
                    window.location.reload();
                }, 2000)
                setFormData(resposta.data)
            }).catch((erro) => {
                toastError('Erro ao atualizar o usuário!')
                setBotaoDesabilitado(false);
                console.error("Erro ao atualizar usuário", erro);
            });
        }
    }

    const [file, setFile] = useState(null);


    const mudarFoto = (e) => {
        const arquivoSelecionado = e.target.files[0];

        if (!arquivoSelecionado) return;

        setFile(arquivoSelecionado);

        const formData = new FormData();
        formData.append('foto', arquivoSelecionado);

        api.post(`/usuarios/${userId}/upload-foto`, formData)
            .then((response) => {
                console.log("Sucesso:", response);
                toastSucess('Foto enviada com sucesso! Atualizando agora.');
                window.location.reload();
            })
            .catch((err) => {
                console.log('Erro completo:', err);
                console.log('Response data:', err.response?.data);
                toastError('Erro ao enviar foto');
            });

    }

    if(!autenticacaoPassou) return null;
    return (
        <>
            <NavBar />
            <section className={style.perfil}>
                <main className={style['bloco-fundo']}>
                    <div className={style['imagens']}>
                        <input type="file" accept="image/*" onChange={mudarFoto} id="input-image" style={{display: "none"}}/>
                        <div className={style['imagem-wrapper']}>
                            <img src={circulo} alt="" className={style['img-maior']} />
                            <img
                                src={`${import.meta.env.VITE_API_URL}/usuarios/${userId}/foto`}
                                alt="imagem de usuário"
                                className={style['img-menor']}
                                onError={(e) => {
                                    e.target.onError = null;
                                    e.target.src = User;
                                }}
                            />
                        </div>
                        <label className={style['label-imagem']} htmlFor="input-image">clique aqui para modificar a imagem</label>
                    </div>
                    <div className={style['inputs']}>
                        <div className={style['input-group']}>
                            <p>Nome</p>
                            <input type="text" className="inputNome"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })} disabled />
                            <IconContext.Provider value={{ color: 'black', size: '1.5em' }}>
                                <FaPencilAlt onClick={() => desbloquearEdicao('editarNome')}
                                    className={style['input-icon']} />
                            </IconContext.Provider>
                        </div>
                        <div className={style['input-group']}>
                            <p>E-mail</p>
                            <input type="text" className="inputEmail"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })} disabled />
                            <IconContext.Provider value={{ color: 'black', size: '1.5em' }}>
                                <FaPencilAlt onClick={() => desbloquearEdicao('editarEmail')}
                                    className={style['input-icon']} />
                            </IconContext.Provider>
                        </div>

                        
                        <div className={style['input-group']}>
  <p>Cargo</p>
  <select
    type="text"
    className="inputCargo"
    value={formData.cargo?.id || ""}
    onChange={(e) =>
      setFormData({
        ...formData,
        cargo: { ...formData.cargo, id: Number(e.target.value) },
      })
    }
    disabled
  >
    <option value={1}>Usuário Comum</option>
    {Number(formData.cargo?.id) === 2 && (
      <option value={2}>Usuário Gestor</option>
    )}
  </select>

  <IconContext.Provider value={{ color: 'black', size: '1.5em' }}>
    <FaPencilAlt
      onClick={() => desbloquearEdicao('editarCargo')}
      className={style['input-icon']}
    />
  </IconContext.Provider>
</div>

                        <button
                            onClick={editarUsuario}
                            className={style['btnEditar']}
                            disabled={botaoDesabilitado}
                            style={botaoDesabilitado ? { cursor: 'not-allowed' } : {}}
                        >
                            Editar
                        </button>
                    </div>
                    
                </main>
            </section>
        </>
    );

}

export default Perfil;