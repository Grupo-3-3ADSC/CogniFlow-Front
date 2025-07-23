import styles from "./cadastro.module.css";
import logo from "../../assets/logo-megaplate.png";
import { useEffect, useState } from "react";
import { api } from "../../provider/api.js";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import {toastSucess, toastError,} from "../../components/toastify/ToastifyService.jsx";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

export function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: {
      id: 1,
      nome: "comum",
    },
    password: "",
  });

  const [autenticacaoPassou, setAutenticacaoPassou] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const cargo = parseInt(sessionStorage.getItem("cargoUsuario"), 10); // Converte para número
    console.log(cargo);
    if (!token) {
      navigate("/");
    } else if (cargo !== 2) {
      // Verifica se o usuário não é gestor
      Swal.fire({
        title: "Acesso Negado",
        text: "Você não tem permissão para acessar esta página.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      navigate("/material"); // Redireciona para outra página
    } else {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        sessionStorage.removeItem("authToken");
        navigate("/");
      } else {
        setAutenticacaoPassou(true);
      }
    }
  }, []);

  if (!autenticacaoPassou) return null;

  // Funções de validação
  function validarNome(nome) {
    if (typeof nome !== "string") return false;

    const nomeLimpo = nome.trim();

    // Verifica se tem apenas letras e espaços, e ao menos duas palavras
    return (
      /^[a-zA-ZÀ-ÿ\s]+$/.test(nomeLimpo) && nomeLimpo.split(/\s+/).length >= 2
    );
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{3,}$/;
    return regex.test(email.trim());
  }

  // Valida a senha com pelo menos 6 caracteres, uma letra, um número e um caractere especial
 function validarSenha(senha) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/.test(senha);
}

  function validarCargo(cargo) {
    return cargo === 1 || cargo === 2;
  }
 // Função para cadastrar usuário
  // Verifica se os campos estão preenchidos e se os dados são válidos
  const cadastrar = () => {
    if (
      !formData.nome ||
      !formData.email ||
      !formData.cargo.id ||
      !formData.password
    ) {
       Swal.fire({ title: "Por favor, preencha todos os campos!", icon: "warning", confirmButtonColor: "#3085d6" });
      return;
    }

    if (!validarNome(formData.nome)) {
      Swal.fire({
        title: "Nome inválido: necessario ter nome e sobrenome",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!validarEmail(formData.email)) {
      Swal.fire({
        title: "E-mail inválido: deve conter @ e domínio com pelo menos 3 letras Ex: email@exemplo.com",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!validarSenha(formData.password)) {
      Swal.fire({
        title: "Senha inválida: deve ter pelo menos 6 caracteres, uma letra, um número e um caractere especial",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!validarCargo(formData.cargo?.id)) {
      Swal.fire({
        title: "Cargo inválido",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const token = sessionStorage.getItem("authToken");

    // console.log('Token:', token); // verificação se o token esta sendo pego corretamente

    if (!token) {
      toastError("Token de autenticação não encontrado. Faça login novamente.");
      navigate("/");
      return;
    }

    const userData = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      cargo: {
        id: formData.cargo.id,
        nome: formData.cargo.id === 1 ? "comum" : "gestor",
      },
      password: formData.password.trim(),
    };

    const sqlPattern =
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
    if (
      sqlPattern.test(userData.email) ||
      sqlPattern.test(userData.nome) ||
      sqlPattern.test(userData.password)
    ) {
      return toastError("Por favor não cadastrar com comandos especiais...");
    }
    if (
      /<script.*?>.*?<\/script>/gi.test(userData.email) ||
      /<script.*?>.*?<\/script>/gi.test(userData.nome) ||
      /<script.*?>.*?<\/script>/gi.test(userData.password)
    ) {
      return toastError("Por favor não cadastrar com comandos especiais...");
    }

    const endpoint = formData.cargo.id === 2 ? "/usuarios/gestor" : "/usuarios";
 // Envia os dados do usuário para o servidor
    api
      .post(endpoint, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      .then((response) => {
        console.log("Resposta do servidor:", response.data);
        Swal.fire({
          title: "Usuário cadastrado com sucesso!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        setFormData({
          nome: "",
          email: "",
          password: "",
          cargo: { id: 1, nome: "comum" }
        });
      })
      .catch((error) => {
        console.error("Erro completo:", error);
        if (error.response) {
          console.log("Status do erro:", error.response.status);
          console.log("Dados do erro:", error.response.data);

          if (error.response.status === 400) {
            toastError(
              "Dados inválidos: " +
                (error.response.data.message || "Verifique as informações")
            );
          } else if (error.response.status === 401) {
            toastError("Sessão expirada. Por favor, faça login novamente.");
            navigate("/login");
          } else {
            toastError(
              "Erro ao cadastrar usuário: " +
                (error.response.data?.message || "Tente novamente mais tarde.")
            );
          }
        } else {
          toastError(
            "Erro de conexão. Verifique sua internet e tente novamente."
          );
        }
      });
  };
  // Renderiza o componente de cadastro
  return (
    <>
      <NavBar />

      <div className={styles["tab-container"]}></div>
      <section className={styles.cadastro}>
        <div className={styles["bloco-fundo"]}>
          <div className={styles["tab-container-user"]}>
            <div className={styles.tabActiveUsuario}>Cadastro de Usuário</div>
          </div>
        </div>
        <aside className={styles["aside-cadastro"]}>
          <img src={logo} alt="MegaPlate logo" />
        </aside>
        <main className={styles["form-content"]}>
          <div className={styles["input-group"]}>
            <p id="textCadastro">Nome e Sobrenome</p>
            <input
              placeholder="Marcos Antonio"
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nome: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""),
                })
              }
            />
          </div>

          <div className={styles["input-group"]}>
            <p id="textCadastro">Email</p>
            <input
              placeholder="exemplo@dominio.com"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className={styles["input-group"]}>
            <p>Cargo</p>
            <select
              value={formData.cargo?.id || 1}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                setFormData({
                  ...formData,
                  cargo: {
                    id: selectedId,
                    nome: selectedId === 1 ? "comum" : "gestor",
                  },
                });
              }}
            >
              <option value={1}>Usuário Comum</option>

              <option value={2}>Gestor</option>
            </select>
          </div>

          <div className={styles["input-group"]}>
            <p id="textCadastro">Senha</p>
            <input
              placeholder="********"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button id="buttonCadastrar" className={styles.buttonCadastrar} onClick={cadastrar}>
            CADASTRAR
          </button>
        </main>
      </section>
    </>
  );
}

export default Cadastro;
