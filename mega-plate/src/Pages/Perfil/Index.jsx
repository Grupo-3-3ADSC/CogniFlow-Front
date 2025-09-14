import NavBar from "../../components/NavBar";
import style from './perfil.module.css';
import { FaPencilAlt } from "react-icons/fa";
import { IconContext } from "react-icons";
import circulo from '../../assets/circulo-foto.png';
import User from '../../assets/logo-megaplate.png'
import { api } from '../../provider/api.js';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess } from "../../components/toastify/ToastifyService.jsx";
import { jwtDecode } from 'jwt-decode';

function Perfil() {
    const navigate = useNavigate();
    const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);
    const [fotoUrl, setFotoUrl] = useState(null); // Mudança: usar fotoUrl específico
    const [fotoError, setFotoError] = useState(false);
    const [isUploadingFoto, setIsUploadingFoto] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            const { exp } = jwtDecode(token)
            if (Date.now() >= exp * 1000) {
                sessionStorage.removeItem('authToken');
                navigate('/');
            } else {
                setAutenticacaoPassou(true);
            }
        }
    }, [navigate]);

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
            setFotoError(false);

            api.get(`/usuarios/${userId}/foto`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob',
                timeout: 10000 // 10 segundos timeout
            }).then((resposta) => {
                if (resposta.data && resposta.data.size > 0) {
                    // Limpar URL anterior se existir
                    if (fotoUrl && fotoUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(fotoUrl);
                    }

                    const imageUrl = URL.createObjectURL(resposta.data);
                    setFotoUrl(imageUrl);
                    setFotoError(false);
                } else {
                    console.log("Resposta vazia ou sem dados");
                    setFotoUrl(null);
                    setFotoError(true);
                }
            }).catch((err) => {
                setFotoUrl(null);
                setFotoError(true);
                if (err.response?.status !== 404) {
                    console.error("Erro inesperado ao buscar foto:", err);
                }
            });
        }
    }

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cargo: {
            id: ''
        }
    });

    const [botaoDesabilitado, setBotaoDesabilitado] = useState(false);

    useEffect(() => {
        if (autenticacaoPassou) {
            getUsuarios();
            getFoto();
        }
    }, [autenticacaoPassou]);

    // Cleanup da URL quando o componente for desmontado
    useEffect(() => {
        return () => {
            if (fotoUrl && fotoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fotoUrl);
            }
        };
    }, [fotoUrl]);

    function desbloquearEdicao(campo) {
        let input;
        if (campo === 'editarNome') input = document.querySelector('.inputNome');
        if (campo === 'editarEmail') input = document.querySelector('.inputEmail');
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

    const [emailAlterado, setEmailAlterado] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email' && value !== formData.email) {
            setEmailAlterado(true);
        }
        setFormData({ ...formData, [name]: value });
    };


    function editarUsuario() {
        if (!validarInputsEspeciais()) {
            return toastError("Por favor não colocar comandos nos campos.")
        }

        if (formData.nome.trim() === "" || !formData.nome ||
            formData.email.trim() === "" || !formData.email) {
            return toastError("Dados de edição vázio, por favor preencher.")
        }

        const email = formData.email
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

        if (!emailRegex.test(email)) {
            toastError("Erro, email inválido não pode ser editado.");
            return;
        }

        if (token) {
            api.patch(`/usuarios/${userId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((resposta) => {
                toastSuccess('O usuário foi atualizado!')
                document.querySelectorAll('.inputNome, .inputEmail, .inputCargo')
                    .forEach(input => input.disabled = true);
                setBotaoDesabilitado(true);
                setFormData(resposta.data)
                setTimeout(() => {
                    if (emailAlterado) {
                        toastInfo('Reiniciando aplicação...');
                        navigate('/');
                    } else {
                        window.location.reload();
                    }
                }, 2000);
            }).catch((erro) => {
                toastError('Erro ao atualizar o usuário!')
                setBotaoDesabilitado(false);
                console.error("Erro ao atualizar usuário", erro);
            });
        }
    }

    const mudarFoto = (e) => {
        const arquivoSelecionado = e.target.files[0];

        if (!arquivoSelecionado) return;

        // Verificar se é realmente uma imagem
        if (!arquivoSelecionado.type.startsWith('image/')) {
            toastError('Por favor, selecione apenas arquivos de imagem');
            return;
        }

        // Verificar tamanho do arquivo (exemplo: máximo 5MB)
        if (arquivoSelecionado.size > 5 * 1024 * 1024) {
            toastError('Arquivo muito grande. Máximo 5MB');
            return;
        }

        setIsUploadingFoto(true);

        const formData = new FormData();
        formData.append('foto', arquivoSelecionado);

        console.log('FormData criado para:', `/usuarios/${userId}/upload-foto`);

        api.post(`/usuarios/${userId}/upload-foto`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000
        })
            .then((response) => {
                toastSuccess('Foto enviada com sucesso! Atualizando...');

                // Aguardar um pouco e recarregar a foto
                setTimeout(() => {
                    getFoto();
                    setIsUploadingFoto(false);
                }, 1000);
            })
            .catch((err) => {
                setIsUploadingFoto(false);

                if (err.code === 'ECONNABORTED') {
                    toastError('Timeout: Arquivo muito grande ou conexão lenta');
                } else if (err.response?.status === 413) {
                    toastError('Arquivo muito grande para o servidor');
                } else {
                    toastError('Erro ao enviar foto');
                }
            });
    }

    // Função para determinar qual imagem mostrar
    const getImageSrc = () => {
        if (fotoUrl) {
            return fotoUrl;
        }
        return User; // Imagem padrão
    };

    if (!autenticacaoPassou) return null;

    return (
        <>
            <NavBar />
            <section className={style.perfil}>
                <main className={style['bloco-fundo']}>
                    <div className={style['imagens']}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={mudarFoto}
                            id="input-image"
                            style={{ display: "none" }}
                            disabled={isUploadingFoto}
                        />
                        <div className={style['imagem-wrapper']}>
                            <img src={circulo} alt="" className={style['img-maior']} />
                            <img
                                src={getImageSrc()}
                                alt="imagem de usuário"
                                className={style['img-menor']}
                                onError={(e) => {
                                    console.log("Erro ao carregar imagem:", e.target.src);
                                    e.target.onError = null;
                                    e.target.src = User;
                                    setFotoError(true);
                                }}
                                onLoad={() => {
                                    console.log("Imagem carregada com sucesso:", getImageSrc());
                                }}
                            />
                        </div>
                        <label
                            className={style['label-imagem']}
                            htmlFor="input-image"
                            style={{
                                opacity: isUploadingFoto ? 0.5 : 1,
                                cursor: isUploadingFoto ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isUploadingFoto ? 'Enviando...' : 'Clique aqui para modificar a imagem'}
                        </label>
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
                            <input
                                type="email"
                                name="email"
                                className="inputEmail"
                                value={formData.email}
                                onChange={handleChange}
                                disabled />
                            <IconContext.Provider value={{ color: 'black', size: '1.5em' }}>
                                <FaPencilAlt onClick={() => desbloquearEdicao('editarEmail')}
                                    className={style['input-icon']} />
                            </IconContext.Provider>
                        </div>

                        <div className={style['input-group']}>
                            <p>Cargo</p>
                            <input
                                type="text"
                                className="inputCargo"
                                value={Number(formData.cargo?.id) === 2 ? "Usuário Gestor" : "Usuário Comum"}
                                disabled
                                readOnly
                            />
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