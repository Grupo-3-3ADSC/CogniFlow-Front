import style from "./login.module.css";
import logo from "../../assets/logo-megaplate.png";
import olho from "../../assets/olho.png";
import loading from "../../assets/loading.gif";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../provider/api.js";
import {
  toastError,
  toastSucess,
} from "../../components/toastify/ToastifyService.jsx";

export function Login() {
  const navigate = useNavigate();

  const [visivel, setVisivel] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const visorpassword = () => {
    setVisivel(!visivel);
  };

  function irParaVerificacao() {
    navigate("/verificacao");
  }

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  function validarInputsEspeciais() {
    const sqlPattern =
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
    if (sqlPattern.test(formData.email) || sqlPattern.test(formData.password)) {
      return false;
    }
    if (
      /<script.*?>.*?<\/script>/gi.test(formData.email) ||
      /<script.*?>.*?<\/script>/gi.test(formData.password)
    ) {
      return false;
    }
    return true;
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(password) {
    return password.length >= 6;
  }

  const login = () => {
    if (!validarInputsEspeciais()) {
      return toastError("Por favor não utilizar comandos no login.");
    }

    if (
      !formData.email ||
      !formData.password ||
      formData.email.trim() === "" ||
      formData.password.trim() === ""
    ) {
      return toastError("Por favor, preencha os campos");
    }

    if (!validarEmail(formData.email)) {
      return toastError("E-mail inválido");
    }

    if (!validarSenha(formData.password)) {
      return toastError("A senha deve ter no mínimo 6 caracteres");
    }

    api
      .post("/usuarios/login", {
        email: formData.email,
        password: formData.password,
      })
      .then((response) => {
        if (response.status === 200 && response.data?.token) {
          sessionStorage.setItem("authToken", response.data.token);
          sessionStorage.setItem("usuario", response.data.userId);
          sessionStorage.setItem("cargoUsuario", response.data.cargo.id);
        }
        setFormData({ email: "", password: "" });
        divLoading.style.display = "block";
        setTimeout(function () {
          toastSucess("Sucesso! Seja Bem-vindo!");
          navigate("/Material");
        }, 1500);
      })
      .catch((error) => {
        console.error("Erro no login do usuário: ", error);

        if (error.response && error.response.status === 403) {
          toastError(
            "Seu usuário está desativado. Em caso de dúvida, procure seu gestor."
          );
        } else {
          toastError(
            "Não foi possível autenticar, email ou password inválidos."
          );
        }
      });
  };

  return (
    <section className={style.login}>
      <aside className={style["aside-login"]}>
        <img src={logo} alt="" />
      </aside>
      <main className={style["form-content"]}>
        <h1>Login</h1>

        <div className={style["input-group"]}>
          <p>Email</p>
          <input
            placeholder="marcos@email.com"
            type="text"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="input-email"
          />
        </div>

        <div className={style["input-group"]}>
          <p>Senha</p>
          <input
            placeholder="********"
            type={visivel ? "text" : "password"}
            className={style["input-password"]}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <img
            className={style["olho"]}
            src={olho}
            onClick={visorpassword}
            alt="Mostrar password"
          />
        </div>

        <button onClick={login}>ENTRAR</button>

        <div style={{ display: "none" }} id="divLoading">
          <img
            src={loading}
            alt="Simbolo de carregamento"
            className={style["loading-gif"]}
          />
        </div>

        <a onClick={irParaVerificacao}>
          <span>Esqueceu a senha?</span>
        </a>
      </main>
    </section>
  );
}

export default Login;
