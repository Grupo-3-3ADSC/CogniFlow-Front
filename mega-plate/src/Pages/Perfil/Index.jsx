import NavBar from "../../components/NavBar";
import style from './perfil.module.css';
import { FaPencilAlt } from "react-icons/fa";
import { IconContext } from "react-icons";
import circulo from '../../assets/circulo-foto.png';
import User from '../../assets/User.png'
import { api } from '../../provider/api.js';
import { useState,useEffect, use } from "react";
import { useNavigate } from "react-router-dom";

function Perfil(){

    const [formData, setFormData] = useState({
        nome: '',
        email: '', 
        cargo: '',
        // nascimento: '',
    })

    const token = sessionStorage.getItem('authToken');

    function getUsuarios(){

        const userId = sessionStorage.getItem('usuario'); 

        if(token){
        api.get(`/usuarios/${userId}`, {
            headers: {
                Authorization : `Bearer ${token}`
            }
        }).then((resposta) => {
            setFormData(resposta.data)
        }).catch((erro) => {
            console.error("Erro ao buscar usuário", erro);
        });
    }
    }

    
    useEffect(() =>{
        getUsuarios();
    }, [])

    function desbloquearEdicao(campo){

        let input;
        
    if(campo === 'editarNome') input = document.querySelector('.inputNome');
    if(campo === 'editarEmail') input = document.querySelector('.inputEmail');
    if(campo === 'editarCargo') input = document.querySelector('.inputCargo');
    if(campo === 'editarNascimento') input = document.querySelector('.inputNascimento');
    if(input) input.disabled = !input.disabled;
    }

    function editarUsuario(){
         const userId = sessionStorage.getItem('usuario'); 

        if(token){
        api.patch(`/usuarios/${userId}`, formData , {
            headers: {
                Authorization : `Bearer ${token}`
            }
        }).then((resposta) => {
            setFormData(resposta.data)
        }).catch((erro) => {
            console.error("Erro ao atualizar usuário", erro);
        });
    }
    }

    return(
        <>
        <NavBar/>
            <section className={style.perfil}>
                <main className={style['bloco-fundo']}>
                    <div className={style['imagens']}>
                    <img src={circulo} alt="" className={style['img-maior']}/>
                    <img src={User} alt="" className={style['img-menor']}/>
                    </div>
                    <div className={style['inputs']}>
                        <div className={style['input-group']}>
                            <p>Nome</p>
                            <input type="text" className="inputNome" 
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })} disabled/>
                            <IconContext.Provider value={{color:'black',size:'1.5em'}}>
                            <FaPencilAlt onClick={() => desbloquearEdicao('editarNome')}
                            className={style['input-icon']}/>
                            </IconContext.Provider>
                            </div>
                             <div className={style['input-group']}>
                            <p>E-mail</p>
                            <input type="text" className="inputEmail"
                            value={formData.email}
                            onChange={e => setFormData({...formData,email:e.target.value})} disabled/>
                            <IconContext.Provider value={{color:'black',size:'1.5em'}}>
                            <FaPencilAlt onClick={() => desbloquearEdicao('editarEmail')}
                            className={style['input-icon']}/>
                            </IconContext.Provider>
                            </div>

                            {/* CARGO BUGADO, ARRUMAR POSTERIORMENTE*/}

                            {/* <div className={style['input-group']}>
                            <p>Cargo</p>
                            <select type="text" className="inputCargo" 
                            value={formData.cargo.id || ""}
                             onChange={e => setFormData({...formData,cargo:e.target.value})} 
                            disabled>
                                <option value={1}>Usuário Comum</option>
                                <option value={2}>Usuário Gestor</option>
                                </select>
                            <IconContext.Provider value={{color:'black',size:'1.5em'}}>
                            <FaPencilAlt onClick={() => desbloquearEdicao('editarCargo')}
                            className={style['input-icon']}/>
                            </IconContext.Provider>
                            </div> */}
                            {/*CASO TENHA CAMPO DE DATA DE NASCIMENTO FUTURAMENTE */}
                            {/* <div className={style['input-group']}>
                            <p>Data De Nascimento</p>
                            <input type="text" className="inputNascimento" 
                            value={formData.nascimento}
                             onChange={e => setFormData({...formData,nascimento:e.target.value})} disabled/>
                            <IconContext.Provider value={{color:'black',size:'1.5em'}}>
                            <FaPencilAlt onClick={() => desbloquearEdicao('editarNascimento')}
                            className={style['input-icon']}/>
                            </IconContext.Provider>
                            </div> */}

                            <button onClick={editarUsuario}>Editar</button>
                    </div>
                </main>
            </section>
        </>
    );

}

export default Perfil;